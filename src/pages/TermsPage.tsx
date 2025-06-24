import React from 'react';
import { FileText, Shield, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <FileText className="w-12 h-12 text-yellow-400" />
              <h1 className="text-4xl lg:text-5xl font-bold text-white">Terms of Service</h1>
            </div>
            <p className="text-xl text-gray-300">
              Last updated: January 2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-400" />
                <span>1. Introduction</span>
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Welcome to SolxClash ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our website, 
                  platform, and services (collectively, the "Service") operated by SolxClash.
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of 
                  these terms, then you may not access the Service.
                </p>
              </div>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Acceptance of Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  By creating an account or using SolxClash, you acknowledge that you have read, understood, and agree to be 
                  bound by these Terms and our Privacy Policy. These Terms apply to all visitors, users, and others who access 
                  or use the Service.
                </p>
              </div>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Description of Service</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is a skill-based Web3 gaming platform that allows users to participate in cryptocurrency price 
                  prediction games. Our platform includes features such as:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Real-time cryptocurrency price prediction games</li>
                  <li>XP-based reward system</li>
                  <li>Leaderboards and competitive rankings</li>
                  <li>User profiles and statistics tracking</li>
                  <li>Community features and social interactions</li>
                </ul>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. User Accounts</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </div>
            </section>

            {/* Prohibited Uses */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <span>5. Prohibited Uses</span>
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>You may not use our Service:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                  <li>To upload or transmit viruses or any other type of malicious code</li>
                  <li>To collect or track personal information of others</li>
                  <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                  <li>For any obscene or immoral purpose</li>
                  <li>To interfere with or circumvent security features of the Service</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property Rights</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  The Service and its original content, features, and functionality are and will remain the exclusive property 
                  of SolxClash and its licensors. The Service is protected by copyright, trademark, and other laws. Our 
                  trademarks and trade dress may not be used in connection with any product or service without our prior 
                  written consent.
                </p>
              </div>
            </section>

            {/* User Content */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. User Content</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our Service may allow you to post, link, store, share and otherwise make available certain information, 
                  text, graphics, videos, or other material ("Content"). You are responsible for Content that you post to 
                  the Service, including its legality, reliability, and appropriateness.
                </p>
                <p>
                  By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, 
                  publicly display, reproduce, and distribute such Content on and through the Service.
                </p>
              </div>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, 
                  this Company excludes all representations, warranties, conditions and terms whether express or implied, 
                  statutory or otherwise.
                </p>
                <p>
                  SolxClash is a skill-based gaming platform and not a financial service. Participation in our games should 
                  not be considered as financial advice or investment guidance.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  In no event shall SolxClash, nor its directors, employees, partners, agents, suppliers, or affiliates, be 
                  liable for any indirect, incidental, special, consequential, or punitive damages, including without 
                  limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of 
                  the Service.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice 
                  or liability, under our sole discretion, for any reason whatsoever and without limitation, including but 
                  not limited to a breach of the Terms.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision 
                  is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please contact us through our official channels 
                  or reach out via our social media platforms.
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

export default TermsPage;