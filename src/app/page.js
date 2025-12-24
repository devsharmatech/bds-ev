import HeroSection from '@/components/sections/HeroSection'
import EventsSection from '@/components/sections/EventsSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import MainLayout from '@/components/MainLayout'
import WelcomeSection from '@/components/WelcomeSection'
import FocusAreasSection from '@/components/FocusAreasSection'
import ContactSection from '@/components/sections/ContactSection'
export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <EventsSection />
      <WelcomeSection />
      <FocusAreasSection/>
      <FeaturesSection />
      <ContactSection/>
    </MainLayout>
  )
}