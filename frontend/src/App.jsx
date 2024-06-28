import { BrowserRouter as Router, Routes, Route } from 'react-router-dom' ;
import "./App.css";
import SignupForm from "./Components/SignupForm/SignupForm";
import LoginForm from "./Components/LoginForm/LoginForm";
import HomePage from "./Components/HomePage/HomePage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/homepage" element={< HomePage />} />
        <Route path="/" element={< SignupForm />} />
      </Routes>
    </Router>
  );
}

export default App;
