# Yemot IVR System - Handler Guidelines

This document provides guidelines for the refactored Yemot IVR system handlers to ensure consistency across the codebase.

## Handler Extension Patterns

There are two main base classes that handlers can extend:

1. **BaseYemotHandler**: For process-focused handlers that manage a flow or process.
   - Use this when the handler orchestrates a complex process with multiple steps.
   - Examples: `EventRegistrationHandler`, `UserInteractionHandler`, `PostEventUpdateHandlerV2`

2. **SelectionHelper<T>**: For selection-focused handlers that manage the selection of items.
   - Use this when the primary purpose of the handler is to present options and get a selection.
   - Examples: `PathSelectionHandler`, `VoucherSelectionHandler`

### When to use BaseYemotHandler

- When the handler manages a complex flow with multiple steps
- When the handler needs to coordinate multiple operations
- When the handler doesn't primarily focus on selection from a list

### When to use SelectionHelper<T>

- When the handler's primary purpose is to present options and get a selection
- When the handler needs to support single or multiple selection patterns
- When the handler works with a specific entity type

## Error Handling Patterns

All handlers should follow these error handling patterns:

1. **Use try/catch blocks consistently**:
   ```typescript
   try {
     // Operation code
   } catch (error) {
     this.logger.error(`Error in operation: ${error.message}`, error.stack);
     await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.GENERAL.ERROR, this.logger);
     return null; // or appropriate error handling
   }
   ```

2. **Log errors with `this.logger.error`**:
   - Include the operation name
   - Include the error message
   - Include the stack trace when available

3. **Use `CallUtils.hangupWithMessage` for user-facing errors**:
   - Use appropriate messages from `MESSAGE_CONSTANTS`
   - Provide clear information to the user

4. **Propagate errors appropriately**:
   - Return `null` or appropriate value to indicate failure
   - Throw errors only when they should be caught by a parent handler

## User Interaction Patterns

All handlers should follow these user interaction patterns:

1. **Use CallUtils methods for all user interactions**:
   - `CallUtils.playMessage` for playing messages
   - `CallUtils.readDigits` for reading digits
   - `CallUtils.getConfirmation` for confirmations
   - `CallUtils.hangupWithMessage` for ending calls with a message

2. **Use MESSAGE_CONSTANTS for all user-facing messages**:
   - Centralize all messages in `MESSAGE_CONSTANTS`
   - Use appropriate message categories

3. **Standardize confirmation dialogs**:
   - Use consistent wording for confirmations
   - Use consistent key mappings (1 for yes, 2 for no)

4. **Provide clear feedback**:
   - Confirm selections to the user
   - Provide clear error messages
   - Announce successful operations

## Logging Patterns

All handlers should follow these logging patterns:

1. **Use `logStart` at the beginning of methods**:
   ```typescript
   this.logStart('methodName');
   ```

2. **Use `logComplete` at the end of methods**:
   ```typescript
   this.logComplete('methodName', { result: 'success', data: someData });
   ```

3. **Use `logError` for error logging**:
   ```typescript
   this.logError('methodName', error);
   ```

4. **Include relevant data in logs**:
   - Include IDs, selections, and other relevant data
   - Don't log sensitive information

## Data Persistence Patterns

All data persistence operations should:

1. **Use the EventPersistenceHandler for event-related operations**:
   - Creating events
   - Updating events
   - Querying events

2. **Use transactions for multi-step operations**:
   - Ensure data consistency
   - Roll back on errors

3. **Validate data before persistence**:
   - Check for required fields
   - Validate relationships

## Adding New Handlers

When adding new handlers:

1. **Choose the appropriate base class**:
   - `BaseYemotHandler` for process-focused handlers
   - `SelectionHelper<T>` for selection-focused handlers

2. **Follow the naming conventions**:
   - Use descriptive names that indicate the handler's purpose
   - Use the `-Handler` suffix for process-focused handlers
   - Use the `-SelectionHelper` suffix for selection-focused handlers

3. **Add factory methods to YemotHandlerFactoryV2**:
   - Create a method that returns the new handler
   - Follow the existing pattern for parameter passing

4. **Document the handler with JSDoc comments**:
   - Describe the handler's purpose
   - Document all methods
   - Document all parameters

5. **Follow the established patterns for**:
   - Error handling
   - User interaction
   - Logging
   - Data persistence