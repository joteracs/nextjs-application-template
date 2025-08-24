# Deployment Guide

This guide provides step-by-step instructions for deploying your Next.js application to various platforms.

## Prerequisites

1. Ensure all environment variables are set (see `.env.example`)
2. Make sure your application builds successfully locally: `npm run build`
3. Test the production build locally: `npm run build && npm start`

## Platform-Specific Deployment Instructions

### 1. Vercel (Recommended)

**Option A: Vercel CLI**
```bash
npm i -g vercel
vercel --prod
```

**Option B: GitHub Integration**
1. Push your code to GitHub
2. Import your repository on [vercel.com](https://vercel.com)
3. Configure environment variables in the Vercel dashboard
4. Deploy automatically on push to main branch

### 2. Render

**Option A: Render CLI**
```bash
npm install -g render-cli
render deploy
```

**Option B: GitHub Integration**
1. Push your code to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Connect your GitHub repository
4. Configure build command: `npm run build`
5. Configure start command: `npm start`
6. Add environment variables in the Render dashboard

### 3. Docker (Self-hosted)

**Build and run locally:**
```bash
# Build the image
docker build -t nextjs-app .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="your-secret" \
  -e NEXTAUTH_SECRET="your-secret" \
  nextjs-app
```

**Deploy to cloud platforms:**
- **AWS ECS/Fargate**: Use the Dockerfile with AWS ECS
- **Google Cloud Run**: Deploy directly using `gcloud run deploy`
- **Azure Container Apps**: Use Azure CLI or portal

### 4. Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`

### 5. Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Deploy: `netlify deploy --prod`

## Environment Variables

Required environment variables for production:

- `DATABASE_URL`: SQLite database file path or external database URL
- `JWT_SECRET`: Secret key for JWT token generation
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Your production URL (e.g., https://yourapp.vercel.app)
- `RENDER_API_KEY`: API key for Render services (if using Render features)

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Check database connectivity
- [ ] Test file upload functionality
- [ ] Verify environment variables are properly set
- [ ] Test responsive design on mobile devices
- [ ] Check performance metrics (Lighthouse)

## Troubleshooting

### Common Issues

1. **Build fails with "Module not found"**
   - Ensure all dependencies are listed in package.json
   - Run `npm ci` to clean install dependencies

2. **Environment variables not working**
   - Check variable names match exactly
   - Ensure no spaces in values
   - Restart deployment after adding variables

3. **Database connection issues**
   - For SQLite: Ensure file path is writable
   - For external DB: Check connection string format

4. **Authentication issues**
   - Verify JWT_SECRET is set
   - Check NEXTAUTH_URL matches your domain

## Performance Optimization

1. Enable Next.js optimization features:
   ```bash
   npm install sharp
   ```

2. Add to next.config.js:
   ```javascript
   module.exports = {
     images: {
       domains: ['your-cdn.com'],
     },
     experimental: {
       optimizeFonts: true,
     },
   }
   ```

3. Use CDN for static assets
4. Enable compression on your hosting platform
