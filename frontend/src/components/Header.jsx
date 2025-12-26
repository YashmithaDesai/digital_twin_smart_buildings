import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/header.css";

function Header({ darkMode, toggleDarkMode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "home", label: "Home", path: "/", hasDropdown: false },
    { id: "building-info", label: "Building Info", hasDropdown: true },
    { id: "dashboard", label: "Dashboard", path: "/dashboard", hasDropdown: false },
    { id: "analytics", label: "Analytics", path: "/analytics", hasDropdown: false },
    { id: "twin-view", label: "Twin View", path: "/twin", hasDropdown: false },
    { id: "contact", label: "Contact", path: "/contact", hasDropdown: false },
  ];

  const toggleDropdown = (itemId) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  return (
    <header className={`main-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 21V7L12 2L21 7V21H14V14H10V21H3Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-main">DIGITAL TWIN</span>
            <span className="logo-sub">SMART BUILDINGS</span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="main-nav">
          {navItems.map((item) => (
            <div
              key={item.id}
              className="nav-item-wrapper"
              onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setActiveDropdown(null)}
                  end={item.path === "/"}
                >
                  {item.label}
                  {item.hasDropdown && <span className="dropdown-chevron">▼</span>}
                </NavLink>
              ) : (
                <button
                  className="nav-link"
                  onClick={() => toggleDropdown(item.id)}
                >
                  {item.label}
                  {item.hasDropdown && <span className="dropdown-chevron">▼</span>}
                </button>
              )}
              {item.hasDropdown && activeDropdown === item.id && (
                <div className="dropdown-menu">
                  <Link to={`/${item.id}`} className="dropdown-item">
                    Building Overview
                  </Link>
                  <Link to={`/${item.id}/zones`} className="dropdown-item">
                    Zones & Floors
                  </Link>
                  <Link to={`/${item.id}/systems`} className="dropdown-item">
                    Building Systems
                  </Link>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="header-actions">
          <button className="header-icon-btn" aria-label="Search">
            <span className="icon">🔍</span>
          </button>
          <button
            className="header-icon-btn dark-mode-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            <span className="icon">{darkMode ? "☀️" : "🌙"}</span>
          </button>
          <Link to="/twin" className="add-properties-btn">
            <span className="btn-icon">🎯</span>
            3D View
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;

