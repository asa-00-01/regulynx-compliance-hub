import { NewsItem, RSSFeed } from '@/types/news';

const getRandomDateInPast = (daysBack: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

export const generateNewsItems = (): NewsItem[] => {
  return [
    {
      id: 'news_001',
      title: 'New AML Regulations Take Effect in European Union',
      description: 'The European Union has implemented new anti-money laundering regulations that require enhanced due diligence for high-risk transactions.',
      url: 'https://example.com/eu-aml-regulations',
      source: 'EU Financial Regulatory Authority',
      category: 'regulation',
      publishedAt: getRandomDateInPast(2),
      author: 'Sarah Mitchell',
      imageUrl: 'https://example.com/images/eu-flag.jpg'
    },
    {
      id: 'news_002',
      title: 'FATF Updates High-Risk Jurisdictions List',
      description: 'The Financial Action Task Force has updated its list of high-risk jurisdictions for money laundering and terrorist financing.',
      url: 'https://example.com/fatf-update',
      source: 'FATF',
      category: 'sanctions',
      publishedAt: getRandomDateInPast(5),
      author: 'Michael Chen',
      imageUrl: 'https://example.com/images/fatf-logo.jpg'
    },
    {
      id: 'news_003',
      title: 'Digital Identity Verification Standards Updated',
      description: 'New international standards for digital identity verification in KYC processes have been released to combat fraud.',
      url: 'https://example.com/digital-kyc-standards',
      source: 'International Standards Organization',
      category: 'kyc',
      publishedAt: getRandomDateInPast(7),
      author: 'Emma Rodriguez'
    },
    {
      id: 'news_004',
      title: 'Cryptocurrency Exchange Compliance Requirements',
      description: 'Financial regulators announce new compliance requirements for cryptocurrency exchanges to prevent money laundering.',
      url: 'https://example.com/crypto-compliance',
      source: 'Financial Crimes Enforcement Network',
      category: 'aml',
      publishedAt: getRandomDateInPast(10),
      author: 'David Kim'
    },
    {
      id: 'news_005',
      title: 'Sanctions Imposed on Additional Russian Entities',
      description: 'New sanctions have been imposed on Russian financial institutions and individuals in response to ongoing conflicts.',
      url: 'https://example.com/russia-sanctions',
      source: 'Treasury Department',
      category: 'sanctions',
      publishedAt: getRandomDateInPast(1),
      author: 'Jennifer Walsh'
    },
    {
      id: 'news_006',
      title: 'Enhanced KYC Procedures for PEP Screening',
      description: 'Financial institutions must implement enhanced procedures for politically exposed persons screening effective immediately.',
      url: 'https://example.com/pep-screening',
      source: 'Financial Conduct Authority',
      category: 'kyc',
      publishedAt: getRandomDateInPast(3),
      author: 'Robert Thompson'
    },
    {
      id: 'news_007',
      title: 'Global AML Compliance Survey Results Released',
      description: 'Survey reveals significant gaps in AML compliance programs across financial institutions worldwide.',
      url: 'https://example.com/aml-survey',
      source: 'Compliance Institute',
      category: 'aml',
      publishedAt: getRandomDateInPast(8),
      author: 'Lisa Anderson'
    },
    {
      id: 'news_008',
      title: 'Trade-Based Money Laundering Alert Issued',
      description: 'Authorities issue alert about increasing trade-based money laundering schemes using shell companies.',
      url: 'https://example.com/trade-ml-alert',
      source: 'Financial Intelligence Unit',
      category: 'aml',
      publishedAt: getRandomDateInPast(4),
      author: 'James Wilson'
    },
    {
      id: 'news_009',
      title: 'New Sanctions List Updates from OFAC',
      description: 'Office of Foreign Assets Control publishes updated specially designated nationals list with new entries.',
      url: 'https://example.com/ofac-updates',
      source: 'OFAC',
      category: 'sanctions',
      publishedAt: getRandomDateInPast(6),
      author: 'Maria Santos'
    },
    {
      id: 'news_010',
      title: 'Biometric KYC Technology Advances',
      description: 'Latest developments in biometric technology are revolutionizing customer identification and verification processes.',
      url: 'https://example.com/biometric-kyc',
      source: 'Technology Review',
      category: 'kyc',
      publishedAt: getRandomDateInPast(12),
      author: 'Alex Foster'
    }
  ];
};

export const generateRSSFeeds = (): RSSFeed[] => {
  return [
    {
      id: 'feed_001',
      title: 'FATF News and Updates',
      description: 'Latest news and regulatory updates from the Financial Action Task Force',
      feedUrl: 'https://fatf-gafi.org/rss',
      websiteUrl: 'https://fatf-gafi.org',
      organization: 'Financial Action Task Force',
      categories: ['regulation', 'aml', 'sanctions'],
      status: 'active',
      lastUpdated: getRandomDateInPast(1)
    },
    {
      id: 'feed_002',
      title: 'EU Financial Regulation',
      description: 'European Union financial regulation news and compliance updates',
      feedUrl: 'https://europa.eu/financial-regulation/rss',
      websiteUrl: 'https://europa.eu',
      organization: 'European Union',
      categories: ['regulation', 'compliance'],
      status: 'active',
      lastUpdated: getRandomDateInPast(2)
    },
    {
      id: 'feed_003',
      title: 'OFAC Sanctions Updates',
      description: 'Office of Foreign Assets Control sanctions announcements and updates',
      feedUrl: 'https://treasury.gov/ofac/rss',
      websiteUrl: 'https://treasury.gov/ofac',
      organization: 'US Treasury Department',
      categories: ['sanctions', 'regulation'],
      status: 'active',
      lastUpdated: getRandomDateInPast(1)
    },
    {
      id: 'feed_004',
      title: 'AML Compliance News',
      description: 'Anti-money laundering compliance news and best practices',
      feedUrl: 'https://amlcompliance.com/rss',
      websiteUrl: 'https://amlcompliance.com',
      organization: 'AML Compliance Institute',
      categories: ['aml', 'compliance', 'best-practices'],
      status: 'active',
      lastUpdated: getRandomDateInPast(3)
    },
    {
      id: 'feed_005',
      title: 'KYC Technology Updates',
      description: 'Latest developments in Know Your Customer technology and verification',
      feedUrl: 'https://kyctech.com/rss',
      websiteUrl: 'https://kyctech.com',
      organization: 'KYC Technology Association',
      categories: ['kyc', 'technology', 'verification'],
      status: 'active',
      lastUpdated: getRandomDateInPast(4)
    },
    {
      id: 'feed_006',
      title: 'Financial Crime Prevention',
      description: 'News and insights on preventing financial crimes and fraud',
      feedUrl: 'https://financialcrime.org/rss',
      websiteUrl: 'https://financialcrime.org',
      organization: 'Financial Crime Prevention Network',
      categories: ['financial-crime', 'fraud', 'prevention'],
      status: 'active',
      lastUpdated: getRandomDateInPast(2)
    },
    {
      id: 'feed_007',
      title: 'Regulatory Compliance Updates',
      description: 'Cross-industry regulatory compliance news and analysis',
      feedUrl: 'https://compliance-news.com/rss',
      websiteUrl: 'https://compliance-news.com',
      organization: 'Compliance News Network',
      categories: ['regulation', 'compliance', 'analysis'],
      status: 'active',
      lastUpdated: getRandomDateInPast(1)
    },
    {
      id: 'feed_008',
      title: 'International Sanctions Monitor',
      description: 'Global sanctions monitoring and enforcement news',
      feedUrl: 'https://sanctions-monitor.org/rss',
      websiteUrl: 'https://sanctions-monitor.org',
      organization: 'International Sanctions Institute',
      categories: ['sanctions', 'enforcement', 'international'],
      status: 'active',
      lastUpdated: getRandomDateInPast(5)
    }
  ];
};

// NEW: Add the missing generateNews function for centralized data
export const generateNews = (count: number): NewsItem[] => {
  const newsItems = generateNewsItems();
  return newsItems.slice(0, count);
};
