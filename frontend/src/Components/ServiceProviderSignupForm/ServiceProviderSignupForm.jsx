import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import "./ServiceProviderSignupForm.css";

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

const ServiceProviderSignupForm = () => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleChangePhone = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangeBusinessName = (e) => {
    setBusinessName(e.target.value);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    const formattedName = capitalizedName(businessName);
    const formattedEmail = capitalizedEmail(email);

    try {
      const signupResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/service-provider-signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName: formattedName,
            email: formattedEmail,
            phoneNumber: parseInt(phoneNumber),
            password: password,
            // userType: "serviceProvider"
          }),
        }
      );

      if (signupResponse.ok) {
        setBusinessName("");
        setEmail("");
        setPassword("");
        setPhoneNumber("");
        console.log("Signup success");

        const loginResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_ADDRESS}/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: formattedName, password: password, userType: "serviceProvider" }),
          }
        );

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          localStorage.setItem("user", JSON.stringify(loginData));
          updateUser(loginData);
          navigate("/homepage");
        } else {
          console.log("Login failed");
          setErrorMessage("Login Failed");
        }
      } else {
        console.log("Signup failed");
        setErrorMessage("Signup Failed");
      }
    } catch (error) {
      console.log("error:", error);
      setErrorMessage("An error occurred, please try again");
    }
  };

  return (
    <div className="container">
      <div className="user-info">
        <h2>Service Provider Sign Up</h2>
        <label htmlFor="businessName">Business Name:</label>
        <input
          type="text"
          id="businessName"
          placeholder="Enter Business Name or Full Name"
          value={businessName}
          onChange={handleChangeBusinessName}
          required
        />
        <br />
        <br />
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Enter Email Address"
          value={email}
          onChange={handleChangeEmail}
          required
        />
        <br />
        <br />
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="text"
          id="phoneNumber"
          placeholder="Enter Phone Number"
          value={phoneNumber}
          onChange={handleChangePhone}
          required
        />
        <br />
        <br />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          placeholder="Enter Password"
          value={password}
          onChange={handleChangePassword}
          required
        />
        <br />
        <br />
        <button className="signup-button" onClick={handleSignup}>Sign Up</button>
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

export default ServiceProviderSignupForm;
