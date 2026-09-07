import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { 
  FiPackage, FiUserPlus, FiFileText, FiActivity, 
  FiClock, FiMapPin, FiShield, FiTrendingUp 
} from "react-icons/fi";

/* ═══════════════════════════════════════════════════════════════════════════
   CRYSTAL & GLASS DESIGN SYSTEM 2.0
   - 3D Interactive Tilt Engine
   - Light-Sweep Refraction Effects
   - Ultra-High Blur Glassmorphism
   - Noise Grain Texture Overlay
═══════════════════════════════════════════════════════════════════════════ */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,700&family=Outfit:wght@300;400;500;600;700&display=swap');

  :root {
    --bg-dark: #070708;
    --accent-gold: #cfc8b0;
    --accent-silver: #e2e8f0;
    --glass-blur: 32px;
  }

  .noise-bg {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: url("https://grainy-gradients.vercel.app/noise.svg");
    opacity: 0.05;
    pointer-events: none;
    z-index: 50;
    filter: contrast(150%) brightness(100%);
  }

  .liquid-mesh {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: 
      radial-gradient(circle at 10% 10%, rgba(207, 200, 176, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 90% 90%, rgba(226, 232, 240, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(138, 128, 112, 0.05) 0%, transparent 60%),
      var(--bg-dark);
    z-index: -2;
    overflow: hidden;
  }

  .floating-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    z-index: -1;
    opacity: 0.3;
  }

  .crystal-card {
    position: relative;
    background: rgba(255, 255, 255, 0.015);
    backdrop-filter: blur(var(--glass-blur)) saturate(180%);
    -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 
      inset 0 0 40px rgba(255, 255, 255, 0.01),
      0 20px 50px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    transition: border-color 0.4s ease;
  }

  .crystal-card::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(
      to right, 
      transparent, 
      rgba(255, 255, 255, 0.1), 
      transparent
    );
    transform: skewX(-25deg);
    transition: 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    pointer-events: none;
  }

  .crystal-card:hover::before {
    left: 150%;
  }

  .prism-border {
    position: absolute;
    inset: 0;
    border: 1.5px solid transparent;
    background: linear-gradient(135deg, rgba(207,200,176,0.3) 0%, transparent 40%, rgba(138,128,112,0.2) 100%) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
    transition: opacity 0.4s ease;
  }

  .crystal-card:hover .prism-border {
    opacity: 1;
  }

  .luxury-serif { font-family: 'Playfair Display', serif; }
  .font-outfit { font-family: 'Outfit', sans-serif; }

  .text-glow {
    text-shadow: 0 0 15px rgba(207, 200, 176, 0.4);
  }

  .custom-scrollbar-sidebar::-webkit-scrollbar { width: 3px; }
  .custom-scrollbar-sidebar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar-sidebar::-webkit-scrollbar-thumb { background: rgba(207, 200, 176, 0.15); border-radius: 10px; }
`;

/* ─────────────────────────────────────────────
   3D Tilt Card Helper Component
───────────────────────────────────────────── */
const CrystalTilt = ({ children, className = "", style = {} }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });

  function onMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", ...style }}
      className={`crystal-card ${className}`}
    >
      <div className="prism-border" />
      <div style={{ transform: "translateZ(30px)" }}>{children}</div>
    </motion.div>
  );
};

const containerVars = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  }
};

const itemVars = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }
};

const Welcome = () => {
  const { user, menuPermissions } = useAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const initials = (user?.name || "U").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  const firstName = user?.name?.split(' ')[0] || "Director";

  return (
    <>
      <style>{STYLES}</style>
      <div className="noise-bg" />
      
      <div className="flex h-screen overflow-hidden bg-[#070708]">
        <Sidebar theme="dark" />

        <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden relative">
          
          {/* BACKGROUND ANIMATION */}
          <div className="liquid-mesh" />
          <motion.div 
            animate={{ 
              x: ["-10%", "15%", "5%"],
              y: ["-5%", "10%", "-5%"],
              scale: [1, 1.4, 1]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="floating-orb w-[600px] h-[600px] bg-[#cfc8b0]" 
            style={{ top: "-10%", right: "5%" }} 
          />
          <motion.div 
            animate={{ 
              x: ["10%", "-10%", "0%"],
              y: ["10%", "20%", "10%"],
              scale: [1.2, 0.8, 1.2]
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="floating-orb w-[700px] h-[700px] bg-[#393E46]" 
            style={{ bottom: "-10%", left: "-5%" }} 
          />

          <Header />

          <motion.div 
            variants={containerVars}
            initial="hidden"
            animate="visible"
            className="flex-1 overflow-y-auto p-12 custom-scrollbar-sidebar z-10"
          >
            <div className="max-w-7xl mx-auto space-y-12">
              
              {/* HERO INTERACTIVE SECTION */}
              <div className="grid lg:grid-cols-3 gap-10">
                <motion.div variants={itemVars} className="lg:col-span-2">
                  <CrystalTilt className="rounded-[40px] p-12 flex flex-col justify-between min-h-[400px]">
                    <div>
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] tracking-[0.3em] text-[#cfc8b0] uppercase mb-10"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                        PATEL INDUSTRIES • SECURE ACCESS
                      </motion.div>
                      
                      <h1 className="luxury-serif text-6xl md:text-8xl font-extrabold text-white mb-6 tracking-tighter leading-[0.9]">
                        Welcome back, <br/>
                        <span className="text-glow text-[#cfc8b0] italic font-medium">{firstName}</span>
                      </h1>
                      <p className="font-outfit text-gray-400 max-w-lg text-lg leading-relaxed mt-8 opacity-80">
                        Operational efficiency is at peak performance. All systems report verified and synchronized.
                      </p>
                    </div>

                    <div className="flex items-center gap-8 mt-12">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-18 h-18 rounded-3xl bg-gradient-to-br from-[#cfc8b0] to-[#8a8070] flex items-center justify-center text-3xl font-black text-[#070708] shadow-[0_10px_30px_rgba(207,200,176,0.2)]"
                      >
                        {initials}
                      </motion.div>
                      <div>
                        <div className="text-white font-bold text-xl font-outfit tracking-tight">{user?.name}</div>
                        <div className="text-[#8a8070] text-xs uppercase tracking-[0.25em] font-medium font-outfit mt-1">{user?.role || "SYSTEM ADMINISTRATOR"}</div>
                      </div>
                    </div>
                  </CrystalTilt>
                </motion.div>

                <motion.div variants={itemVars}>
                  <CrystalTilt className="rounded-[40px] p-10 h-full flex flex-col justify-between border-[#cfc8b0]/10 bg-gradient-to-br from-white/[0.04] to-transparent">
                    <div>
                      <div className="flex items-center justify-between mb-10">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                          <FiClock className="text-[#cfc8b0] text-2xl" />
                        </div>
                        <div className="text-right">
                          <div className="luxury-serif text-4xl text-white tracking-tighter font-light">
                            {now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                            <span className="text-base ml-1.5 opacity-40 font-mono italic">:{now.toLocaleTimeString('en-IN', { hour12: false, second: '2-digit' }).split(':')[2]}</span>
                          </div>
                          <div className="font-outfit text-[10px] text-[#8a8070] uppercase tracking-[0.2em] font-semibold mt-2">
                            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-7 mt-12 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                        {[
                          { label: "Deployment", val: "Rajkot GIDC", icon: FiMapPin, color: "text-blue-400" },
                          { label: "Operation", val: "Nominal", icon: FiActivity, color: "text-emerald-400" },
                          { label: "Encrypted", val: "AES-256", icon: FiShield, color: "text-[#cfc8b0]" }
                        ].map((s, i) => (
                          <div key={i} className="flex items-center justify-between group cursor-default">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}>
                                <s.icon size={14} />
                              </div>
                              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-outfit">{s.label}</span>
                            </div>
                            <span className="text-xs font-bold text-white group-hover:text-[#cfc8b0] transition-colors font-outfit">{s.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-5 rounded-2xl border border-white/10 text-white text-[10px] uppercase tracking-[0.3em] font-extrabold mt-10 font-outfit transition-all shadow-lg"
                    >
                      Audit Intelligence
                    </motion.button>
                  </CrystalTilt>
                </motion.div>
              </div>

              {/* COMMAND GRID INTERACTIVE */}
              <motion.div variants={itemVars} className="space-y-8">
                <div className="flex items-end justify-between px-2">
                  <div>
                    <h2 className="luxury-serif text-3xl text-white font-semibold">Intelligence Deck</h2>
                    <p className="text-[10px] text-[#8a8070] uppercase tracking-[0.2em] mt-1 font-outfit">Priority System Fast-Tracks</p>
                  </div>
                  <div className="h-[1px] flex-1 mx-8 bg-gradient-to-r from-[#cfc8b0]/20 to-transparent mb-4" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: "New Workforce", icon: FiUserPlus, bg: "from-blue-500/20" },
                    { label: "Stock Vault", icon: FiPackage, bg: "from-purple-500/20" },
                    { label: "Acquisitions", icon: FiFileText, bg: "from-[#cfc8b0]/20" },
                    { label: "Market Flow", icon: FiTrendingUp, bg: "from-emerald-500/20" }
                  ].map((cmd, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -10, rotate: 2 }}
                      className={`crystal-card rounded-[32px] p-8 cursor-pointer group transition-all duration-500 bg-gradient-to-br ${cmd.bg} to-transparent border-white/5 hover:border-[#cfc8b0]/30 shadow-2xl overflow-visible`}
                    >
                      <div className="prism-border" />
                      <div className="relative z-10">
                        <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:bg-[#cfc8b0] group-hover:shadow-[0_0_30px_rgba(207,200,176,0.3)] transition-all duration-500">
                          <cmd.icon className="text-[#cfc8b0] text-2xl group-hover:text-[#070708] transition-colors" />
                        </div>
                        <div className="text-white font-bold text-lg group-hover:text-[#cfc8b0] transition-colors font-outfit tracking-tight">{cmd.label}</div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-2 font-bold font-outfit group-hover:text-gray-400">Initialize Unit</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* MODULE OVERVIEW CRYSTAL PANEL */}
              <motion.div variants={itemVars}>
                <CrystalTilt className="rounded-[40px] p-10 bg-gradient-to-r from-white/[0.03] to-transparent">
                  <div className="flex items-center justify-between mb-10 px-2">
                    <div>
                      <h3 className="luxury-serif text-2xl text-white font-medium">Core Modules</h3>
                      <span className="text-[10px] text-[#8a8070] uppercase tracking-widest font-outfit">Permissions Synchronization</span>
                    </div>
                    <div className="px-5 py-2 rounded-full bg-[#cfc8b0]/10 border border-[#cfc8b0]/20 text-[10px] text-[#cfc8b0] font-black tracking-widest uppercase">
                      {menuPermissions?.length || 0} TOTAL NODES
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-x-16 gap-y-8 px-2 pb-4">
                    {menuPermissions?.slice(0, 6).map((m, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ x: 10 }}
                        className="group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[13px] font-bold text-gray-300 group-hover:text-[#cfc8b0] transition-colors font-outfit uppercase tracking-tighter">
                            {m.master_menu_name}
                          </span>
                          <span className="text-[10px] text-[#8a8070] font-mono opacity-60 italic">{m.sub_menus?.length || 0} SUB-UNITS</span>
                        </div>
                        <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 2, delay: idx * 0.1, ease: "circOut" }}
                            className="h-full bg-gradient-to-r from-[#cfc8b0] to-transparent shadow-[0_0_10px_rgba(207,200,176,0.3)]"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CrystalTilt>
              </motion.div>

            </div>
          </motion.div>
          
          <Footer />
        </main>
      </div>
    </>
  );
};

export default Welcome;