import type { Vec3 } from '../../galaxy/pca'
import { AXIS_ENDS, DEFAULT_ORB, DEFAULT_TINT, STARS } from './compass'
import { CompassStage } from './CompassStage'

const ORIGIN: Vec3 = [0, 0, 0]
const NO_STOPS: Vec3[] = []

/** The landing page's compass: your star wandering among the faint spec stars. Lazy chunk (needs the data). */
export default function LandingCompass({ className }: { className?: string }) {
  return (
    <CompassStage
      position={ORIGIN}
      preview={null}
      stops={NO_STOPS}
      tint={DEFAULT_TINT}
      orb={DEFAULT_ORB}
      novelty={false}
      companion={false}
      pulse=""
      axisEnds={AXIS_ENDS}
      stars={STARS}
      starMode="faint"
      revealTarget={null}
      wander
      className={className}
    />
  )
}
