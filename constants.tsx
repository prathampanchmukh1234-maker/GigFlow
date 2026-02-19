
import { User, Gig, UserRole, Review, Order, OrderStatus } from './types';

export const CATEGORIES = [
  "Prompt Engineering",
  "UI/UX Design",
  "Graphics & Design",
  "Digital Marketing",
  "Writing & Translation",
  "Video & Animation",
  "Programming & Tech",
  "Data",
  "Business"
];

// Reliable Fallback URLs
export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1559028012-481c04fa702d';
export const FALLBACK_AVATAR = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'John Freelance',
    email: 'john@freelancer.com',
    role: UserRole.FREELANCER,
    avatar: FALLBACK_AVATAR('John'),
    bio: 'Full-stack developer and Senior Prompt Engineer with 5 years experience in LLM orchestration.'
  },
  {
    id: 'u2',
    name: 'Sarah Client',
    email: 'sarah@client.com',
    role: UserRole.CLIENT,
    avatar: FALLBACK_AVATAR('Sarah')
  },
  {
    id: 'u3',
    name: 'Alex Creative',
    email: 'alex@design.com',
    role: UserRole.FREELANCER,
    avatar: FALLBACK_AVATAR('Alex'),
    bio: 'Award-winning UI/UX Designer specialized in Design Systems and SaaS products.'
  },
  {
    id: 'u4',
    name: 'Elena Video',
    email: 'elena@motion.com',
    role: UserRole.FREELANCER,
    avatar: FALLBACK_AVATAR('Elena'),
    bio: 'AI Video Architect and Motion Designer specializing in cinematic generative content.'
  },
  {
    id: 'u5',
    name: 'Marcus Data',
    email: 'marcus@data.com',
    role: UserRole.FREELANCER,
    avatar: FALLBACK_AVATAR('Marcus'),
    bio: 'Big Data Strategist and Machine Learning Engineer.'
  },
  {
    id: 'u6',
    name: 'Admin User',
    email: 'admin@gigflow.com',
    role: UserRole.ADMIN,
    avatar: FALLBACK_AVATAR('Admin'),
    bio: 'Global platform administrator for GigFlow.'
  }
];

export const MOCK_GIGS: Gig[] = [
  // --- PROMPT ENGINEERING ---
  {
    id: 'pe_1',
    sellerId: 'u1',
    sellerName: 'John Freelance',
    title: 'I will provide Enterprise Prompt Engineering for GPT-4 and Claude 3',
    description: 'Expert prompt optimization to reduce hallucination and maximize output quality. I specialize in Chain-of-Thought prompting and few-shot learning for enterprise-scale LLM deployments.',
    price: 0,
    category: 'Prompt Engineering',
    images: ['https://images.unsplash.com/photo-1620712943543-bcc4638ef00d?q=80&w=800'],
    rating: 4.9,
    reviewsCount: 142,
    deliveryTime: 2
  },
  {
    id: 'pe_2',
    sellerId: 'u1',
    sellerName: 'John Freelance',
    title: 'I will build Custom GPT Agents with Advanced Prompt Engineering',
    description: 'Autonomous agents for your business. I will engineer the system prompts and tool-use instructions to create highly reliable AI employees that integrate with your APIs.',
    price: 550,
    category: 'Prompt Engineering',
    images: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800'],
    rating: 4.9,
    reviewsCount: 56,
    deliveryTime: 4
  },
  {
    id: 'pe_3',
    sellerId: 'u5',
    sellerName: 'Marcus Data',
    title: 'I will develop RAG Pipelines with optimized vector search prompts',
    description: 'Bridge the gap between your data and LLMs. I design custom Retrieval Augmented Generation systems with specialized prompts for context window management.',
    price: 1200,
    category: 'Prompt Engineering',
    images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800'],
    rating: 5.0,
    reviewsCount: 23,
    deliveryTime: 7
  },

  // --- UI/UX DESIGN ---
  {
    id: 'ux_1',
    sellerId: 'u3',
    sellerName: 'Alex Creative',
    title: 'I will design a modern UI/UX for your SaaS platform in Figma',
    description: 'High-fidelity dashboard and interface design focused on usability. I build interactive prototypes and provide full documentation for developers.',
    price: 0,
    category: 'UI/UX Design',
    images: ['https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800'],
    rating: 5.0,
    reviewsCount: 89,
    deliveryTime: 10
  },
  {
    id: 'ux_2',
    sellerId: 'u3',
    sellerName: 'Alex Creative',
    title: 'I will create a comprehensive Design System for your product',
    description: 'Stop inconsistent UI. I will build a scalable component library in Figma including tokens, variants, and documentation for your engineering team.',
    price: 2500,
    category: 'UI/UX Design',
    images: ['https://images.unsplash.com/photo-1613909209432-7b4a4223743a?q=80&w=800'],
    rating: 4.8,
    reviewsCount: 41,
    deliveryTime: 21
  },

  // --- GRAPHICS & DESIGN ---
  {
    id: 'gd_1',
    sellerId: 'u3',
    sellerName: 'Alex Creative',
    title: 'I will design a premium minimalist brand identity',
    description: 'Beyond just a logo. I provide a visual language for your brand, including color palettes, typography, and social media kits.',
    price: 450,
    category: 'Graphics & Design',
    images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800'],
    rating: 4.9,
    reviewsCount: 312,
    deliveryTime: 5
  },
  {
    id: 'gd_2',
    sellerId: 'u4',
    sellerName: 'Elena Video',
    title: 'I will create custom 3D abstract backgrounds for your website',
    description: 'High-end 3D renders that give your site a futuristic feel. Perfect for tech startups and creative agencies.',
    price: 150,
    category: 'Graphics & Design',
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800'],
    rating: 5.0,
    reviewsCount: 67,
    deliveryTime: 3
  },

  // --- DIGITAL MARKETING ---
  {
    id: 'dm_1',
    sellerId: 'u5',
    sellerName: 'Marcus Data',
    title: 'I will manage your Meta Ads with AI-driven performance tracking',
    description: 'I use advanced data models to optimize your ad spend. My strategies focus on high ROAS and precise audience targeting.',
    price: 800,
    category: 'Digital Marketing',
    images: ['https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?q=80&w=800'],
    rating: 4.7,
    reviewsCount: 156,
    deliveryTime: 30
  },

  // --- WRITING & TRANSLATION ---
  {
    id: 'wt_1',
    sellerId: 'u1',
    sellerName: 'John Freelance',
    title: 'I will write high-converting technical documentation for APIs',
    description: 'Make your developers love you. I translate complex systems into clear, actionable documentation and tutorials.',
    price: 600,
    category: 'Writing & Translation',
    images: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800'],
    rating: 5.0,
    reviewsCount: 45,
    deliveryTime: 7
  },

  // --- VIDEO & ANIMATION ---
  {
    id: 'va_1',
    sellerId: 'u4',
    sellerName: 'Elena Video',
    title: 'I will create an AI-generated cinematic trailer for your book',
    description: 'Using Midjourney and Runway Gen-2, I produce high-quality cinematic trailers that would cost thousands in traditional production.',
    price: 400,
    category: 'Video & Animation',
    images: ['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800'],
    rating: 4.9,
    reviewsCount: 128,
    deliveryTime: 5
  },
  {
    id: 'va_2',
    sellerId: 'u4',
    sellerName: 'Elena Video',
    title: 'I will design custom Lottie animations for your mobile app',
    description: 'Smooth, lightweight vector animations that enhance user engagement without slowing down your application.',
    price: 200,
    category: 'Video & Animation',
    images: ['https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=800'],
    rating: 5.0,
    reviewsCount: 92,
    deliveryTime: 3
  },

  // --- PROGRAMMING & TECH ---
  {
    id: 'pt_1',
    sellerId: 'u1',
    sellerName: 'John Freelance',
    title: 'I will develop a Full-stack Next.js application with AI integration',
    description: 'Complete scalable web application from scratch. Includes auth, database, and integration with OpenAI or Gemini APIs.',
    price: 1500,
    category: 'Programming & Tech',
    images: ['https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800'],
    rating: 5.0,
    reviewsCount: 74,
    deliveryTime: 14
  },
  {
    id: 'pt_2',
    sellerId: 'u5',
    sellerName: 'Marcus Data',
    title: 'I will build custom Web Scrapers for complex dynamic websites',
    description: 'Extract data from any source. I build robust scrapers that handle pagination, infinite scroll, and anti-bot measures.',
    price: 300,
    category: 'Programming & Tech',
    images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800'],
    rating: 4.8,
    reviewsCount: 210,
    deliveryTime: 4
  },

  // --- DATA ---
  {
    id: 'dt_1',
    sellerId: 'u5',
    sellerName: 'Marcus Data',
    title: 'I will provide advanced Data Visualization in Tableau or PowerBI',
    description: 'Turn your raw numbers into actionable insights. I design intuitive dashboards that help you make better business decisions.',
    price: 500,
    category: 'Data',
    images: ['https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?q=80&w=800'],
    rating: 4.9,
    reviewsCount: 88,
    deliveryTime: 5
  },

  // --- BUSINESS ---
  {
    id: 'bs_1',
    sellerId: 'u3',
    sellerName: 'Alex Creative',
    title: 'I will design a winning Pitch Deck for your startup',
    description: 'I combine business strategy with high-end design to help you close your seed or series A round. Includes narrative coaching.',
    price: 1200,
    category: 'Business',
    images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800'],
    rating: 5.0,
    reviewsCount: 34,
    deliveryTime: 10
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    gigId: 'pe_1',
    orderId: 'mock_ord_1',
    userId: 'u2',
    userName: 'Sarah Client',
    userAvatar: FALLBACK_AVATAR('Sarah'),
    rating: 5,
    comment: "Excellent service. Reduced hallucinations by 40%.",
    createdAt: '2024-03-10T14:30:00Z'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'mock_ord_1',
    clientId: 'u2',
    gigId: 'pe_1',
    sellerId: 'u1',
    status: OrderStatus.COMPLETED,
    amount: 350,
    createdAt: '2024-03-01T10:00:00Z',
    gigTitle: 'Enterprise Prompt Engineering for GPT-4',
    reviewId: 'rev_1'
  }
];
