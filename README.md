# JT Trauma Care

A modern, responsive website for JT Trauma Therapy - providing rapid trauma therapy services for professionals.

## Features

- Responsive design optimized for all devices
- Performance-optimized with lazy loading and resource preloading
- Clean, professional UI with glass-morphism effects
- Integrated contact forms and appointment booking

## Tech Stack

- HTML5, CSS, JavaScript
- Supabase for backend services
- Static site deployment

## Getting Started

### Local Development

1. Start a local server:
   ```bash
   npm run dev
   ```
   Or use Python directly:
   ```bash
   cd frontend
   python -m http.server 8000
   ```

2. Open http://localhost:8000 in your browser

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

Or connect your GitHub repository to Vercel for automatic deployments.

## Database Setup

Run the SQL commands in supabase-setup.sql to set up your Supabase database.

## Performance

See PERFORMANCE_OPTIMIZATIONS.md for details on optimization techniques used.
