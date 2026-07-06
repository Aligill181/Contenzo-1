import React, { useState, useEffect } from "react";
import { 
  Search, SlidersHorizontal, ArrowUpDown, BrainCircuit, Heart, 
  ShoppingCart, Globe, Sparkles, Plus, AlertCircle, CheckCircle, 
  Info, Check, ShieldAlert, Link2, Filter, FileSpreadsheet, Send
} from "lucide-react";
import { Listing, UserRole } from "../types.js";

interface MarketplaceViewProps {
  user: any | null;
  onOpenAuth: () => void;
  onOrderCompleted: () => void;
  onSetView: (view: string) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

export default function MarketplaceView({ 
  user, onOpenAuth, onOrderCompleted, onSetView, wishlist, onToggleWishlist 
}: MarketplaceViewProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minDA, setMinDA] = useState<number>(0);
  const [minDR, setMinDR] = useState<number>(0);
  const [minTraffic, setMinTraffic] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [onlyDofollow, setOnlyDofollow] = useState(false);
  const [onlyPermanent, setOnlyPermanent] = useState(false);
  const [maxTurnaround, setMaxTurnaround] = useState<number>(7);

  // Sorting
  const [sortBy, setSortBy] = useState<keyof Listing>("domainRating");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Selection & Purchase modal
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [anchorText, setAnchorText] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "PAYPAL" | "WALLET">("STRIPE");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  // AI Content Assistant state
  const [aiListingId, setAiListingId] = useState<string | null>(null);
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState("");

  const categories = [
    "All", "Technology", "Crypto", "Finance", "Business", "Health", 
    "News", "Betting", "Casino", "CBD", "Dating", "Education", 
    "Fashion", "Travel", "Adult"
  ];

  const countries = ["All", "United States", "United Kingdom", "Canada", "Australia", "Worldwide", "Malta"];
  const languages = ["All", "English", "Spanish", "German", "French"];

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run AI Outline Assistant
  const handleGenerateOutline = async (listing: Listing) => {
    setAiListingId(listing.id);
    setAiLoading(true);
    setAiIdeas([]);
    setAiSource("");

    try {
      const res = await fetch("/api/ai/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteName: listing.websiteName, category: listing.category })
      });
      const data = await res.json();
      if (res.ok) {
        setAiIdeas(data.ideas || []);
        setAiSource(data.source || "");
      } else {
        setAiIdeas(["Failed to generate ideas: " + data.error]);
      }
    } catch (err: any) {
      setAiIdeas(["API error generating outline concepts."]);
    } finally {
      setAiLoading(false);
    }
  };

  // Validate coupon
  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode) return;

    try {
      const res = await fetch("/api/wallet/coupon", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok) {
        setCouponDiscount(data.discountPercent);
        setCouponSuccess(`Coupon applied! ${data.discountPercent}% discount activated.`);
      } else {
        setCouponError(data.error || "Invalid coupon code.");
        setCouponDiscount(0);
      }
    } catch (e) {
      setCouponError("Could not validate coupon.");
    }
  };

  // Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseError("");
    setPurchaseSuccess("");

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!targetUrl || !anchorText) {
      setPurchaseError("Target URL and Anchor keyword phrases are required.");
      return;
    }

    setPurchasing(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          listingId: selectedListing?.id,
          targetUrl,
          anchorText,
          specialInstructions,
          paymentMethod,
          couponCode: couponDiscount > 0 ? couponCode : undefined
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setPurchaseSuccess("Your order has been submitted and verified! Fund held safely in escrow.");
        setTimeout(() => {
          setSelectedListing(null);
          onOrderCompleted(); // refreshes balances and switches views
          onSetView("buyer-dashboard");
        }, 3000);
      } else {
        setPurchaseError(data.error || "Transaction failed.");
      }
    } catch (err) {
      setPurchaseError("Failed to dispatch order transaction.");
    } finally {
      setPurchasing(false);
    }
  };

  // Filter listings based on controls
  const filteredListings = listings.filter((listing) => {
    const matchSearch = listing.websiteName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (listing.notes && listing.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCategory = selectedCategory === "All" || listing.category === selectedCategory;
    const matchCountry = selectedCountry === "All" || listing.country === selectedCountry;
    const matchLanguage = selectedLanguage === "All" || listing.language === selectedLanguage;

    const matchDA = listing.domainAuthority >= minDA;
    const matchDR = listing.domainRating >= minDR;
    const matchTraffic = listing.traffic >= minTraffic;
    const matchPrice = listing.price <= maxPrice;
    
    const matchDofollow = !onlyDofollow || listing.isDofollow;
    const matchPermanent = !onlyPermanent || listing.isPermanentLink;
    const matchTurnaround = listing.turnaroundTime <= maxTurnaround;

    return matchSearch && matchCategory && matchCountry && matchLanguage && 
           matchDA && matchDR && matchTraffic && matchPrice && 
           matchDofollow && matchPermanent && matchTurnaround;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (typeof aVal === "string") {
      aVal = (aVal as string).toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: keyof Listing) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  return (
    <div id="marketplace-root" className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Marketplace Hero pitch */}
        <div className="mb-10 text-center md:text-left md:flex md:items-center md:justify-between border-b border-zinc-900 pb-8">
          <div>
            <h1 id="market-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Verified Publisher Marketplace
            </h1>
            <p className="text-zinc-400 mt-2 max-w-2xl text-sm">
              Connect directly with verified webmasters. Zero commission. Zero markups. No premium agency pricing. Use our Gemini-powered SEO assistant to generate instant ideas!
            </p>
          </div>
          {user?.role === UserRole.SELLER && (
            <button
              onClick={() => onSetView("seller-dashboard")}
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-xs font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Add My Website Listing
            </button>
          )}
        </div>

        {/* Dynamic Filters Side Panel & Search */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Advanced Search Filters */}
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 space-y-6 h-fit backdrop-blur-md">
            
            <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter Listings
              </h3>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setMinDA(0);
                  setMinDR(0);
                  setMinTraffic(0);
                  setMaxPrice(1000);
                  setSelectedCountry("All");
                  setSelectedLanguage("All");
                  setOnlyDofollow(false);
                  setOnlyPermanent(false);
                  setMaxTurnaround(7);
                }}
                className="text-[10px] text-zinc-500 hover:text-white transition-colors underline"
              >
                Clear Filters
              </button>
            </div>

            {/* Keyword search */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Search Keywords</label>
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Website name or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 block">Niche Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Price slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-zinc-400">
                <span>Max Budget</span>
                <span className="text-purple-400 font-mono">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="30"
                max="1000"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Metrics Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 block">Min DA (Moz)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minDA || ""}
                  onChange={(e) => setMinDA(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 block">Min DR (Ahrefs)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minDR || ""}
                  onChange={(e) => setMinDR(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Traffic input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 block">Min Traffic (Monthly)</label>
              <select
                value={minTraffic}
                onChange={(e) => setMinTraffic(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="0">Any Traffic</option>
                <option value="10000">10k+ visits</option>
                <option value="50000">50k+ visits</option>
                <option value="100000">100k+ visits</option>
                <option value="500000">500k+ visits</option>
              </select>
            </div>

            {/* Country / Language */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 block">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 block">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                >
                  {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Toggle checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyDofollow}
                  onChange={(e) => setOnlyDofollow(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-800 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-zinc-300">Requires Dofollow Links</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyPermanent}
                  onChange={(e) => setOnlyPermanent(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-800 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-zinc-300">Requires Permanent Posts</span>
              </label>
            </div>

          </div>

          {/* Column 2: Listings Inventory Index */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Index Header & Sort order */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs font-medium text-zinc-400">
                Showing <strong className="text-white">{sortedListings.length}</strong> matching premium publishers
              </p>
              
              {/* Sort keys */}
              <div className="flex gap-2 text-xs">
                <span className="text-zinc-500 self-center">Sort by:</span>
                <button 
                  onClick={() => toggleSort("domainRating")}
                  className={`px-2 py-1 rounded border transition-all ${sortBy === "domainRating" ? "bg-purple-900/20 border-purple-500/50 text-purple-200" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}
                >
                  DR (Ahrefs) {sortBy === "domainRating" && (sortDirection === "asc" ? "▲" : "▼")}
                </button>
                <button 
                  onClick={() => toggleSort("traffic")}
                  className={`px-2 py-1 rounded border transition-all ${sortBy === "traffic" ? "bg-purple-900/20 border-purple-500/50 text-purple-200" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}
                >
                  Traffic {sortBy === "traffic" && (sortDirection === "asc" ? "▲" : "▼")}
                </button>
                <button 
                  onClick={() => toggleSort("price")}
                  className={`px-2 py-1 rounded border transition-all ${sortBy === "price" ? "bg-purple-900/20 border-purple-500/50 text-purple-200" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}
                >
                  Price {sortBy === "price" && (sortDirection === "asc" ? "▲" : "▼")}
                </button>
              </div>
            </div>

            {/* Inventory Listing Cards */}
            {loading ? (
              <div className="text-center py-20">
                <span className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full inline-block" />
                <p className="text-zinc-500 text-xs mt-3">Fetching publisher listings...</p>
              </div>
            ) : sortedListings.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-16 text-center text-zinc-500">
                <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-white font-bold">No Publishers Match Filters</h3>
                <p className="text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Try clearing your search filters, adjusting metrics, or widening the niche category selector.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedListings.map((listing) => {
                  const isWishlisted = wishlist.includes(listing.id);
                  const isAiActive = aiListingId === listing.id;

                  return (
                    <div 
                      key={listing.id}
                      className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 md:p-6 shadow hover:border-zinc-850 hover:bg-zinc-900/10 transition-all flex flex-col md:flex-row justify-between gap-6"
                    >
                      <div className="space-y-3.5 flex-1">
                        
                        {/* Domain Title line */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-lg font-bold text-white tracking-tight">{listing.websiteName}</h3>
                          <span className="text-[10px] bg-purple-900/20 border border-purple-500/30 text-purple-300 font-bold px-2 py-0.5 rounded-full uppercase">
                            {listing.category}
                          </span>
                          <span className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full font-mono">
                            {listing.country}
                          </span>
                        </div>

                        {/* Domain metrics row */}
                        <div className="grid grid-cols-3 gap-2.5 max-w-sm p-2 bg-zinc-900/60 rounded-xl border border-zinc-900">
                          <div className="text-center border-r border-zinc-850">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold">Domain Authority</span>
                            <p className="text-sm font-extrabold text-white font-mono">{listing.domainAuthority}</p>
                          </div>
                          <div className="text-center border-r border-zinc-850">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold">Domain Rating</span>
                            <p className="text-sm font-extrabold text-purple-300 font-mono">{listing.domainRating}</p>
                          </div>
                          <div className="text-center">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold">Monthly Visits</span>
                            <p className="text-sm font-extrabold text-blue-400 font-mono">{(listing.traffic / 1000).toFixed(0)}k+</p>
                          </div>
                        </div>

                        {/* Details chips / options */}
                        <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400 font-medium">
                          {listing.isPermanentLink && <span className="flex items-center gap-1 text-emerald-400"><Check className="w-3.5 h-3.5" /> Permanent Post</span>}
                          {listing.isDofollow && <span className="flex items-center gap-1 text-purple-300"><Check className="w-3.5 h-3.5" /> Dofollow Links</span>}
                          {listing.isSponsored ? <span className="text-amber-400">Sponsored Tagged</span> : <span className="text-indigo-300">Clean Editorial No-Sponsor</span>}
                          <span className="text-zinc-500">Turnaround: {listing.turnaroundTime} days</span>
                        </div>

                        {/* Notes */}
                        {listing.notes && (
                          <p className="text-xs text-zinc-400 italic bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-900 max-w-xl">
                            "{listing.notes}"
                          </p>
                        )}

                        {/* Custom Anchor/Outline Generation with AI */}
                        <div className="pt-2">
                          <button
                            onClick={() => handleGenerateOutline(listing)}
                            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold underline"
                          >
                            <BrainCircuit className="w-3.5 h-3.5" /> AI Pitch Assistant (Get Article Concepts)
                          </button>

                          {isAiActive && (
                            <div className="mt-3 p-4 bg-zinc-900/80 border border-purple-500/30 rounded-xl max-w-xl">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 animate-bounce text-purple-400" /> SEO Content Ideas
                                </span>
                                <span className="text-[9px] text-zinc-500 font-mono">Engine: {aiSource}</span>
                              </div>
                              {aiLoading ? (
                                <p className="text-xs text-zinc-500 animate-pulse">Consulting Gemini semantic model...</p>
                              ) : (
                                <ul className="space-y-1.5">
                                  {aiIdeas.map((idea, i) => (
                                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5 leading-normal">
                                      <span className="text-purple-500 mt-0.5">•</span>
                                      <span>{idea}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Buy Section & Call actions */}
                      <div className="md:w-48 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-zinc-900 pt-4 md:pt-0 md:pl-6 shrink-0">
                        
                        <div className="text-right w-full mb-3 md:mb-0">
                          <span className="text-xs text-zinc-500 block uppercase font-bold">Direct price</span>
                          <span className="text-2xl font-black text-white font-mono">${listing.price}</span>
                          <span className="text-[10px] text-purple-400 block font-semibold">0% Middleman Markup</span>
                        </div>

                        <div className="flex gap-2 w-full mt-4 md:mt-0">
                          <button
                            onClick={() => onToggleWishlist(listing.id)}
                            className={`p-2.5 rounded-xl border transition-all ${
                              isWishlisted 
                                ? "bg-purple-950/20 border-purple-500 text-purple-300" 
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                            title="Add to Wishlist"
                          >
                            <Heart className="w-4.5 h-4.5" fill={isWishlisted ? "currentColor" : "none"} />
                          </button>

                          <button
                            onClick={() => setSelectedListing(listing)}
                            className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <ShoppingCart className="w-4 h-4" /> Order Guest Post
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Order & Checkout Slide-up Popup */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8">
            
            <button 
              onClick={() => { setSelectedListing(null); setPurchaseError(""); setPurchaseSuccess(""); }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Secure Checkout & Link Placement Order
            </h3>
            <p className="text-zinc-400 text-xs mt-1">
              You are ordering a dofollow guest post on <strong className="text-white">{selectedListing.websiteName}</strong> (Price: ${selectedListing.price})
            </p>

            {purchaseError && (
              <div className="my-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{purchaseError}</span>
              </div>
            )}

            {purchaseSuccess && (
              <div className="my-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{purchaseSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4 mt-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Target URL (Your Link)</label>
                  <input
                    type="url"
                    placeholder="https://yoursite.com/scale-guide"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Anchor Text Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g., SEO scaling guides"
                    required
                    value={anchorText}
                    onChange={(e) => setAnchorText(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Special Editorial Instructions for Publisher (Optional)</label>
                <textarea
                  placeholder="Draft requirements, paragraph layout details, tone guidelines..."
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Coupon input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 block">Apply Coupon Code (e.g. CONTENZO10)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="CONTENZO10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl border border-zinc-700 text-xs font-bold transition-all"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-400">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-emerald-400">{couponSuccess}</p>}
              </div>

              {/* Payment methods selector */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Select Payout Account / Gate</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "STRIPE", label: "Credit Card (Stripe)" },
                    { id: "PAYPAL", label: "PayPal Express" },
                    { id: "WALLET", label: `Escrow Wallet ($${user?.walletBalance || 0})` }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id as any)}
                      className={`py-2 px-3 text-[10px] font-bold rounded-xl border transition-all text-center ${
                        paymentMethod === p.id 
                          ? "bg-purple-900/20 border-purple-500 text-purple-200" 
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price summary review */}
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-900 flex justify-between items-center text-xs">
                <div>
                  <span className="text-zinc-500 block">Original List Cost</span>
                  <span className="text-zinc-400 font-semibold font-mono">${selectedListing.price}</span>
                </div>
                {couponDiscount > 0 && (
                  <div>
                    <span className="text-purple-400 block">Discount Applied</span>
                    <span className="text-purple-400 font-semibold font-mono">-{couponDiscount}%</span>
                  </div>
                )}
                <div className="text-right">
                  <span className="text-zinc-500 block font-bold">Total Due (incl. Escrow guard)</span>
                  <span className="text-lg font-black text-white font-mono">
                    ${Math.max(0, selectedListing.price - (selectedListing.price * couponDiscount / 100)).toFixed(0)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={purchasing}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl py-3 text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {purchasing ? "Processing Escrow Vault..." : "Approve and Submit Placement"}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// X inline declaration to handle missing import
const X = ({ className, ...props }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor" 
    className={className} 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
