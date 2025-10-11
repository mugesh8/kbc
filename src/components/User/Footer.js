import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const KBCDirectoryFooter = () => {
  return (
    <footer className="hidden lg:block bg-slate-800 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Company Info Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className=" flex items-center justify-center mr-4">
                <img
                  src="/image.png"
                  alt="profile"
                  className="rounded-full  object-cover"
                />

              </div>
              <div>
                <h2 className="text-white text-xl font-bold italic text-left">KBC Directory</h2>
                <p className="text-sm text-gray-400 text-left whitespace-nowrap truncate">Your trusted local business directory</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 ml-12 text-sm leading-relaxed text-justify">
              The Kongu Business Community (KBC) is a collective of entrepreneurs, professionals, and visionaries united by a single purpose – to empower Kongu through business, collaboration, and innovation. Rooted in tradition and driven by modern enterprise, KBC is not just a network, but a movement that brings together Konguprenuers to grow, connect, and create extraordinary outcomes.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3 ml-12">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 hover:scale-110">
                <Facebook size={18} className="text-white fill-current" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-black transition-all duration-200 hover:scale-110">
                <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 transition-all duration-200 hover:scale-110">
                <Instagram size={18} className="text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-all duration-200 hover:scale-110">
                <Linkedin size={18} className="text-white fill-current" />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="sm:col-span-1 lg:col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6 text-left">Quick Links</h3>
            <ul className="space-y-4 text-left">
              <li>
                <a href="/home" className="text-gray-400 hover:text-white transition-colors text-sm">Home</a>
              </li>
              <li>
                <a href="/members" className="text-gray-400 hover:text-white transition-colors text-sm">Members</a>
              </li>
              <li>
                <a href="/categories" className="text-gray-400 hover:text-white transition-colors text-sm">Categories</a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About</a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</a>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="sm:col-span-1 lg:col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6 text-left">Support</h3>
            <ul className="space-y-4 text-left">
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms & Conditions</a>
              </li>
              <li>
                <a href="/legal" className="text-gray-400 hover:text-white transition-colors text-sm">Legal Notice</a>
              </li>
              {/* <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Legal Notice</a>
              </li> */}
            </ul>
          </div>

          {/* Contact Info Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6 text-left">Contact Info</h3>
            <ul className="space-y-4 text-left">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <a href="mailto:admin@kbcmembers.org" className="text-gray-400 hover:text-white transition-colors text-sm">
                  admin@kbcmembers.org
                </a>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <a href="tel:7305056436" className="text-gray-400 hover:text-white transition-colors text-sm">
                  7305056436
                </a>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0 mt-1"></div>
                <div className="text-gray-400 text-sm">
                  <div>Kongu Business Community,</div>
                  <div>NammaOffice,</div>
                  <div>3rd Floor, Balaji Towers,</div>
                  <div>Seerangapalayam, Salem-636007</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 KBC Directory. All rights reserved. |
            <a href="/privacy-policy" className="hover:text-white transition-colors ml-1">Privacy Policy</a> |
            <a href="/terms" className="hover:text-white transition-colors ml-1">Terms & Conditions</a> |
            <a href="/legal" className="hover:text-white transition-colors ml-1">Legal Notice</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default KBCDirectoryFooter;