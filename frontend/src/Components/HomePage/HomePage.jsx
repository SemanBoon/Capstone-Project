import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import NavBar from "../NavBar/NavBar";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(UserContext);

  const handleLogout = () => {
    localStorage.removeItem("user");
    updateUser(null);
    navigate("/login");
  };

  const handleCategoryClick = (category) => {
    navigate(`/search/${category}`, { state: { category, userAddress: user.userAddress } });
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
    <NavBar/>
    <button onClick={handleLogout} className="logout-button">Log Out</button>
    </>
  );
};

export default HomePage;
