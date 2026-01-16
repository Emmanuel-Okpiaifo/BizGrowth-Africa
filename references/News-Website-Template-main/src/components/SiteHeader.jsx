import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import useTheme from "../hooks/useTheme.js";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/procurement-tenders", label: "Procurement & Tenders" },
  { to: "/news-insights", label: "News & Insights" },
  { to: "/tools-templates", label: "Tools & Templates" },
  { to: "/community", label: "Community" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  function MobileMenu({ onClose }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
      const frame = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(frame);
    }, []);

    const closeWithAnimation = () => {
      setShow(false);
      setTimeout(() => onClose(), 200);
    };

    return (
      <>
        <button
          className={`bga-mobile-overlay${show ? " is-open" : ""}`}
          aria-hidden="true"
          onClick={closeWithAnimation}
        />
        <div className={`bga-mobile-panel${show ? " is-open" : ""}`}>
          <div className="bga-mobile-panel-header">
            <div>Quick Menu</div>
            <button
              type="button"
              onClick={closeWithAnimation}
              aria-label="Close menu"
            >
              <i className="fa fa-close" aria-hidden="true" />
            </button>
          </div>
          <div className="bga-mobile-panel-links">
            {navItems.map((item) => (
              <NavLink
                key={`mobile-${item.to}`}
                to={item.to}
                className={({ isActive }) =>
                  `bga-nav-link${isActive ? " active" : ""}`
                }
                onClick={closeWithAnimation}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="bga-mobile-panel-theme">
            <div>Appearance</div>
            <button type="button" onClick={toggleTheme}>
              <i
                className={`fa ${isDark ? "fa-sun-o" : "fa-moon-o"}`}
                aria-hidden="true"
              />
              <span>{isDark ? "Dark" : "Light"}</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <header className="bga-header">
      <div className="container">
        <div className="bga-header-inner">
          <Link to="/" className="bga-brand">
            <img
              src={isDark ? "/img/logos/bizgrowth3.png" : "/img/logos/bizgrowth2.png"}
              alt="BizGrowth Africa"
            />
            <span>BizGrowth Africa</span>
          </Link>
          <nav className="bga-nav d-none d-lg-flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `bga-nav-link${isActive ? " active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="bga-actions">
            <button
              type="button"
              className="bga-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <i className={`fa ${isDark ? "fa-sun-o" : "fa-moon-o"}`} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="bga-menu-toggle d-lg-none"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              <i className={`fa ${menuOpen ? "fa-close" : "fa-bars"}`} aria-hidden="true" />
            </button>
          </div>
        </div>
        {menuOpen ? <MobileMenu onClose={() => setMenuOpen(false)} /> : null}
      </div>
    </header>
  );
}
