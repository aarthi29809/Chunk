import React, { createContext, useContext, useState, useCallback } from 'react';
import { Document, Chunk } from '../types';
import { API_URL } from '../config';

interface DocumentContextType {
  documents: Document[];
  selectedDocument: Document | null;
  fetchDocuments: () => Promise<Document[]>;
  selectDocument: (document: Document) => void;
  uploadDocument: (file: File) => Promise<void>;
  fetchChunks: (documentId: number) => Promise<Chunk[]>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentContext must be used within a DocumentContextProvider');
  }
  return context;
};

interface DocumentContextProviderProps {
  children: React.ReactNode;
}

const DocumentContextProvider: React.FC<DocumentContextProviderProps> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
      return data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }, []);

  const selectDocument = useCallback((document: Document) => {
    setSelectedDocument(document);
  }, []);

  const uploadDocument = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const newDocument = await response.json();
      setDocuments(prev => [newDocument, ...prev]);
      setSelectedDocument(newDocument);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }, []);

  const fetchChunks = useCallback(async (documentId: number) => {
    try {
      const response = await fetch(`${API_URL}/documents/${documentId}/chunks`);
      if (!response.ok) {
        throw new Error('Failed to fetch chunks');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching chunks:', error);
      return [];
    }
  }, []);

  const value = {
    documents,
    selectedDocument,
    fetchDocuments,
    selectDocument,
    uploadDocument,
    fetchChunks,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export default DocumentContextProvider;