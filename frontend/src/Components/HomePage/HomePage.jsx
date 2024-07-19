import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import NavBar from "../NavBar/NavBar";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = () => {
    localStorage.removeItem("user");
    updateUser(null);
    navigate("/login");
  };

  const handleCategoryClick = (category) => {
    if (user && user.userAddress) {
      navigate(`/search/${category}`, { state: { category, userAddress: user.userAddress } });
    } else {
      setErrorMessage("User address not available. Please update your profile with a valid address.");
    }
  };

  return (
    <>
    <div className="homepage-header">
      <h1>Welcome to the SheBraids</h1>
      <h3>Find Your Perfect Match</h3>
    </div>
    <div className = "container">
        <div className="braid-section"onClick={() => handleCategoryClick('Braids')}>BRAIDS</div>
        <div className="haircut-section"onClick={() => handleCategoryClick('Haircuts')}>HAIRCUTS</div>
        <div className="weave-section"onClick={() => handleCategoryClick('Weave and Installs')}>WEAVE AND INSTALLS</div>
        <div className="locs-section"onClick={() => handleCategoryClick('Locs')}>LOCS</div>
    </div>
    {errorMessage && <p className="error-message">{errorMessage}</p>}
    <NavBar/>
    <button onClick={handleLogout} className="logout-button">Log Out</button>
    </>
  );
};

export default HomePage;
