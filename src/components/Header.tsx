import { useState, useEffect } from "react";
import { User, LogOut, Wallet, Bell, MessageSquare, ShieldCheck, Mail, Globe, Menu, X } from "lucide-react";
import { UserRole } from "../types.js";

interface HeaderProps {
  user: any | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onSetView: (view: string) => void;
  currentView: string;
}

export default function Header({ user, onLogout, onOpenAuth, onSetView, currentView }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 12000); // refresh notifications periodically
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotifRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-black/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo */}
        <div 
          onClick={() => { onSetView("home"); setMobileMenuOpen(false); }} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-all">
            <Globe className="h-5.5 w-5.5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-purple-400 transition-colors">
              CONTENZO
            </span>
            <span className="hidden sm:block text-[10px] font-medium tracking-wider text-purple-400 uppercase leading-none">
              GUEST POSTING SAAS
            </span>
          </div>
        </div>

        {/* Center: Desktop Menu */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { id: "home", label: "Home" },
            { id: "marketplace", label: "Marketplace" },
            { id: "blogs", label: "SaaS Blog" },
            { id: "faqs", label: "FAQ Support" },
            { id: "contact", label: "Contact Us" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSetView(item.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === item.id 
                  ? "bg-zinc-900 text-purple-400 border border-zinc-800" 
                  : "text-zinc-300 hover:text-white hover:bg-zinc-900/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Auth & User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              
              {/* Wallet Balance Widget */}
              <div 
                onClick={() => onSetView(user.role === UserRole.SELLER ? "seller-dashboard" : "buyer-dashboard")}
                className="hidden sm:flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
              >
                <Wallet className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-zinc-100">${user.walletBalance.toLocaleString()}</span>
              </div>

              {/* Notification Popover */}
              <div className="relative">
                <button
                  id="header-notif-btn"
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setShowProfileDropdown(false);
                    if (!showNotifDropdown && unreadCount > 0) {
                      handleMarkNotifRead();
                    }
                  }}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-50">
                    <div className="p-3 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-900/30">
                      <h4 className="text-xs font-bold text-white">Real-Time Alerts</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">Live</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-zinc-900">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-zinc-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-3 hover:bg-zinc-900/30 transition-colors">
                            <p className="text-xs font-semibold text-zinc-100 flex justify-between items-center">
                              <span>{notif.title}</span>
                              <span className="text-[9px] font-mono text-zinc-500">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-1">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Quick Shortcut */}
              <button
                onClick={() => onSetView(user.role === UserRole.SELLER ? "seller-dashboard" : "buyer-dashboard")}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                title="Open Dashboard Chats"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* User Avatar / Profile Dropdown */}
              <div className="relative">
                <button
                  id="header-profile-btn"
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowNotifDropdown(false);
                  }}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                    alt="user profile"
                    className="w-8.5 h-8.5 rounded-full border border-purple-500/50 object-cover hover:scale-105 transition-transform"
                  />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-50">
                    <div className="p-3 border-b border-zinc-800 bg-zinc-900/40">
                      <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-[9px] font-bold text-purple-300 uppercase">
                        {user.role} Account
                      </span>
                    </div>
                    <div className="p-1">
                      {user.role === UserRole.ADMIN && (
                        <button
                          onClick={() => { onSetView("admin-dashboard"); setShowProfileDropdown(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-purple-300 hover:text-white hover:bg-purple-900/20 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" /> Admin Console
                        </button>
                      )}
                      
                      <button
                        onClick={() => { 
                          onSetView(user.role === UserRole.SELLER ? "seller-dashboard" : "buyer-dashboard"); 
                          setShowProfileDropdown(false); 
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <User className="w-4 h-4 text-zinc-400" /> My SaaS Dashboard
                      </button>

                      <button
                        onClick={() => { onLogout(); setShowProfileDropdown(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:text-white hover:bg-red-950/20 rounded-xl flex items-center gap-2 transition-colors border-t border-zinc-900 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/60 rounded-xl transition-all"
              >
                Log In
              </button>
              <button
                onClick={onOpenAuth}
                className="hidden sm:block px-4 py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/10 active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-900 bg-zinc-950 p-4 space-y-2">
          {[
            { id: "home", label: "Home" },
            { id: "marketplace", label: "Marketplace" },
            { id: "blogs", label: "SaaS Blog" },
            { id: "faqs", label: "FAQ Support" },
            { id: "contact", label: "Contact Us" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { onSetView(item.id); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                currentView === item.id 
                  ? "bg-purple-900/20 text-purple-400 border border-purple-500/20" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
