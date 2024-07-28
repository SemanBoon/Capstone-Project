import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import UserAddressLookup from "../UserAddressLookup/UserAddressLookup"
import "./SignupForm.css";

const capitalizedName = (name) => {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const capitalizedEmail = (email) => {
  return email.charAt(0).toUpperCase() + email.slice(1).toLowerCase();
};


const SignupForm = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChangePassword = (e) => {
    setUserPassword(e.target.value);
  };

  const handleChangePhone = (e) => {
    setUserPhone(e.target.value);
  };

  const handleChangeEmail = (e) => {
    setUserEmail(e.target.value);
  };

  const handleChangeUserName = (e) => {
    setUserName(e.target.value);
  };

  const handleAddressSelect = (suggestion) => {
    setUserAddress(suggestion.text);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(userEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (userPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    const nameParts = userName.trim().split(" ");
    if (nameParts.length < 2) {
      setErrorMessage("Please enter your full name");
      return;
    }
    const phonePattern = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
    if (!phonePattern.test(userPhone)) {
        setErrorMessage("Please enter a valid phone number.");
        return;
    }

    const formattedName = capitalizedName(userName);
    const formattedEmail = capitalizedEmail(userEmail);

    try {
      const signupResponse = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/user-signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formattedName,
            email: formattedEmail,
            phoneNumber: userPhone,
            password: userPassword,
            userAddress: userAddress,
            userType: "user",
          }),
        }
      );
      if (signupResponse.ok) {
        setUserName("");
        setUserEmail("");
        setUserPassword("");
        setUserPhone("");
        setUserAddress("");

        const loginResponse = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formattedEmail,
            password: userPassword,
          }),
        }
        );

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          localStorage.setItem("user", JSON.stringify(loginData));
          updateUser(loginData);
          navigate("/homepage");
        } else {
          setErrorMessage('Login Failed')
        }
      } else {
        const errorData = await signupResponse.json();
        if (errorData.error === "Email already in use"){
            setErrorMessage("Email already in use")
        } else {
            setErrorMessage("Signup Failed");
        }
      }
    } catch (error) {
      setErrorMessage('An error occured, please try again')
    }
  };

  return (
    <div className="container">
      <div className="user-info">
        <h2>Sign Up</h2>
        <label htmlFor="userName">Name:</label>
        <input
          type="text"
          id="userName"
          placeholder="Enter Fullname"
          value={userName}
          onChange={handleChangeUserName}
          required
        />
        <br />
        <br />
        <label htmlFor="userEmail">Email:</label>
        <input
          type="email"
          id="userEmail"
          placeholder="Enter Email Address"
          value={userEmail}
          onChange={handleChangeEmail}
          required
        />
        <br />
        <br />
        <label htmlFor="userPhone">Phone Number:</label>
        <input
          type="text"
          id="userPhone"
          placeholder="Enter Phone Number"
          value={userPhone}
          onChange={handleChangePhone}
          required
        />
        <br />
        <br />
        <label htmlFor="userAddress">Address:</label>
        <UserAddressLookup onSelect={handleAddressSelect} />
        <br />
        <br />
        <label htmlFor="userPassword">Password:</label>
        <input
          type="password"
          id="userPassword"
          placeholder="Enter Password"
          value={userPassword}
          onChange={handleChangePassword}
          required
        />
        <br />
        <br />
        <button className="signup-button" onClick={handleSignup}>Sign Up</button>
        {errorMessage && <p style={{color: "red", fontSize: "13px"}}>{errorMessage}</p>}
        <div className="not-new-user">Already have an account?
          <span>
            <a href="/login">Log in</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;



