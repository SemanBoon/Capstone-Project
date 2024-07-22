import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

const apiKey = 'AIzaSyBwyPWvQIc3BM2Pe5EeL1WhGOLof06bb7g'; 

const ServiceProviderModal = ({ show, handleClose, provider }) => {
    if (!provider) return null;

    const center = {
      lat: provider.latitude,
      lng: provider.longitude,
    };

    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{provider.businessName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Address:</strong> {provider.businessAddress}</p>
          <p><strong>Contact:</strong> {provider.phoneNumber}</p>
          <p><strong>Price Range:</strong> {provider.priceRange}</p>
          <p><strong>Bio:</strong> {provider.bio}</p>
          <p><strong>Services:</strong> {provider.services}</p>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary">Book Appointment</Button>
          <Button variant="success">Add to Favorites</Button>
        </Modal.Footer>
      </Modal>
    );
  };

  export default ServiceProviderModal;
