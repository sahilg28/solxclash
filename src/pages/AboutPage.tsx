import React from 'react';
import { Code, Target, Users, Zap, Shield, TrendingUp, Trophy, Heart, Coins, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              About <span className="text-yellow-400">SolxClash</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A Web3 Play-to-Earn Gaming Revolution Built on Fair Competition and Skill-Based Rewards
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 space-y-8 animate-scale-in">
            
            {/* Mission Statement */}
            <section className="text-center mb-12">
              <div className="inline-flex items-center px-6 py-3 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-6">
                <Coins className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-yellow-400 font-semibold">Our Mission</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Revolutionizing Web3 Gaming Through Play-to-Earn Excellence
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
                SolxClash is pioneering a new era of Web3 gaming where <span className="text-yellow-400 font-semibold">everyone earns from playing</span> and 
                <span className="text-green-400 font-semibold"> skilled players earn exponentially more</span>. We're building a platform that rewards participation while amplifying the value of knowledge, strategy, and dedication.
              </p>
            </section>

            {/* The Story */}
            <section>
              <div className="flex items-center mb-6">
                <Heart className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">The Solo Journey</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  Hi, I'm Sahil Gupta, founder and solo developer behind SolxClash.
                </p>
                <p>
                  I started this journey not with a team or funding — but with <span className="text-yellow-400 font-semibold">curiosity, passion, and the desire to build something meaningful</span> in Web3.
                  What began as a crypto prediction game at a hackathon quickly evolved into something bigger: a platform that rewards players for participation while multiplying rewards for skill.
                </p>
                <p>
                  As a solo builder, I've been hands-on with every aspect of SolxClash — from designing earning mechanics to integrating with blockchain technology. 
                  This approach keeps the platform <span className="text-yellow-400 font-semibold">lean, focused, and genuinely player-first</span>.
                </p>
              </div>
            </section>

            {/* What is SolxClash? */}
            <section>
              <div className="flex items-center mb-6">
                <Zap className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">What is SolxClash?</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is a Web3 play-to-earn platform where <span className="text-yellow-400 font-semibold">every player earns from participation</span>, but 
                  <span className="text-green-400 font-semibold"> skilled players earn exponentially more</span> through strategic gameplay and market knowledge.
                </p>
                <p>
                  Our flagship game, <span className="text-yellow-400 font-semibold">CryptoClash</span>, is live now. Players earn XP from every prediction, with 2x multipliers for correct calls and bonus streaks for consistent performance. It's designed so everyone wins, but knowledge pays off big.
                </p>
                <p>
                  <span className="font-semibold text-white">But we're just getting started.</span> <span className="text-yellow-400 font-semibold">ChessClash</span> is coming soon — a blockchain-powered PvP chess experience with real USDT rewards for skilled players. It represents the next evolution of SolxClash into a comprehensive, multi-game earning ecosystem.
                </p>
              </div>
            </section>

            {/* Core Principles */}
            <section>
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Built for Earners, Not Whales</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>Most Web3 games feel like casinos or expensive NFT showcases. SolxClash is different:</p>
                
                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h4 className="text-red-400 font-semibold mb-2">❌ What We Reject</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Pay-to-win mechanics</li>
                      <li>• Expensive NFT requirements</li>
                      <li>• Zero-sum gambling systems</li>
                      <li>• Complex tokenomics</li>
                      <li>• Whale-dominated economies</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-2">✅ What We Champion</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Everyone earns from playing</li>
                      <li>• Skills multiply earning potential</li>
                      <li>• Free to start, earn to upgrade</li>
                      <li>• Transparent earning mechanics</li>
                      <li>• Fair competition for all</li>
                    </ul>
                  </div>
                </div>

                <p>
                  Here, you earn more because you <span className="text-yellow-400 font-semibold">read the market better, strategize smarter, or outplay your opponents</span> — not because you spent more money.
                </p>
              </div>
            </section>

            {/* Web3 & Transparency */}
            <section>
              <div className="flex items-center mb-6">
                <TrendingUp className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Why Web3 Matters for Earning</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  We chose Web3 not for hype, but for its core principles that align with fair earning:
                </p>
                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
                    <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-blue-400 font-semibold mb-2">Transparency</h4>
                    <p className="text-sm">All earning mechanics and payouts are verifiable</p>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                    <Coins className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-purple-400 font-semibold mb-2">True Ownership</h4>
                    <p className="text-sm">Players truly own their earnings and achievements</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="text-green-400 font-semibold mb-2">Fair Distribution</h4>
                    <p className="text-sm">No single entity controls earning outcomes</p>
                  </div>
                </div>
                <p>
                  Blockchain technology ensures that earning systems are <span className="text-yellow-400 font-semibold">provably fair and transparent</span>, 
                  giving players confidence that skill and participation, not manipulation, determine rewards.
                </p>
              </div>
            </section>

            {/* The Solo Advantage */}
            <section>
              <div className="flex items-center mb-6">
                <Code className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">The Solo Builder Advantage</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  Building SolxClash as a solo developer brings unique advantages:
                </p>
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-3">🎯 Focused Vision</h4>
                      <p className="text-sm">Every feature serves the core mission of fair earning</p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-3">⚡ Rapid Innovation</h4>
                      <p className="text-sm">Quick iteration and response to player earning feedback</p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-3">💝 Player-First</h4>
                      <p className="text-sm">No investor pressure to prioritize profits over player earnings</p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-3">🔧 Quality Control</h4>
                      <p className="text-sm">Every earning mechanism is tested and optimized</p>
                    </div>
                  </div>
                </div>
                <p>
                  This solo approach keeps SolxClash <span className="text-yellow-400 font-semibold">lean, authentic, and genuinely focused on maximizing player earnings</span> — 
                  fair competition and skill-based rewards.
                </p>
              </div>
            </section>

            {/* Where We're Headed */}
            <section>
              <div className="flex items-center mb-6">
                <Trophy className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">The Future of Play-to-Earn Gaming</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is evolving into the premier Web3 play-to-earn gaming platform:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <p><span className="text-yellow-400 font-semibold">Phase 1:</span> CryptoClash and ChessClash establishing the earning foundation</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <p><span className="text-yellow-400 font-semibold">Phase 2:</span> Multiple earning streams and real-money tournaments</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <p><span className="text-yellow-400 font-semibold">Phase 3:</span> Community-driven earning opportunities and creator tools</p>
                  </div>
                </div>
                <p className="text-yellow-400 font-semibold text-lg">
                  The mission? To create a fair, fun, and community-first gaming platform where your skills translate to real earnings.
                </p>
                <p className="text-lg">
                  If you're reading this early — <span className="text-yellow-400 font-semibold">you're already part of this earning revolution</span>. 
                  Join us in building the future of play-to-earn Web3 gaming.
                </p>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center pt-8 border-t border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Ready to Start Earning?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.location.href = '/cryptoclash'}
                  className="btn-primary"
                >
                  Start Earning Now
                </button>
                <button 
                  onClick={() => window.location.href = '/leaderboard'}
                  className="btn-secondary"
                >
                  View Top Earners
                </button>
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