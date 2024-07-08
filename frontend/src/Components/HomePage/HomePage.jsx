import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import NavBar from "../NavBar/NavBar";
import "./HomePage.css";

const HomePage = () => {
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    updateUser(null);
    navigate("/login");
  };

  return (
    <>
    <div className="homepage-header">
      <h1>Welcome to the SheBraids</h1>
      <h3>Find Your Perfect Match</h3>
    </div>
    <div className = "container">
      <div className = "category">BRAIDS</div>
      <div className = "category">WEAVE/INSTALLS</div>
      <div className = "category">HAIR CUTS</div>
      <div className = "category">LOCS</div>
    </div>
    <NavBar/>
    <button onClick={handleLogout} className="logout-button">Log Out</button>
    </>
  );
};

export default HomePage;





