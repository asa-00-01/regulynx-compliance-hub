
import { useState, useEffect } from 'react';
import { NewsItem, RSSFeed } from '@/types/news';
import { handleAPIError, withRetry } from '@/lib/api';
import { toast } from 'sonner';

export const useNewsData = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNewsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call with retry logic
      await withRetry(async () => {
        // In production, this would be actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setNewsItems(mockNewsItems);
        setRssFeeds(mockRssFeeds);
      }, 3, 1000);
      
    } catch (err) {
      const error = handleAPIError(err, 'loading news data');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewsData();
  }, []);

  const refetch = async () => {
    setError(null);
    await loadNewsData();
  };

  return {
    newsItems,
    rssFeeds,
    loading,
    error,
    refetch,
  };
};

// Mock data for news items - now including EU and Swedish sources
const mockNewsItems: NewsItem[] = [
  // Existing US sources
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
  },
  // New EU sources
  {
    id: '7',
    title: 'EBA Issues New Guidelines on AML/CFT Risk Assessment',
    description: 'The European Banking Authority has published updated guidelines on money laundering and terrorist financing risk assessment for credit institutions.',
    url: 'https://www.eba.europa.eu/news-press',
    source: 'eba',
    category: 'aml',
    publishedAt: '2024-01-16T08:30:00Z',
    author: 'EBA Press Office'
  },
  {
    id: '8',
    title: 'ECB Announces Enhanced Supervision Framework',
    description: 'New supervisory framework for significant institutions under the Single Supervisory Mechanism comes into effect.',
    url: 'https://www.bankingsupervision.europa.eu/press/',
    source: 'ecb-banking',
    category: 'eu-regulation',
    publishedAt: '2024-01-15T14:00:00Z',
    author: 'ECB Banking Supervision'
  },
  {
    id: '9',
    title: 'ESMA Updates MiFID II Guidelines for Investment Services',
    description: 'European Securities and Markets Authority provides clarification on investment service requirements under MiFID II.',
    url: 'https://www.esma.europa.eu/press-news',
    source: 'esma',
    category: 'eu-regulation',
    publishedAt: '2024-01-14T11:45:00Z',
    author: 'ESMA Communications'
  },
  {
    id: '10',
    title: 'European Commission Proposes New Anti-Money Laundering Authority',
    description: 'EC proposes establishment of a new EU-wide authority to coordinate anti-money laundering efforts across member states.',
    url: 'https://ec.europa.eu/commission/presscorner/',
    source: 'european-commission',
    category: 'aml',
    publishedAt: '2024-01-13T12:30:00Z',
    author: 'European Commission'
  },
  // New Swedish sources
  {
    id: '11',
    title: 'Finansinspektionen Strengthens Crypto Asset Oversight',
    description: 'Swedish Financial Supervisory Authority introduces new requirements for cryptocurrency service providers operating in Sweden.',
    url: 'https://www.fi.se/en/published/news/',
    source: 'finansinspektionen',
    category: 'sweden-regulation',
    publishedAt: '2024-01-12T09:00:00Z',
    author: 'Finansinspektionen'
  },
  {
    id: '12',
    title: 'Riksbank Issues CBDC Development Update',
    description: 'Sweden\'s central bank provides progress report on e-krona digital currency pilot project and regulatory implications.',
    url: 'https://www.riksbank.se/en-gb/press-and-published/',
    source: 'riksbank',
    category: 'sweden-regulation',
    publishedAt: '2024-01-11T13:15:00Z',
    author: 'Sveriges Riksbank'
  },
  {
    id: '13',
    title: 'Swedish Tax Agency Updates Crypto Reporting Rules',
    description: 'Skatteverket clarifies tax reporting requirements for cryptocurrency transactions by Swedish residents and businesses.',
    url: 'https://www.skatteverket.se/servicelankar/press.html',
    source: 'skatteverket',
    category: 'sweden-regulation',
    publishedAt: '2024-01-10T10:30:00Z',
    author: 'Skatteverket'
  }
];

// Mock data for RSS feeds - now including EU and Swedish sources
const mockRssFeeds: RSSFeed[] = [
  // Existing feeds
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
  },
  // New EU regulatory body feeds
  {
    id: '7',
    title: 'EBA News and Press Releases',
    description: 'Latest news and regulatory updates from the European Banking Authority',
    feedUrl: 'https://www.eba.europa.eu/rss/news-press.xml',
    websiteUrl: 'https://www.eba.europa.eu',
    organization: 'European Banking Authority',
    categories: ['Banking', 'AML', 'EU Regulation', 'Supervision'],
    status: 'active',
    lastUpdated: '2024-01-16T08:30:00Z'
  },
  {
    id: '8',
    title: 'ESMA Press Releases',
    description: 'Updates from European Securities and Markets Authority on financial market regulation',
    feedUrl: 'https://www.esma.europa.eu/rss/press-news.xml',
    websiteUrl: 'https://www.esma.europa.eu',
    organization: 'European Securities and Markets Authority',
    categories: ['Securities', 'Markets', 'MiFID', 'EU Regulation'],
    status: 'active',
    lastUpdated: '2024-01-14T11:45:00Z'
  },
  {
    id: '9',
    title: 'European Commission Financial Services',
    description: 'Financial services policy updates and legislative proposals from the European Commission',
    feedUrl: 'https://ec.europa.eu/info/news/rss/financial-services.xml',
    websiteUrl: 'https://ec.europa.eu/info/business-economy-euro/banking-and-finance',
    organization: 'European Commission',
    categories: ['Financial Services', 'Policy', 'Legislation', 'EU Regulation'],
    status: 'active',
    lastUpdated: '2024-01-13T12:30:00Z'
  },
  {
    id: '10',
    title: 'EIOPA News and Publications',
    description: 'Insurance and occupational pensions supervision updates from EIOPA',
    feedUrl: 'https://www.eiopa.europa.eu/rss/news.xml',
    websiteUrl: 'https://www.eiopa.europa.eu',
    organization: 'European Insurance and Occupational Pensions Authority',
    categories: ['Insurance', 'Pensions', 'Supervision', 'EU Regulation'],
    status: 'active',
    lastUpdated: '2024-01-12T14:20:00Z'
  },
  // New Swedish regulatory body feeds
  {
    id: '11',
    title: 'Finansinspektionen News',
    description: 'News and regulatory updates from the Swedish Financial Supervisory Authority',
    feedUrl: 'https://www.fi.se/en/published/news/rss.xml',
    websiteUrl: 'https://www.fi.se/en/',
    organization: 'Finansinspektionen',
    categories: ['Banking', 'Insurance', 'Securities', 'Swedish Regulation'],
    status: 'active',
    lastUpdated: '2024-01-12T09:00:00Z'
  },
  {
    id: '12',
    title: 'Sveriges Riksbank Press Releases',
    description: 'Monetary policy and financial stability updates from Sweden\'s central bank',
    feedUrl: 'https://www.riksbank.se/en-gb/rss/press-and-published.xml',
    websiteUrl: 'https://www.riksbank.se/en-gb/',
    organization: 'Sveriges Riksbank',
    categories: ['Monetary Policy', 'Financial Stability', 'CBDC', 'Swedish Regulation'],
    status: 'active',
    lastUpdated: '2024-01-11T13:15:00Z'
  },
  {
    id: '13',
    title: 'Skatteverket Press Releases',
    description: 'Tax authority updates and regulatory changes from the Swedish Tax Agency',
    feedUrl: 'https://www.skatteverket.se/servicelankar/press/rss.xml',
    websiteUrl: 'https://www.skatteverket.se',
    organization: 'Skatteverket',
    categories: ['Tax', 'Compliance', 'Crypto Tax', 'Swedish Regulation'],
    status: 'active',
    lastUpdated: '2024-01-10T10:30:00Z'
  },
  {
    id: '14',
    title: 'Konkurrensverket News',
    description: 'Competition and market regulation updates from the Swedish Competition Authority',
    feedUrl: 'https://www.konkurrensverket.se/en/rss/news.xml',
    websiteUrl: 'https://www.konkurrensverket.se/en/',
    organization: 'Konkurrensverket',
    categories: ['Competition', 'Market Regulation', 'Antitrust', 'Swedish Regulation'],
    status: 'active',
    lastUpdated: '2024-01-09T15:45:00Z'
  }
];
