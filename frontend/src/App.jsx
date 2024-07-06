import { useState, useEffect } from "react";
import { UserContext } from './UserContext';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupForm from "./Components/SignupForm/SignupForm";
import LoginForm from "./Components/LoginForm/LoginForm";
import HomePage from "./Components/HomePage/HomePage";
import ServiceProviderSignupForm from "./Components/ServiceProviderSignupForm/ServiceProviderSignupForm";
import SelectProfilePage from "./Components/SelectProfilePage/SelectProfilePage";
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
            <Route path="/" element={<SelectProfilePage />} />
            <Route path="/user-signup" element={<SignupForm />} />
            <Route path="/service-provider-signup" element={<ServiceProviderSignupForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/homepage" element={<HomePage />} />
          </Routes>
        </Router>
      </UserContext.Provider>
    </div>
  );
}

export default App;
