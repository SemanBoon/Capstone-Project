import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

const NavBar = () => {
  return (
    <nav className="nav-bar">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/homepage" className="nav-link">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/favorite" className="nav-link">Favorite</Link>
        </li>
        <li className="nav-item">
          <Link to="/user-profile" className="nav-link">Profile</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
