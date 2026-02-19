'use client';

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// DATA LAYER
// ============================================================

const ARCHITECTURE_LAYERS = [
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

const QE_PHASES = [
  {
    id: 1, title: "Unit Testing", subtitle: "Component-level code validation across microservices and micro-frontends",
    color: "#2D5F8A", colorLight: "#E1EDF7",
    when: "During development — each sprint, per commit/PR",
    who: "Developers (FE & BE), Tech Leads review coverage",
    objective: "Validate individual functions, components, hooks, and service methods in isolation. Ensure logic correctness for cart calculations, pricing rules, SCAPI wrappers, SCV transforms.",
    duration: "~15-20% of dev time per sprint (2-3 days/sprint across teams)",
    systems: ["PWA Storefront", "Micro-Frontends", "BFF Microservices", "SCAPI Wrappers", "SCV Service", "Cart/Checkout Logic"],
    shortcomings: [
      "Inconsistent coverage across microservices — some at 80%, others at 20%",
      "Mocking SCAPI / SCV responses is brittle and often outdated",
      "No mutation testing — high coverage doesn't mean strong tests",
      "MFE unit tests don't account for cross-MFE state interactions",
      "Salesforce Commerce cartridge code is often untested entirely",
    ],
    agenticVision: {
      agent: "Unit Test Agent", trigger: "Every code commit / PR creation",
      howItWorks: [
        "Developer commits code → Claude Agent analyses the diff in context of the full service",
        "Agent understands the Pandora domain model (cart rules, pricing, SCAPI contracts) from codebase + Confluence docs",
        "Auto-generates unit tests for new/changed functions with edge cases specific to e-commerce logic",
        "Runs mutation testing to validate test strength, not just coverage",
        "Updates existing tests when implementation changes (self-healing mocks for SCAPI/SCV)",
        "Posts test coverage delta + mutation score directly on the PR as a review comment",
      ],
      humanRole: "Developer reviews agent-generated tests for business logic accuracy. Tech lead sets coverage thresholds per service.",
      tools: ["Claude Code (CLI agent)", "Jest / Vitest", "Stryker (mutation testing)", "GitHub Actions"],
      gains: [
        { metric: "Coverage consistency", from: "20-80%", to: "85%+ all services" },
        { metric: "Time spent", from: "2-3 days/sprint", to: "< 0.5 days (review)" },
        { metric: "Mock freshness", from: "Manual, often stale", to: "Auto-synced from schema" },
        { metric: "Mutation score", from: "Not measured", to: "70%+ enforced" },
      ],
      example: {
        title: "Bug Fix: Cart Price Calculation Error",
        steps: [
          { actor: "developer", text: "Identifies bug: VAT not applied correctly for DE market in cart total" },
          { actor: "agent", text: "Analyses cart-service/pricing.ts, identifies tax calculation function, cross-references with SCAPI tax API contract" },
          { actor: "agent", text: "Generates fix: updates applyMarketTax() to use locale config, not hardcoded value" },
          { actor: "agent", text: "Auto-generates 12 unit tests: DE standard rate, DE reduced rate, cross-border EU, zero-rated items, rounding edge cases, null locale fallback" },
          { actor: "agent", text: "Runs mutation testing — kills 11/12 mutants, flags one surviving boundary condition" },
          { actor: "developer", text: "Reviews, adds the missing boundary test, approves PR" },
        ],
      },
    },
  },
  {
    id: 2, title: "Functional Testing", subtitle: "Feature-level verification against business requirements and acceptance criteria",
    color: "#6B4D8A", colorLight: "#EDE6F5",
    when: "Mid-sprint after feature development, before PR merge to main",
    who: "QE Engineers (manual + automated), Business Analysts validate edge cases",
    objective: "Verify complete user features: PDP/PLP rendering with Bloomreach, Amplience content slots, cart rules, checkout flows including payment, promo/voucher logic, account management via SCV.",
    duration: "~25-30% of QE effort per sprint (3-5 days)",
    systems: ["PWA Storefront", "Bloomreach Search", "Amplience CMS", "SCAPI", "SCV", "IBM OMS"],
    shortcomings: [
      "Heavy reliance on manual testing — 60%+ still manual across markets",
      "Test cases not systematically derived from Jira stories/ACs",
      "Bloomreach & Amplience content combinations create exponential test matrices",
      "Multi-market/locale testing is copy-paste rather than parameterized",
      "No service virtualization — dependent on shared environments being stable",
    ],
    agenticVision: {
      agent: "Functional QE Agent", trigger: "Jira story moves to 'Ready for Test' / feature branch merged",
      howItWorks: [
        "Agent reads the Jira story, acceptance criteria, linked Confluence specs, and Figma designs",
        "Generates a test plan with scenarios derived directly from ACs — no manual test case writing",
        "Creates Playwright test scripts that navigate the PWA like a real user",
        "Understands Amplience content model — tests content slot rendering across CMS variations",
        "Parameterizes tests across markets (UK, DE, FR, US) using locale config, not duplicated scripts",
        "Uses service virtualization to mock unstable dependencies (SCAPI sandbox, OMS staging)",
      ],
      humanRole: "QE engineer validates edge cases the agent might miss. BA confirms business logic interpretation.",
      tools: ["Claude Agent + Jira/Confluence MCP", "Playwright", "WireMock / Prism", "Allure reporting"],
      gains: [
        { metric: "Manual testing", from: "60%+ manual", to: "< 10% (exploratory only)" },
        { metric: "Test case creation", from: "3-5 days/sprint", to: "Auto-generated in minutes" },
        { metric: "Market coverage", from: "2-3 markets tested", to: "All 30+ parameterized" },
        { metric: "Env dependency", from: "Blocks 1-2 days/sprint", to: "Virtualized, zero blocks" },
      ],
      example: {
        title: "New Feature: Gift Wrapping at Checkout",
        steps: [
          { actor: "agent", text: "Reads JIRA story PAN-4521: 'As a customer, I can add gift wrapping for £3.50 / €4.00 / $4.50'" },
          { actor: "agent", text: "Extracts ACs: toggle on/off, price by market, gift message (max 150 chars), reflects in total, persists through payment" },
          { actor: "agent", text: "Generates 28 scenarios: happy path × 6 markets, boundary (151 chars), special characters, gift wrap + promo code interaction, removal, local currency display" },
          { actor: "agent", text: "Creates Playwright scripts with page object model matching Pandora's MFE component structure" },
          { actor: "agent", text: "Executes against virtualized SCAPI/OMS — no environment wait. All 28 scenarios in 4 minutes." },
          { actor: "human", text: "QE engineer does 15-min exploratory session: tests gift wrap with engraving combo. Finds UI overlap. Logs bug." },
        ],
      },
    },
  },
  {
    id: 3, title: "Integration Testing", subtitle: "Contract and data-flow verification between services, APIs, and third-party systems",
    color: "#2D7A65", colorLight: "#DDF1EA",
    when: "Post-merge to integration branch, during system integration phase",
    who: "QE Engineers, Backend Developers, Integration/Platform team",
    objective: "Validate data contracts between MFEs ↔ BFF ↔ Kong ↔ SCAPI ↔ OMS ↔ ERP. Ensure order payloads reach downstream correctly. Verify SCV enrichment, Bloomreach indexing, Amplience webhooks.",
    duration: "~20-25% of QE cycle (4-6 days per release, often blocks E2E)",
    systems: ["Kong Gateway", "BFF Services", "SCAPI", "IBM OMS", "ERP", "WMS", "SCV", "Bloomreach", "Amplience", "Payment PSP"],
    shortcomings: [
      "No contract testing (Pact or similar) — API breaks caught in E2E, not here",
      "Shared integration environments are unstable and frequently broken",
      "OMS → ERP → WMS chain tested only via manual spot checks",
      "Kong Gateway routing changes not regression-tested systematically",
      "Cross-market integration (multi-currency, tax engine) under-tested",
    ],
    agenticVision: {
      agent: "Contract & Integration Agent", trigger: "Any API schema change, service deployment, or Kong config update",
      howItWorks: [
        "Monitors all API schemas (OpenAPI specs, SCAPI definitions, OMS contracts)",
        "Auto-generates and maintains Pact contract tests between every service pair",
        "When a producer changes their API, immediately validates all consumer contracts",
        "Monitors Kong config changes — auto-tests routing, auth, rate limiting after updates",
        "Traces order payloads end-to-end: PWA → BFF → SCAPI → OMS → ERP → WMS",
        "Creates synthetic test orders that exercise the full downstream chain",
      ],
      humanRole: "Platform team reviews contract violation alerts. Integration architect approves schema evolution.",
      tools: ["Claude Agent + Schema Registry", "Pact Broker", "Kong Admin API", "Synthetic order generator"],
      gains: [
        { metric: "Contract breaks", from: "Found in E2E (days late)", to: "Caught in minutes" },
        { metric: "Env blocks", from: "1-2 days/sprint", to: "Zero — tests run locally" },
        { metric: "Downstream validation", from: "Manual spot checks", to: "Automated payload trace" },
        { metric: "Kong regression", from: "Not tested", to: "Every config change" },
      ],
      example: {
        title: "SCAPI Version Upgrade Breaks Cart Service",
        steps: [
          { actor: "agent", text: "Detects SCAPI schema update: basket endpoint nests 'adjustments' under 'priceInfo' instead of top-level" },
          { actor: "agent", text: "Runs contract tests for all SCAPI consumers: Cart BFF, Checkout BFF, Promo Service, Analytics" },
          { actor: "agent", text: "Cart BFF contract FAILS — expects adjustments at top level. Identifies exact line in cart-bff/scapi-client.ts" },
          { actor: "agent", text: "Generates fix PR with updated response mapping + updated contract + updated unit tests" },
          { actor: "developer", text: "Reviews the auto-generated fix, validates business logic, merges" },
          { actor: "agent", text: "Re-runs all contracts — all green. Triggers synthetic order to verify end-to-end payload integrity" },
        ],
      },
    },
  },
  {
    id: 4, title: "Performance Testing", subtitle: "Load, stress, and scalability validation for peak traffic and global reach",
    color: "#9A7B1C", colorLight: "#FBF3DD",
    when: "Pre-release / pre-peak events (Black Friday, Xmas). Rarely in-sprint.",
    who: "Dedicated Perf Engineer (often 1 person), Platform/Infra team supports",
    objective: "Validate MRT scalability under global peak load. Stress test SCAPI rate limits, Kong throughput, OMS order processing, Bloomreach search concurrency, CDN cache hit ratios.",
    duration: "~5-10 days per major release (sporadic, not continuous)",
    systems: ["MRT / CDN", "Kong Gateway", "SCAPI", "Bloomreach Search", "IBM OMS", "Payment PSP", "SCV"],
    shortcomings: [
      "Performance testing is event-driven (pre-peak) not continuous",
      "No production-like traffic replay — synthetic scripts don't match real patterns",
      "SCAPI rate limit behaviour under load not well understood",
      "MFE bundle performance (LCP, CLS, FID) not part of perf test suite",
      "No performance budget enforcement in CI/CD pipeline",
      "Single perf engineer = single point of failure for entire global platform",
    ],
    agenticVision: {
      agent: "Performance Guardian Agent", trigger: "Every deployment + continuous baseline + pre-peak auto-ramp",
      howItWorks: [
        "Continuously monitors production traffic patterns, builds realistic load profiles per market",
        "On every deployment, runs performance regression against key journeys (PDP, Search, Checkout)",
        "Enforces performance budgets in CI: blocks deploys that regress LCP > 200ms or bundle size > 5%",
        "Before peak events, auto-generates load scripts from last year's traffic + projected growth",
        "Monitors SCAPI rate limits in real-time, alerts before throttling, suggests caching strategies",
        "Correlates performance anomalies to specific code changes using deployment metadata",
      ],
      humanRole: "Perf engineer sets budgets and reviews anomaly reports. Platform team acts on scaling recommendations.",
      tools: ["Claude Agent + APM integration", "k6 / Gatling", "Lighthouse CI", "Production traffic replay"],
      gains: [
        { metric: "Testing frequency", from: "Pre-peak only (2-3x/yr)", to: "Every deployment" },
        { metric: "Regression detection", from: "Found in production", to: "Blocked in CI" },
        { metric: "Load profile accuracy", from: "Synthetic/guessed", to: "Traffic replay" },
        { metric: "Web Vitals", from: "Not measured", to: "LCP/CLS/FID budgets in CI" },
      ],
      example: {
        title: "Black Friday Readiness — Automated Load Prep",
        steps: [
          { actor: "agent", text: "4 weeks before BF: analyses last year's traffic — peak 12,000 RPM, 65% mobile, top journeys: Search → PDP → Cart → Checkout" },
          { actor: "agent", text: "Generates k6 load scripts matching real traffic distribution, applies 1.4x growth factor" },
          { actor: "agent", text: "Runs graduated test: 25% → 50% → 75% → 100% → 120%. SCAPI starts throttling at 85%." },
          { actor: "agent", text: "Recommends: increase SCAPI caching TTL from 60s to 300s, pre-warm Bloomreach, add CDN edge rule for static PLP pages" },
          { actor: "human", text: "Platform team implements. Agent re-runs — throttling eliminated. Passes at 130% projected peak." },
          { actor: "agent", text: "Sets up real-time monitoring dashboard for BF with auto-alerting thresholds from load test baselines" },
        ],
      },
    },
  },
  {
    id: 5, title: "Security Testing", subtitle: "Vulnerability assessment, auth flows, token management, and compliance",
    color: "#A3425A", colorLight: "#F7E4EA",
    when: "Quarterly pen-tests, ad-hoc SAST scans, pre-release security review",
    who: "InfoSec team (external to QE), Developers fix findings, Security Champions",
    objective: "Validate OAuth2 token handling (Kong → SCAPI), prevent client-side token exposure, OWASP Top 10, PCI-DSS compliance for payments, API abuse prevention, dependency vulnerabilities.",
    duration: "~2-4 weeks per quarter (external pen-test) + sporadic SAST runs",
    systems: ["Kong Gateway", "OAuth2 / Auth", "SCAPI", "Payment PSP", "PWA Storefront", "BFF Services", "SCV (PII data)"],
    shortcomings: [
      "SAST/DAST not integrated into CI/CD — runs ad-hoc or quarterly",
      "Client-side token exposure risk in PWA (BFF pattern addresses this)",
      "Dependency vulnerability scanning is passive — no automated blocking",
      "PCI scope across microservices not clearly mapped or continuously tested",
      "SCV stores PII across markets — GDPR/data residency testing is manual",
      "Kong Gateway security policies not regression-tested after config changes",
    ],
    agenticVision: {
      agent: "Security Sentinel Agent", trigger: "Every commit (SAST), every deploy (DAST), every dependency update",
      howItWorks: [
        "Runs contextual SAST on every PR — understands Pandora's auth model (SLAS tokens, Kong OAuth2 BFF pattern)",
        "Knows the threat model: client-side token exposure is HIGH, SCAPI credential leaks are CRITICAL",
        "Auto-validates Kong security policies after any config change — auth plugins, rate limiting, CORS",
        "Scans dependencies on every build — blocks deployment if critical CVE found",
        "Runs DAST against staging after each deployment — OWASP Top 10 for e-commerce",
        "Monitors SCV data flows for PII exposure — validates GDPR compliance per market",
      ],
      humanRole: "Security Champions review HIGH/CRITICAL findings. InfoSec manages threat model updates.",
      tools: ["Claude Agent + Semgrep/CodeQL", "OWASP ZAP", "Snyk / Dependabot", "Kong policy validator"],
      gains: [
        { metric: "SAST frequency", from: "Quarterly", to: "Every PR" },
        { metric: "MTTD vulnerabilities", from: "Weeks/months", to: "Minutes" },
        { metric: "Dependency blocking", from: "Passive alerts", to: "Auto-blocks builds" },
        { metric: "PCI/GDPR", from: "Annual audit", to: "Continuous validation" },
      ],
      example: {
        title: "Detecting Token Exposure in New MFE",
        steps: [
          { actor: "developer", text: "Creates new 'Wishlist' MFE that calls custom wishlist microservice via Kong" },
          { actor: "agent", text: "SAST detects: developer passing SLAS token directly to Kong endpoint instead of BFF pattern" },
          { actor: "agent", text: "Flags HIGH severity: 'Token exposure — SLAS token sent to Kong violates BFF security pattern'" },
          { actor: "agent", text: "Generates fix: route calls through MRT SSR layer using Kong OAuth2 client credentials (references cart-service BFF as template)" },
          { actor: "developer", text: "Applies the BFF pattern fix. Agent re-scans — passes." },
          { actor: "agent", text: "DAST validates: token not visible in browser network tab, Kong only accepts client_credentials grant" },
        ],
      },
    },
  },
  {
    id: 6, title: "End-to-End Testing", subtitle: "Full journey validation from storefront through to downstream fulfilment",
    color: "#B06A2D", colorLight: "#FBEEDD",
    when: "Release candidate phase, regression before deployment to production",
    who: "QE Engineers (lead), Business SMEs for UAT, Market teams",
    objective: "Validate complete journeys: Browse → PDP → Cart → Checkout → Payment → Order Confirmation → OMS → ERP/WMS. Across all target markets.",
    duration: "~5-8 days per release cycle (often the bottleneck)",
    systems: ["All systems end-to-end", "Every integration point", "All target markets"],
    shortcomings: [
      "E2E suite takes 4+ hours to run — too slow for CI feedback",
      "30-40% flakiness due to environment instability and timing",
      "Duplicates coverage done at lower levels",
      "Multi-market E2E = multiplied execution, not smart parameterization",
      "No visual regression — UI breaks caught by humans not tools",
      "Order lifecycle E2E stops at OMS — downstream assumed correct",
    ],
    agenticVision: {
      agent: "Journey Orchestrator Agent", trigger: "Release candidate created / on-demand for critical path validation",
      howItWorks: [
        "Understands Pandora's critical customer journeys — intent-based, not page-by-page scripts",
        "Risk-based test selection: analyses what changed → only runs E2E for affected journeys",
        "Navigates PWA autonomously like a real customer — adapts to UI changes",
        "Runs visual regression comparing screenshots against approved baselines per market",
        "Validates FULL order lifecycle including downstream: OMS → ERP → WMS allocation",
        "Self-heals: retries flaky failures with diagnostic context",
      ],
      humanRole: "QE lead defines critical journeys. Business SMEs do targeted exploratory on new features only.",
      tools: ["Claude Agent + Browser automation", "Playwright (adaptive)", "Percy/Applitools", "Synthetic order tracer"],
      gains: [
        { metric: "Suite execution", from: "4+ hours", to: "< 45 min (risk-based)" },
        { metric: "Flakiness", from: "30-40%", to: "< 5% (self-healing)" },
        { metric: "Release bottleneck", from: "5-8 days", to: "< 1 day" },
        { metric: "Visual regression", from: "Manual / none", to: "Automated per market" },
      ],
      example: {
        title: "Release Candidate — Smart E2E Validation",
        steps: [
          { actor: "agent", text: "Analyses release PAN-R47: 14 stories. Impact: checkout changed (gift wrap), search ranking updated, DE tax modified." },
          { actor: "agent", text: "Selects 6 critical journeys (not 40): Checkout with gift wrap (UK,DE), Search → PDP → Cart, DE tax, Payment regression" },
          { actor: "agent", text: "Executes autonomously — handles pop-ups, cookie banners, locale switches. Screenshots at each step." },
          { actor: "agent", text: "Visual regression: gift wrap option misaligned on mobile DE. Logs P2 with screenshot comparison." },
          { actor: "agent", text: "Places synthetic orders through full chain: PWA → SCAPI → OMS → ERP. Order reaches 'Allocated' in WMS within 2 min." },
          { actor: "human", text: "QE lead reviews: 5/6 passed, 1 visual bug logged. 35-minute total execution. Signs off release." },
        ],
      },
    },
  },
  {
    id: 7, title: "Accessibility Testing", subtitle: "WCAG compliance and inclusive experience across all touchpoints",
    color: "#1E7A7A", colorLight: "#DCF2F2",
    when: "Often late-stage or post-launch audit. Rarely in sprint.",
    who: "A11y specialist (if available), QE engineers (limited expertise), external auditors",
    objective: "WCAG 2.1 AA compliance: keyboard nav, screen reader, colour contrast, form labels, ARIA on MFE components, Amplience content accessibility, Bloomreach search results.",
    duration: "~2-3 days per release (when done) + annual external audit",
    systems: ["PWA Storefront", "Micro-Frontends", "Amplience CMS content", "Bloomreach Search UI"],
    shortcomings: [
      "Treated as an afterthought — not part of Definition of Done",
      "No automated a11y testing in CI/CD pipeline",
      "MFE teams have no a11y standards or shared component library enforcement",
      "Amplience content authors create inaccessible content unknowingly",
      "Screen reader testing is ad-hoc, often skipped entirely",
      "Legal/compliance risk increasing — reactive not proactive",
    ],
    agenticVision: {
      agent: "Accessibility Guardian Agent", trigger: "Every PR (component-level), every deploy (page-level), every CMS publish",
      howItWorks: [
        "Runs axe-core + custom Pandora a11y rules on every PR touching UI components",
        "Validates MFE shared component library: ARIA patterns, keyboard nav, focus management",
        "When Amplience content published, scans rendered output for a11y: alt text, headings, contrast",
        "Simulates screen reader navigation on critical journeys after each deployment",
        "Tracks WCAG compliance score per page/market over time — catches regressions",
        "Generates remediation guidance specific to React/PWA patterns in Pandora's codebase",
      ],
      humanRole: "A11y specialist sets standards and reviews complex interactions. Content team trained on flagged patterns.",
      tools: ["Claude Agent + axe-core", "Lighthouse A11y", "Screen reader simulation", "CMS webhook integration"],
      gains: [
        { metric: "In Definition of Done", from: "No", to: "Enforced via CI gate" },
        { metric: "WCAG violations", from: "Annual audit (late)", to: "Real-time per PR" },
        { metric: "CMS compliance", from: "Not checked", to: "Validated on publish" },
        { metric: "Legal risk", from: "Reactive", to: "Proactive, continuous" },
      ],
      example: {
        title: "CMS Author Publishes Inaccessible Banner",
        steps: [
          { actor: "human", text: "Content author publishes Valentine's banner in Amplience: decorative image with no alt text, pink text on light background" },
          { actor: "agent", text: "Amplience webhook triggers scan: flags missing alt text (WCAG 1.1.1) and contrast ratio 2.8:1 (needs 4.5:1)" },
          { actor: "agent", text: "Slack notification: exact issue, WCAG reference, suggested fix ('Add alt text: …', 'Change text to #9B1B30 for 4.6:1 ratio')" },
          { actor: "human", text: "Content author updates banner with fixes" },
          { actor: "agent", text: "Re-scans on publish — passes. Updates compliance dashboard. Banner goes live." },
        ],
      },
    },
  },
];

const EFFORT_DATA = [
  { label: "Unit Testing", pct: 18, color: "#2D5F8A", time: "2-3d/sprint", agenticTime: "< 0.5d" },
  { label: "Functional", pct: 28, color: "#6B4D8A", time: "3-5d/sprint", agenticTime: "< 1d" },
  { label: "Integration", pct: 22, color: "#2D7A65", time: "4-6d/release", agenticTime: "< 0.5d" },
  { label: "Performance", pct: 8, color: "#9A7B1C", time: "5-10d/release", agenticTime: "Continuous" },
  { label: "Security", pct: 7, color: "#A3425A", time: "2-4wk/quarter", agenticTime: "Every PR" },
  { label: "E2E Testing", pct: 14, color: "#B06A2D", time: "5-8d/release", agenticTime: "< 1d" },
  { label: "Accessibility", pct: 3, color: "#1E7A7A", time: "2-3d (when done)", agenticTime: "Every PR" },
];

const SHORTCOMINGS = [
  { title: "No Shift-Left Strategy", severity: "high", desc: "Quality gates concentrated late. Defects found in E2E cost 10x to fix.", fix: "Unit, contract, security, a11y agents on every PR. Quality starts at commit." },
  { title: "Manual Testing Dominance", severity: "high", desc: "60%+ functional testing manual. Multi-market regression multiplies effort linearly.", fix: "Functional Agent generates tests from Jira ACs. 90%+ automation." },
  { title: "Environment Instability", severity: "high", desc: "Shared integration environments are #1 blocker. Teams wait days.", fix: "Service virtualisation built into agent workflow. Zero env dependency." },
  { title: "No Contract Testing", severity: "high", desc: "API contracts between MFEs, BFF, Kong, SCAPI, OMS have no automated validation.", fix: "Contract Agent maintains Pact tests between all service pairs." },
  { title: "Flaky E2E Suite", severity: "high", desc: "30-40% flakiness. 4+ hour execution. Blocks releases.", fix: "Risk-based selection + self-healing + adaptive selectors. < 5% flakiness." },
  { title: "Security as Afterthought", severity: "high", desc: "SAST/DAST not in CI/CD. Token exposure risks. Quarterly pen-tests.", fix: "Security Sentinel on every PR. Understands BFF/OAuth2 pattern." },
  { title: "Performance Not Continuous", severity: "medium", desc: "Only pre-peak. No budgets in CI. Single engineer bottleneck.", fix: "Performance Guardian on every deploy. Budgets enforced in CI." },
  { title: "Accessibility Gap", severity: "medium", desc: "Not in DoD. No CI enforcement. Legal risk increasing.", fix: "A11y Agent in CI + CMS webhook. WCAG violations caught immediately." },
  { title: "Siloed QE Knowledge", severity: "medium", desc: "QE expertise locked in individuals. Strategies differ per team.", fix: "Agent knowledge is codified. Every team gets the same intelligence." },
  { title: "Downstream Blind Spot", severity: "medium", desc: "Testing stops at OMS. ERP, WMS integrations assumed correct.", fix: "Synthetic order tracer validates full chain: OMS → ERP → WMS." },
  { title: "No Observability-Driven QE", severity: "medium", desc: "Production telemetry not used to inform test priorities.", fix: "Agents consume production telemetry. Incidents inform test generation." },
  { title: "Multi-Market Complexity", severity: "high", desc: "30+ markets tested through duplication, not parameterization.", fix: "All agents parameterise by market/locale. 30+ markets in parallel." },
];

const HEATMAP = [
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

// ============================================================
// SLIDES DATA
// ============================================================

const SLIDES = [
  {
    id: "cover",
    layout: "cover",
    title: "Redefining Quality Engineering\nfor the Agentic Era",
    subtitle: "Pandora Global E-Commerce Platform",
    meta: "SDLC QE Transformation Workshop · 2026",
  },
  {
    id: "agenda",
    layout: "agenda",
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
    id: "context",
    layout: "split",
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
    id: "architecture",
    layout: "architecture",
    title: "Pandora Enterprise Architecture",
    subtitle: "The system landscape QE must cover",
  },
  {
    id: "problem-numbers",
    layout: "metrics",
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
    id: "shortcomings-overview",
    layout: "shortcomings",
    title: "12 Critical Shortcomings",
    subtitle: "Mapped across all 7 QE phases",
  },
  {
    id: "vision-intro",
    layout: "vision-intro",
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
    id: "agent-network",
    layout: "agent-network",
    title: "7 Specialised Agents",
    subtitle: "One per QE phase, coordinated by a QE Orchestrator",
  },
  {
    id: "example-workflow",
    layout: "example",
    title: "Agent in Action: Bug Fix Workflow",
    subtitle: "How the unit test agent augments a developer — just like Claude Code",
    steps: QE_PHASES[0].agenticVision.example.steps,
  },
  {
    id: "gains",
    layout: "gains",
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
    id: "discussion",
    layout: "discussion",
    title: "Discussion Topics",
    topics: [
      { question: "Agent Trust Model", prompt: "How do we validate agent outputs? What's the approval threshold? When must a human review?" },
      { question: "Knowledge Backbone", prompt: "Where does shared context live? Jira, Confluence, codebase? How do agents learn Pandora's domain?" },
      { question: "Adoption Sequence", prompt: "Which agents deliver quick wins? Unit test + security on PRs? Or E2E self-healing first?" },
      { question: "Metrics That Matter", prompt: "Move from coverage % → defect escape rate, agent accuracy, human intervention rate, MTTQ (mean time to quality signal)" },
      { question: "Governance & Ownership", prompt: "Who owns agent behaviour? How do we audit decisions? What's the rollback plan?" },
      { question: "Multi-Market Strategy", prompt: "How do agents handle 30+ market variations? Locale-aware test generation vs parameterization?" },
    ],
  },
  {
    id: "roadmap",
    layout: "roadmap",
    title: "Phased Adoption Roadmap",
    phases: [
      { phase: "Phase 1 — Quick Wins", timeline: "Month 1-2", items: ["Unit test generation on PRs (Claude Code)", "SAST + dependency scanning in CI", "A11y linting on component PRs", "Performance budgets (Lighthouse CI)"] },
      { phase: "Phase 2 — Foundation", timeline: "Month 3-5", items: ["Functional test generation from Jira ACs", "Contract testing (Pact) between all services", "Service virtualisation for SCAPI/OMS", "Kong config regression testing"] },
      { phase: "Phase 3 — Orchestration", timeline: "Month 6-9", items: ["Cross-phase agent coordination", "Risk-based E2E test selection", "Self-healing test infrastructure", "Production telemetry → test priorities"] },
      { phase: "Phase 4 — Autonomous", timeline: "Month 10-12", items: ["Fully agentic QE with human oversight", "Autonomous order lifecycle validation", "Continuous WCAG compliance", "QE Orchestrator managing all 7 agents"] },
    ],
  },
  {
    id: "close",
    layout: "cover",
    title: "Let's Build the Future\nof Quality Engineering",
    subtitle: "From testing software to governing quality outcomes",
    meta: "Pandora Global Platform · Agentic QE Transformation",
  },
];

// ============================================================
// STYLE TOKENS
// ============================================================

const T = {
  bg: "#F5F3EE",
  surface: "#FFFFFF",
  surfaceAlt: "#EDEAE4",
  border: "#DDD9D1",
  borderStrong: "#C5C0B6",
  text: "#1C1B18",
  textSec: "#65625A",
  textMuted: "#9A968C",
  accent: "#4A3ABA",
  accentLight: "#EDE9FF",
  accentBorder: "#D4CCFC",
  rose: "#A3425A",
  green: "#2D7A65",
  amber: "#9A7B1C",
  blue: "#2D5F8A",
  radius: 14,
  radiusSm: 10,
  font: "'Outfit', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const chipColors = {
  frontend: { bg: "#E1EDF7", text: "#2D5F8A", border: "#C0D6EA" },
  api: { bg: "#EDE6F5", text: "#6B4D8A", border: "#D4C8E8" },
  commerce: { bg: "#F7E4EA", text: "#A3425A", border: "#E8CBD5" },
  content: { bg: "#FBF3DD", text: "#9A7B1C", border: "#E8DDB0" },
  data: { bg: "#DDF1EA", text: "#2D7A65", border: "#B4DDD0" },
  integration: { bg: "#FBEEDD", text: "#B06A2D", border: "#E8D5B8" },
  infra: { bg: "#DCF2F2", text: "#1E7A7A", border: "#B0DEDE" },
};

const heatColors = { H: { bg: "#FECACA", text: "#991B1B" }, M: { bg: "#FEF3C7", text: "#92400E" }, L: { bg: "#D1FAE5", text: "#065F46" }, "-": { bg: T.surfaceAlt, text: T.textMuted } };
const heatLabels = { H: "High", M: "Med", L: "Low", "-": "—" };

// ============================================================
// SHARED COMPONENTS
// ============================================================

const Chip = ({ label, type }) => {
  const c = chipColors[type] || chipColors.frontend;
  return <span style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>{label}</span>;
};

const SectionLabel = ({ children, color }: { children: any; color?: any }) => (
  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: color || T.textMuted, fontWeight: 700, marginBottom: 14 }}>{children}</div>
);

const Card = ({ children, style, onClick }: { children: any; style?: any; onClick?: any }) => (
  <div onClick={onClick} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden", transition: "all 0.25s", cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
);

const AgentBadge = ({ label }) => (
  <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: T.accentLight, color: T.accent, border: `1px solid ${T.accentBorder}` }}>{label}</span>
);

// ============================================================
// ARCHITECTURE COMPONENT
// ============================================================

const ArchitectureLayers = () => (
  <div style={{ background: T.border, borderRadius: T.radius, overflow: "hidden", border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 2 }}>
    {ARCHITECTURE_LAYERS.map((layer, i) => (
      <div key={i}>
        {i > 0 && <div style={{ display: "flex", justifyContent: "center", padding: 3, background: T.surfaceAlt }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M4 9l4 4 4-4" stroke={T.textMuted} strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>}
        <div style={{ background: T.surface, padding: "16px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: T.textMuted, fontWeight: 700, minWidth: 120 }}>{layer.name}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {layer.systems.map((s, j) => <Chip key={j} label={s.label} type={s.type} />)}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ============================================================
// PHASE CARD COMPONENT
// ============================================================

const PhaseCard = ({ phase, isVision, expanded, onToggle }) => {
  const v = phase.agenticVision;
  return (
    <Card style={{ gridColumn: expanded ? "1 / -1" : undefined, boxShadow: expanded ? "0 12px 40px rgba(0,0,0,0.08)" : undefined, borderColor: expanded ? T.borderStrong : T.border }} onClick={onToggle}>
      {/* Header */}
      <div style={{ padding: "20px 22px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: phase.colorLight, color: phase.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{phase.id}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, marginBottom: 3 }}>{phase.title}</div>
          <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.5 }}>{phase.subtitle}</div>
        </div>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.3s", transform: expanded ? "rotate(180deg)" : "none" }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      {/* Meta row */}
      <div style={{ padding: "0 22px 16px", display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11, color: T.textSec }} onClick={e => e.stopPropagation()}>
        <span>⏱ {phase.duration.split("(")[0].trim()}</span>
        <span>👤 {phase.who.split(",")[0]}</span>
        <span style={{ padding: "2px 8px", background: "#FEF2F2", color: "#B91C1C", borderRadius: 4, fontWeight: 600 }}>⚠ {phase.shortcomings.length} issues</span>
      </div>
      {/* Expanded detail */}
      {expanded && (
        <div onClick={e => e.stopPropagation()}>
          {/* Current state detail */}
          <div style={{ borderTop: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {[
              { label: "⏱ When", content: phase.when },
              { label: "👤 Who", content: phase.who },
              { label: "🎯 Objective", content: phase.objective },
              { label: "⏳ Duration", content: phase.duration },
            ].map((item, i) => (
              <div key={i} style={{ padding: 20, borderRight: i % 2 === 0 ? `1px solid ${T.border}` : "none", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: T.textMuted, fontWeight: 700, marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{item.content}</div>
              </div>
            ))}
            <div style={{ padding: 20, borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: T.textMuted, fontWeight: 700, marginBottom: 8 }}>Systems Touched</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {phase.systems.map((s, i) => <span key={i} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: T.surfaceAlt, color: T.textSec }}>{s}</span>)}
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#B91C1C", fontWeight: 700, marginBottom: 8 }}>⚠ Shortcomings</div>
              {phase.shortcomings.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: T.textSec, lineHeight: 1.7, paddingLeft: 14, position: "relative", marginBottom: 2 }}>
                  <span style={{ position: "absolute", left: 0, top: 8, width: 5, height: 5, borderRadius: "50%", background: "#E5484D" }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
          {/* Agentic vision panel */}
          {isVision && v && (
            <div style={{ borderTop: `2px solid ${T.accent}`, background: `linear-gradient(180deg, ${T.accentLight} 0%, ${T.surface} 100%)` }}>
              {/* Agent header */}
              <div style={{ padding: "18px 22px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.accentBorder}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.accent }}>{v.agent}</div>
                  <div style={{ fontSize: 12, color: T.textSec }}>Trigger: {v.trigger}</div>
                </div>
              </div>
              {/* How it works */}
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.accentBorder}` }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, color: T.accent, marginBottom: 10 }}>How the Agent Works</div>
                {v.howItWorks.map((h, i) => (
                  <div key={i} style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7, paddingLeft: 16, position: "relative", marginBottom: 3 }}>
                    <span style={{ position: "absolute", left: 0, top: 10, width: 5, height: 5, borderRadius: "50%", background: T.accent }} />
                    {h}
                  </div>
                ))}
              </div>
              {/* Human role */}
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.accentBorder}` }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, color: T.accent, marginBottom: 10 }}>Human-in-the-Loop</div>
                <div style={{ fontSize: 13, color: T.textSec, paddingLeft: 14, borderLeft: `2px solid ${T.green}` }}>{v.humanRole}</div>
              </div>
              {/* Gains */}
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.accentBorder}` }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, color: T.accent, marginBottom: 10 }}>Measurable Gains</div>
                {v.gains.map((g, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 1fr 20px 1fr", gap: 8, alignItems: "center", padding: "7px 0", borderBottom: i < v.gains.length - 1 ? `1px solid #F0ECF9` : "none", fontSize: 12 }}>
                    <div style={{ fontWeight: 700 }}>{g.metric}</div>
                    <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "3px 8px", borderRadius: 4, textAlign: "center" }}>{g.from}</div>
                    <div style={{ color: T.accent, fontWeight: 700, textAlign: "center" }}>→</div>
                    <div style={{ background: "#D1FAE5", color: "#065F46", padding: "3px 8px", borderRadius: 4, textAlign: "center" }}>{g.to}</div>
                  </div>
                ))}
              </div>
              {/* Tools */}
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.accentBorder}` }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, color: T.accent, marginBottom: 10 }}>Tools & Integration</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {v.tools.map((t, i) => <AgentBadge key={i} label={t} />)}
                </div>
              </div>
              {/* Example scenario */}
              <div style={{ padding: "18px 22px" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, color: T.accent, marginBottom: 10 }}>Example: {v.example.title}</div>
                {v.example.steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < v.example.steps.length - 1 ? `1px solid #F0ECF9` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.actor === "agent" ? T.accentLight : "#DCF2F2", color: s.actor === "agent" ? T.accent : T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                      {s.actor === "agent" ? "🤖" : "👤"}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700, color: s.actor === "agent" ? T.accent : T.green, marginBottom: 2 }}>
                        Step {i + 1} · {s.actor === "agent" ? "Claude Agent" : s.actor === "developer" ? "Developer" : "Human"}
                      </div>
                      <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ============================================================
// SLIDESHOW COMPONENT
// ============================================================

const SlideRenderer = ({ slide }) => {
  const base: React.CSSProperties = { width: "100%", minHeight: 520, display: "flex", flexDirection: "column", justifyContent: "center", padding: 56, borderRadius: T.radius, overflow: "hidden", position: "relative" };

  switch (slide.layout) {
    case "cover":
      return (
        <div style={{ ...base, background: `linear-gradient(135deg, #1C1B18 0%, #2A2824 60%, #3D3A32 100%)`, color: "white", textAlign: "center", alignItems: "center" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 30% 40%, rgba(74,58,186,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: T.accentBorder, fontWeight: 600, marginBottom: 32 }}>PANDORA</div>
          <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.15, letterSpacing: -1.5, whiteSpace: "pre-line", marginBottom: 20, maxWidth: 700 }}>{slide.title}</h1>
          <p style={{ fontSize: 18, color: "#A09C94", fontWeight: 400, marginBottom: 16 }}>{slide.subtitle}</p>
          <div style={{ fontSize: 13, color: "#6B6860", fontFamily: T.mono, marginTop: 16 }}>{slide.meta}</div>
        </div>
      );

    case "agenda":
      return (
        <div style={{ ...base, background: T.surface, padding: "40px 48px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, marginBottom: 28, color: T.text }}>{slide.title}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {slide.items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 180px 1fr", gap: 16, padding: "11px 0", borderBottom: `1px solid ${T.surfaceAlt}`, alignItems: "center" }}>
                <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.accent }}>{item.time}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{item.label}</span>
                <span style={{ fontSize: 13, color: T.textSec }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "split":
      return (
        <div style={{ ...base, background: T.surface, padding: "40px 48px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, marginBottom: 28, color: T.text }}>{slide.title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            {[slide.left, slide.right].map((col, ci) => (
              <div key={ci} style={{ padding: 24, borderRadius: T.radiusSm, background: ci === 0 ? T.surfaceAlt : "#FEF2F2", border: `1px solid ${ci === 0 ? T.border : "#FECACA"}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: ci === 0 ? T.text : "#B91C1C" }}>{col.heading}</div>
                {col.points.map((p, pi) => (
                  <div key={pi} style={{ fontSize: 13, color: T.textSec, lineHeight: 1.8, paddingLeft: 16, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: 10, width: 6, height: 6, borderRadius: "50%", background: ci === 0 ? T.accent : "#E5484D" }} />
                    {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    case "architecture":
      return (
        <div style={{ ...base, background: T.surface, padding: "40px 48px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, marginBottom: 6, color: T.text }}>{slide.title}</h2>
          <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>{slide.subtitle}</p>
          <ArchitectureLayers />
        </div>
      );

    case "metrics":
      return (
        <div style={{ ...base, background: `linear-gradient(135deg, #1C1B18, #2A2824)`, color: "white", padding: "40px 48px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, marginBottom: 32, color: "white" }}>{slide.title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {slide.metrics.map((m, i) => (
              <div key={i} style={{ padding: 24, borderRadius: T.radiusSm, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#F87171", marginBottom: 4 }}>{m.value}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: "#A09C94" }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case "shortcomings":
      return (
        <div style={{ ...base, background: T.surface, padding: "36px 44px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, marginBottom: 6 }}>{slide.title}</h2>
          <p style={{ fontSize: 14, color: T.textSec, marginBottom: 20 }}>{slide.subtitle}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {SHORTCOMINGS.map((s, i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: 8, border: `1px solid ${T.border}`, borderLeft: `3px solid ${s.severity === "high" ? "#E5484D" : "#F5A623"}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.severity === "high" ? "#E5484D" : "#F5A623", flexShrink: 0 }} />
                  {s.title}
                </div>
                <div style={{ fontSize: 11, color: T.textSec, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case "vision-intro":
      return (
        <div style={{ ...base, background: `linear-gradient(135deg, ${T.accentLight} 0%, #E8E3FF 50%, #F0ECF9 100%)`, padding: "40px 48px" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, color: T.accent, marginBottom: 6 }}>{slide.title}</h2>
          <p style={{ fontSize: 16, color: T.textSec, marginBottom: 28 }}>{slide.subtitle}</p>
          {slide.principles.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: `1px solid ${T.accentBorder}` }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{p.num}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: T.textSec }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      );

    case "agent-network":
      return (
        <div style={{ ...base, background: T.surface, padding: "40px 48px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, marginBottom: 6 }}>{slide.title}</h2>
          <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>{slide.subtitle}</p>
          <div style={{ background: T.accent, color: "white", borderRadius: T.radiusSm, padding: "14px 24px", textAlign: "center", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
            🤖 QE Orchestrator Agent — Risk Analysis · Test Planning · Cross-Phase Coordination
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {QE_PHASES.map(p => (
              <div key={p.id} style={{ padding: 16, borderRadius: T.radiusSm, border: `1px solid ${T.accentBorder}`, textAlign: "center", background: "white" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: p.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, margin: "0 auto 8px" }}>{p.id}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{p.agenticVision.agent}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{p.agenticVision.trigger}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case "example":
      return (
        <div style={{ ...base, background: T.surface, padding: "40px 48px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, marginBottom: 6 }}>{slide.title}</h2>
          <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>{slide.subtitle}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {slide.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 18px", borderRadius: T.radiusSm, background: s.actor === "agent" ? T.accentLight : "#DCF2F2", border: `1px solid ${s.actor === "agent" ? T.accentBorder : "#B4DDD0"}` }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: s.actor === "agent" ? T.accent : T.green, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                  {s.actor === "agent" ? "🤖" : "👤"}
                </div>
                <div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: s.actor === "agent" ? T.accent : T.green, marginBottom: 2 }}>
                    Step {i + 1} · {s.actor === "agent" ? "Claude Agent" : "Developer"}
                  </div>
                  <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "gains":
      return (
        <div style={{ ...base, background: `linear-gradient(135deg, #1C1B18, #2A2824)`, color: "white", padding: "40px 48px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, marginBottom: 28 }}>{slide.title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {slide.gains.map((g, i) => (
              <div key={i} style={{ padding: 24, borderRadius: T.radiusSm, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{g.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "white" }}>{g.metric}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ padding: "4px 10px", borderRadius: 4, background: "rgba(248,113,113,0.2)", color: "#FCA5A5", fontSize: 12, fontWeight: 600 }}>{g.from}</span>
                  <span style={{ color: T.accentBorder, fontWeight: 700 }}>→</span>
                  <span style={{ padding: "4px 10px", borderRadius: 4, background: "rgba(52,211,153,0.2)", color: "#6EE7B7", fontSize: 12, fontWeight: 600 }}>{g.to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "discussion":
      return (
        <div style={{ ...base, background: T.surface, padding: "40px 48px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, marginBottom: 24 }}>{slide.title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {slide.topics.map((t, i) => (
              <div key={i} style={{ padding: "18px 20px", borderRadius: T.radiusSm, border: `1px solid ${T.accentBorder}`, borderLeft: `3px solid ${T.accent}`, background: T.accentLight }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 6 }}>{t.question}</div>
                <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6 }}>{t.prompt}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case "roadmap":
      return (
        <div style={{ ...base, background: T.surface, padding: "40px 48px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, marginBottom: 24 }}>{slide.title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {slide.phases.map((p, i) => (
              <div key={i} style={{ padding: "18px 16px", borderRadius: T.radiusSm, border: `1px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, background: "white" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{p.phase}</div>
                <div style={{ fontSize: 11, color: T.accent, fontWeight: 600, fontFamily: T.mono, marginBottom: 12 }}>{p.timeline}</div>
                {p.items.map((item, j) => (
                  <div key={j} style={{ fontSize: 12, color: T.textSec, lineHeight: 1.7, paddingLeft: 14, position: "relative", marginBottom: 2 }}>
                    <span style={{ position: "absolute", left: 0, top: 8, width: 5, height: 5, borderRadius: "50%", background: T.accent }} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div style={base}>Unknown layout</div>;
  }
};

const Slideshow = () => {
  const [current, setCurrent] = useState(0);
  const total = SLIDES.length;

  const goTo = useCallback((dir) => {
    setCurrent(prev => {
      if (dir === "next") return Math.min(prev + 1, total - 1);
      if (dir === "prev") return Math.max(prev - 1, 0);
      return prev;
    });
  }, [total]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goTo("next"); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo("prev"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo]);

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => goTo("prev")} disabled={current === 0} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${T.border}`, background: T.surface, cursor: current === 0 ? "not-allowed" : "pointer", opacity: current === 0 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>←</button>
          <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.textSec }}>{current + 1} / {total}</span>
          <button onClick={() => goTo("next")} disabled={current === total - 1} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${T.border}`, background: T.surface, cursor: current === total - 1 ? "not-allowed" : "pointer", opacity: current === total - 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>→</button>
        </div>
        <div style={{ fontSize: 12, color: T.textMuted }}>Use ← → arrow keys to navigate</div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 3, background: T.surfaceAlt, borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ height: "100%", background: T.accent, borderRadius: 2, transition: "width 0.3s", width: `${((current + 1) / total) * 100}%` }} />
      </div>
      {/* Slide */}
      <div style={{ border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <SlideRenderer slide={SLIDES[current]} />
      </div>
      {/* Slide thumbnails */}
      <div style={{ display: "flex", gap: 6, marginTop: 16, overflowX: "auto", paddingBottom: 8 }}>
        {SLIDES.map((s, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 6, border: `1px solid ${i === current ? T.accent : T.border}`, background: i === current ? T.accentLight : T.surface, color: i === current ? T.accent : T.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            {i + 1}. {s.title.split("\n")[0].substring(0, 22)}{s.title.split("\n")[0].length > 22 ? "…" : ""}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// VIEW COMPONENTS
// ============================================================

const LifecycleView = ({ isVision }) => {
  const [expandedId, setExpandedId] = useState(null);
  return (
    <div>
      {isVision && (
        <div style={{ background: `linear-gradient(135deg, ${T.accentLight}, #E8E3FF, #F0ECF9)`, border: `1px solid ${T.accentBorder}`, borderRadius: T.radius, padding: 32, marginBottom: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-50%", right: "-20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,58,186,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: T.accent, marginBottom: 8 }}>Agentic QE — Target Vision</h2>
          <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7, maxWidth: 700 }}>
            A network of specialised Claude Agents that autonomously plan, execute, and report quality activities across every SDLC phase. Humans shift from <strong>executing tests</strong> to <strong>governing quality outcomes</strong>.
          </p>
          <div style={{ background: T.accent, color: "white", borderRadius: T.radiusSm, padding: "12px 20px", textAlign: "center", fontWeight: 700, fontSize: 13, marginTop: 20 }}>
            🤖 QE Orchestrator Agent — Risk Analysis · Test Planning · Cross-Phase Coordination
          </div>
        </div>
      )}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Pandora Enterprise Architecture</SectionLabel>
        <ArchitectureLayers />
      </div>
      <SectionLabel color={isVision ? T.accent : undefined}>
        {isVision ? "QE Phases — Agentic Vision (click to expand)" : "QE Phases — Current State"}
      </SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 }}>
        {QE_PHASES.map(p => (
          <PhaseCard
            key={p.id}
            phase={p}
            isVision={isVision}
            expanded={expandedId === p.id}
            onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
          />
        ))}
      </div>
    </div>
  );
};

const EffortView = ({ isVision }) => (
  <div>
    <SectionLabel color={isVision ? T.accent : undefined}>
      {isVision ? "Effort Comparison — Current vs Agentic" : "Effort Distribution (Current State)"}
    </SectionLabel>
    <Card style={{ padding: 28 }}>
      {EFFORT_DATA.map((e, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: isVision ? "130px 1fr 1fr" : "130px 1fr 90px", gap: 14, alignItems: "center", padding: "9px 0", borderBottom: i < EFFORT_DATA.length - 1 ? `1px solid ${T.surfaceAlt}` : "none" }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{e.label}</div>
          {isVision ? (
            <>
              <div>
                <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 3 }}>Current: {e.time}</div>
                <div style={{ height: 14, background: T.surfaceAlt, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: e.color, opacity: 0.4, width: `${e.pct}%`, transition: "width 1s" }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: T.accent, fontWeight: 600, marginBottom: 3 }}>Agentic: {e.agenticTime}</div>
                <div style={{ height: 14, background: T.surfaceAlt, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: T.accent, width: `${Math.max(5, e.pct * 0.2)}%`, transition: "width 1s" }} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ height: 26, background: T.surfaceAlt, borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 6, background: e.color, width: `${e.pct}%`, transition: "width 1s", display: "flex", alignItems: "center", paddingLeft: 10, fontSize: 11, fontWeight: 700, color: "white" }}>{e.pct}%</div>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, textAlign: "right" }}>{e.time}</div>
            </>
          )}
        </div>
      ))}
    </Card>

    {isVision && (
      <div style={{ marginTop: 28 }}>
        <SectionLabel color={T.accent}>Key Transformation Metrics</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
          {[
            { value: "85%", label: "Reduction in Manual QE", bg: T.accentLight },
            { value: "< 1 day", label: "Release Validation", bg: "#D1FAE5" },
            { value: "Every PR", label: "Security + A11y", bg: "#FBF3DD" },
            { value: "< 5%", label: "E2E Flakiness", bg: "#F7E4EA" },
            { value: "30+", label: "Markets in Parallel", bg: "#E1EDF7" },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center", padding: 22, background: m.bg, borderRadius: T.radiusSm }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{m.value}</div>
              <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const ShortcomingsView = ({ isVision }) => (
  <div>
    <SectionLabel>Critical Shortcomings</SectionLabel>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
      {SHORTCOMINGS.map((s, i) => (
        <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `3px solid ${s.severity === "high" ? "#E5484D" : "#F5A623"}`, borderRadius: T.radiusSm, padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.severity === "high" ? "#E5484D" : "#F5A623", flexShrink: 0 }} />
            {s.title}
          </div>
          <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6, marginBottom: isVision ? 8 : 0 }}>{s.desc}</div>
          {isVision && (
            <div style={{ fontSize: 12, color: "#065F46", background: "#D1FAE5", padding: "6px 10px", borderRadius: 4, lineHeight: 1.5, marginTop: 6 }}>
              <strong style={{ color: T.accent }}>Agent fix:</strong> {s.fix}
            </div>
          )}
        </div>
      ))}
    </div>

    <div style={{ marginTop: 28 }}>
      <SectionLabel>Risk Heat Map — System × QE Phase</SectionLabel>
      <Card style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: T.surfaceAlt }}>
              <th style={{ textAlign: "left", padding: "12px 18px", fontWeight: 700, fontSize: 11, color: T.textMuted }}>System</th>
              {["Unit", "Func.", "Integ.", "Perf.", "Sec.", "E2E", "A11y"].map(h => (
                <th key={h} style={{ textAlign: "center", padding: "12px 8px", fontWeight: 700, fontSize: 11, color: T.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HEATMAP.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.surfaceAlt}` }}>
                <td style={{ padding: "10px 18px", fontWeight: 600, fontSize: 12 }}>{row.system}</td>
                {["unit", "func", "integ", "perf", "sec", "e2e", "a11y"].map(k => {
                  const v = row[k];
                  const c = heatColors[v];
                  return (
                    <td key={k} style={{ textAlign: "center", padding: 8 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: c.bg, color: c.text }}>{heatLabels[v]}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  </div>
);

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [mode, setMode] = useState("current");
  const [view, setView] = useState("slides");
  const isVision = mode === "vision";

  const views = [
    { key: "slides", label: "📽 Slideshow" },
    { key: "lifecycle", label: "QE Lifecycle" },
    { key: "effort", label: "Effort & Timeline" },
    { key: "shortcomings", label: "Shortcomings" },
  ];

  return (
    <div style={{ fontFamily: T.font, background: T.bg, minHeight: "100vh", color: T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "24px 40px 18px", borderBottom: `1px solid ${T.border}`, background: T.surface, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.text, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>P</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>Pandora Global Platform</h1>
              <span style={{ fontSize: 11, color: T.textMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>SDLC · Quality Engineering Lifecycle</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", background: isVision ? T.accentLight : T.surfaceAlt, borderRadius: 20, fontSize: 12, fontWeight: 600, color: isVision ? T.accent : T.textSec }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: isVision ? T.accent : T.green }} />
              {isVision ? "Target Vision — Agentic QE" : "Current State Assessment"}
            </div>
            <div style={{ fontSize: 11, fontFamily: T.mono, color: T.textMuted, padding: "6px 14px", background: T.surfaceAlt, borderRadius: 20 }}>7 Phases · 12+ Systems · 30+ Markets</div>
          </div>
        </div>

        {/* Navigation: View tabs + Mode toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          {/* View tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {views.map(v => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                style={{ padding: "9px 18px", border: "none", borderRadius: T.radiusSm, fontFamily: T.font, fontSize: 13, fontWeight: view === v.key ? 700 : 500, color: view === v.key ? T.text : T.textMuted, background: view === v.key ? T.surfaceAlt : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
                {v.label}
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: 5, background: T.surfaceAlt, borderRadius: 28, opacity: view === "slides" ? 0.5 : 1, pointerEvents: view === "slides" ? "none" : "auto" }}>
            <button
              onClick={() => setMode("current")}
              style={{ padding: "8px 22px", border: "none", borderRadius: 22, fontFamily: T.font, fontSize: 13, fontWeight: 700, cursor: view === "slides" ? "not-allowed" : "pointer", transition: "all 0.3s", background: mode === "current" ? T.surface : "transparent", color: mode === "current" ? T.text : T.textMuted, boxShadow: mode === "current" ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
              📋 Current State
            </button>
            <button
              onClick={() => setMode("vision")}
              style={{ padding: "8px 22px", border: "none", borderRadius: 22, fontFamily: T.font, fontSize: 13, fontWeight: 700, cursor: view === "slides" ? "not-allowed" : "pointer", transition: "all 0.3s", background: mode === "vision" ? T.accent : "transparent", color: mode === "vision" ? "white" : T.textMuted, boxShadow: mode === "vision" ? `0 2px 12px rgba(74,58,186,0.3)` : "none" }}>
              🤖 Agentic Vision
            </button>
          </div>
        </div>

        {/* Helper text for slideshow */}
        {view === "slides" && (
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 10, fontStyle: "italic" }}>
            💡 Slideshow presents the full journey from current state to agentic vision
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ padding: "28px 40px 80px", maxWidth: 1600, margin: "0 auto" }}>
        {view === "slides" && <Slideshow />}
        {view === "lifecycle" && <LifecycleView isVision={isVision} />}
        {view === "effort" && <EffortView isVision={isVision} />}
        {view === "shortcomings" && <ShortcomingsView isVision={isVision} />}
      </div>
    </div>
  );
}
