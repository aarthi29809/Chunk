export interface Document {
  id: number;
  name: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

export interface Chunk {
  id: number;
  document_id: number;
  chunk_number: number;
  content: string;
  created_at: string;
}

export interface HyperlinkReference {
  id: number;
  document_id: number;
  chunk_id: number;
  url: string;
  text: string;
  created_at: string;
}