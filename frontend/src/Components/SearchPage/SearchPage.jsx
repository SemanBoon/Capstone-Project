import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const { category } = useParams();
  const locationState = useLocation();
  const userAddress = locationState?.state?.userAddress || '';
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchServiceProviders(userAddress);
  }, [category, userAddress]);

  const fetchServiceProviders = async (loc) => {
    try {
      const response = await fetch('http://localhost:5174/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: loc, category }),
      });
      const data = await response.json();
      setServiceProviders(Array.isArray(data) ? data : []);
      setHasSearched(true);
    } catch (error) {
      setErrorMessage('Error fetching service providers');
    }
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleSearch = () => {
    if (location.trim() === '') {
      fetchServiceProviders(userAddress);
    } else {
      fetchServiceProviders(location);
    }
  };

  const handleClear = () => {
    setLocation('');
    setHasSearched(false);
    fetchServiceProviders(userAddress);
  };

  const handleBack = () => {
    navigate('/homepage');
  }

  return (
    <div className="search-page">
        <h2>Search {category}</h2>
        <div>
            <input
              type="text"
              value={location}
              onChange={handleLocationChange}
              placeholder="Enter city, state, or zip code"
            />
          <button onClick={handleSearch}>Search</button>
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleBack}>Back</button>
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <div className="service-provider-list">
            {hasSearched && serviceProviders.length === 0 ? (
              <p>No service provider found, try entering a different location</p>
        ) : (
        serviceProviders.map((provider) => (
            <div key={provider.id} className="service-provider">
              <h3>{provider.businessName}</h3>
              <p>{provider.businessAddress}</p>
              <p>{provider.priceRange}</p>
              <p>{provider.bio}</p>
              <p>Distance: {provider.distance} meters</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchPage;



// import React, { useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { UserContext } from "../../UserContext";
// import NavBar from "../NavBar/NavBar";
// import "./UserHomePage.css";

// const UserHomePage = () => {
//   const navigate = useNavigate();
//   const { user, updateUser } = useContext(UserContext);
//   const [notifications, setNotifications] = useState([]);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const response = await fetch(`http://localhost:5174/notifications/${user.id}`);
//         const data = await response.json();
//         if (Array.isArray(data)) {
//           setNotifications(data);
//           setUnreadCount(data.filter(notification => !notification.read).length);

//         } else {
//           console.error("Unexpected response format:", data);
//         }
//       } catch (error) {
//         console.error("Failed to fetch notifications:", error);
//       }
//     };
//     fetchNotifications();
//   }, [user.id]);

//   const handleNotificationClick = async () => {
//     try {
//       await fetch(`http://localhost:5174/notifications/${user.id}/read`,
//         { method: 'PUT' });
//       setUnreadCount(0);
//     } catch (error) {
//       console.error("Failed to mark notifications as read:", error);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     updateUser(null);
//     navigate("/login");
//     window.history.pushState(null, "", window.location.href); // Clear browser history to prevent back navigation
//     window.addEventListener("popstate", () => {
//       navigate("/login");
//     });
//   };

//   const handleCategoryClick = (category) => {
//     if (user && user.userAddress) {
//       navigate(`/search/${category}`, { state: { category, userAddress: user.userAddress } });
//     } else {
//       setErrorMessage("User address not available. Please update your profile with a valid address.");
//     }
//   };

//   return (
//     <>
//     <div className="homepage-header">
//       <h1>Welcome to the SheBraids, {user.name}!</h1>
//       <h3>Find Your Perfect Match</h3>
//       </div>
//       <div className = "container">
//         <div className="braid-section"onClick={() => handleCategoryClick('Braids')}>BRAIDS</div>
//         <div className="haircut-section"onClick={() => handleCategoryClick('Haircuts')}>HAIRCUTS</div>
//         <div className="weave-section"onClick={() => handleCategoryClick('Weave and Installs')}>WEAVE AND INSTALLS</div>
//         <div className="locs-section"onClick={() => handleCategoryClick('Locs')}>LOCS</div>
//     </div>
//     {errorMessage && <p className="error-message">{errorMessage}</p>}
//     <NavBar/>
//     <button onClick={handleLogout} className="logout-button">Log Out</button>
//     </>
//   );
// };

// export default UserHomePage;


// import React, { useContext } from 'react';
// import { Navigate } from 'react-router-dom';
// import { UserContext } from "../UserContext";

// const PrivateRoute = ({ element: Element, ...rest }) => {
//   const { user } = useContext(UserContext);

//   return user ? <Element {...rest} /> : <Navigate to="/login" />;
// };

// export default PrivateRoute;



// import { useEffect, useState } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const UserWebSocket = ({ userId }) => {
//   const [ws, setWs] = useState(null);
//   // const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     const connectWebSocket = () => {
//       console.log(`Attempting to connect to WebSocket at ws://localhost:5174/ws/${userId}`);
//       const socket = new WebSocket(`ws://localhost:5174/ws/${userId}`);

//       socket.onopen = () => {
//         console.log(`WebSocket connection established for user ${userId}`);
//       };

//       socket.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           const message = data.message;
//           if (message) {
//             console.log(`Notification: ${message}`);
//             toast(message)
//             // setNotifications(prev => [...prev, { message, read: false }]);
//           } else {
//             console.error("Message property not found in the received data", data);
//           }
//         } catch (error) {
//           console.error("Error parsing message data", error);
//         }
//       };

//       socket.onclose = (event) => {
//         console.log('WebSocket connection closed:', event);
//         console.log('Reconnecting in 3 seconds...');
//         setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
//       };

//       socket.onerror = (error) => {
//         console.error('WebSocket error: ', error);
//         socket.close();
//       };

//       setWs(socket);
//     };

//     connectWebSocket();

//     return () => {
//       if (ws)
//         ws.close();
//     };
//   }, [userId]);

//   return <ToastContainer />;
// };

// export default UserWebSocket;
