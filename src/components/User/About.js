import React from "react";
import { Rocket, Lightbulb, HandHeart, Users, Building2, GraduationCap, PiggyBank, ClipboardCheck, ShieldCheck, CircleDollarSign, Briefcase, CheckCircle } from 'lucide-react';
import Header from "./Header";
import Footer from "./Footer";
import MobileFooter from './MobileFooter';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0 font-['Roboto','Helvetica','Arial',sans-serif]">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            About Us - Kongu Business Community (KBC)
          </h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90 font-normal">
            Empowering Kongu through business, collaboration, and innovation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        {/* Who We Are */}
        <div className="mb-16 text-left">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Who We Are
            </h2>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            The Kongu Business Community (KBC) is a collective of entrepreneurs, professionals, and visionaries united by a single purpose – to empower Kongu through business, collaboration, and innovation. Rooted in tradition and driven by modern enterprise, KBC is not just a network, but a movement that brings together Konguprenuers to grow, connect, and create extraordinary outcomes.
          </p>
        </div>

        {/* Vision */}
        <div className="mb-12 text-left">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Our Vision
            </h2>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            To build the most trusted entrepreneurial ecosystem that nurtures the spirit of innovation, strengthens community bonds, and positions Kongu as a hub for sustainable and scalable businesses.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-12 text-left">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Our Mission
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">Connect Kongu entrepreneurs across industries, geographies, and generations.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">Collaborate by sharing resources, expertise, and opportunities.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">Create lasting impact by mentoring, funding, and scaling businesses.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">Celebrate the spirit of Konguprenuers who blend heritage with progress.</p>
            </div>
          </div>
        </div>

        {/* What We Do */}
        <div className="mb-12 text-left">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              What We Do
            </h2>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div className="bg-white border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition text-left">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-green-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Business Directory</h3>
              </div>
              <p className="text-gray-700 text-sm sm:text-base">A one-stop digital platform that showcases every Kongu business, making them discoverable and accessible.</p>
            </div>
            <div className="bg-white border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition text-left">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Networking & Conclaves</h3>
              </div>
              <p className="text-gray-700 text-sm sm:text-base">Regular events, industrial visits, and forums where leaders and aspiring entrepreneurs exchange knowledge and opportunities.</p>
            </div>
            <div className="bg-white border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition text-left">
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="w-5 h-5 text-orange-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Mentorship & Funding</h3>
              </div>
              <p className="text-gray-700 text-sm sm:text-base">Pairing young entrepreneurs with seasoned industry leaders and connecting them with investors.</p>
            </div>
            <div className="bg-white border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition text-left">
              <div className="flex items-center gap-3 mb-2">
                <HandHeart className="w-5 h-5 text-pink-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Community Initiatives</h3>
              </div>
              <p className="text-gray-700 text-sm sm:text-base">Scholarships, support programs, and activities that uplift the next generation of innovators.</p>
            </div>
          </div>
        </div>

        {/* Governance */}
        <div className="mb-16 text-left">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Our Governance
            </h2>
          </div>
          <div className="bg-white border rounded-2xl p-5 sm:p-6 md:p-7 shadow-sm text-left">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
              KBC is registered as a Section 8 company under the Companies Act, 2013 – a not-for-profit entity formed to promote commerce, trade, education, and social welfare. Being a Section 8 company ensures that our mission remains community-centric, transparent, and impact-driven, with all surpluses reinvested into building opportunities for entrepreneurs and society.
            </p>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
              KBC is a community-driven organization governed through an active board of directors selected and evaluated on clear KPIs (Key Performance Indicators).
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">The community is not owned or managed by any single individual or private group.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">Collective decision-making power rests with the board, which functions transparently and is accountable to the community through performance-based governance.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">This governance model ensures fairness, continuity, and sustainability, keeping the focus on community growth rather than personal interest.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <MobileFooter />
    </div>
  );
};

export default About;