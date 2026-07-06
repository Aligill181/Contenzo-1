import React, { useState, useEffect } from "react";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import HeroSection from "./components/HeroSection.tsx";
import GlobeSection from "./components/GlobeSection.tsx";
import MarketplaceView from "./components/MarketplaceView.tsx";
import BuyerDashboard from "./components/BuyerDashboard.tsx";
import SellerDashboard from "./components/SellerDashboard.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";
import AuthModal from "./components/AuthModal.tsx";
import { 
  Compass, Award, ShieldCheck, Mail, Phone, MapPin, 
  ChevronRight, ArrowRight, MessageSquare, Star, Sparkles, Check, Sparkle,
  Calendar
} from "lucide-react";
import { User, BlogArticle, FAQ, Testimonial } from "./types.js";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [currentView, setCurrentView] = useState("home");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Lists
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Selected full blog reader
  const [readingBlog, setReadingBlog] = useState<BlogArticle | null>(null);

  // FAQ open indexes
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactStatus, setContactStatus] = useState("");

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
    fetchStaticData();
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const uData = await res.json();
        setUser(uData);
      } else {
        // Clear stale session
        handleLogout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStaticData = async () => {
    try {
      const [resBlogs, resFaqs, resTestimonials] = await Promise.all([
        fetch("/api/blogs"),
        fetch("/api/faqs"),
        fetch("/api/testimonials")
      ]);
      if (resBlogs.ok) setBlogs(await resBlogs.json());
      if (resFaqs.ok) setFaqs(await resFaqs.json());
      if (resTestimonials.ok) setTestimonials(await resTestimonials.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuthSuccess = (newToken: string, userProfile: any) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userProfile);
    setIsAuthOpen(false);
    
    // Redirect based on role
    if (userProfile.role === "ADMIN") {
      setCurrentView("admin-dashboard");
    } else if (userProfile.role === "SELLER") {
      setCurrentView("seller-dashboard");
    } else {
      setCurrentView("marketplace");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCurrentView("home");
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  // Submit Contact Form
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("Sending...");
    setTimeout(() => {
      setContactStatus("Your message has been sent successfully! Our customer support team will contact you shortly.");
      setContactName("");
      setContactEmail("");
      setContactMsg("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      
      {/* 1. Header component */}
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={() => setIsAuthOpen(true)}
        onSetView={setCurrentView}
        currentView={currentView}
      />

      {/* 2. Main content view router */}
      <main className="flex-grow">
        
        {/* VIEW A: HOME PAGE */}
        {currentView === "home" && (
          <div className="space-y-0">
            
            {/* Hero network backlink nodes */}
            <HeroSection 
              onStartBuying={() => {
                if (user) setCurrentView("marketplace");
                else setIsAuthOpen(true);
              }}
              onBecomePublisher={() => {
                if (user) {
                  if (user.role === "SELLER") setCurrentView("seller-dashboard");
                  else setCurrentView("marketplace");
                } else {
                  setIsAuthOpen(true);
                }
              }}
              onSetView={setCurrentView}
            />

            {/* Globe SEO Rank animation */}
            <GlobeSection />

            {/* Trusted Statistics & Platform Advantages */}
            <section className="py-20 bg-zinc-950/40 border-b border-zinc-900 relative">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Pricing Advantages</span>
                <h2 className="text-3xl font-extrabold text-white mt-2">Zero Markup. Direct Value.</h2>
                <p className="text-sm text-zinc-400 mt-3 max-w-xl mx-auto">
                  Traditional SEO link building agencies charge up to 300% markup on guest posts. CONTENZO is a direct peer-to-peer marketplace with 0% commissions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  {[
                    { title: "Direct Collaboration", desc: "No middleman, account managers, or hidden fees. Chat directly with the actual website publishers.", icon: Award },
                    { title: "Escrow Link Protection", desc: "Your placement funds are held in secure escrow. Publishers are only compensated when backlinks are active.", icon: ShieldCheck },
                    { title: "Transparent Metrics", desc: "Monitor real DA, DR, and verified monthly traffic figures pulling directly from Moz and Ahrefs.", icon: Compass }
                  ].map((benefit, idx) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 hover:border-zinc-800 transition-colors">
                        <div className="h-12 w-12 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-white">{benefit.title}</h4>
                        <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{benefit.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Testimonials List */}
            <section className="py-20 bg-black border-b border-zinc-900">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Testimonials</span>
                  <h2 className="text-3xl font-bold text-white mt-2">Endorsed by Top Agencies</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {testimonials.map((test) => (
                    <div key={test.id} className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-4">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(test.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed italic">"{test.content}"</p>
                      
                      <div className="flex items-center gap-3 pt-2">
                        <img src={test.avatarUrl} alt={test.name} className="w-10 h-10 rounded-full object-cover border border-zinc-800" />
                        <div>
                          <strong className="text-xs text-white block">{test.name}</strong>
                          <span className="text-[10px] text-zinc-500">{test.role}, {test.company}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* How It Works bento grid */}
            <section className="py-20 bg-zinc-950/40 border-b border-zinc-900">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Operations flow</span>
                  <h2 className="text-3xl font-extrabold text-white mt-2">Get backlinks in 3 simple steps</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  {[
                    { step: "01", title: "Select Website", desc: "Browse our commission-free list and sort by DA, DR, and niche category relevancy." },
                    { step: "02", title: "Input Keywords", desc: "Submit your destination target link URL, anchor text keyword phrase, and instructions." },
                    { step: "03", title: "Backlink Live!", desc: "The publisher hosts the dofollow article permanently. Escrow unlocks on link confirmation check." }
                  ].map((card, idx) => (
                    <div key={idx} className="relative p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3">
                      <span className="text-4xl font-extrabold text-purple-500/25 font-mono block">{card.step}</span>
                      <h4 className="text-base font-bold text-white">{card.title}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Start Buying Pitch CTA Banner */}
            <section className="py-16 bg-gradient-to-tr from-purple-950/30 to-blue-950/20 border-b border-zinc-900">
              <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <Sparkle className="w-8 h-8 text-purple-400 mx-auto animate-spin" />
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to Skyrocket Your Search Traffic?</h2>
                <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  Join thousands of SaaS founders, marketing managers, and enterprise agencies scaling links at zero agency overhead.
                </p>
                <button
                  onClick={() => {
                    if (user) setCurrentView("marketplace");
                    else setIsAuthOpen(true);
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 mx-auto"
                >
                  Enter Verified Marketplace Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </section>

          </div>
        )}

        {/* VIEW B: PUBLISHER MARKETPLACE */}
        {currentView === "marketplace" && (
          <MarketplaceView 
            user={user} 
            onOpenAuth={() => setIsAuthOpen(true)}
            onOrderCompleted={fetchCurrentUser} // updates balance in header
            onSetView={setCurrentView}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        )}

        {/* VIEW C: SAAS BLOG */}
        {currentView === "blogs" && (
          <section className="py-16 bg-black text-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            
            {!readingBlog ? (
              <>
                <div className="text-center md:text-left mb-10 pb-6 border-b border-zinc-900">
                  <h1 className="text-3xl font-extrabold">CONTENZO Link Building SaaS Journal</h1>
                  <p className="text-sm text-zinc-400 mt-2">Latest technical off-page guides, algorithm updates, and agency growth playbooks.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {blogs.map((blog) => (
                    <article key={blog.id} className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden hover:border-zinc-800 transition-colors flex flex-col">
                      <img src={blog.imageUrl} alt={blog.title} className="h-48 w-full object-cover" />
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                          <h3 className="text-base font-bold text-white leading-tight">{blog.title}</h3>
                          <p className="text-xs text-zinc-400 leading-normal line-clamp-3">{blog.excerpt}</p>
                        </div>

                        <button
                          onClick={() => setReadingBlog(blog)}
                          className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 self-start pt-2 group"
                        >
                          Read Full Article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                <button 
                  onClick={() => setReadingBlog(null)}
                  className="text-xs font-bold text-zinc-500 hover:text-white underline flex items-center gap-1"
                >
                  ← Back to Articles Index
                </button>

                <img src={readingBlog.imageUrl} alt={readingBlog.title} className="w-full h-72 object-cover rounded-3xl" />
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{new Date(readingBlog.createdAt).toLocaleDateString()} • By {readingBlog.author}</span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{readingBlog.title}</h1>
                </div>

                <p className="text-xs font-semibold text-zinc-300 italic bg-zinc-900/30 border-l-2 border-purple-500 p-4 rounded-r-xl">
                  "{readingBlog.excerpt}"
                </p>

                <div className="text-sm text-zinc-400 leading-relaxed space-y-4 pt-2">
                  <p>{readingBlog.content}</p>
                  <p>In conclusion, scaling links requires strict selection of contextual relevancy. Using a Direct Marketplace like CONTENZO ensures you retain 100% control of editorial placements without wasting budget on intermediate markups.</p>
                </div>
              </div>
            )}

          </section>
        )}

        {/* VIEW D: FAQS SUPPORT */}
        {currentView === "faqs" && (
          <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Support Hub</span>
              <h1 className="text-3xl font-extrabold text-white mt-1">Frequently Asked Support</h1>
              <p className="text-sm text-zinc-400 mt-2">Everything you need to know about our Direct Escrow Placement platform.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full text-left p-5 flex justify-between items-center font-bold text-sm text-zinc-200 hover:text-white transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-90 text-white" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="p-5 pt-0 border-t border-zinc-900 text-xs text-zinc-400 leading-relaxed bg-zinc-900/10">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* VIEW E: CONTACT PAGE */}
        {currentView === "contact" && (
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">Contact Office</span>
              <h1 className="text-3xl font-extrabold text-white mt-1">Get in Touch with CONTENZO</h1>
              <p className="text-sm text-zinc-400 mt-2">Our technical client success desk is ready to help your agency scale links.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Column 1: Info & Details */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6">
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wider">Corporate Headquarters</h3>
                  
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-white block font-semibold mb-0.5">Company Address</strong>
                        <span className="text-zinc-400 leading-relaxed">
                          9 Kings Hall, Oldham, OL8 1DP, United Kingdom
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 mt-0.5">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-white block font-semibold mb-0.5">Corporate Phone</strong>
                        <a href="tel:+447716719861" className="text-zinc-400 hover:text-white transition-colors">+44 7716 719861</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-white block font-semibold mb-0.5">Office Email</strong>
                        <a href="mailto:hello@contenzo.co.uk" className="text-zinc-400 hover:text-white transition-colors">hello@contenzo.co.uk</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Embedded google map frame */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden h-64 shadow-lg">
                  <iframe 
                    title="Contenzo Corporate Office Oldham Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2371.492576136248!2d-2.1223945841555546!3d53.530935580018595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487bb0db32e60da3%3A0x6b104c86e0fc436a!2sOldham%20OL8%201DP!5e0!3m2!1sen!2sbh!4v1680000000000!5m2!1sen!2sbh"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) opacity(85%)" }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

              </div>

              {/* Column 2: Working Contact Form */}
              <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-bold mb-4">Send us an Immediate Message</h3>
                
                {contactStatus && (
                  <div className={`p-3 rounded-xl text-xs mb-4 ${contactStatus.includes("sent") ? "bg-emerald-950/40 border border-emerald-800 text-emerald-400" : "bg-zinc-900 text-zinc-400"}`}>
                    {contactStatus}
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Your Name</label>
                      <input
                        type="text"
                        placeholder="Jonathan Jenkins"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Email Address</label>
                      <input
                        type="email"
                        placeholder="jonathan@agency.co.uk"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-semibold">Your Message Body</label>
                    <textarea
                      placeholder="Discussing bulk orders, customized niche filtering, agency plans..."
                      rows={5}
                      required
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow shadow-purple-500/10 active:scale-95 transition-all"
                  >
                    Submit Message
                  </button>
                </form>
              </div>

            </div>
          </section>
        )}

        {/* USER ROLE WORKSPACE PANEL REDIRECTS */}
        {currentView === "buyer-dashboard" && user && (
          <BuyerDashboard 
            user={user} 
            onRefreshUser={fetchCurrentUser}
            onSetView={setCurrentView}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        )}

        {currentView === "seller-dashboard" && user && (
          <SellerDashboard 
            user={user} 
            onRefreshUser={fetchCurrentUser}
            onSetView={setCurrentView}
          />
        )}

        {currentView === "admin-dashboard" && user && (
          <AdminDashboard 
            user={user} 
            onSetView={setCurrentView}
          />
        )}

      </main>

      {/* 3. Global Auth modal popup */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 4. Footer component */}
      <Footer onSetView={setCurrentView} />

    </div>
  );
}
