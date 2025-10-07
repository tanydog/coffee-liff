# Coffee LIFF Experience Redesign Guide

## 1. Design Intent & Guardrails
- **Business Alignment**: Every surface should increase diagnostic completion and upsell partners' offers while reducing support overhead.
- **Evidence First**: Component decisions must map to validated insights from analytics, interviews, and usability tests.
- **Operational Efficiency**: Content and configuration editable through CMS/admin tools to avoid code deployments for updates.
- **Trust & Compliance**: Transparent data usage disclosures and accessible interactions (WCAG 2.1 AA) across JP/EN locales.

## 2. Journey Architecture
### 2.1 Lifecycle Overview
1. **Discover** (LINE message, QR, social post) → Value prop clarity, social proof, low-friction entry.
2. **Diagnose** (guided questions) → Capture taste, context, purchase intent with progressive profiling.
3. **Decide** (recommendations) → Provide differentiated options (buy now, reserve, subscribe) with rationale.
4. **Delight** (post-conversion) → Reinforce choice, invite feedback, offer retention hooks.
5. **Re-engage** (notifications, My Page) → Personalized campaigns, subscription management, loyalty.

### 2.2 Key Screens & Success Metrics
| Screen | Business Goal | Core Metric | Supporting Evidence |
| --- | --- | --- | --- |
| Home | Encourage diagnostic start | Diagnostic start rate | 68% of surveyed users want a quick way to begin without scrolling |
| Diagnostic Flow | Collect actionable preferences | Completion rate | Usability study (n=8) flagged progress visibility as motivator |
| Recommendation | Convert to purchase or lead | Qualified transaction rate | Partner interviews emphasize need for clear ROI messaging |
| My Page | Retain and upsell | Repeat session rate | Analytics show 32% return if previous picks stored |
| Partner Showcase | Acquire B2B leads | Partner inquiry submissions | Sales team requests prominent CTA + filters |

## 3. Information Architecture & Content Model
```
Global Navigation
 ├─ ホーム / Home
 ├─ コーヒー診断 / Diagnostic
 ├─ リコメンド / Recommendations
 ├─ マイページ / My Page
 ├─ パートナー / Partners
 └─ サポート / Support
```
- **Content Governance**: Structured in headless CMS with locale keys, evidence tags, and ownership metadata.
- **Personalization Rules**: Segment by taste archetype, intent stage, and membership tier.

## 4. Experience Requirements
### 4.1 Home & Awareness
- Hero module with rotating campaigns (seasonal beans, partner spotlight) sourced from CMS.
- KPI strip showing matches delivered, partner satisfaction score, and sustainability badge counts.
- Micro-survey teaser (one-tap flavor preference) to personalize CTA copy.
- Persistent consent notice linking to privacy detail prior to entering diagnostic.

### 4.2 Diagnostic Flow
| Step | Purpose | UX Pattern | Instrumentation |
| --- | --- | --- | --- |
| Welcome & Consent | Set expectations, capture permission | Full-screen modal with progress overview | `diagnostic_start`, consent ID |
| Flavor Baseline | Understand roast & flavor notes | Swipeable cards with haptics, 3-state selection | `question_answered` + answer payload |
| Context & Occasion | Identify brewing context, gifting, frequency | Chip group allowing multi-select, optional notes | `question_answered`, `context_tagged` |
| Budget & Logistics | Gauge spend and delivery preference | Dual slider + toggle for pickup/delivery | `question_answered`, `logistics_pref` |
| Confirmation | Summarize selections, allow edit | Sticky summary sheet | `preference_saved` |

### 4.3 Recommendation & Conversion Surfaces
- **Primary Card**: Highest fit bean with visual score badge, tasting notes, and "Why this works" evidence snippet.
- **Secondary Options**: Experimental pick and subscription bundle with comparisons.
- **Action Row**: `今すぐ購入`, `カフェで受け取る`, `あとで保存`, each emitting tracked events.
- **Partner ROI Messaging**: Display partner-provided benefits (loyalty points, limited roast) to highlight commercial value.
- **Risk Reversal**: Free replacement guarantee microcopy for hesitant users.

### 4.4 My Page & Retention
- Taste radar chart generated from diagnostic data with explanation tooltips.
- Saved beans and reorder CTA with dynamic shipping estimates.
- Subscription management (pause, skip, change grind) accessible within LIFF.
- Feedback loop: 2-tap satisfaction rating with optional comments feeding support backlog.

### 4.5 Partner Showcase & Support
- Filter bar (location, roast style, sustainability badges) with persistent analytics tagging.
- Partner detail pages include story, best sellers, lead capture (`相談する`) with CRM webhook.
- Support center: searchable FAQ, escalation to chat support, data privacy settings.

## 5. Component System
| Component | States | Notes |
| --- | --- | --- |
| `HeroCarousel` | default, focused, campaign-sponsored | Auto-pulls from CMS with impression tracking |
| `ProgressStepper` | step 0–5 | Must remain visible within viewport on mobile |
| `TasteCard` | default, selected, disabled | Provide icon + text + evidence chip |
| `CTAButton` | primary, secondary, loading, disabled | Minimum touch target 48px, ensure analytics tagging |
| `MatchScoreBadge` | 50–100% gradient | Color-coded for quick scanning, includes text for accessibility |
| `PartnerCard` | default, sponsored, unavailable | Sponsored state includes disclosure label |
| `FeedbackSheet` | collapsed, expanded | Houses NPS + qualitative feedback |

## 6. Research & Testing Plan
- **Foundational**: Quarterly diary studies to validate behavioral assumptions per segment.
- **Iterative**: Bi-weekly remote tests on prototypes focusing on diagnostic comprehension and conversion friction.
- **Quantitative**: A/B tests on CTA framing, recommendation layouts, and trust badges with sequential analysis.
- **Voice of Customer**: Integrate post-purchase surveys and partner account reviews into analytics warehouse.

## 7. Accessibility, Localization & Compliance
- Maintain WCAG 2.1 AA standards, including focus outlines and color contrast.
- Provide JP/EN toggles with mirrored layouts where appropriate; manage copy via translation memory.
- Capture explicit consent prior to personalization; surface data usage summary in My Page.
- Ensure error states explain corrective action; provide contact path for data deletion requests.

## 8. Delivery Roadmap
| Sprint | Focus | Definition of Success |
| --- | --- | --- |
| 1 | Design tokens & component library foundations | Token pipeline in repo, Storybook coverage for core components |
| 2 | Diagnostic flow build with analytics instrumentation | Completion ≥45% in beta, zero P0 accessibility violations |
| 3 | Recommendation + conversion integration | Tracking live for purchase/reserve/save events, uplift vs. control |
| 4 | My Page personalization & retention hooks | Repeat sessions +15% vs. baseline cohort |
| 5 | Partner showcase + support center | Lead submissions baseline established, support deflection tracked |
| 6 | Localization, performance tuning, compliance audit | Page load <2.5s P75, audit sign-off |

## 9. Measurement Dashboard Requirements
- Funnel visualization: starts → completion → purchase click → checkout completion.
- Partner ROI panel: revenue share, campaign attribution, inventory alerts.
- UX health: task completion time, accessibility issues, CSAT/NPS trends.
- Operational metrics: content changes published without dev involvement, support tickets deflected.

## 10. Next Actions
1. Align cross-functional team on measurement framework and assign dashboard owners.
2. Finalize diagnostic content in CMS with evidence tags and legal review.
3. Prototype new diagnostic and recommendation flows in Figma for stakeholder sign-off.
4. Start instrumentation implementation alongside TypeScript migration to avoid retrofitting.
