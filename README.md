# Next.js Application Template

A modern Next.js 15+ application with TypeScript, serving as a UI component library and development starter template.

## Features

- Next.js 15+ with App Router
- TypeScript support
- Modern UI components
- Render API integration
- Authentication ready
- Docker containerization
- Multiple deployment options

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nextjs-application-template
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
# For development, you can use the default values
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DATABASE_URL` | Database connection string | `file:./data/dev.db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-jwt-secret-key-here` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | `your-nextauth-secret-here` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `RENDER_API_KEY` | Render platform API key | `your-render-api-key-here` |
| `NODE_ENV` | Node environment | `development` |

### Getting Render API Key

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to Account Settings > API Keys
3. Generate a new API key
4. Add it to your `.env.local` file

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

See [deployment-guide.md](./deployment-guide.md) for detailed deployment instructions to various platforms including:
- Vercel
- Render
- Docker
- Railway
- Netlify

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # React components
├── lib/         # Utility libraries
├── styles/      # Global styles
└── types/       # TypeScript type definitions
```

## Technologies Used

- **Framework**: Next.js 15+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js
- **Database**: SQLite (via Prisma)
- **Deployment**: Vercel, Render, Docker

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
