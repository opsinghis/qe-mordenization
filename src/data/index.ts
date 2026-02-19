// ============================================================
// data/index.ts — All supporting data exports
// ============================================================

export { QE_PHASES } from './phases';
export type { QEPhase, AgenticVision, AgenticGain, ExampleStep } from './phases';

// ---------- Architecture ----------
export const ARCHITECTURE_LAYERS = [
  { name: "Presentation", systems: [
    { label: "PWA Storefront (MRT)", type: "frontend" }, { label: "Micro-Frontends", type: "frontend" },
    { label: "Amplience CMS", type: "content" }, { label: "Bloomreach Search", type: "content" },
  ]},
  { name: "API / Gateway", systems: [
    { label: "Kong Gateway", type: "api" }, { label: "BFF Microservices", type: "api" },
    { label: "GraphQL / REST APIs", type: "api" },
  ]},
  { name: "Commerce Core", systems: [
    { label: "Salesforce Commerce (SCAPI)", type: "commerce" }, { label: "Single Customer View (SCV)", type: "data" },
    { label: "IBM OMS", type: "commerce" },
  ]},
  { name: "Downstream", systems: [
    { label: "ERP System", type: "integration" }, { label: "Planning System", type: "integration" },
    { label: "Warehouse / WMS", type: "integration" }, { label: "Payment Gateway", type: "integration" },
  ]},
  { name: "Infrastructure", systems: [
    { label: "Managed Runtime (MRT)", type: "infra" }, { label: "CI/CD Pipeline", type: "infra" },
    { label: "Monitoring / APM", type: "infra" }, { label: "CDN / Edge", type: "infra" },
  ]},
];

// ---------- Effort ----------
export const EFFORT_DATA = [
  { label: "Unit Testing", pct: 18, color: "#2D5F8A", time: "2-3d/sprint", agenticTime: "< 0.5d" },
  { label: "Functional", pct: 28, color: "#6B4D8A", time: "3-5d/sprint", agenticTime: "< 1d" },
  { label: "Integration", pct: 22, color: "#2D7A65", time: "4-6d/release", agenticTime: "< 0.5d" },
  { label: "Performance", pct: 8, color: "#9A7B1C", time: "5-10d/release", agenticTime: "Continuous" },
  { label: "Security", pct: 7, color: "#A3425A", time: "2-4wk/quarter", agenticTime: "Every PR" },
  { label: "E2E Testing", pct: 14, color: "#B06A2D", time: "5-8d/release", agenticTime: "< 1d" },
  { label: "Accessibility", pct: 3, color: "#1E7A7A", time: "2-3d (when done)", agenticTime: "Every PR" },
];

// ---------- Shortcomings ----------
export const SHORTCOMINGS = [
  { title: "No Shift-Left Strategy", severity: "high" as const, desc: "Quality gates concentrated late. Defects found in E2E cost 10x to fix.", fix: "Unit, contract, security, a11y agents on every PR." },
  { title: "Manual Testing Dominance", severity: "high" as const, desc: "60%+ functional testing manual. Multi-market regression multiplies effort.", fix: "Functional Agent generates tests from Jira ACs. 90%+ automation." },
  { title: "Environment Instability", severity: "high" as const, desc: "Shared integration environments are #1 blocker. Teams wait days.", fix: "Service virtualisation in agent workflow. Zero env dependency." },
  { title: "No Contract Testing", severity: "high" as const, desc: "API contracts have no automated validation. Breaks found in E2E or prod.", fix: "Contract Agent maintains Pact tests between all service pairs." },
  { title: "Flaky E2E Suite", severity: "high" as const, desc: "30-40% flakiness. 4+ hour execution. Blocks releases.", fix: "Risk-based selection + self-healing. < 5% flakiness." },
  { title: "Security as Afterthought", severity: "high" as const, desc: "SAST/DAST not in CI/CD. Token exposure risks. Quarterly pen-tests.", fix: "Security Sentinel on every PR. Understands BFF/OAuth2 pattern." },
  { title: "Performance Not Continuous", severity: "medium" as const, desc: "Only pre-peak. No budgets in CI. Single engineer bottleneck.", fix: "Performance Guardian on every deploy. Budgets in CI." },
  { title: "Accessibility Gap", severity: "medium" as const, desc: "Not in DoD. No CI enforcement. Legal risk increasing.", fix: "A11y Agent in CI + CMS webhook. WCAG caught immediately." },
  { title: "Siloed QE Knowledge", severity: "medium" as const, desc: "QE expertise locked in individuals. Strategies differ per team.", fix: "Agent knowledge codified. Every team gets same intelligence." },
  { title: "Downstream Blind Spot", severity: "medium" as const, desc: "Testing stops at OMS. ERP, WMS integrations assumed correct.", fix: "Synthetic order tracer validates OMS → ERP → WMS." },
  { title: "No Observability-Driven QE", severity: "medium" as const, desc: "Production telemetry not used for test priorities.", fix: "Agents consume telemetry. Incidents inform test generation." },
  { title: "Multi-Market Complexity", severity: "high" as const, desc: "30+ markets tested through duplication, not parameterization.", fix: "All agents parameterise by locale. 30+ markets in parallel." },
];

// ---------- Heatmap ----------
export const HEATMAP = [
  { system: "PWA Storefront", unit: "M", func: "H", integ: "L", perf: "H", sec: "M", e2e: "H", a11y: "H" },
  { system: "Micro-Frontends", unit: "M", func: "M", integ: "H", perf: "M", sec: "L", e2e: "H", a11y: "H" },
  { system: "Kong Gateway", unit: "-", func: "-", integ: "H", perf: "H", sec: "H", e2e: "M", a11y: "-" },
  { system: "BFF Services", unit: "M", func: "M", integ: "H", perf: "M", sec: "H", e2e: "M", a11y: "-" },
  { system: "SFCC SCAPI", unit: "H", func: "M", integ: "H", perf: "H", sec: "H", e2e: "H", a11y: "-" },
  { system: "SCV", unit: "M", func: "M", integ: "H", perf: "M", sec: "H", e2e: "M", a11y: "-" },
  { system: "Bloomreach", unit: "-", func: "M", integ: "M", perf: "H", sec: "L", e2e: "M", a11y: "M" },
  { system: "Amplience CMS", unit: "-", func: "M", integ: "M", perf: "L", sec: "L", e2e: "M", a11y: "H" },
  { system: "IBM OMS", unit: "-", func: "H", integ: "H", perf: "H", sec: "M", e2e: "H", a11y: "-" },
  { system: "ERP / WMS", unit: "-", func: "-", integ: "H", perf: "M", sec: "L", e2e: "H", a11y: "-" },
  { system: "Payment PSP", unit: "-", func: "M", integ: "H", perf: "M", sec: "H", e2e: "H", a11y: "-" },
];

// ---------- Slides ----------
export { SLIDES } from './slides';
