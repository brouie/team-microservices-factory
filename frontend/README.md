# Frontend

Next.js application for the Microservices Factory.

**Live Demo**: https://team-microservices-factory-gamma.vercel.app

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## Features

- Wallet connection (address input)
- Idea submission form
- Services dashboard with status
- Platform statistics panel
- Event history viewer
- API connection status indicator

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE` | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_GATEWAY_BASE` | Gateway URL | `http://localhost:9000` |

### Set Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_GATEWAY_BASE=http://localhost:9000
```

Or for production:
```
NEXT_PUBLIC_API_BASE=https://msf-backend.onrender.com
NEXT_PUBLIC_GATEWAY_BASE=https://msf-gateway.onrender.com
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main page component
│   └── globals.css      # Global styles
├── lib/
│   └── api.ts           # API client functions
├── next.config.js       # Next.js config
├── package.json
└── vercel.json          # Vercel deployment config
```

## Components

### Wallet Connection
- Input for Ethereum address
- Validates format (0x + 40 hex chars)
- Shows connected status

### Submit Idea
- Textarea for idea description
- Submit button (disabled when empty)
- Shows loading state

### Platform Stats
- Total services count
- Deployed count
- Tokenized count
- Queued count

### Services List
- Service cards with:
  - Idea description
  - Service ID
  - Status badge
  - Token address
  - API URL
- Action buttons:
  - Deploy
  - Create Token
  - Get Access
  - Load Events

### API Status
- Green banner when connected
- Red banner when disconnected
- Retry button for reconnection

## API Client (`lib/api.ts`)

```typescript
// Check API status
checkApiStatus(): Promise<{connected: boolean, url: string}>

// Submit idea
submitIdea(idea: string): Promise<ServiceRecord>

// List services
fetchServices(): Promise<ServiceRecord[]>

// Deploy service
deployService(serviceId: string): Promise<ServiceRecord>

// Create token
createToken(serviceId: string): Promise<ServiceRecord>

// Get access credentials
createAccess(serviceId: string): Promise<AccessResponse>

// Get service events
fetchServiceEvents(serviceId: string): Promise<ServiceEvent[]>

// Get platform stats
fetchStats(): Promise<Stats>

// Proxy request through gateway
proxyServiceRequest(serviceId, path, wallet, options): Promise<Response>
```

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Production Start

```bash
npm run start
```

## Styling

Global styles in `app/globals.css`:
- Dark theme (`#0c0f14` background)
- Panel cards with borders
- Form inputs and buttons
- Status colors (green/red)
- Responsive grid layout

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set Root Directory to `frontend`
4. Add environment variables
5. Deploy

Current deployment: https://team-microservices-factory-gamma.vercel.app

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Backend API unavailable" | Start backend or check NEXT_PUBLIC_API_BASE |
| Services not loading | Click Refresh button |
| CORS errors | Check backend CORS configuration |
| Build fails | Run `npm run lint` to find issues |
