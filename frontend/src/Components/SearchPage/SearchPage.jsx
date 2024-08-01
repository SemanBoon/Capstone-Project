import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ServiceProviderModal from '../ServiceProviderModal/ServiceProviderModal';
import "./SearchPage.css";

const SearchPage = () => {
  const { category } = useParams();
  const locationState = useLocation();
  const userAddress = locationState?.state?.userAddress || '';
  const [location, setLocation] = useState('');
  const [serviceProviders, setServiceProviders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServiceProviders(userAddress);
  }, [category, userAddress]);

  const fetchServiceProviders = async (loc) => {
    try {
      const response = await fetch('http://localhost:5174/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: loc, category }),
      });
      const data = await response.json();
      setServiceProviders(Array.isArray(data) ? data : []);
      setHasSearched(true);
    } catch (error) {
      setErrorMessage('Error fetching service providers');
    }
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleSearch = () => {
    if (location.trim() === '') {
      fetchServiceProviders(userAddress);
    } else {
      fetchServiceProviders(location);
    }
  };

  const handleClear = () => {
    setLocation('');
    setHasSearched(false);
    fetchServiceProviders(userAddress);
  };

  const handleBack = () => {
    navigate('/homepage');
  }

  const handleProviderClick = (provider) => {
    setSelectedProvider(provider);
  };

  const handleCloseModal = () => {
    setSelectedProvider(null);
  };

  return (
    <div className="user-search-page">
      <button onClick={handleBack} className="searchpage-back-button">Back</button>
        <h1 className="search-title">Search {category}</h1>
        <div className = "user-search-container">
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder="Enter city, state, or zip code"
            className='search-input'
          />
          <div className="search-button-container">
            <button onClick={handleSearch} className='search-button'>Search</button>
            <button onClick={handleClear} className="clear-button">Clear</button>
          </div>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="service-provider-list">
          {hasSearched && serviceProviders.length === 0 ? ( <p>No service provider found, try entering a different location</p>):
            (serviceProviders.map((provider) => (
              <div key={provider.id} className="service-provider-card" onClick={() => handleProviderClick(provider)}>
                <h3>{provider.businessName}</h3>
                <p>{provider.bio}</p>
                <p>Distance: {provider.distance} meters</p>
              </div>
            ))
          )}
        </div>
        {selectedProvider && (
          <ServiceProviderModal
            show={!!selectedProvider}
            handleClose={handleCloseModal}
            provider={selectedProvider}
          />
        )}
    </div>
  )
};


export default SearchPage;
