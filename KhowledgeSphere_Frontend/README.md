
# KnowledgeSphere Frontend

KnowledgeSphere is a premium, minimalist frontend web application for a professional research publishing platform. It allows researchers and content creators to share knowledge, publish research papers/articles, bookmark publications, and follow other authors.

## Tech Stack
- **Framework**: React 19 (using Vite as a build tool)
- **Styling**: Vanilla CSS + TailwindCSS (for utility classes and grid layout)
- **State & Routing**: React Context & React Router DOM
- **Database / Cache**: Browser-native IndexedDB (local storage fallback)

## Getting Started

### Prerequisites
- Node.js (v18.x or higher)

### Setup & Installation
1. Clone this repository locally.
2. Install all required dependencies:
   ```bash
   npm install
   ```

### Running the App Locally
1. Copy `.env.example` to `.env` (or `.env.local` if custom API urls are required).
2. Start the local Vite development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
To compile and bundle the application assets for deployment:
```bash
npm run build
```
To run a local preview of the production build:
```bash
npm run preview
```
