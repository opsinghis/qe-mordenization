// ============================================================
// data/slides.ts — Workshop slideshow content
// ============================================================

import { QE_PHASES, SHORTCOMINGS } from './index';

export const SLIDES = [
  {
    id: "cover", layout: "cover",
    title: "Redefining Quality Engineering\nfor the Agentic Era",
    subtitle: "Pandora Global E-Commerce Platform",
    meta: "SDLC QE Transformation Workshop · 2026",
  },
  {
    id: "agenda", layout: "agenda",
    title: "Workshop Agenda",
    items: [
      { time: "09:00", label: "Context Setting", desc: "Architecture overview, current QE landscape, why now?" },
      { time: "09:45", label: "Current State Deep-Dive", desc: "7 QE phases — who, when, how long, what breaks" },
      { time: "10:30", label: "The Problem", desc: "12 critical shortcomings, effort distribution, bottlenecks" },
      { time: "11:15", label: "Break", desc: "" },
      { time: "11:30", label: "Agentic Vision", desc: "7 Claude Agents — one per QE phase, orchestrated" },
      { time: "12:30", label: "Deep-Dive: Agent Workflows", desc: "Concrete examples: bug fix, feature test, security scan" },
      { time: "13:00", label: "Lunch", desc: "" },
      { time: "14:00", label: "Discussion & Design", desc: "Agent architecture, trust model, human-in-the-loop" },
      { time: "15:30", label: "Roadmap & Next Steps", desc: "Phased adoption plan, quick wins, metrics" },
      { time: "16:00", label: "Close", desc: "" },
    ],
  },
  {
    id: "context", layout: "split",
    title: "Why Now?",
    left: {
      heading: "The Pandora Platform",
      points: [
        "Global e-commerce serving 30+ markets",
        "Complex architecture: MFEs, SCAPI, Kong, OMS, ERP, WMS",
        "Amplience CMS + Bloomreach Search layer",
        "Custom SCV for customer 360",
        "Peak events: Black Friday, Christmas, Valentine's",
      ],
    },
    right: {
      heading: "The QE Reality",
      points: [
        "60%+ manual testing across markets",
        "E2E takes 5-8 days per release",
        "30-40% test flakiness rate",
        "Security & accessibility are afterthoughts",
        "Single perf engineer for global platform",
      ],
    },
  },
  {
    id: "architecture", layout: "architecture",
    title: "Pandora Enterprise Architecture",
    subtitle: "The system landscape QE must cover",
  },
  {
    id: "problem-numbers", layout: "metrics",
    title: "The Problem in Numbers",
    metrics: [
      { value: "60%+", label: "Manual Testing", sub: "Still manual across markets" },
      { value: "5-8d", label: "Release Bottleneck", sub: "E2E blocks every release" },
      { value: "30-40%", label: "Flakiness Rate", sub: "E2E test reliability" },
      { value: "20-80%", label: "Coverage Variance", sub: "Across microservices" },
      { value: "Quarterly", label: "Security Scans", sub: "Not in CI/CD" },
      { value: "30+", label: "Markets", sub: "Tested via duplication" },
    ],
  },
  {
    id: "shortcomings-overview", layout: "shortcomings",
    title: "12 Critical Shortcomings",
    subtitle: "Mapped across all 7 QE phases",
    shortcomings: SHORTCOMINGS,
  },
  {
    id: "vision-intro", layout: "vision-intro",
    title: "The Agentic Vision",
    subtitle: "From manual execution to autonomous quality assurance",
    principles: [
      { num: 1, title: "Shift-Left by Default", desc: "Every agent activates at commit-time, not release-time" },
      { num: 2, title: "Context-Aware", desc: "Agents understand Pandora's domain, architecture, and requirements" },
      { num: 3, title: "Continuous & Autonomous", desc: "Quality runs continuously — not in gates" },
      { num: 4, title: "Human-in-the-Loop, Not in the Path", desc: "Humans govern outcomes. Agents handle the 90%." },
      { num: 5, title: "Cross-Phase Orchestration", desc: "Meta-agent coordinates. No redundant testing." },
    ],
  },
  {
    id: "agent-network", layout: "agent-network",
    title: "7 Specialised Agents",
    subtitle: "One per QE phase, coordinated by a QE Orchestrator",
    phases: QE_PHASES,
  },
  {
    id: "example-workflow", layout: "example",
    title: "Agent in Action: Bug Fix Workflow",
    subtitle: "How the unit test agent augments a developer — just like Claude Code",
    steps: QE_PHASES[0].agenticVision.example.steps,
  },
  {
    id: "gains", layout: "gains",
    title: "Transformation Impact",
    gains: [
      { metric: "Manual QE Effort", from: "60%+", to: "< 10%", icon: "↓" },
      { metric: "Release Validation", from: "5-8 days", to: "< 1 day", icon: "⚡" },
      { metric: "Security/A11y Testing", from: "Quarterly", to: "Every PR", icon: "🔒" },
      { metric: "E2E Flakiness", from: "30-40%", to: "< 5%", icon: "✓" },
      { metric: "Market Coverage", from: "2-3 tested", to: "30+ parallel", icon: "🌍" },
      { metric: "Defect Escape Rate", from: "High (found in prod)", to: "Near-zero", icon: "🛡" },
    ],
  },
  {
    id: "discussion", layout: "discussion",
    title: "Discussion Topics",
    topics: [
      { question: "Agent Trust Model", prompt: "How do we validate agent outputs? What's the approval threshold?" },
      { question: "Knowledge Backbone", prompt: "Where does shared context live? Jira, Confluence, codebase?" },
      { question: "Adoption Sequence", prompt: "Which agents deliver quick wins? Unit test + security on PRs?" },
      { question: "Metrics That Matter", prompt: "Move from coverage % → defect escape rate, agent accuracy, MTTQ" },
      { question: "Governance & Ownership", prompt: "Who owns agent behaviour? How do we audit? Rollback plan?" },
      { question: "Multi-Market Strategy", prompt: "How do agents handle 30+ market variations?" },
    ],
  },
  {
    id: "roadmap", layout: "roadmap",
    title: "Phased Adoption Roadmap",
    phases: [
      { phase: "Phase 1 — Quick Wins", timeline: "Month 1-2", items: ["Unit test generation on PRs", "SAST + dependency scanning in CI", "A11y linting on component PRs", "Performance budgets (Lighthouse CI)"] },
      { phase: "Phase 2 — Foundation", timeline: "Month 3-5", items: ["Functional test generation from Jira ACs", "Contract testing (Pact)", "Service virtualisation for SCAPI/OMS", "Kong config regression testing"] },
      { phase: "Phase 3 — Orchestration", timeline: "Month 6-9", items: ["Cross-phase agent coordination", "Risk-based E2E test selection", "Self-healing test infrastructure", "Production telemetry → test priorities"] },
      { phase: "Phase 4 — Autonomous", timeline: "Month 10-12", items: ["Fully agentic QE with human oversight", "Autonomous order lifecycle validation", "Continuous WCAG compliance", "QE Orchestrator managing all 7 agents"] },
    ],
  },
  {
    id: "close", layout: "cover",
    title: "Let's Build the Future\nof Quality Engineering",
    subtitle: "From testing software to governing quality outcomes",
    meta: "Pandora Global Platform · Agentic QE Transformation",
  },
];
