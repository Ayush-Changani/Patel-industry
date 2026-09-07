import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import UIHeader from '../components/UserSide/UIHeader';
import UIFooter from '../components/UserSide/UIFooter';

const IMAGES = {
  // ── HERO BANNER BACKGROUND ──────────────────────────────
  // Strategic planning / business meeting wide shot
  heroBg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80',
};

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulate form submission
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-[#222831] text-[#DFD0B8] min-h-screen font-poppins user-page-scale selection:bg-[#948979] selection:text-[#222831]">
      <UIHeader />

      {/* Hero Section with Background */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Hero background photo */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${IMAGES.heroBg})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#222831] opacity-85" />

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#948979] opacity-5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-barlow text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter">
              Get in <span className="text-[#948979]">Touch</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-[#948979]">
              Have questions about our ERP solutions or need technical support? 
              Our team of experts is ready to help you optimize your business.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#393E46]/30 border border-[#948979]/20 rounded-[32px] p-8 md:p-12 backdrop-blur-sm"
          >
            <h2 className="font-barlow text-3xl font-bold mb-8">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#948979] mb-2 uppercase tracking-widest">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full bg-[#222831] border ${errors.name ? 'border-red-500' : 'border-[#948979]/20'} rounded-xl px-5 py-4 focus:outline-none focus:border-[#948979] transition-all`}
                    placeholder="Your Name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12}/> {errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#948979] mb-2 uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-[#222831] border ${errors.email ? 'border-red-500' : 'border-[#948979]/20'} rounded-xl px-5 py-4 focus:outline-none focus:border-[#948979] transition-all`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12}/> {errors.email}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#948979] mb-2 uppercase tracking-widest">Subject (Optional)</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-[#222831] border border-[#948979]/20 rounded-xl px-5 py-4 focus:outline-none focus:border-[#948979] transition-all"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#948979] mb-2 uppercase tracking-widest">Message</label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full bg-[#222831] border ${errors.message ? 'border-red-500' : 'border-[#948979]/20'} rounded-xl px-5 py-4 focus:outline-none focus:border-[#948979] transition-all resize-none`}
                  placeholder="Tell us how we can help..."
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12}/> {errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                  isSubmitted 
                  ? 'bg-emerald-500 text-white cursor-default' 
                  : 'bg-[#948979] text-[#222831] hover:bg-[#DFD0B8] hover:shadow-[0_0_30px_rgba(148,137,121,0.2)]'
                }`}
              >
                {isSubmitted ? (
                  <>Message Sent Successfully <CheckCircle2 size={24}/></>
                ) : (
                  <>Send Message <Send size={20}/></>
                )}
              </button>
            </form>
          </motion.div>

          {/* Company Info & Map */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-8"
            >
              <div className="p-6 bg-[#393E46]/20 border border-[#948979]/10 rounded-2xl hover:border-[#948979]/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#948979]/10 flex items-center justify-center text-[#948979] mb-6 group-hover:bg-[#948979] group-hover:text-[#222831] transition-all">
                  <MapPin size={24}/>
                </div>
                <h3 className="font-barlow text-xl font-bold mb-2">Our Office</h3>
                <p className="text-[#948979] text-sm leading-relaxed">
                  123 Industrial Estate, Ahmedabad, Gujarat 380001, India
                </p>
              </div>

              <div className="p-6 bg-[#393E46]/20 border border-[#948979]/10 rounded-2xl hover:border-[#948979]/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#948979]/10 flex items-center justify-center text-[#948979] mb-6 group-hover:bg-[#948979] group-hover:text-[#222831] transition-all">
                  <Phone size={24}/>
                </div>
                <h3 className="font-barlow text-xl font-bold mb-2">Call Us</h3>
                <p className="text-[#948979] text-sm leading-relaxed">
                  +91 (800) 123-4567<br/>
                  Mon-Fri, 9am - 6pm
                </p>
              </div>

              <div className="p-6 bg-[#393E46]/20 border border-[#948979]/10 rounded-2xl hover:border-[#948979]/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#948979]/10 flex items-center justify-center text-[#948979] mb-6 group-hover:bg-[#948979] group-hover:text-[#222831] transition-all">
                  <Mail size={24}/>
                </div>
                <h3 className="font-barlow text-xl font-bold mb-2">Email Us</h3>
                <p className="text-[#948979] text-sm leading-relaxed">
                  contact@patelindustries.com<br/>
                  support@patelindustries.com
                </p>
              </div>

              <div className="p-6 bg-[#393E46]/20 border border-[#948979]/10 rounded-2xl hover:border-[#948979]/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#948979]/10 flex items-center justify-center text-[#948979] mb-6 group-hover:bg-[#948979] group-hover:text-[#222831] transition-all">
                  <Clock size={24}/>
                </div>
                <h3 className="font-barlow text-xl font-bold mb-2">Business Hours</h3>
                <p className="text-[#948979] text-sm leading-relaxed">
                  Mon-Fri: 9:00 AM - 6:00 PM<br/>
                  Sat: 10:00 AM - 2:00 PM
                </p>
              </div>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative h-[350px] rounded-[32px] overflow-hidden border border-[#948979]/20 group"
            >
              <div className="absolute inset-0 bg-[#393E46]/50 flex items-center justify-center">
                <div className="text-center group-hover:scale-105 transition-transform duration-500">
                  <div className="w-20 h-20 bg-[#948979]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#948979]/40">
                    <MapPin size={40} className="text-[#948979]"/>
                  </div>
                  <h4 className="font-barlow text-2xl font-bold mb-2">Interactive Map</h4>
                  <p className="text-[#948979] text-sm px-8">Ahmedabad, Gujarat 380001, India</p>
                </div>
              </div>
              {/* This would be where you embed a real Google Map iframe */}
              <div className="w-full h-full opacity-30 grayscale contrast-125" style={{ backgroundImage: 'linear-gradient(45deg, #222831 25%, #393E46 25%, #393E46 50%, #222831 50%, #222831 75%, #393E46 75%, #393E46 100%)', backgroundSize: '40px 40px' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ CTA Section */}
      <section className="py-24 bg-[#1a1d22]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-barlow text-4xl font-bold mb-6">Frequently Asked Questions</h2>
          <p className="text-[#948979] mb-12">
            Can't find what you're looking for? Check out our help center or speak directly to a representative.
          </p>
          <div className="flex justify-center gap-6">
            <button className="px-8 py-3 border border-[#948979] text-[#948979] font-bold rounded-xl hover:bg-[#948979] hover:text-[#222831] transition-all">
              Visit FAQ Center
            </button>
            <button className="px-8 py-3 bg-[#948979] text-[#222831] font-bold rounded-xl hover:bg-[#DFD0B8] transition-all">
              Live Chat Support
            </button>
          </div>
        </div>
      </section>

      <UIFooter />
    </div>
  );
};

export default ContactUsPage;
