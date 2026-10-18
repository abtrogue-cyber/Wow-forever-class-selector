import { MotionConfig } from 'motion/react'
import { lazy, Suspense } from 'react'
import { Route, Switch } from 'wouter'
import { AboutPage } from './pages/AboutPage'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { QuizPage } from './pages/QuizPage'
import { ResultPage } from './pages/ResultPage'

// Dev-only tool: with DEV=false the import is dead code and stays out of production builds.
const DebugPage = import.meta.env.DEV ? lazy(() => import('./pages/DebugPage')) : null

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/quiz" component={QuizPage} />
        <Route path="/result/:code">{(params) => <ResultPage params={params} />}</Route>
        <Route path="/about" component={AboutPage} />
        {DebugPage && (
          <Route path="/debug">
            <Suspense fallback={<p className="p-6">Loading…</p>}>
              <DebugPage />
            </Suspense>
          </Route>
        )}
        <Route component={NotFoundPage} />
      </Switch>
    </MotionConfig>
  )
}
