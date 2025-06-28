import React from 'react';
import { Shield, AlertTriangle, Target, Users, Zap, TrendingUp, Coins } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center px-6 py-3 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-6">
              <Shield className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-semibold">Transparency & Fair Play</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">General Disclaimer</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Understanding SolxClash: A play-to-earn Web3 gaming platform built on transparency and fair competition
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 space-y-8 animate-scale-in">
            
            {/* Platform Overview */}
            <section>
              <div className="flex items-center mb-6">
                <Coins className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">What is SolxClash?</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is a <span className="text-yellow-400 font-semibold">play-to-earn Web3 gaming platform</span> designed for entertainment and competitive gaming. 
                  The platform rewards players for participation while providing enhanced earning opportunities for strategic gameplay and knowledge.
                </p>
                <p>
                  While we strive to ensure accuracy and reliability in all our services, we make no guarantees regarding completeness, 
                  correctness, or suitability for any particular purpose. Your use of the platform is at your own risk.
                </p>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-400 font-semibold mb-2">Our Core Principle</h4>
                      <p className="text-gray-300 text-sm">
                        SolxClash operates on the principle that <span className="text-yellow-400 font-semibold">everyone should earn from playing</span>, 
                        while <span className="text-green-400 font-semibold">strategic players earn exponentially more</span> through knowledge and fair competition.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Not Financial Advice */}
            <section>
              <div className="flex items-center mb-6">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Not Financial Advice</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="font-semibold text-red-400 mb-2">Important: SolxClash does not offer financial, trading, or investment advice.</p>
                  <p className="text-gray-300 text-sm">
                    Any in-game price prediction or virtual outcome is for <span className="text-yellow-400 font-semibold">entertainment and competitive gaming purposes only</span> 
                    and should not be interpreted as real-world financial guidance.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">❌ We Are NOT:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• A trading platform</li>
                      <li>• An investment service</li>
                      <li>• A financial advisor</li>
                      <li>• A profit guarantee system</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">✅ We ARE:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• A play-to-earn gaming platform</li>
                      <li>• An entertainment service</li>
                      <li>• A competitive gaming community</li>
                      <li>• A fair earning environment</li>
                    </ul>
                  </div>
                </div>

                <p>
                  Participation in CryptoClash or other games should not be seen as a substitute for financial strategy or planning. 
                  <span className="text-yellow-400 font-semibold"> Always consult a licensed professional before making investment decisions.</span>
                </p>
              </div>
            </section>

            {/* Gaming & Entertainment Purpose */}
            <section>
              <div className="flex items-center mb-6">
                <TrendingUp className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Gaming & Entertainment Purpose</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>Our games are designed to:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                    <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="text-green-400 font-semibold mb-2">Test Knowledge</h4>
                    <p className="text-sm">Challenge your market knowledge and strategic thinking</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-blue-400 font-semibold mb-2">Build Community</h4>
                    <p className="text-sm">Connect with like-minded competitive gamers</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                    <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-purple-400 font-semibold mb-2">Provide Entertainment</h4>
                    <p className="text-sm">Offer engaging, competitive gaming experiences</p>
                  </div>
                </div>
                <p>
                  Participation should be treated like any form of recreational entertainment. You should only engage if you are comfortable 
                  with the outcomes and understand that any in-game progression or loss does not reflect actual market behavior.
                </p>
              </div>
            </section>

            {/* Risk Awareness */}
            <section>
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Risk Awareness</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>While SolxClash emphasizes play-to-earn gaming, risks include but are not limited to:</p>
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
                  <ul className="grid md:grid-cols-2 gap-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Game outcome losses (e.g., XP or game assets)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Possible system outages or technical errors</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Regulatory uncertainty or jurisdictional restrictions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>The potential for compulsive gaming behavior</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2">🎮 Play Responsibly</h4>
                  <p className="text-sm">
                    Set your limits, take breaks, and prioritize well-being. Gaming should enhance your life, not control it. 
                    If you or someone you know is struggling with gaming habits, seek help from support organizations in your region.
                  </p>
                </div>
              </div>
            </section>

            {/* Age Requirement */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Age Requirement</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is intended only for individuals aged <span className="text-yellow-400 font-semibold">18 years or older</span>. 
                  By using our services, you confirm that you meet this age requirement. Users under 18 are not permitted to register or engage with our platform.
                </p>
              </div>
            </section>

            {/* Jurisdiction & Legal Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Jurisdiction & Legal Compliance</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  You are solely responsible for ensuring that your use of SolxClash is legal in your jurisdiction. 
                  We do not offer services in regions where such platforms are restricted by law.
                </p>
                <p>
                  We recommend seeking local legal advice if you are uncertain about your rights or obligations.
                </p>
              </div>
            </section>

            {/* Platform Availability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Platform Availability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  While we aim to maintain uptime, we cannot guarantee uninterrupted access. Factors like maintenance, 
                  system updates, technical issues, or force majeure may temporarily disrupt services. SolxClash is not liable for downtime losses.
                </p>
              </div>
            </section>

            {/* Privacy & Data */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Privacy & Data</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Your use of our platform is also subject to our <a href="/privacy" className="text-yellow-400 underline hover:text-yellow-300 transition-colors">Privacy Policy</a>. 
                  We implement industry-standard security measures but cannot guarantee absolute security over the internet.
                </p>
              </div>
            </section>

            {/* Disclaimer Changes */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Disclaimer Changes</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update this Disclaimer at any time. Continued use of SolxClash after changes implies acceptance of the new terms.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="text-center pt-8 border-t border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Questions?</h2>
              <p className="text-gray-300 mb-6">
                Questions about this disclaimer? Reach out to us through our official channels.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.location.href = '/about'}
                  className="btn-secondary"
                >
                  Learn More About Us
                </button>
                <button 
                  onClick={() => window.location.href = '/cryptoclash'}
                  className="btn-primary"
                >
                  Start Playing
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

export default DisclaimerPage;