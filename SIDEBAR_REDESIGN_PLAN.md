# Sidebar Redesign - Workflow-Focused Layout

## 🎯 Goal
Create a clean, workflow-driven sidebar where each step is clearly visible with prominent action buttons.

## 📐 New Layout Structure

```
┌────────────────────────────────────┐
│  🚀 StudyPulse - AI STUDY PLANNER  │ ← Fixed Header
├────────────────────────────────────┤
│ [SCROLLABLE CONTENT AREA]          │
│                                    │
│ 👋 Hello, User!                    │ ← Greeting (compact)
│ Status: 📝 2 Subjects Added        │ ← Workflow Status
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ➕ STEP 1: ADD SUBJECTS        │ │
│ │                                 │ │
│ │ [4-Step Wizard - Compact]       │ │
│ │ • Choose → Duration → Break →  │ │
│ │                                 │ │
│ │ [Queue: 2 items with X delete] │ │
│ │                                 │ │
│ │ [➕ Add Subject Button]         │ │ ← Visible always
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 🧠 STEP 2: GENERATE SCHEDULE   │ │
│ │                                 │ │
│ │ [🧠 Generate Schedule Button]   │ │ ← Large, prominent
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 📅 STEP 3: SCHEDULE READY      │ │ ← Only after generation
│ │                                 │ │
│ │ [Session Preview List]          │ │
│ │ • Math - 45 min                 │ │
│ │ • Physics - 60 min              │ │
│ │                                 │ │
│ │ [▶️ Start Study Session]        │ │ ← Primary action
│ │ [✏️ Adjust] [🔄 Retry]         │ │ ← Secondary grid
│ └────────────────────────────────┘ │
│                                    │
│ [End of scroll]                    │
├────────────────────────────────────┤
│ [⚙️ Settings]  [🚪 Logout]        │ ← Fixed Footer
└────────────────────────────────────┘
```

## 🎨 Visual Hierarchy

### Primary Actions (Always Visible)
1. **➕ Add Subject** - After completing 4-step wizard
2. **🧠 Generate Schedule** - When queue has items
3. **▶️ Start Study Session** - When schedule is ready

### Secondary Actions (Contextual)
- **✏️ Adjust** - Edit schedule manually
- **🔄 Retry** - Regenerate with same queue
- **❌ Delete** - Remove items from queue

## 🔄 Workflow States

### State 1: Empty (Initial)
- Greeting visible
- Status: "🎯 Start Planning"
- Add Subjects section expanded
- Wizard at Step 1

### State 2: Queue Building
- Status: "📝 X Subjects Added"
- Queue list visible with delete buttons
- ➕ Add Subject button visible
- 🧠 Generate Schedule button visible (disabled if empty)

### State 3: Generating
- 🧠 Button shows spinner
- Text: "Generating Schedule..."
- Other actions disabled

### State 4: Schedule Ready
- Status: "✅ Schedule Ready"
- Schedule Ready section appears
- Session preview list visible
- ▶️ Start button prominent
- ✏️ Adjust and 🔄 Retry visible

### State 5: Session Running
- Status: "🎯 Session in Progress"
- Timer indicator visible
- Action buttons hidden
- Only show "Session in Progress..." message

## 🎯 Button Specifications

### ➕ Add Subject
- **Type**: Primary action in wizard
- **Style**: Purple gradient
- **Size**: Full width, 1rem padding
- **Icon**: Plus icon
- **Action**: `addSubjectToQueue()`

### 🧠 Generate Schedule
- **Type**: Primary action
- **Style**: Pink-purple gradient with glow
- **Size**: Full width, 1.25rem padding
- **Icon**: Zap icon + brain emoji
- **Action**: `handleGenerateSchedule()`
- **Loading**: Spinner + "Generating Schedule..."

### ▶️ Start Study Session
- **Type**: Primary action
- **Style**: Bright green gradient with strong glow
- **Size**: Full width, 1.25rem padding
- **Icon**: Play emoji
- **Action**: `handleStartSession()`

### ✏️ Adjust / 🔄 Retry
- **Type**: Secondary actions
- **Style**: Subtle white overlay
- **Size**: Grid 1fr 1fr, 0.875rem padding
- **Actions**: `handleAdjustSchedule()` / `handleRegenerateSchedule()`

## 📦 Component Organization

```javascript
<Sidebar>
  <FixedHeader>
    <Logo />
  </FixedHeader>
  
  <ScrollableContent>
    <CompactGreeting />
    <WorkflowStatus />
    
    <Section1_AddSubjects>
      <SectionHeader icon="➕" title="Step 1: Add Subjects" />
      <FourStepWizard />
      <QueueList />
      <AddSubjectButton />  {/* Always visible */}
    </Section1_AddSubjects>
    
    <Section2_GenerateSchedule>
      <SectionHeader icon="🧠" title="Step 2: Generate Schedule" />
      <GenerateButton />  {/* Visible when queue.length > 0 */}
    </Section2_GenerateSchedule>
    
    {recommendations && (
      <Section3_ScheduleReady>
        <SectionHeader icon="📅" title="Step 3: Schedule Ready" />
        <SchedulePreview />
        <StartSessionButton />  {/* Primary */}
        <SecondaryActionsGrid>
          <AdjustButton />
          {internal && <RetryButton />}
        </SecondaryActionsGrid>
      </Section3_ScheduleReady>
    )}
  </ScrollableContent>
  
  <FixedFooter>
    <SettingsButton />
    <LogoutButton />
  </FixedFooter>
</Sidebar>
```

## 🎨 Styling Updates

### Section Cards
- Background: `rgba(139, 92, 246, 0.06)` with blur
- Border: `1px solid rgba(139, 92, 246, 0.2)`
- Radius: `20px`
- Padding: `1.5rem`
- Margin bottom: `1.25rem`

### Section Headers
- Icon background: Purple gradient
- Title: White, 1rem, bold
- Subtitle: Light gray, 0.75rem

### Buttons
- Border radius: `14px` for large, `12px` for medium
- Box shadow: Matching color glow
- Hover: `scale(1.02)`, `y: -2px`
- Tap: `scale(0.98)`

## ✅ Success Criteria

- [ ] All 4 buttons clearly visible and labeled
- [ ] Workflow progresses logically (1 → 2 → 3)
- [ ] Generate button triggers ML API call
- [ ] Schedule displays after successful generation
- [ ] Start button launches sequential timers
- [ ] Adjust button opens editor modal
- [ ] No cluttered UI - clean sections
- [ ] No scrolling issues with timers
- [ ] Premium, professional appearance

## 🚀 Implementation Priority

1. ✅ Create section-based layout structure
2. ✅ Add prominent section headers with icons
3. ✅ Make all buttons visible and properly labeled
4. ✅ Ensure proper spacing between sections
5. ✅ Add workflow status indicator
6. ✅ Test complete end-to-end flow
