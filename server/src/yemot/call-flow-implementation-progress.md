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

### Task 2: Update Student Identification Flow 🔄 (In Progress)
- [ ] Change error message for invalid ID to allow retry instead of ending call
- [ ] Update validation logic to prevent call termination on identification errors

### Task 3: Implement Event Existence Handling Changes ❌
- [ ] Disable ability to edit existing events
- [ ] Add notification with phone number (0533152632) to call for modifications
- [ ] Update event existence check logic

### Task 4: Update Event Types Enumeration ❌
- [ ] Ensure all 5 event types are properly defined:
  - Brother wedding
  - Sister wedding
  - Uncle wedding
  - Aunt wedding
  - Bar Mitzvah
- [ ] Update event type selection menu options

### Task 5: Implement Post-Event Update Functionality ❌
- [ ] Create new flow for updating path completion status after celebrations
- [ ] Develop logic for recording which path was completed
- [ ] Update database schema if needed to track completion status

### Task 6: Update Confirmation Steps & Process ❌
- [ ] Add confirmation dialog after voucher selection
- [ ] Implement confirmation prompts with option to modify selections
- [ ] Add warning that voucher selections cannot be changed after confirmation

### Task 7: Implement Terminology Changes Throughout System ❌
- [ ] Update "Level Types" to "Path/Track" (מסלול) in all menus and messages
- [ ] Update "Gifts" to "Vouchers" (שוברים) in all menus and messages
- [ ] Review and update all related prompts for consistency

### Task 8: Update Call Ending Behavior ❌
- [ ] Implement context-specific success messages based on completed action
- [ ] Allow navigation to other menu options after task completion
- [ ] Update call flow to support multiple operations in a single call

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