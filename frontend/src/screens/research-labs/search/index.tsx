/**
 * Search Lab: choose datasets, cores and simulations, then run the search as a task in
 * Tasks. It writes one- and two-operator Alphas from the datasets' fields, steering towards
 * the best Sharpe.
 */

import { useQuery } from '@tanstack/react-query'
import { CircleAlertIcon, PlayIcon } from 'lucide-react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { today } from '@/api/core'
import { fmt } from '@/lib/format'
import {
  LAB_DEFAULTS,
  type LabDraft,
  labBody,
  MAX_SIMULATIONS,
  simulationsValid,
  useAddTask,
  useLabMarket,
  useLabPreview,
  vectorOperatorsOf,
} from '@/screens/research-labs/lab-task'
import { type SearchLabRequest, searchLab } from '@/screens/research-labs/search/api'
import { DatasetsPanel, SettingsPanel } from '@/screens/research-labs/task-settings'
import { Badge, Button, Disclosure, ErrorNotice, Page, PageHeader } from '@/ui/kit'

/** The Search Lab's choices, kept between visits. */
const useSearchLab = create<LabDraft>()(
  persist(() => LAB_DEFAULTS, { name: 'alpha-harness-search-lab' }),
)

export function SearchLabScreen() {
  const stored = useSearchLab()
  const set = useSearchLab.setState
  const day = useQuery({ queryKey: ['today'], queryFn: () => today.get() })
  const { chosen, names, choose } = useLabMarket(stored, set, '/labs/search')

  const options = useQuery({
    queryKey: ['search-lab', 'options'],
    queryFn: searchLab.options,
    staleTime: 5 * 60_000,
  })
  // Until the user types a number, the task takes what is left of today (never stored).
  const maxSimulations = options.data?.maxSimulations ?? MAX_SIMULATIONS
  const unspoken = day.data?.simulations.unspoken ?? 0
  const draft = {
    ...stored,
    simulations: stored.simulations ?? (unspoken > 0 ? Math.min(unspoken, maxSimulations) : null),
  }
  const vectorOperators = vectorOperatorsOf(draft, options.data?.vector)
  const body: SearchLabRequest = labBody(draft, vectorOperators)
  const { preview, current } = useLabPreview('search-lab', body, searchLab.preview, {
    enabled: chosen && options.isSuccess,
  })
  const plan = chosen ? preview.data : undefined

  const add = useAddTask(
    (count: number) => searchLab.runTask({ ...body, simulations: count }),
    'Task running',
  )
  const ready =
    plan !== undefined &&
    current &&
    plan.problems.length === 0 &&
    simulationsValid(draft.simulations, maxSimulations)

  const missing: string[] = []
  if (!chosen) missing.push('Choose Datasets')
  if (draft.simulations === null || draft.simulations < 1) missing.push('Enter Simulations')
  else if (draft.simulations > maxSimulations) missing.push(`Simulations exceeds max (${fmt.int(maxSimulations)})`)
  if (plan?.problems && plan.problems.length > 0) missing.push('Fix Plan Issues')

  return (
    <Page>
      <PageHeader
        breadcrumbs={[
          { label: 'Alpha Generators', to: '/labs' },
          { label: 'Math Formula Search' },
        ]}
        title={
          <div className="flex flex-wrap items-center gap-2.5">
            <span>Math Formula Search</span>
            <Badge tone="profit">Local Math Engine • 100% Free</Badge>
          </div>
        }
        description="Offline algorithmic formula search. Combines mathematical operator trees and field candidates using Bayesian optimization (TPE) without requiring any external LLM or API keys."
        actions={
          <>
            {missing.length > 0 && (
              <div
                id="run-task-blocked"
                className="flex items-center gap-1.5 rounded-sm border border-pnl-negative-edge bg-pnl-negative-tint px-2.5 py-1 text-body-compact font-medium text-pnl-negative"
              >
                <CircleAlertIcon className="size-4 shrink-0" />
                <span>Required: {missing.join(' • ')}</span>
              </div>
            )}
            <Button
              variant="primary"
              disabled={!ready}
              loading={add.isPending}
              aria-describedby={missing.length > 0 ? 'run-task-blocked' : undefined}
              onClick={() => draft.simulations !== null && add.mutate(draft.simulations)}
            >
              <PlayIcon />
              Run Task
            </Button>
          </>
        }
      />
      {missing.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-pnl-negative-edge bg-pnl-negative-tint p-3 text-pnl-negative">
          <CircleAlertIcon className="size-4.5 mt-0.5 shrink-0 text-pnl-negative" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-body">Required before generation:</span>
            <span className="text-body-compact">
              Please complete the red highlighted sections below ({missing.join(', ')}) to enable Run Task.
            </span>
          </div>
        </div>
      )}
      <Disclosure summary="Read more: How Math Formula Search works & simulation guide">
        <div className="flex flex-col gap-2.5 text-body-compact text-ink-subtle">
          <p>
            <strong className="text-ink">100% Local Combinatorics:</strong> This search engine operates entirely on your machine using Optuna's Tree-structured Parzen Estimator (TPE). It tests combinations of 1-operator and 2-operator mathematical formula shapes (e.g.{' '}
            <code className="rounded bg-canvas px-1 py-0.5 font-mono text-xs text-ink">ts_decay_linear(rank(X), d)</code>,{' '}
            <code className="rounded bg-canvas px-1 py-0.5 font-mono text-xs text-ink">group_neutralize(ts_delta(X, d), sector)</code>) across your chosen dataset fields.
          </p>
          <div className="my-1 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-md border border-hairline bg-surface-1 p-2.5">
              <span className="mb-0.5 block font-medium text-ink">1. Zero API Costs</span>
              Runs pure mathematical permutations locally; no LLM tokens or Gemini/OpenAI API keys are consumed.
            </div>
            <div className="rounded-md border border-hairline bg-surface-1 p-2.5">
              <span className="mb-0.5 block font-medium text-ink">2. Steers on Sharpe</span>
              Uses Bayesian optimization to adaptively sample operator parameters and decays that maximize WorldQuant Sharpe.
            </div>
            <div className="rounded-md border border-hairline bg-surface-1 p-2.5">
              <span className="mb-0.5 block font-medium text-ink">3. Live Simulation Slots</span>
              When started, expressions queue into background Tasks and run against WorldQuant's live simulation cluster.
            </div>
          </div>
        </div>
      </Disclosure>
      {options.isError && (
        <ErrorNotice error={options.error} title="Could not read your operators" />
      )}
      <DatasetsPanel
        ids={draft.datasetIds}
        names={names}
        onChoose={choose}
        onRemove={(id) => set({ datasetIds: stored.datasetIds.filter((x) => x !== id) })}
      />
      <SettingsPanel
        draft={draft}
        set={set}
        vector={options.data?.vector ?? []}
        chosenVector={vectorOperators}
        decays={options.data?.decays}
        maxSimulations={maxSimulations}
        plan={plan}
        error={chosen && preview.isError ? preview.error : null}
      />
    </Page>
  )
}
