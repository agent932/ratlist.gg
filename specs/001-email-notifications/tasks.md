---
description: "Task breakdown for email notifications feature"
---

# Tasks: Email Notifications for Incident Reports

**Input**: Design documents from `/specs/001-email-notifications/`
**Prerequisites**: plan.md, spec.md (4 user stories), data-model.md, contracts/ (2 endpoints)

**Tests**: NOT included (Constitution Principle V - No Testing)

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths use Next.js 14 App Router structure

## Path Conventions

- **API Routes**: `app/api/[route]/route.ts`
- **Email Components**: `components/emails/`
- **Utilities**: `lib/[category]/`
- **Database**: `supabase/migrations/`
- **Configuration**: Repository root (`vercel.json`, `.env.local`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install email dependencies (resend@3.2.0, react-email@2.1.0, @react-email/components@0.0.15)
- [X] T002 [P] Add environment variables to .env.local and .env.example (RESEND_API_KEY, CRON_SECRET, EMAIL_FROM, NEXT_PUBLIC_APP_URL)
- [X] T003 [P] Configure Vercel cron jobs in vercel.json (send-notifications every 5min, reset-counts daily at midnight UTC)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create and run database migration 0017_email_notification_retry.sql (add retry_count, last_retry_at, permanently_failed columns + index)
- [X] T005 [P] Create Resend client instance in lib/email/resend.ts (export configured client with RESEND_API_KEY)
- [X] T006 [P] Implement discriminator redaction utility in lib/utils/redact-discriminator.ts (strip #1234 patterns per Constitution Principle VI)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Receive Email When Linked Player Gets Reported (Priority: P1) 🎯 MVP

**Goal**: Users receive email notifications within 5 minutes when incidents are reported against their linked players

**Independent Test**: Link a player identifier, have another user report an incident, verify email received within 5 minutes with incident details

### Implementation for User Story 1

- [X] T007 [P] [US1] Create EmailButton component in components/emails/components/EmailButton.tsx (reusable CTA with Tailwind styling)
- [X] T008 [P] [US1] Create EmailHeader component in components/emails/components/EmailHeader.tsx (logo and branding)
- [X] T009 [P] [US1] Create EmailFooter component in components/emails/components/EmailFooter.tsx (unsubscribe and preference links)
- [X] T010 [US1] Create IncidentNotificationEmail template in components/emails/IncidentNotificationEmail.tsx (uses T007-T009 components, incident details, dashboard link)
- [X] T011 [US1] Implement batch email processor cron endpoint in app/api/cron/send-notifications/route.ts (query fn_send_pending_notifications, send via Resend, mark sent/failed, implements contract)
- [ ] T012 [US1] Test email delivery manually (create test incident, trigger cron via URL, verify email received)

**Checkpoint**: At this point, User Story 1 should be fully functional - users receive emails for incidents

---

## Phase 4: User Story 2 - Control Notification Preferences (Priority: P2)

**Goal**: Users can toggle email notifications on/off from their dashboard

**Independent Test**: Navigate to dashboard, toggle notifications off, verify no emails sent when incidents reported

**⚠️ NOTE**: Preference toggle UI already exists at `/api/notifications/toggle` - this story enhances batch processor to respect the preference

### Implementation for User Story 2

- [X] T013 [US2] Update batch processor in app/api/cron/send-notifications/route.ts to check email_notifications flag before sending (skip if disabled, increment skipped counter)
- [ ] T014 [US2] Test preference toggle (disable notifications, create incident, verify no email sent but incident appears in dashboard)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users receive emails AND can opt out

---

## Phase 5: User Story 3 - Rate Limiting Protection (Priority: P3)

**Goal**: System limits users to 5 emails per day to prevent spam

**Independent Test**: Generate 10 incidents within 24 hours, verify only 5 emails sent with remaining queued until next day

### Implementation for User Story 3

- [X] T015 [US3] Update batch processor in app/api/cron/send-notifications/route.ts to enforce 5/day limit (check notification_count_today before sending, skip if >= 5)
- [X] T016 [US3] Implement daily counter reset cron endpoint in app/api/cron/reset-notification-counts/route.ts (call fn_reset_notification_counts RPC, return users_reset count, implements contract)
- [ ] T017 [US3] Test rate limiting (create 10 test incidents, verify only 5 emails sent, verify counter resets at midnight UTC)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should work - emails delivered, user control, spam protection

---

## Phase 6: User Story 4 - Batch Email Processing (Priority: P3)

**Goal**: Reliable background processing with retry logic for failed deliveries

**Independent Test**: Submit multiple incidents, verify batch processing every 5 minutes with delivery logs showing retries for failures

**⚠️ NOTE**: Batch processing already implemented in T011 - this story adds retry logic and monitoring

### Implementation for User Story 4

- [X] T018 [US4] Enhance batch processor in app/api/cron/send-notifications/route.ts to implement exponential backoff retry (5min, 15min, 45min based on retry_count and last_retry_at)
- [X] T019 [US4] Add permanently_failed marking logic in batch processor (set permanently_failed=true after 3 failed attempts)
- [X] T020 [US4] Add execution logging to batch processor (log processed, sent, failed, skipped, permanently_failed counts with timestamps)
- [ ] T021 [US4] Test retry logic (simulate Resend API failure, verify retries at 5min, 15min, 45min intervals, verify permanent failure after 3 attempts)

**Checkpoint**: All user stories now independently functional with production-ready error handling

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T022 [P] Add monitoring queries to quickstart.md (pending notifications, permanently failed, daily volume per user)
- [ ] T023 [P] Update .github/agents/copilot-instructions.md with email feature context (already done, verify completeness)
- [ ] T024 Validate all success criteria from spec.md (SC-001 through SC-008 - delivery time, rate limiting, retry, open rate targets documented)
- [ ] T025 [P] Add Resend dashboard monitoring setup instructions to quickstart.md (bounce rate, open rate analytics)
- [ ] T026 Deploy to production and monitor first batch execution (verify cron jobs trigger, check Vercel logs, validate email delivery)
- [ ] T027 Run quickstart.md validation checklist (setup steps, environment vars, migration applied, cron configured)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T003) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T004-T006) - MVP delivery
- **User Story 2 (Phase 4)**: Depends on US1 (T011) - enhances batch processor
- **User Story 3 (Phase 5)**: Depends on Foundational (T004) - independent of US1/US2
- **User Story 4 (Phase 6)**: Depends on US1 (T011) - enhances batch processor with retry
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - **BLOCKS**: US2, US4 (both enhance the batch processor from US1)
- **User Story 2 (P2)**: Depends on US1 (T011 batch processor must exist)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P3)**: Depends on US1 (T011 batch processor must exist)

### Within Each User Story

#### User Story 1 (Email Delivery)
- T007, T008, T009 can run in parallel (email components)
- T010 depends on T007-T009 (main template uses components)
- T011 depends on T004-T006 (foundational), T010 (template)
- T012 depends on T011 (testing)

#### User Story 2 (Preferences)
- T013 depends on T011 (modifying batch processor)
- T014 depends on T013 (testing)

#### User Story 3 (Rate Limiting)
- T015 depends on T004 (migration with notification_count_today column)
- T016 can run in parallel with T015 (separate cron endpoint)
- T017 depends on T015, T016 (testing)

#### User Story 4 (Retry Logic)
- T018, T019, T020 depend on T011 (modifying batch processor)
- T018, T019, T020 can be done together in one batch processor update
- T021 depends on T018-T020 (testing)

### Critical Path

**Minimum Viable Product (MVP - User Story 1 only)**:
```
T001 → T004 → T005 → T006 → T007 → T010 → T011 → T012
(Setup) → (Migration) → (Resend) → (Redact) → (Email UI) → (Template) → (Batch) → (Test)
```

**Full Feature (All User Stories)**:
```
Phase 1 (T001-T003)
  ↓
Phase 2 (T004-T006)
  ↓
Phase 3 (T007-T012) [US1 - MVP]
  ↓
Phase 4 (T013-T014) [US2 - Preferences] + Phase 5 (T015-T017) [US3 - Rate Limit] (parallel)
  ↓
Phase 6 (T018-T021) [US4 - Retry Logic]
  ↓
Phase 7 (T022-T027) [Polish]
```

### Parallel Opportunities

#### Within Phase 1 (Setup)
- T002 and T003 can run in parallel (env vars and vercel.json are independent)

#### Within Phase 2 (Foundational)
- T005 and T006 can run in parallel after T004 (Resend client and discriminator utility are independent)

#### Within Phase 3 (User Story 1)
- T007, T008, T009 can all run in parallel (email components are independent)

#### Between User Stories (if team capacity allows)
- After US1 completes (T012):
  - US2 (T013-T014) and US3 (T015-T017) can run in parallel (different concerns)
  - US4 must wait for US1 but could run parallel with US2/US3 if done carefully

#### Within Phase 7 (Polish)
- T022, T023, T025 can run in parallel (documentation tasks)

---

## Parallel Example: User Story 1

**Scenario**: Developer working through US1 with maximum parallelization

```bash
# After foundational complete (T004-T006):

# Day 1 Morning: Create all email components in parallel (T007-T009)
git checkout -b email-components
# Create EmailButton.tsx (30 min)
# Create EmailHeader.tsx (30 min)  
# Create EmailFooter.tsx (30 min)
git commit -am "feat(emails): add reusable email UI components"

# Day 1 Afternoon: Create main template (T010)
# Create IncidentNotificationEmail.tsx (1 hour)
git commit -am "feat(emails): add incident notification template"

# Day 2 Morning: Implement batch processor (T011)
git checkout -b batch-processor
# Create app/api/cron/send-notifications/route.ts (2-3 hours)
git commit -am "feat(cron): add batch email processor"

# Day 2 Afternoon: Manual testing (T012)
# Create test incident, trigger cron, verify email
# Fix any issues, verify success criteria SC-001 (<5 min delivery)

# Total time: ~1.5 days for MVP
```

---

## Estimated Effort

**By Phase**:
- Phase 1 (Setup): 30 minutes
- Phase 2 (Foundational): 1-2 hours
- Phase 3 (User Story 1 - MVP): 1-1.5 days
- Phase 4 (User Story 2): 2-3 hours
- Phase 5 (User Story 3): 3-4 hours
- Phase 6 (User Story 4): 3-4 hours
- Phase 7 (Polish): 2-3 hours

**Total**: 2-3 days for experienced developer familiar with codebase

**MVP Only (US1)**: 1.5-2 days

---

## Success Validation

After completing all tasks, verify against spec.md success criteria:

- **SC-001**: ✅ Email delivery time < 5 minutes (test with timestamp diff)
- **SC-002**: ✅ Preference toggle response < 2 seconds (already implemented in previous feature)
- **SC-003**: ✅ Delivery rate > 95% (monitor sent/processed ratio from cron logs)
- **SC-004**: ✅ No user receives > 5 emails/day (verify rate limiting with test)
- **SC-005**: ✅ Failed emails retry automatically (verify retry_count increments)
- **SC-006**: ⏳ Email open rate > 40% (measure after 1 week via Resend analytics)
- **SC-007**: ⏳ Opt-out rate < 2% (measure after 1 week via email_notifications toggles)
- **SC-008**: ✅ Batch handles 1000+ notifications (load test or wait for production peak)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Recommended for initial release**:
1. Complete Phases 1-3 (T001-T012)
2. Deploy to production with just email delivery
3. Monitor for 1 week:
   - Delivery success rate
   - Email open rates
   - User feedback
4. Then add US2-US4 incrementally based on data

**Benefits**:
- Faster time to value
- Reduced initial complexity
- Real user data informs priorities
- Lower risk deployment

### Full Feature (All User Stories)

**Recommended for complete implementation**:
1. Complete all phases sequentially (T001-T027)
2. Test each user story independently before moving to next
3. Deploy to production only after all stories complete
4. Monitor all success criteria for 1 week

**Benefits**:
- Complete feature set from day 1
- No follow-up deployment cycles
- Rate limiting prevents spam issues
- Retry logic ensures reliability

**Recommendation**: Start with MVP (US1), add US3 (rate limiting) within 1 week if email volume is high, add US2/US4 as needed based on user requests.

---

## Monitoring & Alerts

### Key Metrics to Track

**Daily**:
- Pending notification count (should be near 0 if cron working)
- Permanently failed count (investigate if > 0)
- Delivery success rate (should be > 95%)

**Weekly**:
- Email open rate (target > 40%)
- Opt-out rate (target < 2%)
- Average notifications per user

**Queries** (from data-model.md):

```sql
-- Pending notifications (should be < 100)
SELECT COUNT(*) FROM notification_queue 
WHERE sent = FALSE AND permanently_failed = FALSE;

-- Permanently failed (investigate causes)
SELECT COUNT(*) FROM notification_queue 
WHERE permanently_failed = TRUE;

-- Daily volume per user (check for spam patterns)
SELECT user_id, COUNT(*) 
FROM notification_queue 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id 
ORDER BY COUNT DESC 
LIMIT 10;
```

### Alerts to Configure

- Alert if pending queue > 500 notifications
- Alert if permanently failed > 50 notifications
- Alert if no successful cron execution in 15 minutes
- Alert if delivery rate < 90% over 1 hour
- Alert if Resend API errors > 10% of sends

---

## References

- **Specification**: [spec.md](./spec.md) - User stories and requirements
- **Implementation Plan**: [plan.md](./plan.md) - Technical approach and constitution check
- **Research**: [research.md](./research.md) - Technology decisions (Resend, React Email, Vercel Cron)
- **Data Model**: [data-model.md](./data-model.md) - Database schema and state machine
- **API Contracts**: 
  - [contracts/cron-send-notifications.md](./contracts/cron-send-notifications.md) - Batch processor spec
  - [contracts/cron-reset-counts.md](./contracts/cron-reset-counts.md) - Daily reset spec
- **Setup Guide**: [quickstart.md](./quickstart.md) - Deployment instructions
- **Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project principles
- **External Docs**:
  - [Resend Documentation](https://resend.com/docs)
  - [React Email Documentation](https://react.email/docs)
  - [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
