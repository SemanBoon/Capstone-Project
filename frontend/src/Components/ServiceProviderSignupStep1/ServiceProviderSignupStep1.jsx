import React, { useState, useEffect } from "react";
import "./ServiceProviderSignupStep1.css";

const capitalizedName = (providerName) => {
  return providerName
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const capitalizedEmail = (providerEmail) => {
  return providerEmail.charAt(0).toUpperCase() + providerEmail.slice(1).toLowerCase();
};

const ServiceProviderSignupStep1 = ({ setStep }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedFormData = JSON.parse(localStorage.getItem("serviceProviderFormData"));
    if (savedFormData) {
      setFormData(savedFormData);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = (e) => {
    e.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    const phonePattern = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
    if (!phonePattern.test(formData.phoneNumber)) {
        setErrorMessage("Please enter a valid phone number.");
        return;
    }

    setErrorMessage("");

    localStorage.setItem("serviceProviderFormData", JSON.stringify(formData));
    setStep(2);
    };

    const formattedName = capitalizedName(formData.businessName);
    const formattedEmail = capitalizedEmail(formData.email);


  return (
    <div className="container">
      <div className="user-info">
        <h2>Service Provider Sign Up - Step 1</h2>
        <label htmlFor="businessName">Business Name:</label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          placeholder="Enter Business Name or Full Name"
          value={formattedName}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter Email Address"
          value={formattedEmail}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          placeholder="Enter Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <button className="next-button" onClick={handleNext}>Next</button>
        {errorMessage && (<p style={{ color: "red", fontSize: "13px" }}>{errorMessage}</p>)}
        <div className="not-new-user">Already have an account?
          <span>
            <a href="/login">Log in</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderSignupStep1;
