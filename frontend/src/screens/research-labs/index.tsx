/** Research Labs: every lab, two by two. */

import { Link } from '@tanstack/react-router'
import {
  ArrowUpRightIcon,
  BlocksIcon,
  DnaIcon,
  type LucideIcon,
  SearchIcon,
  ZapIcon,
} from 'lucide-react'
import { LAB_TABS } from '@/shell/nav'
import { Badge, Page, PageHeader, type Tone } from '@/ui/kit'

const ICONS: Record<(typeof LAB_TABS)[number]['tab'], LucideIcon> = {
  search: SearchIcon,
  template: BlocksIcon,
  evolution: DnaIcon,
  'power-pool': ZapIcon,
}

const LAB_META: Record<
  (typeof LAB_TABS)[number]['tab'],
  { badge: string; badgeTone: Tone | 'outline'; about: string }
> = {
  search: {
    badge: 'Local Math Engine • 100% Free',
    badgeTone: 'profit',
    about: 'Algorithmic combinatorics search. Combines mathematical formula shapes across fields using Bayesian TPE. Fast, runs 100% locally without API keys.',
  },
  'power-pool': {
    badge: 'AI / LLM Agent • Requires Key',
    badgeTone: 'warn',
    about: 'Intelligent multi-field strategy writer powered by LLMs (Gemini / OpenAI). Uses financial reasoning and feedback history to draft novel alphas.',
  },
  evolution: {
    badge: 'Genetic Algorithm • Breeding',
    badgeTone: 'outline',
    about: 'Breeds, splices, and mutates existing winning alphas from your vault to evolve higher Sharpe and lower risk over train/test splits.',
  },
  template: {
    badge: 'Formula Templates • Permutations',
    badgeTone: 'neutral',
    about: 'Systematically slots candidate data fields into established quantitative formula templates across multiple time horizons.',
  },
}

/** The card a hub screen links each of its entries with; the `Link` carries it. */
export const HUB_CARD =
  'panel-highlight group flex min-h-56 flex-col justify-between rounded-lg border border-hairline bg-surface-1 p-6 transition-colors hover:border-hairline-strong hover:bg-surface-2'

export function HubCardBody({
  icon: Icon,
  index,
  label,
  tab,
  about,
}: {
  icon: LucideIcon
  index: number
  label: string
  tab?: (typeof LAB_TABS)[number]['tab']
  about?: string
}) {
  const meta = tab ? LAB_META[tab] : undefined
  const description = about ?? meta?.about
  return (
    <>
      <div className="flex items-start justify-between">
        <span className="flex size-12 items-center justify-center rounded-md border border-hairline-strong bg-surface-2 text-ink-muted transition-colors group-hover:border-primary group-hover:text-primary">
          <Icon className="size-6" aria-hidden />
        </span>
        <div className="flex items-center gap-2">
          {meta?.badge && <Badge tone={meta.badgeTone}>{meta.badge}</Badge>}
          <ArrowUpRightIcon
            className="size-5 text-ink-tertiary transition-colors group-hover:text-ink"
            aria-hidden
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 pt-4">
        <span className="num text-body-compact text-ink-subtle">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="text-headline font-semibold text-balance text-ink">{label}</h2>
        {description && <p className="max-w-prose text-body text-pretty text-ink-subtle">{description}</p>}
      </div>
    </>
  )
}

export function ResearchLabsScreen() {
  return (
    <Page>
      <PageHeader
        title="Alpha Generators"
        breadcrumbs={[{ label: 'Research' }, { label: 'Alpha Generators' }]}
        description="Choose your generation engine: fast local mathematical search, creative AI reasoning, evolutionary genetic breeding, or quantitative formula templates."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {LAB_TABS.map((lab, index) => (
          <Link key={lab.tab} to={lab.to} className={HUB_CARD}>
            <HubCardBody icon={ICONS[lab.tab]} index={index} label={lab.label} tab={lab.tab} />
          </Link>
        ))}
      </div>
    </Page>
  )
}
