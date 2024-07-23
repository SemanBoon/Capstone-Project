import React, {useContext, useState, useEffect} from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { UserContext } from '../../UserContext';

const apiKey = 'AIzaSyBwyPWvQIc3BM2Pe5EeL1WhGOLof06bb7g';

const ServiceProviderModal = ({ show, handleClose, provider }) => {
    const [services, setServices] = useState([]);
    const navigate = useNavigate();
    const { user } = useContext(UserContext)

    useEffect(() => {
        if (provider && provider.id) {
            fetchServices(provider.id);
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
          <Button variant="success">Add to Favorites</Button>
        </Modal.Footer>
      </Modal>
    );
  };

  export default ServiceProviderModal;
