import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
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
    <div className="homepage-container">
      <h1>Welcome to the Home Page</h1>
      <button onClick={handleLogout} className="logout-button">Log Out</button>
    </div>
  );
};

export default HomePage;
