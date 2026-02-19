
import mongoose from 'mongoose';

const { Schema } = mongoose;

// USER SCHEMA
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Should be hashed
  role: { type: String, enum: ['FREELANCER', 'CLIENT', 'ADMIN'], default: 'CLIENT' },
  avatar: { type: String },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// GIG SCHEMA
const GigSchema = new Schema({
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  deliveryTime: { type: Number, required: true }
});

// ORDER SCHEMA
const OrderSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gigId: { type: Schema.Types.ObjectId, ref: 'Gig', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  amount: { type: Number, required: true },
  gigTitle: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// MESSAGE SCHEMA
const MessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Gig = mongoose.model('Gig', GigSchema);
export const Order = mongoose.model('Order', OrderSchema);
export const Message = mongoose.model('Message', MessageSchema);
