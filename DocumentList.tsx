import React from 'react';
import styled from 'styled-components';
import { useDocumentContext } from '../../context/DocumentContext';
import { FileText } from 'lucide-react';
import { Document } from '../../types';

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ListTitle = styled.h3`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyMessage = styled.p`
  color: ${props => props.theme.colors.textLighter};
  font-size: 0.875rem;
  text-align: center;
  padding: ${props => props.theme.spacing.md};
`;

const DocumentItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.isSelected ? props.theme.colors.primary + '10' : 'transparent'};
  border-left: 3px solid ${props => props.isSelected ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.isSelected ? props.theme.colors.primary + '15' : props.theme.colors.primary + '05'};
  }
`;

const DocumentIcon = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.isSelected ? props.theme.colors.primary : props.theme.colors.textLight};
  margin-right: ${props => props.theme.spacing.md};
`;

const DocumentInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DocumentName = styled.span<{ isSelected: boolean }>`
  font-size: 0.875rem;
  font-weight: ${props => props.isSelected ? '600' : '400'};
  color: ${props => props.isSelected ? props.theme.colors.primary : props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DocumentDate = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textLighter};
`;

interface DocumentListProps {
  documents: Document[];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const { selectedDocument, selectDocument } = useDocumentContext();

  if (documents.length === 0) {
    return (
      <ListContainer>
        <ListTitle>Documents</ListTitle>
        <EmptyMessage>No documents uploaded yet.</EmptyMessage>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <ListTitle>Documents</ListTitle>
      {documents.map((doc) => (
        <DocumentItem 
          key={doc.id}
          isSelected={selectedDocument?.id === doc.id}
          onClick={() => selectDocument(doc)}
        >
          <DocumentIcon isSelected={selectedDocument?.id === doc.id}>
            <FileText size={18} />
          </DocumentIcon>
          <DocumentInfo>
            <DocumentName isSelected={selectedDocument?.id === doc.id}>
              {doc.name}
            </DocumentName>
            <DocumentDate>
              {new Date(doc.created_at).toLocaleDateString()}
            </DocumentDate>
          </DocumentInfo>
        </DocumentItem>
      ))}
    </ListContainer>
  );
};

export default DocumentList;