import React from 'react';
import { Shield, Eye, Lock, Database } from 'lucide-react';
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
              <Shield className="w-12 h-12 text-green-400" />
              <h1 className="text-4xl lg:text-5xl font-bold text-white">Privacy Policy</h1>
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
                <Eye className="w-6 h-6 text-blue-400" />
                <span>1. Introduction</span>
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  SolxClash ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how 
                  we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
                <p>
                  Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, 
                  please do not access the site or use our services.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Database className="w-6 h-6 text-yellow-400" />
                <span>2. Information We Collect</span>
              </h2>
              <div className="text-gray-300 space-y-4">
                <h3 className="text-xl font-semibold text-white">Personal Data</h3>
                <p>
                  We may collect personally identifiable information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Register for an account</li>
                  <li>Use our gaming services</li>
                  <li>Contact us with inquiries</li>
                  <li>Subscribe to our newsletter or marketing communications</li>
                </ul>
                
                <p>This information may include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and username</li>
                  <li>Email address</li>
                  <li>Profile picture (if provided via Google authentication)</li>
                  <li>Country/location (optional)</li>
                  <li>Gaming statistics and preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">Usage Data</h3>
                <p>
                  We automatically collect certain information when you visit, use, or navigate our platform:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Log and usage data (IP address, browser type, operating system)</li>
                  <li>Device information</li>
                  <li>Game performance and statistics</li>
                  <li>Time and date of visits</li>
                  <li>Pages viewed and actions taken</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, operate, and maintain our services</li>
                  <li>Improve, personalize, and expand our platform</li>
                  <li>Process your transactions and manage your account</li>
                  <li>Communicate with you about updates, security alerts, and support</li>
                  <li>Send you marketing and promotional communications (with your consent)</li>
                  <li>Analyze usage patterns to improve user experience</li>
                  <li>Prevent fraud and enhance security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. How We Share Your Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                  except in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
                  <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Consent:</strong> We may share information with your explicit consent</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Lock className="w-6 h-6 text-green-400" />
                <span>5. Data Security</span>
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure hosting infrastructure</li>
                </ul>
                <p>
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive 
                  to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined in this 
                  Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need 
                  your personal information, we will securely delete or anonymize it.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Privacy Rights</h2>
              <div className="text-gray-300 space-y-4">
                <p>Depending on your location, you may have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your information in a structured format</li>
                  <li><strong>Objection:</strong> Object to certain processing of your information</li>
                  <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances</li>
                </ul>
                <p>
                  To exercise these rights, please contact us through our official channels. We will respond to your request 
                  within a reasonable timeframe and in accordance with applicable law.
                </p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Cookies and Tracking Technologies</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are 
                  small data files stored on your device that help us:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze site traffic and usage patterns</li>
                  <li>Provide personalized content and features</li>
                  <li>Improve our services and user experience</li>
                </ul>
                <p>
                  You can control cookie settings through your browser preferences. However, disabling cookies may affect 
                  the functionality of our platform.
                </p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Services</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our platform may integrate with third-party services such as:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Google Authentication for account creation and login</li>
                  <li>Analytics services to understand user behavior</li>
                  <li>Payment processors for transactions</li>
                  <li>Blockchain networks for Web3 functionality</li>
                </ul>
                <p>
                  These third-party services have their own privacy policies. We encourage you to review their privacy 
                  practices before using their services.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our services are not intended for children under the age of 13. We do not knowingly collect personal 
                  information from children under 13. If you are a parent or guardian and believe your child has provided 
                  us with personal information, please contact us so we can delete such information.
                </p>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Privacy Policy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                  new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this 
                  Privacy Policy periodically for any changes.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us through 
                  our official channels or reach out via our social media platforms.
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

export default PrivacyPage;