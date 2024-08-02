import React from "react";
import { Link } from 'react-router-dom';
import "./ProviderNavBar.css";


const ProviderNavBar = ({id}) => {

    return (
    <nav className = "provider-nav-bar">
        <ul className="nav-list">
            <li className="nav-item">
                <Link to={`/provider-homepage/${id}`} className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
                <Link to={`/service-provider-profile/${id}`} className="nav-link">Profile</Link>
            </li>
            <li className="nav-item">
                <Link to={`/service-provider-services/${id}`} className="nav-link">Services</Link>
            </li>
        </ul>
    </nav>
)};


export default ProviderNavBar;
