import React from "react";
import { useLocation } from 'react-router-dom';
import Header from "./Header";
import Footer from "./Footer";
import MobileFooter from './MobileFooter';

const TermsAndConditions = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isEmbedded = searchParams.get('embed') === '1';
  return (
    <div className={`min-h-screen bg-gray-50 ${isEmbedded ? '' : 'pb-20 lg:pb-0'} font-['Roboto','Helvetica','Arial',sans-serif]`}>
      {!isEmbedded && <Header />}

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-2">
            Terms & Conditions for Signup
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16 text-left">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">1. Platform Ownership</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              This business directory platform is owned by Thulir Technology and licensed to Kongu Business Community (KBC) for operation and management.
            </p>
          </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">2. Information You Provide</h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            During signup, you may provide personal, family, and business information, including but not limited to name, email, phone number, business details, and related data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">3. Consent to Use of Data</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base">
            <li>Grant KBC the right to collect, store, and display your data as part of the business directory.</li>
            <li>Consent to be contacted by KBC or its authorized representatives for purposes related to directory services, networking, and communication.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">4. Data Ownership & Responsibility</h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            All submitted data remains under the responsibility of KBC as the licensee. Thulir Technology, as the platform provider, does not claim ownership of your data and ensures it is hosted securely.
          </p>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">5. No Misuse of Data</h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            Neither KBC nor Thulir Technology will sell, rent, or misuse your information for unrelated purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">6. Accuracy of Information</h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            You are responsible for ensuring that the information provided is accurate, lawful, and up to date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">7. Opt-Out & Removal</h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            You may request modification or deletion of your information at any time by contacting KBC.
          </p>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">8. Acceptance</h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            By checking the box and completing signup, you confirm that you have read and agreed to these Terms & Conditions.
          </p>
          <div className="mt-4 bg-white border rounded-xl p-4 text-sm text-gray-700">
            [ ] I agree to the Terms & Conditions and consent to my information being used by KBC for the business directory.
          </div>
        </section>
        </div>
      </div>

      {!isEmbedded && <Footer />}
      {!isEmbedded && <MobileFooter />}
    </div>
  );
};

export default TermsAndConditions;


