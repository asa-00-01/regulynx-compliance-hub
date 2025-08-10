
export interface KYCCustomer {
  id: string;
  name: string;
  email: string;
  riskScore: number;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'information_requested';
  lastTransaction?: string;
  country: string;
  createdAt: string;
}

export interface DashboardStatsProps {
  totalUsers: number;
  pendingVerifications: number;
  riskAlerts: number;
  averageProcessingTime: number;
  flaggedUsers: number;
  pendingReviews: number;
  highRiskUsers: number;
  recentAlerts: number;
}

export interface KYCPaginationResult {
  currentData: KYCCustomer[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
}
