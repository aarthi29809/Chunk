import React from 'react';
import styled from 'styled-components';
import { useDocumentContext } from '../../context/DocumentContext';
import { FileUp, FileText } from 'lucide-react';
import DocumentList from '../documents/DocumentList';
import UploadButton from '../documents/UploadButton';

const SidebarContainer = styled.aside`
  width: 280px;
  height: 100%;
  background-color: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 240px;
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    position: fixed;
    z-index: 10;
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
    transition: transform ${props => props.theme.transitions.default};
    box-shadow: ${props => props.isOpen ? props.theme.shadows.lg : 'none'};
  }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-weight: 600;
  font-size: 1.25rem;
  color: ${props => props.theme.colors.primary};
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const SidebarFooter = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

interface SidebarProps {
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const { documents, fetchDocuments } = useDocumentContext();

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <Logo>
          <FileText size={24} />
          <span>Chunk Mate</span>
        </Logo>
      </SidebarHeader>
      <SidebarContent>
        <DocumentList documents={documents} />
      </SidebarContent>
      <SidebarFooter>
        <UploadButton />
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;