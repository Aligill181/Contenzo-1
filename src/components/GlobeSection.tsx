import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Globe, ArrowUp, Link, Compass, TrendingUp, Search, Award } from "lucide-react";

export default function GlobeSection() {
  const [rankingPos, setRankingPos] = useState(48);
  const [activeStep, setActiveStep] = useState(0);

  // Animate rankings climbing up
  useEffect(() => {
    const timer = setInterval(() => {
      setRankingPos(prev => {
        if (prev <= 1) return 48; // cycle
        return prev - Math.floor(Math.random() * 4 + 1);
      });
    }, 3500);

    const stepTimer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, []);

  const steps = [
    { title: "Select Verified Site", desc: "Filter through thousands of high-DR publishers spanning global niches.", icon: Search },
    { title: "Escrow Deposited", desc: "Your placement capital is safely locked. No risk of publisher disappearance.", icon: Award },
    { title: "Link Placement live", desc: "Publisher writes or publishes the contextual dofollow post permanently.", icon: Link },
    { title: "Rank Climb Activated", desc: "Watch search engines index the high-quality equity, boosting rankings.", icon: TrendingUp }
  ];

  return (
    <section className="relative py-20 lg:py-24 bg-zinc-950 overflow-hidden border-b border-zinc-900">
      
      {/* Decorative gradients */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-600/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">SEO Rank Velocity</span>
          <h2 className="text-3xl font-extrabold text-white mt-2 sm:text-4xl md:text-5xl">
            Watch Link Building Drive Live SERP Authority
          </h2>
          <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
            Guest posting is not about empty metrics. It is about acquiring contextual relevance that search engines reward with first-page positioning. Here is how CONTENZO moves your site.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Interactive Visual Simulation */}
          <div className="lg:col-span-7 bg-black/60 border border-zinc-900 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md">
            
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Live Rank Indexer</span>
            </div>

            {/* Simulated Google Rank Board */}
            <div className="mt-8 space-y-4">
              
              <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-900/20 border border-purple-500/30 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Primary Target Domain</h4>
                    <p className="text-[10px] text-purple-400 font-semibold font-mono">yoursite.com/scale-guide</p>
                  </div>
                </div>
                
                <div className="flex gap-6 text-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">DR Index</span>
                    <span className="text-sm font-extrabold text-white font-mono">78 / 100</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Keyword Pos.</span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono flex items-center gap-0.5">
                      #{rankingPos} <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Connected Backlink Node Visual Map */}
              <div className="relative h-48 bg-zinc-950/50 rounded-2xl border border-zinc-900 overflow-hidden flex items-center justify-center">
                
                {/* Visual lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* UK -> Your Site */}
                  <path d="M 50 150 Q 180 80 320 100" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite]" />
                  {/* US -> Your Site */}
                  <path d="M 120 40 Q 220 120 320 100" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5,5" className="animate-[dash_12s_linear_infinite]" />
                  {/* Malta -> Your Site */}
                  <path d="M 550 140 Q 420 80 320 100" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="5,5" className="animate-[dash_8s_linear_infinite]" />
                </svg>

                {/* Nodes */}
                <div className="absolute left-10 bottom-10 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-[9px] font-mono text-zinc-300 shadow flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-purple-400" /> London, UK (DA 85)
                </div>

                <div className="absolute left-20 top-8 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-[9px] font-mono text-zinc-300 shadow flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-blue-400" /> New York, US (DA 91)
                </div>

                <div className="absolute right-10 bottom-12 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-[9px] font-mono text-zinc-300 shadow flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-emerald-400" /> Valletta, MT (DA 68)
                </div>

                {/* Central Target Site Node */}
                <div className="bg-gradient-to-tr from-purple-900 to-blue-900 border border-purple-500/50 rounded-2xl p-3 text-center shadow-lg shadow-purple-500/10 z-10 animate-bounce">
                  <Link className="w-6 h-6 text-white mx-auto" />
                  <p className="text-[10px] font-bold text-white mt-1">yoursite.com</p>
                  <span className="text-[8px] uppercase tracking-wider text-purple-300">Link Juice Absorbed</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right: Step Explainer */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = activeStep === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                      isActive 
                        ? "bg-zinc-900/60 border-purple-500/50 shadow-lg shadow-purple-500/5" 
                        : "bg-transparent border-transparent"
                    }`}
                  >
                    <div className={`p-2 rounded-xl border ${
                      isActive 
                        ? "bg-purple-950/40 border-purple-500 text-purple-300" 
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-500"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isActive ? "text-white" : "text-zinc-400"}`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
