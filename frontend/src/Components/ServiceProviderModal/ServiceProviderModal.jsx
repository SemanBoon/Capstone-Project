import React, {useContext, useState, useEffect} from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";


const apiKey = 'AIzaSyBwyPWvQIc3BM2Pe5EeL1WhGOLof06bb7g';

const ServiceProviderModal = ({ show, handleClose, provider }) => {
    const [services, setServices] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const { user } = useContext(UserContext)
    const navigate = useNavigate();

    useEffect(() => {
        if (provider && provider.id) {
            fetchServices(provider.id);
            checkFavoriteStatus(provider.id);
        }
    }, [provider]);

    const fetchServices = async (providerId) => {
        try {
            const response = await fetch(`http://localhost:5174/service-provider-services/${providerId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }
            const data = await response.json();
            setServices(data || []);
          } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const checkFavoriteStatus = async (providerId) => {
        try {
            const response = await fetch('http://localhost:5174/check-favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    providerId,
                }),
            });

            const data = await response.json();

            if (data.isFavorite) {
                setIsFavorite(true);
            } else {
                setIsFavorite(false);
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const handleAddToFavorites = async () => {
        if (isFavorite) return;
        try {
            const response = await fetch('http://localhost:5174/add-favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    providerId: provider.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add favorite');
            }
            setIsFavorite(true);
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    };

    if (!provider) return null;

    const center = {
      lat: provider.latitude,
      lng: provider.longitude,
    };

    const handleBookAppointment = () => {
        navigate(`/book-appointment/${provider.id}`, { state: { providerId: provider.id } });
    };

    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{provider.businessName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p><strong>Address:</strong> {provider.businessAddress}</p>
            <p><strong>Contact:</strong> {provider.phoneNumber}</p>
            <p><strong>Bio:</strong> {provider.bio}</p>
            <p><strong>Photos and Videos:</strong></p>
            <div className="media-gallery">
                {(provider.media && provider.media.length > 0) ? (
                    provider.media.map((item, index) => (
                        <div key={index}>
                            {item.type === 'image' ? (
                                <img src={item.url} alt="Work" />
                            ) : (
                            <video src={item.url} controls />
                            )}
                        </div>
                    ))
                ) : (
                <p>No media available</p>
            )}
            </div>
            <div style={{ width: '100%', height: '400px' }}>
                <APIProvider apiKey={apiKey}>
                    <Map
                        center={center}
                        zoom={15}
                        mapId= 'b1a41b38a2b81e08'
                        style={{ height: '100%', width: '100%' }}
                    >
                        <AdvancedMarker position={center}>
                            <Pin scale={2} />
                            <InfoWindow>
                                <div>{provider.businessName}</div>
                            </InfoWindow>
                        </AdvancedMarker>
                    </Map>
                </APIProvider>
            </div>
            <h3>Services</h3>
            {services.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Service Name</th>
                            <th>Description</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service.id}>
                                <td>{service.name}</td>
                                <td>{service.description}</td>
                                <td>${parseFloat(service.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
            <p>No services available</p>
            )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
            <Button variant="primary" onClick={handleBookAppointment}>Book Appointment</Button>
            <Button variant="success" onClick={handleAddToFavorites} disabled={isFavorite} >
                {isFavorite ? "Added to Favorites" : "Add to Favorites"}
            </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  export default ServiceProviderModal;
