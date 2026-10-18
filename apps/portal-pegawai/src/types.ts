export type PageRoute = 
  | 'home'
  | 'profile'
  | 'services'
  | 'public-info'
  | 'faq'
  | 'contact';

export type PublicInfoCategory = 'bumdes' | 'sop' | 'wbk' | 'sipp' | 'pad' | 'evaluasi';

export interface Announcement {
  id: string;
  title: string;
  date: string;
  category: string;
  shortDescription: string;
  content: string;
  isNew?: boolean;
  isImportant?: boolean;
}

export interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  operatingHours: string;
  phone: string;
  mapsUrl: string;
  mapsEmbedUrl?: string;
  isMain?: boolean;
  isDriveThru?: boolean;
  type: 'induk' | 'pembantu' | 'cepat' | 'drive-thru' | 'keliling' | 'mpp' | 'gerai' | 'paten';
  description?: string;
}

export interface BUMDesPoster {
  id: string;
  title: string;
  village: string;
  district: string;
  imageUrl: string;
  dateAdded: string;
  downloads: number;
}

export interface PublicDocument {
  id: string;
  title: string;
  category: 'sop' | 'wbk' | 'sipp' | 'pad' | 'evaluasi';
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  updateDate: string;
  description?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  viewCount: number;
  isPopular?: boolean;
  isEnabled: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Completed';
  createdAt: string;
}

export interface ChatbotFAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
  isEnabled: boolean;
  clickCount: number;
}

export interface PADTarget {
  id: string;
  year: number;
  category: string;
  targetAmount: number; // in IDR
  realizationAmount: number; // in IDR
  percent: number;
}

export interface PerformanceReport {
  id: string;
  title: string;
  year: number;
  score: number; // out of 100
  grade: string;
  pdfUrl: string;
  summary: string;
}

export interface DashboardStats {
  totalVisitors: number;
  totalLocations: number;
  totalDocuments: number;
  totalPosters: number;
  unreadMessages: number;
  totalFaqs: number;
  publicSatisfactionScore: number;
  appDownloadsSignal: number;
  appDownloadsSekpole: number;
  sakpoleIntegrationClicks: number;
  messagesMonthly: { month: string; count: number }[];
  faqPopularity: { question: string; views: number }[];
  locationClicks: { locationName: string; clicks: number }[];
}
