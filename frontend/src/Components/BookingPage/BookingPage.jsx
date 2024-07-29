import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';

const BookingPage = () => {
    const { providerId } = useParams();
    const { user } = useContext(UserContext);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [recommendedSlots, setRecommendedSlots] = useState([])
    const [userPriority, setUserPriority] = useState('focus_block'); // New state for user priority
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch(`http://localhost:5174/service-provider-services/${providerId}`);
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };
        fetchServices();
    }, [providerId]);

    useEffect(() => {
        if (selectedService) {
            const fetchAvailableSlots = async () => {
                try {
                    const response = await fetch('http://localhost:5174/get-available-slots', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            providerId,
                            serviceDuration: selectedService.duration,
                        }),
                    });
                    const data = await response.json();
                    setAvailableSlots(data);
                    } catch (error) {
                    console.error('Error fetching available slots:', error);
                }
            };

            const fetchRecommendedSlots = async () => {
                try {
                    const response = await fetch('http://localhost:5174/get-recommended-slots', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            providerId,
                            userId: user.id,
                            serviceDuration: selectedService.duration,
                            userPriority,
                            userTime: time,
                        }),
                    });
                    const data = await response.json();
                    setRecommendedSlots(data);
                } catch (error) {
                    console.error('Error fetching recommended slots:', error);
                }
            };
            fetchAvailableSlots();
            fetchRecommendedSlots();
        }
    }, [selectedService, providerId, user.id, userPriority, time]);


    const handleBookAppointment = async () => {
        try {
            const response = await fetch(`http://localhost:5174/create-appointment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    providerId,
                    date,
                    time,
                    description,
                    serviceId: selectedService.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to book appointment');
            }
            navigate('/homepage');
            } catch (error) {
            console.error('Error booking appointment:', error);
        }
    };


    const filterSlots = (slots) => {
        if (!selectedService|| !Array.isArray(slots))
            return []
        const requiredSlots = Math.ceil(selectedService.duration / 30);
        return slots.filter(slot => {
            if (date && slot.date !== date)
                return false;
            const slotIndex = slots.findIndex(s => s.time === slot.time);
            for (let i = 0; i < requiredSlots; i++) {
                if (slotIndex + i >= slots.length || slots[slotIndex + i].status !== 0) {
                    return false;
                }
            }
            return true;
        });
    };

    const filteredSlots = filterSlots(availableSlots);

    const handleSlotClick = (slot) => {
        setDate(slot.date);
        const slotTime = new Date(slot.time);
        const formattedTime = slotTime.toTimeString().slice(0, 5);
        setTime(formattedTime);
    };

    return (
        <div className="book-appointment-page">
            <h1>Book Appointment</h1>
            <div className="form-group">
                <label htmlFor="service">Select a Service:</label>
                <select id="service" onChange={(e) => setSelectedService(services.find(service => service.id === e.target.value))}>
                    <option value="">Select a service</option>
                    {services.map(service => (
                        <option key={service.id} value={service.id}>
                            {service.name} - ${service.price}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="priority">What is your biggest priority in finding a booking slot:</label>
                <select id="priority" value={userPriority} onChange={(e) => setUserPriority(e.target.value)}>
                    <option value="focus_block">Focus Block</option>
                    <option value="user_preferred_time">User Preferred Time</option>
                    <option value="popular_slots">Popular Slots</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="date">Enter a date (optional):</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Select date"
                />
            </div>
            <div className="form-group">
                <label htmlFor="time">Enter a time in HH:MM (optional):</label>
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Select time"
                />
            </div>
            <div className="form-group">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the service"
                />
            </div>
            <div className="recommended-slots">
                <h2>Recommended Slots:</h2>
                {recommendedSlots.length > 0 ? (
                    <ul>
                        {recommendedSlots.map((slot, index) => (
                            <li key={index} onClick={() => handleSlotClick(slot)} style={{ cursor: 'pointer' }}>
                                {slot.date} - {new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No recommended time slots available.</p>
                )}
            </div>
            <div className="available-slots">
                <h2>Available Slots:</h2>
                {filteredSlots.length > 0 ? (
                    <ul>
                        {filteredSlots.map((slot, index) => (
                            <li key={index} onClick={() => handleSlotClick(slot)} style={{ cursor: 'pointer' }}>
                                {slot.date} - {new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No available time slots, please try a different date or time..</p>
                )}
            </div>
            <button onClick={handleBookAppointment}>Book Appointment</button>
        </div>
    );
};

export default BookingPage;
