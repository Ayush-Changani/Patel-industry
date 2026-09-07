import React, { useState, useEffect } from 'react';
import { ChevronRight, Target, Lightbulb, Zap, Users, TrendingUp, Award, Globe, ArrowRight } from 'lucide-react';
import UIHeader from '../components/UserSide/UIHeader';
import UIFooter from '../components/UserSide/UIFooter';

// ============================================================
// IMAGE CONFIGURATION — About Us Page
// ============================================================
// All images load from Unsplash (free, no attribution required).
// When you download locally, replace URLs with imported assets:
//
//   import heroBg        from '../assets/images/about-hero-bg.jpg';
//   import overviewBg    from '../assets/images/about-overview-bg.jpg';
//   import visionBg      from '../assets/images/about-vision-bg.jpg';
//   import coreValuesBg  from '../assets/images/about-core-values-bg.jpg';
//   import timelineBg    from '../assets/images/about-timeline-bg.jpg';
//   import teamBg        from '../assets/images/about-team-bg.jpg';
//   import awardsBg      from '../assets/images/about-awards-bg.jpg';
//   import teamMember1   from '../assets/images/team-ceo.jpg';
//   import teamMember2   from '../assets/images/team-cto.jpg';
//   import teamMember3   from '../assets/images/team-coo.jpg';
//   import teamMember4   from '../assets/images/team-cfo.jpg';
//
// Then replace IMAGES.xxx values with the imported variables.
// ============================================================

const IMAGES = {
  // ── HERO BANNER BACKGROUND ──────────────────────────────
  // Industrial skyline / corporate building wide shot
  // Download: https://unsplash.com/photos/JKUTrJ4vK00
  // Local:    '../assets/images/about-hero-bg.jpg'
  heroBg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80',

  // ── COMPANY OVERVIEW BACKGROUND ─────────────────────────
  // Modern factory / industrial operations floor
  // Download: https://unsplash.com/photos/Q1p7bh3SHj8
  // Local:    '../assets/images/about-overview-bg.jpg'
  overviewBg: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80',

  // ── VISION & MISSION BACKGROUND ─────────────────────────
  // Business strategy / planning wide shot
  // Download: https://unsplash.com/photos/5fNmWej4tAA
  // Local:    '../assets/images/about-vision-bg.jpg'
  visionBg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80',

  // ── CORE VALUES BACKGROUND ──────────────────────────────
  // Smart factory automation / technology
  // Download: https://unsplash.com/photos/wD1LRb9OeEo
  // Local:    '../assets/images/about-core-values-bg.jpg'
  coreValuesBg: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1600&q=80',

  // ── TIMELINE / OUR JOURNEY BACKGROUND ───────────────────
  // Data analytics / dashboard tech
  // Download: https://unsplash.com/photos/hpjSkU2UYSU
  // Local:    '../assets/images/about-timeline-bg.jpg'
  timelineBg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80',

  // ── LEADERSHIP TEAM BACKGROUND ──────────────────────────
  // Professional team / meeting room
  // Download: https://unsplash.com/photos/KdeqA3aTnBY
  // Local:    '../assets/images/about-team-bg.jpg'
  teamBg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',

  // ── AWARDS BACKGROUND ───────────────────────────────────
  // Corporate / business achievement
  // Download: https://unsplash.com/photos/5QgIuuBxKwM
  // Local:    '../assets/images/about-awards-bg.jpg'
  awardsBg: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80',

  // ── TEAM MEMBER PHOTOS ──────────────────────────────────
  // Professional headshots from Unsplash (diverse, free to use)
  //
  // CEO — Download: https://unsplash.com/photos/IF9TK5Uy-KI
  // Local: '../assets/images/team-ceo.jpg'
  teamCEO: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80',

  // CTO — Download: https://unsplash.com/photos/rDEOVtE7vOs
  // Local: '../assets/images/team-cto.jpg'
  teamCTO: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=300&q=80',

  // COO — Download: https://unsplash.com/photos/d1UPkiFd04A
  // Local: '../assets/images/team-coo.jpg'
  teamCOO: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80',

  // CFO — Download: https://unsplash.com/photos/W0MEaQFR1A4
  // Local: '../assets/images/team-cfo.jpg'
  teamCFO: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80',
};

const AboutUsPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Timeline data
  const timeline = [
    { year: '2010', title: 'Foundation Year', description: 'Started with a vision to revolutionize industrial operations management', milestone: 'Company Founded', icon: '🌱' },
    { year: '2013', title: 'First ERP Launch', description: 'Launched our first ERP module for inventory management', milestone: 'Product Launch', icon: '🚀' },
    { year: '2016', title: 'Rapid Expansion', description: 'Expanded to 15 countries and added 5 new modules', milestone: 'Global Growth', icon: '🌍' },
    { year: '2019', title: 'AI Integration', description: 'Integrated AI and machine learning for predictive analytics', milestone: 'Tech Innovation', icon: '🤖' },
    { year: '2022', title: '500+ Clients', description: 'Reached 500+ enterprise clients across 50+ countries', milestone: 'Market Leader', icon: '👑' },
    { year: '2024', title: 'Cloud Revolution', description: 'Launched cloud-based ERP with 99.99% uptime guarantee', milestone: 'Industry Standard', icon: '☁️' },
  ];

  // Team members — now with real photos from IMAGES
  const team = [
    { name: 'Rajesh Patel',  role: 'Founder & CEO',            bio: 'Visionary leader with 25+ years in manufacturing technology', photo: IMAGES.teamCEO },
    { name: 'Priya Sharma',  role: 'CTO & Head of Product',     bio: 'Tech pioneer driving innovation in ERP solutions',            photo: IMAGES.teamCTO },
    { name: 'Vikram Desai',  role: 'COO & VP Operations',       bio: 'Operational excellence expert ensuring 24/7 service delivery', photo: IMAGES.teamCOO },
    { name: 'Neha Patel',    role: 'CFO & Chief Financial Officer', bio: 'Financial strategist managing sustainable growth',         photo: IMAGES.teamCFO },
  ];

  // Core values data
  const coreValues = [
    { title: 'Innovation',      description: 'Constantly pushing boundaries with cutting-edge technology',      icon: '💡', color: 'from-blue-900 to-blue-700' },
    { title: 'Reliability',     description: '99.9% uptime and enterprise-grade security standards',            icon: '🛡️', color: 'from-green-900 to-green-700' },
    { title: 'Customer Focus',  description: 'Your success is our success, with dedicated 24/7 support',        icon: '👥', color: 'from-purple-900 to-purple-700' },
    { title: 'Excellence',      description: 'Delivering world-class solutions with meticulous attention',      icon: '✨', color: 'from-amber-900 to-amber-700' },
  ];

  // ERP Benefits
  const erpBenefits = [
    { number: '40%',  title: 'Operational Cost Reduction', description: 'Average cost savings achieved by our clients in first year' },
    { number: '3x',   title: 'Faster Decision Making',     description: 'Real-time data enables quick, informed business decisions' },
    { number: '85%',  title: 'Error Reduction',            description: 'Automation minimizes manual errors and ensures accuracy' },
    { number: '24/7', title: 'System Uptime',              description: 'Cloud infrastructure guarantees continuous operation' },
  ];

  // Awards
  const awards = [
    { year: '2023', title: 'Best ERP Solution - Asia Pacific',        org: 'Tech Innovation Awards' },
    { year: '2023', title: 'Enterprise Software Excellence',           org: 'Global Business Forum' },
    { year: '2022', title: 'Customer Choice Award',                    org: 'Industry Leaders Circle' },
    { year: '2021', title: 'Best in Class Manufacturing Solution',     org: 'Manufacturing Tech Summit' },
  ];

  return (
    <div className="bg-[#222831] text-[#DFD0B8] min-h-screen font-poppins overflow-hidden user-page-scale">
      {/* NAVBAR */}
      <UIHeader />

      {/* ============================================================
          HERO BANNER
          Background: IMAGES.heroBg — corporate building / skyline
          ============================================================ */}
      <section className="pt-24 min-h-[70vh] flex items-center relative overflow-hidden">
        {/* Hero background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.heroBg})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#222831] opacity-80" />

        {/* Grid pattern on top */}
        <div className="absolute inset-0 opacity-10 z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#948979" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#948979] opacity-5 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#948979] opacity-5 rounded-full blur-3xl z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="text-center max-w-4xl mx-auto animate-fadeInUp">
            <div className="flex justify-center mb-6">
              <div className="line-accent mx-auto"></div>
            </div>
            <h1 className="font-barlow text-5xl md:text-7xl font-bold mb-6 leading-tight">
              About Patel Industries
            </h1>
            <p className="text-xl text-[#948979] mb-8 leading-relaxed">
              Pioneering enterprise resource planning solutions for the world's most innovative manufacturers and industrial leaders since 2010
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button className="px-8 py-3 bg-[#948979] text-[#222831] font-barlow font-semibold rounded hover:bg-[#DFD0B8] transition-all duration-300 flex items-center gap-2">
                Learn Our Story <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3 border border-[#948979] text-[#948979] font-barlow font-semibold rounded hover:bg-[#948979] hover:text-[#222831] transition-all duration-300">
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          COMPANY OVERVIEW
          Background: IMAGES.overviewBg — factory / industrial floor
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Overview background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.overviewBg})` }}
        />
        <div className="absolute inset-0 bg-[#1a1d22] opacity-92" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#948979] opacity-5 rounded-full blur-3xl z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className="animate-slideIn">
              <div className="line-accent mb-6"></div>
              <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-6">
                Transforming Manufacturing <span className="gradient-text">Since 2010</span>
              </h2>
              <p className="text-lg text-[#948979] mb-6 leading-relaxed">
                Patel Industries emerged from a simple vision: to create enterprise solutions that empower manufacturers and industrial leaders to operate at peak efficiency. What started as a small team of five passionate engineers has grown into a global organization serving 500+ enterprises across 50+ countries.
              </p>
              <p className="text-lg text-[#948979] mb-8 leading-relaxed">
                Our commitment to innovation, reliability, and customer success has made us the trusted partner for industrial companies seeking to modernize their operations.
              </p>

              {/* Key stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { number: '14+', label: 'Years' },
                  { number: '500+', label: 'Clients' },
                  { number: '50+', label: 'Countries' },
                ].map((stat, idx) => (
                  <div key={idx} className="stat-card glass-effect rounded-lg p-4">
                    <p className="font-barlow text-2xl font-bold text-[#DFD0B8]">{stat.number}</p>
                    <p className="text-[#948979] text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <button className="px-8 py-3 bg-[#948979] text-[#222831] font-barlow font-semibold rounded hover:bg-[#DFD0B8] transition-all duration-300 flex items-center gap-2">
                Read Full Story <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right visual */}
            <div className="relative animate-slideInRight">
              <div className="absolute inset-0 bg-gradient-to-br from-[#948979] to-transparent opacity-10 blur-3xl rounded-lg"></div>
              <div className="relative glass-effect rounded-xl p-12 border border-[#948979] border-opacity-20">
                <div className="space-y-6">
                  {[
                    { icon: '🏭', title: 'Industrial Expertise',    desc: 'Deep understanding of manufacturing complexities' },
                    { icon: '🚀', title: 'Continuous Innovation',   desc: 'Latest technology integrated regularly' },
                    { icon: '💎', title: 'Quality Assurance',       desc: 'Enterprise-grade reliability and security' },
                    { icon: '👥', title: 'World-Class Support',     desc: '24/7 expert assistance and guidance' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#948979] to-[#393E46] flex items-center justify-center flex-shrink-0 text-2xl">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-barlow font-bold text-[#DFD0B8] mb-2">{item.title}</h3>
                        <p className="text-[#948979] text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          VISION & MISSION
          Background: IMAGES.visionBg — business strategy / team wide shot
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Vision background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.visionBg})` }}
        />
        <div className="absolute inset-0 bg-[#222831] opacity-90" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#948979] opacity-5 rounded-full blur-3xl z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="line-accent mx-auto"></div>
            </div>
            <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-4">Vision & Mission</h2>
            <p className="text-[#948979] text-lg max-w-2xl mx-auto">
              Our guiding principles that drive every decision and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Vision Card */}
            <div className="group glass-effect rounded-xl p-12 border-l-4 border-[#948979] hover:border-[#DFD0B8] transition-all duration-300 transform hover:-translate-y-2 animate-slideIn">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#948979] to-[#393E46] flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <h3 className="font-barlow text-3xl font-bold text-[#DFD0B8] self-center">Our Vision</h3>
              </div>
              <p className="text-lg text-[#DFD0B8] leading-relaxed mb-6">
                To be the world's leading provider of intelligent enterprise solutions that empower industrial organizations to operate with unprecedented efficiency, innovation, and sustainability.
              </p>
              <div className="space-y-3 pt-6 border-t border-[#948979] border-opacity-10">
                {[
                  'Democratizing advanced technology for manufacturers of all sizes',
                  'Enabling data-driven decision making in real-time',
                  'Fostering sustainable industrial growth globally',
                ].map((point, idx) => (
                  <p key={idx} className="text-[#948979] flex items-start gap-3">
                    <span className="text-[#948979] font-bold">•</span> {point}
                  </p>
                ))}
              </div>
            </div>

            {/* Mission Card */}
            <div className="group glass-effect rounded-xl p-12 border-l-4 border-[#DFD0B8] hover:border-[#948979] transition-all duration-300 transform hover:-translate-y-2 animate-slideInRight">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#DFD0B8] to-[#948979] flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  🚀
                </div>
                <h3 className="font-barlow text-3xl font-bold text-[#DFD0B8] self-center">Our Mission</h3>
              </div>
              <p className="text-lg text-[#DFD0B8] leading-relaxed mb-6">
                To deliver cutting-edge, user-centric ERP solutions that solve complex industrial challenges while maintaining the highest standards of reliability, security, and support.
              </p>
              <div className="space-y-3 pt-6 border-t border-[#948979] border-opacity-10">
                {[
                  'Delivering excellence in every product and service',
                  'Partnering for long-term success with our clients',
                  'Investing in talent, innovation, and continuous improvement',
                ].map((point, idx) => (
                  <p key={idx} className="text-[#948979] flex items-start gap-3">
                    <span className="text-[#948979] font-bold">•</span> {point}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CORE VALUES
          Background: IMAGES.coreValuesBg — smart factory / automation
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Core values background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.coreValuesBg})` }}
        />
        <div className="absolute inset-0 bg-[#1a1d22] opacity-92" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#948979] opacity-5 rounded-full blur-3xl z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="line-accent mx-auto"></div>
            </div>
            <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-4">Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, idx) => (
              <div
                key={idx}
                className="group glass-effect rounded-xl p-8 hover:border-[#948979] hover:border-opacity-50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#948979]/20 transform hover:-translate-y-2 overflow-hidden relative"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="font-barlow text-2xl font-bold text-[#DFD0B8] mb-3">{value.title}</h3>
                  <p className="text-[#948979]">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ERP EXPLANATION — solid color, no background image */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#222831] relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#948979] opacity-5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="line-accent mx-auto"></div>
            </div>
            <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-4">
              Why ERP Matters in Industrial Operations
            </h2>
            <p className="text-[#948979] text-lg max-w-2xl mx-auto">
              Understanding the transformative power of integrated enterprise solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="animate-slideIn">
              <h3 className="font-barlow text-3xl font-bold text-[#DFD0B8] mb-6">The Industrial Challenge</h3>
              <p className="text-lg text-[#948979] mb-6 leading-relaxed">
                Modern manufacturers face unprecedented complexity: managing multiple facilities, supply chains, workforce, finances, and quality standards across distributed operations.
              </p>
              <ul className="space-y-4">
                {[
                  'Disconnected data across departments',
                  'Delayed insights and decision-making',
                  'Inventory and resource wastage',
                  'Compliance and quality challenges',
                  'Scaled operational complexity',
                ].map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-[#DFD0B8]">
                    <div className="w-6 h-6 rounded-full bg-[#948979] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#222831] font-bold text-sm">✓</span>
                    </div>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative animate-slideInRight">
              <div className="absolute inset-0 bg-gradient-to-br from-[#948979] to-transparent opacity-10 blur-3xl rounded-lg"></div>
              <div className="relative glass-effect rounded-xl p-12 border border-[#948979] border-opacity-20">
                <h3 className="font-barlow text-3xl font-bold text-[#DFD0B8] mb-8">The ERP Solution</h3>
                <div className="space-y-6">
                  {[
                    { icon: '🔗', title: 'Unified Integration',  desc: 'All modules connected for seamless data flow' },
                    { icon: '📊', title: 'Real-Time Visibility', desc: 'Instant insights across all operations' },
                    { icon: '⚡', title: 'Automated Processes',  desc: 'Reduce manual work and errors significantly' },
                    { icon: '📈', title: 'Strategic Growth',     desc: 'Data-driven decisions for business expansion' },
                  ].map((solution, idx) => (
                    <div key={idx} className="flex gap-4">
                      <span className="text-2xl">{solution.icon}</span>
                      <div>
                        <p className="font-barlow font-semibold text-[#DFD0B8]">{solution.title}</p>
                        <p className="text-[#948979] text-sm">{solution.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ERP Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {erpBenefits.map((benefit, idx) => (
              <div
                key={idx}
                className="glass-effect rounded-xl p-8 text-center hover:border-[#948979] hover:border-opacity-50 transition-all duration-300 transform hover:-translate-y-2"
              >
                <p className="font-barlow text-4xl font-bold gradient-text mb-2">{benefit.number}</p>
                <h3 className="font-barlow text-lg font-bold text-[#DFD0B8] mb-3">{benefit.title}</h3>
                <p className="text-[#948979] text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TIMELINE / OUR JOURNEY
          Background: IMAGES.timelineBg — analytics dashboard tech
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Timeline background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.timelineBg})` }}
        />
        <div className="absolute inset-0 bg-[#1a1d22] opacity-92" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#948979] opacity-5 rounded-full blur-3xl z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="line-accent mx-auto"></div>
            </div>
            <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-4">Our Journey</h2>
            <p className="text-[#948979] text-lg max-w-2xl mx-auto">
              From vision to industry leadership in 14 years
            </p>
          </div>

          {/* Desktop Timeline */}
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#948979] via-[#948979] to-transparent hidden lg:block"></div>
            <div className="space-y-12 lg:space-y-16">
              {timeline.map((item, idx) => (
                <div
                  key={idx}
                  className={`group cursor-pointer transition-all duration-300 ${
                    idx % 2 === 0 ? 'lg:text-right lg:mr-auto lg:w-5/12' : 'lg:ml-auto lg:w-5/12'
                  }`}
                  onClick={() => setActiveTimeline(idx)}
                >
                  <div className={`absolute left-1/2 transform -translate-x-1/2 hidden lg:block ${
                    activeTimeline === idx ? 'timeline-dot active' : 'timeline-dot'
                  }`}></div>
                  <div className={`glass-effect rounded-xl p-8 border-l-4 transition-all duration-300 ${
                    activeTimeline === idx
                      ? 'border-[#DFD0B8] bg-gradient-to-r from-[#948979]/10 to-transparent'
                      : 'border-[#948979] hover:border-[#DFD0B8]'
                  }`}>
                    <div className="flex items-start gap-4 mb-3 lg:mb-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex-1">
                        <p className="font-barlow text-2xl font-bold text-[#DFD0B8]">{item.year}</p>
                        <p className="text-xs text-[#948979] mt-1">{item.milestone}</p>
                      </div>
                    </div>
                    <h3 className="font-barlow text-xl font-bold text-[#DFD0B8] mb-2">{item.title}</h3>
                    <p className="text-[#948979] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="lg:hidden mt-12 space-y-6">
            {timeline.map((item, idx) => (
              <div
                key={idx}
                className="glass-effect rounded-xl p-6 border-l-4 border-[#948979] hover:border-[#DFD0B8] transition-all cursor-pointer"
                onClick={() => setActiveTimeline(idx)}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-barlow text-xl font-bold text-[#DFD0B8]">{item.year}</p>
                    <h3 className="font-barlow font-semibold text-[#DFD0B8] mt-1">{item.title}</h3>
                    <p className="text-[#948979] text-sm mt-2 leading-relaxed">{item.description}</p>
                    <p className="text-[#948979] text-xs mt-2 italic">{item.milestone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          LEADERSHIP TEAM
          Background: IMAGES.teamBg — professional office / meeting room
          Team cards now show real headshot photos instead of emoji icons.
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Team background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.teamBg})` }}
        />
        <div className="absolute inset-0 bg-[#222831] opacity-92" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#948979] opacity-5 rounded-full blur-3xl z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="line-accent mx-auto"></div>
            </div>
            <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-4">Leadership Team</h2>
            <p className="text-[#948979] text-lg max-w-2xl mx-auto">
              Visionary leaders driving innovation and excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="group glass-effect rounded-xl overflow-hidden hover:border-[#948979] hover:border-opacity-50 transition-all duration-300 transform hover:-translate-y-2 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#948979] to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300 z-0"></div>

                {/*
                  Team member photo
                  Currently uses Unsplash headshots.
                  To use your own photos: replace member.photo with a local import.
                  Local path: '../assets/images/team-[name].jpg'
                */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  {/* Gradient fade into card body */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a2d35] via-transparent to-transparent" />
                </div>

                {/* Card body */}
                <div className="relative z-10 p-6 text-center">
                  <h3 className="font-barlow text-xl font-bold text-[#DFD0B8] mb-1">{member.name}</h3>
                  <p className="text-[#948979] font-semibold text-sm mb-3">{member.role}</p>
                  <p className="text-[#948979] text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          AWARDS & RECOGNITION
          Background: IMAGES.awardsBg — corporate achievement / business
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Awards background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.awardsBg})` }}
        />
        <div className="absolute inset-0 bg-[#1a1d22] opacity-92" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#948979] opacity-5 rounded-full blur-3xl z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="line-accent mx-auto"></div>
            </div>
            <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-4">Awards & Recognition</h2>
            <p className="text-[#948979] text-lg max-w-2xl mx-auto">
              Industry recognition for our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {awards.map((award, idx) => (
              <div
                key={idx}
                className="glass-effect rounded-xl p-8 border-l-4 border-[#948979] hover:border-[#DFD0B8] transition-all duration-300 transform hover:-translate-y-2 flex items-start gap-6"
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#948979] to-[#393E46] flex items-center justify-center flex-shrink-0">
                  <Award className="w-8 h-8 text-[#DFD0B8]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#948979] text-sm font-semibold mb-1">{award.year}</p>
                  <h3 className="font-barlow font-bold text-[#DFD0B8] mb-2">{award.title}</h3>
                  <p className="text-[#948979] text-sm">{award.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION — gradient, no background photo needed */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#393E46] to-[#222831] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#948979] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#948979] opacity-10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fadeInUp">
          <div className="line-accent mx-auto mb-6"></div>
          <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-lg text-[#948979] mb-10 max-w-2xl mx-auto">
            Experience how Patel Industries' ERP solutions have transformed manufacturing operations worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group px-10 py-4 bg-[#948979] text-[#222831] font-barlow font-bold rounded text-lg hover:bg-[#DFD0B8] transition-all duration-300 flex items-center justify-center gap-2">
              Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-4 border-2 border-[#948979] text-[#948979] font-barlow font-bold rounded text-lg hover:bg-[#948979] hover:text-[#222831] transition-all duration-300">
              Schedule a Consultation
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <UIFooter />
    </div>
  );
};

export default AboutUsPage;