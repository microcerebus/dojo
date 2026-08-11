import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * The guard that keeps two palettes from silently collapsing back into one.
 *
 * dojo ships Catppuccin Mocha and Latte over a single token set. That only
 * holds while every colour literal in the app lives in one of the two palette
 * blocks in `global.css` - a single hardcoded `#1e1e2e` in a component is a
 * pixel that stays dark in light mode, and the failure mode is invisible until
 * someone looks at the app in the other scheme.
 *
 * So: find every colour literal under `src/`, and fail on any that is not in a
 * palette block. Then check the two palettes are actually complete and
 * actually different, which is the specific regression this replaced - a
 * "light theme" that rendered identically to dark.
 */

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GLOBAL_CSS = join(SRC, 'styles', 'global.css');

/**
 * Hex, `rgb()/rgba()`, `hsl()/hsla()`, and the named greys that are easy to
 * reach for. `transparent` and `currentColor` are scheme-agnostic by
 * construction, so they are not literals in this sense.
 *
 * The named half is bounded by `[\w-]` rather than `\b` so that `white-space`
 * - a property name, not a colour - does not read as one.
 */
const FUNCTIONAL_COLOR = String.raw`#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\s*\(`;
const NAMED_COLOR = String.raw`(?<![\w-])(?:white|black|silver|gray|grey)(?![\w-])`;

/**
 * Named colours are only looked for in stylesheets. In TypeScript the same
 * words are ordinary prose - lesson content discusses black-box testing and
 * red-black trees - and a bare `black` there is never a paint instruction.
 */
function colorLiteral(file: string): RegExp {
  return new RegExp(
    extname(file) === '.css' ? `${FUNCTIONAL_COLOR}|${NAMED_COLOR}` : FUNCTIONAL_COLOR,
    'g',
  );
}

/**
 * `src/lib/theme.ts` carries the browser-chrome colours for the two schemes,
 * which have to be JS strings - a `<meta>` tag cannot read a CSS variable.
 * They are not a second source of truth: `src/lib/theme.test.ts` reads the
 * palettes out of `global.css` and fails if these drift from `--bg`.
 */
const LITERAL_ALLOWED = new Set([join(SRC, 'lib', 'theme.ts')]);

/**
 * Blank out comments, preserving length so byte offsets still line up with the
 * original. Prose is allowed to say "sits on white"; a declaration is not. The
 * `//` arm skips a `//` preceded by `:`, so a `https://` inside a string is not
 * mistaken for the start of a comment.
 */
function blankComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length))
    .replace(/(^|[^:])\/\/[^\n]*/g, (match, prefix: string) =>
      prefix.concat(' '.repeat(match.length - prefix.length)),
    );
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** Test files are excluded: they are not shipped UI, and this file in
 *  particular is full of the very literals it is looking for. */
const sourceFiles = walk(SRC)
  .filter((file) => ['.css', '.ts', '.tsx'].includes(extname(file)))
  .filter((file) => !/\.test\.tsx?$/.test(file) && !file.includes(`${join('src', 'test')}`));

/**
 * Every `selector { ... }` rule in a stylesheet, flattened. Deliberately not a
 * real parser: the stylesheets here are hand-written flat CSS with at most one
 * level of `@media` nesting, and a brace counter is enough to attribute a
 * declaration to the selector above it.
 */
function rules(css: string): { selector: string; body: string; start: number }[] {
  const found: { selector: string; body: string; start: number }[] = [];
  let depth = 0;
  let blockStart = -1;
  let selectorStart = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') {
      if (depth === 0) {
        blockStart = i;
      }
      depth++;
    } else if (css[i] === '}') {
      depth--;
      if (depth === 0) {
        const selector = css.slice(selectorStart, blockStart).trim();
        // An `@media` wrapper's "body" is more rules; recurse into it.
        const body = css.slice(blockStart + 1, i);
        if (selector.startsWith('@')) {
          for (const nested of rules(body)) {
            found.push({ ...nested, start: blockStart + 1 + nested.start });
          }
        } else {
          found.push({ selector, body, start: blockStart + 1 });
        }
        selectorStart = i + 1;
      }
    }
  }
  return found;
}

const globalCss = readFileSync(GLOBAL_CSS, 'utf8');
const globalRules = rules(globalCss);

function paletteRules(scheme: 'dark' | 'light') {
  return globalRules.filter((rule) => {
    const isDarkArm = rule.selector.includes(`[data-theme='dark']`) || rule.selector === ':root';
    const isLightArm = rule.selector.includes(`[data-theme='light']`);
    return scheme === 'dark' ? isDarkArm && !isLightArm : isLightArm;
  });
}

/** Ranges of `global.css` where a colour literal is legitimate: the two
 *  palette blocks and nothing else. */
const paletteRanges = [...paletteRules('dark'), ...paletteRules('light')]
  .filter((rule) => /--ctp-|--shadow-/.test(rule.body))
  .map((rule) => [rule.start, rule.start + rule.body.length] as const);

function declaredTokens(body: string, prefix: string): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (match[1].startsWith(prefix)) tokens.set(match[1], match[2].trim());
  }
  return tokens;
}

const darkPalette = new Map(
  paletteRules('dark').flatMap((rule) => [...declaredTokens(rule.body, '--ctp-')]),
);
const lightPalette = new Map(
  paletteRules('light').flatMap((rule) => [...declaredTokens(rule.body, '--ctp-')]),
);

/** WCAG relative luminance of a `#rrggbb` string, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

describe('colour literals are confined to the palette blocks', () => {
  it('found the stylesheets and components it is meant to be scanning', () => {
    expect(sourceFiles.filter((file) => file.endsWith('.css')).length).toBeGreaterThan(2);
    expect(sourceFiles.filter((file) => file.endsWith('.tsx')).length).toBeGreaterThan(5);
  });

  it.each(sourceFiles.map((file) => [file.slice(SRC.length + 1), file]))(
    '%s hardcodes no scheme colour',
    (_label, file) => {
      const source = blankComments(readFileSync(file, 'utf8'));
      const offenders = [...source.matchAll(colorLiteral(file))]
        .filter((match) => {
          if (LITERAL_ALLOWED.has(file)) return false;
          if (file !== GLOBAL_CSS) return true;
          const at = match.index;
          return !paletteRanges.some(([from, to]) => at >= from && at < to);
        })
        .map((match) => `${match[0]} at index ${match.index}`);
      expect(offenders).toEqual([]);
    },
  );
});

describe('the two palettes', () => {
  it('both exist and are non-trivial', () => {
    expect(darkPalette.size).toBeGreaterThan(10);
    expect(lightPalette.size).toBeGreaterThan(10);
  });

  it('define exactly the same token names', () => {
    expect([...lightPalette.keys()].sort()).toEqual([...darkPalette.keys()].sort());
  });

  it('are all plain hex literals, so the semantic layer is the only indirection', () => {
    for (const [name, value] of [...darkPalette, ...lightPalette]) {
      expect(value, name).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('share no value - a light mode that renders dark is the regression here', () => {
    for (const [name, value] of darkPalette) {
      expect(lightPalette.get(name), name).not.toBe(value);
    }
  });

  it('are on the correct side of mid-grey, ramp for ramp', () => {
    // Not just "different": Mocha's surfaces must be dark and Latte's light,
    // which is what makes swapping them a real scheme change rather than a
    // palette shuffle. Text inverts along with them.
    for (const surface of ['--ctp-crust', '--ctp-mantle', '--ctp-base']) {
      expect(luminance(darkPalette.get(surface)!), surface).toBeLessThan(0.05);
      expect(luminance(lightPalette.get(surface)!), surface).toBeGreaterThan(0.7);
    }
    expect(luminance(darkPalette.get('--ctp-text')!)).toBeGreaterThan(0.5);
    expect(luminance(lightPalette.get('--ctp-text')!)).toBeLessThan(0.15);
  });

  it('leave every --ctp-* reference in the app resolvable in both', () => {
    const referenced = new Set<string>();
    for (const file of sourceFiles) {
      for (const match of readFileSync(file, 'utf8').matchAll(/var\(\s*(--ctp-[\w-]+)/g)) {
        referenced.add(match[1]);
      }
    }
    expect(referenced.size).toBeGreaterThan(0);
    for (const token of referenced) {
      expect(darkPalette.has(token), token).toBe(true);
      expect(lightPalette.has(token), token).toBe(true);
    }
  });
});
