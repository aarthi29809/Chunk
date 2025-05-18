import db from '../db.js';
import { marked } from 'marked';

// Process markdown and create chunks
export async function processMarkdown(content, documentId) {
  try {
    // Parse the markdown
    const tokens = marked.lexer(content);
    
    // Extract headings and their levels for context
    const headings = [];
    let currentHeadings = [];
    let chunks = [];
    let paragraphs = [];
    let currentChunk = '';
    let chunkNumber = 0;
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];
    
    // Process tokens
    for (const token of tokens) {
      // Process headings
      if (token.type === 'heading') {
        // Update headings context based on level
        while (currentHeadings.length >= token.depth) {
          currentHeadings.pop();
        }
        
        // Add current heading
        currentHeadings[token.depth - 1] = token.text;
        
        // If we were collecting paragraphs, create a chunk
        if (paragraphs.length > 0) {
          createChunk();
        }
      }
      // Process paragraphs
      else if (token.type === 'paragraph') {
        paragraphs.push(token.text);
      }
      // Process tables
      else if (token.type === 'table') {
        // If we were collecting paragraphs, create a chunk
        if (paragraphs.length > 0) {
          createChunk();
        }
        
        // Process table
        tableHeaders = token.header;
        tableRows = token.rows;
        
        // Create a chunk for each row
        for (const row of tableRows) {
          let tableChunk = '';
          
          // Add headers context
          for (let i = 0; i < currentHeadings.length; i++) {
            if (currentHeadings[i]) {
              tableChunk += '#'.repeat(i + 1) + ' ' + currentHeadings[i] + '\n\n';
            }
          }
          
          // Create formatted row with headers
          for (let i = 0; i < tableHeaders.length; i++) {
            tableChunk += `${tableHeaders[i]}: ${row[i]}\n\n`;
          }
          
          // Save as chunk
          chunkNumber++;
          chunks.push({
            document_id: documentId,
            chunk_number: chunkNumber,
            content: tableChunk.trim()
          });
          
          // Process any links in the table cells
          for (let i = 0; i < row.length; i++) {
            const cell = row[i];
            const links = extractLinks(cell);
            
            for (const link of links) {
              await saveHyperlinkReference(documentId, chunkNumber, link.url, link.text);
            }
          }
        }
      }
    }
    
    // Process any remaining paragraphs
    if (paragraphs.length > 0) {
      createChunk();
    }
    
    // Save chunks to database
    for (const chunk of chunks) {
      const result = await db.query(
        'INSERT INTO chunks (document_id, chunk_number, content) VALUES ($1, $2, $3) RETURNING id',
        [chunk.document_id, chunk.chunk_number, chunk.content]
      );
    }
    
    return chunks;
    
    // Helper function to create a chunk from collected paragraphs
    function createChunk() {
      let chunkContent = '';
      
      // Add headings context
      for (let i = 0; i < currentHeadings.length; i++) {
        if (currentHeadings[i]) {
          chunkContent += '#'.repeat(i + 1) + ' ' + currentHeadings[i] + '\n\n';
        }
      }
      
      // Add paragraphs
      for (const para of paragraphs) {
        chunkContent += para + '\n\n';
        
        // Extract and save links
        const links = extractLinks(para);
        for (const link of links) {
          // We'll save these links after we have the chunk ID
          saveHyperlinkReference(documentId, chunkNumber + 1, link.url, link.text);
        }
      }
      
      // Save chunk
      chunkNumber++;
      chunks.push({
        document_id: documentId,
        chunk_number: chunkNumber,
        content: chunkContent.trim()
      });
      
      // Reset paragraphs
      paragraphs = [];
    }
  } catch (error) {
    console.error('Error processing markdown:', error);
    throw error;
  }
}

// Extract links from text using regex
function extractLinks(text) {
  const links = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }
  
  return links;
}

// Save hyperlink reference to database
async function saveHyperlinkReference(documentId, chunkNumber, url, text) {
  try {
    // Get chunk ID
    const chunkResult = await db.query(
      'SELECT id FROM chunks WHERE document_id = $1 AND chunk_number = $2',
      [documentId, chunkNumber]
    );
    
    if (chunkResult.rows.length > 0) {
      const chunkId = chunkResult.rows[0].id;
      
      // Save hyperlink reference
      await db.query(
        'INSERT INTO hyperlink_references (document_id, chunk_id, url, text) VALUES ($1, $2, $3, $4)',
        [documentId, chunkId, url, text]
      );
    }
  } catch (error) {
    console.error('Error saving hyperlink reference:', error);
  }
}