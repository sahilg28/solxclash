import React from 'react';
import { useAuthContext } from '../components/AuthProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthButtons from '../components/AuthButtons';
import ChessClash from '../components/ChessClash';

const ChessClashPage = () => {
  const { user, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Ready to play <span className="text-yellow-400">ChessClash?</span>
              </h1>
              <p className="text-gray-300 mb-6">
                Get <span className="text-yellow-400 font-semibold">100 XP bonus</span> on signup and start playing!
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Sign up first to play ChessClash!
              </p>
              <div className="flex items-center justify-center">
                <AuthButtons />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="pt-16 min-h-screen flex flex-col items-center justify-center">
        <ChessClash profile={profile} />
      </main>
      <Footer />
    </div>
  );
};

export default ChessClashPage; 