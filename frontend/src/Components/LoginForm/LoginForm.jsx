import React, { useState, useContext } from "react";
import { UserContext } from "../../UserContext";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

const LoginForm = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  const handleChangePassword = (e) => {
    setUserPassword(e.target.value);
  };

  const handleChangeEmail = (e) => {
    setUserEmail(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, password: userPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        updateUser({ email: userEmail });
        navigate("/homepage");
      } else {
        console.log("Login failed");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="container">
      <div className="user-info">
        <h2>Login</h2>
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
        <button className="login-button" onClick={handleLogin}>Login</button>
        <div className="new-user">
          New account? <span><a href="/signup">Sign Up</a></span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
