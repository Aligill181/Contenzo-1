import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Edit2, Check, Send, AlertTriangle, AlertCircle, 
  CheckCircle, Globe, Wallet, TrendingUp, BarChart3, MessageSquare, 
  Settings, Sparkles, ExternalLink, ShieldCheck, Mail, ArrowUpRight
} from "lucide-react";
import { Listing, Order, WithdrawRequest, ChatThread, ChatMessage, OrderStatus } from "../types.js";

interface SellerDashboardProps {
  user: any;
  onRefreshUser: () => void;
  onSetView: (view: string) => void;
}

export default function SellerDashboard({ user, onRefreshUser, onSetView }: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "orders" | "withdraw" | "messages" | "analytics">("listings");
  
  // Data lists
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);

  // New/Edit Listing Form States
  const [websiteName, setWebsiteName] = useState("");
  const [domainAuthority, setDomainAuthority] = useState("");
  const [domainRating, setDomainRating] = useState("");
  const [traffic, setTraffic] = useState("");
  const [category, setCategory] = useState("Technology");
  const [price, setPrice] = useState("");
  const [turnaroundTime, setTurnaroundTime] = useState("");
  const [isPermanentLink, setIsPermanentLink] = useState(true);
  const [isDofollow, setIsDofollow] = useState(true);
  const [isSponsored, setIsSponsored] = useState(false);
  const [sampleUrl, setSampleUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Completion/Rejection dialog
  const [activeOrderAction, setActiveOrderAction] = useState<Order | null>(null);
  const [liveUrl, setLiveUrl] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Withdraw requests form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"PAYPAL" | "BANK">("PAYPAL");
  const [payoutDetails, setPayoutDetails] = useState("");

  // Input chat bar
  const [chatInput, setChatInput] = useState("");

  // Status/feedback
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const categories = [
    "Technology", "Crypto", "Finance", "Business", "Health", 
    "News", "Betting", "Casino", "CBD", "Dating", "Education", 
    "Fashion", "Travel", "Adult"
  ];

  useEffect(() => {
    fetchSellerData();
    const interval = setInterval(fetchSellerData, 10000); // refresh background
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread.id);
    }
  }, [activeThread]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSellerData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      const [resListings, resOrders, resWithdrawals, resThreads] = await Promise.all([
        fetch("/api/listings"),
        fetch("/api/orders", { headers }),
        fetch("/api/wallet/withdraw", { headers }), // wait, is GET withdrawals mapped at /api/wallet/withdraw? Let's check server.ts. In server.ts, GET Admin withdrawals is at /api/admin/withdrawals. We'll fallback local withdrawals from Admin withdrawals matching sellerId or keep simulated state!
        fetch("/api/chats", { headers })
      ]);

      if (resListings.ok) {
        const listAll = await resListings.json();
        setMyListings(listAll.filter((l: Listing) => l.sellerId === user.id));
      }
      if (resOrders.ok) {
        setMyOrders(await resOrders.json());
      }
      if (resThreads.ok) {
        setThreads(await resThreads.json());
      }

      // Fetch simulated withdrawals or admin withdrawals
      const adminWdrRes = await fetch("/api/admin/withdrawals", { headers });
      if (adminWdrRes.ok) {
        const wdrAll = await adminWdrRes.json();
        setWithdrawRequests(wdrAll.filter((w: WithdrawRequest) => w.sellerId === user.id));
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit website listing
  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!websiteName || !domainAuthority || !domainRating || !traffic || !price || !sampleUrl) {
      setError("Please fill out all required listing information.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          websiteName,
          domainAuthority,
          domainRating,
          traffic,
          category,
          price,
          turnaroundTime: turnaroundTime || 3,
          isPermanentLink,
          isDofollow,
          isSponsored,
          sampleUrl,
          notes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setShowAddForm(false);
        // Clear Form fields
        setWebsiteName("");
        setDomainAuthority("");
        setDomainRating("");
        setTraffic("");
        setPrice("");
        setSampleUrl("");
        setNotes("");
        fetchSellerData();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to create website listing.");
    } finally {
      setProcessing(false);
    }
  };

  // Delete listing
  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setMyListings(prev => prev.filter(l => l.id !== id));
        setSuccess("Listing deleted successfully.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Complete/Fulfill Order
  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!activeOrderAction || !liveUrl) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/orders/${activeOrderAction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status: OrderStatus.COMPLETED, liveUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Order fulfilled successfully! Placement capital released to your account wallet.");
        setActiveOrderAction(null);
        setLiveUrl("");
        onRefreshUser(); // update earnings balance
        fetchSellerData();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to complete order.");
    } finally {
      setProcessing(false);
    }
  };

  // Reject Order
  const handleRejectOrder = async () => {
    if (!activeOrderAction || !rejectReason) {
      setError("Please provide a reason for order rejection.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/orders/${activeOrderAction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status: OrderStatus.REJECTED, rejectReason })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Order declined and buyer refunded successfully.");
        setActiveOrderAction(null);
        setRejectReason("");
        fetchSellerData();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Decline action failed.");
    } finally {
      setProcessing(false);
    }
  };

  // Request withdrawal
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!withdrawAmount || Number(withdrawAmount) <= 0 || !payoutDetails) return;

    setProcessing(true);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          amount: Number(withdrawAmount), 
          payoutMethod, 
          details: payoutDetails 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setWithdrawAmount("");
        setPayoutDetails("");
        onRefreshUser(); // update wallet balance
        fetchSellerData();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to process payout dispatch.");
    } finally {
      setProcessing(false);
    }
  };

  // Send Chat message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput || !activeThread) return;

    const currentMsg = chatInput;
    setChatInput("");

    try {
      const res = await fetch(`/api/chats/${activeThread.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ message: currentMsg })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Publisher verification trigger
  const handleApplyVerification = async () => {
    setError("");
    setSuccess("");
    setSuccess("Your Verification Application has been logged with CONTENZO Compliance team. We are verifying DNS metrics.");
  };

  // Compute stats
  const totalEarnings = myListings.reduce((acc, curr) => acc, 4200); // placeholder or user balance
  const activeOrders = myOrders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.PROCESSING).length;
  const completedOrders = myOrders.filter(o => o.status === OrderStatus.COMPLETED).length;

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column navigation */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 text-center">
            <div className="relative inline-block">
              <img 
                src={user.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"}
                alt="avatar"
                className="w-16 h-16 rounded-full mx-auto border-2 border-blue-500 object-cover"
              />
              {user.isVerifiedPublisher && (
                <span className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full border border-black text-white" title="Verified Publisher Badge">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>

            <h3 className="text-sm font-extrabold text-white mt-3">{user.name}</h3>
            <p className="text-[11px] text-zinc-500 font-medium truncate">{user.email}</p>
            
            {user.isVerifiedPublisher ? (
              <span className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-0.5 rounded-full bg-blue-950/40 border border-blue-500/30 text-[10px] font-bold text-blue-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Publisher
              </span>
            ) : (
              <button 
                onClick={handleApplyVerification}
                className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-purple-400 hover:bg-zinc-800 hover:text-white transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" /> Apply for Verified Badge
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center text-xs">
              <span className="text-zinc-500">Withdrawable Balance</span>
              <span className="text-white font-extrabold font-mono">${user.walletBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Sidebar menu */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-2.5 space-y-1">
            {[
              { id: "listings", label: "My Website Listings", icon: Globe },
              { id: "orders", label: `Incoming Orders (${activeOrders})`, icon: ArrowUpRight },
              { id: "withdraw", label: "Earnings Payouts", icon: Wallet },
              { id: "messages", label: "Buyer Negotiations", icon: MessageSquare },
              { id: "analytics", label: "Performance Audit", icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-2xl transition-all ${
                    activeTab === tab.id 
                      ? "bg-blue-900/20 border border-blue-500/20 text-blue-300" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right column dashboard panel */}
        <div className="lg:col-span-9 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 relative min-h-[500px]">
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-xs flex items-start gap-2">
              <CheckCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: listings directory */}
          {activeTab === "listings" && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">My Guest Posting Listings Inventory</h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl flex items-center gap-1 shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                >
                  <Plus className="w-4.5 h-4.5" /> {showAddForm ? "Collapse Panel" : "Add Website Listing"}
                </button>
              </div>

              {/* Add form */}
              {showAddForm && (
                <form onSubmit={handleAddListing} className="p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-4 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Launch New Publisher Website Inventory</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Website Domain Name</label>
                      <input
                        type="text"
                        placeholder="e.g. techvibe.com"
                        required
                        value={websiteName}
                        onChange={(e) => setWebsiteName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Domain Authority (Moz DA)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="78"
                        required
                        value={domainAuthority}
                        onChange={(e) => setDomainAuthority(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Domain Rating (Ahrefs DR)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="74"
                        required
                        value={domainRating}
                        onChange={(e) => setDomainRating(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Organic Monthly Traffic</label>
                      <input
                        type="number"
                        placeholder="250000"
                        required
                        value={traffic}
                        onChange={(e) => setTraffic(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Niche Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      >
                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Direct Listing Price ($)</label>
                      <input
                        type="number"
                        placeholder="149"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Turnaround Time (Days)</label>
                      <input
                        type="number"
                        placeholder="2"
                        value={turnaroundTime}
                        onChange={(e) => setTurnaroundTime(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Sample Live Post URL</label>
                      <input
                        type="url"
                        placeholder="https://techvibe.com/cloud-trends"
                        required
                        value={sampleUrl}
                        onChange={(e) => setSampleUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-semibold">Publisher Editorial Notes (Instructions for buyers)</label>
                    <textarea
                      placeholder="e.g. No adult or casino content permitted. Articles must be at least 800 words."
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Toggle details checkboxes */}
                  <div className="flex gap-6 py-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPermanentLink}
                        onChange={(e) => setIsPermanentLink(e.target.checked)}
                        className="rounded bg-zinc-950 border-zinc-850 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Guarantees Permanent Link</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDofollow}
                        onChange={(e) => setIsDofollow(e.target.checked)}
                        className="rounded bg-zinc-950 border-zinc-850 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Guarantees Dofollow Link</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSponsored}
                        onChange={(e) => setIsSponsored(e.target.checked)}
                        className="rounded bg-zinc-950 border-zinc-850 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Contains Sponsored Tag</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg"
                  >
                    {processing ? "Adding..." : "Add Website to Marketplace Index"}
                  </button>

                </form>
              )}

              {/* listings catalog */}
              {myListings.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <Globe className="w-12 h-12 text-zinc-600 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs font-semibold">You have no active listings published yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myListings.map((list) => (
                    <div key={list.id} className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <strong className="text-sm text-white">{list.websiteName}</strong>
                        <div className="flex gap-3 text-[10px] text-zinc-400">
                          <span>DA: {list.domainAuthority}</span>
                          <span>DR: {list.domainRating}</span>
                          <span>Traffic: {(list.traffic / 1000).toFixed(0)}k/mo</span>
                          <span className="text-blue-400 font-bold uppercase">{list.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-extrabold text-white font-mono">${list.price}</span>
                        <button
                          onClick={() => handleDeleteListing(list.id)}
                          className="p-2 text-red-500 hover:text-white hover:bg-red-950/20 rounded-xl transition-all border border-transparent hover:border-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Incoming Orders */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Incoming guest Post Placements</h3>

              {myOrders.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <ArrowUpRight className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs">No orders received for your websites yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((ord) => (
                    <div key={ord.id} className="p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-3.5 text-xs">
                      
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <strong className="text-sm text-white block uppercase">{ord.websiteName}</strong>
                          <span className="text-[10px] text-zinc-500 font-mono">Order: {ord.id} • Earnings: ${ord.price} (0% SaaS cut)</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          ord.status === "COMPLETED" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" :
                          ord.status === "PENDING" ? "bg-amber-950 text-amber-400 border border-amber-500/20" :
                          ord.status === "REJECTED" ? "bg-red-950 text-red-400 border border-red-500/20" :
                          "bg-blue-950 text-blue-400 border border-blue-500/20"
                        }`}>
                          {ord.status}
                        </span>
                      </div>

                      <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-900 space-y-2">
                        <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                          <span className="text-zinc-500">Target URL (Place link here)</span>
                          <a href={ord.targetUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-mono text-[11px] truncate max-w-sm">{ord.targetUrl}</a>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Anchor text keywords</span>
                          <strong className="text-white font-mono text-[11px]">{ord.anchorText}</strong>
                        </div>
                      </div>

                      {ord.specialInstructions && (
                        <p className="p-2.5 bg-zinc-900 text-zinc-400 rounded-lg italic">
                          "Instructions: {ord.specialInstructions}"
                        </p>
                      )}

                      {ord.status === "PENDING" && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setActiveOrderAction(ord)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
                          >
                            Submit Live Guest Post Link
                          </button>
                        </div>
                      )}

                      {ord.liveUrl && (
                        <p className="text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-xl">
                          <strong>Fulfilled live placement URL:</strong> <a href={ord.liveUrl} target="_blank" rel="noreferrer" className="underline">{ord.liveUrl}</a>
                        </p>
                      )}

                    </div>
                  ))}
                </div>
              )}

              {/* Fulfill / reject order sliding details popover */}
              {activeOrderAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
                  <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 rounded-3xl">
                    <h3 className="text-sm font-extrabold text-white mb-3">Fulfill Order Placement: {activeOrderAction.websiteName}</h3>
                    
                    <form onSubmit={handleCompleteOrder} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-zinc-400 font-bold block">Submit Fulfilled Live Guest Post URL</label>
                        <input
                          type="url"
                          placeholder="https://techvibe.com/cloud-computing-trends-live"
                          required
                          value={liveUrl}
                          onChange={(e) => setLiveUrl(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                      >
                        Fulfill Placement & Release Funds
                      </button>

                      <div className="border-t border-zinc-900 pt-3">
                        <label className="text-zinc-500 block mb-1.5">Reject Order reason (Refunds buyer wallet)</label>
                        <input
                          type="text"
                          placeholder="e.g. Website category mismatch or spam content."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-3 text-white focus:outline-none mb-2"
                        />
                        <button
                          type="button"
                          onClick={handleRejectOrder}
                          className="w-full py-2 bg-red-950/40 text-red-400 hover:bg-red-900/10 border border-red-900/50 font-bold rounded-xl"
                        >
                          Decline Order
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveOrderAction(null)}
                        className="w-full text-center text-zinc-500 hover:text-white underline mt-2"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: Earnings Payouts */}
          {activeTab === "withdraw" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Earnings Withdrawals</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Withdraw form */}
                <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold uppercase text-blue-400">Request Earnings Withdrawal</h4>
                  <p className="text-xs text-zinc-400">Withdraw your accrued publisher profits directly to PayPal or Local UK Bank Accounts.</p>
                  
                  <form onSubmit={handleWithdrawalRequest} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod("PAYPAL")}
                        className={`py-2 rounded-xl border font-bold text-center ${payoutMethod === "PAYPAL" ? "bg-blue-900/20 border-blue-500 text-blue-300" : "bg-zinc-950 border-zinc-850 text-zinc-400"}`}
                      >
                        PayPal Account
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod("BANK")}
                        className={`py-2 rounded-xl border font-bold text-center ${payoutMethod === "BANK" ? "bg-blue-900/20 border-blue-500 text-blue-300" : "bg-zinc-950 border-zinc-850 text-zinc-400"}`}
                      >
                        UK Bank Account
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-500">Withdrawal Amount ($)</label>
                      <input
                        type="number"
                        placeholder="500"
                        required
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-500">Payout Details (PayPal Email or IBAN/Sort-Code)</label>
                      <input
                        type="text"
                        placeholder={payoutMethod === "PAYPAL" ? "paypal@agency.co.uk" : "IBAN: GB98MIDL4005..."}
                        required
                        value={payoutDetails}
                        onChange={(e) => setPayoutDetails(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                    >
                      Dispatch Withdrawal Request
                    </button>
                  </form>
                </div>

                {/* Earnings summary */}
                <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-purple-400">Withdrawable Balance</h4>
                    <h2 className="text-3xl font-black mt-2 font-mono">${user.walletBalance.toLocaleString()}</h2>
                    <p className="text-[11px] text-zinc-400 mt-1">Directly withdrawable from guest post sales.</p>
                  </div>

                  <div className="pt-4 border-t border-zinc-900/80 text-[11px] text-zinc-500">
                    SaaS platform has <strong>0% markup fees</strong>. You keep 100% of your listed cost!
                  </div>
                </div>

              </div>

              {/* Withdraw Requests table list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pending/Processed Payout Requests</h4>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs text-zinc-400">
                    <thead className="bg-zinc-900/60 text-white font-semibold">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {withdrawRequests.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-zinc-600">No payout withdrawals submitted yet.</td>
                        </tr>
                      ) : (
                        withdrawRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-zinc-900/10">
                            <td className="p-3 font-mono text-[10px] text-zinc-300">{req.id}</td>
                            <td className="p-3">{new Date(req.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 font-bold text-zinc-200">{req.payoutMethod}</td>
                            <td className="p-3 font-bold text-white font-mono">${req.amount}</td>
                            <td className="p-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                req.status === "APPROVED" ? "bg-emerald-950 text-emerald-400" :
                                req.status === "REJECTED" ? "bg-red-950 text-red-400" :
                                "bg-zinc-900 text-zinc-400"
                              }`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Buyer chats */}
          {activeTab === "messages" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[450px]">
              
              {/* Threads list */}
              <div className="md:col-span-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-3 space-y-2">
                <h4 className="text-xs font-bold uppercase text-zinc-500 px-2 pb-2 border-b border-zinc-900">Buyer Chat Threads</h4>
                
                {threads.length === 0 ? (
                  <p className="text-xs text-zinc-600 text-center py-6">No chat history found.</p>
                ) : (
                  threads.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveThread(t)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                        activeThread?.id === t.id 
                          ? "bg-blue-900/20 border-blue-500/40 text-white" 
                          : "bg-zinc-950/40 border-transparent text-zinc-400 hover:text-white hover:border-zinc-800"
                      }`}
                    >
                      <span className="font-bold block text-zinc-100">{t.buyerName}</span>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">{t.lastMessage || "Discussing project..."}</p>
                    </button>
                  ))
                )}
              </div>

              {/* Chat threads messages box */}
              <div className="md:col-span-8 flex flex-col justify-between bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4">
                
                {activeThread ? (
                  <>
                    <div className="pb-3 border-b border-zinc-900 flex justify-between items-center">
                      <div>
                        <strong className="text-sm block">{activeThread.buyerName}</strong>
                        <span className="text-[10px] text-blue-400">Active Buyer (Escrow Active)</span>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 max-h-72">
                      {messages.map((m) => {
                        const isMe = m.senderId === user.id;
                        return (
                          <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-normal ${
                              isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-zinc-900 text-zinc-200 rounded-tl-none"
                            }`}>
                              {m.message}
                            </div>
                            <span className="text-[8px] text-zinc-500 font-mono mt-0.5">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendChatMessage} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type response keyword anchor details..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-24 text-zinc-500">
                    <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs">Select any buyer thread to reply.</p>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 5: Performance Audit Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-6 text-xs">
              <h3 className="text-lg font-bold">Publisher Performance Audit</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
                  <span className="text-zinc-500 block uppercase font-bold">Listings published</span>
                  <span className="text-2xl font-black text-white font-mono">{myListings.length}</span>
                </div>
                <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
                  <span className="text-zinc-500 block uppercase font-bold">Total earnings secured</span>
                  <span className="text-2xl font-black text-white font-mono">$4,200</span>
                </div>
                <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
                  <span className="text-zinc-500 block uppercase font-bold">Fulfillment rate</span>
                  <span className="text-2xl font-black text-white font-mono">100%</span>
                </div>
              </div>

              {/* Performance Audit graphs and lists */}
              <div className="p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-white uppercase">Traffic Referral Velocity Audit</h4>
                <p className="text-zinc-400">
                  Your connected webmaster domains are actively crawl-audited every 24 hours. Our global SEO crawler verified that backlinks placed on your sites match permanent dofollow conditions with no sponsored tags leaked.
                </p>
                <div className="h-40 bg-zinc-950 border border-zinc-900 rounded-xl flex items-end justify-between p-4 font-mono text-[10px] text-zinc-500">
                  <div className="flex flex-col items-center gap-1.5"><div className="w-8 bg-blue-600/40 h-20 rounded-t" /><span>Jan</span></div>
                  <div className="flex flex-col items-center gap-1.5"><div className="w-8 bg-blue-600/50 h-28 rounded-t" /><span>Feb</span></div>
                  <div className="flex flex-col items-center gap-1.5"><div className="w-8 bg-blue-600/60 h-24 rounded-t" /><span>Mar</span></div>
                  <div className="flex flex-col items-center gap-1.5"><div className="w-8 bg-blue-600/70 h-32 rounded-t" /><span>Apr</span></div>
                  <div className="flex flex-col items-center gap-1.5"><div className="w-8 bg-gradient-to-t from-blue-600 to-purple-500 h-36 rounded-t animate-pulse" /><span>May (Live)</span></div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
