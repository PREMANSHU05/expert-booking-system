import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => (
  <nav className="navbar">
    <NavLink to="/" className="navbar-brand">
      Expert<span>Connect</span>
    </NavLink>
    <div className="navbar-links">
      <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
        Experts
      </NavLink>
      <NavLink to="/bookings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        My Bookings
      </NavLink>
    </div>
  </nav>
);

export default Navbar;
