import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';

const BookingPage = () => {
    const { providerId } = useParams();
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [services, setServices] = useState([]);


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

    return (
        <div className="book-appointment-page">
            <h1>Book Appointment</h1>
            <div className="form-group">
                <label htmlFor="service">Select a Service:</label>
                <select id="service">
                    <option value="">Select a service</option>
                    {services.map(service => (
                        <option key={service.id} value={service.id}>
                            {service.name} - ${service.price}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="date">Enter a date:</label>
                <input
                    label
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Select date"
                />
            </div>
            <div className="form-group">
                <label htmlFor="time">Enter a time in HH:MM:</label>
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
            <button onClick={handleBookAppointment}>Book Appointment</button>
            <button onClick={() => navigate(-1)}>Cancel</button>
        </div>
    );
};

export default BookingPage;
