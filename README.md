# AI Powered Learning Platform

A backend service that allows users to upload PDF documents and automatically generate interactive flashcards, quizzes, and content summaries using Gemini AI. Built entirely as a backend project with full API documentation and Postman collection for testing.

# Demo
 #DemoFileHasToBeAdded

 # Features
   ## Authentication & Security
  - User registration and login with JWT authentication
  - Passwords hashed using bcrypt
  - Protected routes using custom JWT middleware

  ## Document Management
  - Upload PDF documents using Multer
  - Extract text from PDFs using pdf-parse
  - Chunk extracted text into smaller segments before sending to Gemini AI
  - Store and manage uploaded documents per user

  ## AI Powered Features (Gemini 1.5)
  - Automatic flashcard generation from PDF content
  - Content summarization for quick understanding
  - Multiple choice quiz generation from PDF content
  - Contextual question answering based on document content

  ## Progress Tracking
  - Total documents uploaded per user
  - Total flashcards generated
  - Total quizzes completed
  - Overall learning progress per user

  ## Performance
  - MongoDB indexing for faster data retrieval
  - Pagination for large datasets using skip/limit
  - Mongoose .lean() queries to reduce memory overhead

# Tech Stack
    - Node.js | Express.js | MongoDB | Multer | Gemini AI

# How it Works
1) User registers and logs in
2. User uploads a PDF document
3. Backend extracts text using pdf-parse
4. Extracted text is chunked into smaller segments
5. Chunks are sent to Gemini AI 1.5
6. Gemini generates flashcards, summaries, or quiz questions
7. Results are saved to MongoDB
8. User can view flashcards, attend quizzes, and track progress

# APIs Flow
1. POST /api/auth/register       → create a user
2. POST /api/auth/login          → login and copy JWT token
3. POST /api/documents/upload    → upload a PDF
4. POST /api/flashcards/generate → generate flashcards
5. POST /api/quiz/generate       → generate quiz
6. POST /api/quiz/submit         → submit answers
7. GET  /api/progress            → check progress

#### Author
 -Sateesh Sunkara.
 






