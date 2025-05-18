import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const LayoutContainer = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const AppLayout: React.FC = () => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent />
    </LayoutContainer>
  );
};

export default AppLayout;