import { useState, useEffect } from "react";
import { UserContext } from './UserContext';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupForm from "./Components/SignupForm/SignupForm";
import LoginForm from "./Components/LoginForm/LoginForm";
import HomePage from "./Components/HomePage/HomePage";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const updateUser = (newUser) => {
    setUser(newUser);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <div className="app">
      <UserContext.Provider value={{ user, updateUser }}>
        <Router>
          <Routes>
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/" element={<SignupForm />} />
            {/* <Route path="/" element={user ? <HomePage/> : <LoginForm /> } /> */}
          </Routes>
        </Router>
      </UserContext.Provider>
    </div>
  );
}

export default App;
