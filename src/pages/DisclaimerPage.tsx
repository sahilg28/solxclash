import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white">General Disclaimer</h1>
          </div>
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 space-y-8">
            <section>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is a skill-based Web3 gaming platform designed for entertainment purposes. The information provided on our website, platform, and communications is for general use only. While we strive to ensure accuracy and reliability, we make no guarantees regarding completeness, correctness, or suitability for any particular purpose.
                </p>
                <p>
                  Your use of the platform is at your own risk. SolxClash, its affiliates, and its team will not be liable for any loss or damage arising from the use or reliance on our content, services, or games.
                </p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Not Financial Advice</h2>
              <div className="text-gray-300 space-y-4">
                <p>Important: SolxClash does not offer financial, trading, or investment advice. Any in-game price prediction or virtual outcome is for entertainment and should not be interpreted as real-world financial guidance.</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We are not a trading platform.</li>
                  <li>We do not facilitate crypto investments or profit guarantees.</li>
                  <li>Participation in CryptoClash or other games should not be seen as a substitute for financial strategy or planning.</li>
                  <li>Always consult a licensed professional before making investment decisions.</li>
                </ul>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Gaming & Entertainment Purpose</h2>
              <div className="text-gray-300 space-y-4">
                <p>Our games are designed to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encourage users to engage with market data playfully</li>
                  <li>Promote strategic thinking and skill-building</li>
                  <li>Offer competitive, fun experiences</li>
                </ul>
                <p>Participation should be treated like any form of recreational entertainment. You should only engage if you are comfortable with the outcomes and understand that any in-game progression or loss does not reflect actual market behavior.</p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Risk Awareness</h2>
              <div className="text-gray-300 space-y-4">
                <p>Risks include but are not limited to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Unpredictable market movements</li>
                  <li>Game outcome losses (e.g., XP or game assets)</li>
                  <li>Possible system outages or technical errors</li>
                  <li>Regulatory uncertainty or jurisdictional restrictions</li>
                  <li>The potential for compulsive or excessive gaming behavior</li>
                </ul>
                <p>Please play responsibly. Set your limits and prioritize well-being.</p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Age Requirement</h2>
              <div className="text-gray-300 space-y-4">
                <p>SolxClash is intended only for individuals aged 18 years or older. By using our services, you confirm that you meet this age requirement. Users under 18 are not permitted to register or engage with our platform.</p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Jurisdiction & Legal Compliance</h2>
              <div className="text-gray-300 space-y-4">
                <p>You are solely responsible for ensuring that your use of SolxClash is legal in your jurisdiction. We do not offer services in regions where such platforms are restricted by law.</p>
                <p>We recommend seeking local legal advice if you are uncertain about your rights or obligations.</p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Platform Availability</h2>
              <div className="text-gray-300 space-y-4">
                <p>While we aim to maintain uptime, we cannot guarantee uninterrupted access. Factors like maintenance, system updates, technical issues, or force majeure may temporarily disrupt services. SolxClash is not liable for downtime losses.</p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Privacy & Data</h2>
              <div className="text-gray-300 space-y-4">
                <p>Your use of our platform is also subject to our <a href="/privacy" className="text-yellow-400 underline">Privacy Policy</a>. We do our best to protect your data but cannot guarantee absolute security over the internet.</p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Responsible Use</h2>
              <div className="text-gray-300 space-y-4">
                <p>SolxClash encourages users to play responsibly:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Don't overspend or chase losses</li>
                  <li>Take breaks</li>
                  <li>Seek help if gaming affects your well-being</li>
                </ul>
                <p>If you or someone you know is struggling with gaming habits, we encourage contacting support organizations in your region.</p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Disclaimer Changes</h2>
              <div className="text-gray-300 space-y-4">
                <p>We may update this Disclaimer at any time. Continued use of SolxClash after changes implies acceptance of the new terms.</p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contact</h2>
              <div className="text-gray-300 space-y-4">
                <p>Questions about this disclaimer? Reach out to us through our official channels.</p>
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