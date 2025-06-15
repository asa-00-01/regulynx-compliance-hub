import { RSSFeed } from '@/types/news';

export const mockRssFeeds: RSSFeed[] = [
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
