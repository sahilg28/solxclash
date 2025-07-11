import React from 'react';
import { Rocket, Users, Zap, ArrowRight, CheckCircle, Clock, Target, Shield, Trophy, Gamepad2, Coins, Star } from 'lucide-react';

const RoadmapPreview = () => {
  const phases = [
    {
      phase: 'Phase 0',
      title: 'SolxClash Prototype',
      status: 'current',
      description:
        'The current prototype of SolxClash was built solo to bring the idea into action and validate the core mechanics. It includes:',
      features: [
        'Landing Page + Brand Identity',
        'Waitlist (early users)',
        'CryptoClash Free-to-Play Demo',
        'ChessClash Development',
        'Positioning & Community Messaging'
      ],
      icon: <Coins className="w-8 h-8" />,
      highlight: 'Everyone earns, skills multiply'
    },
    {
      phase: 'Phase 1',
      title: 'MVP Stage',
      status: 'upcoming',
      description:
        'Expanding into a comprehensive play-to-earn platform with multiple game formats, real-money options, and enhanced earning opportunities.',
      features: [
        'ChessClash: Strategic PvP with USDT rewards',
        'CryptoClash : Predict to Earn & PVP ',
        'Solana based Onchain gaming',
        'Continue validation and product positioning',
        'Tournament system with prize pools'
      ],
      icon: <Users className="w-8 h-8" />,
      highlight: 'Multiple earning streams'
    },
    {
      phase: 'Phase 2',
      title: 'Web3 Gaming Revolution',
      status: 'planned',
      description:
        'Full Web3 integration with blockchain-powered rewards, community governance, and creator economy features for maximum earning potential.',
      features: [
        'On-chain reward verification and distributi',
        'Community-created earning opportunities',
        'Creator tools for custom game modes',
        'Decentralized tournament prize pools',
        'App Development & SolxClash Token'
      ],
      icon: <Zap className="w-8 h-8" />,
      highlight: 'Decentralized earning ecosystem'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'upcoming':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Target className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'border-green-400/30 bg-green-400/10';
      case 'upcoming':
        return 'border-yellow-400/30 bg-yellow-400/10';
      default:
        return 'border-yellow-400/30 bg-yellow-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'current':
        return 'Live & Earning';
      case 'upcoming':
        return 'In Development';
      default:
        return 'Planned';
    }
  };

  return (
    <section id="roadmap" className="py-20 bg-gradient-to-b from-purple-900/30 via-purple-900/10 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            What's <span className="text-yellow-400">Coming Next!</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our roadmap to revolutionizing Web3 gaming through fair earning mechanics, transparent rewards.Each phase brings new ways to earn and grow your gaming income.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {phases.map((phase, index) => (
            <div
              key={phase.phase}
              className={`relative bg-gradient-to-br from-purple-900/40 to-black/80 backdrop-blur-xl border rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${getStatusColor(phase.status)} animate-scale-in`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                {getStatusIcon(phase.status)}
                <span className="text-sm font-medium text-gray-300">{getStatusText(phase.status)}</span>
              </div>

              {/* Phase Header */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-400/10 rounded-2xl flex items-center justify-center mb-4 text-purple-400 group-hover:bg-purple-400/20 transition-colors duration-300">
                  {phase.icon}
                </div>
                <div className="text-sm font-semibold text-purple-400 mb-2">{phase.phase}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{phase.title}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">{phase.description}</p>
                
                {/* Highlight */}
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold text-sm">{phase.highlight}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {phase.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400 font-medium">{phase.timeline}</div>
                <button className="group text-yellow-400 hover:text-yellow-300 transition-colors duration-200">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>

              {/* Connection Line */}
              {index < phases.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-400/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center animate-slide-in-left">
          <div className="bg-gradient-to-r from-purple-400/10 to-yellow-400/10 border border-purple-400/20 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center space-x-2">
              <Gamepad2 className="w-6 h-6 text-yellow-400" />
              <span> Ready to Play?</span>
            </h3>
            <p className="text-gray-300 mb-6">
  Join the next evolution of gaming where your skills and strategy unlock new challenges, rewards, and experiences. Start competing today and rise through the ranks with every game.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/chessclash'}
                className="btn-primary"
              >
                Start Now
              </button>
              <button 
                onClick={() => {
                  const section = document.getElementById('waitlist');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary"
              >
                Join the Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapPreview;