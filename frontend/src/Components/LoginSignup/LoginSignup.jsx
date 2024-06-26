import React, { useState } from 'react';
import './LoginSignup.css'
// import user_icon from '../Assets/person.png'
// import password_icon from '../Assets/password.png'
// import phone_icon from '../Assets/phone.png'
// import email_icon from '../Assets/email.png'


const LoginSignup = () => {
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [userPassword, setUserPassword] = useState('');
    return (
        <>
          <div className="container">
            <span className = "close">&times;</span>
            <form className ="user-info">
              <label htmlFor="userName">Name:</label>
              {/* <img src={user_icon} alt=""/> */}
              <input
                type="text"
                id="userName"
                name="userName"
                value={userName}
              /><br /><br />
              <label htmlFor="userEmail">Email:</label>
              {/* <img src={email_icon} alt=""/> */}
              <input
                type="text"
                id="userEmail"
                name="userEmail"
                placeholder='Enter Email Address'
                value={userEmail}
              /><br /><br />
              <label htmlFor="userPhone">Phone Number:</label>
              {/* <img src={phone_icon} alt=""/> */}
              <input
                type="text"
                id="userPhone"
                name="userPhone"
                placeholder='Enter Phone Number'
                value={userPhone}
              /><br /><br />
              <label htmlFor="userPassword">Password:</label>
              {/* <img src={password_icon} alt=""/> */}
              <input
                type="text"
                id="userPassword"
                name="userPassword"
                placeholder='Enter Password'
                value={userPassword}
              /><br /><br />
              <input className ="signup-button"type="submit" value="Sign-Up" />
            </form>
          </div>
        </>
    )
}


export default LoginSignup
