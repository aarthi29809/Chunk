# ChunkMate - Document Chunking Tool for GenAI Workflows

ChunkMate is a web-based application designed to assist in Generative AI workflows by processing markdown documents and breaking them into logical chunks based on predefined rules.

## Features

- Upload and process markdown documents
- Intelligent chunking based on paragraphs, headings, and tables
- View and manage previously uploaded documents
- Browse and copy individual chunks for use in GenAI systems
- Extract and store hyperlinks from documents

## Tech Stack

### Frontend
- React
- Vite
- Styled Components
- TypeScript

### Backend
- Express.js
- PostgreSQL
- Marked (for markdown processing)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database named `chunkmate`:

```sql
CREATE DATABASE chunkmate;
```

2. The application will automatically create the required tables when first started.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/chunkmate.git
cd chunkmate
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=chunkmate
DB_PASSWORD=postgres
DB_PORT=5432
PORT=3000
VITE_API_URL=http://localhost:3000/api
```

Adjust the values according to your PostgreSQL configuration.

### Running the Application

1. Start the backend server:

```bash
npm run server
```

2. In a separate terminal, start the frontend development server:

```bash
npm run dev
```

3. Or run both simultaneously:

```bash
npm run dev:all
```

4. Open your browser and navigate to `http://localhost:5173`

## Chunking Rules

ChunkMate processes markdown documents using the following rules:

1. Each paragraph becomes a separate chunk
2. All headings and subheadings are repeated for each chunk to provide context
3. Links in paragraphs are stored separately with references to the document and chunk
4. For tables, each row becomes a separate chunk, including its headers and context

## Project Structure

```
chunkmate/
├── public/               # Static assets
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── styles/           # Styled components and themes
│   ├── types/            # TypeScript type definitions
│   └── ...
├── server/               # Backend source code
│   ├── routes/           # Express routes
│   ├── utils/            # Utility functions
│   ├── schema.sql        # Database schema
│   └── ...
├── uploads/              # Document upload directory
└── ...
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.