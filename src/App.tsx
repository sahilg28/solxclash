import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import CryptoClashPage from './pages/CryptoClashPage';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-black font-['Poppins']">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/cryptoclash" element={<CryptoClashPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;