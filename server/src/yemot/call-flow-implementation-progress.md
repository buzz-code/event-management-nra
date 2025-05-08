# IVR Call Flow Implementation Progress Tracker

## Epic: Implement Updated IVR Call Flow for Event Management System

Last Updated: May 8, 2025

### Task 1: Implement Main Menu Structure ✅
- [x] Create new main menu with 4 options:
  - Option 1: Report celebration
  - Option 2: Choose path/track
  - Option 3: Choose vouchers
  - Option 4: Update after celebration
- [x] Implement conditional access for options 2 and 3 (only for IDs with existing celebrations)
- [x] Establish routing logic between menu options

### Task 2: Update Student Identification Flow ✅
- [x] Change error message for invalid ID to allow retry instead of ending call
- [x] Update validation logic to prevent call termination on identification errors

### Task 3: Implement Event Existence Handling Changes ✅
- [x] Disable ability to edit existing events
- [x] Add notification with phone number (0533152632) to call for modifications
- [x] Update event existence check logic

### Task 4: Handle End-of-Year ✅
- [x] If the student has selected a date that is more that 6 month in the past, assume the event is in the next year

### Task 5: Implement Post-Event Update Functionality ✅
- [x] Create new flow for updating path completion status after celebrations
- [x] Develop logic for recording which path was completed
- [x] Update database schema if needed to track completion status (schema already supported this)

### Task 6: Update Confirmation Steps & Process ✅
- [x] Add confirmation dialog after voucher selection
- [x] Implement confirmation prompts with option to modify selections
- [x] Add warning that voucher selections cannot be changed after confirmation

### Task 7: Implement Terminology Changes Throughout System ✅
- [x] Update "Level Types" to "Path/Track" (מסלול) in all menus and messages
- [x] Update "Gifts" to "Vouchers" (שוברים) in all menus and messages
- [x] Review and update all related prompts for consistency

### Task 8: Update Call Ending Behavior ❌
- [ ] Implement context-specific success messages based on completed action
- [ ] Allow navigation to other menu options after task completion
- [ ] Update call flow to support multiple operations in a single call

### Task 9: Auto Select The Event on Post-Event Update, if Only One Event Exists ❌
- [ ] Plan how to handle single selection with auto-selection
- [ ] Implement logic to auto-select the event if only one exists

### Task 10: Refactor Code for Clarity and Maintainability ❌
- [ ] Read all code to get a better understanding of the flow
- [ ] Plan how would you have written the code if you were to start from scratch
- [ ] Explain the plan and ask for feedback
- [ ] Refactor the code to improve clarity and maintainability
- [ ] Ensure that the refactored code is self-documented and follows best practices

## Implementation Notes

### Current Flow Overview
The current flow in `yemot-handler.ts` follows these steps:
1. Student identification
2. Event type selection
3. Event date selection
4. Check if event exists
5. Level type selection (currently allows editing existing events)
6. Gift selection (up to 3)
7. Save event
8. End call with success message

### New Flow Overview
The new flow will:
1. Present main menu with 4 options
2. Based on selection, route to appropriate handler
3. Prevent editing of existing events (provide phone number instead)
4. Update terminology (Level Types → Paths, Gifts → Vouchers)
5. Add confirmation steps for selections
6. Allow post-event status updates
7. Provide context-specific success messages
8. Allow multiple operations in a single call

## Technical Details
- File to update: `/server/src/yemot/yemot-handler.ts`
- Related handlers that will need updates:
  - `student-handler.ts`
  - `event-existence-handler.ts`
  - `level-type-handler.ts` (rename to path-handler.ts)
  - `gift-handler.ts` (rename to voucher-handler.ts)
  - `event-saver.ts`
- Possibly need to create new handlers:
  - `main-menu-handler.ts`
  - `post-event-handler.ts`
  - `confirmation-handler.ts`