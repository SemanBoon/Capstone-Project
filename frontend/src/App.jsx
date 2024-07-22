import { useState, useEffect } from "react";
import { UserContext } from './UserContext';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupForm from "./Components/SignupForm/SignupForm";
import LoginForm from "./Components/LoginForm/LoginForm";
import UserHomePage from "./Components/UserHomePage/UserHomePage";
import SearchPage from "./Components/SearchPage/SearchPage";
import ServiceProviderSignupForm from "./Components/ServiceProviderSignupForm/ServiceProviderSignupForm";
import SelectProfilePage from "./Components/SelectProfilePage/SelectProfilePage";
import UserProfilePage from "./Components/UserProfilePage/UserProfilePage";
import UserFavPage from "./Components/UserFavPage/UserFavPage";
import UserWebSocket from "./Components/UserWebSocket";
import ProviderHomePage from "./Components/ProviderHomePage/ProviderHomePage";
import ProviderProfilePage from "./Components/ProviderProfilePage/ProviderProfilePage";
import ServicesPage from "./Components/ServicesPage/ServicesPage";
import PrivateRoute from "./Components/PrivateRoute";
import { ToastContainer } from 'react-toastify';
import "./App.css";
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';




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
            <Route path="/homepage" element={<UserHomePage />} />
            <Route path="/user-profile" element={<PrivateRoute element= {UserProfilePage} />} />
            <Route path="favorite" element={<PrivateRoute element= {UserFavPage}/>} />
            <Route path="/search/:category" element={<PrivateRoute element= {SearchPage} />} />
            <Route path="/provider-homepage/:id" element={<PrivateRoute element= {ProviderHomePage} />} />
            <Route path="/service-provider-profile/:id" element={<PrivateRoute element= {ProviderProfilePage} />} />
            <Route path="/service-provider-services/:id" element={<PrivateRoute element= {ServicesPage} />} />
          </Routes>
          {user && <UserWebSocket userId={user.id} />}
        </Router>
        <ToastContainer />
      </UserContext.Provider>
    </div>
  );
}

export default App;
