import React, { useState, useContext, useReducer } from "react";
import { UserContext } from "../../UserContext";
import { useNavigate } from "react-router-dom";
import SelectProfileModal from "../SelectProfileModal/SelectProfileModal";
import "./LoginForm.css";


const LoginForm = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const { updateUser } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate();

  const handleChangePassword = (e) => {
    setUserPassword(e.target.value);
  };

  const handleChangeEmail = (e) => {
    setUserEmail(e.target.value);
  };

  const validateEmail = (email) => {
    if (!email) {
      return( "Email Required")
    }
    else if (email.length < 8 ) {
      return ("Invalid Email Address")
    }
    else if (!email.includes("@")){
      return( "Invalid Email Address")
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return("Enter Password")
    }
    return '';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(userEmail);
    const passwordError = validatePassword(userPassword);

    if (emailError) {
      setErrorMessage(emailError);
      return;
    }

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }
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
        localStorage.setItem("user", JSON.stringify(data));
        updateUser(data);
        navigate("/homepage");
      } else {
        setErrorMessage("Invalid email or password, please try again.")
      }
    } catch (error) {
      console.log("error", error);
      setErrorMessage("An error occured, please try again later.")
    }
  };

  const handleSignupClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSelection = (type) => {
    setShowModal(false);
    if (type === 'user') {
      navigate('/user-signup');
    } else if (type === 'serviceProvider') {
      navigate('/service-provider-signup');
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
        {errorMessage && <p style={{color: "red", fontSize: "13px"}}>{errorMessage}</p>}
        <br />
        <br />
        <button className="login-button" onClick={handleLogin}>Login</button>
        <div className="new-user">
          New account? <span onClick={handleSignupClick}>Sign Up</span>
        </div>
        </div>
          <SelectProfileModal show={showModal} handleClose={handleModalClose} handleSelection={handleSelection} />
        </div>
  );
};

export default LoginForm;
