
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

export interface RiskAssessmentResult {
  total_risk_score: number;
  matched_rules: RiskMatch[];
  rule_categories: string[];
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
