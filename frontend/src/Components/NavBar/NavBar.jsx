import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./NavBar.css";
import HomePage from "../HomePage/HomePage";
import UserFavPage from "../UserFavPage/UserFavPage";
import UserProfilePage from "../UserProfilePage/UserProfilePage";

const NavBar = () => {
    return (
    <nav className = "nav-bar">
        <Router>
          <Routes>
            <Route path="/homepage" className="home-page" element={<HomePage />} />
            <ul>
                <li><Route path="/favorite" className="favorite" element={<UserFavPage />} /></li>
                <li><Route path="/user-profile" className="user-profile" element={<UserProfilePage />} /></li>
            </ul>
          </Routes>
        </Router>
    </nav>
    );
};


export default NavBar;
