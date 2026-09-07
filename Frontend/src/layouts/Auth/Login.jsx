import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UIHeader from '../../components/UserSide/UIHeader';
import UIFooter from '../../components/UserSide/UIFooter';
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate("/Welcome"); 
    } else {
      setError(result.message);
    }
  };

  return (
        <div className="bg-[#222831] text-[#DFD0B8] min-h-screen font-poppins overflow-hidden user-page-scale">

    <UIHeader />
    <div className="min-h-screen bg-[#222831] flex flex-col items-center justify-center pt-[60px] p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#DFD0B8] rounded-[100%] blur-[120px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-[#948979] rounded-[100%] blur-[100px] opacity-10 pointer-events-none"></div>

      {/* Glassmorphism Container */}
      <div className="w-full max-w-md bg-[#ebe2cd]/85 backdrop-blur-lg rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-10 border border-[#393E46]/30">
        
        <div className="p-10 text-center border-b border-[#393E46]/20 bg-[#DFD0B8]/20 relative overflow-hidden">
          {/* Subtle logo background effect */}
          <div className="absolute -top-12 -right-12 text-8xl text-[#948979] opacity-10 font-black pointer-events-none transform rotate-12">
            PI
          </div>

          <div className="mx-auto w-16 h-16 bg-[#222831]/90 rounded-2xl flex items-center justify-center mb-6 shadow-md transform -rotate-3 hover:rotate-3 transition-transform duration-300">
            <span className="text-3xl font-bold text-[#DFD0B8]">P I</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#222831] tracking-tight">Welcome Back</h1>
          <p className="text-sm text-[#393E46] mt-2 font-medium">Log in to Patel Industries Portal</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-100/90 border border-red-300 text-red-700 text-sm rounded-xl text-center font-semibold animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-1 block relative group">
            <label className="text-xs font-bold text-[#393E46] uppercase tracking-wider ml-1 mb-1 block">Email</label>
            <div className="relative flex items-center">
                <div className="absolute left-4 text-[#393E46] transition-colors">
                    <FaUser size={16} />
                </div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#393E46]/40 bg-white/60 text-[#222831] focus:outline-none focus:ring-[3px] focus:ring-[#948979] focus:bg-white/90 transition-all placeholder-[#393E46]/60 font-medium backdrop-blur-sm"
                    placeholder="Enter your email"
                />
            </div>
          </div>

          <div className="space-y-1 block relative group">
            <label className="text-xs font-bold text-[#393E46] uppercase tracking-wider ml-1 mb-1 block">Password</label>
            <div className="relative flex items-center">
                <div className="absolute left-4 text-[#393E46] transition-colors">
                    <FaLock size={16} />
                </div>
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-[#393E46]/40 bg-white/60 text-[#222831] focus:outline-none focus:ring-[3px] focus:ring-[#948979] focus:bg-white/90 transition-all placeholder-[#393E46]/60 font-medium tracking-wide backdrop-blur-sm"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1.5 text-[#393E46] hover:text-[#222831] focus:outline-none transition-colors rounded-lg hover:bg-[#393E46]/10"
                    title={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
            </div>
          </div>

          <div className="pt-2">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 text-base font-bold uppercase tracking-wider flex justify-center items-center shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-[#948979] text-[#222831] hover:bg-[#393E46] hover:text-[#DFD0B8] rounded-[14px] disabled:opacity-70 disabled:hover:translate-y-0 border border-[#393E46]/30 backdrop-blur-sm"
            >
              {isSubmitting ? (
                <span className="w-6 h-6 border-2 border-[#222831] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        <div className="p-6 border-t border-[#393E46]/20 bg-[#ebe2cd]/30 text-center backdrop-blur-sm">
          <p className="text-xs text-[#393E46] font-semibold tracking-wide">Secure Portal &copy; {new Date().getFullYear()} Patel Industries</p>
        </div>
      </div>
    </div>
    <UIFooter />
    </div>
  );
};

export default Login;
