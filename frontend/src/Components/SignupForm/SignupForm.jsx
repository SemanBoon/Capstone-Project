import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
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
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

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

    const formattedName = capitalizedName(userName);
    const formattedEmail = capitalizedEmail(userEmail);

    try {
      const signupResponse = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formattedName,
            email: formattedEmail,
            phoneNumber: parseInt(userPhone),
            password: userPassword,
          }),
        }
      );
      if (signupResponse.ok) {
        setUserName("");
        setUserEmail("");
        setUserPassword("");
        setUserPhone("");
        console.log("Signup success");

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
          console.log("Login failed");
          setErrorMessage('Login Failed')
        }
      } else {
        console.log("Signup failed");
        setErrorMessage('Signup Failed')
      }
    } catch (error) {
      console.log("error:", error);
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
