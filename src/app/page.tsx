import Header from '@/components/Header'
import Hero from '@/components/Hero'
import FeaturedRankings from '@/components/FeaturedRankings'
import QuickFilters from '@/components/QuickFilters'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Hero />
        <FeaturedRankings />
        <QuickFilters />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
