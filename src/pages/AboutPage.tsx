import React from 'react';
import { Code, Target, Users, Zap, Shield, TrendingUp, Trophy, Heart, Coins, Star, Gamepad2, Globe, Crown, Brain } from 'lucide-react';
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
              Building the Future of Skill-to-Earn Gaming Where Your Abilities Unlock Real Rewards
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
                Revolutionizing Gaming Through Skill-to-Earn Excellence
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
                SolxClash is pioneering a new era of gaming where <span className="text-yellow-400 font-semibold">your skills directly translate to earnings</span>. 
                We're building a comprehensive play-to-earn platform that rewards talent, strategy, and dedication while fostering a global community of skilled players.
              </p>
            </section>

            {/* The Story */}
            <section>
              <div className="flex items-center mb-6">
                <Heart className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">The Solo Journey Behind the Vision</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  Hi, I'm Sahil Gupta, founder and solo developer behind SolxClash.
                </p>
                <p>
                  What started as a simple crypto prediction game has evolved into something much bigger: <span className="text-yellow-400 font-semibold">a comprehensive play-to-earn gaming platform</span> where 
                  players can earn through their favorite games while building a global community of skilled competitors.
                </p>
                <p>
                  As a solo builder, I've been hands-on with every aspect of SolxClash — from designing fair earning mechanics to integrating cutting-edge blockchain technology. 
                  This approach keeps the platform <span className="text-yellow-400 font-semibold">lean, focused, and genuinely player-first</span>, ensuring that skill and strategy always triumph over spending power.
                </p>
              </div>
            </section>

            {/* What is SolxClash? */}
            <section>
              <div className="flex items-center mb-6">
                <Gamepad2 className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">What is SolxClash?</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is a <span className="text-yellow-400 font-semibold">skill-to-earn gaming platform</span> where players can monetize their gaming abilities across multiple game formats. 
                  We're building an ecosystem where <span className="text-green-400 font-semibold">every player earns, but skilled players earn exponentially more</span>.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      CryptoClash (Developing)
                    </h4>
                    <p className="text-sm text-gray-300">
                      Test your market knowledge with real-time crypto price predictions. Earn XP for every prediction, with 2x multipliers for accuracy and streak bonuses.
                    </p>
                  </div>
                  
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-purple-400 font-semibold mb-3 flex items-center">
                      <Crown className="w-5 h-5 mr-2" />
                      ChessClash (Coming Soon)
                    </h4>
                    <p className="text-sm text-gray-300">
                      Strategic PvP chess battles with real USDT rewards. Compete globally, climb rankings, and earn through pure chess mastery.
                    </p>
                  </div>
                </div>

                <p>
                  <span className="font-semibold text-white">But we're just getting started.</span> Our roadmap includes multiple game formats, 
                  tournament systems, and community-driven features that will establish SolxClash as the premier destination for skill-based earning in Web3 gaming.
                </p>
              </div>
            </section>

            {/* Core Principles */}
            <section>
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Built for Players, Powered by Skills</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>Traditional gaming often feels like a money sink. SolxClash is different — we're building for players who want their skills to matter:</p>
                
                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h4 className="text-red-400 font-semibold mb-2">❌ What We Reject</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Pay-to-win mechanics</li>
                      <li>• Expensive NFT requirements</li>
                      <li>• Gambling-based systems</li>
                      <li>• Whale-dominated economies</li>
                      <li>• Opaque reward systems</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-2">✅ What We Champion</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Skill-based earning opportunities</li>
                      <li>• Fair competition for all players</li>
                      <li>• Transparent reward mechanics</li>
                      <li>• Global community building</li>
                      <li>• Multiple earning pathways</li>
                    </ul>
                  </div>
                </div>

                <p>
                  Here, you earn more because you <span className="text-yellow-400 font-semibold">strategize better, predict smarter, or outplay your opponents</span> — 
                  not because you spent more money. Skills are the ultimate currency.
                </p>
              </div>
            </section>

            {/* Global Community & Chess Empowerment */}
            <section>
              <div className="flex items-center mb-6">
                <Globe className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Building a Global Gaming Community</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash isn't just about individual earnings — we're fostering a <span className="text-yellow-400 font-semibold">worldwide community of skilled players</span> who 
                  can compete, learn, and earn together regardless of their location or background.
                </p>
                
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-6">
                  <h4 className="text-yellow-400 font-semibold mb-3 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Empowering Chess & Strategic Gaming
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Chess represents the pinnacle of strategic thinking. Through ChessClash, we're bringing this timeless game into the Web3 era, 
                    allowing players to earn real rewards for their strategic mastery while connecting with chess enthusiasts globally.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-blue-400 font-semibold mb-2">Global Reach</h4>
                    <p className="text-sm">Connect and compete with players worldwide</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="text-green-400 font-semibold mb-2">Skill Recognition</h4>
                    <p className="text-sm">Your abilities are rewarded and celebrated</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Coins className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-purple-400 font-semibold mb-2">Fair Earning</h4>
                    <p className="text-sm">Transparent, skill-based reward systems</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Web3 & Blockchain Integration */}
            <section>
              <div className="flex items-center mb-6">
                <Zap className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Why Web3 & Blockchain Matter</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  We chose Web3 and blockchain technology not for hype, but because they enable the core principles of fair, skill-based gaming:
                </p>
                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
                    <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-blue-400 font-semibold mb-2">Transparency</h4>
                    <p className="text-sm">All earning mechanics and payouts are verifiable on-chain</p>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                    <Coins className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-purple-400 font-semibold mb-2">True Ownership</h4>
                    <p className="text-sm">Players truly own their earnings and achievements</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <Globe className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="text-green-400 font-semibold mb-2">Global Access</h4>
                    <p className="text-sm">Borderless gaming with instant, low-cost transactions</p>
                  </div>
                </div>
                <p>
                  Blockchain technology ensures that earning systems are <span className="text-yellow-400 font-semibold">provably fair and transparent</span>, 
                  giving players confidence that skill and strategy, not manipulation, determine rewards.
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
                  Building SolxClash as a solo developer brings unique advantages for creating a truly player-centric platform:
                </p>
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-3">🎯 Player-First Focus</h4>
                      <p className="text-sm">Every feature serves players' earning potential and gaming experience</p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-3">⚡ Rapid Innovation</h4>
                      <p className="text-sm">Quick iteration based on community feedback and emerging opportunities</p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-3">💝 No Investor Pressure</h4>
                      <p className="text-sm">Decisions prioritize player satisfaction over profit maximization</p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-3">🔧 Quality Control</h4>
                      <p className="text-sm">Every earning mechanism is carefully tested and optimized</p>
                    </div>
                  </div>
                </div>
                <p>
                  This solo approach keeps SolxClash <span className="text-yellow-400 font-semibold">authentic, agile, and genuinely focused on maximizing player value</span> — 
                  ensuring that skill-based earning remains at the heart of everything we build.
                </p>
              </div>
            </section>

            {/* Future Vision */}
            <section>
              <div className="flex items-center mb-6">
                <Trophy className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">The Future of Skill-to-Earn Gaming</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is evolving into the premier destination for skill-based earning in gaming:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <p><span className="text-yellow-400 font-semibold">Phase 1:</span> Multi-game platform with CryptoClash and ChessClash establishing diverse earning opportunities</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <p><span className="text-yellow-400 font-semibold">Phase 2:</span> Tournament systems, leaderboard rewards, and community-driven competitions</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <p><span className="text-yellow-400 font-semibold">Phase 3:</span> Advanced game formats, creator tools, and expanded earning mechanisms</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <p><span className="text-yellow-400 font-semibold">Beyond:</span> More cool games, innovative earning models, and global esports integration</p>
                  </div>
                </div>
                <p className="text-yellow-400 font-semibold text-lg">
                  The mission? To create the world's most rewarding skill-based gaming platform where talent meets opportunity.
                </p>
                <p className="text-lg">
                  If you're reading this early — <span className="text-yellow-400 font-semibold">you're already part of this gaming revolution</span>. 
                  Join us in building the future where your gaming skills create real value and lasting rewards.
                </p>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center pt-8 border-t border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Ready to Turn Your Skills Into Earnings?</h3>
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