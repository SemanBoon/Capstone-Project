import React from 'react';
import './SelectProfileModal.css';


const SelectProfileModal = ({ show, handleClose, handleSelection }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Select Profile Type</h2>
        <button onClick={() => handleSelection('user')}>User Profile</button>
        <button onClick={() => handleSelection('serviceProvider')}>Service Provider Profile</button>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default SelectProfileModal;
