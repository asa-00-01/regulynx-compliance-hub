import { NewsItem } from '@/types/news';

export const mockNewsItems: NewsItem[] = [
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
