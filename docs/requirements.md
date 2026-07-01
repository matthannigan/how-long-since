# How Long Since App - Requirements Document

## Introduction

The "How Long Since" application is a household and personal task management system that focuses on tracking when tasks were last completed rather than creating traditional to-do lists. The app helps users identify suitable tasks based on available time and provides visual indicators for overdue tasks, all while maintaining high accessibility standards.

Unlike traditional task managers, this app answers the question "How long has it been since...?" for various responsibilities and activities, reducing mental load and helping users make better decisions about what to tackle next.

## Requirements

### Requirement 1: Task Management System

**User Story:** As a busy person managing household responsibilities, I want to create and manage tasks that track when they were last completed, so that I can easily see what needs attention without maintaining complex to-do lists.

#### Acceptance Criteria

1. WHEN a user creates a new task THEN the system SHALL allow them to specify a task name (required, max 128 characters)
2. WHEN a user creates a new task THEN the system SHALL allow them to optionally specify a description (max 512 characters)
3. WHEN a user creates a new task THEN the system SHALL allow them to assign the task to a category
4. WHEN a user creates a new task THEN the system SHALL allow them to optionally specify an expected frequency (value + unit: days/weeks/months/years)
5. WHEN a user creates a new task THEN the system SHALL allow them to optionally specify a time commitment (15min, 30min, 1hr, 2hrs, 4hrs+)
6. WHEN a user creates a new task THEN the system SHALL allow them to add optional notes (max 512 characters)
7. WHEN a user saves a task THEN the system SHALL validate all required fields and display clear error messages for any issues
8. WHEN a user wants to edit a task THEN the system SHALL provide the same interface as task creation with pre-populated fields
9. WHEN a user wants to remove a task THEN the system SHALL provide options to either archive or permanently delete the task
10. WHEN a user archives a task THEN the system SHALL hide it from active views but preserve the data for potential restoration

### Requirement 2: Task Completion Tracking

**User Story:** As a user tracking household tasks, I want to quickly mark tasks as completed and see when they were last done, so that I can maintain awareness of what needs attention without complex scheduling.

#### Acceptance Criteria

1. WHEN a user marks a task as complete THEN the system SHALL update the lastCompletedAt timestamp to the current date and time
2. WHEN a user views a task THEN the system SHALL display the time elapsed since last completion in human-readable format
3. WHEN a task has never been completed THEN the system SHALL display "Not done yet" or similar indicator
4. WHEN a user marks a task complete THEN the system SHALL provide positive feedback with an encouraging message
5. WHEN a user accidentally marks a task complete THEN the system SHALL provide an "Undo" option for 5 seconds via a dismissible snackbar/toast
6. WHEN a task has an expected frequency and is approaching or past due THEN the system SHALL visually indicate one of three tiers — "due soon," "overdue," or "very overdue" — each with multiple accessibility-compliant indicators (not color alone)
7. WHEN calculating overdue status THEN the system SHALL compare (current date − lastCompletedAt) to expectedFrequency as a percentage of the interval elapsed: below 80% is not due, 80–99% is "due soon," 100–149% is "overdue," and 150%+ is "very overdue" (see `AGENTS.md` Overdue Status Thresholds for the canonical values and colors)
8. WHEN a task has no expected frequency THEN the system SHALL NOT apply any overdue status
9. WHEN a task has an expected frequency but has never been completed (lastCompletedAt is null) THEN the system SHALL NOT apply any overdue status — overdue tracking only begins after the first completion

### Requirement 3: Category Organization System

**User Story:** As a user organizing various types of tasks, I want to group tasks into categories with visual indicators, so that I can quickly scan and find related tasks.

#### Acceptance Criteria

1. WHEN the system initializes THEN it SHALL provide default categories (Kitchen, Bathroom, Bedroom, Living Areas, Exterior, Vehicles, Digital/Tech, Health, Pets, Garden/Plants)
2. WHEN a user creates a new category THEN the system SHALL allow them to specify a name and select a color
3. WHEN a user creates a new category THEN the system SHALL optionally allow them to select an icon
4. WHEN displaying categories THEN the system SHALL use consistent visual indicators (color and icon) throughout the interface
5. WHEN a user wants to edit a category THEN the system SHALL allow modification of name, color, and icon
6. WHEN a user wants to delete a category THEN the system SHALL prevent deletion if tasks are assigned to it
7. WHEN a user wants to delete a category with tasks THEN the system SHALL offer to reassign tasks to another category
8. WHEN displaying tasks THEN the system SHALL group them by category in the default view
9. WHEN a category has no tasks THEN the system SHALL display an appropriate empty state with guidance

### Requirement 4: Time-Based Task Views

**User Story:** As a user with limited time windows, I want to view tasks organized by how long they take to complete, so that I can find tasks that fit my available time.

#### Acceptance Criteria

1. WHEN a user switches to time commitment view THEN the system SHALL group tasks by their estimated time commitment
2. WHEN displaying time commitment groups THEN the system SHALL order them from shortest to longest (15min, 30min, 1hr, 2hrs, 4hrs+)
3. WHEN a task has no time commitment specified THEN the system SHALL place it in a separate "Time Unknown" group at the bottom
4. WHEN in time commitment view THEN the system SHALL still display category information for each task
5. WHEN in time commitment view THEN the system SHALL still display time elapsed since last completion
6. WHEN a user switches between views THEN the system SHALL remember their preference for future sessions
7. WHEN switching views THEN the system SHALL maintain focus position when possible for accessibility
8. WHEN in either view THEN the system SHALL provide clear visual indication of which view is currently active

### Requirement 5: Quick Task Completion Interface

**User Story:** As a busy user, I want to quickly mark tasks as complete with minimal interaction, so that I can efficiently update my task status without interrupting my workflow.

#### Acceptance Criteria

1. WHEN viewing tasks THEN the system SHALL provide a prominent "Just Done" checkbox or button for each task
2. WHEN a user taps/clicks the completion control THEN the system SHALL immediately mark the task as complete
3. WHEN on mobile devices THEN the system SHALL support swipe-right gesture to mark tasks complete
4. WHEN swipe gestures are used THEN the system SHALL provide alternative button-based methods for accessibility
5. WHEN a task is marked complete THEN the system SHALL provide immediate visual feedback
6. WHEN a task is marked complete THEN the system SHALL update the time elapsed display immediately
7. WHEN using touch interfaces THEN all completion controls SHALL meet minimum 44px × 44px touch target requirements
8. WHEN using keyboard navigation THEN all completion controls SHALL be accessible via Tab and activated with Space or Enter

### Requirement 6: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want the application to work with assistive technologies and provide multiple ways to access information, so that I can use the app effectively regardless of my abilities.

#### Acceptance Criteria

1. WHEN using screen readers THEN the system SHALL provide appropriate ARIA labels and roles for all interactive elements
2. WHEN using keyboard navigation THEN the system SHALL provide logical tab order and visible focus indicators
3. WHEN displaying color-coded information THEN the system SHALL provide alternative indicators (icons, text, borders) that don't rely solely on color
4. WHEN displaying text THEN the system SHALL maintain at least 4.5:1 contrast ratio for normal text and 3:1 for large text
5. WHEN providing interactive elements THEN the system SHALL ensure minimum 44px × 44px touch targets
6. WHEN displaying overdue tasks THEN the system SHALL use multiple indicators: color change, icon, border, and screen reader announcement
7. WHEN forms have validation errors THEN the system SHALL clearly announce errors to screen readers and provide clear visual indicators
8. WHEN the user resizes text up to 200% THEN the system SHALL maintain functionality without horizontal scrolling
9. WHEN animations are present THEN the system SHALL respect user preferences for reduced motion
10. WHEN providing help text THEN the system SHALL make it programmatically available to assistive technologies

### Requirement 7: Data Persistence and Backup

**User Story:** As a user investing time in organizing my tasks, I want my data to be safely stored and backed up, so that I don't lose my task history and organization.

#### Acceptance Criteria

1. WHEN the user creates or modifies data THEN the system SHALL store it locally using IndexedDB
2. WHEN the user is offline THEN the system SHALL continue to function with full task management capabilities
3. WHEN the user wants to backup data THEN the system SHALL provide export functionality in JSON format
4. WHEN the user wants to backup data THEN the system SHALL optionally provide export functionality in CSV format
5. WHEN the user wants to restore data THEN the system SHALL provide import functionality that validates file format
6. WHEN importing data THEN the system SHALL provide clear error messages for any data validation issues
7. WHEN the system detects it's been 2 weeks since last backup THEN it SHALL remind the user to export their data
8. WHEN storing data THEN the system SHALL handle storage quota limitations gracefully
9. WHEN data operations fail THEN the system SHALL provide clear error messages and recovery suggestions
10. WHEN the user has been using the app for extended periods THEN the system SHALL provide archive functionality to manage data size

### Requirement 8: User Experience and Interface Design

**User Story:** As a user managing various tasks, I want an intuitive and efficient interface that reduces cognitive load, so that I can focus on completing tasks rather than learning how to use the app.

#### Acceptance Criteria

1. WHEN the user first opens the app THEN the system SHALL provide a brief onboarding experience explaining core functionality
2. WHEN displaying tasks THEN the system SHALL use a clean, scannable layout with clear visual hierarchy
3. WHEN the user needs help THEN the system SHALL provide contextual help text and tooltips
4. WHEN displaying time elapsed THEN the system SHALL use human-friendly formats ("2 days ago", "3 weeks ago")
5. WHEN the interface has empty states THEN the system SHALL provide helpful guidance on next steps
6. WHEN errors occur THEN the system SHALL display friendly, actionable error messages
7. WHEN the user completes tasks THEN the system SHALL provide encouraging feedback without being overwhelming
8. WHEN on mobile devices THEN the system SHALL use a mobile-first responsive design
9. WHEN on desktop THEN the system SHALL adapt the layout to take advantage of larger screens
10. WHEN the user prefers dark mode THEN the system SHALL provide a dark theme option that maintains accessibility standards

### Requirement 9: Performance and Technical Requirements

**User Story:** As a user expecting responsive applications, I want the app to load quickly and respond immediately to my interactions, so that it doesn't slow down my task management workflow.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL achieve Time to Interactive under 3 seconds
2. WHEN the app loads THEN the system SHALL achieve First Contentful Paint under 1.5 seconds
3. WHEN the user interacts with the interface THEN the system SHALL respond within 300ms for touch interactions
4. WHEN displaying large numbers of tasks THEN the system SHALL maintain smooth 60fps performance
5. WHEN the user switches between views THEN the system SHALL complete transitions within 200ms
6. WHEN using assistive technologies THEN the system SHALL announce state changes within 500ms
7. WHEN the app bundle is built THEN it SHALL be optimized for minimal size while maintaining functionality
8. WHEN the user has many tasks THEN the system SHALL implement efficient rendering strategies (virtualization if needed)
9. WHEN data operations occur THEN the system SHALL provide loading states for operations taking longer than 100ms
10. WHEN the system encounters performance issues THEN it SHALL gracefully degrade rather than becoming unresponsive

### Requirement 10: Content Strategy and Messaging

**User Story:** As a user interacting with the app's text and messages, I want clear, helpful, and encouraging communication that matches my needs and reduces stress, so that the app feels supportive rather than demanding.

#### Acceptance Criteria

1. WHEN displaying task completion messages THEN the system SHALL use encouraging but not overwhelming language
2. WHEN providing instructions THEN the system SHALL use clear, concise language at an 8th-grade reading level or lower
3. WHEN displaying error messages THEN the system SHALL explain what happened, why it matters, and what to do next
4. WHEN providing button text THEN the system SHALL use action-oriented, direct language ("Add Task" not "Click to Add Task")
5. WHEN addressing overdue tasks THEN the system SHALL avoid guilt-inducing language and focus on helpful information
6. WHEN providing help text THEN the system SHALL be contextual and practical rather than comprehensive
7. WHEN the user has no tasks THEN the system SHALL provide friendly guidance on getting started
8. WHEN displaying time commitments THEN the system SHALL use consistent, clear terminology
9. WHEN providing feedback THEN the system SHALL match the user's effort level (simple acknowledgment for routine actions)
10. WHEN the interface includes microcopy THEN it SHALL maintain consistent voice and terminology throughout the application