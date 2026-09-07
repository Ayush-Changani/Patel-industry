import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  Settings, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import UIHeader from '../components/UserSide/UIHeader';
import UIFooter from '../components/UserSide/UIFooter';

const IMAGES = {
  // ── HERO BANNER BACKGROUND ──────────────────────────────
  // Corporate skyline / business partnership
  heroBg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80',
};

const ClientsPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const clients = [
    { name: 'Global Industries', industry: 'Manufacturing', logo: 'GI', color: 'from-blue-600/20 to-cyan-500/20', icon: <Building2 className="w-8 h-8"/> },
    { name: 'NextGen Corp', industry: 'Logistics', logo: 'NG', color: 'from-purple-600/20 to-pink-500/20', icon: <Globe className="w-8 h-8"/> },
    { name: 'Industrial Solutions', industry: 'Automotive', logo: 'IS', color: 'from-emerald-600/20 to-teal-500/20', icon: <Settings className="w-8 h-8"/> },
    { name: 'FutureMfg', industry: 'Electronics', logo: 'FM', color: 'from-orange-600/20 to-yellow-500/20', icon: <Cpu className="w-8 h-8"/> },
    { name: 'SmartOps', industry: 'Aviation', logo: 'SO', color: 'from-rose-600/20 to-red-500/20', icon: <Zap className="w-8 h-8"/> },
    { name: 'Precision Tech', industry: 'Healthcare', logo: 'PT', color: 'from-indigo-600/20 to-blue-500/20', icon: <ShieldCheck className="w-8 h-8"/> },
    { name: 'AeroGroup', industry: 'Aerospace', logo: 'AG', color: 'from-emerald-600/20 to-cyan-500/20', icon: <TrendingUp className="w-8 h-8"/> },
    { name: 'Prime Systems', industry: 'Energy', logo: 'PS', color: 'from-amber-600/20 to-orange-500/20', icon: <Award className="w-8 h-8"/> },
  ];

  const extendedClients = [...clients, ...clients, ...clients];

  return (
    <div className="bg-[#222831] text-[#DFD0B8] min-h-screen font-poppins user-page-scale selection:bg-[#948979] selection:text-[#222831]">
      <UIHeader />

      {/* Hero Section with Background */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Hero background photo */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.heroBg})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#222831] opacity-85" />

        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#948979] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#393E46] rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider uppercase border border-[#948979]/30 rounded-full bg-[#948979]/5 text-[#948979]">
              Our Global Portfolio
            </span>
            <h1 className="font-barlow text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Empowering <span className="text-[#948979]">Industry Leaders</span> Worldwide
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-[#948979] mb-12">
              We partner with forward-thinking enterprises to streamline operations, 
              enhance productivity, and drive digital transformation in the modern era.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 px-6 py-3 bg-[#393E46]/50 rounded-xl border border-[#948979]/10">
                <span className="text-2xl font-bold text-[#948979]">500+</span>
                <span className="text-sm text-[#DFD0B8]/60">Clients</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-[#393E46]/50 rounded-xl border border-[#948979]/10">
                <span className="text-2xl font-bold text-[#948979]">50+</span>
                <span className="text-sm text-[#DFD0B8]/60">Countries</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-[#393E46]/50 rounded-xl border border-[#948979]/10">
                <span className="text-2xl font-bold text-[#948979]">12+</span>
                <span className="text-sm text-[#DFD0B8]/60">Industries</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Continuous Slider Section */}
      <section className="py-12 bg-[#1a1d22]/50 border-y border-[#948979]/10 overflow-hidden">
        <div className="flex gap-12">
          <motion.div 
            className="flex gap-12 items-center whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {extendedClients.map((client, idx) => (
              <div key={idx} className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer opacity-50 hover:opacity-100">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${client.color} flex items-center justify-center text-xl font-bold text-[#DFD0B8]`}>
                  {client.logo}
                </div>
                <span className="font-barlow text-xl font-bold tracking-tight">{client.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-4">
                Trusted by Enterprises <br/>Across the <span className="text-[#948979]">Spectrum</span>
              </h2>
              <div className="w-20 h-1 bg-[#948979] mb-6"></div>
            </div>
            <p className="max-w-md text-[#948979]">
              From automotive giants to electronic manufacturing specialized firms, 
              the Patel Industries ERP adapts to your unique business DNA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {clients.map((client, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="group relative bg-[#393E46]/30 border border-[#948979]/10 rounded-2xl p-8 hover:bg-[#393E46]/50 transition-all duration-300 overflow-hidden"
              >
                {/* Background Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#948979]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${client.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ring-1 ring-[#948979]/20`}>
                  {React.cloneElement(client.icon, { className: 'w-8 h-8 text-[#DFD0B8]' })}
                </div>

                <h3 className="font-barlow text-2xl font-bold mb-2 group-hover:text-[#948979] transition-colors">
                  {client.name}
                </h3>
                <p className="text-sm text-[#948979] mb-6">{client.industry}</p>
                
                <p className="text-sm text-[#DFD0B8]/60 leading-relaxed mb-8">
                  Implementing enterprise-wide solutions for supply chain optimization and inventory control.
                </p>

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#948979] group-hover:gap-4 transition-all cursor-pointer">
                  View Success Story <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Client Story */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#1a1d22]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#393E46]/80 to-[#222831]/80 rounded-[40px] border border-[#948979]/20 p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <div className="w-full h-full bg-[#948979] blur-[150px]"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <span className="text-[#948979] font-bold text-sm tracking-[0.2em] mb-4 block uppercase">Featured Transformation</span>
                <h2 className="font-barlow text-4xl md:text-6xl font-black mb-8 leading-[1.1]">
                  How TechManufacture Ltd <span className="text-[#948979]">Scaled 300%</span> in 2 Years
                </h2>
                <div className="flex gap-4 mb-8">
                  <div className="px-4 py-2 bg-[#222831] border border-[#948979]/20 rounded-lg">
                    <p className="text-xs text-[#948979] uppercase font-bold mb-1">Efficiency</p>
                    <p className="text-xl font-bold">+45%</p>
                  </div>
                  <div className="px-4 py-2 bg-[#222831] border border-[#948979]/20 rounded-lg">
                    <p className="text-xs text-[#948979] uppercase font-bold mb-1">ROI</p>
                    <p className="text-xl font-bold">18Mo</p>
                  </div>
                </div>
                <button className="px-8 py-4 bg-[#948979] text-[#222831] font-bold rounded-xl hover:bg-[#DFD0B8] transition-all duration-300 flex items-center gap-3">
                  Read Case Study <ArrowRight className="w-5 h-5"/>
                </button>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-[#948979]/20 rounded-[30px] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-[#948979]/30 bg-[#222831] flex items-center justify-center p-12">
                   <div className="text-center">
                     <div className="w-32 h-32 bg-gradient-to-br from-[#948979] to-[#393E46] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black text-[#222831]">
                       TM
                     </div>
                     <p className="font-barlow text-2xl font-bold text-[#DFD0B8]">TechManufacture Ltd</p>
                     <p className="text-[#948979]">Global Electronics Leader</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#948979" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-dots)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-barlow text-4xl md:text-5xl font-bold mb-8">
            Become Our Next <span className="text-[#948979]">Success Story</span>
          </h2>
          <p className="text-[#948979] text-xl mb-12">
            Ready to join the league of elite enterprises? Let's build your custom ERP roadmap together.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-10 py-5 bg-[#948979] text-[#222831] font-bold rounded-2xl text-xl hover:bg-[#DFD0B8] hover:shadow-[0_0_30px_rgba(148,137,121,0.3)] transition-all duration-300">
              Start Your Journey
            </button>
            <button className="px-10 py-5 border-2 border-[#948979] text-[#948979] font-bold rounded-2xl text-xl hover:bg-[#948979] hover:text-[#222831] transition-all duration-300">
              Book a Consultation
            </button>
          </div>
        </div>
      </section>

      <UIFooter />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600;700;900&display=swap');
        
        * { font-family: 'Poppins', sans-serif; }
        h1, h2, h3, h4, h5, h6, .font-barlow { font-family: 'Barlow', sans-serif; }

        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default ClientsPage;
