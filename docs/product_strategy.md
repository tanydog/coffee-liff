# Coffee LIFF Business & Product Blueprint

## 1. Executive Overview
- **Purpose**: Deliver a LINE-native coffee discovery concierge that converts taste insights into revenue for partner roasters while providing measurable value to corporate stakeholders.
- **North-Star Metric**: Monthly qualified transactions (completed purchase or lead hand-off) per active partner.
- **18-Month Targets**:
  1. Reach 14 qualified transactions per partner per month (4× current baseline).
  2. Capture first-party flavor preference profiles for 70% of active consumer users.
  3. Achieve ¥1.5M ARR through a blended SaaS + commission model with >65% gross margin.

## 2. Business Objectives & KPIs
| Objective | KPI | Baseline | 6-Month Goal | 12-Month Goal |
| --- | --- | --- | --- | --- |
| Grow monetizable demand | Conversion from diagnostic start → qualified transaction | 4% | 12% | 20% |
| Expand partner value | Net revenue per partner (monthly) | ¥0.18M | ¥0.35M | ¥0.55M |
| Improve operational efficiency | Manual configuration hours / month | 40h | 16h | 8h |
| Strengthen data asset | Consent-backed profiles captured | 28% | 50% | 70% |

## 3. Market & Customer Validation
### 3.1 Segments & Jobs-to-be-Done
| Segment | JTBD | Pain Points | Evidenced Needs |
| --- | --- | --- | --- |
| Urban coffee enthusiasts (B2C) | Find beans aligned to taste & brewing setup | Too many options, lack of trusted guidance | Desire mobile-first concierge, transparency on sourcing |
| Specialty cafes & roasters (B2B) | Increase profitable demand & understand taste trends | Rising CAC, few digital insights, limited staff capacity | Need turnkey channel with analytics + automation |
| Corporate wellness buyers (B2B2E) | Offer differentiated employee perks | Hard to manage vendors, need data on engagement | Request curated programs with reporting & simplified billing |

### 3.2 Market Sizing
- **TAM**: ¥420B Japanese specialty coffee retail (METI 2023); assume 30% reachable via digital channels → ¥126B.
- **SAM**: LINE MAU interested in premium beverages ≈ 12M. With 5% engaging monthly and ¥2,000 spend → ¥1.44B reachable demand.
- **SOM (24 months)**: Capture 3% of SAM via anchor partners → ¥43M GMV, with 15% revenue take → ¥6.45M.

### 3.3 Evidence Base & Ongoing Research
- Current LIFF funnel: 18% diagnostic start, 4% click-to-purchase (Firebase analytics export, Feb 2024).
- Partner interviews (n=6) highlight request for cohort-level taste insights and automated campaign rotation.
- Planned validation: taste panel diary study (Q3), corporate pilot (Q4) to size B2B2E willingness-to-pay.

## 4. Value Proposition & Monetization
### 4.1 Value Pillars
1. **Personalized Discovery**: Adaptive diagnostic surfaces curated bean sets with education to reduce decision anxiety.
2. **Revenue Intelligence**: Partner console surfaces conversion funnel health, demand trends, and inventory alerts.
3. **Commerce Enablement**: Embedded checkout or lead routing with attribution tracking, plus integrations for subscriptions.

### 4.2 Pricing & Revenue Streams
| Stream | Description | Pricing Hypothesis | Gross Margin Guardrails |
| --- | --- | --- | --- |
| SaaS Subscription | Starter / Growth / Enterprise tiers with feature gating (analytics depth, seats, API access) | ¥18k / ¥42k / ¥95k monthly | Maintain 80%+ software margin after hosting |
| Affiliate Commission | % of GMV for partners using external carts | 10% blended rate | Track CAC:LTV ≥ 1:4 |
| Sponsored Placement | Seasonal bean spotlights and campaign modules | ¥55k per 4-week campaign | Limit sponsored slots to 15% of surfaces |
| Insight Reports | Aggregated quarterly trend reports for enterprise buyers | ¥120k per report | Data anonymization + consent compliance |

### 4.3 Cost & Management Considerations
- **Technology Opex**: Firebase Hosting, Functions, Firestore, BigQuery; target <¥80k/month via auto-scaling & nightly cold starts.
- **People**: 1 FTE partner success, 0.5 FTE content curator, shared data analyst (0.3 FTE) → ¥6.5M annual payroll allocation.
- **Compliance**: PIPL/GDPR, opt-in consent storage, contractually defined data use for partners.
- **Governance**: Quarterly pricing review, monthly partner health check, consent audits.

## 5. Product & Service Blueprint
### 5.1 System Architecture (Target)
```
LINE LIFF Client
  ↓
API Gateway (Firebase Functions / HTTPS callable)
  ├─ Auth Service (LINE OIDC + partner scopes)
  ├─ Diagnostic Engine (taste matrix, ML recommendations)
  ├─ Partner Service (catalog, offers, availability)
  ├─ Commerce Service (checkout routing, affiliate tracking)
  └─ Event Pipeline (Pub/Sub → BigQuery → Looker Studio)

Admin Console (React + Firebase Auth)
  ↔ Partner Service / Analytics API / Billing integrations
```

### 5.2 Capability Roadmap
| Phase | Capability | Business Impact | Dependencies |
| --- | --- | --- | --- |
| Foundation (Q1) | Modularized frontend (Vite + TypeScript), centralized config service | -80% config incidents, faster experimentation | Component library, Firestore rules |
| Growth (Q2) | Recommendation engine v1, analytics dashboards, consent vault | +15% diagnostic completion, consent compliance | Data model, BI pipeline |
| Monetize (Q3) | Partner portal with billing, campaign manager | 10 paying partners, campaign revenue | Stripe/Billing setup, RBAC |
| Expand (Q4) | Corporate wellness module, subscription logistics integrations | 2 enterprise pilots, +20% GMV | SSO, fulfillment partners |

### 5.3 Operating Processes
- **Onboarding**: Template-driven partner setup (catalog import, brand assets, SKU mapping) with automated QA checklist.
- **Lifecycle Marketing**: Triggered LINE messages for abandoned diagnostics, seasonal campaigns, and loyalty milestones.
- **Support**: Tiered SLA (Starter: 48h, Growth: 24h, Enterprise: 8h) managed through shared ticketing.

## 6. Data & Measurement Plan
- **Event Taxonomy**: `diagnostic_start`, `question_answered`, `preference_saved`, `recommendation_viewed`, `purchase_click`, `subscription_opt_in`, `share_triggered`.
- **Dashboards**: Partner funnel health, cohort retention, revenue attribution, consent coverage.
- **Experimentation**: Feature flags with holdout cohorts; evaluate conversion lifts with sequential testing.
- **Privacy Controls**: Consent ledger, data minimization, retention policies (auto-delete personal data after 18 months of inactivity).

## 7. Risks & Mitigations
| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Partner churn due to slow ROI | Lost revenue, reputation | Medium | Quarterly business reviews, pilot guarantees, clear ROI reporting |
| Data privacy non-compliance | Legal penalties | Low-Med | Legal review, automated consent vault, anonymization routines |
| Operational overload | Support backlog, missed SLAs | Medium | Self-service admin tooling, knowledge base, structured escalation |
| Monetization underperformance | Revenue gap | Medium | Hybrid pricing experiments, promotional bundles, usage-based upsell |

## 8. Next Steps
1. Approve resource plan for foundation phase (engineering + GTM).
2. Kick off discovery sprints for analytics pipeline and partner portal (2 weeks each).
3. Implement KPI dashboard and monthly governance cadence with finance + product.
4. Launch TypeScript migration spike and design system build-out with instrumentation baked in.
