# Feature Specification: Ratlist.gg Foundation

**Feature ID**: 001-foundation  
**Created**: 2024-11-29  
**Status**: Implemented  
**Priority**: P0 (Foundation)

## Overview

Ratlist.gg is a community-driven incident board and reputation lookup tool for extraction shooter games. Players can report encounters (positive or negative) with other players, check reputation scores, and make informed decisions about who to team up with.

**Core Value Proposition**: Reduce the risk of teaming with untrustworthy players by providing transparent, community-sourced reputation data.

## Problem Statement

In extraction shooter games (Tarkov, Dark and Darker, etc.), players often team up with strangers. However, there's no standardized way to know if a potential teammate has a history of:
- Betraying teammates
- Extract camping
- Stream sniping
- Team killing
- Or conversely, being a reliable and skilled teammate

This information asymmetry leads to:
- Lost progress due to betrayals
- Wasted time with unreliable teammates
- Negative gameplay experiences
- Reluctance to cooperate with unknown players

## Goals

### Primary Goals
1. Enable players to quickly check another player's reputation before teaming up
2. Provide a simple way to log incidents (both negative and positive)
3. Create a browseable database of player reputations across multiple games

### Secondary Goals
- Maintain community safety through content moderation
- Support multiple extraction shooter games
- Scale to 10k-100k incidents without performance degradation
- Provide transparent, auditable reputation calculations

### Non-Goals (Out of Scope)
- Real-time anti-cheat detection
- Official enforcement or bans (community information only)
- Integration with game APIs or official platforms
- Mobile native apps (responsive web only for MVP)
- Automated incident verification

## User Stories

### User Story 1: Check a Player (Priority: P1) 🎯

**As a** player looking for teammates  
**I want to** search for a player's reputation by their in-game identifier  
**So that** I can quickly decide if they seem trustworthy or have a history of problematic behavior

**Acceptance Criteria:**
- Can search by game and player identifier (case-insensitive)
- See reputation tier (F, D, C, B, A, S) at a glance
- View total incident count and breakdown by category
- See recent incidents with descriptions
- Page loads in under 2 seconds (p95)

**User Scenarios:**
1. **Quick check before grouping**
   - User is in-game, someone asks to team up
   - Opens Ratlist.gg on phone/second monitor
   - Searches "PlayerName123" for "Tarkov"
   - Sees "Tier: F" with 8 betrayal reports
   - Decides not to team up

2. **Positive verification**
   - User sees a player advertising as "friendly"
   - Searches their name
   - Sees "Tier: A" with multiple "clutch save" incidents
   - Feels confident teaming up

### User Story 2: Log an Incident (Priority: P1)

**As a** player who experienced a notable encounter  
**I want to** submit an incident report about another player  
**So that** the community has accurate information for future decisions

**Acceptance Criteria:**
- Must sign in with email (magic link) or OAuth (GitHub/Discord)
- Required fields: game, player identifier, category, description (10-2000 chars)
- Optional fields: map, mode, region, occurred date/time
- Can choose to make report anonymous
- See confirmation after submission
- Rate limited: 30s cooldown between reports, max 10/day
- Description validated for PII, slurs, threats

**User Scenarios:**
1. **Report a betrayal**
   - Player gets shot by teammate right before extract
   - Signs into Ratlist.gg
   - Fills form: Game=Tarkov, Player=BadPlayer123, Category=Betrayal
   - Describes: "Killed me 10 seconds before extract, took all my loot"
   - Submits anonymously
   - Sees success message

2. **Commend good teammate**
   - Player gets revived in clutch moment
   - Reports positive incident: Category=Clutch Save
   - Describes heroic rescue
   - Uses real identity to add credibility

### User Story 3: Browse the Ratlist (Priority: P2)

**As a** community member  
**I want to** explore top-reported players and recent incidents  
**So that** I can stay informed about community trends and notorious players

**Acceptance Criteria:**
- Filter leaderboard by game and time period (week/month/all-time)
- See top players ranked by reputation score
- View recent incidents across all games (paginated)
- Results update based on filters without full page reload
- Pagination works with cursor-based loading

**User Scenarios:**
1. **Check notorious players**
   - User browses to /browse
   - Filters by "Tarkov" and "This Week"
   - Sees top 20 most-reported players
   - Recognizes a name they've seen in-game
   - Adds to mental "avoid" list

2. **Monitor community activity**
   - User checks recent incidents feed
   - Sees patterns of new scammers
   - Shares information with their Discord community

## Functional Requirements

### FR-1: Multi-Game Support
- System supports multiple extraction shooter games
- Each game has unique slug and display name
- Player identities are scoped per-game (same identifier in different games = different players)

### FR-2: Player Identity
- Players identified by game-specific handles (no cross-platform ID required)
- System auto-creates player records on first incident
- Optional display name field for prettified labels

### FR-3: Incident Categories
Predefined categories with reputation weights:
- **Negative**: Betrayal (-10), Extract Camping (-5), Stream Sniping (-7), Team Violation (-8)
- **Positive**: Clutch Save (+8), Helpful Teammate (+5)
- Categories stored in database, extensible

### FR-4: Reputation Calculation
- Score = sum of weighted category values from all incidents
- Tier mapping:
  - S: 50+
  - A: 20-49
  - B: 0-19
  - C: -10 to -1
  - D: -30 to -11
  - F: -31 or worse
- Recalculated on-demand via SQL view or RPC

### FR-5: Authentication & Authorization
- **Anonymous users**: Can read all public data (players, incidents, leaderboards)
- **Authenticated users**: Can submit incidents, flag content
- **Moderators**: Can hide/remove incidents, close flags
- Auth providers: Magic link (email), GitHub OAuth, Discord OAuth

### FR-6: Content Moderation
- Users can flag incidents for review
- Flagging requires authentication
- One flag per user per incident
- Moderators see flag queue and can take action
- Reporter identity hidden from public, visible to moderators

### FR-7: Abuse Prevention
- Rate limiting: 30-second cooldown between submissions
- Daily limit: 10 incidents per authenticated user
- Input validation: description length 10-2000 characters
- Content filtering: block PII, slurs, threats
- Grace period: Users can edit/delete own incidents within 15 minutes

### FR-8: Data Privacy
- Reporter can choose anonymous mode (identity hidden from public)
- No personally identifiable information (PII) allowed in descriptions
- Player identifiers are in-game handles only
- RLS policies enforce data access rules

### FR-9: Performance & Scale
- ISR caching on player profiles (180s revalidate)
- Server-side rendering for SEO-critical pages
- Database indexes on frequently queried fields
- Cursor-based pagination for large result sets
- Target: p95 API latency < 300ms, LCP < 2.5s

### FR-10: UI/UX Standards
- Dark theme by default (game-friendly)
- Responsive design (mobile, tablet, desktop)
- WCAG 2.1 AA compliance for primary flows
- Keyboard navigation support
- Clear disclaimers about community-sourced content

## Success Criteria

### Measurable Outcomes
- **Adoption**: 100+ incidents submitted within first month
- **Engagement**: 500+ player searches per week
- **Performance**: 95% of pages load under 2.5s (LCP)
- **Reliability**: 99% uptime for production deployment
- **Quality**: Less than 5% of incidents flagged for moderation

### Qualitative Measures
- Users report making more informed teaming decisions
- Community actively participates in reporting
- Positive feedback about transparency and fairness
- Low rate of false/malicious reports

## Assumptions

1. **User Trust**: Players will use the platform honestly if given proper tools
2. **Game Stability**: Supported games remain active with stable player bases
3. **Identifier Uniqueness**: In-game identifiers are unique enough within each game
4. **English Primary**: MVP focuses on English-language community (i18n later)
5. **Web-First**: Users access via browser (no native app needed initially)
6. **Supabase Reliability**: Managed Supabase meets performance/uptime needs
7. **Vercel Performance**: Vercel Edge Network provides adequate CDN performance

## Dependencies

### External Services
- **Supabase**: Postgres database, authentication, RLS
- **Vercel**: Hosting, edge functions, CDN
- **OAuth Providers**: GitHub and Discord for social login

### Technical Prerequisites
- Node.js 18+ for development
- Modern browsers (Chrome/Firefox/Safari/Edge last 2 versions)
- TLS/SSL for production (provided by Vercel)

## Out of Scope (Future Considerations)

### Deferred to Post-MVP
- Email notifications when reported
- Advanced search with fuzzy matching
- Incident evidence uploads (screenshots/videos)
- Reputation history timeline/charts
- API for third-party integrations
- Mobile native applications
- Internationalization (i18n)
- Real-time incident feed (WebSocket/SSE)
- User profiles with customization
- Friend lists and trusted networks
- Incident disputes/appeals system
- Automated sentiment analysis
- Integration with game launchers
- Premium/paid features

### Explicitly Not Planned
- Official game integration or endorsement
- Anti-cheat detection or enforcement
- Account linking across games
- In-game overlay functionality
- Automated verification of incidents
- Legal action or real-world enforcement

## Risks & Mitigations

### Risk: False Reports / Malicious Use
**Mitigation**: 
- Require authentication for submissions
- Rate limiting and daily caps
- Community flagging system
- Moderator review queue
- Grace period for self-correction

### Risk: Privacy Violations (Doxxing)
**Mitigation**:
- Strict content filtering for PII
- Clear community guidelines
- Fast moderator response
- Anonymous reporting option
- RLS policies protecting user data

### Risk: Low Adoption
**Mitigation**:
- SEO optimization for player searches
- Community outreach on Reddit/Discord
- Clear value proposition on landing page
- Low friction (no signup to search)

### Risk: Performance Degradation at Scale
**Mitigation**:
- Database indexes on hot paths
- ISR caching strategy
- Cursor-based pagination
- Monitoring and alerting
- Horizontal scaling via Vercel/Supabase

### Risk: Legal Liability
**Mitigation**:
- Clear disclaimers (UGC, opinion-based)
- No affiliation with game studios
- DMCA/takedown process
- Terms of service and privacy policy
- Community self-moderation first

## Design Constraints

### Technical Constraints
- Must use Supabase RLS (no service-role key in client)
- Must support mobile viewport (min 375px width)
- Must work without JavaScript for core search (progressive enhancement)
- Must follow Next.js App Router conventions

### Business Constraints
- Free tier Supabase limits (500MB DB, 50k monthly active users)
- Free tier Vercel limits (100GB bandwidth/month)
- No paid API dependencies in MVP
- Solo developer (prioritize simplicity over features)

### Design Constraints
- Dark theme mandatory (reduce eye strain for gamers)
- Load time under 3 seconds on 3G connection
- No registration required for read-only access
- Mobile-first responsive design

## Glossary

- **Extraction Shooter**: Game genre where players enter map, collect loot, must extract to keep it
- **Incident**: A reported encounter between players (positive or negative)
- **Ratlist**: Slang term for list of untrustworthy players ("rats" in gaming)
- **RLS**: Row Level Security (Supabase feature for data access control)
- **ISR**: Incremental Static Regeneration (Next.js caching strategy)
- **Tier**: Letter grade (F-S) representing player reputation
- **Magic Link**: Passwordless email authentication
- **Extract Camping**: Waiting near extraction point to ambush other players
- **Clutch Save**: Heroic action that saves teammate in critical moment

## References

- [Plan Document](./plan.md) - Technical implementation details
- [Tasks Document](./tasks.md) - Development task breakdown
- [Quickstart Guide](./quickstart.md) - Setup instructions
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
