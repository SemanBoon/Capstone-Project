import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import NavBar from "../NavBar/NavBar";
import "./UserHomePage.css";

const UserHomePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState('');
  const [appointments, setAppointments] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:5174/appointments/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    updateUser(null);
    navigate("/login");
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", () => {
      navigate("/login");
    });
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
    <NavBar/>
    <div className="main-content">
      <div className="homepage-header">
        <h1>Welcome to the SheBraids, {user.name}!</h1>
        <h3>Find Your Perfect Match</h3>
      </div>
      <div className = "home-container">
      <div className="category-section braid-section" onClick={() => handleCategoryClick('Braids')}>
        <div className="tooltip">Discover beautiful braids styles</div> BRAIDS</div>
      <div className="category-section haircut-section" onClick={() => handleCategoryClick('Haircuts')}>
        <div className="tooltip">Explore stylish haircuts</div>HAIRCUTS</div>
      <div className="category-section weave-section" onClick={() => handleCategoryClick('Weave and Installs')}>
        <div className="tooltip">Find the perfect wig installs</div>WIG INSTALLS</div>
      <div className="category-section locs-section" onClick={() => handleCategoryClick('Locs')}>
        <div className="tooltip">Get the best locs styles</div>LOCS</div>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <section>
        <h2>Upcoming Bookings</h2>
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <p>Service Provider: {appointment.serviceProvider.businessName}</p>
              <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
              <p>Time: {appointment.time}</p>
              <p>Description: {appointment.description}</p>
            </div>
          ))
        ) : (
          <p>No upcoming bookings</p>
        )}
      </section>
      <button onClick={handleLogout} className="logout-button">Log Out</button>
      </div>
    </>
  );
};

export default UserHomePage;
