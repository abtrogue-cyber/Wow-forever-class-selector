import type { Axis, Build, ClassId, GameClass, GameData, Question, Race, Tag } from '../data/schemas'

/** Lookup tables built once per data object. */
export type EngineContext = {
  data: GameData
  builds: Map<string, Build>
  buildOrder: Map<string, number>
  classes: Map<ClassId, GameClass>
  races: Map<string, Race>
  raceOrder: Map<string, number>
  axes: Map<string, Axis>
  tags: Map<string, Tag>
  combosByClass: Map<ClassId, { race: Race; newInForever: boolean }[]>
  questions: Map<string, Question>
  prioritiesQuestionId: string | null
}

const cache = new WeakMap<GameData, EngineContext>()

export function getContext(data: GameData): EngineContext {
  const hit = cache.get(data)
  if (hit) return hit

  const races = new Map(data.races.map((r) => [r.id, r]))
  const combosByClass = new Map<ClassId, { race: Race; newInForever: boolean }[]>()
  for (const combo of data.raceClass.combos) {
    const race = races.get(combo.raceId)
    if (!race) continue
    const list = combosByClass.get(combo.classId) ?? []
    list.push({ race, newInForever: combo.newInForever })
    combosByClass.set(combo.classId, list)
  }

  const ctx: EngineContext = {
    data,
    builds: new Map(data.builds.map((b) => [b.id, b])),
    buildOrder: new Map(data.builds.map((b, i) => [b.id, i])),
    classes: new Map(data.classes.map((c) => [c.id, c])),
    races,
    raceOrder: new Map(data.races.map((r, i) => [r.id, i])),
    axes: new Map(data.axes.map((a) => [a.id, a])),
    tags: new Map(data.tags.map((t) => [t.id, t])),
    combosByClass,
    questions: new Map(data.questions.questions.map((q) => [q.id, q])),
    prioritiesQuestionId: data.questions.questions.find((q) => q.type === 'priorities')?.id ?? null,
  }
  cache.set(data, ctx)
  return ctx
}

/** Typed Object.entries for partial records. */
export function entries<K extends string, V>(record: Partial<Record<K, V>> | undefined): [K, V][] {
  return record ? (Object.entries(record) as [K, V][]) : []
}
