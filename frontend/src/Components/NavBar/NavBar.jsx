import React from "react";
import { Route, Link } from 'react-router-dom';
import "./NavBar.css";

const NavBar = () => {
    return (
    <nav className = "nav-bar">
            <ul>
                <li><Link to="/homepage" className="home-page">Home</Link></li>
                <li><Link to="/favorite" className="favorite">Favorite</Link></li>
                <li><Link to="/user-profile" className="user-profile">Profile</Link></li>
            </ul>
    </nav>
)};


export default NavBar;
