import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'

// The landing page ships alone; the quiz, results (engine + data) and about page load on demand.
const QuizPage = lazy(() => import('./pages/QuizPage').then((m) => ({ default: m.QuizPage })))
const ResultPage = lazy(() => import('./pages/ResultPage').then((m) => ({ default: m.ResultPage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const GalaxyPage = lazy(() => import('./pages/GalaxyPage').then((m) => ({ default: m.GalaxyPage })))
// Dev-only tool: with DEV=false the import is dead code and stays out of production builds.
const DebugPage = import.meta.env.DEV ? lazy(() => import('./pages/DebugPage')) : null

const Lazy = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>{children}</Suspense>
)

export default function App() {
  const [location] = useLocation()
  // One transition per section (quiz, result, galaxy…); moving within a section, e.g. tweaking a result, doesn't re-animate.
  const section = location.split('/')[1] || 'home'
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0 })}>
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Switch location={location}>
            <Route path="/" component={LandingPage} />
            <Route path="/quiz">
              <Lazy>
                <QuizPage />
              </Lazy>
            </Route>
            <Route path="/result/:code">
              {(params) => (
                <Lazy>
                  <ResultPage params={params} />
                </Lazy>
              )}
            </Route>
            <Route path="/galaxy">
              <Lazy>
                <GalaxyPage />
              </Lazy>
            </Route>
            <Route path="/galaxy/:code">
              {(params) => (
                <Lazy>
                  <GalaxyPage key={params.code} code={params.code} />
                </Lazy>
              )}
            </Route>
            <Route path="/about">
              <Lazy>
                <AboutPage />
              </Lazy>
            </Route>
            {DebugPage && (
              <Route path="/debug">
                <Lazy>
                  <DebugPage />
                </Lazy>
              </Route>
            )}
            <Route component={NotFoundPage} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  )
}
