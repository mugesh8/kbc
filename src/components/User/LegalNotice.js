import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileFooter from './MobileFooter';

const LegalNotice = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0 font-['Roboto','Helvetica','Arial',sans-serif]">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-2">
            Legal Notice / Terms of Use
          </h1>
          <p className="text-sm sm:text-base opacity-90">© 2025 Thulir Technology. All rights reserved.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="space-y-8 text-left">
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Intellectual Property</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              This digital directory platform, including its source code, design, features, and content, is the exclusive property of Thulir Technology.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">License to KBC</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              A whitelabel version of this platform has been licensed to Kongu Business Community (KBC) for their operational use. This license does not transfer any ownership or intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Restricted Use</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              No part of this website or its underlying technology may be copied, cloned, modified, distributed, or repurposed for any other client, community, or commercial purpose without the prior written consent of Thulir Technology.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Legal Protection</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Unauthorized duplication, imitation, or misuse of this website may constitute intellectual property infringement and will be pursued under applicable civil and criminal laws.
            </p>
          </section>
        </div>
      </div>

      <Footer />
      <MobileFooter />
    </div>
  );
};

export default LegalNotice;


