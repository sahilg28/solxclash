import React from 'react';
import { AlertTriangle, Info, Shield, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <AlertTriangle className="w-12 h-12 text-orange-400" />
              <h1 className="text-4xl lg:text-5xl font-bold text-white">Disclaimer</h1>
            </div>
            <p className="text-xl text-gray-300">
              Important information about using SolxClash
            </p>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 space-y-8">
            
            {/* General Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Info className="w-6 h-6 text-blue-400" />
                <span>1. General Disclaimer</span>
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  The information contained on SolxClash website and platform is for general information purposes only. 
                  While we endeavor to keep the information up to date and correct, we make no representations or warranties 
                  of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability 
                  with respect to the website or the information, products, services, or related graphics contained on the 
                  website for any purpose.
                </p>
                <p>
                  Any reliance you place on such information is therefore strictly at your own risk. In no event will we be 
                  liable for any loss or damage including without limitation, indirect or consequential loss or damage, or 
                  any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, 
                  the use of this website.
                </p>
              </div>
            </section>

            {/* Not Financial Advice */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-red-400" />
                <span>2. Not Financial Advice</span>
              </h2>
              <div className="text-gray-300 space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 font-semibold mb-2">IMPORTANT NOTICE:</p>
                  <p>
                    SolxClash is a skill-based gaming platform and NOT a financial advisory service. Nothing on this platform 
                    constitutes financial, investment, trading, or other professional advice.
                  </p>
                </div>
                <p>
                  The cryptocurrency price prediction games on our platform are for entertainment and skill-testing purposes 
                  only. They should not be considered as:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Investment advice or recommendations</li>
                  <li>Financial planning guidance</li>
                  <li>Trading strategies or signals</li>
                  <li>Professional financial consultation</li>
                  <li>Predictions of actual market movements</li>
                </ul>
                <p>
                  Always consult with qualified financial professionals before making any investment decisions. Past 
                  performance in our games does not indicate future results in real cryptocurrency markets.
                </p>
              </div>
            </section>

            {/* Gaming and Entertainment */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Gaming and Entertainment Purpose</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is designed as a skill-based gaming platform for entertainment purposes. Our games are intended to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide educational entertainment about cryptocurrency markets</li>
                  <li>Test and improve market analysis skills</li>
                  <li>Foster a competitive gaming community</li>
                  <li>Reward skill and knowledge through our XP system</li>
                </ul>
                <p>
                  Participation in our games should be viewed as entertainment spending, similar to other forms of gaming 
                  or recreational activities. Only participate with amounts you can afford to lose.
                </p>
              </div>
            </section>

            {/* Risk Warnings */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                <span>4. Risk Warnings</span>
              </h2>
              <div className="text-gray-300 space-y-4">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <p className="text-orange-400 font-semibold mb-2">RISK WARNING:</p>
                  <p>
                    Cryptocurrency markets are highly volatile and unpredictable. Gaming activities on SolxClash involve 
                    risk and may result in loss of XP or other in-game assets.
                  </p>
                </div>
                <p>Key risks include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Market Volatility:</strong> Cryptocurrency prices can change rapidly and unpredictably</li>
                  <li><strong>Gaming Risk:</strong> Incorrect predictions may result in loss of XP or game assets</li>
                  <li><strong>Technical Risk:</strong> Platform downtime or technical issues may affect gameplay</li>
                  <li><strong>Regulatory Risk:</strong> Changes in laws or regulations may affect platform availability</li>
                  <li><strong>Addiction Risk:</strong> Gaming can be addictive; please play responsibly</li>
                </ul>
              </div>
            </section>

            {/* Age Restrictions */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Age Restrictions</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash is intended for users who are 18 years of age or older. By using our platform, you represent 
                  and warrant that you are at least 18 years old and have the legal capacity to enter into agreements.
                </p>
                <p>
                  If you are under 18, you are not permitted to use our services. We reserve the right to verify age and 
                  terminate accounts that do not meet our age requirements.
                </p>
              </div>
            </section>

            {/* Jurisdiction and Legal Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Jurisdiction and Legal Compliance</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  It is your responsibility to ensure that your use of SolxClash complies with all applicable laws and 
                  regulations in your jurisdiction. Some jurisdictions may have restrictions on:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Online gaming activities</li>
                  <li>Cryptocurrency-related services</li>
                  <li>Skill-based gaming platforms</li>
                  <li>Cross-border digital services</li>
                </ul>
                <p>
                  If our services are not legal in your jurisdiction, you must not use them. We do not provide legal advice 
                  and recommend consulting with local legal professionals if you have questions about the legality of our 
                  services in your area.
                </p>
              </div>
            </section>

            {/* Platform Availability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Platform Availability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We strive to maintain high platform availability, but we cannot guarantee uninterrupted service. 
                  The platform may be temporarily unavailable due to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Scheduled maintenance and updates</li>
                  <li>Technical difficulties or server issues</li>
                  <li>Third-party service disruptions</li>
                  <li>Force majeure events</li>
                  <li>Legal or regulatory requirements</li>
                </ul>
                <p>
                  We are not liable for any losses or damages resulting from platform downtime or service interruptions.
                </p>
              </div>
            </section>

            {/* Data and Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-400" />
                <span>8. Data and Privacy</span>
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  While we implement security measures to protect your data, no system is completely secure. By using our 
                  platform, you acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Data transmission over the internet carries inherent risks</li>
                  <li>We cannot guarantee absolute security of your information</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You should review our Privacy Policy for detailed information about data handling</li>
                </ul>
              </div>
            </section>

            {/* Responsible Gaming */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Responsible Gaming</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We encourage responsible gaming practices. Please:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Set limits on your gaming time and spending</li>
                  <li>Never chase losses or play beyond your means</li>
                  <li>Take regular breaks from gaming activities</li>
                  <li>Seek help if you feel your gaming is becoming problematic</li>
                  <li>Remember that gaming should be fun and entertaining</li>
                </ul>
                <p>
                  If you believe you may have a gaming problem, please seek help from appropriate support organizations 
                  in your area.
                </p>
              </div>
            </section>

            {/* Changes to Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Disclaimer</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We reserve the right to modify this disclaimer at any time. Changes will be effective immediately upon 
                  posting on our website. Your continued use of the platform after any changes constitutes acceptance of 
                  the updated disclaimer.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about this disclaimer or need clarification on any points, please contact us 
                  through our official channels or reach out via our social media platforms.
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

export default DisclaimerPage;