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
      <div className="homepage-header">
        <h1>Welcome to the SheBraids, {user.name}!</h1>
        <h3>Find Your Perfect Match</h3>
      </div>
      <div className = "container">
        <div className="braid-section"onClick={() => handleCategoryClick('Braids')}>BRAIDS</div>
        <div className="haircut-section"onClick={() => handleCategoryClick('Haircuts')}>HAIRCUTS</div>
        <div className="weave-section"onClick={() => handleCategoryClick('Weave and Installs')}>WEAVE AND INSTALLS</div>
        <div className="locs-section"onClick={() => handleCategoryClick('Locs')}>LOCS</div>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <section>
        <h2>Upcoming Bookings</h2>
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <div key={appointment.id}>
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
      <NavBar/>
      <button onClick={handleLogout} className="logout-button">Log Out</button>
    </>
  );
};

export default UserHomePage;
