import { MotionConfig } from 'motion/react'
import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Switch } from 'wouter'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'

// The landing page ships alone; the quiz, results (engine + data) and about page load on demand.
const QuizPage = lazy(() => import('./pages/QuizPage').then((m) => ({ default: m.QuizPage })))
const ResultPage = lazy(() => import('./pages/ResultPage').then((m) => ({ default: m.ResultPage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
// Dev-only tool: with DEV=false the import is dead code and stays out of production builds.
const DebugPage = import.meta.env.DEV ? lazy(() => import('./pages/DebugPage')) : null

const Lazy = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>{children}</Suspense>
)

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Switch>
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
    </MotionConfig>
  )
}
