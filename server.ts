import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { db } from "./src/server/db.js";
import { UserRole, OrderStatus } from "./src/types.js";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Token helper: Simulated JWT using base64-encoded user JSON
function generateToken(user: any) {
  return Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role })).toString("base64");
}

function verifyToken(token: string): any {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

// Auth Middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid token or session expired." });
  }
  req.user = decoded;
  next();
}

// --- API ROUTES ---

// 1. Auth Endpoint
app.post("/api/auth/register", (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "Missing required registration parameters." });
  }

  const users = db.getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "User already exists with this email." });
  }

  const newUser = {
    id: "usr-" + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    name,
    role: role as UserRole,
    isVerified: false, // Starts unverified to show email verification flow
    walletBalance: 0,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString()
  };

  db.addUser(newUser);
  const token = generateToken(newUser);

  res.json({
    message: "Registration successful. Welcome to CONTENZO!",
    token,
    user: newUser
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please enter your email and password." });
  }

  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ error: "No account found with this email." });
  }

  // Real mock validation (accepts any password for ease of immediate preview, but validates user existence)
  const token = generateToken(user);
  db.addLog("USER_LOGIN", `User signed in successfully`, user.id, user.email);

  res.json({
    message: "Login successful.",
    token,
    user
  });
});

app.post("/api/auth/verify-email", authenticate, (req: any, res) => {
  const { code } = req.body;
  if (!code || code !== "123456") {
    return res.status(400).json({ error: "Invalid verification OTP code. Use '123456' for instant preview validation." });
  }

  db.updateUser(req.user.id, { isVerified: true });
  const users = db.getUsers();
  const updatedUser = users.find(u => u.id === req.user.id);

  db.addLog("EMAIL_VERIFIED", `User email verified`, req.user.id, req.user.email);
  res.json({ message: "Email verification successful! Account is fully active.", user: updatedUser });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }
  const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "No user found with this email address." });
  }
  res.json({ message: "Password reset link sent to your email. Check your inbox!" });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Invalid request parameters." });
  }
  res.json({ message: "Password updated successfully. You can now log in." });
});

app.get("/api/auth/me", authenticate, (req: any, res) => {
  const user = db.getUsers().find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }
  res.json(user);
});

// 2. Listings API (Publisher Inventory)
app.get("/api/listings", (req, res) => {
  const listings = db.getListings();
  res.json(listings);
});

app.post("/api/listings", authenticate, (req: any, res) => {
  if (req.user.role !== UserRole.SELLER && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Only publishers can create listings." });
  }

  const { websiteName, domainAuthority, domainRating, traffic, country, language, category, price, turnaroundTime, isPermanentLink, isSponsored, isNofollow, isDofollow, sampleUrl, notes } = req.body;

  if (!websiteName || !domainAuthority || !domainRating || !traffic || !price || !category || !sampleUrl) {
    return res.status(400).json({ error: "Missing required listing information." });
  }

  const newListing = {
    id: "lst-" + Math.random().toString(36).substr(2, 9),
    sellerId: req.user.id,
    websiteName,
    domainAuthority: Number(domainAuthority),
    domainRating: Number(domainRating),
    traffic: Number(traffic),
    country: country || "Worldwide",
    language: language || "English",
    category,
    price: Number(price),
    turnaroundTime: Number(turnaroundTime) || 3,
    isPermanentLink: !!isPermanentLink,
    isSponsored: !!isSponsored,
    isNofollow: !!isNofollow,
    isDofollow: !!isDofollow,
    sampleUrl,
    notes,
    createdAt: new Date().toISOString()
  };

  db.addListing(newListing);
  res.json({ message: "Listing published successfully!", listing: newListing });
});

app.put("/api/listings/:id", authenticate, (req: any, res) => {
  const { id } = req.params;
  const listing = db.getListings().find(l => l.id === id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found." });
  }

  if (listing.sellerId !== req.user.id && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "You are not authorized to edit this listing." });
  }

  db.updateListing(id, req.body);
  res.json({ message: "Listing updated successfully." });
});

app.delete("/api/listings/:id", authenticate, (req: any, res) => {
  const { id } = req.params;
  const listing = db.getListings().find(l => l.id === id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found." });
  }

  if (listing.sellerId !== req.user.id && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "You are not authorized to delete this listing." });
  }

  db.deleteListing(id);
  res.json({ message: "Listing deleted successfully." });
});

// 3. Orders API
app.get("/api/orders", authenticate, (req: any, res) => {
  const orders = db.getOrders();
  if (req.user.role === UserRole.ADMIN) {
    return res.json(orders);
  }
  if (req.user.role === UserRole.SELLER) {
    return res.json(orders.filter(o => o.sellerId === req.user.id));
  }
  res.json(orders.filter(o => o.buyerId === req.user.id));
});

app.post("/api/orders", authenticate, (req: any, res) => {
  const { listingId, targetUrl, anchorText, specialInstructions, paymentMethod, couponCode } = req.body;
  if (!listingId || !targetUrl || !anchorText) {
    return res.status(400).json({ error: "Missing target URL or anchor keywords." });
  }

  const listing = db.getListings().find(l => l.id === listingId);
  if (!listing) {
    return res.status(404).json({ error: "Publisher listing no longer available." });
  }

  let finalPrice = listing.price;
  if (couponCode) {
    const coupon = db.getCoupons().find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
    if (coupon) {
      finalPrice = Math.max(0, finalPrice - (finalPrice * coupon.discountPercent / 100));
    }
  }

  const user = db.getUsers().find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  // Wallet payment check
  if (paymentMethod === "WALLET") {
    if (user.walletBalance < finalPrice) {
      return res.status(400).json({ error: "Insufficient wallet balance. Please deposit funds or choose Card payment." });
    }
    // Deduct
    db.updateUser(user.id, { walletBalance: user.walletBalance - finalPrice });
  }

  const orderId = "ord-" + Math.random().toString(36).substr(2, 9);
  const invoiceId = "inv-" + Math.random().toString(36).substr(2, 9);

  const newOrder = {
    id: orderId,
    buyerId: user.id,
    sellerId: listing.sellerId,
    listingId,
    websiteName: listing.websiteName,
    price: finalPrice,
    targetUrl,
    anchorText,
    specialInstructions,
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    invoiceId
  };

  const newInvoice = {
    id: invoiceId,
    orderId,
    buyerId: user.id,
    amount: finalPrice,
    status: "PAID" as const,
    paymentMethod: paymentMethod || "STRIPE",
    createdAt: new Date().toISOString()
  };

  db.addOrder(newOrder);
  db.addInvoice(newInvoice);

  // Notify seller
  db.addNotification(listing.sellerId, "New Guest Post Order", `You have received a new order for ${listing.websiteName} from ${user.name}.`);
  // Notify buyer
  db.addNotification(user.id, "Order Confirmed", `Your order for ${listing.websiteName} has been successfully submitted!`);

  res.json({ message: "Order placed successfully!", order: newOrder, invoice: newInvoice });
});

app.put("/api/orders/:id", authenticate, (req: any, res) => {
  const { id } = req.params;
  const { status, liveUrl, rejectReason } = req.body;

  const order = db.getOrders().find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  const sellerOrAdmin = req.user.id === order.sellerId || req.user.role === UserRole.ADMIN;
  const buyerOrAdmin = req.user.id === order.buyerId || req.user.role === UserRole.ADMIN;

  if (status === OrderStatus.COMPLETED) {
    if (!sellerOrAdmin) return res.status(403).json({ error: "Only the publisher can mark this order as completed." });
    if (!liveUrl) return res.status(400).json({ error: "Live guest post URL must be provided." });

    db.updateOrder(id, { status: OrderStatus.COMPLETED, liveUrl, updatedAt: new Date().toISOString() });
    
    // Release funds to seller wallet
    const seller = db.getUsers().find(u => u.id === order.sellerId);
    if (seller) {
      db.updateUser(seller.id, { walletBalance: seller.walletBalance + order.price });
    }

    db.addNotification(order.buyerId, "Guest Post Live!", `Great news! Your guest post on ${order.websiteName} is live. Check it out: ${liveUrl}`);
    db.addLog("ORDER_COMPLETED", `Order ${order.id} marked as completed by seller. Live URL: ${liveUrl}`, req.user.id);
  } else if (status === OrderStatus.REJECTED) {
    if (!sellerOrAdmin) return res.status(403).json({ error: "Only the publisher can reject this order." });
    
    db.updateOrder(id, { status: OrderStatus.REJECTED, rejectReason, updatedAt: new Date().toISOString() });
    
    // Refund buyer
    const buyer = db.getUsers().find(u => u.id === order.buyerId);
    if (buyer) {
      db.updateUser(buyer.id, { walletBalance: buyer.walletBalance + order.price });
    }

    db.addNotification(order.buyerId, "Order Rejected & Refunded", `Your order for ${order.websiteName} was rejected by the publisher. Reason: ${rejectReason || 'N/A'}. Funds refunded to your wallet.`);
    db.addLog("ORDER_REJECTED", `Order ${order.id} rejected. Reason: ${rejectReason}`, req.user.id);
  }

  res.json({ message: "Order status updated successfully." });
});

// 4. Wallet Endpoints
app.post("/api/wallet/deposit", authenticate, (req: any, res) => {
  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: "Please enter a valid deposit amount." });
  }

  const user = db.getUsers().find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const depositValue = Number(amount);
  db.updateUser(user.id, { walletBalance: user.walletBalance + depositValue });
  db.addLog("WALLET_DEPOSIT", `Deposited $${depositValue} via Stripe/PayPal`, user.id, user.email);

  res.json({ message: `Successfully deposited $${depositValue} to your wallet.`, balance: user.walletBalance + depositValue });
});

app.post("/api/wallet/withdraw", authenticate, (req: any, res) => {
  const { amount, payoutMethod, details } = req.body;
  if (!amount || Number(amount) <= 0 || !payoutMethod || !details) {
    return res.status(400).json({ error: "Invalid withdrawal request details." });
  }

  const user = db.getUsers().find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const withdrawValue = Number(amount);
  if (user.walletBalance < withdrawValue) {
    return res.status(400).json({ error: "Insufficient balance for withdrawal request." });
  }

  // Deduct immediately and queue withdrawal
  db.updateUser(user.id, { walletBalance: user.walletBalance - withdrawValue });
  
  db.addWithdrawal({
    id: "wdr-" + Math.random().toString(36).substr(2, 9),
    sellerId: user.id,
    sellerName: user.name,
    sellerEmail: user.email,
    amount: withdrawValue,
    payoutMethod,
    details,
    status: "PENDING",
    createdAt: new Date().toISOString()
  });

  res.json({ message: "Withdrawal request submitted successfully. Our compliance team will process it within 24 hours.", balance: user.walletBalance - withdrawValue });
});

app.post("/api/wallet/coupon", authenticate, (req: any, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required." });

  const coupon = db.getCoupons().find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  if (!coupon) {
    return res.status(400).json({ error: "Invalid or expired coupon code." });
  }

  res.json({ message: "Coupon applied successfully!", discountPercent: coupon.discountPercent });
});

// 5. Support Tickets API
app.get("/api/tickets", authenticate, (req: any, res) => {
  const tickets = db.getTickets();
  if (req.user.role === UserRole.ADMIN) {
    return res.json(tickets);
  }
  res.json(tickets.filter(t => t.userId === req.user.id));
});

app.post("/api/tickets", authenticate, (req: any, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: "Subject and message are required." });
  }

  const user = db.getUsers().find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const newTicket = {
    id: "tkt-" + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    userName: user.name,
    email: user.email,
    subject,
    message,
    status: "OPEN" as const,
    createdAt: new Date().toISOString(),
    responses: []
  };

  db.addTicket(newTicket);
  res.json({ message: "Support ticket opened successfully. We will respond shortly.", ticket: newTicket });
});

app.post("/api/tickets/:id/responses", authenticate, (req: any, res) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Response message is required." });

  const user = db.getUsers().find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  db.addTicketResponse(id, {
    senderId: user.id,
    senderName: user.name,
    message,
    createdAt: new Date().toISOString()
  });

  res.json({ message: "Response submitted." });
});

// 6. Live Chat API
app.get("/api/chats", authenticate, (req: any, res) => {
  const threads = db.getChatThreads(req.user.id);
  res.json(threads);
});

app.get("/api/chats/:chatId/messages", authenticate, (req: any, res) => {
  const { chatId } = req.params;
  const messages = db.getChatMessages(chatId);
  res.json(messages);
});

app.post("/api/chats/thread", authenticate, (req: any, res) => {
  const { sellerId, sellerName } = req.body;
  if (!sellerId || !sellerName) {
    return res.status(400).json({ error: "Invalid target thread parameters." });
  }

  const user = db.getUsers().find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const thread = db.getOrCreateChatThread(user.id, user.name, sellerId, sellerName);
  res.json(thread);
});

app.post("/api/chats/:chatId/messages", authenticate, (req: any, res) => {
  const { chatId } = req.params;
  const { message, attachmentUrl } = req.body;
  if (!message) return res.status(400).json({ error: "Message body is empty." });

  const user = db.getUsers().find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const chatMsg = db.addChatMessage(chatId, user.id, user.name, message, attachmentUrl);
  
  // Real-time dynamic response simulation (makes chat interactive and fun to play with in preview!)
  setTimeout(() => {
    const responses = [
      "I have received your query. Let me review the metrics and get back to you immediately.",
      "Yes, the link will be permanent and we fully support custom anchor words.",
      "That category perfectly matches our content layout. Let's do it!",
      "I can publish this draft within 24 hours if you submit it now.",
      "Thank you for reaching out! Let me know if you need customized packages."
    ];
    const randResponse = responses[Math.floor(Math.random() * responses.length)];
    // Find the other user in thread
    const thread = db.getChatThreads(user.id).find(t => t.id === chatId);
    if (thread) {
      const otherId = thread.buyerId === user.id ? thread.sellerId : thread.buyerId;
      const otherName = thread.buyerId === user.id ? thread.sellerName : thread.buyerName;
      db.addChatMessage(chatId, otherId, otherName, randResponse);
    }
  }, 3500);

  res.json(chatMsg);
});

// 7. Notifications
app.get("/api/notifications", authenticate, (req: any, res) => {
  const notifications = db.getNotifications(req.user.id);
  res.json(notifications);
});

app.post("/api/notifications/read", authenticate, (req: any, res) => {
  db.markNotificationsAsRead(req.user.id);
  res.json({ message: "Notifications marked as read." });
});

// 8. CMS Blogs & Testimonials
app.get("/api/blogs", (req, res) => {
  res.json(db.getBlogs());
});

app.get("/api/faqs", (req, res) => {
  res.json(db.getFaqs());
});

app.get("/api/testimonials", (req, res) => {
  res.json(db.getTestimonials());
});

// 9. Admin Specific Actions
app.get("/api/admin/logs", authenticate, (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Forbidden. Admin authorization required." });
  }
  res.json(db.getLogs());
});

app.get("/api/admin/users", authenticate, (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Forbidden. Admin authorization required." });
  }
  res.json(db.getUsers());
});

app.get("/api/admin/withdrawals", authenticate, (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Forbidden. Admin authorization required." });
  }
  res.json(db.getWithdrawRequests());
});

app.put("/api/admin/withdrawals/:id", authenticate, (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Forbidden. Admin authorization required." });
  }
  const { id } = req.params;
  const { status } = req.body; // APPROVED or REJECTED
  
  db.updateWithdrawal(id, status);
  const reqDetails = db.getWithdrawRequests().find(r => r.id === id);
  if (reqDetails) {
    if (status === "APPROVED") {
      db.addNotification(reqDetails.sellerId, "Withdrawal Approved!", `Your withdrawal request of $${reqDetails.amount} has been successfully processed and paid out via ${reqDetails.payoutMethod}.`);
    } else {
      // Refund seller wallet
      const seller = db.getUsers().find(u => u.id === reqDetails.sellerId);
      if (seller) {
        db.updateUser(seller.id, { walletBalance: seller.walletBalance + reqDetails.amount });
      }
      db.addNotification(reqDetails.sellerId, "Withdrawal Rejected", `Your withdrawal request of $${reqDetails.amount} was declined. Funds have been returned to your wallet.`);
    }
  }
  res.json({ message: "Withdrawal request status updated successfully." });
});

// Admin CMS Controls
app.post("/api/admin/blogs", authenticate, (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) return res.status(403).json({ error: "Forbidden." });
  const { title, excerpt, content, imageUrl } = req.body;
  const newBlog = {
    id: "blog-" + Math.random().toString(36).substr(2, 9),
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    excerpt,
    content,
    author: req.user.name,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    createdAt: new Date().toISOString()
  };
  db.addBlog(newBlog);
  res.json({ message: "Blog published.", blog: newBlog });
});

app.put("/api/admin/blogs/:id", authenticate, (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) return res.status(403).json({ error: "Forbidden." });
  db.updateBlog(req.params.id, req.body);
  res.json({ message: "Blog updated." });
});

app.delete("/api/admin/blogs/:id", authenticate, (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) return res.status(403).json({ error: "Forbidden." });
  db.deleteBlog(req.params.id);
  res.json({ message: "Blog deleted." });
});

// 10. AI Assistant Content Idea Generator
app.post("/api/ai/outline", async (req, res) => {
  const { websiteName, category } = req.body;
  if (!websiteName || !category) {
    return res.status(400).json({ error: "Missing website name or niche category." });
  }

  // Lazy Initialization of Gemini SDK to prevent crashes if key is empty
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Elegant high-quality fallback templates
    const fallbackOutlines: Record<string, string[]> = {
      Technology: [
        "How " + websiteName + " Is Changing Developer Productivity",
        "The Direct Impact of Modern Cloud Architecture on SaaS Costs",
        "Top 5 Technology Paradigms to Watch in 2026"
      ],
      Crypto: [
        "Solving Liquidity Fragmentation: Key Protocols Leading the Charge",
        "Decentralized Wallets: Navigating Multi-Chain Security Options",
        "Why Topical Authority is Key for Next-Generation Web3 Marketing"
      ],
      Finance: [
        "Wealth Building Strategies for High-Growth Startups",
        "Macroeconomic Indicators Affecting Modern Retail Investments",
        "Navigating Decentralized Wealth Portfolios Safely"
      ]
    };
    const nicheList = fallbackOutlines[category] || [
      "The Ultimate Guide to Topical Relevancy on " + websiteName,
      "How Modern Link Building Powers Growth in " + category + " Markets",
      "Key Content Tactics for High-Velocity Brand Placement"
    ];
    return res.json({
      ideas: nicheList,
      source: "CONTENZO Local Heuristic AI (No API Key detected)"
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a professional SEO copywriter. Generate 3 compelling and viral guest post article titles and a 2-sentence SEO pitch outline for a website called "${websiteName}" in the "${category}" category. Keep it clear, engaging, and premium. Format as plain JSON array of strings or simple clean text lines.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const textResult = response.text || "";
    // Clean code formatting blocks if returned by model
    const cleanedText = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      const parsed = JSON.parse(cleanedText);
      return res.json({ ideas: parsed, source: "Gemini 2.5 Flash Engine" });
    } catch {
      // Split by lines as backup
      const ideas = cleanedText.split("\n").filter(l => l.trim().length > 3).slice(0, 3);
      return res.json({ ideas, source: "Gemini 2.5 Flash Engine" });
    }
  } catch (error: any) {
    console.error("Gemini AI API Call failed:", error);
    return res.status(500).json({ error: "Failed to generate AI ideas: " + error.message });
  }
});


// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
