# How Long Since - Product Briefing

## Overview
"How Long Since" is a household and personal task management application designed to track *when* tasks were last completed rather than managing a traditional to-do list. Unlike standard task managers that focus on due dates, this app answers the nagging question "How long has it been since...?" for various responsibilities.

The application helps users identify suitable tasks based on their available time windows (e.g., "I have 15 minutes free") and provides clear visual indicators for overdue items. It is built with a "Local-First" philosophy, ensuring privacy and speed, while being architected to support cloud synchronization in future updates.

## Key Differentiators
- **Time-Elapsed Tracking:** Focuses on the interval since the last completion rather than arbitrary due dates.
- **Context-Aware:** Organizes tasks by both Category (what it is) and Time Commitment (how long it takes).
- **Privacy-Centric:** All data lives on the user's device initially; no account creation is required to start.
- **Accessibility First:** Built from the ground up to be usable by people with diverse abilities (screen readers, high contrast, motor impairments).
- **Instant Feedback:** Designed for rapid entry and interaction ("Just Done" checking).

## Core User Story
"As a busy person with various responsibilities, I want to track how long it has been since I performed specific recurring tasks. I need to identify what I can achieve in my limited free time so that my household maintenance doesn't feel overwhelming."

## Example User Personas
"How Long Since" serves a general population of diverse users with different needs and life stages. For purposes of planning app functionality we can use personas like these as examples:

1. **Busy Parents** (represented by Alex)
   - Healthcare professionals or others with demanding jobs
   - Managing both work and household responsibilities
   - Limited time windows for tasks
   - Need to reduce mental load and household management stress

2. **First-time Homeowners** (represented by Jordan)
   - Learning home maintenance rhythms and requirements
   - Managing pet care alongside home responsibilities
   - Building good habits for preventative maintenance
   - Working within budget constraints

3. **Active Retirees** (represented by Pat)
   - Tracking social connections and enrichment activities
   - Maintaining variety in retirement lifestyle
   - Balancing household tasks with hobbies and learning
   - May have accessibility needs like larger text or higher contrast

**These are only example user personas.** We are not designing an app with limited appeal only to these audiences.

## Functionality

### Primary Views
1. **Categorical Task List** (Main/Default View)
   - Tasks organized by category with color-coding
   - Each task displays:
     - Task name
     - Time elapsed since last completion
     - Estimated time commitment (visual indicator system)
   - Visual indicators for overdue tasks (color, icon, and border)
   - Checkbox for "Just Done" task completion

2. **Time Commitment View**
   - Same tasks organized by time required to complete
   - Helps answer "What can I do with 15 minutes?"
   - Tasks still show category and time elapsed
   - Same "Just Done" checkbox functionality

### Core Features
1. **Task Management**
   - Add new tasks with:
     - Task name
     - Category (with visual identifier)
     - Notes
     - Expected frequency
     - Estimated time commitment
   - Edit existing tasks (same interface as add)
   - Archive and delete tasks
   - Category management with customizable colors

2. **Task Completion**
   - One-tap "Just Done" checkbox for quick marking
   - Swipe gestures with non-gesture alternatives
   - Updates "last completed" timestamp automatically
   - Positive reinforcement messaging

3. **Visual Indicators**
   - Clear display of time elapsed since last completion
   - Multiple warning indicators for overdue tasks (not just color)
   - Categories with icons and colors for easy scanning
   - Time commitment visualization system

4. **User Experience**
   - Friendly but efficient content tone
   - Contextual help text
   - Clear error messages
   - Onboarding guidance for new users
   - Support for screen readers and keyboard navigation

5. **Data Management**
   - Import/export functionality
   - Backup reminders
   - Data persistence in offline mode

## Platform & Capabilities

### Technology Strategy
*   **Web-Based App (PWA):** The application runs in the browser but can be installed on a phone home screen like a native app.
*   **Offline-First:** The app works fully without an internet connection.
*   **Local Storage:** For Version 1, all data is stored securely in the user's browser. This ensures total privacy and zero latency.
*   **Future-Ready Architecture:** The code is structured to allow for an easy transition to Cloud Sync (Version 2) without rewriting the application, allowing for future multi-device support.

### User Interface
- Mobile-first responsive design
- Bottom-positioned "Add Task" button for thumb accessibility
- Easy toggle between category and time commitment views
- Adaptive layout for desktop (multi-column dashboard)
- Dark mode support
- High contrast mode option

## Accessibility Commitment
"How Long Since" treats accessibility as a functional requirement, not an add-on.

*   **Visual:** High contrast modes, support for system text resizing, and non-color indicators (icons/text) for status changes.
*   **Motor:** Large touch targets (buttons) for easier tapping; "swipe" gestures are supplemented by standard buttons.
*   **Cognitive:** The interface is designed to reduce mental load—hiding non-essential information and using clear, plain language.
*   **Assistive Tech:** Full support for screen readers and keyboard navigation (WCAG 2.1 AA Compliance).

## Roadmap & Phasing

### Phase 1: The Foundation (MVP)
*   **Goal:** A robust, single-user utility that works offline.
*   **Scope:**
    *   Create, Edit, Archive, Delete tasks.
    *   "Just Done" logic.
    *   Category and Time views.
    *   Local data storage (IndexedDB).
    *   CSV Import/Export.
    *   Full Accessibility compliance.

### Phase 2: Enhanced Experience
*   **Goal:** Better user guidance and personalization.
*   **Scope:**
    *   Pre-built task templates (e.g., "New Homeowner Starter Pack").
    *   Desktop-optimized dashboard layout.
    *   Onboarding tutorials.
    *   Advanced filtering logic.

### Phase 3: Cloud & Community (Future)
*   **Goal:** Multi-device access and sharing.
*   **Scope:**
    *   User Accounts / Authentication.
    *   Cloud Synchronization.
    *   Shared Households (Partner A sees when Partner B completed a task).

## Design Principles
- Simplicity over complexity
- Quick access over deep features
- Visual clarity with multiple indicators for status
- "Tap and go" interaction model for task completion
- Inclusive design for all abilities
- Content that reduces mental load

## Content Strategy
- Friendly but efficient tone
- Encouraging language for task completion
- Contextual help text
- Clear error messages
- Life-stage specific content approaches:
  - Efficiency-focused for busy parents
  - Educational for new homeowners
  - Life-enrichment focused for active retirees

## Branding Elements
- Color system with:
  - Primary app colors
  - Status indicators (overdue, completed)
  - Category color coding
- Typography system with clear hierarchy
- Consistent iconography
- Visual indicator systems for time commitment and elapsed time