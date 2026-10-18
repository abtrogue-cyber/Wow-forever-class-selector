import { lazy, Suspense } from 'react'
import { Route, Switch } from 'wouter'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'

// Dev-only tool: with DEV=false the import is dead code and stays out of production builds.
const DebugPage = import.meta.env.DEV ? lazy(() => import('./pages/DebugPage')) : null

export default function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      {DebugPage && (
        <Route path="/debug">
          <Suspense fallback={<p className="p-6">Loading…</p>}>
            <DebugPage />
          </Suspense>
        </Route>
      )}
      <Route component={NotFoundPage} />
    </Switch>
  )
}
