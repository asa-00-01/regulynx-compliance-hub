
export interface AMLTransaction {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  senderName: string;
  receiverName: string;
  senderAmount: number;
  senderCurrency: string;
  receiverAmount: number;
  receiverCurrency: string;
  method: string;
  status: string;
  timestamp: string;
  senderCountryCode: string;
  receiverCountryCode: string;
  riskScore: number;
  isSuspect: boolean;
  flagged?: boolean;
  reasonForSending: string;
}
