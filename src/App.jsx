import React, {
    useState,
    useEffect,
    useCallback,
    Suspense,
    lazy,
} from 'react'
import { AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LoadingScreen     from '@/components/ui/LoadingScreen'
import ScrollProgress    from '@/components/ui/ScrollProgress'
import NoiseBg           from '@/components/ui/NoiseBg'

gsap.registerPlugin(ScrollTrigger)

/* ── Lazy section imports ──────────────────────────────────── */
const Section0_Hero           = lazy(() => import('@/components/sections/Section0_Hero'))
const Section1_Origin         = lazy(() => import('@/components/sections/Section1_Origin'))
const Section2_StackOverflow  = lazy(() => import('@/components/sections/Section2_StackOverflow'))
const Section3_DebuggingAbyss = lazy(() => import('@/components/sections/Section3_DebuggingAbyss'))
const Section4_DeadlineHell   = lazy(() => import('@/components/sections/Section4_DeadlineHell'))
const Section5_CoffeeReligion = lazy(() => import('@/components/sections/Section5_CoffeeReligion'))
const Section6_Enlightenment  = lazy(() => import('@/components/sections/Section6_Enlightenment'))

/* ============================================================
   SECTION FALLBACK
   minHeight: 100vh — prevents ScrollTrigger calculating
   pin positions against a 0-height placeholder.
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
   Double-rAF ScrollTrigger.refresh() after every lazy section
   fully paints — keeps all pin positions accurate.
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

    return <>{children}</>   // ← fixed: was <>{children}>
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
    const [isLoading, setIsLoading] = useState(true)

    const handleLoadingComplete = useCallback(() => {
        setIsLoading(false)
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
            {/* Loading screen — floats over content as a fixed overlay */}
            <AnimatePresence>
                {isLoading && (
                    <LoadingScreen onComplete={handleLoadingComplete} />
                )}
            </AnimatePresence>

            {/* Persistent UI — always visible */}
            <NoiseBg />
            <ScrollProgress />

            {/* ── Sections — always in DOM, never gated by isLoading ── 
                SectionTransition removed: it was starting at opacity:0
                with no trigger to become visible after loading.
                Each section handles its own entrance animations.      */}
            <main>
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
            </main>
        </>
    )
}
