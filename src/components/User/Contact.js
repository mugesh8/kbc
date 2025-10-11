import React from "react";
import { Mail, Phone, MapPin } from 'lucide-react';
import Header from "./Header";
import Footer from "./Footer";
import MobileFooter from './MobileFooter';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0 font-['Roboto','Helvetica','Arial',sans-serif]">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            {/* Icon above heading - same as About Page */}
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
              Contact Us
            </h1>
            <p className="text-green-100 text-base sm:text-lg">
              We're here to help! Reach out with any questions or feedback
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        {/* Contact Cards */}
        <div className="grid gap-6 mb-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {/* Email */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-center border">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Email Us</h3>
            <p className="text-gray-600 text-sm mb-4">admin@kbcmembers.org</p>
            <button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 text-sm font-medium transition">
              Send Email
            </button>
          </div>

          {/* Call */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-center border">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Call Us</h3>
            <p className="text-gray-600 text-sm">7305056436</p>
            <p className="text-xs text-gray-500 mb-3">Mon-Fri: 9AM-6PM PST</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-sm font-medium transition">
              Call Now
            </button>
          </div>

          {/* Visit */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-center border">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Visit Us</h3>
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
                className="inline-block w-full"
              >
                Get Directions
              </a>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Full Name *"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email Address *"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Subject *"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <textarea
              placeholder="Message *"
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-base min-h-[120px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-3 font-medium transition"
            >
              Send Message
            </button>
            <p className="text-sm text-gray-500 mt-2">
              We'll get back to you within 24 hours
            </p>
          </form>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 md:grid-cols-[1fr,300px] max-w-4xl mx-auto">
          {/* Social */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Connect With Us</h3>
            <div className="flex flex-wrap gap-3">
              <button className="bg-[#1877F2] hover:bg-[#1664D9] text-white rounded-full px-5 py-2 text-sm font-medium transition">
                Facebook
              </button>
              <button className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white rounded-full px-5 py-2 text-sm font-medium transition">
                Twitter
              </button>
              <button className="bg-[#0077B5] hover:bg-[#00669C] text-white rounded-full px-5 py-2 text-sm font-medium transition">
                LinkedIn
              </button>
              <button className="bg-[#E1306C] hover:bg-[#C12158] text-white rounded-full px-5 py-2 text-sm font-medium transition">
                Instagram
              </button>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-xl shadow-sm border p-6 text-sm text-gray-700">
            <h3 className="font-bold mb-3 text-base text-gray-900">Business Hours</h3>
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