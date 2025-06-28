import React from 'react';
import { Rocket, Users, Zap, ArrowRight, CheckCircle, Clock, Target, Shield, Trophy, Gamepad2 } from 'lucide-react';

const RoadmapPreview = () => {
  const phases = [
    {
      phase: 'Phase 0',
      title: 'Foundation & Validation',
      status: 'current',
      description:
        'Building the core platform to validate skill-based gameplay mechanics and establish the foundation for fair, competitive Web3 gaming.',
      features: [
        'CryptoClash live with real-time predictions',
        'Skill-based XP and leaderboard system',
        'Web2/Web3 hybrid authentication',
        'Community feedback integration',
        'Fair play mechanics validation'
      ],
      icon: <Rocket className="w-8 h-8" />,
      timeline: 'Live Now',
      highlight: 'Proving skill beats luck'
    },
    {
      phase: 'Phase 1',
      title: 'Multi-Game Ecosystem',
      status: 'upcoming',
      description:
        'Expanding into a comprehensive skill-based gaming platform with multiple competitive formats and real-value rewards.',
      features: [
        'ChessClash: Strategic PvP competitions',
        'Tournament system with brackets',
        'Enhanced leaderboards and rankings',
        'Real-money match options (USDT)',
        'Advanced player statistics and analytics'
      ],
      icon: <Users className="w-8 h-8" />,
      timeline: 'Q1 2025',
      highlight: 'Where strategy meets rewards'
    },
    {
      phase: 'Phase 2',
      title: 'Web3 Gaming Revolution',
      status: 'planned',
      description:
        'Full Web3 integration with blockchain-powered transparency, community governance, and creator economy features.',
      features: [
        'On-chain game results and verification',
        'Community-created tournaments',
        'Creator tools for custom game modes',
        'Decentralized leaderboards',
        'Cross-platform skill verification'
      ],
      icon: <Zap className="w-8 h-8" />,
      timeline: 'Q2-Q3 2025',
      highlight: 'Decentralized skill verification'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'upcoming':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Target className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'border-green-400/30 bg-green-400/10';
      case 'upcoming':
        return 'border-yellow-400/30 bg-yellow-400/10';
      default:
        return 'border-blue-400/30 bg-blue-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'current':
        return 'Live & Active';
      case 'upcoming':
        return 'In Development';
      default:
        return 'Planned';
    }
  };

  return (
    <section id="roadmap" className="py-20 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center px-6 py-3 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-6">
            <Rocket className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-yellow-400 font-semibold">The Journey Ahead</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Building the Future of <span className="text-yellow-400">Skill-Based Gaming</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our roadmap to revolutionizing Web3 gaming through fair competition, transparent mechanics, and skill-based rewards. 
            Each phase brings us closer to a gaming ecosystem where talent triumphs over spending.
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
                    <Shield className="w-4 h-4 text-yellow-400" />
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

        {/* Web3 Gaming Principles */}
        <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-12 animate-fade-in-up">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Our Web3 Gaming Principles
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Transparency</h4>
              <p className="text-sm text-gray-400">All game mechanics and outcomes are verifiable and fair</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Skill-Based</h4>
              <p className="text-sm text-gray-400">Success determined by knowledge and strategy, not spending</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Community-Driven</h4>
              <p className="text-sm text-gray-400">Player feedback shapes platform development and features</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Fair Competition</h4>
              <p className="text-sm text-gray-400">Equal opportunities for all players regardless of wallet size</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-slide-in-left">
          <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/20 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center space-x-2">
              <Gamepad2 className="w-6 h-6 text-yellow-400" />
              <span>Ready to Shape the Future?</span>
            </h3>
            <p className="text-gray-300 mb-6">
              Join the skill-based gaming revolution. Your feedback and participation help build the platform where talent truly matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/cryptoclash'}
                className="btn-primary"
              >
                Start Playing Now
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