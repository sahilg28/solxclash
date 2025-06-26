import React from 'react';
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
              <h1 className="text-4xl lg:text-5xl font-bold text-white">Terms & Conditions</h1>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 space-y-8">
            {/* Welcome */}
            <section>
              <div className="text-gray-300 space-y-4">
                <p>
                  Welcome to <span className="font-bold text-yellow-400">SolxClash</span>. By accessing or using our platform, games, or services (collectively, the "Service"), you agree to be bound by the following Terms and Conditions ("Terms"). Please read them carefully.
                </p>
              </div>
            </section>
            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  By using SolxClash, you confirm that you are at least 18 years old (or the legal age in your jurisdiction) and agree to comply with these Terms and our [Privacy Policy]. If you do not agree, do not use the Service.
                </p>
              </div>
            </section>
            {/* 2. Nature of the Service */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Nature of the Service</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is a skill-based Web3 gaming platform built on the Solana blockchain. We host real-time games like <span className="font-semibold text-yellow-400">CryptoClash</span> (a crypto price prediction game) and upcoming titles such as <span className="font-semibold text-yellow-400">ChessClash</span>. Our platform offers:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Web2/Web3 access via email or wallet login</li>
                  <li>Real-money match modes and free-to-play formats</li>
                  <li>Competitive leaderboards and upcoming tournaments</li>
                  <li>User progression and digital rewards</li>
                </ul>
                <p className="italic text-yellow-400">
                  SolxClash is not a financial platform, and none of our games constitute financial advice, trading tools, or investment products.
                </p>
              </div>
            </section>
            {/* 3. User Eligibility & Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Eligibility & Accounts</h2>
              <div className="text-gray-300 space-y-4">
                <p>To participate:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must register with accurate, updated information</li>
                  <li>You are responsible for safeguarding your login credentials</li>
                  <li>All activity under your account is your responsibility</li>
                  <li>You agree not to impersonate or misrepresent your identity</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these Terms.
                </p>
              </div>
            </section>
            {/* 4. Fair Play & Prohibited Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Fair Play & Prohibited Conduct</h2>
              <div className="text-gray-300 space-y-4">
                <p>You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Engage in fraud, collusion, or unfair gameplay</li>
                  <li>Exploit bugs, automation, or system vulnerabilities</li>
                  <li>Violate any applicable laws</li>
                  <li>Harass, threaten, or abuse other users</li>
                  <li>Upload malicious code, spam, or inappropriate content</li>
                </ul>
                <p>Use of bots or external scripts is strictly prohibited.</p>
              </div>
            </section>
            {/* 5. Real-Money Play & In-Game Currency */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Real-Money Play & In-Game Currency</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Where enabled, users may enter matches using <span className="font-semibold text-yellow-400">stablecoins (e.g., USDT on Solana)</span> for real rewards. SolxClash may also issue in-game currency or rewards (non-monetary) for participation.
                </p>
                <p>
                  All match fees, payouts, and prize mechanics will be transparently communicated per game.
                </p>
              </div>
            </section>
            {/* 6. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  All content, design, code, and branding on SolxClash are owned by SolxClash or its licensors. Users may not copy, reproduce, or use SolxClash assets without permission.
                </p>
                <p>
                  User-generated content submitted to SolxClash (game replays, usernames, leaderboard names, etc.) may be used for promotional or community purposes.
                </p>
              </div>
            </section>
            {/* 7. Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimers</h2>
              <div className="text-gray-300 space-y-4">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>SolxClash is provided "as is"</li>
                  <li>We do not guarantee uninterrupted service, accuracy, or earnings</li>
                  <li>Participation in games involves risk; we are not liable for losses</li>
                </ul>
              </div>
            </section>
            {/* 8. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  To the maximum extent allowed by law, SolxClash and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising from use of the platform.
                </p>
              </div>
            </section>
            {/* 9. Termination */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We reserve the right to terminate or restrict access to the platform at any time, with or without notice, for violations of these Terms or other harmful behavior.
                </p>
              </div>
            </section>
            {/* 10. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update these Terms occasionally. If changes are material, we will notify users via our platform or social channels. Continued use of the Service implies acceptance of the revised Terms.
                </p>
              </div>
            </section>
            {/* 11. Legal Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Legal Compliance</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Users are responsible for ensuring that using SolxClash is legal in their jurisdiction. You agree to comply with all applicable laws, including taxes, if you earn from gameplay.
                </p>
              </div>
            </section>
            {/* 12. Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  For support, inquiries, or legal questions, reach out via our official social channels.
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