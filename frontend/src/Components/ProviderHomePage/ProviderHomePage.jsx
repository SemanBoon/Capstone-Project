import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProviderNavBar from "../ProviderNavBar/ProviderNavBar";

const ProviderHomePage = () => {
    const { id } = useParams();
    const [appointments, setAppointments] = useState([]);
    const [profile, setProfile] = useState({});
    const [reviews, setReviews] = useState([]);
    const [media, setMedia] = useState([]);
    const [services, setServices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
        fetchProfile();
        fetchReviews();
        fetchServices();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await fetch(`http://localhost:5174/appointments`);
            if (!response.ok) {
                throw new Error("Failed to fetch appointments");
            }
            const data = await response.json();
            setAppointments(data);
        }   catch (error) {
            console.error(error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await fetch(`http://localhost:5174/service-provider-profile/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch profile");
            }
            const data = await response.json();
            setProfile(data);
        }   catch (error) {
            console.error(error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:5174/service-provider-reviews?id=${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch reviews");
            }
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch(`http://localhost:5174/service-provider-services/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }
            const data = await response.json();
            setServices(data);
        }   catch (error) {
            console.error(error);
        }
    };

    const handleUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch(`http://localhost:5174/upload-media`, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                throw new Error("Failed to upload media");
            }
            const data = await response.json();
            setMedia([...media, data]);
            } catch (error) {
            console.error(error);
        }
    };

    const handleProfileUpdate = () => {
        navigate(`/service-provider-profile/${id}`);
    };

    const handleServicesUpdate = () => {
        navigate(`/service-provider-services/${id}`);
    };


    return (
        <div className="service-provider-homepage">
            <ProviderNavBar id={id}/>
            <h1>Welcome, {profile.businessName}</h1>
            <section>
                <h2>Your Bio</h2>
                <p>{profile.bio}</p>
                <button onClick={handleProfileUpdate}>Edit Bio</button>
            </section>
            <section>
                <h2>Your Appointments</h2>
                {appointments.length > 0 ? ( appointments.map(appointment => (
                    <div key={appointment.id}>
                        <p>Customer: {appointment.customerName}</p>
                        <p>Date: {appointment.date}</p>
                        <p>Time: {appointment.time}</p>
                    </div>
                ))) : (<p>You have no bookings available</p>)
                }
                {appointments.length > 0 && <button>View More</button>}
            </section>
            <section>
                <h2>Upload Pictures and Videos of Your Work</h2>
                <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
                <div className="media-gallery">
                    {media.length > 0 ? (media.map((item, index) => (
                        <div key={index}>
                            {item.type === 'image' ? (
                                <img src={item.url} alt="Uploaded work" />
                            ) : (
                                <video src={item.url} controls />
                            )}
                        </div>
                    ))) : ( <p>You have no media files.</p>)
                    }
                </div>
            </section>
            <section>
                <h2>Reviews</h2>
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id}>
                            <p>Customer: {review.customerName}</p>
                            <p>{review.text}</p>
                            <p>Rating: {review.rating}</p>
                        </div>
                    ))) : (<p>You have no reviews available to show.</p>)
                    }
                {reviews.length > 0 && <button>View More Reviews</button>}
            </section>
            <section>
                <h2>Manage Profile</h2>
                <button onClick={() => handleProfileUpdate(profile)}>View Profile</button>
            </section>
            <section>
                <h2>Manage Services</h2>
                    <button onClick={() => handleServicesUpdate(services)}>View Services</button>
            </section>
        </div>
    );
};

export default ProviderHomePage;
