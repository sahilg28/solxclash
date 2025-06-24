import React from 'react';
import { Code, Heart, Zap, Target, Users, Rocket } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              About <span className="text-yellow-400">SolxClash</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The journey of building the ultimate Web3 gaming platform, one prediction at a time.
            </p>
          </div>

          {/* Story Section */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Heart className="w-8 h-8 text-red-400" />
              <h2 className="text-3xl font-bold text-white">The Story</h2>
            </div>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                SolxClash was born from a simple belief: gaming should reward skill, not just luck. 
                As a solo developer passionate about both Web3 technology and competitive gaming, 
                I set out to create something that bridges the gap between traditional gaming and 
                the decentralized future.
              </p>
              
              <p>
                What started as a weekend project quickly evolved into a comprehensive platform 
                where players can test their market intuition, compete with others worldwide, 
                and earn real rewards for their skills. Every line of code, every design decision, 
                and every feature has been crafted with one goal in mind: creating the most 
                engaging and fair gaming experience possible.
              </p>
              
              <p>
                SolxClash isn't just another crypto game—it's a skill-based platform that respects 
                your time, rewards your knowledge, and builds a community of like-minded players 
                who believe in the power of decentralized gaming.
              </p>
            </div>
          </div>

          {/* Developer Section */}
          <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Code className="w-8 h-8 text-blue-400" />
              <h2 className="text-3xl font-bold text-white">Solo Developer Journey</h2>
            </div>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                Hi, I'm Sahil Gupta, the creator behind SolxClash. As a full-stack developer 
                with a passion for blockchain technology, I've been working tirelessly to bring 
                this vision to life. From the initial concept to the live platform you see today, 
                every aspect has been designed and developed with meticulous attention to detail.
              </p>
              
              <p>
                Building SolxClash as a solo developer has been both challenging and incredibly 
                rewarding. It's allowed me to maintain a clear vision while ensuring every feature 
                serves the community's best interests. The platform leverages cutting-edge 
                technologies including React, Supabase, and Solana blockchain to deliver a 
                seamless gaming experience.
              </p>
              
              <p>
                Follow my journey and connect with me on{' '}
                <a 
                  href="https://x.com/sahilgupta_as" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                >
                  X (Twitter)
                </a>
                {' '}where I share updates, insights, and the behind-the-scenes development process.
              </p>
            </div>
          </div>

          {/* What is SolxClash */}
          <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">What is SolxClash?</h2>
            </div>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                SolxClash is a skill-based Web3 gaming platform that combines the excitement 
                of crypto market predictions with competitive gaming mechanics. Our flagship 
                game, CryptoClash, challenges players to predict short-term price movements 
                of major cryptocurrencies like Bitcoin, Ethereum, and Solana.
              </p>
              
              <p>
                Unlike traditional gambling platforms, SolxClash rewards knowledge, strategy, 
                and market understanding. Players earn XP for correct predictions, climb 
                leaderboards, and build daily play streaks that unlock bonus rewards. 
                The platform is designed to be educational, engaging, and fair for all participants.
              </p>
              
              <p>
                Built on the Solana blockchain for its speed and low transaction costs, 
                SolxClash represents the future of gaming where players truly own their 
                achievements and can earn real value for their skills.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Skill-Based Gaming</h3>
              </div>
              <p className="text-gray-300">
                Success depends on market knowledge and strategy, not luck. 
                Analyze trends, make informed predictions, and climb the rankings.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Community Driven</h3>
              </div>
              <p className="text-gray-300">
                Join a growing community of crypto enthusiasts and gamers. 
                Compete, learn, and grow together in a supportive environment.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Real-Time Action</h3>
              </div>
              <p className="text-gray-300">
                Experience the thrill of live crypto price movements with 
                60-second prediction rounds and instant results.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Rocket className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Web3 Future</h3>
              </div>
              <p className="text-gray-300">
                Built for the decentralized future with Solana integration, 
                true ownership, and transparent, fair gameplay mechanics.
              </p>
            </div>
          </div>

          {/* Vision Section */}
          <div className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 border border-yellow-400/20 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              To create the most engaging and fair Web3 gaming ecosystem where skill is rewarded, 
              community thrives, and every player has the opportunity to learn, compete, and earn 
              in the decentralized future of gaming.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;