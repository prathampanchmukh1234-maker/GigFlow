export enum UserRole {
  FREELANCER = 'FREELANCER',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
}

export interface Gig {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  deliveryTime: number; // in days
}

export interface Order {
  id: string;
  clientId: string;
  gigId: string;
  sellerId: string;
  status: OrderStatus;
  amount: number;
  createdAt: string;
  gigTitle: string;
  reviewId?: string; // Added to track if reviewed
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  otherUser: User;
  lastMessage: Message;
}

export interface Review {
  id: string;
  gigId: string;
  orderId?: string; // Optional - can be direct review without order
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}
