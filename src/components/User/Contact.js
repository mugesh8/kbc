import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileFooter from './MobileFooter';

const Contact = () => {
  return (
    <div className="min-h-screen font-['Roboto','Helvetica','Arial',sans-serif]">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Get In Touch</h1>
          <p className="text-lg text-gray-600 mb-4">
            We're here to help! Reach out with any questions or feedback
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid gap-6 mb-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {/* Email */}
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <h3 className="font-bold text-lg mb-2">Email Us</h3>
            <p className="text-gray-600 text-sm mb-4">admin@kbcmembers.org
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 text-sm font-medium transition">
              Send Email
            </button>
          </div>

          {/* Call */}
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <h3 className="font-bold text-lg mb-2">Call Us</h3>
            <p className="text-gray-600 text-sm">7305056436</p>
            <p className="text-xs text-gray-500 mb-3">Mon-Fri: 9AM-6PM PST</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-sm font-medium transition">
              Call Now
            </button>
          </div>

          {/* Visit */}
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <h3 className="font-bold text-lg mb-2">Visit Us</h3>
            <p className="text-gray-600 text-sm mb-4 text-center">
              Kongu Business Community,<br />
              NammaOffice,<br />
              3rd Floor, Balaji Towers,<br />
              Seerangapalayam, Salem-636007
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2 text-sm font-medium transition">

              <a
                href="https://maps.google.com/?q=3rd Floor, Balaji Towers, Seerangapalayam, Salem-636007"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-600 transition-colors"
              >
                Get Directions
              </a>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Full Name *"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="email"
              placeholder="Email Address *"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Subject *"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="Message *"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-base min-h-[120px] focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-3 font-medium transition"
            >
              Send Message
            </button>
            <p className="text-sm text-gray-500 mt-2">
              We’ll get back to you within 24 hours
            </p>
          </form>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 md:grid-cols-[1fr,300px] max-w-4xl mx-auto">
          {/* Social */}
          <div>
            <h3 className="text-xl font-bold mb-3">Connect With Us</h3>
            <div className="flex flex-wrap gap-3">
              <button className="bg-[#1877F2] text-white rounded-full px-5 py-2 text-sm font-medium">
                Facebook
              </button>
              <button className="bg-[#1DA1F2] text-white rounded-full px-5 py-2 text-sm font-medium">
                Twitter
              </button>
              <button className="bg-[#0077B5] text-white rounded-full px-5 py-2 text-sm font-medium">
                LinkedIn
              </button>
              <button className="bg-[#E1306C] text-white rounded-full px-5 py-2 text-sm font-medium">
                Instagram
              </button>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-xl shadow-md p-6 text-sm text-gray-700">
            <h3 className="font-bold mb-3 text-base">Business Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p>Saturday: 10:00 AM - 4:00 PM</p>
            <p>Sunday: Closed</p>
            <p className="text-xs text-gray-500 mt-2">
              *All times Pacific Standard Time <br />
              Emergency support available 24/7
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <MobileFooter />
    </div>
  );
};

export default Contact;
