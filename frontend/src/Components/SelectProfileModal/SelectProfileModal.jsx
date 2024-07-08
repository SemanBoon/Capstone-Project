import React from 'react';
import './SelectProfileModal.css';


const SelectProfileModal = ({ show, handleClose, handleSelection }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-header">Select Profile Type</h2>
        <button className="user-button" onClick={() => handleSelection('user')}>User Profile</button>
        <button className="provider-button" onClick={() => handleSelection('service-provider')}>Service Provider Profile</button>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default SelectProfileModal;
