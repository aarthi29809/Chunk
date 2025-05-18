import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Upload, X, File } from 'lucide-react';
import { useDocumentContext } from '../../context/DocumentContext';

const UploadButtonContainer = styled.div`
  width: 100%;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.textLighter};
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  width: 90%;
  max-width: 500px;
  box-shadow: ${props => props.theme.shadows.lg};
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textLight};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
`;

const DropZone = styled.div<{ isDragActive: boolean, hasFile: boolean }>`
  border: 2px dashed ${props => {
    if (props.isDragActive) return props.theme.colors.primary;
    if (props.hasFile) return props.theme.colors.success;
    return props.theme.colors.border;
  }};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  background-color: ${props => {
    if (props.isDragActive) return props.theme.colors.primary + '10';
    if (props.hasFile) return props.theme.colors.success + '10';
    return props.theme.colors.background;
  }};
  transition: all ${props => props.theme.transitions.fast};
`;

const DropzoneIcon = styled.div<{ hasFile: boolean }>`
  color: ${props => props.hasFile ? props.theme.colors.success : props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DropzoneText = styled.p`
  color: ${props => props.theme.colors.textLight};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.background};
  margin-top: ${props => props.theme.spacing.md};
`;

const FileName = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const FileSize = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textLight};
`;

const UploadActionButton = styled(Button)`
  margin-top: ${props => props.theme.spacing.lg};
`;

const ErrorMessage = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.error + '10'};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.error};
  font-size: 0.875rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadDocument } = useDocumentContext();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file?: File) => {
    setError(null);
    
    if (!file) {
      return;
    }
    
    // Check file type (only allow .md files)
    if (!file.name.toLowerCase().endsWith('.md')) {
      setError('Only markdown (.md) files are supported.');
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      await uploadDocument(selectedFile);
      closeModal();
    } catch (err) {
      setError('An error occurred while uploading the document. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <UploadButtonContainer>
      <Button onClick={openModal}>
        <Upload size={18} />
        Upload Document
      </Button>
      
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Upload Document</ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            
            <DropZone 
              isDragActive={isDragActive}
              hasFile={!!selectedFile}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <DropzoneIcon hasFile={!!selectedFile}>
                {selectedFile ? <File size={40} /> : <Upload size={40} />}
              </DropzoneIcon>
              <DropzoneText>
                {selectedFile 
                  ? 'File selected. Click to change or drag another file.'
                  : 'Drag and drop your markdown file here, or click to browse'}
              </DropzoneText>
              <small>Only .md files are supported</small>
              
              <HiddenInput 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".md"
              />
              
              {selectedFile && (
                <FileInfo>
                  <FileName>{selectedFile.name}</FileName>
                  <FileSize>({formatFileSize(selectedFile.size)})</FileSize>
                </FileInfo>
              )}
            </DropZone>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <UploadActionButton 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </UploadActionButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </UploadButtonContainer>
  );
};

export default UploadButton;