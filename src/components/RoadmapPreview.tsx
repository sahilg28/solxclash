import React from 'react';
import { Rocket, Users, Zap, ArrowRight, CheckCircle, Clock } from 'lucide-react';

const RoadmapPreview = () => {
  const phases = [
    {
      phase: 'Phase 0',
      title: 'Prototype Foundation',
      status: 'current',
      description:
        'The foundational version of SolxClash — built to validate gameplay, product flow, and user experience.',
      features: [
        'CryptoClash demo (free-to-play)',
        'Landing page with waitlist',
        'Web2 login with Web3-ready backend',
        'Initial flow and design system'
      ],
      icon: <Rocket className="w-8 h-8" />,
      timeline: 'Ongoing',
    },
    {
      phase: 'Phase 1',
      title: 'MVP Launch – Real Gameplay',
      status: 'upcoming',
      description:
        'Real-money gameplay across two skill-based games — CryptoClash and ChessClash — where your wins matter.',
      features: [
        '1v1 matches in CryptoClash & ChessClash',
        'Wallet & social login system',
        'USDT-based match entry and prize logic',
        'Leaderboards and free & paid formats',
      ],
      icon: <Users className="w-8 h-8" />,
      timeline: 'Coming Soon',
    },
    {
      phase: 'Phase 2',
      title: 'Platform Expansion',
      status: 'planned',
      description:
        'SolxClash becomes a full-scale, creator-powered gaming platform where communities compete and grow.',
      features: [
        'Multiple skill-based games',
        'Optimized mobile-first gameplay',
        'Smart contract–powered leaderboard system',
        'Creator tools and community competitions',
      ],
      icon: <Zap className="w-8 h-8" />,
      timeline: 'Planned',
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'upcoming':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'border-green-400/30 bg-green-400/10';
      case 'upcoming':
        return 'border-yellow-400/30 bg-yellow-400/10';
      default:
        return 'border-gray-600/30 bg-gray-600/10';
    }
  };

  return (
    <section id="roadmap" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            What's <span className="text-yellow-400">Coming</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our roadmap to building the ultimate Web3 gaming platform. Each phase brings new ways to play, compete, and earn.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {phases.map((phase, index) => (
            <div
              key={phase.phase}
              className={`relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border rounded-2xl p-8 hover:scale-105 transition-transform duration-300 ${getStatusColor(phase.status)}`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                {getStatusIcon(phase.status)}
                <span className="text-sm font-medium text-gray-300 capitalize">{phase.status}</span>
              </div>

              {/* Phase Header */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-4 text-yellow-400">
                  {phase.icon}
                </div>
                <div className="text-sm font-semibold text-yellow-400 mb-2">{phase.phase}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{phase.title}</h3>
                <p className="text-gray-300 leading-relaxed">{phase.description}</p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Highlights</h4>
                <ul className="space-y-2">
                  {phase.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">{phase.timeline}</div>
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

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Want to Shape the Future of Web3 Gaming?
            </h3>
            <p className="text-gray-300">
              Follow us on X and be the first to discover updates, drops, and exclusive features.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapPreview;