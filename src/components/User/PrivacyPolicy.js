import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileFooter from './MobileFooter';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0 font-['Roboto','Helvetica','Arial',sans-serif]">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base opacity-90">Effective Date: [Insert Date]</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="space-y-8 text-left">
          <section>
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
              <span className="font-semibold">Owner:</span> Thulir Technology
            </p>
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
              <span className="font-semibold">Licensed To:</span> Kongu Business Community (KBC)
            </p>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed mt-3">
              Thulir Technology ("we," "our," "us") is the exclusive owner of this business directory platform and has licensed its use to Kongu Business Community (KBC). This Privacy Policy explains how information is collected, managed, and protected through this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base">
              <li>
                <span className="font-semibold">Business Information:</span> Company name, contact details, industry category, and description submitted for directory listing.
              </li>
              <li>
                <span className="font-semibold">User Information:</span> Name, email address, phone number, and communications submitted through forms.
              </li>
              <li>
                <span className="font-semibold">Technical Data:</span> IP address, browser type, device information, and usage logs for security and performance.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">2. Ownership & Liability of Data</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              All business and personal data collected through this platform is the sole proprietorship and responsibility of KBC. KBC ensures that the data submitted is accurate, lawful, and obtained with consent where required. Thulir Technology, as the platform owner, does not claim ownership of the data but ensures it is hosted and processed securely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">3. How the Information Is Used</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base">
              <li>To display business listings in the directory.</li>
              <li>To verify and maintain listing accuracy.</li>
              <li>To communicate with users regarding inquiries, updates, or support.</li>
              <li>To improve website functionality and security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">4. Restrictions on Misuse</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Neither Thulir Technology nor KBC will use, sell, rent, or misuse the data collected. Information will not be repurposed for marketing or third-party distribution without explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">5. Data Sharing</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Data may only be shared with authorized service providers (for hosting, technical support, or security). Data may be disclosed if legally required under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">6. Data Protection</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Thulir Technology applies reasonable technical and organizational safeguards to protect against unauthorized access, misuse, or alteration. However, absolute security of Internet transmissions cannot be guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">7. User Rights</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base">
              <li>Businesses may request updates, corrections, or removal of their listings by contacting KBC.</li>
              <li>Users may request access to, or deletion of, their personal data where applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">8. Cookies & Tracking</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Cookies or similar technologies may be used to enhance user experience and analyze website traffic. Users may disable cookies in their browser settings, though some features may not function fully.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">9. Third-Party Links</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              This website may contain links to third-party websites. Thulir Technology and KBC are not responsible for the privacy practices of external sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">10. Updates to This Policy</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              This Privacy Policy may be updated from time to time. The latest version will always be published here with the effective date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">11. Contact Us</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white border rounded-xl p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Thulir Technology</h3>
                <p className="text-gray-700 text-sm sm:text-base">Email: [Insert Contact Email]</p>
                <p className="text-gray-700 text-sm sm:text-base">Phone: [Insert Contact Number]</p>
              </div>
              <div className="bg-white border rounded-xl p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Kongu Business Community (KBC)</h3>
                <p className="text-gray-700 text-sm sm:text-base">Email: [Insert Contact Email]</p>
                <p className="text-gray-700 text-sm sm:text-base">Phone: [Insert Contact Number]</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
      <MobileFooter />
    </div>
  );
};

export default PrivacyPolicy;


