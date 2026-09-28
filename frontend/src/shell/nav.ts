import {
  ChartPieIcon,
  DatabaseIcon,
  FlaskConicalIcon,
  Grid3x3Icon,
  LayersIcon,
  LayoutGridIcon,
  ListChecksIcon,
  RefreshCwIcon,
  SparklesIcon,
  WrenchIcon,
} from 'lucide-react'

/** Sub-tabs, in display order. Screens import these so the sidebar, ⌘K and tab bars agree. */
export const POOL_TABS = [
  { tab: 'stored', label: 'Stored' },
  { tab: 'submittable', label: 'Submittable' },
] as const

export const AI_TABS = [
  { tab: 'providers', label: 'Providers' },
  { tab: 'keys', label: 'Keys' },
  { tab: 'budget', label: 'Budget' },
  { tab: 'prompts', label: 'Prompts' },
  { tab: 'assistant', label: 'Assistant' },
] as const

/** The labs, each with its own route. Listed on the Research Labs screen and in ⌘K rather
 *  than under the sidebar entry: four children under one item is most of the sidebar, and
 *  the screen already introduces them properly. */
export const LAB_TABS = [
  { tab: 'search', label: 'Math Formula Search', to: '/labs/search' },
  { tab: 'power-pool', label: 'AI Strategy Generator', to: '/labs/power-pool' },
  { tab: 'evolution', label: 'Alpha Breeding (Genetic)', to: '/labs/evolution' },
  { tab: 'template', label: 'Formula Templates', to: '/labs/template' },
] as const

/** The tools, each with its own route. Listed on the Tools screen and in ⌘K rather than
 *  under the sidebar entry, for the same reason as the labs. */
export const TOOL_TABS = [
  { tab: 'settings-sampler', label: 'Settings Sampler', to: '/tools/settings-sampler' },
  { tab: 'submission-planner', label: 'Submission Planner', to: '/tools/submission-planner' },
  { tab: 'correlation-breaker', label: 'Correlation Breaker', to: '/tools/correlation-breaker' },
] as const

/** `group` heads a run of items in the sidebar; empty sits above every heading. An item's
 *  area is its path, `to` without the slash. */
export const NAV = [
  {
    to: '/dashboard',
    group: '',
    label: 'Dashboard',
    icon: LayoutGridIcon,
  },
  {
    to: '/matrix',
    group: '',
    label: 'Live Simulation Slots',
    icon: Grid3x3Icon,
  },
  {
    to: '/data',
    group: 'Research',
    label: 'Datasets & Fields',
    icon: DatabaseIcon,
  },
  {
    to: '/labs',
    group: 'Research',
    label: 'Alpha Generators',
    icon: FlaskConicalIcon,
    tabs: LAB_TABS,
  },
  {
    to: '/tools',
    group: 'Research',
    label: 'Tools',
    icon: WrenchIcon,
    tabs: TOOL_TABS,
  },
  {
    to: '/tasks',
    group: 'Results',
    label: 'Tasks',
    icon: ListChecksIcon,
  },
  {
    to: '/pool',
    group: 'Results',
    label: 'Alpha Vault',
    icon: LayersIcon,
    tabs: POOL_TABS,
  },
  {
    to: '/portfolio',
    group: 'Results',
    label: 'Portfolio',
    icon: ChartPieIcon,
  },
  {
    to: '/ai',
    group: 'Setup',
    label: 'LLM Integration',
    icon: SparklesIcon,
    tabs: AI_TABS,
  },
  {
    to: '/pyramids',
    group: 'Setup',
    label: 'Sync with BRAIN',
    icon: RefreshCwIcon,
  },
] as const
