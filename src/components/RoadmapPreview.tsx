import React from 'react';
import { Rocket, Users, Zap, ArrowRight, CheckCircle, Clock, Target, Shield, Trophy, Gamepad2, Coins, Star } from 'lucide-react';

const RoadmapPreview = () => {
  const phases = [
    {
      phase: 'Phase 0',
      title: 'Play-to-Earn Foundation',
      status: 'current',
      description:
        'Establishing the core play-to-earn mechanics where every player earns from participation, and skilled players earn exponentially more through strategic gameplay.',
      features: [
        'CryptoClash live with instant XP rewards',
        'Skill-based earning multipliers and streaks',
        'Fair play mechanics with guaranteed rewards',
        'Community-driven feedback integration',
        'Progressive earning system validation'
      ],
      icon: <Coins className="w-8 h-8" />,
      timeline: 'Live Now',
      highlight: 'Everyone earns, skills multiply'
    },
    {
      phase: 'Phase 1',
      title: 'Multi-Game Earning Ecosystem',
      status: 'upcoming',
      description:
        'Expanding into a comprehensive play-to-earn platform with multiple game formats, real-money options, and enhanced earning opportunities.',
      features: [
        'ChessClash: Strategic PvP with USDT rewards',
        'Tournament system with prize pools',
        'Enhanced earning mechanics and bonuses',
        'Real-money match options for skilled players',
        'Advanced analytics and earning optimization'
      ],
      icon: <Users className="w-8 h-8" />,
      timeline: 'Q1 2025',
      highlight: 'Multiple earning streams'
    },
    {
      phase: 'Phase 2',
      title: 'Web3 Earning Revolution',
      status: 'planned',
      description:
        'Full Web3 integration with blockchain-powered rewards, community governance, and creator economy features for maximum earning potential.',
      features: [
        'On-chain reward verification and distribution',
        'Community-created earning opportunities',
        'Creator tools for custom game modes',
        'Decentralized tournament prize pools',
        'Cross-platform earning verification'
      ],
      icon: <Zap className="w-8 h-8" />,
      timeline: 'Q2-Q3 2025',
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
    <section id="roadmap" className="py-20 bg-gradient-to-b from-gray-900 via-yellow-900/20 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center px-6 py-3 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-6">
            <Rocket className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-yellow-400 font-semibold">The Earning Journey</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Building the Future of <span className="text-yellow-400">Play-to-Earn Gaming</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our roadmap to revolutionizing Web3 gaming through fair earning mechanics, transparent rewards, and skill-based multipliers. 
            Each phase brings new ways to earn and grow your gaming income.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {phases.map((phase, index) => (
            <div
              key={phase.phase}
              className={`relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${getStatusColor(phase.status)} animate-scale-in`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                {getStatusIcon(phase.status)}
                <span className="text-sm font-medium text-gray-300">{getStatusText(phase.status)}</span>
              </div>

              {/* Phase Header */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-4 text-yellow-400 group-hover:bg-yellow-400/20 transition-colors duration-300">
                  {phase.icon}
                </div>
                <div className="text-sm font-semibold text-yellow-400 mb-2">{phase.phase}</div>
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
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-yellow-400/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>

        {/* Play-to-Earn Principles */}
        <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-12 animate-fade-in-up">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Our Play-to-Earn Principles
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Everyone Earns</h4>
              <p className="text-sm text-gray-400">Every player gets rewarded for participation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Skills Multiply</h4>
              <p className="text-sm text-gray-400">Better skills lead to exponentially higher earnings</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Fair Mechanics</h4>
              <p className="text-sm text-gray-400">Transparent earning systems with no hidden advantages</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Sustainable Growth</h4>
              <p className="text-sm text-gray-400">Long-term earning potential through skill development</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-slide-in-left">
          <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/20 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center space-x-2">
              <Gamepad2 className="w-6 h-6 text-yellow-400" />
              <span>Ready to Start Earning?</span>
            </h3>
            <p className="text-gray-300 mb-6">
              Join the play-to-earn revolution where your gaming skills translate to real rewards. Start earning today and grow your income through strategic gameplay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/cryptoclash'}
                className="btn-primary"
              >
                Start Earning Now
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