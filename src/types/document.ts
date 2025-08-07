
export interface Document {
  id: string;
  user_id: string;
  type: string;
  file_name: string;
  file_path: string;
  status: string;
  upload_date: string;
  verified_by?: string;
  verification_date?: string;
  extracted_data?: any;
  created_at: string;
  updated_at: string;
}

export interface DocumentInsert {
  user_id: string;
  type: string;
  file_name: string;
  file_path: string;
  status: string;
  verified_by?: string;
  verification_date?: string;
  extracted_data?: any;
}

export interface DocumentUpdate {
  type?: string;
  file_name?: string;
  file_path?: string;
  status?: string;
  verified_by?: string;
  verification_date?: string;
  extracted_data?: any;
}
