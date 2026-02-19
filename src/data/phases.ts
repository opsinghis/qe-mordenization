// ============================================================
// data/phases.ts — QE Phase definitions with agentic vision
// ============================================================

export interface AgenticGain {
  metric: string;
  from: string;
  to: string;
}

export interface ExampleStep {
  actor: "agent" | "developer" | "human" | "content-author";
  text: string;
}

export interface AgenticVision {
  agent: string;
  trigger: string;
  howItWorks: string[];
  humanRole: string;
  tools: string[];
  gains: AgenticGain[];
  example: { title: string; steps: ExampleStep[] };
}

export interface QEPhase {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  colorLight: string;
  when: string;
  who: string;
  objective: string;
  duration: string;
  systems: string[];
  shortcomings: string[];
  agenticVision: AgenticVision;
}

export const QE_PHASES: QEPhase[] = [
  {
    id: 1, title: "Unit Testing",
    subtitle: "Component-level code validation across microservices and micro-frontends",
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
    id: 2, title: "Functional Testing",
    subtitle: "Feature-level verification against business requirements and acceptance criteria",
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
          { actor: "agent", text: "Generates 28 scenarios: happy path × 6 markets, boundary (151 chars), special characters, gift wrap + promo code interaction" },
          { actor: "agent", text: "Creates Playwright scripts with page object model matching Pandora's MFE component structure" },
          { actor: "agent", text: "Executes against virtualized SCAPI/OMS — no environment wait. All 28 scenarios in 4 minutes." },
          { actor: "human", text: "QE engineer does 15-min exploratory session: tests gift wrap with engraving combo. Finds UI overlap. Logs bug." },
        ],
      },
    },
  },
  {
    id: 3, title: "Integration Testing",
    subtitle: "Contract and data-flow verification between services, APIs, and third-party systems",
    color: "#2D7A65", colorLight: "#DDF1EA",
    when: "Post-merge to integration branch, during system integration phase",
    who: "QE Engineers, Backend Developers, Integration/Platform team",
    objective: "Validate data contracts between MFEs ↔ BFF ↔ Kong ↔ SCAPI ↔ OMS ↔ ERP. Ensure order payloads reach downstream correctly.",
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
    id: 4, title: "Performance Testing",
    subtitle: "Load, stress, and scalability validation for peak traffic and global reach",
    color: "#9A7B1C", colorLight: "#FBF3DD",
    when: "Pre-release / pre-peak events (Black Friday, Xmas). Rarely in-sprint.",
    who: "Dedicated Perf Engineer (often 1 person), Platform/Infra team supports",
    objective: "Validate MRT scalability under global peak load. Stress test SCAPI rate limits, Kong throughput, OMS order processing, Bloomreach search concurrency.",
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
        "On every deployment, runs performance regression against key journeys",
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
          { actor: "agent", text: "4 weeks before BF: analyses last year's traffic — peak 12,000 RPM, 65% mobile" },
          { actor: "agent", text: "Generates k6 load scripts matching real traffic distribution, applies 1.4x growth factor" },
          { actor: "agent", text: "Runs graduated test: 25% → 50% → 75% → 100% → 120%. SCAPI starts throttling at 85%." },
          { actor: "agent", text: "Recommends: increase SCAPI caching TTL from 60s to 300s, pre-warm Bloomreach, CDN edge rule for PLPs" },
          { actor: "human", text: "Platform team implements. Agent re-runs — throttling eliminated. Passes at 130% projected peak." },
          { actor: "agent", text: "Sets up real-time BF monitoring dashboard with auto-alerting from load test baselines" },
        ],
      },
    },
  },
  {
    id: 5, title: "Security Testing",
    subtitle: "Vulnerability assessment, auth flows, token management, and compliance",
    color: "#A3425A", colorLight: "#F7E4EA",
    when: "Quarterly pen-tests, ad-hoc SAST scans, pre-release security review",
    who: "InfoSec team (external to QE), Developers fix findings, Security Champions",
    objective: "Validate OAuth2 token handling (Kong → SCAPI), prevent client-side token exposure, OWASP Top 10, PCI-DSS compliance, dependency vulnerabilities.",
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
        "Auto-validates Kong security policies after any config change",
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
          { actor: "developer", text: "Creates new 'Wishlist' MFE that calls custom microservice via Kong" },
          { actor: "agent", text: "SAST detects: developer passing SLAS token directly to Kong instead of BFF pattern" },
          { actor: "agent", text: "Flags HIGH severity: 'Token exposure — SLAS token sent to Kong violates BFF security pattern'" },
          { actor: "agent", text: "Generates fix: route through MRT SSR using Kong OAuth2 client credentials (references cart-service BFF)" },
          { actor: "developer", text: "Applies BFF pattern fix. Agent re-scans — passes." },
          { actor: "agent", text: "DAST validates: token not in browser network tab, Kong only accepts client_credentials grant" },
        ],
      },
    },
  },
  {
    id: 6, title: "End-to-End Testing",
    subtitle: "Full journey validation from storefront through to downstream fulfilment",
    color: "#B06A2D", colorLight: "#FBEEDD",
    when: "Release candidate phase, regression before deployment to production",
    who: "QE Engineers (lead), Business SMEs for UAT, Market teams",
    objective: "Validate complete journeys: Browse → PDP → Cart → Checkout → Payment → OMS → ERP/WMS. Across all target markets.",
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
      humanRole: "QE lead defines critical journeys. Business SMEs do exploratory on new features only.",
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
          { actor: "agent", text: "Analyses release PAN-R47: 14 stories. Impact: checkout changed, search updated, DE tax modified." },
          { actor: "agent", text: "Selects 6 critical journeys (not 40): Checkout with gift wrap (UK,DE), Search → PDP → Cart, DE tax, Payment" },
          { actor: "agent", text: "Executes autonomously — handles pop-ups, cookie banners, locale switches. Screenshots at each step." },
          { actor: "agent", text: "Visual regression: gift wrap misaligned on mobile DE. Logs P2 with screenshot comparison." },
          { actor: "agent", text: "Synthetic orders through full chain: PWA → SCAPI → OMS → ERP. 'Allocated' in WMS within 2 min." },
          { actor: "human", text: "QE lead reviews: 5/6 passed, 1 visual bug. 35-minute total. Signs off release." },
        ],
      },
    },
  },
  {
    id: 7, title: "Accessibility Testing",
    subtitle: "WCAG compliance and inclusive experience across all touchpoints",
    color: "#1E7A7A", colorLight: "#DCF2F2",
    when: "Often late-stage or post-launch audit. Rarely in sprint.",
    who: "A11y specialist (if available), QE engineers (limited expertise), external auditors",
    objective: "WCAG 2.1 AA: keyboard nav, screen reader, colour contrast, form labels, ARIA on MFE components, Amplience content a11y.",
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
      agent: "Accessibility Guardian Agent", trigger: "Every PR (component), every deploy (page), every CMS publish",
      howItWorks: [
        "Runs axe-core + custom Pandora a11y rules on every PR touching UI components",
        "Validates MFE shared component library: ARIA patterns, keyboard nav, focus management",
        "When Amplience content published, scans rendered output for a11y: alt text, headings, contrast",
        "Simulates screen reader navigation on critical journeys after each deployment",
        "Tracks WCAG compliance score per page/market over time",
        "Generates remediation guidance specific to React/PWA patterns",
      ],
      humanRole: "A11y specialist sets standards and reviews complex interactions. Content team trained on patterns.",
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
          { actor: "human", text: "Content author publishes Valentine's banner: no alt text, pink text on light background" },
          { actor: "agent", text: "Webhook triggers scan: missing alt text (WCAG 1.1.1) and contrast 2.8:1 (needs 4.5:1)" },
          { actor: "agent", text: "Slack notification with fix: 'Add alt text: …', 'Change text to #9B1B30 for 4.6:1 ratio'" },
          { actor: "human", text: "Content author updates banner" },
          { actor: "agent", text: "Re-scans — passes. Compliance dashboard updated. Banner goes live." },
        ],
      },
    },
  },
];
