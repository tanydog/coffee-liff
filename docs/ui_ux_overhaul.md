# Coffee LIFF UI/UX Rebuild Plan

## 1. Design Principles
1. **Evidence-led Guidance**: Each step anchored by insights from user testing and analytics.
2. **Conversational Flow**: Minimize cognitive load with bite-sized questions and contextual storytelling.
3. **Trust & Transparency**: Show sourcing, roasting details, and data usage up front.
4. **Seamless LINE Integration**: Optimize for in-app behaviors while enabling frictionless hand-off to external checkout when needed.

## 2. User Journey Redesign
### 2.1 Awareness → Engagement
- **Hero Carousel**: Rotating seasonal beans, educational snippets. CTA: "あなたに合うコーヒーを診断".
- **Social Proof Chips**: Display number of successful matches, partner cafe logos.
- **Micro-survey Teaser**: Quick poll capturing taste preference to personalize entry.

### 2.2 Diagnostic Flow
| Step | Goal | Interaction | Validation |
| --- | --- | --- | --- |
| Welcome | Set expectations, gain consent | LIFF modal with progress bar | Consent captured via Firestore `consent_log` |
| Flavor Baseline | Gauge roast/notes preferences | Swipeable cards (light → dark, fruity → nutty) | Require selection to proceed |
| Contextual Needs | Understand brewing context | Toggle chips (home, office, gift) | Allow multi-select |
| Purchase Behavior | Capture budget & frequency | Slider with discrete ticks | Validate min/max |
| Result Summary | Present top matches with rationale | Animated cards + star fit score | Provide "Why this bean" expandable section |

### 2.3 Recommendation & Conversion
- **Tiered Recommendations**: Primary (best fit), Secondary (experimental), Subscription offer.
- **Actions**:
  - `今すぐ購入`: Deep link to partner cart using `liff.openWindow` with tracking parameters.
  - `カフェで受け取る`: Reserve via integrated booking microservice.
  - `もっと知る`: Scroll to detailed origin/roaster stories.
- **Retention Hooks**: Save preferences, subscribe to seasonal drops, share results with friends (LINE share target).

## 3. Information Architecture
```
Global Nav
 ├─ ホーム
 ├─ コーヒー診断
 ├─ マイページ
 ├─ パートナー紹介
 └─ サポート
```
- **Home**: dynamic hero, featured campaigns, educational content.
- **My Page**: Saved beans, purchase history, taste profile radar chart.
- **Partner Showcase**: Filterable list with badges (new, sustainable, local).
- **Support**: FAQ, chat support entry, account settings.

## 4. UI Components & States
| Component | Description | Notes |
| --- | --- | --- |
| `TasteCard` | Displays flavor attribute with iconography | States: default, selected, disabled |
| `ProgressStepper` | Top-fixed progress indicator | Animates on step change |
| `MatchScoreBadge` | Shows % fit, color-coded | Green (>80%), Amber (60–80%), Grey (<60%) |
| `PartnerCard` | Cafe info, distance, average rating | Integrates Google Places or partner data |
| `CTAButton` | Primary/secondary actions with accessible contrast | Provide loading + disabled states |

## 5. Accessibility & Localization
- WCAG 2.1 AA color contrast.
- Support JP/EN copy variants; structured translations with i18n JSON.
- VoiceOver-friendly component semantics; focus management on modal transitions.
- Haptic feedback cues for key transitions on mobile.

## 6. Analytics & Feedback Loops
- Event taxonomy: `diagnostic_start`, `question_answered`, `recommendation_viewed`, `purchase_click`, `share_triggered`.
- In-app NPS prompt on third session; route to Firebase collection.
- Heatmaps via FullStory alternatives (ensure consent + data minimization).
- Weekly UX review combining quant (BigQuery dashboards) + qual (user interviews, support tickets).

## 7. Implementation Roadmap
1. **Sprint 1**: Design system foundation in Figma, token generation pipeline, component library scaffolding.
2. **Sprint 2**: Diagnostic flow implementation with A/B testing harness.
3. **Sprint 3**: Recommendation surface, partner cards, conversion tracking instrumentation.
4. **Sprint 4**: My Page personalization, retention hooks, localized content rollout.
5. **Sprint 5**: Accessibility audit, performance optimization, final polish.

## 8. Success Metrics
- Diagnostic completion rate ≥ 65%.
- Recommendation click-through rate ≥ 40%.
- Repeat session rate ≥ 30% within 30 days.
- NPS ≥ +35.

