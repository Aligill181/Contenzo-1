import fs from "fs";
import path from "path";
import { 
  User, 
  UserRole, 
  Listing, 
  Order, 
  OrderStatus, 
  Invoice, 
  SupportTicket, 
  ChatMessage, 
  ChatThread, 
  SystemLog, 
  Coupon, 
  WithdrawRequest, 
  Notification,
  BlogArticle,
  FAQ,
  Testimonial
} from "../types.js";

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

interface DatabaseSchema {
  users: User[];
  listings: Listing[];
  orders: Order[];
  invoices: Invoice[];
  supportTickets: SupportTicket[];
  chatMessages: ChatMessage[];
  chatThreads: ChatThread[];
  systemLogs: SystemLog[];
  coupons: Coupon[];
  withdrawRequests: WithdrawRequest[];
  notifications: Notification[];
  blogs: BlogArticle[];
  faqs: FAQ[];
  testimonials: Testimonial[];
}

// Initial seed data for visual richness and immediate playability
const INITIAL_USERS: User[] = [
  {
    id: "admin-1",
    email: "admin@contenzo.co.uk",
    name: "Alex Contenzo",
    role: UserRole.ADMIN,
    isVerified: true,
    walletBalance: 25450,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "buyer-1",
    email: "buyer@contenzo.co.uk",
    name: "Sarah Jenkins (SaaS Founder)",
    role: UserRole.BUYER,
    isVerified: true,
    walletBalance: 1250,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "seller-1",
    email: "seller@contenzo.co.uk",
    name: "Marcus Aurelius (SEO Agency)",
    role: UserRole.SELLER,
    isVerified: true,
    walletBalance: 4200,
    isVerifiedPublisher: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_LISTINGS: Listing[] = [
  {
    id: "lst-1",
    sellerId: "seller-1",
    websiteName: "TechVibe Media",
    domainAuthority: 82,
    domainRating: 79,
    traffic: 450000,
    country: "United States",
    language: "English",
    category: "Technology",
    price: 189,
    turnaroundTime: 2,
    isPermanentLink: true,
    isSponsored: false,
    isNofollow: false,
    isDofollow: true,
    sampleUrl: "https://techvibe.example.com/trends-in-cloud-computing",
    notes: "High authority tech site with outstanding organic reach. No gambling, adult, or casino content allowed.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lst-2",
    sellerId: "seller-1",
    websiteName: "The Crypto Ledger",
    domainAuthority: 74,
    domainRating: 72,
    traffic: 120000,
    country: "United Kingdom",
    language: "English",
    category: "Crypto",
    price: 249,
    turnaroundTime: 3,
    isPermanentLink: true,
    isSponsored: false,
    isNofollow: false,
    isDofollow: true,
    sampleUrl: "https://cryptoledger.example.com/future-of-defi-aggregators",
    notes: "Dedicated blockchain and web3 news journal. Accepts crypto, blockchain, and tech-adjacent articles.",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lst-3",
    sellerId: "seller-1",
    websiteName: "Global Finance Review",
    domainAuthority: 88,
    domainRating: 85,
    traffic: 980000,
    country: "Canada",
    language: "English",
    category: "Finance",
    price: 499,
    turnaroundTime: 4,
    isPermanentLink: true,
    isSponsored: true,
    isNofollow: false,
    isDofollow: true,
    sampleUrl: "https://globalfinancereview.example.com/wealth-management-tips",
    notes: "Top-tier premium finance authority. All guest posts will be tagged with subtle sponsor note.",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lst-4",
    sellerId: "seller-1",
    websiteName: "Vitality Daily",
    domainAuthority: 68,
    domainRating: 65,
    traffic: 85000,
    country: "Australia",
    language: "English",
    category: "Health",
    price: 99,
    turnaroundTime: 1,
    isPermanentLink: true,
    isSponsored: false,
    isNofollow: false,
    isDofollow: true,
    sampleUrl: "https://vitalitydaily.example.com/morning-mindfulness-habits",
    notes: "Healthy living and mental health platform. Lightning fast turnaround time.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lst-5",
    sellerId: "seller-1",
    websiteName: "Spin Vegas Sports",
    domainAuthority: 55,
    domainRating: 52,
    traffic: 45000,
    country: "Malta",
    language: "English",
    category: "Betting",
    price: 149,
    turnaroundTime: 3,
    isPermanentLink: true,
    isSponsored: false,
    isNofollow: false,
    isDofollow: true,
    sampleUrl: "https://spinvegassports.example.com/tactics-for-live-odds",
    notes: "Niche betting & online gambling portal. Fully accepts betting/casino links with dofollow tags.",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lst-6",
    sellerId: "seller-1",
    websiteName: "The Business Blueprint",
    domainAuthority: 79,
    domainRating: 75,
    traffic: 310000,
    country: "United States",
    language: "English",
    category: "Business",
    price: 159,
    turnaroundTime: 2,
    isPermanentLink: true,
    isSponsored: false,
    isNofollow: false,
    isDofollow: true,
    sampleUrl: "https://thebusinessblueprint.example.com/scaling-b2b-startups",
    notes: "Excellent for marketing, entrepreneurship, and SaaS link building. No low-quality spin-content allowed.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Jonathan Wright",
    role: "Head of SEO",
    company: "SearchRank Pro",
    content: "CONTENZO completely disrupted our agency's outreach workflow. We cut our guest posting budget by 45% because we buy directly from site owners at 0% markup. Truly exceptional.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "t-2",
    name: "Emily Thompson",
    role: "Founder",
    company: "SaaSify Me",
    content: "We tried agencies, freelancer platforms, and cold emails. Nothing matches CONTENZO. The transparency of choosing exact sites, DA/DR metrics, and verified traffic is unmatched.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "t-3",
    name: "Daniel Green",
    role: "Digital Marketer",
    company: "Apex Media",
    content: "As a publisher, I earn 100% of my list price with no cuts. The verified badge has increased my sales significantly, and payouts are instantaneous. Kudos to the creators!",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150"
  }
];

const INITIAL_FAQS: FAQ[] = [
  {
    id: "f-1",
    question: "How does CONTENZO maintain a 0% markup model?",
    answer: "Unlike traditional agencies that double or triple the prices listed by publishers, CONTENZO is a pure marketplace. Publishers list their exact price, and you pay exactly that price. We monetize via premium subscriptions, verification services, and optional content creation add-ons rather than link markups."
  },
  {
    id: "f-2",
    question: "Are the guest posts permanent?",
    answer: "Yes. All listings marked as Permanent Link are contractually required to remain active for the life of the website. If a link is removed, our system auto-flags it, and we process refunds or replacements via our escrow system."
  },
  {
    id: "f-3",
    question: "Do you offer content writing services?",
    answer: "Yes, we have an integrated, optional content-writing add-on. If you don't have your guest post article ready, you can tick 'Include Article Writing' during checkout, and our vetted professional copywriters will draft SEO-optimized copy for you."
  },
  {
    id: "f-4",
    question: "How do payouts work for publishers?",
    answer: "Once a buyer orders a post, funds go into our secure Escrow wallet. When the publisher provides the live guest post URL, the buyer review window opens. Funds are released directly to the publisher's withdrawable wallet balance upon approval, with payout requests processed within 24 hours."
  }
];

const INITIAL_BLOGS: BlogArticle[] = [
  {
    id: "b-1",
    title: "Mastering Backlink Velocity: Avoid the Google Sandbox in 2026",
    slug: "mastering-backlink-velocity-2026",
    excerpt: "Learn how to orchestrate a natural link acquisition strategy that builds topical authority without triggering algorithm penalties.",
    content: "Link building remains the single most powerful off-page SEO ranking signal in 2026. However, search engines have become highly sophisticated at detecting unnatural acquisition patterns. This guide unpacks backlink velocity—the rate at which your domain acquires backlinks—and how to scale your link acquisition naturally using high Domain Authority guest posting.",
    author: "Alex Contenzo",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "b-2",
    title: "Domain Authority vs. Domain Rating: Which Metric Actually Matters?",
    slug: "da-vs-dr-metrics-seo",
    excerpt: "Moz's DA vs. Ahrefs' DR. We break down the math behind both indicators and how to use them to choose premium guest post placements.",
    content: "When analyzing publisher websites for link building, SEO specialists are often torn between Moz's Domain Authority (DA) and Ahrefs' Domain Rating (DR). While both seek to measure the strength of a website's link profile, they utilize different data pools and calculations. This comprehensive breakdown explains the underlying differences and which you should prioritize.",
    author: "Alex Contenzo",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "b-3",
    title: "The Ultimate Guide to Guest Posting Category Selection",
    slug: "guest-posting-category-selection-guide",
    excerpt: "Relevancy is the new authority. Find out how choosing contextually aligned categories supercharges link equity pass-through.",
    content: "Google's helpful content updates have placed a monumental emphasis on topical relevance. It is no longer enough to get a link from a DA 90 site; that link needs to be in a contextually appropriate category. We explore how niche categorization (e.g., Crypto, Finance, Casino, Tech) enhances link equity pass-through.",
    author: "Alex Contenzo",
    imageUrl: "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=600",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1",
    buyerId: "buyer-1",
    sellerId: "seller-1",
    listingId: "lst-1",
    websiteName: "TechVibe Media",
    price: 189,
    targetUrl: "https://mysaashub.example.com",
    anchorText: "Modern SaaS Platforms",
    specialInstructions: "Please place in a paragraph discussing developer productivity. Do not use generic keywords.",
    status: OrderStatus.COMPLETED,
    liveUrl: "https://techvibe.example.com/trends-in-cloud-computing",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceId: "inv-1"
  },
  {
    id: "ord-2",
    buyerId: "buyer-1",
    sellerId: "seller-1",
    listingId: "lst-2",
    websiteName: "The Crypto Ledger",
    price: 249,
    targetUrl: "https://mydefiwallet.example.com",
    anchorText: "Decentralized Wallet Security",
    specialInstructions: "Ensure keyword is in the first 200 words. Please use clean H2 headers.",
    status: OrderStatus.PROCESSING,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceId: "inv-2"
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    orderId: "ord-1",
    buyerId: "buyer-1",
    amount: 189,
    status: "PAID",
    paymentMethod: "WALLET",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "inv-2",
    orderId: "ord-2",
    buyerId: "buyer-1",
    amount: 249,
    status: "PAID",
    paymentMethod: "STRIPE",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_COUPONS: Coupon[] = [
  { code: "CONTENZO10", discountPercent: 10, isActive: true },
  { code: "WELCOME5", discountPercent: 5, isActive: true },
  { code: "OFF20", discountPercent: 20, isActive: true }
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "tkt-1",
    userId: "buyer-1",
    userName: "Sarah Jenkins",
    email: "buyer@contenzo.co.uk",
    subject: "Article creation time frame query",
    message: "If I select the copywriting add-on, what is the typical turnaround for the draft approval?",
    status: "OPEN",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    responses: [
      {
        senderId: "admin-1",
        senderName: "Alex Contenzo",
        message: "Hello Sarah! Typically, drafts are delivered for review within 48 business hours. Once you approve, it goes to the publisher immediately.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

const INITIAL_WITHDRAWALS: WithdrawRequest[] = [
  {
    id: "wdr-1",
    sellerId: "seller-1",
    sellerName: "Marcus Aurelius",
    sellerEmail: "seller@contenzo.co.uk",
    amount: 850,
    payoutMethod: "PAYPAL",
    details: "marcus.agency@paypal.example.com",
    status: "APPROVED",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "wdr-2",
    sellerId: "seller-1",
    sellerName: "Marcus Aurelius",
    sellerEmail: "seller@contenzo.co.uk",
    amount: 1400,
    payoutMethod: "BANK",
    details: "IBAN: GB98MIDL40051512345678, SWIFT: MIDLGB22",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "ntf-1",
    userId: "buyer-1",
    title: "Order Completed",
    message: "Your guest post for TechVibe Media is live! View the link on your dashboard.",
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "ntf-2",
    userId: "seller-1",
    title: "New Guest Post Order",
    message: "You have a new pending order for website 'The Crypto Ledger'. Please start processing it.",
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: "ch-1",
    buyerId: "buyer-1",
    buyerName: "Sarah Jenkins",
    sellerId: "seller-1",
    sellerName: "Marcus Aurelius",
    lastMessage: "I will make sure the anchor text matches perfectly. Thank you!",
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    chatId: "ch-1",
    senderId: "buyer-1",
    senderName: "Sarah Jenkins",
    message: "Hi Marcus, I just placed an order for TechVibe Media. Could you confirm you received it?",
    isSeen: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "msg-2",
    chatId: "ch-1",
    senderId: "seller-1",
    senderName: "Marcus Aurelius",
    message: "I will make sure the anchor text matches perfectly. Thank you!",
    isSeen: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_LOGS: SystemLog[] = [
  {
    id: "log-1",
    action: "SYSTEM_STARTUP",
    details: "CONTENZO SaaS application initialized successfully.",
    createdAt: new Date().toISOString()
  }
];

class MockDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [...INITIAL_USERS],
      listings: [...INITIAL_LISTINGS],
      orders: [...INITIAL_ORDERS],
      invoices: [...INITIAL_INVOICES],
      supportTickets: [...INITIAL_TICKETS],
      chatMessages: [...INITIAL_CHAT_MESSAGES],
      chatThreads: [...INITIAL_CHAT_THREADS],
      systemLogs: [...INITIAL_LOGS],
      coupons: [...INITIAL_COUPONS],
      withdrawRequests: [...INITIAL_WITHDRAWALS],
      notifications: [...INITIAL_NOTIFICATIONS],
      blogs: [...INITIAL_BLOGS],
      faqs: [...INITIAL_FAQS],
      testimonials: [...INITIAL_TESTIMONIALS]
    };
    this.load();
    this.initAdminEnv();
  }

  private initAdminEnv() {
    // Check environment variables for custom Admin setup
    const envAdminEmail = process.env.ADMIN_EMAIL || "admin@contenzo.co.uk";
    const envAdminName = process.env.ADMIN_NAME || "Alex Contenzo";
    
    const adminIdx = this.data.users.findIndex(u => u.role === UserRole.ADMIN);
    if (adminIdx !== -1) {
      // Update existing admin email & name if custom ones provided
      this.data.users[adminIdx].email = envAdminEmail;
      this.data.users[adminIdx].name = envAdminName;
    } else {
      // Create admin if not found
      this.data.users.push({
        id: "admin-custom",
        email: envAdminEmail,
        name: envAdminName,
        role: UserRole.ADMIN,
        isVerified: true,
        walletBalance: 10000,
        createdAt: new Date().toISOString()
      });
    }
    this.save();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, "utf-8");
        const parsed = JSON.parse(fileContent);
        this.data = { ...this.data, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load local DB. Initializing with default seeds.", e);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to local DB file.", e);
    }
  }

  // User Actions
  public getUsers(): User[] { return this.data.users; }
  public addUser(user: User) {
    this.data.users.push(user);
    this.addLog("USER_REGISTER", `Registered new user: ${user.name} (${user.email}) as ${user.role}`, user.id, user.email);
    this.save();
  }
  public updateUser(userId: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
    }
  }

  // Listings
  public getListings(): Listing[] { return this.data.listings; }
  public addListing(listing: Listing) {
    this.data.listings.push(listing);
    this.addLog("LISTING_CREATED", `Created guest posting listing: ${listing.websiteName} (Price: $${listing.price})`, listing.sellerId);
    this.save();
  }
  public updateListing(listingId: string, updates: Partial<Listing>) {
    const idx = this.data.listings.findIndex(l => l.id === listingId);
    if (idx !== -1) {
      this.data.listings[idx] = { ...this.data.listings[idx], ...updates };
      this.save();
    }
  }
  public deleteListing(listingId: string) {
    this.data.listings = this.data.listings.filter(l => l.id !== listingId);
    this.save();
  }

  // Orders
  public getOrders(): Order[] { return this.data.orders; }
  public addOrder(order: Order) {
    this.data.orders.push(order);
    this.addLog("ORDER_PLACED", `Placed order for ${order.websiteName} ($${order.price})`, order.buyerId);
    this.save();
  }
  public updateOrder(orderId: string, updates: Partial<Order>) {
    const idx = this.data.orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updates };
      this.save();
    }
  }

  // Invoices
  public getInvoices(): Invoice[] { return this.data.invoices; }
  public addInvoice(invoice: Invoice) {
    this.data.invoices.push(invoice);
    this.save();
  }

  // Coupons
  public getCoupons(): Coupon[] { return this.data.coupons; }
  public addCoupon(coupon: Coupon) {
    this.data.coupons.push(coupon);
    this.save();
  }
  public deleteCoupon(code: string) {
    this.data.coupons = this.data.coupons.filter(c => c.code !== code);
    this.save();
  }

  // Withdrawal Requests
  public getWithdrawRequests(): WithdrawRequest[] { return this.data.withdrawRequests; }
  public addWithdrawal(request: WithdrawRequest) {
    this.data.withdrawRequests.push(request);
    this.addLog("WITHDRAWAL_REQUEST", `Requested payout of $${request.amount}`, request.sellerId, request.sellerEmail);
    this.save();
  }
  public updateWithdrawal(id: string, status: "APPROVED" | "REJECTED") {
    const idx = this.data.withdrawRequests.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.withdrawRequests[idx].status = status;
      this.save();
    }
  }

  // Support Tickets
  public getTickets(): SupportTicket[] { return this.data.supportTickets; }
  public addTicket(ticket: SupportTicket) {
    this.data.supportTickets.push(ticket);
    this.save();
  }
  public updateTicketStatus(id: string, status: "OPEN" | "RESOLVED") {
    const idx = this.data.supportTickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.supportTickets[idx].status = status;
      this.save();
    }
  }
  public addTicketResponse(id: string, response: { senderId: string; senderName: string; message: string; createdAt: string }) {
    const idx = this.data.supportTickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.supportTickets[idx].responses.push(response);
      this.save();
    }
  }

  // Notifications
  public getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }
  public addNotification(userId: string, title: string, message: string) {
    this.data.notifications.unshift({
      id: "ntf-" + Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    this.save();
  }
  public markNotificationsAsRead(userId: string) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    this.save();
  }

  // Chats
  public getChatThreads(userId: string): ChatThread[] {
    return this.data.chatThreads.filter(t => t.buyerId === userId || t.sellerId === userId);
  }
  public getChatMessages(chatId: string): ChatMessage[] {
    return this.data.chatMessages.filter(m => m.chatId === chatId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  public getOrCreateChatThread(buyerId: string, buyerName: string, sellerId: string, sellerName: string): ChatThread {
    let thread = this.data.chatThreads.find(t => t.buyerId === buyerId && t.sellerId === sellerId);
    if (!thread) {
      thread = {
        id: "ch-" + Math.random().toString(36).substr(2, 9),
        buyerId,
        buyerName,
        sellerId,
        sellerName,
        lastMessage: "",
        updatedAt: new Date().toISOString()
      };
      this.data.chatThreads.unshift(thread);
      this.save();
    }
    return thread;
  }
  public addChatMessage(chatId: string, senderId: string, senderName: string, message: string, attachmentUrl?: string): ChatMessage {
    const chatMsg: ChatMessage = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      chatId,
      senderId,
      senderName,
      message,
      attachmentUrl,
      isSeen: false,
      createdAt: new Date().toISOString()
    };
    this.data.chatMessages.push(chatMsg);
    
    // Update last message in thread
    const threadIdx = this.data.chatThreads.findIndex(t => t.id === chatId);
    if (threadIdx !== -1) {
      this.data.chatThreads[threadIdx].lastMessage = message;
      this.data.chatThreads[threadIdx].updatedAt = new Date().toISOString();
      
      // Move thread to the top of list
      const [thread] = this.data.chatThreads.splice(threadIdx, 1);
      this.data.chatThreads.unshift(thread);
    }
    
    this.save();
    return chatMsg;
  }

  // Logs
  public getLogs(): SystemLog[] { return this.data.systemLogs; }
  public addLog(action: string, details: string, userId?: string, userEmail?: string) {
    this.data.systemLogs.unshift({
      id: "log-" + Math.random().toString(36).substr(2, 9),
      action,
      userId,
      userEmail,
      details,
      createdAt: new Date().toISOString()
    });
    this.save();
  }

  // CMS
  public getBlogs(): BlogArticle[] { return this.data.blogs; }
  public addBlog(blog: BlogArticle) {
    this.data.blogs.push(blog);
    this.save();
  }
  public updateBlog(id: string, updates: Partial<BlogArticle>) {
    const idx = this.data.blogs.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.blogs[idx] = { ...this.data.blogs[idx], ...updates };
      this.save();
    }
  }
  public deleteBlog(id: string) {
    this.data.blogs = this.data.blogs.filter(b => b.id !== id);
    this.save();
  }

  public getFaqs(): FAQ[] { return this.data.faqs; }
  public updateFaq(id: string, updates: Partial<FAQ>) {
    const idx = this.data.faqs.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.data.faqs[idx] = { ...this.data.faqs[idx], ...updates };
      this.save();
    }
  }

  public getTestimonials(): Testimonial[] { return this.data.testimonials; }
  public updateTestimonial(id: string, updates: Partial<Testimonial>) {
    const idx = this.data.testimonials.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.testimonials[idx] = { ...this.data.testimonials[idx], ...updates };
      this.save();
    }
  }
}

export const db = new MockDatabase();
