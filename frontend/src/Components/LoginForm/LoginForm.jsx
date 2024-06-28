import React, { useState } from "react";
import "./LoginForm.css";
import {useNavigate} from "react-router-dom"

const LoginForm = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [result, setResult] = useState("");
  const navigate = useNavigate();

  const handleChangePassword = (e) => {
    setUserPassword(e.target.value);
  };

  const handleChangeEmail = (e) => {
    setUserEmail(e.target.value);
  };


  const handleLogin = () => {
    console.log("sewa");
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: userEmail,
        password: userPassword,
      }),
    })
    .then((response) => {
      console.log(response);
      if (response.ok) {
        setResult("login successful");
        navigate("/homepage")
        console.log('success')
      } else {
        setResult("failed to login");
        console.log('failed')
      }
    })
    .catch((error) => {
      setResult("failed to login");
      console.log('error')
    });

  };

  return (
    <>
      <div className="container">
        <div className="user-info">
          <label htmlFor="userEmail">Email:</label>
          <input
            type="text"
            id="userEmail"
            name="userEmail"
            placeholder="Enter Email Address"
            value={userEmail}
            onChange={handleChangeEmail}
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
          />
          <br />
          <br />
          <button className="login-button" onClick={handleLogin}> Login</button>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
