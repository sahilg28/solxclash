import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-white">Privacy Policy</h1>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, share, and safeguard your information when you interact with our platform.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  By using SolxClash's platform or services, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with the terms, please discontinue use.
                </p>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              <div className="text-gray-300 space-y-4">
                <h3 className="text-xl font-semibold text-white">a. Personal Data</h3>
                <p>We collect the following user-provided data:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and username</li>
                  <li>Email address</li>
                  <li>Country/location (optional)</li>
                  <li>Profile image (if using social or Google login)</li>
                  <li>Game participation and performance history</li>
                </ul>
                <h3 className="text-xl font-semibold text-white mt-6">b. Usage Data</h3>
                <p>We collect data automatically when you interact with the platform:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>IP address and device type</li>
                  <li>Browser type, operating system</li>
                  <li>Pages visited, buttons clicked, and time spent</li>
                  <li>Game statistics and performance metrics</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>We use collected data to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Operate and manage the platform</li>
                  <li>Facilitate user account management and gameplay</li>
                  <li>Improve user experience and platform performance</li>
                  <li>Communicate updates, support responses, or promotional content</li>
                  <li>Prevent fraud and ensure fair play</li>
                  <li>Fulfill legal or regulatory requirements</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Sharing Your Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>We do not sell your data. We may share your data with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Service providers (e.g., hosting, analytics, email delivery, auth services)</li>
                  <li>Legal entities if required by law, court order, or government request</li>
                  <li>Business partners or buyers in the event of a platform sale or merger</li>
                  <li>With your consent, for features or promotions that require it</li>
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Security Measures</h2>
              <div className="text-gray-300 space-y-4">
                <p>We employ safeguards to protect your information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encrypted data transmission</li>
                  <li>Secured cloud infrastructure</li>
                  <li>Authentication and access control</li>
                  <li>Regular security patches and audits</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
              <div className="text-gray-300 space-y-4">
                <p>We keep your personal data for as long as needed to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Operate our services</li>
                  <li>Comply with legal or tax obligations</li>
                  <li>Resolve disputes</li>
                </ul>
                <p>Once data is no longer needed, we securely delete or anonymize it.</p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Privacy Rights</h2>
              <div className="text-gray-300 space-y-4">
                <p>Depending on your location, you may have rights to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access or receive a copy of your data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion</li>
                  <li>Restrict or object to processing</li>
                </ul>
                <p>Contact us at [Insert Contact Email] to submit a request.</p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Cookies and Tracking Technologies</h2>
              <div className="text-gray-300 space-y-4">
                <p>We use cookies to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remember preferences</li>
                  <li>Track traffic and engagement</li>
                  <li>Optimize platform performance</li>
                </ul>
                <p>You may disable cookies via your browser settings, but this may affect platform functionality.</p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Tools & Services</h2>
              <div className="text-gray-300 space-y-4">
                <p>SolxClash integrates third-party services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Google/Email for sign-up/login</li>
                  <li>Analytics for performance and engagement tracking</li>
                  <li>Blockchain (Solana) for wallet and transaction interaction</li>
                </ul>
                <p>Each third party maintains its own privacy practices. Review their policies before engaging with their services.</p>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
              <div className="text-gray-300 space-y-4">
                <p>Our platform is not intended for users under the age of 13. If we learn we've collected data from a minor, we will promptly delete it.</p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Updates to This Policy</h2>
              <div className="text-gray-300 space-y-4">
                <p>We may revise this policy. Updates will be posted here and reflected with a new "Effective Date."</p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
              <div className="text-gray-300 space-y-4">
                <p>Have questions? Reach out through our official channels.</p>
              </div>
            </section>

          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPage;