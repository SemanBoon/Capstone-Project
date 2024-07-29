import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import AddressLookupComponent from "../AddressLookupComponent/AddressLookupComponent";
import "./ServiceProviderSignupStep2.css";

const ServiceProviderSignupStep2 = ({ setStep }) => {
  const [formData, setFormData] = useState({
    profilePhoto: "",
    businessAddress: "",
    priceRange: "",
    bio: "",
    services: "",
  });

  const [initialData, setInitialData] = useState({});
  const { updateUser } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedFormData = JSON.parse(localStorage.getItem("serviceProviderFormData"));
    if (savedFormData) {
      setInitialData(savedFormData);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressSelect = (suggestion) => {
    setFormData({ ...formData, businessAddress: suggestion.text });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePhoto: e.target.files[0] });
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(initialData).forEach((key) => {
      formDataToSend.append(key, initialData[key]);
    });
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const signupResponse = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/service-provider-signup`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (signupResponse.ok) {
        localStorage.removeItem("serviceProviderFormData");

        const loginResponse = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/login`,{
            method: "POST",
            headers: { "Content-Type": "application/json" } ,
            body: JSON.stringify({
              email: initialData.email,
              password: initialData.password,
            }),
          }
        );

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          localStorage.setItem("user", JSON.stringify(loginData));
          updateUser(loginData);
          navigate(`/provider-homepage/${loginData.id}`)
        } else {
          setErrorMessage("Login Failed");
        }
      } else {
        const errorData = await signupResponse.json();
        if (errorData.error === "Email already in use") {
          setErrorMessage("Email already in use");
        } else {
          setErrorMessage("Signup Failed");
        }
      }
    } catch (error) {
      setErrorMessage("An error occurred, please try again");
    }
  };

  return (
    <div className="container">
      <div className="user-info">
        <h2>Service Provider Sign Up - Step 2</h2>
        <label htmlFor="profilePhoto">Profile Photo:</label>
        <input
          type="file"
          id="profilePhoto"
          name="profilePhoto"
          onChange={handleFileChange}
          required
        />
        <br />
        <br />
        <label htmlFor="businessAddress">Business Address:</label>
       <AddressLookupComponent onSelect={handleAddressSelect} />
        <br />
        <br />
        <label htmlFor="priceRange">Price Range:</label>
        <input
          type="text"
          id="priceRange"
          name="priceRange"
          placeholder="Enter Price Range"
          value={formData.priceRange}
          onChange={handleChange}
          required
        />
       <br />
       <br />
        <label htmlFor="bio">Short Bio:</label>
        <textarea
          id="bio"
          name="bio"
          placeholder="Enter a Short Bio"
          value={formData.bio}
          onChange={handleChange}
          required
        />
       <br />
       <br />
       <label htmlFor="services">Services:</label>
        <select
          id="services"
          name="services"
          value={formData.services}
          onChange={handleChange}
          required
        >
          <option value="">Select a Service</option>
          <option value="braids">Braids</option>
          <option value="haircuts">Haircuts</option>
          <option value="weave and installs">Weave and Installs</option>
          <option value="locs">Locs</option>
        </select>
        <br />
        <br />
        <button className="signup-button" onClick={handleSignup}>Sign Up</button>
        <button className="back-button" onClick={handleBack}>Back</button>

        {errorMessage && (<p style={{ color: "red", fontSize: "13px" }}>{errorMessage}</p>)}
      </div>
    </div>
  );
};

export default ServiceProviderSignupStep2;
