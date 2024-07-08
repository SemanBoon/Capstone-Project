import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectProfilePage.css';

const SelectProfilePage = () => {
  const navigate = useNavigate();

  const handleSelection = (type) => {
    if (type === 'user') {
      navigate('/user-signup');
    } else if (type === 'serviceProvider') {
      navigate('/service-provider-signup');
    }
  };

  return (
    <div className="profile-selection-container">
        <h1>Welcome to SheBraids</h1>
        <h2>Select Profile Type</h2>
        <button className="user-selection" onClick={() => handleSelection('user')}>User Profile</button>
        <button className="provider-selction" onClick={() => handleSelection('serviceProvider')}>Service Provider Profile</button>
    </div>
  );
};

export default SelectProfilePage;
