import React from 'react';
import styled from 'styled-components';
import { useDocumentContext } from '../../context/DocumentContext';
import DocumentViewer from '../documents/DocumentViewer';
import EmptyState from '../ui/EmptyState';

const MainContainer = styled.main`
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.surface};
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textLight};
  margin: ${props => props.theme.spacing.xs} 0 0;
`;

const Content = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
  background-color: ${props => props.theme.colors.background};
`;

const MainContent: React.FC = () => {
  const { selectedDocument } = useDocumentContext();

  return (
    <MainContainer>
      <Header>
        {selectedDocument ? (
          <>
            <Title>{selectedDocument.name}</Title>
            <Subtitle>Uploaded on {new Date(selectedDocument.created_at).toLocaleDateString()}</Subtitle>
          </>
        ) : (
          <Title>Chunk Mate</Title>
        )}
      </Header>
      <Content>
        {selectedDocument ? (
          <DocumentViewer document={selectedDocument} />
        ) : (
          <EmptyState
            title="No document selected"
            description="Select a document from the sidebar or upload a new one to get started."
          />
        )}
      </Content>
    </MainContainer>
  );
};

export default MainContent;