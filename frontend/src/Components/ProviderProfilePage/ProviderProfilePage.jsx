
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProviderProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        email: '',
        businessName: '',
        bio: '',
        businessAddress: '',
        phoneNumber: '',
        priceRange: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`http://localhost:5174/service-provider-profile/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            const data = await response.json();
            setProfile(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:5174/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, ...profile }),
            });
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            setIsEditing(false);
            navigate(`/provider-homepage/${id}`);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    return (
        <div className="profile-page">
            <h1>Manage Your Profile</h1>
            {!isEditing ? (
                <div className="profile-display">
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Business Name:</strong> {profile.businessName}</p>
                    <p><strong>Business Address:</strong> {profile.businessAddress}</p>
                    <p><strong>Phone Number:</strong> {profile.phoneNumber}</p>
                    <p><strong>Bio:</strong> {profile.bio}</p>
                    <p><strong>Price Range:</strong> {profile.priceRange}</p>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                </div>
            ) : (
                <div className="my-profile-edit">
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Business Name:
                        <input
                            type="text"
                            name="businessName"
                            value={profile.businessName}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Business Address:
                        <input
                            type="text"
                            name="businessAddress"
                            value={profile.businessAddress}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Phone Number:
                        <input
                            type="text"
                            name="phoneNumber"
                            value={profile.phoneNumber}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Bio:
                        <textarea
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Price Range:
                        <input
                            type="text"
                            name="priceRange"
                            value={profile.priceRange}
                            onChange={handleChange}
                        />
                    </label>
                    <button onClick={handleSave}>Save</button>
                </div>
            )}
        </div>
    );
};

export default ProviderProfilePage;
