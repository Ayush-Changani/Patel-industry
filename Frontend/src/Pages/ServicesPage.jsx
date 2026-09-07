import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Settings2, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import UIHeader from '../components/UserSide/UIHeader';
import UIFooter from '../components/UserSide/UIFooter';

// Import local company logos - Download and place these in your public/images folder
// Images needed:
// - public/images/logos/manufactur-co.png
// - public/images/logos/techlogistics.png
// - public/images/logos/heavyflow.png
// - public/images/logos/steelcore.png

const IMAGES = {
  // ── HERO BANNER BACKGROUND ──────────────────────────────
  // Modern tech / industrial automation
  heroBg: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80',
};

const ServicesPage = () => {
  const [imageErrors, setImageErrors] = useState({});

  // Company logos with offline support
  const companiesData = [
    {
      id: 'manufactur',
      name: 'Manufactur Co.',
      logoPath: '/images/logos/manufactur-co.png',
      fallbackText: 'MANUFACTUR CO.'
    },
    {
      id: 'techlogistics',
      name: 'Tech Logistics',
      logoPath: '/images/logos/techlogistics.png',
      fallbackText: 'TECHLOGISTICS'
    },
    {
      id: 'heavyflow',
      name: 'Heavy Flow',
      logoPath: '/images/logos/heavyflow.png',
      fallbackText: 'HEAVYFLOW'
    },
    {
      id: 'steelcore',
      name: 'Steel Core',
      logoPath: '/images/logos/steelcore.png',
      fallbackText: 'STEELCORE'
    }
  ];

  const services = [
    {
      title: "Inventory Management",
      description: "Real-time tracking of stock levels, warehouse management, and automated reordering systems.",
      icon: <Package className="w-8 h-8 text-[#948979]" />,
      features: ["Real-time Tracking", "Warehouse Mapping", "Auto-reordering"]
    },
    {
      title: "Production Planning",
      description: "Optimize manufacturing schedules, resource allocation, and workflow management for maximum efficiency.",
      icon: <Settings2 className="w-8 h-8 text-[#948979]" />,
      features: ["Batch Scheduling", "Resource Optimization", "Capacity Planning"]
    },
    {
      title: "Quality Control",
      description: "Standardize quality checks, compliance monitoring, and defect tracking across all production lines.",
      icon: <ShieldCheck className="w-8 h-8 text-[#948979]" />,
      features: ["Defect Tracking", "Compliance Logs", "QC Checkpoints"]
    },
    {
      title: "Finance & Accounting",
      description: "Comprehensive financial management, including automated invoicing, payroll, and tax compliance.",
      icon: <BarChart3 className="w-8 h-8 text-[#948979]" />,
      features: ["Automated Invoicing", "Payroll Systems", "Tax Reports"]
    },
    {
      title: "Human Resources",
      description: "Streamline employee management, from recruitment and attendance to performance tracking.",
      icon: <Users className="w-8 h-8 text-[#948979]" />,
      features: ["Recruitment Pipeline", "Attendance Sync", "Performance Reviews"]
    },
    {
      title: "Sales & CRM",
      description: "Manage lead pipelines, customer interactions, and sales analytics in a unified dashboard.",
      icon: <ShoppingCart className="w-8 h-8 text-[#948979]" />,
      features: ["Lead Scoring", "Sales Forecasting", "Customer Analytics"]
    },
    {
      title: "Supply Chain",
      description: "End-to-end visibility of your supply chain, from vendor management to logistics tracking.",
      icon: <TrendingUp className="w-8 h-8 text-[#948979]" />,
      features: ["Vendor Management", "Logistics Tracking", "Demand Planning"]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.08,
      filter: "drop-shadow(0 0 12px rgba(148, 137, 121, 0.4))"
    }
  };

  // Handle image loading errors
  const handleImageError = (companyId) => {
    setImageErrors(prev => ({
      ...prev,
      [companyId]: true
    }));
  };

  // Company Logo Component with fallback
  const CompanyLogo = ({ company }) => {
    const hasError = imageErrors[company.id];

    return (
      <motion.div
        variants={logoVariants}
        whileHover="hover"
        className="flex items-center justify-center h-16 group cursor-default"
      >
        {!hasError ? (
          <img
            src={company.logoPath}
            alt={company.name}
            onError={() => handleImageError(company.id)}
            className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <div className="font-black text-xl sm:text-2xl text-[#948979]/60 group-hover:text-[#948979] transition-colors text-center px-2">
            {company.fallbackText}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="bg-[#222831] text-[#DFD0B8] min-h-screen font-poppins user-page-scale">
      <UIHeader />

      {/* Hero Section with Background */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        {/* Hero background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.heroBg})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#222831] opacity-88" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block py-1 px-3 rounded-full bg-[#948979]/10 border border-[#948979]/20 text-[#948979] text-xs font-bold tracking-widest uppercase mb-6"
          >
            Empowering Growth
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold text-[#DFD0B8] mb-6 leading-tight"
          >
            Comprehensive ERP <br /> 
            <span className="text-white">Industrial Solutions</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-[#948979] mb-10 max-w-2xl mx-auto font-medium"
          >
            Optimize every facet of your industrial operations with our integrated suite of enterprise resource planning services.
          </motion.p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group bg-[#393E46]/30 border border-[#393E46]/40 rounded-2xl p-8 hover:bg-[#393E46]/50 hover:border-[#948979]/30 transition-all duration-300 relative overflow-hidden"
            >
              {/* Decorative background icon */}
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                {React.cloneElement(service.icon, { className: "w-24 h-24" })}
              </div>
              
              {/* Icon container */}
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="mb-6 p-4 bg-[#222831]/50 rounded-xl w-fit group-hover:bg-[#948979]/20 transition-colors"
              >
                {service.icon}
              </motion.div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-4">{service.title}</h3>
              
              {/* Description */}
              <p className="text-sm text-[#948979] mb-6 leading-relaxed">
                {service.description}
              </p>
              
              {/* Features list */}
              <ul className="space-y-3 mb-8">
                {service.features.map((feature, fIndex) => (
                  <motion.li 
                    key={fIndex}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: fIndex * 0.1 }}
                    className="flex items-center gap-2 text-xs text-slate-400"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#948979]/70 flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
              
              {/* CTA Button */}
              <motion.button 
                whileHover={{ x: 4 }}
                className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-[#DFD0B8] transition-colors"
              >
                Learn More 
                <motion.span
                  whileHover={{ x: 4 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Trust Section - Companies with offline image support */}
      <section className="py-24 bg-[#1a1d22]/50 border-y border-[#393E46]/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl font-bold text-[#DFD0B8] mb-12 text-center"
          >
            Trusted by Industry Leaders
          </motion.h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 hover:opacity-100 transition-opacity duration-500"
          >
            {companiesData.map((company) => (
              <div key={company.id} className="flex items-center justify-center">
                <CompanyLogo company={company} />
              </div>
            ))}
          </motion.div>

          <p className="text-center text-[#948979]/50 text-xs mt-8">
            💾 Images load from local storage - place PNG files in public/images/logos/
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#948979]/5 blur-[120px] pointer-events-none rounded-full"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto relative z-10 bg-gradient-to-r from-[#948979]/10 to-[#DFD0B8]/5 p-12 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <ShieldCheck className="w-12 h-12 text-[#948979] mx-auto mb-6" />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Optimize Your Enterprise?</h2>
          <p className="text-[#948979] mb-10">
            Join hundreds of industrial firms leveraging Patel Industries ERP to drive efficiency and growth.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-4 bg-[#948979] text-[#222831] font-bold rounded-full hover:bg-[#DFD0B8] transition-all shadow-lg"
          >
            Contact Expert Today
          </motion.button>
        </motion.div>
      </section>

      <UIFooter />
    </div>
  );
};

export default ServicesPage;