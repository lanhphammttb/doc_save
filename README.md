# DocSave - Document Management System

A modern web application for managing documents, text, and links with preview functionality. Built with Next.js, TypeScript, and MongoDB.

## Features

- File upload and management
- Text document storage
- Link management with previews
- User authentication
- Modern, responsive UI
- File preview functionality
- Tag-based organization

## Tech Stack

- Next.js 14
- TypeScript
- MongoDB
- Tailwind CSS
- React Icons
- React Dropzone
- React Markdown

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/docsave.git
cd docsave
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions
├── models/          # MongoDB models
└── types/           # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
