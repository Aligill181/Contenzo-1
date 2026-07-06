/**
 * CONTENZO - Premium Guest Posting Marketplace
 * Shared TypeScript Types
 */

export enum UserRole {
  BUYER = "BUYER",
  SELLER = "SELLER",
  ADMIN = "ADMIN"
}

export interface User {
  id: string;
  email: string;
  passwordHash?: string; // Hidden in frontend
  name: string;
  role: UserRole;
  isVerified: boolean;
  walletBalance: number;
  avatarUrl?: string;
  createdAt: string;
  isVerifiedPublisher?: boolean; // For sellers
  company?: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  websiteName: string;
  domainAuthority: number; // DA
  domainRating: number; // DR
  traffic: number; // Monthly visits
  country: string;
  language: string;
  category: string; // Business, Technology, Crypto, Casino, Betting, Finance, Health, CBD, Dating, etc.
  price: number;
  turnaroundTime: number; // Days
  isPermanentLink: boolean;
  isSponsored: boolean;
  isNofollow: boolean;
  isDofollow: boolean;
  sampleUrl: string;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  REFUNDED = "REFUNDED"
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  websiteName: string;
  price: number;
  targetUrl: string;
  anchorText: string;
  specialInstructions?: string;
  status: OrderStatus;
  liveUrl?: string; // Provided by seller when completed
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  invoiceId: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  buyerId: string;
  amount: number;
  status: "PAID" | "UNPAID" | "REFUNDED";
  paymentMethod: "STRIPE" | "PAYPAY" | "WALLET";
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  email: string;
  subject: string;
  message: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  responses: Array<{
    senderId: string;
    senderName: string;
    message: string;
    createdAt: string;
  }>;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  message: string;
  attachmentUrl?: string;
  isSeen: boolean;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage?: string;
  updatedAt: string;
}

export interface SystemLog {
  id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  details: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  isActive: boolean;
}

export interface WithdrawRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  amount: number;
  payoutMethod: "PAYPAL" | "BANK";
  details: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  imageUrl: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatarUrl: string;
}
