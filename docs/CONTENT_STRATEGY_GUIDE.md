# How Long Since - Content Strategy Guide

> Where this doc references Alex, Jordan, or Pat, those are the illustrative
> example users from `docs/USER_PERSONAS.md` — not an exclusive audience.
> Copy is organized by *need* (time-constrained, new to a responsibility,
> seeking variety/connection), not by persona identity — there's no
> mechanism in the app that detects or targets a specific persona.

## 1. Introduction

This Content Strategy Guide provides standards for all text within the "How Long Since" application. Our content approach focuses on creating clear, helpful, and efficient communication that aligns with our users' needs and the app's purpose of simplifying household task management.

## 2. Tone and Voice Guidelines

### 2.1 Core Voice Attributes

**Friendly but Efficient**
- Text should be warm but concise
- Avoid unnecessarily long explanations
- Use contractions to create a conversational feel
- Example: "Need to track your last home maintenance tasks? We've got you covered." (not "This application will help you to track when you last performed your household maintenance tasks.")

**Encouraging**
- Use positive reinforcement for task completion
- Celebrate consistency without being overly enthusiastic
- Acknowledge progress without judgment about frequency
- Example: "Nice work! Kitchen deep clean complete." (not "Finally cleaned the kitchen!")

**Helpful**
- Focus on utility and practical guidance
- Anticipate user needs without overexplaining
- Provide clear next steps in workflow situations
- Example: "Add your first task to get started" (not "Please navigate to the task input form to begin creating your task list")

**Direct**
- Use active voice when possible
- Lead with the most important information
- Use action verbs for button text and calls-to-action
- Example: "Mark complete" (not "Click here to mark this task as completed")

### 2.2 Language Standards

**Simplicity**
- Use everyday language, not technical jargon
- Aim for an 8th-grade reading level or lower
- Use short sentences and paragraphs
- Break complex concepts into smaller chunks

**Consistency**
- Maintain consistent terminology throughout the app
- Use the same terms for actions (e.g., "complete" not "finish" or "done")
- Ensure category names and time references remain consistent

**Inclusivity**
- Use gender-neutral language
- Avoid culturally specific references that might not translate globally
- Consider users of different abilities and technical comfort levels

### 2.3 Emotion and Personality

"How Long Since" should feel like a helpful household assistant: knowledgeable but not bossy, supportive but not patronizing.

**Do:**
- Use a light touch with humor (sparingly)
- Be conversational but efficient
- Acknowledge the sometimes tedious nature of household tasks
- Show understanding for busy lifestyles

**Don't:**
- Use guilt or shame regarding overdue tasks
- Sound robotic or overly technical
- Use cutesy language or excessive exclamation points
- Make assumptions about household structure or roles

### 2.4 Need-Based Language Patterns

Our app serves diverse users with different needs, not a fixed set of life
stages. These patterns are organized by *need* — any user might match one,
several, or none on a given day:

> **Phase note (2026-07, updated post-B9):** The "Example notification" lines
> below are aspirational — OS/push notifications are deferred to Phase 3 (they
> need a server; see the B9 register,
> `dev/2026-07-07_notifications-research/register.md`). The shipped app delivers
> reminders *in-app*, and the Settings → Notifications copy now says so plainly.
> The rest of each pattern applies to in-app copy today.

**For time-constrained moments:**
- **Acknowledge time constraints:** "Find tasks that fit between school drop-off and your next meeting."
- **Recognize multiple responsibilities:** "Balance work and home tasks in one place."
- **Emphasize efficiency:** "Quick-tap to mark done—back to what matters in seconds."
- **Validate the mental load:** "We'll remember when you last cleaned the fridge so you don't have to."
- **Example notification:** "You have a 15-minute window before dinner prep. Perfect time to clean the medicine cabinet!"

**For tasks a user is new to:**
- **Provide reassurance:** "Not sure how often to clean gutters? We'll help you track the right intervals."
- **Educational tone for maintenance tasks:** "Regular HVAC filter changes can improve efficiency and air quality."
- **Budget-conscious language:** "Stay on top of preventative maintenance to avoid costly repairs."
- **Pet-inclusive terminology:** "Track both home and pet care tasks in one place."
- **Example notification:** "It's been raining all week. Might be time to check those gutters—last cleaned 6 months ago."

**For variety- and connection-seeking users:**
- **Focus on life enrichment:** "Track hobbies and social activities, not just household tasks."
- **Value meaningful connections:** "Remember to reach out to family members regularly."
- **Emphasize variety:** "Mix things up! Try something new this week."
- **Respect experience:** "Customize task frequency to fit your preferences and lifestyle."
- **Example notification:** "It's been three weeks since your last painting class. Time for creative expression!"

## 3. Microcopy Examples

### 3.1 Task Management

**Adding Tasks:**
- Button: "Add Task"
- Header: "New Task"
- Confirmation: "Task added"
- Empty state: "Add your first task to get started"

**Completing Tasks:**
- Button: "Just Done"
- Confirmation: "Marked as complete"
- Success message: "Nice work! Updated [task name]"
- Reset option: "Undo"

**Editing Tasks:**
- Button: "Edit"
- Header: "Edit Task"
- Confirmation: "Task updated"
- Delete option: "Remove Task"

**Task Fields:**
- Field label: "Task name" (not "Enter the name of your task")
- Required indicator: "Required"
- Placeholder: "What needs to be done?" (not "Please enter the task name here")
- Helper text: "Max 128 characters" (not "You may enter up to 128 characters for the task name")

### 3.2 Navigation and Views

**Views:**
- Quick Wins view (default): "Quick Wins" — leads with the prompt "How much time do you have?"
- Category view: "By Category"
- Time view: "By Time Needed"
- Toggle: "Switch view"

**Categories:**
- Header: "Categories"
- Add category: "New Category"
- Edit category: "Edit"
- Delete category: "Remove"

**Time Filters:**
- Quick filters: "15 min or less" / "30 min or less" / "1 hour or less" / "Long tasks"
- Custom filter: "Custom time filter"

### 3.3 Settings and Configuration

**App Settings:**
- Header: "Settings"
- Theme: "Appearance"
- Data: "Manage Data"
- Export: "Export Data"
- Import: "Import Data"
- Reset: "Reset App"

**Preferences:**
- View preference: "Default view"
- Theme preference: "Theme"
- Overdue indicator: "Show overdue warnings"

### 3.4 Task Status

**Time Elapsed:**
- Just completed: "Just now"
- Recent: "X hours ago"
- Same day: "Today"
- Previous day: "Yesterday"
- Recent past: "X days ago"
- Longer past: "X weeks ago" / "X months ago" / "X years ago"
- Never completed: "Not done yet"

**Overdue Indicators:**
- Approaching: "Due soon"
- Recently overdue: "Overdue"
- Significantly overdue: "Very overdue"

**Time Commitment:**
- Very short: "15 min"
- Short: "30 min"
- Medium: "1 hr"
- Long: "2 hrs"
- Very long: "4+ hrs"

### 3.5 Empty States

**No Tasks:**
- Main list: "No tasks yet. Tap + to add your first task."
- Category: "No tasks in this category. Add one?"
- Time filter: "No tasks match this time filter."

**No Categories:**
- Category list: "Add a category to organize your tasks."

**Data Import/Export:**
- No backup: "No previous backups found."

### 3.6 Expanded Use Cases

**For Household Tasks:**
- Kitchen: "Deep clean refrigerator" / "Clean oven" / "Descale coffee maker"
- Bathroom: "Clean shower grout" / "Replace shower curtain liner" / "Restock toiletries"
- Home Maintenance: "Change HVAC filter" / "Test smoke detectors" / "Clean gutters"

**For Pets (default category):**
- Health: "Apply flea treatment" / "Schedule vet check-up" / "Trim nails"
- Maintenance: "Clean pet bedding" / "Replace water filter" / "Clean litter box"
- Enrichment: "Long walk at the park" / "Replace worn toys" / "Training session"
- Success message: "Flea treatment applied! [Pet name] is protected for another month."

**For Child-Related Tasks (custom category):**
- Health: "Schedule pediatrician visit" / "Refill medications" / "Check growth milestones"
- School: "Review homework routine" / "Check in with teacher" / "Organize school supplies"
- Activities: "Rotate toys" / "Sign up for seasonal activities" / "Update family calendar"
- Success message: "Kids' seasonal clothes rotated! Ready for the changing weather."

**For Social & Enrichment Activities (custom category):**
- Connections: "Video call with grandchildren" / "Coffee with neighborhood friends" / "Send cards to distant relatives"
- Hobbies: "Attend painting class" / "Visit new museum exhibit" / "Join book club meeting"
- Learning: "Practice new language" / "Take cooking workshop" / "Attend lecture series"
- Success message: "Great job connecting with family! Last video call: Today"

## 4. Error Message Standards

### 4.1 Error Message Principles

**Be Clear**
- Clearly state what went wrong
- Use plain language, not error codes
- Explain the impact of the error

**Be Helpful**
- Suggest a solution when possible
- Provide a clear next step
- Avoid technical jargon

**Be Concise**
- Keep error messages brief
- Focus on what matters to the user
- Don't overwhelm with details

### 4.2 Error Message Structure

**Format:**
1. What happened (clear statement of the error)
2. Why it matters (impact on the user, if needed)
3. What to do next (suggested action)

**Visual Treatment:**
- Use a consistent error icon (!)
- Present in a noticeable but not alarming way
- Ensure high contrast for readability

### 4.3 Error Message Examples

**Form Validation Errors:**
- Empty required field: "Please add a task name."
- Character limit: "Task name is too long. Max 128 characters."
- Invalid data: "Please enter a valid [field type]."

**Task Management Errors:**
- Duplicate task: "This task already exists."
- Cannot delete: "Cannot delete the default category. Try editing it instead."
- Cannot save: "Changes couldn't be saved. Try again."

**Data Errors:**
- Import failed: "Import failed. The file may be corrupted or in the wrong format."
- Export failed: "Couldn't create backup. Please try again."
- Storage issue: "Storage space is low. Consider removing old tasks."

**Connectivity Errors:**
- Offline mode: "You're offline. Changes will sync when you reconnect."
- Sync failed: "Couldn't sync your latest changes."

**System Errors:**
- App crash: "Something went wrong. The app has been reset."
- Feature unavailable: "This feature isn't available right now. Please try again later."

## 5. Help Text Guidelines

### 5.1 Help Text Principles

**Contextual**
- Provide help when and where it's needed
- Anticipate common questions in each context
- Don't overwhelm with information

**Progressive**
- Start with basic information
- Allow users to access more detailed help if needed
- Use progressive disclosure techniques

**Practical**
- Focus on common tasks and questions
- Use examples where helpful
- Provide actionable advice

### 5.2 Types of Help Content

**Tooltips:**
- Length: 1-2 short sentences
- Purpose: Quick explanation of a specific element
- Trigger: Hover/long press on UI element
- Example: "Tasks are sorted by category. Tap to expand."

**Field Help:**
- Length: 1-2 lines
- Purpose: Clarify input requirements
- Placement: Below form fields
- Example: "Choose a time estimate that best fits this task."

**Onboarding Hints** *(Phase 2 — the shipped app has no onboarding tour or
swipe gestures; pattern retained for when it does)*:
- Length: 1-3 sentences
- Purpose: Guide first-time users
- Trigger: First use of a feature
- Example: "Swipe right on a task to mark it complete. Try it now!"

**Feature Explanations:**
- Length: 3-5 sentences
- Purpose: Explain core functionality
- Placement: In settings or help section
- Example: "Time View groups tasks by how long they take to complete. This helps you find tasks that match your available time, like finding a 15-minute task during a short break."

**FAQ Section:**
- Length: Comprehensive but scannable
- Purpose: Answer common questions
- Organization: Organized by feature or task
- Example questions:
  - "How does 'How Long Since' calculate overdue tasks?"
  - "Can I share task lists with my household?"
  - "How do I back up my data?"

### 5.3 Help Content Examples

**Task Creation Help:**
"Add details about your task to help organize it better. Categories help you group similar tasks, while time estimates help you find tasks that fit your available time."

**Time Elapsed Help:**
"'How Long Since' tracks when you last completed each task. Tasks become red when they're overdue based on your expected frequency. No frequency set? No pressure—we'll still track when it was last done."

**Swipe Gestures Help** *(Phase 2 — swipe gestures are not in the shipped
1.0.0 app; do not surface this copy yet)*:
"Swipe right on any task to mark it complete. Swipe left to edit details like the category or time estimate."

**Data Backup Help:**
"We recommend backing up your data regularly. Backups are stored as files on your device and can be used to restore your tasks if needed."

## 6. Cognitive Load Reduction Through Content

### 6.1 Mental Load Reduction Strategies

**Using Language to Reduce Cognitive Burden:**
- Avoid asking users to remember information the app can track
- Eliminate decision fatigue with clear, actionable suggestions
- Reduce anxiety by using reassuring, non-judgmental language
- Provide just-in-time information rather than requiring advance planning

**Examples:**
- Instead of: "When did you last clean your gutters?"
  Better: "Last gutter cleaning: 6 months ago. Typically needed: Every 6 months."

- Instead of: "Choose a task to complete."
  Better: "You have 20 minutes. Here are tasks that fit:"

- Instead of: "This task is 2 months overdue."
  Better: "Time for air filter change—it's been 3 months."

### 6.2 Quick-Access Content Patterns

**Quick Decision Making:**
- Display time needed prominently to facilitate quick selection
- Use color and visual indicators alongside text for faster scanning
- Present the most relevant contextual information first

**Quick Completion:**
- Position "Just Done" text and buttons consistently for muscle memory
- Use short, action-oriented phrases for frequently used functions
- Minimize reading required for routine actions

**Content Shortcuts:**
- "Quick tasks" category highlighting 5-minute tasks, for time-constrained moments
- "Seasonal maintenance" reminders with bundled tasks, for home-upkeep tasks
- "Connection reminders" for maintaining relationships, for social/enrichment tasks

### 6.3 Contextual Awareness in Content

**Time-Based Content:**
- Morning: "Start your day with a quick win: 5-minute task?"
- Evening: "Wind down with these simple tasks before bed."
- Weekend: "Catch up on home maintenance with these tasks."

**Situation-Based Content:**
- Rainy day: "Perfect time for indoor organizing tasks."
- Limited time: "Only have 10 minutes? Try these quick tasks."
- Many overdue tasks: "Start with one small task to build momentum."

## 7. Content Governance

> Renumbered June 2026 — this section was previously mis-nested as "## 7.
> Life Stage-Specific Content" with its subsections numbered 6.1–6.3
> (duplicating the section-6 numbering above) and the actual persona-named
> content sitting at 7.1–7.3 below. Content Review/Workflow/Ownership is a
> process topic, not content itself, so it gets its own section here; the
> persona-named content that followed it is reworked into "Need-Based
> Content Patterns" (now section 8) below.

### 7.1 Content Review Process

**Before Development:**
- Review all UI text against these guidelines
- Check for consistency in terminology
- Ensure all user flows have appropriate content

**During Development:**
- Review actual implementations in context
- Test readability on various screen sizes
- Verify accessibility of all text

**After Launch:**
- Collect user feedback on clarity
- Monitor support requests for content-related issues
- Iterate based on user understanding

### 7.2 Content Workflow

1. **Identify need:** Determine where text is needed in the UI
2. **Draft text:** Create initial copy following these guidelines
3. **Review:** Check against principles and for consistency
4. **Implement:** Add to the application
5. **Test:** Verify clarity and effectiveness with users
6. **Iterate:** Refine based on feedback and usage data

### 7.3 Content Ownership

Designate a content owner responsible for:
- Maintaining consistent voice throughout the application
- Approving new text additions or changes
- Creating templates for common messages
- Documenting content decisions and rationales

## 8. Need-Based Content Patterns

### 8.1 New-to-a-Responsibility Content

**Educational Content:**
- Provide context for maintenance tasks: "Regular gutter cleaning prevents water damage to your foundation."
- Offer reassurance for first-time tasks: "First time changing an HVAC filter? It's easier than you think."
- Include time-saving tips: "While cleaning windows, also check seals for wear and tear."

**Building Good Habits:**
- Emphasize routine building: "Creating a maintenance schedule now saves time and money later."
- Acknowledge learning curve: "Still figuring out home maintenance rhythms? We'll help you track what works."
- Highlight progress: "You've completed 8 home maintenance tasks this month. Great start to homeownership!"

**Support During Overwhelm:**
- Provide prioritization guidance: "Start with these critical maintenance tasks."
- Break down complex responsibilities: "Home exterior maintenance: broken into manageable 30-minute tasks."
- Offer perspective: "Many tasks seem urgent, but here's what actually needs attention this week."

### 8.2 Time-Constrained User Content

**Efficiency-Focused Language:**
- Highlight time-saving opportunities: "These kitchen tasks can be done while supervising homework."
- Bundle related tasks: "While organizing kids' clothes, also check for outgrown items to donate."
- Emphasize multi-tasking potential: "This 15-minute task can be completed during the kids' bath time."

**Family Involvement Language:**
- Suggest task-sharing: "This could be a good task to do with the kids!"
- Acknowledge family dynamics: "Schedule a quiet task for naptime."
- Celebrate shared accomplishments: "Family bathroom cleaning complete—everyone pitched in!"

**Support During Overwhelm:**
- Permission to prioritize: "Some tasks can wait—focus on what matters today."
- Recognize constraints: "Short on time? Try this 5-minute task between appointments."
- Validate struggles: "Busy week? Even one small task completed makes a difference."

### 8.3 Variety & Connection-Seeking Content

**Life Enrichment Focus:**
- Balance practical and enjoyable: "Home tasks done for the week! Time to focus on your painting hobby."
- Celebrate curiosity: "Tried something new this month? Add it to your tracking list."
- Encourage variety: "Mix different types of activities for a balanced week."

**Connection-Oriented Language:**
- Prompt meaningful interactions: "It's been two weeks since you last called your grandchildren."
- Suggest social activities: "Your garden club meets tomorrow—plants looking good!"
- Balance solitary and social: "After tackling these solo tasks, how about scheduling a coffee date?"

**Autonomy and Control:**
- Emphasize customization: "Adjust any task frequency to match your preferred routine."
- Support agency: "You decide which tasks matter most—we'll help you track them."
- Acknowledge expertise: "Based on your completion patterns, these task frequencies seem to work well for you."

## 9. Accessibility Considerations

Ensure all content adheres to accessibility best practices:

- Use plain language (8th-grade reading level or lower)
- Avoid idioms and colloquialisms that may not translate well
- Ensure error messages are clear and actionable
- Provide sufficient context for screen readers
- Use descriptive button and link text (avoid "click here")
- Ensure color is not the only indicator of status or meaning
- Provide alternative text for icons and visual indicators

## 10. Localization Preparation

While initial release may be English-only, prepare content for future localization:

- Avoid culturally specific references
- Leave room for text expansion (some languages require more space)
- Use universal icons where possible
- Document context for translators
- Use simple sentence structures
- Avoid wordplay that may not translate well

---

This Content Strategy Guide provides the foundation for creating consistent, helpful, and user-focused content throughout the "How Long Since" application. By following these guidelines, we'll create an experience that feels cohesive, supportive, and aligned with our users' needs.

## 11. Phase 1.1 Addendum — Instances & Series microcopy

Added 2026-07-03 with the instances & series feature (see
`dev/2026-07-03_grouped-tasks/phase1.1.md`).
All strings follow the §2 tone rules; they are listed here so the guide stays
the single source of user-visible copy.

### Add/Edit Task form

| Context | Copy |
|---|---|
| Fan-out disclosure button (create mode) | "Track in multiple places" |
| Instance label field label (both modes) | "Where — or who?" |
| Field helper text | "Add each place or pet — one task is created for each." |
| Chip input placeholder | "e.g. Guest room, Luna" |
| Suggestion row accessible label | "Suggestions" |
| Chip remove button accessible label | "Remove {label}" |
| Label too long (edit mode validation) | "Keep this label under 40 characters." |
| Batch success toast (n > 1) | "{n} tasks added" (single task keeps "Task added") |

### Series group row (By Category / By Time)

| Context | Copy |
|---|---|
| Places count chip | "{n} places" |
| Overdue summary (only when x > 0; counts overdue + very overdue) | "{x} of {n} overdue" |
| Screen-reader worst-of status | "Due soon" / "Overdue" / "Very overdue" (matches task rows) |
| Expanded container accessible label | "{series name} instances" |

### Completion of a labeled task

| Context | Copy |
|---|---|
| Completion toast | "Nice work! Updated {name} — {label}" |
| Completion button accessible label | "Mark {name} — {label} complete" |

No guilt language in the overdue summary — "2 of 5 overdue" states a fact and
the expanded rows carry the same supportive tone as everywhere else.
