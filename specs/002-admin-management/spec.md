# Feature Specification: Admin Management Dashboard

**Feature Branch**: `002-admin-management`  
**Created**: December 8, 2025  
**Status**: Draft  
**Input**: User description: "Create a section in the admin dashboard to manage the tier list, games and incident reasons and any other general admin you can think of"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Game Management (Priority: P1)

As an admin, I want to create, edit, and delete games in the system so that users can report incidents for the correct games.

**Why this priority**: Games are the foundation of the platform. Without the ability to manage games, no incidents can be categorized properly. This is the core administrative function.

**Independent Test**: Can be fully tested by logging in as admin, navigating to game management, adding a new game "Test Game", editing its name to "Updated Test Game", and then deleting it. Delivers immediate value by allowing admins to expand the platform to new games.

**Acceptance Scenarios**:

1. **Given** I am logged in as an admin, **When** I click "Add New Game" and fill in game name, slug, and icon, **Then** the new game appears in the games list and is available for incident reporting
2. **Given** I am viewing the games list, **When** I click "Edit" on a game and update its details, **Then** the game information is updated across the platform
3. **Given** I am viewing the games list, **When** I click "Delete" on a game with no incidents, **Then** the game is removed from the system
4. **Given** I attempt to delete a game with existing incidents, **When** I confirm deletion, **Then** I see an error message preventing deletion
5. **Given** I am adding a new game, **When** I enter a slug that already exists, **Then** I see a validation error

---

### User Story 2 - Incident Category Management (Priority: P2)

As an admin, I want to manage incident categories (betrayal, clutch save, etc.) so that users can properly classify reported incidents.

**Why this priority**: After games exist, categories are the next critical classification. Categories help organize incidents and enable proper filtering. Without this, all incidents would be uncategorized.

**Independent Test**: Can be fully tested by creating a new category "New Category Type", assigning it an emoji icon, setting its behavior type (positive/negative), and verifying it appears in the incident reporting form.

**Acceptance Scenarios**:

1. **Given** I am logged in as an admin, **When** I create a new incident category with label, emoji, and behavior type, **Then** the category appears in the incident reporting dropdown
2. **Given** I am viewing categories, **When** I edit a category's label or emoji, **Then** existing incidents with that category show the updated information
3. **Given** I am viewing categories, **When** I toggle a category's active status to inactive, **Then** it no longer appears in the incident reporting form but remains on historical incidents
4. **Given** I am viewing categories, **When** I delete a category with no incidents, **Then** the category is permanently removed
5. **Given** I attempt to delete a category with existing incidents, **When** I confirm deletion, **Then** I see an error message with incident count

---

### User Story 3 - Tier List Management (Priority: P3)

As an admin, I want to configure tier ranks (S, A, B, C, D, F) and their visual styling so that the tier list displays correctly for users.

**Why this priority**: Tier lists are a feature enhancement but not critical for core incident reporting. Can be added after basic game and category management is working.

**Independent Test**: Can be fully tested by modifying tier rank labels (e.g., changing "S" to "S+"), updating colors, and verifying the changes appear on player profile pages.

**Acceptance Scenarios**:

1. **Given** I am logged in as an admin, **When** I edit a tier rank's label, color, or display order, **Then** the tier list on player profiles reflects the changes immediately
2. **Given** I am viewing tier settings, **When** I reorder tiers by dragging them, **Then** the tier list displays in the new order
3. **Given** I am editing a tier, **When** I change its background color to an invalid hex code, **Then** I see a validation error
4. **Given** I am viewing tier settings, **When** I preview tier styling, **Then** I see a live preview of how the tier will appear to users

---

### User Story 4 - User Role Management (Priority: P2)

As an admin, I want to promote users to moderator or admin roles and demote them back to regular users so that I can manage the moderation team.

**Why this priority**: Essential for scaling moderation as the platform grows. Without this, only the original admin can perform admin actions, creating a bottleneck.

**Independent Test**: Can be fully tested by searching for a user, promoting them to moderator, verifying they can access moderator tools, then demoting them back to user role.

**Acceptance Scenarios**:

1. **Given** I am logged in as an admin, **When** I search for a user by email or username, **Then** I see their profile with current role
2. **Given** I am viewing a user's admin profile, **When** I change their role from "user" to "moderator", **Then** they gain access to moderation features immediately
3. **Given** I am viewing a moderator's profile, **When** I change their role to "admin", **Then** they gain full admin dashboard access
4. **Given** I am viewing an admin user's profile, **When** I attempt to demote myself, **Then** I see a warning that I cannot demote the last admin
5. **Given** I have changed a user's role, **When** that user refreshes their page, **Then** their navigation menu updates to reflect new permissions

---

### User Story 5 - Audit Log Viewing (Priority: P3)

As an admin, I want to view an audit log of all admin actions (game changes, category edits, role promotions) so that I can track who made what changes and when.

**Why this priority**: Important for accountability and debugging but not critical for core functionality. Can be added after basic CRUD operations are working.

**Independent Test**: Can be fully tested by performing several admin actions (add game, edit category, promote user), then navigating to the audit log and verifying all actions are recorded with timestamps and admin names.

**Acceptance Scenarios**:

1. **Given** I am logged in as an admin, **When** I navigate to the audit log page, **Then** I see a chronological list of all admin actions
2. **Given** I am viewing the audit log, **When** I filter by action type (e.g., "Game Created"), **Then** I see only actions of that type
3. **Given** I am viewing the audit log, **When** I filter by date range, **Then** I see only actions within that period
4. **Given** I am viewing the audit log, **When** I search for a specific admin's name, **Then** I see only actions performed by that admin
5. **Given** I am viewing an audit log entry, **When** I click on it, **Then** I see full details including before/after values for edits

---

###Edge Cases

- What happens when an admin tries to delete the last active game?
- How does the system handle concurrent edits to the same game by two admins?
- What happens when a tier rank is deleted but players still have that tier assigned?
- How does the system prevent an admin from demoting themselves if they're the last admin?
- What happens when an admin tries to create a duplicate game slug?
- How are inactive categories handled in historical incident data?

## Requirements *(mandatory)*

### Functional Requirements

#### Game Management

- **FR-001**: System MUST allow admins to create new games with name, slug, and icon URL
- **FR-002**: System MUST validate that game slugs are unique and URL-friendly (lowercase, hyphens only)
- **FR-003**: System MUST allow admins to edit existing game details (name, slug, icon)
- **FR-004**: System MUST prevent deletion of games that have associated incidents
- **FR-005**: System MUST allow deletion of games with zero incidents
- **FR-006**: System MUST display game count and creation date for each game
- **FR-007**: System MUST provide search/filter functionality for the games list

#### Incident Category Management

- **FR-008**: System MUST allow admins to create new incident categories with label, emoji, and behavior type
- **FR-009**: System MUST validate that category labels are unique within behavior types
- **FR-010**: System MUST allow admins to edit category labels, emojis, and behavior types
- **FR-011**: System MUST support emoji picker for selecting category icons
- **FR-012**: System MUST allow admins to toggle category active/inactive status
- **FR-013**: System MUST hide inactive categories from incident reporting forms but preserve them on historical incidents
- **FR-014**: System MUST prevent deletion of categories with existing incidents
- **FR-015**: System MUST allow deletion of categories with zero incidents
- **FR-016**: System MUST display incident count for each category

#### Tier List Management

- **FR-017**: System MUST allow admins to edit tier rank labels (e.g., change "S" to "S+")
- **FR-018**: System MUST allow admins to customize tier background colors using hex color codes
- **FR-019**: System MUST validate hex color codes (e.g., #FF5733)
- **FR-020**: System MUST allow admins to reorder tier display sequence via drag-and-drop
- **FR-021**: System MUST provide live preview of tier styling changes
- **FR-022**: System MUST update tier displays on all player profiles immediately after changes

#### User Role Management

- **FR-023**: System MUST allow admins to search for users by email or username
- **FR-024**: System MUST display user's current role (user, moderator, admin) in admin profile view
- **FR-025**: System MUST allow admins to promote users to moderator role
- **FR-026**: System MUST allow admins to promote moderators to admin role
- **FR-027**: System MUST allow admins to demote admins to moderator or user roles
- **FR-028**: System MUST prevent an admin from demoting themselves if they are the last admin
- **FR-029**: System MUST apply role changes immediately upon confirmation
- **FR-030**: System MUST update user's navigation menu and permissions immediately after role change

#### Audit Logging

- **FR-031**: System MUST log all admin actions (create, edit, delete) with timestamp, admin user, action type, and affected entity
- **FR-032**: System MUST allow admins to filter audit logs by action type, date range, and performing admin
- **FR-033**: System MUST display before/after values for edit actions in audit log details
- **FR-034**: System MUST retain audit logs indefinitely for compliance and accountability
- **FR-035**: System MUST paginate audit log results for performance (50 entries per page)

#### Access Control

- **FR-036**: System MUST restrict all admin management features to users with admin role only
- **FR-037**: System MUST redirect non-admin users attempting to access admin pages to error page
- **FR-038**: System MUST verify admin role on both client-side (for UI) and server-side (for API security)

### Key Entities *(include if feature involves data)*

- **Game**: Represents a video game that can have incidents reported. Attributes: name, slug (unique identifier), icon URL, created date, incident count
- **Incident Category**: Classification for reported incidents. Attributes: label, emoji icon, behavior type (positive/negative/neutral), active status, incident count
- **Tier Rank**: Visual ranking tier for player profiles. Attributes: label (S, A, B, C, D, F), background color (hex), display order, description
- **User Profile**: Extended user information including role. Attributes: user ID, email, username, role (user/moderator/admin), created date
- **Audit Log Entry**: Record of admin actions. Attributes: timestamp, admin user ID, action type (create/edit/delete), entity type (game/category/tier/user), entity ID, before/after values (JSON)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create a new game and see it available in the incident reporting dropdown within 5 seconds
- **SC-002**: Admins can search for a user by email and promote them to moderator in under 30 seconds
- **SC-003**: All admin actions appear in the audit log immediately with correct timestamps and user attribution
- **SC-004**: Tier list styling changes appear on all player profiles within 10 seconds of saving
- **SC-005**: The admin dashboard loads all management sections in under 2 seconds
- **SC-006**: 100% of admin actions that modify data are logged in the audit trail with no exceptions
- **SC-007**: Zero data loss occurs when admins edit games or categories that have existing incident associations
- **SC-008**: The system prevents 100% of unauthorized access attempts to admin features by non-admin users

## Assumptions *(optional)*

- The existing authentication system properly identifies users with admin role
- The database already has tables for games, incident_categories, and user_profiles
- The existing tier list system stores tier ranks in a configurable table
- Admins have modern browsers that support drag-and-drop functionality
- The platform has fewer than 100 admins (no need for complex admin search pagination initially)
- Database transactions ensure consistency when multiple admins edit simultaneously
- The existing incident reporting form dynamically loads categories from the database
- User sessions are persistent enough that role changes can be detected on next page load
- The platform uses server-side rendering or has a mechanism to invalidate client-side cache after admin changes

## Dependencies *(optional)*

### Existing Systems

- **Authentication System**: Must provide reliable admin role detection via session or JWT
- **Database**: Requires tables for games, incident_categories, tier_ranks, user_profiles, and new audit_logs table
- **Incident Reporting Form**: Must dynamically query active categories from database
- **Player Profile Pages**: Must dynamically render tier lists based on database configuration
- **Permission System**: Must support role-based access control (RBAC) for admin/moderator/user roles

### External Dependencies

- None - this is purely internal admin functionality using existing database and auth

### Data Requirements

- Existing games table with structure: id, name, slug, icon_url, created_at
- Existing incident_categories table with structure: id, label, emoji, behavior_type, is_active
- Existing tier_ranks table (or similar) with structure: id, label, color, display_order
- Existing user_profiles table with structure: user_id, email, username, role
- New audit_logs table needed with structure: id, timestamp, admin_user_id, action_type, entity_type, entity_id, before_value, after_value

## Out of Scope *(optional)*

### Not Included in This Feature

- **Bulk Operations**: Bulk import/export of games or categories (single-item CRUD only)
- **Advanced Permissions**: Granular permissions (e.g., "can only edit categories, not delete")
- **Content Moderation**: Reviewing or moderating incidents themselves (separate feature)
- **Analytics Dashboard**: Statistics on incident trends, top games, etc.
- **Email Notifications**: Notifying users when their role changes (could be future enhancement)
- **Audit Log Export**: Downloading audit logs as CSV/JSON (could be future enhancement)
- **Version History**: Tracking full edit history with rollback capability (audit log is view-only)
- **Multi-language Support**: Admin interface in multiple languages
- **Mobile Admin App**: Dedicated mobile app for admin tasks (web-only for now)
- **Scheduled Changes**: Scheduling category activations or game launches for future dates
- **Approval Workflow**: Requiring approval from another admin before changes go live
- **Custom Roles**: Creating custom roles beyond user/moderator/admin

### Future Enhancements

- Bulk category creation via CSV upload
- Rich text editor for tier descriptions
- Image upload for game icons instead of URL entry
- Advanced audit log search with regex patterns
- Real-time notifications when another admin is editing the same entity
