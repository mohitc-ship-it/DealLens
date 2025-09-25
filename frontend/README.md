# PDF Report Analysis Application

A Next.js 14 application for uploading PDF documents, generating comprehensive reports, and interacting with an AI chatbot for analysis insights.

## Features

- **PDF Upload**: Drag-and-drop or click-to-select PDF upload with validation
- **Report Generation**: Comprehensive analysis reports with metadata
- **AI Chat Interface**: Interactive chatbot for report insights and questions
- **Responsive Design**: Mobile-friendly interface with collapsible chat panel
- **Real-time Streaming**: Support for streaming chat responses
- **Error Handling**: Comprehensive error boundaries and API error handling
- **Dark Theme**: Professional dark theme optimized for data analysis

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives with shadcn/ui
- **File Upload**: react-dropzone
- **Security**: DOMPurify for HTML sanitization
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Backend API server (see Backend Requirements below)

### Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   \`\`\`env
   # Backend API URL (required)
   API_BASE_URL=http://localhost:8000
   
   # Optional: For production deployment
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   \`\`\`

4. **Run the development server**:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Backend Requirements

This frontend expects a backend API with the following endpoints:

### POST /api/upload
- **Purpose**: Upload PDF file for analysis
- **Request**: FormData with 'file' field containing PDF
- **Response**: `{ "reportId": "string" }`
- **Error Handling**: Returns appropriate HTTP status codes with error messages

### GET /api/report/:id
- **Purpose**: Fetch generated report data
- **Response**: 
  \`\`\`json
  {
    "id": "string",
    "title": "string",
    "content": "string (HTML or plain text)",
    "createdAt": "ISO date string",
    "metadata": {
      "pages": number,
      "fileSize": "string",
      "processingTime": "string"
    }
  }
  \`\`\`

### POST /api/chat/:id
- **Purpose**: Send chat message about specific report
- **Request**: `{ "message": "string" }`
- **Response**: `{ "reply": "string" }` or streaming response
- **Streaming**: Supports Server-Sent Events for real-time responses

## Project Structure

\`\`\`
├── app/
│   ├── api/                 # API route handlers
│   │   ├── upload/         # File upload endpoint
│   │   ├── report/[id]/    # Report fetching endpoint
│   │   └── chat/[id]/      # Chat messaging endpoint
│   ├── upload/             # Upload page
│   ├── report/[reportId]/  # Report viewing page
│   ├── layout.tsx          # Root layout with error boundary
│   ├── page.tsx            # Home page (redirects to upload)
│   └── globals.css         # Global styles and theme
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── file-upload.tsx     # PDF upload component
│   ├── report-viewer.tsx   # Report display component
│   ├── chat-panel.tsx      # Chat interface component
│   └── error-boundary.tsx  # Error handling component
├── lib/
│   ├── api-client.ts       # API utilities and error handling
│   └── utils.ts            # General utilities
└── public/                 # Static assets
\`\`\`

## Key Features Implementation

### File Upload
- Client-side validation (PDF type, 10MB size limit)
- Drag-and-drop interface with visual feedback
- Progress tracking during upload
- Error handling with user-friendly messages

### Report Display
- Sanitized HTML content rendering
- Responsive layout with metadata display
- Quick actions panel
- Export and sharing capabilities

### Chat Interface
- Real-time messaging with streaming support
- Message history with timestamps
- Collapsible panel for mobile devices
- Loading states and error handling

### API Integration
- Centralized error handling
- Request/response type safety
- Streaming response support
- Environment-based configuration

## Deployment

### Vercel (Recommended)

1. **Push to GitHub repository**

2. **Connect to Vercel**:
   - Import your repository in Vercel dashboard
   - Configure environment variables in project settings
   - Deploy automatically

3. **Environment Variables**:
   \`\`\`env
   API_BASE_URL=https://your-backend-api.com
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   \`\`\`

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Development

### Adding New Features

1. **API Routes**: Add new routes in `app/api/`
2. **Pages**: Create new pages in `app/`
3. **Components**: Add reusable components in `components/`
4. **Utilities**: Add helper functions in `lib/`

### Styling

- Uses Tailwind CSS v4 with custom design tokens
- Dark theme optimized for professional use
- Responsive design with mobile-first approach
- Custom scrollbars and animations

### Error Handling

- React Error Boundaries for component errors
- API error handling with user-friendly messages
- Network error detection and retry mechanisms
- Graceful degradation for missing features

## Troubleshooting

### Common Issues

1. **Upload fails**: Check file size (<10MB) and type (PDF only)
2. **Report not loading**: Verify backend API is running and accessible
3. **Chat not working**: Ensure chat endpoint supports the expected format
4. **Styling issues**: Clear browser cache and check Tailwind compilation

### Debug Mode

Enable debug logging by adding to `.env.local`:
\`\`\`env
NODE_ENV=development
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created with v0 and is ready for customization and deployment.
