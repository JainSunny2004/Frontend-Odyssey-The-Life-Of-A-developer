import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  lazy,
} from 'react'
import { AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LoadingScreen from '@/components/ui/LoadingScreen'
import ScrollProgress from '@/components/ui/ScrollProgress'
import SectionTransition from '@/components/ui/SectionTransition'
import NoiseBg from '@/components/ui/NoiseBg'

gsap.registerPlugin(ScrollTrigger)

/* ── Lazy section imports ──────────────────────────────────── */
const Section0_Hero = lazy(() => import('@/components/sections/Section0_Hero'))
const Section1_Origin = lazy(() => import('@/components/sections/Section1_Origin'))
const Section2_StackOverflow = lazy(() => import('@/components/sections/Section2_StackOverflow'))
const Section3_DebuggingAbyss = lazy(() => import('@/components/sections/Section3_DebuggingAbyss'))
const Section4_DeadlineHell = lazy(() => import('@/components/sections/Section4_DeadlineHell'))
const Section5_CoffeeReligion = lazy(() => import('@/components/sections/Section5_CoffeeReligion'))
const Section6_Enlightenment = lazy(() => import('@/components/sections/Section6_Enlightenment'))


/* ============================================================
   SECTION FALLBACK
   Must have minHeight: 100vh — keeps ScrollTrigger from
   calculating pin positions against a 0-height placeholder.
   ============================================================ */
function SectionFallback() {
  return (
    <div
      className="w-full bg-bg-void"
      style={{ minHeight: '100vh' }}
      aria-hidden="true"
    />
  )
}

/* ============================================================
   SECTION WRAPPER
   Double-rAF refresh after every lazy section paints,
   so ScrollTrigger pin start/end positions are always
   computed against the real rendered DOM height.
   ============================================================ */
function SectionWrapper({ children }) {
  useEffect(() => {
    let raf1, raf2
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  return <>{children}</>
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [isLoading, setIsLoading] = useState(true)

  /* LoadingScreen calls this when its exit animation ends */
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
    // Refresh after overlay exits so every section's
    // ScrollTrigger has accurate positions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    })
  }, [])

  /* Debounced resize refresh */
  useEffect(() => {
    let timer
    const handleResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => ScrollTrigger.refresh(), 200)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      {/* ── Loading overlay — floats ON TOP of content ────────
                Sections are always in the DOM. LoadingScreen is just
                a visual cover that AnimatePresence removes when done.
            ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {/* ── Persistent UI ─────────────────────────────────── */}
      <NoiseBg />
      <ScrollProgress />

      {/* ── Main content — ALWAYS rendered, never gated ───── */}
      <main>
        <SectionTransition>
          <Suspense fallback={<SectionFallback />}>
            <SectionWrapper>
              <Section0_Hero />
            </SectionWrapper>
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <SectionWrapper>
              <Section1_Origin />
            </SectionWrapper>
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <SectionWrapper>
              <Section2_StackOverflow />
            </SectionWrapper>
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <SectionWrapper>
              <Section3_DebuggingAbyss />
            </SectionWrapper>
          </Suspense>

          {/* Section4 benefits most from SectionWrapper
                        because its pin trigger is computed lazily  */}
          <Suspense fallback={<SectionFallback />}>
            <SectionWrapper>
              <Section4_DeadlineHell />
            </SectionWrapper>
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <SectionWrapper>
              <Section5_CoffeeReligion />
            </SectionWrapper>
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <SectionWrapper>
              <Section6_Enlightenment />
            </SectionWrapper>
          </Suspense>

        </SectionTransition>
      </main>
    </>
  )
}
