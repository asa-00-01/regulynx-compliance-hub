
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Risk factor weights (should be configurable in a real system)
const RISK_WEIGHTS = {
  COUNTRY: 0.35,
  TRANSACTION_FREQUENCY: 0.25,
  TRANSACTION_AMOUNT: 0.30,
  KYC_STATUS: 0.10,
};

// Country risk tiers
const COUNTRY_RISK = {
  'Sweden': 0.1,
  'Norway': 0.1,
  'Finland': 0.1,
  'Denmark': 0.1,
  'Germany': 0.2,
  'UK': 0.2,
  'France': 0.2,
  'Spain': 0.3,
  'Turkey': 0.6,
  'Russia': 0.7,
  'Colombia': 0.8,
  'Nigeria': 0.9,
  // Default for unlisted countries
  'DEFAULT': 0.5
};

// Mock user data with risk factors
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    country: 'Sweden',
    transactionFrequency: 5, // per month
    transactionAmount: 3000, // SEK
    kycStatus: 'verified',
  },
  {
    id: '2',
    name: 'Jane Smith',
    country: 'Denmark',
    transactionFrequency: 8,
    transactionAmount: 7500,
    kycStatus: 'pending',
  },
  {
    id: '3',
    name: 'Ahmed Hassan',
    country: 'Turkey',
    transactionFrequency: 12,
    transactionAmount: 15000,
    kycStatus: 'pending',
  },
  {
    id: '4',
    name: 'Sofia Rodriguez',
    country: 'Colombia',
    transactionFrequency: 3,
    transactionAmount: 12000,
    kycStatus: 'rejected',
  },
  {
    id: '5',
    name: 'Alexander Petrov',
    country: 'Russia',
    transactionFrequency: 15,
    transactionAmount: 25000,
    kycStatus: 'verified',
  },
];

type UserWithRiskScore = {
  id: string;
  name: string;
  country: string;
  transactionFrequency: number;
  transactionAmount: number;
  kycStatus: string;
  riskScore: number;
  previousScore?: number;
  countryRisk: number;
  frequencyRisk: number;
  amountRisk: number;
  kycRisk: number;
};

const RiskScoringEngine: React.FC = () => {
  const [usersWithRiskScores, setUsersWithRiskScores] = useState<UserWithRiskScore[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    // Calculate risk scores for all users
    const scoredUsers = mockUsers.map(user => {
      // Country risk (0.1 to 0.9 based on country risk tier)
      const countryRisk = COUNTRY_RISK[user.country as keyof typeof COUNTRY_RISK] || COUNTRY_RISK.DEFAULT;
      
      // Transaction frequency risk (0.1 to 0.9 based on frequency)
      let frequencyRisk = 0.1;
      if (user.transactionFrequency > 5) frequencyRisk = 0.3;
      if (user.transactionFrequency > 10) frequencyRisk = 0.6;
      if (user.transactionFrequency > 15) frequencyRisk = 0.9;
      
      // Transaction amount risk (0.1 to 0.9 based on amount)
      let amountRisk = 0.1;
      if (user.transactionAmount > 5000) amountRisk = 0.3;
      if (user.transactionAmount > 10000) amountRisk = 0.6;
      if (user.transactionAmount > 20000) amountRisk = 0.9;
      
      // KYC status risk (0.1 to 0.9 based on verification status)
      let kycRisk = 0.1; // Verified
      if (user.kycStatus === 'pending') kycRisk = 0.5;
      if (user.kycStatus === 'rejected') kycRisk = 0.9;
      
      // Calculate weighted risk score (0-100)
      const weightedRiskScore = 
        (countryRisk * RISK_WEIGHTS.COUNTRY) +
        (frequencyRisk * RISK_WEIGHTS.TRANSACTION_FREQUENCY) +
        (amountRisk * RISK_WEIGHTS.TRANSACTION_AMOUNT) +
        (kycRisk * RISK_WEIGHTS.KYC_STATUS);
      
      // Convert to 0-100 scale
      const riskScore = Math.round(weightedRiskScore * 100);
      
      // Add a simulated previous score for trend visualization
      const previousScore = Math.max(0, Math.min(100, riskScore + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10)));
      
      return {
        ...user,
        riskScore,
        previousScore,
        countryRisk: Math.round(countryRisk * 100),
        frequencyRisk: Math.round(frequencyRisk * 100),
        amountRisk: Math.round(amountRisk * 100),
        kycRisk: Math.round(kycRisk * 100)
      };
    });
    
    setUsersWithRiskScores(scoredUsers);
    
    // Calculate risk distribution
    const lowRisk = scoredUsers.filter(u => u.riskScore <= 30).length;
    const mediumRisk = scoredUsers.filter(u => u.riskScore > 30 && u.riskScore <= 70).length;
    const highRisk = scoredUsers.filter(u => u.riskScore > 70).length;
    
    setRiskDistribution([
      { name: 'Low Risk (0-30)', value: lowRisk, color: '#4caf50' },
      { name: 'Medium Risk (31-70)', value: mediumRisk, color: '#ff9800' },
      { name: 'High Risk (71-100)', value: highRisk, color: '#f44336' },
    ]);
    
  }, []);

  const getRiskScoreClass = (score: number) => {
    if (score <= 30) return "bg-green-100 text-green-800";
    if (score <= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Scoring Engine</CardTitle>
          <CardDescription>
            Dynamic risk assessment based on multiple factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Distribution Chart */}
          <div className="h-72">
            <h3 className="mb-4 text-sm font-medium">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Number of Users">
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Risk Score Breakdown Table */}
          <div>
            <h3 className="mb-4 text-sm font-medium">User Risk Scores</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-center">Risk Score</TableHead>
                    <TableHead>Risk Factors</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersWithRiskScores.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.country}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRiskScoreClass(
                            user.riskScore
                          )}`}
                        >
                          {user.riskScore}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Country:</span>
                            <span className={`${getRiskScoreClass(user.countryRisk)}`}>
                              {user.countryRisk}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Transaction Frequency:</span>
                            <span className={`${getRiskScoreClass(user.frequencyRisk)}`}>
                              {user.frequencyRisk}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Transaction Amount:</span>
                            <span className={`${getRiskScoreClass(user.amountRisk)}`}>
                              {user.amountRisk}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>KYC Status:</span>
                            <span className={`${getRiskScoreClass(user.kycRisk)}`}>
                              {user.kycRisk}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.riskScore > (user.previousScore || 0) ? (
                          <div className="flex items-center text-red-500">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            +{user.riskScore - (user.previousScore || 0)}
                          </div>
                        ) : user.riskScore < (user.previousScore || 0) ? (
                          <div className="flex items-center text-green-500">
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                            {user.riskScore - (user.previousScore || 0)}
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <Activity className="h-4 w-4 mr-1" />
                            No change
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskScoringEngine;
