import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDocumentContext } from '../../context/DocumentContext';
import { Clipboard, Check } from 'lucide-react';
import { Document, Chunk } from '../../types';

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const ChunksHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChunkCount = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const ChunkStats = styled.span`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.875rem;
`;

const ChunksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ChunkCard = styled.div<{ isSelected: boolean }>`
  border: 1px solid ${props => props.isSelected ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.isSelected ? props.theme.shadows.md : props.theme.shadows.sm};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const ChunkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ChunkNumber = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const CopyButton = styled.button<{ copied: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.copied ? props.theme.colors.success + '10' : 'transparent'};
  color: ${props => props.copied ? props.theme.colors.success : props.theme.colors.textLight};
  border: 1px solid ${props => props.copied ? props.theme.colors.success : props.theme.colors.border};
  font-size: 0.75rem;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.copied ? props.theme.colors.success + '15' : props.theme.colors.background};
  }
`;

const ChunkContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.surface};
  white-space: pre-wrap;
  font-family: 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: ${props => props.theme.colors.text};
`;

interface DocumentViewerProps {
  document: Document;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const { fetchChunks } = useDocumentContext();
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [selectedChunkId, setSelectedChunkId] = useState<number | null>(null);
  const [copiedChunkId, setCopiedChunkId] = useState<number | null>(null);

  useEffect(() => {
    const loadChunks = async () => {
      if (document) {
        const fetchedChunks = await fetchChunks(document.id);
        setChunks(fetchedChunks);
        if (fetchedChunks.length > 0) {
          setSelectedChunkId(fetchedChunks[0].id);
        }
      }
    };
    
    loadChunks();
  }, [document, fetchChunks]);

  const handleCopyChunk = (chunkId: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedChunkId(chunkId);
    setTimeout(() => setCopiedChunkId(null), 2000);
  };

  return (
    <ViewerContainer>
      <ChunksHeader>
        <ChunkCount>Document Chunks</ChunkCount>
        <ChunkStats>{chunks.length} chunks generated</ChunkStats>
      </ChunksHeader>
      
      <ChunksList>
        {chunks.map((chunk) => (
          <ChunkCard 
            key={chunk.id}
            isSelected={selectedChunkId === chunk.id}
            onClick={() => setSelectedChunkId(chunk.id)}
          >
            <ChunkHeader>
              <ChunkNumber>Chunk {chunk.chunk_number}</ChunkNumber>
              <CopyButton 
                copied={copiedChunkId === chunk.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyChunk(chunk.id, chunk.content);
                }}
              >
                {copiedChunkId === chunk.id ? (
                  <>
                    <Check size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard size={14} />
                    Copy
                  </>
                )}
              </CopyButton>
            </ChunkHeader>
            <ChunkContent>
              {chunk.content}
            </ChunkContent>
          </ChunkCard>
        ))}
      </ChunksList>
    </ViewerContainer>
  );
};

export default DocumentViewer;