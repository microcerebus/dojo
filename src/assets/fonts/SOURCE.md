# Vendored fonts

JetBrains Mono (variable weight axis), copied here by `pnpm gen:fonts`.

- Source: `@fontsource-variable/jetbrains-mono` 5.3.0
- Upstream: https://github.com/JetBrains/JetBrainsMono
- Subsets: latin, latin-ext, greek - normal and italic
- Licence: SIL Open Font License 1.1 (see `OFL.txt`)

These are committed on purpose. The app has to work with no network, so the
fonts must be precached alongside everything else - see
`scripts/verify-precache.mjs`, which fails the build if they are not.
