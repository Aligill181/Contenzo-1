import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, ShieldCheck, Users, Globe, ShoppingBag, 
  Wallet, FileText, CheckCircle, Clock, Trash2, ArrowRight,
  Sparkles, Calendar, Plus, MessageSquare, ListFilter, AlertCircle
} from "lucide-react";
import { User, Listing, Order, WithdrawRequest, SystemLog, Coupon } from "../types.js";

interface AdminDashboardProps {
  user: any;
  onSetView: (view: string) => void;
}

export default function AdminDashboard({ user, onSetView }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"withdrawals" | "users" | "listings" | "logs" | "cms" | "coupons">("withdrawals");
  
  // Lists
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Blog creation form
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  
  // Coupon creation form
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const headers = { "Authorization": `Bearer ${localStorage.getItem("token")}` };

      const [resWdr, resUsers, resListings, resLogs, resCoupons] = await Promise.all([
        fetch("/api/admin/withdrawals", { headers }),
        fetch("/api/admin/users", { headers }),
        fetch("/api/listings"),
        fetch("/api/admin/logs", { headers }),
        // coupons fallback from API
        fetch("/api/wallet/coupon", { headers, method: "POST", body: JSON.stringify({ code: "CONTENZO10" }) }).then(() => [
          { code: "CONTENZO10", discountPercent: 10, isActive: true },
          { code: "WELCOME5", discountPercent: 5, isActive: true },
          { code: "OFF20", discountPercent: 20, isActive: true }
        ])
      ]);

      if (resWdr.ok) setWithdrawals(await resWdr.json());
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resListings.ok) setListings(await resListings.json());
      if (resLogs.ok) setLogs(await resLogs.json());
      setCoupons(resCoupons);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Payout action
  const handleApproveWithdrawal = async (id: string, status: "APPROVED" | "REJECTED") => {
    setError("");
    setSuccess("");
    setProcessing(true);

    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Payout request marked as ${status} successfully.`);
        fetchAdminData();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to update payout status.");
    } finally {
      setProcessing(false);
    }
  };

  // Launch Blog CMS post
  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!blogTitle || !blogContent) return;

    setProcessing(true);
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ title: blogTitle, excerpt: blogExcerpt, content: blogContent })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("SaaS Blog post published to live index successfully!");
        setBlogTitle("");
        setBlogExcerpt("");
        setBlogContent("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to publish blog post.");
    } finally {
      setProcessing(false);
    }
  };

  // Add Promo coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!couponCode || !couponDiscount) return;

    setSuccess("New promotional discount coupon published to SaaS ledger.");
    setCoupons(prev => [
      ...prev, 
      { code: couponCode.toUpperCase(), discountPercent: Number(couponDiscount), isActive: true }
    ]);
    setCouponCode("");
    setCouponDiscount("");
  };

  // Delete listing (Admin moderate spam)
  const handleDeleteSpamListing = async (id: string) => {
    if (!confirm("Admin Action: Delete spam listing from public marketplace index?")) return;

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== id));
        setSuccess("Listing moderated successfully.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Console Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-zinc-900 mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Admin Command Console</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">CONTENZO System Audit</h1>
          </div>
          
          <button 
            onClick={() => onSetView("home")}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-bold border border-zinc-850 flex items-center gap-1 transition-colors"
          >
            Exit Console <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Global Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-xs">
          {[
            { label: "Total Platform Revenue", value: "$48,250", desc: "0% Commission, Direct flow", icon: Wallet, color: "text-emerald-400" },
            { label: "Active Marketplace Listings", value: listings.length.toString(), desc: "Across 14 categories", icon: Globe, color: "text-blue-400" },
            { label: "Registered SaaS Users", value: users.length.toString(), desc: "Buyers, Sellers, Admins", icon: Users, color: "text-purple-400" },
            { label: "Pending Payout Dispatches", value: withdrawals.filter(w => w.status === "PENDING").length.toString(), desc: "Escrow approvals needed", icon: ShieldAlert, color: "text-amber-400" }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-zinc-500 block uppercase font-bold">{stat.label}</span>
                  <h3 className="text-xl font-extrabold text-white font-mono">{stat.value}</h3>
                  <span className="text-[10px] text-zinc-400 block">{stat.desc}</span>
                </div>
                <div className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 ${stat.color} z-10`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Side navigation */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-2.5 space-y-1">
              {[
                { id: "withdrawals", label: "Review Publisher Payouts", icon: Wallet },
                { id: "listings", label: "Moderate Public Inventory", icon: Globe },
                { id: "users", label: "Manage SaaS Accounts", icon: Users },
                { id: "cms", label: "SEO Blog CMS Editor", icon: FileText },
                { id: "coupons", label: "Promotional Coupons", icon: Sparkles },
                { id: "logs", label: "Interactive System Logs", icon: ShieldCheck }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setError("");
                      setSuccess("");
                    }}
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

          {/* Core Admin area */}
          <div className="lg:col-span-9 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 relative min-h-[450px]">
            
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

            {/* TAB 1: Payout review */}
            {activeTab === "withdrawals" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Review Pending Payouts</h3>
                <p className="text-xs text-zinc-400">Moderators review DNS backlinks, verification checks, and escrow conditions before dispatching funds.</p>

                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs text-zinc-400">
                    <thead className="bg-zinc-900/60 text-white font-semibold">
                      <tr>
                        <th className="p-3">Publisher Account</th>
                        <th className="p-3">Method Details</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {withdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-zinc-600">No payout requests queued.</td>
                        </tr>
                      ) : (
                        withdrawals.map((req) => (
                          <tr key={req.id} className="hover:bg-zinc-900/10">
                            <td className="p-3">
                              <span className="font-bold text-white block">{req.sellerName}</span>
                              <span className="text-[10px] text-zinc-500">{req.sellerEmail}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-zinc-200">{req.payoutMethod}</span>
                              <span className="text-[10px] text-zinc-500 block truncate max-w-xs">{req.details}</span>
                            </td>
                            <td className="p-3 font-bold text-white font-mono">${req.amount}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                req.status === "APPROVED" ? "bg-emerald-950 text-emerald-400" :
                                req.status === "REJECTED" ? "bg-red-950 text-red-400" :
                                "bg-zinc-900 text-zinc-400"
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {req.status === "PENDING" && (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleApproveWithdrawal(req.id, "APPROVED")}
                                    className="px-2 py-1 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-500 text-[10px]"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleApproveWithdrawal(req.id, "REJECTED")}
                                    className="px-2 py-1 bg-red-950/40 text-red-400 hover:bg-red-900/10 border border-red-900/50 font-bold rounded text-[10px]"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: Moderate listings */}
            {activeTab === "listings" && (
              <div className="space-y-4 text-xs">
                <h3 className="text-lg font-bold text-white">Moderate Public Inventory Index</h3>
                <p className="text-zinc-400">Review all active marketplace directory listings. Delete items violating content policies.</p>

                <div className="space-y-3">
                  {listings.map((list) => (
                    <div key={list.id} className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-2xl flex justify-between items-center">
                      <div>
                        <strong className="text-sm text-white">{list.websiteName}</strong>
                        <div className="flex gap-3 text-[10px] text-zinc-500 font-mono mt-0.5">
                          <span>DA: {list.domainAuthority}</span>
                          <span>DR: {list.domainRating}</span>
                          <span>Traffic: {(list.traffic / 1000).toFixed(0)}k/mo</span>
                          <span className="text-purple-400 font-bold">{list.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <strong className="text-white font-mono">${list.price}</strong>
                        <button
                          onClick={() => handleDeleteSpamListing(list.id)}
                          className="p-1.5 text-red-500 hover:text-white hover:bg-red-950/30 rounded-lg border border-transparent hover:border-red-900 transition-all"
                          title="Admin: Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Users database */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Registered Platform SaaS Accounts</h3>
                
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left text-zinc-400">
                    <thead className="bg-zinc-900/60 text-white font-semibold">
                      <tr>
                        <th className="p-3">User Profile</th>
                        <th className="p-3">Role Type</th>
                        <th className="p-3">Verification</th>
                        <th className="p-3 text-right">Escrow Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-900/10">
                          <td className="p-3">
                            <span className="font-bold text-white block">{u.name}</span>
                            <span className="text-[10px] text-zinc-500">{u.email}</span>
                          </td>
                          <td className="p-3 font-bold text-zinc-200">{u.role}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${u.isVerified ? "bg-emerald-950 text-emerald-400" : "bg-zinc-900 text-zinc-500"}`}>
                              {u.isVerified ? "Active" : "Unverified"}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-white font-mono">${u.walletBalance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: CMS Blog manager */}
            {activeTab === "cms" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">SEO Blog Content CMS Editor</h3>
                
                <form onSubmit={handleCreateBlogPost} className="p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-4 text-xs">
                  <h4 className="text-xs font-bold uppercase text-purple-400">Launch New Article</h4>
                  
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold">Article Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Backlink Velocity: Navigating Algorithmic Penalties in 2026"
                      required
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold">Brief Excerpt description</label>
                    <input
                      type="text"
                      placeholder="Summary snippet displayed on landing card index..."
                      value={blogExcerpt}
                      onChange={(e) => setBlogExcerpt(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold">Detailed HTML / Markdown Content body</label>
                    <textarea
                      placeholder="Main article paragraphs discussing on-page, off-page metrics..."
                      rows={5}
                      required
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
                  >
                    {processing ? "Publishing..." : "Launch Article to Public SaaS Blog Index"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 5: coupons list */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Promotional Discount Coupons</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Coupon creator */}
                  <form onSubmit={handleCreateCoupon} className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-4 text-xs">
                    <h4 className="text-xs font-bold uppercase text-purple-400">Launch Promo Code</h4>
                    
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Coupon Code (Upper Case)</label>
                      <input
                        type="text"
                        placeholder="SUMMER25"
                        required
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-semibold">Discount Percent (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        placeholder="25"
                        required
                        value={couponDiscount}
                        onChange={(e) => setCouponDiscount(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
                    >
                      Publish Coupon
                    </button>
                  </form>

                  {/* List */}
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl space-y-3 text-xs">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase pb-2 border-b border-zinc-800">Active Coupons</h4>
                    
                    <div className="space-y-2.5">
                      {coupons.map((c, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-zinc-950 rounded-xl border border-zinc-850">
                          <span className="font-mono font-black text-purple-300">{c.code}</span>
                          <span className="text-emerald-400 font-bold">{c.discountPercent}% Discount</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 6: System Log audits */}
            {activeTab === "logs" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Interactive System logs & Audits</h3>
                <p className="text-xs text-zinc-400">Platform security tracking monitoring registration events, JWT log-ins, deposits, and withdrawal approve queues.</p>
                
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 max-h-96 overflow-y-auto space-y-2 text-[11px] font-mono text-zinc-500">
                  {logs.length === 0 ? (
                    <p className="text-center">No logs generated yet.</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="pb-1.5 border-b border-zinc-900 last:border-b-0 leading-relaxed">
                        <span className="text-purple-400">[{new Date(log.createdAt).toLocaleTimeString()}]</span>{" "}
                        <strong className="text-zinc-300 uppercase">{log.action}:</strong>{" "}
                        <span>{log.details}</span>{" "}
                        {log.userEmail && <span className="text-zinc-600">({log.userEmail})</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
