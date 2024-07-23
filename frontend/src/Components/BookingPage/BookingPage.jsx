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
                <label htmlFor="time">Enter a date:</label>
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
                {/* <label htmlFor="time">Description</label> */}
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
