import { HeroSection } from '@/components/landing/hero'
import { FeaturesSection } from '@/components/landing/features'
import { StatsSection } from '@/components/landing/stats'
import { AISection } from '@/components/landing/ai-section'
import { PricingSection } from '@/components/landing/pricing'
import { TestimonialsSection } from '@/components/landing/testimonials'
import { CTASection } from '@/components/landing/cta'
import { LandingNav } from '@/components/landing/nav'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-light dark:bg-surface-dark overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <AISection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
