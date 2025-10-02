# RankingHub - NYC Event Services Platform

A modern web application for discovering and connecting with the best DJs, photographers, and videographers in New York City.

## 🚀 Features

- **Official Rankings**: Monthly rankings of top service providers in NYC
- **Multi-Category Support**: DJs, Photographers, and Videographers
- **Provider Profiles**: Detailed profiles with skills ratings and contact information
- **Search & Filter**: Find providers by category, location, and ratings
- **Contact Forms**: Direct communication with service providers
- **Newsletter**: Stay updated with latest rankings and industry insights
- **Mobile-First Design**: Responsive design optimized for all devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Analytics**: Google Analytics 4

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ranking-hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. The schema will create all necessary tables and insert sample data

### 5. Import Data (Optional)

If you want to import data from CSV:

```bash
# Install csv-parser
npm install csv-parser

# Run the import script
node scripts/import-data.js
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── rankings/         # Rankings page
│   ├── providers/         # Provider profile pages
│   ├── services/         # Services page
│   └── contact/          # Contact page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── Hero.tsx           # Hero section
│   ├── RankingList.tsx    # Rankings display
│   ├── ProviderProfile.tsx # Provider details
│   └── ...
├── lib/                   # Utility functions
│   ├── supabase.ts        # Supabase client
│   ├── providers.ts       # Provider data functions
│   └── data.ts            # Mock data
└── types/                 # TypeScript types
    └── index.ts           # Type definitions
```

## 🗄 Database Schema

### Tables

- **providers**: Service provider information
- **skills**: Detailed skill ratings for each provider
- **contact_submissions**: Contact form submissions
- **newsletter_subscribers**: Newsletter subscription data

### Key Features

- Automatic timestamps with triggers
- Proper indexing for performance
- Foreign key relationships
- Data validation constraints

## 🎨 Design System

### Colors
- Primary: Yellow (#FCD34D)
- Secondary: Blue (#1E3A8A)
- Accent: Red (#DC2626)
- Background: Gray (#F9FAFB)

### Components
- Reusable button styles
- Card components
- Form elements
- Responsive grid layouts

## 📱 Pages

1. **Home Page**: Hero section with search and quick filters
2. **Rankings Page**: Category-based provider rankings
3. **Provider Profile**: Detailed provider information and contact
4. **Services Page**: Service category overview
5. **Contact Page**: Contact form and information

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Enable Row Level Security (RLS) for data protection
3. Configure authentication policies
4. Set up email templates for contact forms

### Analytics Setup

1. Create a Google Analytics 4 property
2. Add the GA4 tracking ID to environment variables
3. Implement tracking in key user interactions

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_GA_ID=your_production_ga_id
```

## 📊 Analytics

The application includes Google Analytics 4 tracking for:
- Page views
- User interactions
- Contact form submissions
- Newsletter signups
- Provider profile views

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Input validation and sanitization
- CSRF protection
- Secure environment variable handling

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build
```

## 📈 Performance

- Server-side rendering with Next.js
- Image optimization
- Lazy loading for components
- Efficient database queries
- CDN delivery through Vercel

## 🔄 Future Enhancements

- User authentication and profiles
- Provider claiming system
- Advanced search filters
- Review and rating system
- Payment integration
- API integrations (Google Places, Yelp)
- Mobile app development

## 📞 Support

For technical support or questions:
- Email: support@rankinghub.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 Changelog

### v1.0.0 (MVP)
- Initial release with core functionality
- Provider rankings and profiles
- Contact forms and newsletter
- Mobile-responsive design
- Supabase integration

---

**Built with ❤️ for the NYC event community**
