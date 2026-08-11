import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import { BrandMark } from './components/BrandMark';
import { ThemeToggle } from './components/ThemeToggle';
import { HomePage } from './pages/HomePage';
import { ModulePage } from './pages/ModulePage';
import { SprintPage } from './pages/SprintPage';
import { CoveragePage } from './pages/CoveragePage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * A hash router is deliberate: the built app then works from any static server
 * and any subdirectory with no rewrite rules, which is also what keeps deep
 * links working offline from the service worker.
 */
const NAV = [
  { to: '/', label: 'Curriculum', icon: '◎', end: true },
  { to: '/sprint', label: 'Sprint', icon: '▤', end: false },
  { to: '/coverage', label: 'Coverage', icon: '☰', end: false },
];

export function App() {
  return (
    <HashRouter>
      <div className="app">
        <header className="header">
          <NavLink to="/" className="header__brand">
            <BrandMark />
            dojo
          </NavLink>
          <span className="header__spacer" />
          <nav className="header__nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'is-active' : '')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle variant="header" />
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/module/:moduleId" element={<ModulePage />} />
            <Route path="/sprint" element={<SprintPage />} />
            <Route path="/coverage" element={<CoveragePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* The bar carries the nav *and* the theme control: on a phone this
            strip is the only thumb-reachable chrome, and a theme switch parked
            in the header at the top of a 6.7" screen is a two-handed control.
            The <nav> stays wrapped around just the links so the button does not
            land inside a navigation landmark. */}
        <div className="tabbar">
          <nav className="tabbar__nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `tabbar__link${isActive ? ' is-active' : ''}`}
              >
                <span className="tabbar__icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle variant="tabbar" />
        </div>
      </div>
    </HashRouter>
  );
}
