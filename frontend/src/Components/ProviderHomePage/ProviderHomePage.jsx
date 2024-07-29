import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProviderNavBar from "../ProviderNavBar/ProviderNavBar";
import ScheduleModal from "../ScheduleModal/ScheduleModal";
import "./ProviderHomePage.css";

const ProviderHomePage = () => {
    const { id } = useParams();
    const [appointments, setAppointments] = useState([]);
    const [profile, setProfile] = useState({});
    const [media, setMedia] = useState([]);
    const [services, setServices] = useState([]);
    const [schedules, setSchedules] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
        fetchProfile();
        fetchServices();
        fetchSchedules();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await fetch(`http://localhost:5174/service-provider-appointments/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch appointments");
            } else {
                const data = await response.json();
                setAppointments(data);
            }
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

    const fetchSchedules = async () => {
        try {
          const response = await fetch(`http://localhost:5174/service-provider-schedule/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch schedules');
          }
          const data = await response.json();
          setSchedules(data || {});
        } catch (error) {
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

    const handleScheduleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:5174/setup-schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    providerId: id,
                    date: scheduleDate,
                    startTime,
                    endTime,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to set up schedule');
            }
            setShowModal(false);
            fetchSchedules();
        }   catch (error) {
            console.error('Error setting up schedule:', error);
        }
    };

    const handleProfileUpdate = () => {
        navigate(`/service-provider-profile/${id}`);
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
                <h2>Your Schedules</h2>
                {Object.keys(schedules).length > 0 ? (
                    <ul>
                        {Object.keys(schedules).map(date => (
                            <li key={date}>
                                <strong>{date}:</strong>
                                <ul>
                                    {schedules[date].slots?.map((slot, index) => (
                                        <li key={index}>
                                            {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {schedules[date].status && schedules[date].status[index] === 1 ? "Booked" : "Available"}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                    ) : (
                    <p>You have no schedules set up.</p>
                )}
                <button onClick={() => setShowModal(true)}>Set Up Schedule</button>
            </section>
            <ScheduleModal
                showModal={showModal}
                setShowModal={setShowModal}
                handleScheduleSubmit={handleScheduleSubmit}
                scheduleDate={scheduleDate}
                setScheduleDate={setScheduleDate}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
            />
            <section>
                <h2>Your Appointments</h2>
                {appointments.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(appointment => (
                                <tr key={appointment.id}>
                                    <td>{appointment.user.name}</td>
                                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                                    <td>{appointment.time}</td>
                                    <td>{appointment.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>You have no bookings available</p>
                )}
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
                <h2>Your Services</h2>
                {services.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id}>
                                    <td>{service.name}</td>
                                    <td>{service.description}</td>
                                    <td>${parseFloat(service.price).toFixed(2)}</td>
                                    <td>{service.duration}hrs</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (<p>You have no services available.</p>)}
            </section>
        </div>
    );
};

export default ProviderHomePage;
