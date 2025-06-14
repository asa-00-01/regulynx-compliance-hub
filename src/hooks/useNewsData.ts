
import { useState, useEffect } from 'react';
import { NewsItem, RSSFeed } from '@/types/news';

export const useNewsData = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setNewsItems(mockNewsItems);
      setRssFeeds(mockRssFeeds);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    newsItems,
    rssFeeds,
    loading,
  };
};

// Mock data for news items
const mockNewsItems: NewsItem[] = [
  {
    id: '1',
    title: 'FinCEN Issues New AML Requirements for Financial Institutions',
    description: 'The Financial Crimes Enforcement Network has announced updated anti-money laundering requirements that will take effect in Q2 2024.',
    url: 'https://www.fincen.gov/news/news-releases',
    source: 'fincen',
    category: 'aml',
    publishedAt: '2024-01-15T10:00:00Z',
    author: 'FinCEN Communications'
  },
  {
    id: '2',
    title: 'FATF Updates Guidance on Digital Identity and KYC',
    description: 'New guidance provides recommendations for implementing digital identity solutions in customer due diligence processes.',
    url: 'https://www.fatf-gafi.org/publications/',
    source: 'fatf',
    category: 'kyc',
    publishedAt: '2024-01-14T15:30:00Z',
    author: 'FATF Secretariat'
  },
  {
    id: '3',
    title: 'OFAC Adds New Entities to Sanctions List',
    description: 'The Office of Foreign Assets Control has designated additional individuals and entities under various sanctions programs.',
    url: 'https://ofac.treasury.gov/recent-actions',
    source: 'ofac',
    category: 'sanctions',
    publishedAt: '2024-01-13T14:00:00Z',
    author: 'OFAC'
  },
  {
    id: '4',
    title: 'SEC Proposes Enhanced Compliance Rules for Investment Advisers',
    description: 'New proposed rules would strengthen compliance and risk management requirements for registered investment advisers.',
    url: 'https://www.sec.gov/news/press-release',
    source: 'sec',
    category: 'regulatory',
    publishedAt: '2024-01-12T16:45:00Z',
    author: 'SEC Press Office'
  },
  {
    id: '5',
    title: 'CFTC Issues Risk Management Guidelines for Derivatives',
    description: 'Updated guidance addresses risk management practices for derivatives clearing organizations and market participants.',
    url: 'https://www.cftc.gov/PressRoom/PressReleases',
    source: 'cftc',
    category: 'compliance',
    publishedAt: '2024-01-11T11:20:00Z',
    author: 'CFTC'
  },
  {
    id: '6',
    title: 'Federal Register: New BSA Reporting Requirements',
    description: 'Proposed changes to Bank Secrecy Act reporting requirements for virtual currency transactions.',
    url: 'https://www.federalregister.gov',
    source: 'federal-register',
    category: 'regulatory',
    publishedAt: '2024-01-10T09:15:00Z',
    author: 'Treasury Department'
  }
];

// Mock data for RSS feeds
const mockRssFeeds: RSSFeed[] = [
  {
    id: '1',
    title: 'FinCEN News and Updates',
    description: 'Latest news releases and updates from the Financial Crimes Enforcement Network',
    feedUrl: 'https://www.fincen.gov/news/rss.xml',
    websiteUrl: 'https://www.fincen.gov',
    organization: 'Financial Crimes Enforcement Network',
    categories: ['AML', 'BSA', 'Compliance'],
    status: 'active',
    lastUpdated: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'FATF Publications',
    description: 'Publications and guidance from the Financial Action Task Force',
    feedUrl: 'https://www.fatf-gafi.org/rss/publications.xml',
    websiteUrl: 'https://www.fatf-gafi.org',
    organization: 'Financial Action Task Force',
    categories: ['AML', 'KYC', 'International Standards'],
    status: 'active',
    lastUpdated: '2024-01-14T15:30:00Z'
  },
  {
    id: '3',
    title: 'OFAC Recent Actions',
    description: 'Recent enforcement actions and sanctions updates from OFAC',
    feedUrl: 'https://ofac.treasury.gov/rss/recent-actions.xml',
    websiteUrl: 'https://ofac.treasury.gov',
    organization: 'Office of Foreign Assets Control',
    categories: ['Sanctions', 'Enforcement'],
    status: 'active',
    lastUpdated: '2024-01-13T14:00:00Z'
  },
  {
    id: '4',
    title: 'SEC Press Releases',
    description: 'Press releases and announcements from the Securities and Exchange Commission',
    feedUrl: 'https://www.sec.gov/rss/press-release.xml',
    websiteUrl: 'https://www.sec.gov',
    organization: 'Securities and Exchange Commission',
    categories: ['Securities', 'Enforcement', 'Regulatory'],
    status: 'active',
    lastUpdated: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    title: 'CFTC Press Releases',
    description: 'Press releases from the Commodity Futures Trading Commission',
    feedUrl: 'https://www.cftc.gov/rss/pressreleases.xml',
    websiteUrl: 'https://www.cftc.gov',
    organization: 'Commodity Futures Trading Commission',
    categories: ['Derivatives', 'Risk Management', 'Enforcement'],
    status: 'active',
    lastUpdated: '2024-01-11T11:20:00Z'
  },
  {
    id: '6',
    title: 'ECB Banking Supervision',
    description: 'Updates from the European Central Bank on banking supervision and regulation',
    feedUrl: 'https://www.bankingsupervision.europa.eu/rss/all.xml',
    websiteUrl: 'https://www.bankingsupervision.europa.eu',
    organization: 'European Central Bank',
    categories: ['Banking', 'Supervision', 'European Regulation'],
    status: 'active',
    lastUpdated: '2024-01-10T08:30:00Z'
  }
];
