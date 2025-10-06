# Coffee LIFF Product Strategy Redesign

## 1. Executive Summary
- **Vision**: Transform the Coffee LIFF experience into a data-driven concierge that guides LINE users from curiosity to purchase while generating actionable insights for partner cafes and roasters.
- **North-Star Metric**: Monthly qualified leads delivered to partner stores.
- **Key Outcomes**:
  1. Increase diagnostic completion-to-purchase intent conversions to 25%.
  2. Capture first-party taste preference data for 60% of active users.
  3. Generate ¥1.2M ARR within 18 months through tiered SaaS plans and affiliate commissions.

## 2. Customer & Market Validation
### 2.1 Target Segments
| Segment | Job-to-be-done | Pain Points | Opportunity |
| --- | --- | --- | --- |
| Urban coffee enthusiasts (B2C) | Discover beans matching taste | Overwhelmed by options, lack of personalized advice | Deliver guided diagnostic and curated recommendations |
| Specialty cafes & roasters (B2B) | Reach LINE users, understand taste trends | Limited digital reach, poor customer insight, high marketing CAC | Provide LIFF-powered storefront, analytics, qualified leads |
| Corporate wellness programs | Offer employee perks | Need low-maintenance experiences with measurable value | White-label diagnostics, subscription tasting boxes |

### 2.2 Market Size (TAM/SAM/SOM)
- **TAM**: Japanese specialty coffee retail market ¥420B (METI 2023). Assume 30% addressable via digital channels → ¥126B.
- **SAM**: LINE monthly active users interested in gourmet beverages ≈ 12M. If 5% convert to diagnostics × ¥2,000 average monthly spend → ¥1.44B.
- **SOM** (24-month horizon): Target 3% share of SAM via strategic partners → ¥43M GMV annually, capturing 15% as revenue (¥6.45M).

### 2.3 Evidence & Research Backlog
- Existing LIFF analytics show 18% of visitors initiate diagnosis but only 4% finish purchase links.
- Partner interviews (n=6) highlight desire for segment-level insights and simplified logistics.
- Upcoming research: cohort-based taste testing (Q3), enterprise pilot (Q4).

## 3. Value Proposition & Monetization
### 3.1 Value Pillars
1. **Personalized Journeys**: Adaptive quiz mapping to roaster inventory.
2. **Operational Intelligence**: Dashboard summarizing conversion funnel, taste trends, inventory alerts.
3. **Commerce Enablement**: Integrated checkout or lead hand-off to partner ecommerce.

### 3.2 Monetization Model
| Stream | Description | Pricing Hypothesis | Dependencies |
| --- | --- | --- | --- |
| SaaS Subscription | Tiered plans for partner cafes (Starter/Pro/Enterprise) | ¥15k / ¥35k / ¥80k monthly | Requires analytics backend, multi-tenant management |
| Affiliate Commission | 8–12% of referred GMV for partners using external carts | Requires click tracking, SKU mapping |
| Sponsored Features | Highlighted placements for new roasts | ¥50k per campaign | Needs campaign management tooling |
| Data Insights Exports | Quarterly market reports | ¥120k per report | Must obtain opt-in aggregated data |

### 3.3 Cost Structure & Management Considerations
- **Infrastructure**: Firebase Hosting, Functions, Firestore → maintain <¥80k/month via auto-scaling and scheduled jobs.
- **Operations**: Partner success (1 FTE), content curation (0.5 FTE), data analyst (shared resource).
- **Compliance**: PIPL/GDPR alignment, anonymized analytics, secure token handling.
- **Support Load Reduction**: Introduce self-service configuration UI, templated onboarding flows.

## 4. System Architecture Redesign
### 4.1 Current Pain Points
- Hard-coded configuration in public assets caused deployment drift and high maintenance.
- Limited observability into LIFF session quality, leading to blind spots when errors occur.
- No central profile service; duplicated logic across diagnosis/result pages.

### 4.2 2024 Replatform Summary
- **Domain-driven Functions**: Auth, Logbook, Diagnosis, Recommendation サービスを分離し、再利用しやすい形で Firebase Functions 上に配置。LINE Webhook 処理も Express ルーターへ統合し、CORS・エラー処理を統一しました。
- **Front-end Module System**: `public/scripts` を core/ui/features/pages の4層に整理。LIFF 初期化、API 呼び出し、UI コンポーネントを共通化し、ページ固有のロジックから切り離しました。
- **Evidence Hooks**: 診断スコアやログ操作で発火するテレメトリポイントを定義し、BigQuery 連携やレポーティングへ拡張できるインターフェースを確保しました。

### 4.3 Target Architecture (Next Iterations)
```
LINE LIFF Client → API Gateway (Firebase Functions)
  ├─ Auth Service (OIDC token validation, partner scope)
  ├─ Recommendation Engine (taste matrix, experimentation framework)
  ├─ Partner Management (catalog, availability, pricing)
  └─ Analytics Pipeline (event ingestion → BigQuery → Looker Studio)

Admin Console (React + Firebase Auth) ↔ Partner Management & Analytics
```

### 4.4 Roadmap
| Quarter | Milestone | KPIs |
| --- | --- | --- |
| Q1 | Ship modular frontend, centralized config | Reduce config-related incidents by 80% |
| Q2 | Launch recommendation engine v1 + analytics dashboards | +15% diagnosis completion, baseline partner NPS |
| Q3 | Release partner portal & SaaS billing | 10 paying partners, ¥2M ARR run-rate |
| Q4 | Expand to corporate wellness vertical | Land 2 enterprise pilots, 20% GMV growth |

## 5. Risk & Mitigation
- **Adoption Risk**: Mitigated via co-marketing with anchor partners, retention incentives.
- **Operational Complexity**: Documented playbooks, automated onboarding, role-based access.
- **Data Privacy**: Opt-in consent flow, anonymization routines, compliance audits.
- **Monetization Risk**: Start with hybrid commission + subscription; evaluate price elasticity quarterly.

## 6. Next Steps
1. Approve strategic direction and resource allocation.
2. Kick off discovery sprints for analytics pipeline and partner portal (2 weeks each).
3. Establish KPI dashboard and weekly operating cadence.
4. Begin TypeScript migration spike with shared component library foundations.
