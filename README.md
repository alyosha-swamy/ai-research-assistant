# AI Research Assistant

A modern React web application that provides comprehensive AI-powered research with exhaustive web search capabilities. Users can input queries, receive detailed research reports with citations, and export the results as PDF or DOCX documents.

## Features

- 🔍 **Deep Research**: Uses Perplexity's Sonar Deep Research for exhaustive analysis across hundreds of sources
- 📝 **Expert-Level Reports**: Comprehensive research reports with detailed insights and citations
- 📊 **Multiple Models**: Choose from Sonar Deep Research, Sonar Pro, or standard Sonar
- 📄 **PDF Export**: Convert research reports to PDF format
- 📝 **DOCX Export**: Export reports as Word documents
- 🎨 **Modern UI**: Clean, responsive design with dark mode support
- ⚡ **Real-time**: Advanced query processing with reasoning effort control

## Technology Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Markdown**: React Markdown with GitHub Flavored Markdown support
- **PDF Generation**: jsPDF with html2canvas
- **DOCX Export**: File-saver for document downloads
- **Backend**: Express.js API proxy
- **API**: Perplexity Sonar Deep Research

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jina-deepsearch-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` and add your Perplexity API key.

4. Start the development servers:

**Option A: Normal Mode (with API)**
```bash
npm run dev
```

**Option B: Demo Mode (without API calls)**
```bash
npm run dev:demo
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

### API Configuration

You'll need a Perplexity API key to use the research functionality:

1. **Get an API key**: Visit [Perplexity API](https://www.perplexity.ai/) to get your API key
2. **Add to environment**: Copy the key to your `.env` file as `PERPLEXITY_API_KEY`
3. **Demo Mode**: Use `npm run dev:demo` to test without API calls
4. **Monitor usage**: Check your usage on the Perplexity dashboard

## Usage

1. **Select Model**: Choose from Sonar Deep Research (most comprehensive), Sonar Pro, or Sonar
2. **Set Reasoning Effort**: Control computational effort (Low/Medium/High) 
3. **Enter Your Query**: Type any research question in the text area
4. **Research**: Click "Research" to get comprehensive analysis with citations
5. **View Results**: The detailed research report will appear with sources
6. **Export**: Use "PDF" or "DOCX" buttons to download the research report

## Project Structure

```
src/
├── react/
│   └── App.tsx              # Main React application component
├── components/              # Reusable UI components
├── hooks/                   # Custom React hooks  
├── lib/                     # API client
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions (exporters)
└── main.tsx                 # React entry point
server/
└── index.ts                 # Express API proxy server
public/                      # Static assets
index.html                   # Vite HTML entry
vite.config.ts               # Vite configuration
```

## Development

### Available Scripts

- `npm run dev` - Start API and Vite dev server together
- `npm run dev:demo` - Same as above with DEMO_MODE enabled
- `npm run build` - Build for production
- `npm run start` - Start API and Vite dev server together
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Environment Variables

Create a `.env` file in the project root:

```
PERPLEXITY_API_KEY=your_perplexity_api_key_here
DEMO_MODE=false
PORT=5174
```

The web app calls `/api/chat`, which is proxied to the local Express server during development.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.