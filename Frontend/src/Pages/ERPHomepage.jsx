import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, ArrowRight, Quote, Users, Zap } from 'lucide-react';
import UIHeader from '../components/UserSide/UIHeader';
import UIFooter from '../components/UserSide/UIFooter';

// ============================================================
// IMAGE CONFIGURATION
// ============================================================
// All images are currently loaded from Unsplash (free, no attribution required).
// When you download images locally, replace the Unsplash URLs with your local paths.
//
// LOCAL PATH FORMAT (after downloading):
//   import sliderImg1 from '../assets/images/slider-erp-dashboard.jpg';
//   import sliderImg2 from '../assets/images/slider-smart-factory.jpg';
//   import sliderImg3 from '../assets/images/slider-business-team.jpg';
//   import aboutBg    from '../assets/images/about-us-bg.jpg';
//   import servicesBg from '../assets/images/services-bg.jpg';
//   import clientsBg  from '../assets/images/clients-bg.jpg';
//
// Then replace each IMAGES.xxx reference below with the imported variable.
// ============================================================

const IMAGES = {
  // ── HERO SLIDER ─────────────────────────────────────────
  // Slide 1: ERP / Analytics Dashboard
  // Download from: https://unsplash.com/photos/hpjSkU2UYSU
  // Local path (after download): '../assets/images/slider-erp-dashboard.jpg'
  slider1: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80',

  // Slide 2: Smart Factory / Industrial Automation
  // Download from: https://unsplash.com/photos/wD1LRb9OeEo
  // Local path (after download): '../assets/images/slider-smart-factory.jpg'
  slider2: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1600&q=80',

  // Slide 3: Business Team / Enterprise Collaboration
  // Download from: https://unsplash.com/photos/g1Kr4Ozfoac
  // Local path (after download): '../assets/images/slider-business-team.jpg'
  slider3: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80',

  // ── ABOUT US BACKGROUND ─────────────────────────────────
  // Modern office / professional team background
  // Download from: https://unsplash.com/photos/KdeqA3aTnBY
  // Local path (after download): '../assets/images/about-us-bg.jpg'
  aboutBg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',

  // ── SERVICES BACKGROUND ─────────────────────────────────
  // Industrial manufacturing / technology background
  // Download from: https://unsplash.com/photos/Q1p7bh3SHj8
  // Local path (after download): '../assets/images/services-bg.jpg'
  servicesBg: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80',

  // ── CLIENTS BACKGROUND ──────────────────────────────────
  // Business partnership / corporate handshake background
  // Download from: https://unsplash.com/photos/5QgIuuBxKwM
  // Local path (after download): '../assets/images/clients-bg.jpg'
  clientsBg: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80',
};

const ERPHomepage = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Hero slides data — using real background images
  const heroSlides = [
    {
      title: 'Transform Your Operations',
      subtitle: 'Enterprise-grade ERP solutions for modern manufacturing',
      image: IMAGES.slider1,
    },
    {
      title: 'Scale Without Limits',
      subtitle: 'Built for enterprise complexity, designed for simplicity',
      image: IMAGES.slider2,
    },
    {
      title: 'Real-Time Intelligence',
      subtitle: 'Data-driven decisions at your fingertips',
      image: IMAGES.slider3,
    },
  ];

  // Companies showcase data
  const companies = [
    {
      name: 'TechManufacture Ltd',
      industry: 'Electronics Manufacturing',
      employees: '5,000+',
      description: 'Streamlined production across 12 facilities',
    },
    {
      name: 'Steel & Co',
      industry: 'Steel Production',
      employees: '3,200+',
      description: 'Optimized supply chain management',
    },
    {
      name: 'AutoParts Global',
      industry: 'Automotive',
      employees: '4,500+',
      description: 'Integrated logistics and quality control',
    },
    {
      name: 'ChemFlow Industries',
      industry: 'Chemical Processing',
      employees: '2,800+',
      description: 'Real-time compliance and inventory tracking',
    },
  ];

  // Services data
  const services = [
    {
      icon: '📦',
      title: 'Inventory Management',
      description: 'Real-time stock tracking across multiple warehouses with predictive analytics',
      color: 'from-amber-900 to-amber-700',
    },
    {
      icon: '👥',
      title: 'Human Resources',
      description: 'Complete workforce management from recruitment to payroll automation',
      color: 'from-blue-900 to-blue-700',
    },
    {
      icon: '💰',
      title: 'Financial Management',
      description: 'Integrated accounting, budgeting, and financial reporting in real-time',
      color: 'from-green-900 to-green-700',
    },
    {
      icon: '⚙️',
      title: 'Manufacturing',
      description: 'Production planning, quality control, and equipment maintenance tracking',
      color: 'from-purple-900 to-purple-700',
    },
    {
      icon: '📊',
      title: 'Business Intelligence',
      description: 'Advanced analytics and customizable dashboards for data-driven decisions',
      color: 'from-indigo-900 to-indigo-700',
    },
    {
      icon: '🔗',
      title: 'Supply Chain',
      description: 'End-to-end visibility from procurement to delivery with optimization',
      color: 'from-rose-900 to-rose-700',
    },
  ];

  // Client logos (dummy)
  const clients = [
    { name: 'Global Industries', logo: 'GI' },
    { name: 'NextGen Corp', logo: 'NG' },
    { name: 'Industrial Solutions', logo: 'IS' },
    { name: 'FutureMfg', logo: 'FM' },
    { name: 'SmartOps', logo: 'SO' },
    { name: 'Precision Tech', logo: 'PT' },
  ];

  // Testimonials data
  const testimonials = [
    {
      quote: "The ERP system has transformed how we manage our operations. We've reduced operational costs by 35% in the first year.",
      author: 'Rajesh Kumar',
      role: 'Operations Director, TechManufacture Ltd',
      company: 'Electronics Manufacturing',
    },
    {
      quote: 'Implementation was seamless, and the support team was exceptional. Our team was fully productive within weeks.',
      author: 'Priya Sharma',
      role: 'CFO, Steel & Co',
      company: 'Steel Production',
    },
    {
      quote: 'The real-time analytics have given us insights we never had before. Decision-making is now data-driven and instant.',
      author: 'Vikram Patel',
      role: 'Plant Manager, AutoParts Global',
      company: 'Automotive Components',
    },
  ];

  return (
    <div className="bg-[#222831] text-[#DFD0B8] min-h-screen font-poppins overflow-hidden user-page-scale">
      {/* NAVBAR */}
      <UIHeader />

      {/* ============================================================
          HERO SLIDER SECTION
          Background images cycle through heroSlides[].image (Unsplash URLs).
          Each slide uses a real photo + dark overlay for text readability.
          ============================================================ */}
      <section className="pt-24 min-h-screen flex items-center relative overflow-hidden">

        {/* Slide backgrounds — real photos with dark overlay */}
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              activeSlide === idx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Real photo background */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            {/* Dark overlay so text stays readable over the photo */}
            <div className="absolute inset-0 bg-[#222831] opacity-75" />
          </div>
        ))}

        {/* Animated grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#948979" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInUp">
              <div className="line-accent mb-6"></div>
              <h1 className="font-barlow text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {heroSlides[activeSlide].title}
              </h1>
              <p className="text-lg text-[#948979] mb-8 max-w-xl">
                {heroSlides[activeSlide].subtitle}
              </p>
              <div className="flex gap-4">
                <button className="group px-8 py-4 bg-[#948979] text-[#222831] font-barlow font-semibold rounded hover:bg-[#DFD0B8] transition-all duration-300 flex items-center gap-2">
                  Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border border-[#948979] text-[#948979] font-barlow font-semibold rounded hover:bg-[#948979] hover:text-[#222831] transition-all duration-300 flex items-center gap-2">
                  <Play className="w-5 h-5" /> Watch Demo
                </button>
              </div>
            </div>

            {/* Hero dashboard card — 6 ERP module image cards */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#948979] to-[#393E46] rounded-lg opacity-10 blur-3xl animate-float"></div>
              <div className="relative bg-gradient-to-br from-[#393E46] to-[#222831] border border-[#948979] border-opacity-20 rounded-lg p-6 glass-effect">
                <div className="grid grid-cols-3 gap-3 animate-slideIn">
                  {/*
                    ── ERP MODULE CARDS ───────────────────────────────────────
                    Each card shows a real Unsplash photo + module label.
                    To use local images, replace the src URLs below with:
                      import cardImg1 from '../assets/images/card-inventory.jpg';
                    and set src={cardImg1} on the corresponding <img>.

                    Card 1 – Inventory Management
                    Download: https://unsplash.com/photos/jf1EomjlQi0
                    Local:    '../assets/images/card-inventory.jpg'

                    Card 2 – HR / People
                    Download: https://unsplash.com/photos/ZVkDLrXGMdw
                    Local:    '../assets/images/card-hr.jpg'

                    Card 3 – Finance
                    Download: https://unsplash.com/photos/s9CC2SKySJM
                    Local:    '../assets/images/card-finance.jpg'

                    Card 4 – Manufacturing
                    Download: https://unsplash.com/photos/iYkqHp5cGQ4
                    Local:    '../assets/images/card-manufacturing.jpg'

                    Card 5 – Analytics
                    Download: https://unsplash.com/photos/hpjSkU2UYSU
                    Local:    '../assets/images/card-analytics.jpg'

                    Card 6 – Supply Chain
                    Download: https://unsplash.com/photos/Q1p7bh3SHj8
                    Local:    '../assets/images/card-supply-chain.jpg'
                  */}
                  {[
                    {
                      label: 'Inventory',
                      src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=70',
                    },
                    {
                      label: 'HR',
                      src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=70',
                    },
                    {
                      label: 'Finance',
                      src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=70',
                    },
                    {
                      label: 'Manufacturing',
                      src: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=400&q=70',
                    },
                    {
                      label: 'Analytics',
                      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=70',
                    },
                    {
                      label: 'Supply Chain',
                      src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=70',
                    },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className="bg-[#2a2d35] rounded-lg overflow-hidden border border-[#948979] border-opacity-10 group hover:border-opacity-40 transition-all duration-300"
                    >
                      {/* Module photo */}
                      <div className="relative h-20 overflow-hidden">
                        <img
                          src={card.src}
                          alt={card.label}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                        />
                        {/* gradient fade at bottom so label blends in */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2a2d35] via-transparent to-transparent" />
                      </div>
                      {/* Module label */}
                      <div className="px-3 py-2">
                        <p className="text-[#948979] text-xs font-semibold font-barlow">{card.label}</p>
                        <div className="h-1.5 bg-[#948979] bg-opacity-20 rounded w-3/4 mt-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide navigation dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 transition-all duration-300 ${
                activeSlide === idx
                  ? 'w-8 bg-[#948979]'
                  : 'w-2 bg-[#948979] bg-opacity-40 hover:bg-opacity-60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ============================================================
          ABOUT US / ERP INTRODUCTION SECTION
          Background: IMAGES.aboutBg (Unsplash modern office photo)
          The photo sits behind a strong dark overlay to keep content readable.
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

        {/* About Us background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.aboutBg})` }}
        />
        {/* Dark overlay — adjust opacity to show more/less of the photo */}
        <div className="absolute inset-0 bg-[#1a1d22] opacity-90" />

        {/* Decorative blur blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#948979] opacity-5 rounded-full blur-3xl z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slideIn">
              <div className="line-accent mb-6"></div>
              <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-6">
                Enterprise Resource Planning <span className="gradient-text">Redefined</span>
              </h2>
              <p className="text-[#948979] text-lg mb-6 leading-relaxed">
                Our ERP solution integrates all your business processes into a unified system. From manufacturing
                to finance, from human resources to supply chain, we provide complete visibility and control.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Real-time data synchronization across all modules',
                  'Scalable architecture for growing enterprises',
                  'Advanced analytics and reporting capabilities',
                  '24/7 support and continuous optimization',
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#948979] rounded mt-1 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-[#222831]" />
                    </div>
                    <span className="text-[#DFD0B8]">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="px-8 py-3 bg-[#948979] text-[#222831] font-barlow font-semibold rounded hover:bg-[#DFD0B8] transition-all duration-300 flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-[#948979] to-transparent opacity-10 blur-3xl rounded-lg"></div>
              <div className="relative bg-[#393E46] bg-opacity-80 border border-[#948979] border-opacity-20 rounded-xl p-12 glass-effect">
                <div className="space-y-6">
                  {[
                    { label: 'Modules', value: '12+' },
                    { label: 'Integration Points', value: '500+' },
                    { label: 'Annual Users', value: '10K+' },
                    { label: 'Uptime Guarantee', value: '99.9%' },
                  ].map((stat, idx) => (
                    <div key={idx} className="border-b border-[#948979] border-opacity-10 pb-6">
                      <p className="text-[#948979] text-sm mb-2">{stat.label}</p>
                      <p className="font-barlow text-3xl font-bold text-[#DFD0B8]">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANIES SHOWCASE SECTION — no background image, solid color */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#222831]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="line-accent"></div>
            </div>
            <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-[#948979] text-lg max-w-2xl mx-auto">
              Global enterprises across manufacturing, automotive, and industrial sectors rely on our ERP solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {companies.map((company, idx) => (
              <div
                key={idx}
                className="group glass-effect rounded-xl p-8 hover:border-[#948979] hover:border-opacity-50 transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-barlow text-2xl font-bold text-[#DFD0B8] mb-2">
                      {company.name}
                    </h3>
                    <p className="text-[#948979] text-sm">{company.industry}</p>
                  </div>
                  <div className="text-4xl font-barlow font-bold text-[#948979] opacity-20">
                    {company.name.charAt(0)}
                  </div>
                </div>
                <p className="text-[#DFD0B8] mb-6">{company.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[#948979] border-opacity-10">
                  <span className="text-[#948979] text-sm">{company.employees}</span>
                  <Users className="w-5 h-5 text-[#948979] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SERVICES SECTION
          Background: IMAGES.servicesBg (Unsplash industrial/manufacturing photo)
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

        {/* Services background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.servicesBg})` }}
        />
        {/* Dark overlay — keeping it heavy so service cards pop */}
        <div className="absolute inset-0 bg-[#1a1d22] opacity-92" />

        {/* Decorative blur blob */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#948979] opacity-5 rounded-full blur-3xl z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="line-accent"></div>
            </div>
            <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-4">
              Comprehensive Service Suite
            </h2>
            <p className="text-[#948979] text-lg max-w-2xl mx-auto">
              Complete modules covering every aspect of your enterprise operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="group glass-effect rounded-xl p-8 hover:border-[#948979] hover:border-opacity-50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#948979]/20 transform hover:-translate-y-1 overflow-hidden relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="font-barlow text-xl font-bold text-[#DFD0B8] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-[#948979] leading-relaxed">
                    {service.description}
                  </p>
                  <div className="mt-6 flex items-center text-[#948979] group-hover:text-[#DFD0B8] transition-colors cursor-pointer">
                    <span className="text-sm font-semibold">Explore</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CLIENTS SECTION
          Background: IMAGES.clientsBg (Unsplash business partnership photo)
          ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

        {/* Clients background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.clientsBg})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#222831] opacity-88" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <p className="text-[#948979] text-sm font-barlow font-semibold mb-4">GLOBAL PARTNERS</p>
            <h2 className="font-barlow text-3xl md:text-4xl font-bold">
              Partnered with Industry Leaders
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {clients.map((client, idx) => (
              <div
                key={idx}
                className="glass-effect rounded-lg p-8 flex items-center justify-center hover:border-[#948979] hover:border-opacity-50 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#948979] to-[#393E46] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="font-barlow font-bold text-[#222831]">{client.logo}</span>
                  </div>
                  <p className="text-[#DFD0B8] text-xs font-semibold">{client.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION — no background image, solid color */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1a1d22] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#948979] opacity-5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="line-accent"></div>
            </div>
            <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-[#948979] text-lg">
              Success stories from enterprises worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="glass-effect rounded-xl p-8 border-l-4 border-[#948979] hover:border-[#DFD0B8] transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex gap-1 mb-6">
                  <Quote className="w-8 h-8 text-[#948979]" />
                </div>
                <p className="text-[#DFD0B8] mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-[#948979] border-opacity-10 pt-6">
                  <p className="font-barlow font-semibold text-[#DFD0B8]">{testimonial.author}</p>
                  <p className="text-[#948979] text-sm">{testimonial.role}</p>
                  <p className="text-[#948979] text-xs mt-1">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#222831] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#948979" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Global Enterprises' },
              { number: '50+', label: 'Countries Served' },
              { number: '99.9%', label: 'System Uptime' },
              { number: '24/7', label: 'Expert Support' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center animate-fadeInUp" style={{ animationDelay: `${idx * 100}ms` }}>
                <p className="font-barlow text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.number}
                </p>
                <p className="text-[#948979]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#393E46] to-[#222831] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#948979] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#948979] opacity-10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="line-accent mx-auto mb-6"></div>
          <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Enterprise?
          </h2>
          <p className="text-lg text-[#948979] mb-10 max-w-2xl mx-auto">
            Join hundreds of industry leaders who have revolutionized their operations with our ERP solution
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group px-10 py-4 bg-[#948979] text-[#222831] font-barlow font-bold rounded text-lg hover:bg-[#DFD0B8] transition-all duration-300 flex items-center justify-center gap-2">
              Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-4 border-2 border-[#948979] text-[#948979] font-barlow font-bold rounded text-lg hover:bg-[#948979] hover:text-[#222831] transition-all duration-300">
              Schedule a Demo
            </button>
          </div>

          {/* Contact info */}
          <div className="mt-12 pt-12 border-t border-[#948979] border-opacity-20 flex flex-col sm:flex-row justify-center gap-8 text-[#948979]">
            <div>
              <p className="text-sm mb-1">Email</p>
              <p className="font-semibold text-[#DFD0B8]">contact@erppro.com</p>
            </div>
            <div>
              <p className="text-sm mb-1">Phone</p>
              <p className="font-semibold text-[#DFD0B8]">+1 (800) 123-4567</p>
            </div>
            <div>
              <p className="text-sm mb-1">Support</p>
              <p className="font-semibold text-[#DFD0B8]">Available 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <UIFooter />
    </div>
  );
};

export default ERPHomepage;