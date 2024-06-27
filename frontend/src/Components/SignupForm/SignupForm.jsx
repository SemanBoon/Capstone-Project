import React, { useState } from "react";
import "./SignupForm.css";

const SignupForm = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [result, setResult] = useState("");

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


  const handleSignup = () => {
    console.log("sewa");
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/signup`,
    {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userName,
        Email: userEmail,
        phoneNumber: parseInt(userPhone),
        password: userPassword,
      }),
    })
    .then((response) => {
      console.log(response);
      if (response.ok) {
        setResult("signup successful");
      } else {
        setResult("failed to sign-up");
      }
    })
    .catch((error) => {
      setResult("failed to sign-up");
    });

  };

  return (
    <>
      <div className="container">
        <div className="user-info">
          <label htmlFor="userName">Name:</label>
          <input
            type="text"
            id="userName"
            name="userName"
            placeholder="Enter Fullname"
            value={userName}
            onChange ={handleChangeUserName}
            key="userName"
          />
          <br />
          <br />
          <label htmlFor="userEmail">Email:</label>
          <input
            type="text"
            id="userEmail"
            name="userEmail"
            placeholder="Enter Email Address"
            value={userEmail}
            onChange={handleChangeEmail}
            key="userEmail"
          />
          <br />
          <br />
          <label htmlFor="userPhone">Phone Number:</label>
          <input
            type="text"
            id="userPhone"
            name="userPhone"
            placeholder="Enter Phone Number"
            value={userPhone}
            onChange={handleChangePhone}
            key="userPhone"
          />
          <br />
          <br />
          <label htmlFor="userPassword">Password:</label>
          <input
            type="text"
            id="userPassword"
            name="userPassword"
            placeholder="Enter Password"
            value={userPassword}
            onChange={handleChangePassword}
            key="userPassword"
          />
          <br />
          <br />
          <button className="signup-button" onClick={handleSignup}> SignUp</button>
          <div className="not-new-user">
            Already have an account? <span>Log in!</span>
            {/* put a link in log in to take me to the login form */}
          </div>
        </div>
      </div>

    </>
  );
};

export default SignupForm;
