import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const { category } = useParams();
  const locationState = useLocation();
  const userAddress = locationState?.state?.userAddress || '';
  const [location, setLocation] = useState(userAddress);
  const navigate = useNavigate();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchServiceProviders(userAddress);
  }, [category, userAddress]);

  const fetchServiceProviders = async (loc) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/service-providers?category=${encodeURIComponent(category)}&location=${encodeURIComponent(loc)}`);
        const data = await response.json();
        setServiceProviders(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage('Error fetching service providers');
      console.error(error);
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
    setLocation(userAddress);
    fetchServiceProviders(userAddress);
  };

  const handleBack = () => {
    navigate('/homepage');
  }

  return (
    <div className="search-page">
        <h2>Search {category}</h2>
        <div>
            <input
                type="text"
                value={location}
                onChange={handleLocationChange}
                placeholder="Enter city, state, or zip code"
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleBack}>Back</button>
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <div className="service-provider-list">
            {serviceProviders.length === 0 ? (
                <p>No service provider found, try entering a different location</p>
        ) : (
        serviceProviders.map((provider) => (
            <div key={provider.id} className="service-provider">
                <h3>{provider.businessName}</h3>
                <p>{provider.businessAddress}</p>
                <p>{provider.priceRange}</p>
                <p>{provider.bio}</p>
                <p>Distance: {provider.distance} meters</p>
            </div>
           ))
        )}
      </div>
    </div>
  );
};

export default SearchPage;
