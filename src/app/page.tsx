import Header from '@/components/Header'
import Hero from '@/components/Hero'
import FeaturedRankings from '@/components/FeaturedRankings'
import QuickFilters from '@/components/QuickFilters'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* DJ Background */}
      <div className="fixed inset-0 z-0">
        {/* DJ Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: "url('/dj.jpg')",
            filter: 'blur(0.5px)'
          }}
        ></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/20 to-pink-50/40"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100/20 via-transparent to-blue-100/20 animate-pulse"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <FeaturedRankings />
          <QuickFilters />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </div>
  )
}
