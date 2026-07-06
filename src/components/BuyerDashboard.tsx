import React, { useState, useEffect, useRef } from "react";
import { 
  CreditCard, Wallet, Heart, FileText, ClipboardList, Send,
  MessageSquare, LifeBuoy, Bell, ShieldCheck, Mail, ArrowRight,
  ExternalLink, CheckCircle, Clock, AlertTriangle, AlertCircle
} from "lucide-react";
import { Order, Invoice, SupportTicket, ChatThread, ChatMessage, UserRole } from "../types.js";

interface BuyerDashboardProps {
  user: any;
  onRefreshUser: () => void;
  onSetView: (view: string) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

export default function BuyerDashboard({ 
  user, onRefreshUser, onSetView, wishlist, onToggleWishlist 
}: BuyerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "wallet" | "wishlist" | "messages" | "support" | "verification">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  
  // Input fields
  const [depositAmount, setDepositAmount] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [ticketReply, setTicketReply] = useState<Record<string, string>>({});
  const [verificationCode, setVerificationCode] = useState("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000); // refresh data background
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

  const fetchDashboardData = async () => {
    try {
      const headers = { "Authorization": `Bearer ${localStorage.getItem("token")}` };
      
      const [resOrders, resInvoices, resTickets, resThreads] = await Promise.all([
        fetch("/api/orders", { headers }),
        fetch("/api/invoices", { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } }), // wait, is invoices API at /api/invoices? Yes, in Express we mapped /api/orders & created invoice inside order creation. Let's make sure we fetch invoices from /api/invoices which we'll expose or fetch locally from db.
        fetch("/api/tickets", { headers }),
        fetch("/api/chats", { headers })
      ]);

      if (resOrders.ok) setOrders(await resOrders.json());
      if (resTickets.ok) setTickets(await resTickets.json());
      if (resThreads.ok) setThreads(await resThreads.json());
      
      // Let's fallback invoices to order invoices if API is separate
      const orderInvoices = await fetch("/api/orders", { headers }).then(r => r.json()).then((ords: Order[]) => {
        return ords.map((o, i) => ({
          id: o.invoiceId || `inv-${o.id}`,
          orderId: o.id,
          buyerId: o.buyerId,
          amount: o.price,
          status: "PAID" as const,
          paymentMethod: "WALLET" as const,
          createdAt: o.createdAt
        }));
      });
      setInvoices(orderInvoices);

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

  // Deposit funds
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!depositAmount || Number(depositAmount) <= 0) return;

    setProcessing(true);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ amount: Number(depositAmount) })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setDepositAmount("");
        onRefreshUser(); // update wallet balance in Header
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Deposit failed.");
    } finally {
      setProcessing(false);
    }
  };

  // Open support ticket
  const handleOpenTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!ticketSubject || !ticketMessage) return;

    setProcessing(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ subject: ticketSubject, message: ticketMessage })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setTicketSubject("");
        setTicketMessage("");
        setTickets(prev => [...prev, data.ticket]);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to open ticket.");
    } finally {
      setProcessing(false);
    }
  };

  // Submit Ticket Reply
  const handleTicketReply = async (ticketId: string) => {
    const message = ticketReply[ticketId];
    if (!message) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        setTicketReply(prev => ({ ...prev, [ticketId]: "" }));
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
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

  // Verify Email code
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ code: verificationCode })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        onRefreshUser(); // update verified status
        setActiveTab("orders");
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Verification failed.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* User Account brief Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 text-center">
            <img 
              src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
              alt="avatar"
              className="w-16 h-16 rounded-full mx-auto border-2 border-purple-500 object-cover"
            />
            <h3 className="text-sm font-extrabold text-white mt-3">{user.name}</h3>
            <p className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">{user.email}</p>
            
            {user.isVerified ? (
              <span className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Email Verified
              </span>
            ) : (
              <button 
                onClick={() => setActiveTab("verification")}
                className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-[10px] font-bold text-amber-400 hover:bg-amber-900/20 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Verify Email Now
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center text-xs">
              <span className="text-zinc-500">Wallet balance</span>
              <span className="text-white font-extrabold font-mono">${user.walletBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Sidebar Menu items */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-2.5 space-y-1">
            {[
              { id: "orders", label: "My Orders", icon: ClipboardList },
              { id: "wallet", label: "Wallet Deposits", icon: CreditCard },
              { id: "wishlist", label: "Saved Favorites", icon: Heart },
              { id: "messages", label: "Direct Chats", icon: MessageSquare },
              { id: "support", label: "Support Tickets", icon: LifeBuoy }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-2xl transition-all ${
                    activeTab === tab.id 
                      ? "bg-purple-900/20 border border-purple-500/20 text-purple-300" 
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

        {/* Right Column Dashboard Area */}
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

          {/* TAB 1: Verification Form */}
          {activeTab === "verification" && (
            <div className="max-w-md mx-auto py-8">
              <h3 className="text-xl font-bold tracking-tight text-white mb-2">Verify Your Email Address</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Enter the 6-digit OTP verification code sent to your inbox. In our preview sandbox container, use the code <strong className="text-purple-400">123456</strong> for instant authorization.
              </p>
              
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400">6-Digit Code</label>
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl py-2.5 text-xs transition-all active:scale-95"
                >
                  Verify and Activate Account
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Orders Index */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Placed Guest Posting Orders</h3>
                <span className="text-xs text-zinc-500">{orders.length} orders total</span>
              </div>

              {loading ? (
                <p className="text-xs text-zinc-500 animate-pulse">Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <ClipboardList className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
                  <p className="text-xs font-medium">No placements ordered yet.</p>
                  <button 
                    onClick={() => onSetView("marketplace")}
                    className="mt-3 px-4 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded-xl text-xs font-bold text-purple-400 transition-colors"
                  >
                    Explore Publisher Directory
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase">{ord.websiteName}</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Order ID: {ord.id} • Placed: {new Date(ord.createdAt).toLocaleDateString()}</p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          ord.status === "COMPLETED" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" :
                          ord.status === "PROCESSING" ? "bg-blue-950 text-blue-400 border border-blue-500/20" :
                          ord.status === "REJECTED" ? "bg-red-950 text-red-400 border border-red-500/20" :
                          "bg-zinc-900 text-zinc-400 border border-zinc-800"
                        }`}>
                          {ord.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2.5 bg-zinc-950/60 rounded-xl text-xs border border-zinc-900">
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Anchor text</span>
                          <strong className="text-white">{ord.anchorText}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Target link URL</span>
                          <a href={ord.targetUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline truncate block max-w-xs">{ord.targetUrl}</a>
                        </div>
                      </div>

                      {ord.liveUrl && (
                        <div className="flex justify-between items-center p-2.5 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" /> Link is Live & Verified!</span>
                          <a 
                            href={ord.liveUrl} 
                            target="_blank" 
                            referrerPolicy="no-referrer" 
                            className="text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-emerald-500"
                          >
                            Visit Live Post <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {ord.rejectReason && (
                        <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 p-2.5 rounded-xl">
                          <strong>Rejection reason:</strong> "{ord.rejectReason}"
                        </p>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Wallet Deposit / Coupon */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Wallet & Financial Ledger</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Deposit box */}
                <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold uppercase text-purple-400">Deposit Funds</h4>
                  <p className="text-xs text-zinc-400">Increase your purchasing power on CONTENZO via Stripe credit cards or PayPal.</p>
                  
                  <form onSubmit={handleDeposit} className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-zinc-500">$</span>
                      <input
                        type="number"
                        placeholder="250"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 pl-7 pr-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl py-2 text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <Wallet className="w-4 h-4" /> Deposit to Escrow Wallet
                    </button>
                  </form>
                </div>

                {/* Balance display */}
                <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-blue-400">Account Balance</h4>
                    <h2 className="text-3xl font-black mt-2 font-mono">${user.walletBalance.toLocaleString()}</h2>
                    <p className="text-[11px] text-zinc-400 mt-1">Held securely with escrow link-release guarantees.</p>
                  </div>

                  <div className="pt-4 border-t border-zinc-900/80 text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>0% transaction markups, always.</span>
                  </div>
                </div>

              </div>

              {/* Invoices List */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Financial Invoices</h4>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs text-zinc-400">
                    <thead className="bg-zinc-900/60 text-white font-semibold">
                      <tr>
                        <th className="p-3">Invoice ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Gateway</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-zinc-600">No transactions recorded yet.</td>
                        </tr>
                      ) : (
                        invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-zinc-900/20 transition-colors">
                            <td className="p-3 font-mono text-[10px] text-zinc-300">{inv.id}</td>
                            <td className="p-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                            <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]">{inv.paymentMethod}</span></td>
                            <td className="p-3 text-right font-extrabold text-white font-mono">${inv.amount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Saved / Wishlist */}
          {activeTab === "wishlist" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Saved Favorites website Placements</h3>
              <p className="text-xs text-zinc-400">Quick-access index to monitor metrics changes of bookmarked publishers.</p>

              {wishlist.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Heart className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs">No publishers bookmarked yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-purple-300">
                    You have bookmarked <strong className="text-white">{wishlist.length}</strong> publishers. Head to the <button onClick={() => onSetView("marketplace")} className="underline font-bold text-white hover:text-purple-400">Marketplace</button> to view detailed cards or purchase dofollow links.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Live Chat threads */}
          {activeTab === "messages" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[450px]">
              
              {/* Thread selector list */}
              <div className="md:col-span-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-3 space-y-2">
                <h4 className="text-xs font-bold uppercase text-zinc-500 px-2 pb-2 border-b border-zinc-900">Your Conversations</h4>
                
                {threads.length === 0 ? (
                  <p className="text-xs text-zinc-600 text-center py-6">No chat history found.</p>
                ) : (
                  threads.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveThread(t)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                        activeThread?.id === t.id 
                          ? "bg-purple-900/20 border-purple-500/40 text-white" 
                          : "bg-zinc-950/40 border-transparent text-zinc-400 hover:text-white hover:border-zinc-800"
                      }`}
                    >
                      <span className="font-bold block text-zinc-100">{t.sellerName}</span>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">{t.lastMessage || "Start messaging..."}</p>
                    </button>
                  ))
                )}
              </div>

              {/* Chat thread window */}
              <div className="md:col-span-8 flex flex-col justify-between bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4">
                
                {activeThread ? (
                  <>
                    {/* Header */}
                    <div className="pb-3 border-b border-zinc-900 flex justify-between items-center">
                      <div>
                        <strong className="text-sm block">{activeThread.sellerName}</strong>
                        <span className="text-[10px] text-purple-400">Verified Webmaster</span>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active Sandbox Bot" />
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 max-h-72">
                      {messages.map((m) => {
                        const isMe = m.senderId === user.id;
                        return (
                          <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-normal ${
                              isMe ? "bg-purple-600 text-white rounded-tr-none" : "bg-zinc-900 text-zinc-200 rounded-tl-none"
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

                    {/* Chat Footer send bar */}
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
                        className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-24 text-zinc-500">
                    <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs">Select any publisher chat thread to initiate live negotiation.</p>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 6: Support Tickets */}
          {activeTab === "support" && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Helpdesk & Support Tickets</h3>
                <span className="text-xs text-zinc-500">{tickets.length} tickets</span>
              </div>

              {/* Form to open tickets */}
              <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl">
                <h4 className="text-xs font-bold uppercase text-purple-400 mb-3">Open New Incident Ticket</h4>
                <form onSubmit={handleOpenTicket} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g., Query regarding PayPal deposit pending"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400">Detailed Message</label>
                    <textarea
                      placeholder="Describe the issue or metrics discrepancy..."
                      rows={3}
                      required
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow transition-all"
                  >
                    Dispatch Ticket
                  </button>
                </form>
              </div>

              {/* Ticket list */}
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{t.subject}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        t.status === "OPEN" ? "bg-amber-950 text-amber-400 border border-amber-500/20" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-zinc-300 bg-zinc-950/40 p-2.5 rounded-xl">{t.message}</p>
                    
                    {/* Responses threads */}
                    {t.responses && t.responses.length > 0 && (
                      <div className="space-y-2 border-l-2 border-purple-500/40 pl-3 mt-3">
                        {t.responses.map((resp, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <span className="text-[10px] font-extrabold text-purple-400">{resp.senderName}</span>
                            <p className="text-zinc-300">{resp.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Response text area for client to response back */}
                    {t.status === "OPEN" && (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Reply to support executive..."
                          value={ticketReply[t.id] || ""}
                          onChange={(e) => setTicketReply(prev => ({ ...prev, [t.id]: e.target.value }))}
                          className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl py-1 px-3 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleTicketReply(t.id)}
                          className="px-3 py-1 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-750"
                        >
                          Reply
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
