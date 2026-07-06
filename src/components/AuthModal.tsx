import React, { useState } from "react";
import { UserRole } from "../types.js";
import { X, Mail, Lock, User, ShieldAlert, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin 
      ? { email, password } 
      : { email, password, name, role };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please try again.");
      }

      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForgotSuccess(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-container" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div id="auth-modal" className="relative w-full max-w-md bg-zinc-950/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-600/10 blur-3xl pointer-events-none" />

        <button 
          id="auth-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!showForgot ? (
          <>
            <div className="text-center mb-6">
              <h2 id="auth-title" className="text-2xl font-bold tracking-tight text-white">
                {isLogin ? "Welcome Back to CONTENZO" : "Create Your CONTENZO Account"}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                {isLogin ? "Enter your credentials to access the marketplace" : "Join the premium guest posting SaaS marketplace"}
              </p>
            </div>

            {error && (
              <div id="auth-error-box" className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-400 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Are you buying links or publishing?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        id="role-buyer-btn"
                        onClick={() => setRole(UserRole.BUYER)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          role === UserRole.BUYER 
                            ? "bg-purple-900/30 border-purple-500 text-purple-200" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        I want to Buy Links
                      </button>
                      <button
                        type="button"
                        id="role-seller-btn"
                        onClick={() => setRole(UserRole.SELLER)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          role === UserRole.SELLER 
                            ? "bg-blue-900/30 border-blue-500 text-blue-200" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        I am a Publisher
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name or Agency Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        id="auth-name-input"
                        placeholder="John Doe"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    id="auth-email-input"
                    placeholder="hello@contenzo.co.uk"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-zinc-400">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      id="forgot-pwd-btn"
                      onClick={() => setShowForgot(true)}
                      className="text-xs text-purple-400 hover:text-purple-300 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    id="auth-password-input"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="auth-submit-btn"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold rounded-lg py-2.5 transition-all shadow-lg shadow-purple-500/15 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? "Processing..." : isLogin ? "Sign In" : "Register Account"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Accout Help */}
            {isLogin && (
              <div className="mt-4 p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                <p className="text-[11px] text-zinc-400">
                  ⚡ <strong>Quick Demo Logins</strong> (Pass: anything):
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-1.5">
                  <button 
                    onClick={() => { setEmail("admin@contenzo.co.uk"); setPassword("admin123"); }}
                    className="text-[10px] bg-zinc-800 text-purple-300 hover:bg-zinc-700 px-2 py-0.5 rounded border border-purple-500/30"
                  >
                    Admin
                  </button>
                  <button 
                    onClick={() => { setEmail("buyer@contenzo.co.uk"); setPassword("buyer123"); }}
                    className="text-[10px] bg-zinc-800 text-blue-300 hover:bg-zinc-700 px-2 py-0.5 rounded border border-blue-500/30"
                  >
                    Buyer (Sarah)
                  </button>
                  <button 
                    onClick={() => { setEmail("seller@contenzo.co.uk"); setPassword("seller123"); }}
                    className="text-[10px] bg-zinc-800 text-emerald-300 hover:bg-zinc-700 px-2 py-0.5 rounded border border-emerald-500/30"
                  >
                    Seller (Marcus)
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-zinc-800/60 text-center text-xs text-zinc-400">
              {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
              <button
                type="button"
                id="toggle-auth-btn"
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                {isLogin ? "Create one here" : "Sign in here"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-white">Reset Password</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Enter your email address to receive a secure recovery code
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-400 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-xs">
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold rounded-lg py-2.5 transition-all shadow-lg"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => { setShowForgot(false); setError(""); setForgotSuccess(""); }}
                className="w-full text-center text-xs text-zinc-400 hover:text-white underline mt-2"
              >
                Back to Sign In
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
