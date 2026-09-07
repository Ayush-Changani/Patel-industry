import React from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaTwitter, FaEnvelope, FaExternalLinkAlt } from "react-icons/fa";
import UIHeader from '../components/UserSide/UIHeader';
import UIFooter from '../components/UserSide/UIFooter';

const IMAGES = {
  // ── HERO BANNER BACKGROUND ──────────────────────────────
  // Professional team / collaboration wide shot
  heroBg: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80',
  
  // ── CULTURE SECTION BACKGROUND ──────────────────────────
  // Modern office / innovative workspace
  cultureBg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
};

const OurTeamPage = () => {
  const team = [
    {
      name: "Rajesh Patel",
      role: "Chief Executive Officer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
      bio: "Visionary leader with 20+ years in industrial manufacturing and ERP strategic systems."
    },
    {
      name: "Sneha Mehta",
      role: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop",
      bio: "Expert in cloud architecture and scalable enterprise software development."
    },
    {
      name: "Vikram Shah",
      role: "Operations Director",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop",
      bio: "Specialist in supply chain optimization and industrial process automation."
    },
    {
      name: "Ananya Iyer",
      role: "Finance & Strategy Head",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop",
      bio: "Driving financial excellence and strategic growth through data-driven decisions."
    },
    {
      name: "Arjun Reddy",
      role: "Lead Software Architect",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&auto=format&fit=crop",
      bio: "Designing the core infrastructure and future-ready modules of our ERP platform."
    },
    {
      name: "Priya Sharma",
      role: "Client Relations Manager",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&auto=format&fit=crop",
      bio: "Dedicated to ensuring the success and satisfaction of our global partners."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
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
        <div className="absolute inset-0 bg-[#222831] opacity-85" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-[#948979]/10 border border-[#948979]/20 text-[#948979] text-xs font-bold tracking-widest uppercase mb-6">
            The Minds Behind PI
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#DFD0B8] mb-6 leading-tight">
            Meet the <span className="text-white">Expert Team</span>
          </h1>
          <p className="text-lg text-[#948979] mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Our diverse team of experts is dedicated to revolutionizing industrial operations through innovation, technology, and strategic excellence.
          </p>
        </motion.div>
      </section>

      {/* Team Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {team.map((member, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              {/* Card Container */}
              <div className="bg-[#393E46]/30 border border-[#393E46]/50 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-[#948979]/50 hover:shadow-2xl hover:shadow-[#948979]/10">
                {/* Image Wrapper */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#222831] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  
                  {/* Social Links shown on Hover */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#948979] transition-colors">
                      <FaLinkedin className="w-4 h-4 text-white" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#948979] transition-colors">
                      <FaTwitter  className="w-4 h-4 text-white" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#948979] transition-colors">
                      <FaEnvelope className="w-4 h-4 text-white" />
                    </a>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center bg-gradient-to-b from-[#393E46]/0 to-[#393E46]/50">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#DFD0B8] transition-colors">{member.name}</h3>
                  <p className="text-sm font-bold text-[#948979] uppercase tracking-wider mb-4">{member.role}</p>
                  <p className="text-xs text-[#948979] opacity-80 leading-relaxed max-w-[250px] mx-auto">
                    {member.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Culture Section with Background */}
      <section className="py-24 relative overflow-hidden">
        {/* Culture background photo */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.cultureBg})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#1a1d22] opacity-92" />
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-[#DFD0B8] mb-12"
            >
              Guided by Innovation
            </motion.h2>
            <motion.div 
               variants={containerVariants}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               className="grid grid-cols-1 md:grid-cols-3 gap-12"
            >
                <motion.div variants={itemVariants}>
                    <h4 className="text-5xl font-black text-white/5 mb-[-25px]">01</h4>
                    <h3 className="text-xl font-bold text-white mb-4">Excellence</h3>
                    <p className="text-sm text-[#948979]">Pursuing the highest standards in everything we build and deliver.</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <h4 className="text-5xl font-black text-white/5 mb-[-25px]">02</h4>
                    <h3 className="text-xl font-bold text-white mb-4">Integrity</h3>
                    <p className="text-sm text-[#948979]">Building trust through transparency and ethical business practices.</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <h4 className="text-5xl font-black text-white/5 mb-[-25px]">03</h4>
                    <h3 className="text-xl font-bold text-white mb-4">Innovation</h3>
                    <p className="text-sm text-[#948979]">Constantly evolving our technology to meet future industrial needs.</p>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-[#393E46]/20 p-12 rounded-[40px] border border-white/5 relative z-10"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Want to Join Our Team?</h2>
          <p className="text-[#948979] mb-10">
            We are always looking for passionate people to help us build the next generation of industrial ERP systems.
          </p>
          <button className="inline-flex items-center gap-2 text-[#DFD0B8] font-bold hover:gap-4 transition-all">
            View Open Positions <FaExternalLinkAlt className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      <UIFooter />
    </div>
  );
};

export default OurTeamPage;
