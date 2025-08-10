
export interface Rule {
  id: string;
  rule_id: string;
  rule_name: string;
  description: string;
  condition: any;
  risk_score: number;
  category: string;
  is_active: boolean;
}

export interface RiskMatch {
  rule_id: string;
  rule_name: string;
  risk_score: number;
  category: string;
  description: string;
  match_data?: any;
}

export interface RiskFactor {
  name: string;
  value: number;
  weight: number;
}

export interface RiskAssessmentResult {
  id?: string;
  customer_id?: string;
  total_risk_score: number;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  factors?: RiskFactor[];
  matched_rules: string[];
  rule_categories: string[];
  created_at?: string;
  updated_at?: string;
}

export interface RiskMatchDisplay {
  id: string;
  rule_id: string;
  matched_at: string;
  match_data: any;
  rules: {
    rule_name: string;
    description: string;
    risk_score: number;
    category: string;
  };
}
