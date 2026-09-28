/** LLM Power Pool Lab: an LLM writes Power Pool Alphas for your datasets while the task runs in Tasks. */

import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CircleAlertIcon, PlusIcon } from 'lucide-react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fmt } from '@/lib/format'
import { DEFAULT_SCOPE, useScopeOptions } from '@/lib/scope'
import {
  MAX_SIMULATIONS,
  simulationsValid,
  useAddTask,
  useLabMarket,
  useLabPreview,
} from '@/screens/research-labs/lab-task'
import { NeutralizationPicker } from '@/screens/research-labs/neutralization'
import { type PowerPoolRequest, powerPoolLab } from '@/screens/research-labs/power-pool/api'
import {
  CoresSetting,
  DatasetsPanel,
  SimulationsSetting,
} from '@/screens/research-labs/task-settings'
import {
  Badge,
  Button,
  Disclosure,
  ErrorNotice,
  Fieldset,
  Metric,
  Notice,
  Page,
  PageHeader,
  Panel,
} from '@/ui/kit'
import { Select } from '@/ui/overlay'

interface PowerPoolDraft {
  region: string
  delay: number
  universe: string
  datasetIds: string[]
  cores: number
  simulations: number | null
  model: string | null
  /** Empty keeps every neutralization BRAIN offers for the market. */
  neutralizations: string[]
}

const useDraft = create<PowerPoolDraft>()(
  persist(
    (): PowerPoolDraft => ({
      region: DEFAULT_SCOPE.region,
      delay: DEFAULT_SCOPE.delay,
      universe: DEFAULT_SCOPE.universe,
      datasetIds: [],
      cores: 4,
      simulations: null,
      model: null,
      neutralizations: [],
    }),
    { name: 'alpha-harness-power-pool-lab' },
  ),
)

const PRE =
  'num max-h-80 overflow-auto rounded-md border border-hairline bg-canvas p-3 text-body-compact whitespace-pre-wrap text-ink-muted'

export function PowerPoolLabScreen() {
  const draft = useDraft()
  const set = useDraft.setState
  const { names, choose } = useLabMarket(draft, set, '/labs/power-pool')
  const options = useQuery({
    queryKey: ['power-pool-lab', 'options'],
    queryFn: powerPoolLab.options,
  })
  const models = options.data?.models ?? []
  const model =
    draft.model && models.some((m) => m.id === draft.model)
      ? draft.model
      : (options.data?.defaultModel ?? null)

  // BRAIN's legal list for this market; the LLM draws from whatever is chosen, or all of it.
  const scopeOptions = useScopeOptions({
    instrumentType: 'EQUITY',
    region: draft.region,
    delay: draft.delay,
    universe: draft.universe,
  })

  const body: PowerPoolRequest = {
    region: draft.region,
    delay: draft.delay,
    universe: draft.universe,
    dataset_ids: draft.datasetIds,
    model,
    neutralizations: draft.neutralizations,
    cores: draft.cores,
    simulations: draft.simulations ?? 0,
  }
  const { preview, current } = useLabPreview('power-pool-lab', body, powerPoolLab.preview)
  const plan = preview.data
  const maxSimulations = options.data?.maxSimulations ?? MAX_SIMULATIONS
  const add = useAddTask(() => powerPoolLab.addTask(body))
  const ready =
    plan !== undefined &&
    current &&
    plan.problems.length === 0 &&
    simulationsValid(draft.simulations, maxSimulations)

  const missing: string[] = []
  if (options.isSuccess && models.length === 0) missing.push('API Key Required')
  else if (!model) missing.push('Select Model')
  if (draft.datasetIds.length === 0) missing.push('Choose Datasets')
  if (draft.simulations === null || draft.simulations < 1) missing.push('Enter Simulations')
  else if (draft.simulations > maxSimulations) missing.push(`Simulations exceeds max (${fmt.int(maxSimulations)})`)
  if (plan?.problems && plan.problems.length > 0) missing.push('Fix Plan Issues')

  return (
    <Page>
      <PageHeader
        breadcrumbs={[
          { label: 'Alpha Generators', to: '/labs' },
          { label: 'AI Strategy Generator' },
        ]}
        title={
          <div className="flex flex-wrap items-center gap-2.5">
            <span>AI Strategy Generator</span>
            <Badge tone="warn">AI / LLM Agent • Requires Key</Badge>
          </div>
        }
        description="Autonomous quantitative strategy generator powered by frontier LLMs (Gemini / OpenAI). Uses financial reasoning and domain constraints to write novel alpha expressions."
        actions={
          <>
            {missing.length > 0 && (
              <div
                id="add-task-blocked"
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
              aria-describedby={missing.length > 0 ? 'add-task-blocked' : undefined}
              onClick={() => add.mutate()}
            >
              <PlusIcon />
              Add Task
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
              Please complete the red highlighted sections below ({missing.join(', ')}) to enable Add Task.
            </span>
          </div>
        </div>
      )}
      <Disclosure summary="Read more: How AI Strategy Generator works & key requirements">
        <div className="flex flex-col gap-2.5 text-body-compact text-ink-subtle">
          <p>
            <strong className="text-ink">LLM-Driven Multi-Field Formulation:</strong> This lab prompts frontier models with the fields and metadata from your chosen datasets. Each LLM call synthesizes batches of 20 novel, syntactically valid WorldQuant FAST expressions designed with explicit market hypotheses.
          </p>
          <div className="my-1 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-md border border-hairline bg-surface-1 p-2.5">
              <span className="mb-0.5 block font-medium text-ink">1. Model Configuration</span>
              Requires an API key configured in <em>Settings › LLM Integration</em> (e.g. Gemini 2.5 Flash / GPT-4o).
            </div>
            <div className="rounded-md border border-hairline bg-surface-1 p-2.5">
              <span className="mb-0.5 block font-medium text-ink">2. WorldQuant Constraints</span>
              Alphas are constrained to ≤8 operators, ≤3 fields, valid universe & neutralization mappings, and decay exploration.
            </div>
            <div className="rounded-md border border-hairline bg-surface-1 p-2.5">
              <span className="mb-0.5 block font-medium text-ink">3. Automatic Extraction</span>
              The response parser extracts code blocks and queues batch simulation tasks directly into your Live Slots.
            </div>
          </div>
        </div>
      </Disclosure>
      {options.isError && <ErrorNotice error={options.error} title="Could not load the models" />}
      {options.isSuccess && models.length === 0 && (
        <Notice
          tone="error"
          title="No LLM API Key Configured"
          action={
            <Button variant="secondary" size="sm" render={<Link to="/ai">Open LLM Integration</Link>}>
              Add API Key
            </Button>
          }
        >
          An API key is required to generate alphas with an AI model. Add your Gemini or OpenAI API
          key in Settings to unlock this generator.
        </Notice>
      )}
      <DatasetsPanel
        ids={draft.datasetIds}
        names={names}
        onChoose={choose}
        onRemove={(id) => set({ datasetIds: draft.datasetIds.filter((x) => x !== id) })}
      />
      <Panel title="Settings">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
            <Fieldset
              legend={
                <div className="flex items-center gap-1.5">
                  <span>Model</span>
                  {!model && (
                    <span className="text-caption font-semibold text-pnl-negative">(Required)</span>
                  )}
                </div>
              }
            >
              <Select
                label="Model"
                items={models.map((m) => ({
                  value: m.id,
                  label: `${m.label} · ${fmt.int(m.remainingToday)} left today`,
                }))}
                value={model}
                onChange={(v) => set({ model: v })}
              />
            </Fieldset>
            <CoresSetting value={draft.cores} onChange={(cores) => set({ cores })} />
            <SimulationsSetting
              value={draft.simulations}
              max={maxSimulations}
              placeholder="500"
              onChange={(next) => set({ simulations: next })}
            />
          </div>
          {scopeOptions.neutralizations.length > 0 && (
            <NeutralizationPicker
              available={scopeOptions.neutralizations}
              value={draft.neutralizations}
              onChange={(next) => set({ neutralizations: next })}
              hint="None chosen draws from every one BRAIN offers here."
            />
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric boxed label="Datasets" value={fmt.int(draft.datasetIds.length)} />
            <Metric boxed label="Fields" value={fmt.int(plan?.fields)} />
            <Metric boxed label="LLM Calls" value={fmt.int(plan?.llmCalls)} hint="20 Alphas each" />
            <Metric
              boxed
              label="Universes"
              value={fmt.int(plan?.universes.length)}
              hint={`${fmt.int(plan?.neutralizations.length)} Neutralizations`}
            />
          </div>
          <p className="text-body-compact text-pretty text-ink-subtle">
            Each Alpha gets a random Universe, Neutralization and Decay; Truncation 0.08.
          </p>
          {preview.isError && <ErrorNotice error={preview.error} title="Could not plan the task" />}
          {plan?.problems.map((m) => (
            <Notice key={m} tone="error" title={m} />
          ))}
          {plan?.warnings.map((m) => (
            <Notice key={m} tone="warn" title={m} />
          ))}
          {plan?.prompt && (
            <Disclosure summary={`Prompt · ~${fmt.int(plan.prompt.tokens)} tokens`}>
              <div className="flex flex-col gap-2">
                <pre className={PRE} role="region" aria-label="System prompt">
                  {plan.prompt.system}
                </pre>
                <pre className={PRE} role="region" aria-label="User prompt">
                  {plan.prompt.user}
                </pre>
              </div>
            </Disclosure>
          )}
        </div>
      </Panel>
    </Page>
  )
}
