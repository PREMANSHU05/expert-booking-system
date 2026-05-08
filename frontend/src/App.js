import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ExpertListing from './pages/ExpertListing';
import ExpertDetail from './pages/ExpertDetail';
import MyBookings from './pages/MyBookings';
import './index.css';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ExpertListing />} />
          <Route path="/experts/:id" element={<ExpertDetail />} />
          <Route path="/bookings" element={<MyBookings />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
