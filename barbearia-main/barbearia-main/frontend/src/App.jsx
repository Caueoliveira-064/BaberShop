import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Scheduling from './pages/Scheduling';
import Store from './pages/Store';
import Dashboard from './pages/Dashboard';
import SubscriberBooking from './pages/SubscriberBooking';
import Checkout from './pages/Checkout';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  React.useEffect(() => {
    document.title = 'TCHESCO BARBERSHOP | A Barbearia de Elite';
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/subscriber-booking" element={<SubscriberBooking />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/store" element={<Store />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
