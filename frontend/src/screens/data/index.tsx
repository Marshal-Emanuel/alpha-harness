/**
 * Data Explorer (spec §4.2): a synced market's fields, narrowed in More filters down to whole
 * categories, whole subcategories or single datasets. Syncing lives in Sync with BRAIN.
 */

import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { fmt } from '@/lib/format'
import { useScope } from '@/lib/scope'
import { useDatasetPick } from '@/screens/data/dataset-pick'
import { Badge, Button, Metric, Page, PageHeader } from '@/ui/kit'
import { FieldsTab } from './fields'
import { MarketBar } from './market'

const LAB_NAMES: Record<string, string> = {
  '/labs/search': 'Math Formula Search',
  '/labs/power-pool': 'AI Strategy Generator',
  '/labs/template': 'Formula Templates',
}

export function DataScreen() {
  const [scope, update] = useScope('data')
  const picking = useDatasetPick((s) => s.active)
  const from = useDatasetPick((s) => s.from)
  const labName = LAB_NAMES[from] ?? 'Alpha Generator'

  // A pick follows the market shown here.
  useEffect(() => {
    if (picking) useDatasetPick.getState().follow(scope)
  }, [picking, scope])

  return (
    <Page>
      <PageHeader
        breadcrumbs={
          picking
            ? [
                { label: 'Alpha Generators', to: '/labs' },
                { label: labName, to: from },
                { label: 'Select Datasets' },
              ]
            : [{ label: 'Datasets & Fields' }]
        }
        title={
          picking ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <span>Select Datasets for {labName}</span>
              <Badge tone="neutral">Picker Mode</Badge>
            </div>
          ) : (
            'Datasets & Fields'
          )
        }
        description={
          picking
            ? `Choose the datasets whose fields will feed into ${labName}. Select categories or individual datasets below, then click Done to return.`
            : 'Browse, filter and compare the Data Fields you synced from BRAIN, locally.'
        }
      />
      {picking && <PickBar />}
      <MarketBar scope={scope} update={update} />
      <FieldsTab scope={scope} />
    </Page>
  )
}

/** While a lab picks datasets: how many are ticked, where to tick them, and the way back to it. */
function PickBar() {
  const navigate = useNavigate()
  const count = useDatasetPick((s) => s.ids.length)
  const from = useDatasetPick((s) => s.from)
  const labName = LAB_NAMES[from] ?? 'Generator'
  const back = (done: boolean) => {
    const pick = useDatasetPick.getState()
    const to = pick.from
    if (done) pick.finish()
    else pick.cancel()
    void navigate({ to })
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-hairline bg-surface-1 p-3 shadow-sm">
      <Metric boxed size="sm" label="Datasets Selected" value={fmt.int(count)} />
      <span className="min-w-0 flex-1 text-body-compact text-pretty text-ink-subtle">
        Selecting fields for <strong className="text-ink">{labName}</strong>. Tick whole categories,
        subcategories, or single datasets in <span className="font-medium text-ink">More filters</span> below.
      </span>
      <Button variant="ghost" onClick={() => back(false)}>
        Cancel
      </Button>
      <Button variant="primary" disabled={count === 0} onClick={() => back(true)}>
        Done → Return to {labName}
      </Button>
    </div>
  )
}
