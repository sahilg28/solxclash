import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">About <span className="text-yellow-400">SolxClash</span></h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A Web3 Gaming Layer Built on Skill, Not Chance
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 space-y-8">
            {/* The Story */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">The Story</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Hi, I'm Sahil Gupta, founder and solo developer behind SolxClash.
                </p>
                <p>
                  I started this journey not with a team or funding — but with curiosity, a laptop, and the desire to build something meaningful in Web3.
                  What began as a crypto prediction game at a hackathon quickly grew into something bigger: a platform that rewards players for what they know, not what they spend.
                </p>
              </div>
            </section>
            {/* What is SolxClash? */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What is SolxClash?</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is a Web3 platform where your skill is the currency — not luck, not how much you spend.
                </p>
                <p>
                  Our flagship game, <span className="text-yellow-400 font-semibold">CryptoClash</span>, is live now. It challenges players to predict short-term crypto price moves and compete on leaderboards.
                </p>
                <p>
                  <span className="font-semibold text-white">But we're not stopping there.</span> <span className="text-yellow-400 font-semibold">ChessClash</span> is coming soon — a Solana-powered PvP chess experience where players can go head-to-head in ranked or real-reward matches. It's the next step in expanding SolxClash into a competitive, multi-game ecosystem.
                </p>
              </div>
            </section>
            {/* Built for Players, Not Whales */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Built for Players, Not Whales</h2>
              <div className="text-gray-300 space-y-4">
                <p>Most Web3 games feel like casinos or token farms. SolxClash flips that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>No gambling</li>
                  <li>No random luck mechanics</li>
                  <li>No confusing tokenomics</li>
                </ul>
                <p>
                  Here, you win because you read the market better, or played the board smarter — not because you spent more.
                </p>
              </div>
            </section>
            {/* The Solo Journey */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">The Solo Journey</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  As a solo builder, I've been hands-on with every part of SolxClash — designing game loops, integrating with Solana, and optimizing performance.
                </p>
                <p>
                  This solo approach keeps things lean, focused, and user-first. Every update is tested, every game loop thought through, and every piece built with real players in mind.
                </p>
              </div>
            </section>
            {/* Where We're Headed */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Where We're Headed</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is evolving into a full Web3 skill-based arcade, starting with CryptoClash and ChessClash — but with more competitive game modes coming next.
                </p>
                <p>
                  The mission? To create a fair, fun, and community-first gaming platform where your skill earns you more than just bragging rights.
                </p>
                <p className="text-yellow-400 font-semibold">
                  If you're reading this early — you're already part of that story.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;