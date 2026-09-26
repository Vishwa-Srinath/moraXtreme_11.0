import dynamic from "next/dynamic"
import DynamicNavbar from "@/components/DynamicNavbar"
import AboutSection from "@/components/landing/AboutSection"
import LegacySection from "@/components/landing/LegacySection"
import WhyJoinSection from "@/components/landing/WhyJoinSection"
import RegisterCTASection from "@/components/landing/RegisterCTASection"
import Footer from "@/components/Footer"

const WorldAsiaScene = dynamic(() => import("@/components/landing/WorldAsiaScene"))
const HighlightsTimeline = dynamic(() => import("@/components/landing/HighlightsTimeline"))
const Timeline = dynamic(() => import("@/components/timeline/Timeline"))
const ImageGallery = dynamic(() => import("@/components/ImageGallery"))
const TeamSlider = dynamic(() => import("@/components/TeamSlider"))

export default async function Home() {
  return (
    <main id="home" className="relative flex flex-col items-center bg-[#000000]">
      <DynamicNavbar />
      <WorldAsiaScene>
        {/* Scrollable content sections */}
        <div className="relative z-10 flex w-full max-w-6xl flex-col gap-16 px-4 py-24 text-white md:gap-32 md:px-6">
          <AboutSection />

          <section id="highlights" className="relative w-full py-12 min-h-0 flex flex-col justify-center md:py-24 md:min-h-[150vh]">
            <HighlightsTimeline />
          </section>

          <LegacySection />

          <Timeline />

          <WhyJoinSection />

          <RegisterCTASection />
        </div>

        <ImageGallery />

        {/* Spacer for transition to Sri Lanka Deep Dive */}
        <div className="h-[40vh] w-full" aria-hidden="true" />

        <TeamSlider />

        <Footer />
      </WorldAsiaScene>
    </main>
  )
}
