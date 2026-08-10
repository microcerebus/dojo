import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import { BrandMark } from './components/BrandMark';
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

        <nav className="tabbar" aria-label="Main">
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
      </div>
    </HashRouter>
  );
}
