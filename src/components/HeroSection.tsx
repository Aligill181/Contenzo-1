import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, ShieldCheck, Zap, Globe, Sparkles, TrendingUp, Cpu } from "lucide-react";

interface HeroSectionProps {
  onStartBuying: () => void;
  onBecomePublisher: () => void;
  onSetView: (view: string) => void;
}

export default function HeroSection({ onStartBuying, onBecomePublisher, onSetView }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stats, setStats] = useState({
    publishers: 1240,
    linksBuilt: 42380,
    avgPrice: 85,
    avgDR: 72
  });

  // Dynamic ticking stats for authentic feel
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        linksBuilt: prev.linksBuilt + Math.floor(Math.random() * 2),
        publishers: prev.publishers + (Math.random() > 0.85 ? 1 : 0)
      }));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Backlink Network Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 650;
    };
    window.addEventListener("resize", handleResize);

    // Nodes and links setup
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      label: string;
      color: string;
      glowIntensity: number;
    }

    const labels = ["Google", "Forbes", "TechRadar", "Your Site", "Cointelegraph", "VentureBeat", "SaaS Hub", "SEO Blog", "Betting Live"];
    const nodes: Node[] = [];

    for (let i = 0; i < 15; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 4 + 3,
        label: labels[i % labels.length] || "",
        color: i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#3b82f6" : "#22c55e",
        glowIntensity: Math.random() * 15 + 10
      });
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Radial background gradient
      const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width);
      grad.addColorStop(0, "rgba(9, 9, 11, 0.2)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.9)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw Connection lines (Backlinks)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.25;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Animated packets flowing along backlinks
            const pulse = (Date.now() / 2500) % 1;
            const px = nodes[i].x + (nodes[j].x - nodes[i].x) * pulse;
            const py = nodes[i].y + (nodes[j].y - nodes[i].y) * pulse;
            ctx.fillStyle = "#3b82f6";
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Nodes
      nodes.forEach((node) => {
        // Move node
        node.x += node.vx;
        node.y += node.vy;

        // Bounce borders
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Glow effects
        ctx.shadowBlur = node.glowIntensity;
        ctx.shadowColor = node.color;

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Turn off shadows for labels to be legible
        ctx.shadowBlur = 0;

        // Labels for prime SEO entities
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.font = "9px JetBrains Mono, monospace";
        ctx.fillText(node.label, node.x + 8, node.y + 3);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-black py-20 lg:py-32 border-b border-zinc-900">
      
      {/* Absolute Interactive Canvas Background */}
      <div className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Grid overlay for tech look */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-1" />

      {/* Hero content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 text-center">
        
        {/* Pitch Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/20 border border-purple-500/30 text-purple-200 text-xs font-semibold mb-6 shadow-lg shadow-purple-500/5 backdrop-blur-md"
        >
          <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-spin" />
          <span>The Modern SEO Revolution is Here</span>
        </motion.div>

        {/* Catchy Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Direct Guest Posting Marketplace
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed font-sans"
        >
          No Middlemen. <strong className="text-white">0% Markup</strong>. Purchase direct guest posts and high-quality backlinks from verified site owners with 100% transparency.
        </motion.p>

        {/* CTA Actions */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={onStartBuying}
            id="hero-buy-btn"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 transition-all hover:shadow-purple-500/30 active:scale-95 flex items-center gap-2 group"
          >
            Start Buying Links
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
          
          <button
            onClick={onBecomePublisher}
            id="hero-sell-btn"
            className="px-8 py-4 bg-zinc-950/85 hover:bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center gap-2"
          >
            <Cpu className="w-5 h-5 text-blue-400" />
            Become Publisher
          </button>
        </motion.div>

        {/* Fast SEO Stat Cards (Bento style) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Verified Publishers", value: stats.publishers.toLocaleString() + "+", desc: "Across 24 main categories", icon: Globe, color: "text-purple-400" },
            { label: "Guest Links Placed", value: stats.linksBuilt.toLocaleString() + "+", desc: "100% verified status", icon: Zap, color: "text-blue-400" },
            { label: "Avg Placement Cost", value: "$" + stats.avgPrice, desc: "Saves up to 60% on agencies", icon: ShieldCheck, color: "text-emerald-400" },
            { label: "Avg DR Metric", value: stats.avgDR + "+", desc: "Ahrefs & Moz indexes", icon: TrendingUp, color: "text-pink-400" }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx}
                className="relative bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 text-left shadow-lg backdrop-blur-md group hover:border-zinc-850 hover:bg-zinc-900/20 transition-all"
              >
                <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-850">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-xs text-zinc-500 font-medium tracking-wider uppercase">{card.label}</p>
                <h3 className="text-2xl font-extrabold text-white mt-1.5 font-mono">{card.value}</h3>
                <p className="text-[11px] text-zinc-400 mt-1">{card.desc}</p>
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
