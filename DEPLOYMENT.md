# Deployment Guide

## 🚀 Quick Deployment to Vercel

### 1. Prerequisites
- GitHub repository with your code
- Vercel account
- Supabase project

### 2. Vercel Setup

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository and click "Import"

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)

3. **Environment Variables**
   Add the following environment variables in Vercel dashboard:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_GA_ID=your_google_analytics_id
   ```

### 3. Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Database Setup**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL to create tables and sample data

3. **Configure Authentication**
   - Go to Authentication > Settings
   - Add your Vercel domain to allowed origins
   - Configure email templates if needed

### 4. Deploy

1. **Automatic Deployment**
   - Push to your main branch
   - Vercel will automatically deploy
   - Check the deployment logs for any errors

2. **Manual Deployment**
   ```bash
   npm run build
   vercel --prod
   ```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` |
| `EMAIL_SERVICE_API_KEY` | Email service API key | `your_api_key` |
| `EMAIL_FROM` | From email address | `noreply@rankinghub.com` |

## 📊 Analytics Setup

### Google Analytics 4

1. **Create GA4 Property**
   - Go to [analytics.google.com](https://analytics.google.com)
   - Create a new GA4 property
   - Get your Measurement ID (G-XXXXXXXXXX)

2. **Add to Environment**
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

3. **Verify Tracking**
   - Deploy your site
   - Check GA4 Real-time reports
   - Verify page views are being tracked

## 🗄 Database Management

### Initial Data Import

1. **Using Supabase Dashboard**
   - Go to Table Editor
   - Import CSV files manually
   - Use the provided `data/providers.csv`

2. **Using Import Script**
   ```bash
   npm install csv-parser
   node scripts/import-data.js
   ```

### Database Maintenance

1. **Backup Strategy**
   - Enable automatic backups in Supabase
   - Export data regularly
   - Keep schema changes documented

2. **Performance Monitoring**
   - Monitor query performance
   - Add indexes as needed
   - Optimize slow queries

## 🔒 Security Configuration

### Supabase Security

1. **Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
   ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
   ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
   ```

2. **API Policies**
   ```sql
   -- Allow public read access to providers
   CREATE POLICY "Public read access" ON providers
   FOR SELECT USING (true);
   
   -- Allow public insert to contact_submissions
   CREATE POLICY "Public insert access" ON contact_submissions
   FOR INSERT WITH CHECK (true);
   ```

### Vercel Security

1. **Environment Variables**
   - Never commit sensitive keys
   - Use Vercel's environment variable encryption
   - Rotate keys regularly

2. **Domain Security**
   - Enable HTTPS (automatic with Vercel)
   - Configure CORS properly
   - Set up security headers

## 📈 Performance Optimization

### Vercel Optimizations

1. **Edge Functions**
   - Use Vercel Edge Functions for API routes
   - Optimize for global performance
   - Cache responses appropriately

2. **Image Optimization**
   - Use Next.js Image component
   - Optimize image formats
   - Implement lazy loading

### Database Optimizations

1. **Query Optimization**
   - Use proper indexes
   - Limit result sets
   - Cache frequently accessed data

2. **Connection Pooling**
   - Configure Supabase connection pooling
   - Monitor connection usage
   - Scale as needed

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify all dependencies are installed
   - Review build logs for errors

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Review RLS policies

3. **Performance Issues**
   - Monitor Vercel analytics
   - Check database query performance
   - Optimize images and assets

### Debugging Steps

1. **Local Development**
   ```bash
   npm run dev
   # Check browser console for errors
   # Verify environment variables
   ```

2. **Production Debugging**
   - Check Vercel function logs
   - Review Supabase logs
   - Use browser dev tools

## 📞 Support

### Getting Help

1. **Documentation**
   - [Next.js Docs](https://nextjs.org/docs)
   - [Supabase Docs](https://supabase.com/docs)
   - [Vercel Docs](https://vercel.com/docs)

2. **Community**
   - [Next.js Discord](https://discord.gg/nextjs)
   - [Supabase Discord](https://discord.supabase.com)
   - [Vercel Community](https://github.com/vercel/vercel/discussions)

3. **Professional Support**
   - Contact the development team
   - Schedule a consultation
   - Review the support package

---

**Happy Deploying! 🚀**
