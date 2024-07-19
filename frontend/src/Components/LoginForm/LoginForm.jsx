import React, { useState, useContext } from "react";
import { UserContext } from "../../UserContext";
import { useNavigate } from "react-router-dom";
import SelectProfileModal from "../SelectProfileModal/SelectProfileModal";
import "./LoginForm.css";



const LoginForm = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const { updateUser } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate();

  const handleChangePassword = (e) => {
    setUserPassword(e.target.value);
  };

  const handleChangeEmail = (e) => {
    setUserEmail(e.target.value);
  };

  const validateEmail = (email) => {
    if (!email) {
      return( "Email Required")
    }
    else if (email.length < 8 ) {
      return ("Invalid Email Address")
    }
    else if (!email.includes("@")){
      return( "Invalid Email Address")
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return("Enter Password")
    }
    return '';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(userEmail);
    const passwordError = validatePassword(userPassword);

    if (emailError) {
      setErrorMessage(emailError);
      return;
    }

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data));
        updateUser(data);
        navigate("/homepage");
      } else {
        setErrorMessage("Invalid email or password, please try again.")
      }
    } catch (error) {
      setErrorMessage("An error occured, please try again later.")
    }
  };

  const handleSignupClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSelection = (type) => {
    setShowModal(false);
    if (type === 'user') {
      navigate('/user-signup');
    } else if (type === 'service-provider') {
      navigate('/service-provider-signup');
    }
  };


  return (
    <div className="container">
      <div className="login-info">
        <h2>Login</h2>
        <label htmlFor="userEmail">Email:</label>
        <input
          type="email"
          id="userEmail"
          placeholder="Enter Email Address"
          value={userEmail}
          onChange={handleChangeEmail}
          required
        />
        <br />
        <br />
        <label htmlFor="userPassword">Password:</label>
        <input
          type="password"
          id="userPassword"
          placeholder="Enter Password"
          value={userPassword}
          onChange={handleChangePassword}
          required
        />
        {errorMessage && <p style={{color: "red", fontSize: "13px"}}>{errorMessage}</p>}
        <br />
        <br />
        <button className="login-button" onClick={handleLogin}>Login</button>
        <div> New account?
          <span className="new-user" onClick={handleSignupClick}>Sign Up</span>
        </div>
      </div>
          <SelectProfileModal show={showModal} handleClose={handleModalClose} handleSelection={handleSelection} />
    </div>
  );
};

export default LoginForm;


// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import ProviderNavBar from "../ProviderNavBar/ProviderNavBar";

// const ProviderHomePage = () => {
//     const { id } = useParams();
//     const [appointments, setAppointments] = useState([]);
//     const [profile, setProfile] = useState({});
//     const [reviews, setReviews] = useState([]);
//     const [media, setMedia] = useState([]);
//     const [services, setServices] = useState([]);
//     const navigate = useNavigate();

//     useEffect(() => {
//         fetchAppointments();
//         fetchProfile();
//         fetchReviews();
//         fetchServices();
//     }, []);

//     const fetchAppointments = async () => {
//         try {
//             const response = await fetch(`http://localhost:5174/appointments`);
//             if (!response.ok) {
//                 throw new Error("Failed to fetch appointments");
//             }
//             const data = await response.json();
//             setAppointments(data);
//         }   catch (error) {
//             console.error(error);
//         }
//     };

//     const fetchProfile = async () => {
//         try {
//             const response = await fetch(`http://localhost:5174/service-provider-profile/${id}`);
//             if (!response.ok) {
//                 throw new Error("Failed to fetch profile");
//             }
//             const data = await response.json();
//             setProfile(data);
//         }   catch (error) {
//             console.error(error);
//         }
//     };

//     const fetchReviews = async () => {
//         try {
//             const response = await fetch(`http://localhost:5174/service-provider-reviews?id=${id}`);
//             if (!response.ok) {
//                 throw new Error("Failed to fetch reviews");
//             }
//             const data = await response.json();
//             setReviews(data);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const fetchServices = async () => {
//         try {
//             const response = await fetch(`http://localhost:5174/service-provider-services/${id}`);
//             if (!response.ok) {
//                 throw new Error('Failed to fetch services');
//             }
//             const data = await response.json();
//             setServices(data);
//         }   catch (error) {
//             console.error(error);
//         }
//     };

//     const handleUpload = async (file) => {
//         try {
//             const formData = new FormData();
//             formData.append("file", file);
//             const response = await fetch(`http://localhost:5174/upload-media`, {
//                 method: "POST",
//                 body: formData,
//             });
//             if (!response.ok) {
//                 throw new Error("Failed to upload media");
//             }
//             const data = await response.json();
//             setMedia([...media, data]);
//             } catch (error) {
//             console.error(error);
//         }
//     };

//     const handleProfileUpdate = () => {
//         navigate(`/service-provider-profile/${id}`);
//     };

//     const handleServicesUpdate = () => {
//         navigate(`/service-provider-services/${id}`);
//     };


//     return (
//         <div className="service-provider-homepage">
//             <ProviderNavBar id={id}/>
//             <h1>Welcome, {profile.businessName}</h1>
//             <section>
//                 <h2>Your Bio</h2>
//                 <p>{profile.bio}</p>
//                 <button onClick={handleProfileUpdate}>Edit Bio</button>
//             </section>
//             <section>
//                 <h2>Your Appointments</h2>
//                 {appointments.length > 0 ? ( appointments.map(appointment => (
//                     <div key={appointment.id}>
//                         <p>Customer: {appointment.customerName}</p>
//                         <p>Date: {appointment.date}</p>
//                         <p>Time: {appointment.time}</p>
//                     </div>
//                 ))) : (<p>You have no bookings available</p>)
//                 }
//                 {appointments.length > 0 && <button>View More</button>}
//             </section>
//             <section>
//                 <h2>Upload Pictures and Videos of Your Work</h2>
//                 <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
//                 <div className="media-gallery">
//                     {media.length > 0 ? (media.map((item, index) => (
//                         <div key={index}>
//                             {item.type === 'image' ? (
//                                 <img src={item.url} alt="Uploaded work" />
//                             ) : (
//                                 <video src={item.url} controls />
//                             )}
//                         </div>
//                     ))) : ( <p>You have no media files.</p>)
//                     }
//                 </div>
//             </section>
//             <section>
//                 <h2>Reviews</h2>
//                 {reviews.length > 0 ? (
//                     reviews.map(review => (
//                         <div key={review.id}>
//                             <p>Customer: {review.customerName}</p>
//                             <p>{review.text}</p>
//                             <p>Rating: {review.rating}</p>
//                         </div>
//                     ))) : (<p>You have no reviews available to show.</p>)
//                     }
//                 {reviews.length > 0 && <button>View More Reviews</button>}
//             </section>
//             <section>
//                 <h2>Manage Profile</h2>
//                 <button onClick={() => handleProfileUpdate(profile)}>View Profile</button>
//             </section>
//             <section>
//                 <h2>Manage Services</h2>
//                     <button onClick={() => handleServicesUpdate(services)}>View Services</button>
//             </section>
//         </div>
//     );
// };

// export default ProviderHomePage;



// import React, {useContext} from "react";
// import { Link, useNavigate } from 'react-router-dom';
// import { UserContext } from "../../UserContext";
// import "./ProviderNavBar.css";


// const ProviderNavBar = ({id}) => {
//     const navigate = useNavigate();
//     const { updateUser } = useContext(UserContext);

//     const handleLogout = () => {
//         localStorage.removeItem("service-provider");
//         updateUser(null);
//         navigate("/login");
//         window.history.pushState(null, "", window.location.href);
//         window.addEventListener("popstate", () => {
//           navigate("/login");
//         });
//     };

//     return (
//     <nav className = "provider-nav-bar">
//             <ul>
//                 <li><Link to={`/provider-homepage/${id}`} className="home-page">Home</Link></li>
//                 <li><Link to={`/service-provider-profile/${id}`} className="provider-profile">Profile</Link></li>
//                 <li><Link to={`/service-provider-services/${id}`} className="provider-services">Services</Link></li>
//                 <button onClick={handleLogout} className="logout-button">Log Out</button>
//             </ul>
//     </nav>
// )};


// export default ProviderNavBar;


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from "react-router-dom";

// const ServicesPage = () => {
//     const { id } = useParams();
//     const [services, setServices] = useState([]);
//     const [newService, setNewService] = useState('');
//     const navigate = useNavigate();


//     useEffect(() => {
//         fetchServices();
//     }, []);

//     const fetchServices = async () => {
//         try {
//             const response = await fetch(`http://localhost:5174/service-provider-services/${id}`);
//             if (!response.ok) {
//                 throw new Error('Failed to fetch services');
//             }
//             const data = await response.json();
//             setServices(data.service || []);
//         }   catch (error) {
//             console.error(error);
//             setServices([]);
//         }
//     };

//     const handleAddService = async () => {
//         try {
//             const response = await fetch(`http://localhost:5174/update-services`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ id, services: [...services, newService] }),
//             });
//             if (!response.ok) {
//                 throw new Error('Failed to add service');
//             }
//             const data = await response.json();
//             setServices([...services, newService]);
//             setNewService('');
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const handleDeleteService = async (serviceId) => {
//         try {
//             await fetch(`http://localhost:5174/service-provider-services/${serviceId}`, {
//                 method: 'DELETE',
//             });
//             setServices(services.filter(service => service.id !== serviceId));
//         } catch (error) {
//           console.error(error);
//         }
//     };

//     return (
//         <div className="services-page">
//             <h1>Manage Your Services</h1>
//             <input
//                 type="text"
//                 value={newService}
//                 onChange={(e) => setNewService(e.target.value)}
//                 placeholder="Add a new service"
//             />
//             <button onClick={handleAddService}>Add Service</button>
//             <ul>
//                 {services.map(service => (
//                     <li key={service.id}>
//                         {service.name}
//                         <button onClick={() => handleDeleteService(service)}>Delete</button>
//                     </li>
//                 ))}
//             </ul>
//             <button onClick={() => navigate(`/provider-homepage/${id}`)}>Back to Homepage</button>
//         </div>
//     );
// };

// export default ServicesPage;


// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// const ProviderProfilePage = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [profile, setProfile] = useState({
//         businessName: '',
//         bio: '',
//         businessAddress: '',
//         phoneNumber: '',
//         priceRange: '',
//     });

//     useEffect(() => {
//         fetchProfile();
//     }, []);

//     const fetchProfile = async () => {
//         try {
//             const response = await fetch(`http://localhost:5174/service-provider-profile/${id}`);
//             if (!response.ok) {
//                 throw new Error('Failed to fetch profile');
//             }
//             const data = await response.json();
//             setProfile(data);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const handleSave = async () => {
//         try {
//             const response = await fetch(`http://localhost:5174/update-profile`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ id, ...profile }),
//             });
//             if (!response.ok) {
//                 throw new Error('Failed to update profile');
//             }
//             navigate(`/provider-homepage/${id}`);
//         } catch (error) {
//           console.error(error);
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setProfile(( prevProfile) => ({
//             ...prevProfile,
//             [name]: value
//         }));
//     };

//     return (
//         <div className="profile-page">
//             <h1>Manage Your Profile</h1>
//             <label>
//                 Business Name:
//                 <input
//                     type="text"
//                     name="businessName"
//                     value={profile.businessName || ''}
//                     onChange={handleChange}
//                 />
//             </label>
//             <label>
//                 Business Address:
//                 <input
//                     type="text"
//                     name="businessAddress"
//                     value={profile.businessAddress}
//                     onChange={handleChange}
//                 />
//             </label>
//             <label>
//                 Phone Number:
//                 <input
//                     type="text"
//                     name="phoneNumber"
//                     value={profile.phoneNumber}
//                     onChange={handleChange}
//                 />
//             </label>
//             <label>
//                 Bio:
//                 <textarea
//                     name="bio"
//                     value={profile.bio}
//                     onChange={handleChange}
//                 />
//             </label>
//             <label>
//                 Price Range:
//                 <input
//                     type="text"
//                     name="priceRange"
//                     value={profile.priceRange}
//                     onChange={handleChange}
//                 />
//             </label>
//             <button onClick={handleSave}>Save</button>
//         </div>
//     );
// };

// export default ProviderProfilePage;
