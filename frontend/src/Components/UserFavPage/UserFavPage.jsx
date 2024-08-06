import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../UserContext';
import { useNavigate } from 'react-router-dom';
import "./UserFavPage.css";


const UserFavPage = () => {
    const [favorites, setFavorites] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await fetch(`http://localhost:5174/user-favorites/${user.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch favorites');
                }
                const data = await response.json();
                setFavorites(data);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, [user.id]);

    const handleBack = () => {
        navigate('/homepage');
    }

    return (
        <div className = "favpage-content">
            <h1 className="favpage-header">Favorite Service Providers</h1>
            {favorites.length > 0 ? (
                <ul className="fav-list">
                    {favorites.map(fav => (
                        <li className="fav-item" key={fav.id}>
                            <h2>{fav.serviceProvider.businessName}</h2>
                            <p>{fav.serviceProvider.businessAddress}</p>
                            <p>{fav.serviceProvider.phoneNumber}</p>
                            <p>{fav.serviceProvider.bio}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No favorites added yet.</p>
            )}
            <button clasName ="fav-back-button"onClick={handleBack}>Back</button>
        </div>
    );
};

export default UserFavPage;
