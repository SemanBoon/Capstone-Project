import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import "./ProviderNavBar.css";


const ProviderNavBar = ({id}) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("service-provider");
        navigate("/login");
    };
    return (
    <nav className = "provider-nav-bar">
            <ul>
                <li><Link to={`/provider-homepage/${id}`} className="home-page">Home</Link></li>
                <li><Link to={`/service-provider-profile/${id}`} className="provider-profile">Profile</Link></li>
                <li><Link to={`/service-provider-services/${id}`} className="provider-services">Services</Link></li>
                <button onClick={handleLogout} className="logout-button">Log Out</button>
            </ul>
    </nav>
)};


export default ProviderNavBar;
