# High-Level Design: Text Table Filepath Enhancement

## Overview
Enhance the Text entity to support audio file paths for Yemot integration, allowing users to upload audio files instead of relying on text-to-speech for certain messages.

## Current Architecture Analysis

### Existing Components
1. **Text Entity** (`/server/shared/entities/Text.entity.ts`)
   - Fields: `id`, `userId`, `name`, `description`, `value`, `createdAt`, `updatedAt`
   - System texts: `userId = 0` (default/base texts)
   - User texts: `userId > 0` (user-specific overrides)

2. **TextByUser View** (`/server/shared/view-entities/TextByUser.entity.ts`)
   - Merges system texts with user overrides using `COALESCE(t_user.value, t_base.value)`
   - Returns: `id`, `userId`, `name`, `description`, `value`, `overrideTextId`

3. **Yemot Flow V2** (`/server/shared/utils/yemot/v2/yemot-router.service.ts`)
   - `getTextByUserId()`: Retrieves text from TextByUser view
   - `sendMessage()`: Sends `{type: 'text', data: message}`
   - `sendMessageFromFile()`: Sends `{type: 'file', data: filePath}` (already exists)

## Requirements

### Functional Requirements
1. Add `filepath` field to Text entity
2. System texts (userId=0) must have empty filepath
3. User texts (userId≠0) may have filepath populated
4. When filepath is populated, send file message instead of text message
5. Maintain backward compatibility with existing text-based flows

### Non-Functional Requirements
1. Database migration without data loss
2. Preserve existing caching behavior
3. Maintain query performance
4. Support file validation

## Design Questions & Decisions

### 1. Database Schema Changes
**Question**: How to add the filepath field while maintaining compatibility?

**Decision**: 
- Add `filepath` as nullable VARCHAR(255) field
- NO validation constraints (system texts can theoretically have filepath, but won't in practice)
- NO additional indexes needed

### 2. TextByUser View Enhancement
**Question**: Should the view include filepath information?

**Decision**: 
- YES - Update view to include filepath field
- Since system texts (userId=0) should never have filepath, we can use simple selection
- User texts can override with their own filepath

### 3. Message Type Priority Logic
**Question**: If both value and filepath are set, which takes precedence?

**Decision**: 
- Filepath takes precedence over value when both are present
- Logic: `if (filepath && filepath.trim()) use file, else use text`

### 4. Error Handling Strategy
**Question**: What happens if filepath exists but file is missing/corrupted?

**Decision**: 
- NO graceful fallback - just send `{type: 'file', data: filepath}`
- Let the receiver (Yemot system) handle missing/corrupted files
- Simpler implementation, less error handling complexity

### 5. File Validation
**Question**: Should we validate file paths and existence?

**Decision**: 
- NO validation needed
- Filepath can be empty or any string up to 255 characters
- No file existence checks or format validation

## Implementation Plan

### Step 1: Entity Schema Updates

1. **Update Text Entity** - Add filepath field to the entity first
   ```typescript
   @IsOptional({ always: true })
   @StringType
   @MaxLength(255, { always: true })
   @Column({ type: 'varchar', length: 255, nullable: true })
   filepath: string;
   ```

2. **Update TextByUser View Entity** - Add filepath to the view query
   ```sql
   .addSelect('t_user.filepath', 'filepath')
   ```

3. **Generate and Run Migration** - Use TypeORM auto-generation for safety
   
   First, dry-run the migration to verify it's correct:
   ```bash
   docker compose exec server yarn typeorm:generate src/migrations/AddFilepathToText --dryrun --pretty
   ```

   Generate a migration after verifying the changes:
   ```bash
   docker compose exec server yarn typeorm:generate src/migrations/AddFilepathToText --pretty
   ```

   Run migrations:
   ```bash
   docker compose exec server yarn typeorm:run
   ```

### Step 2: Frontend Updates

#### Update Domain Translations (`/client/src/domainTranslations.js`)

1. **Add filepath translations to text entity**
   ```javascript
   text: {
       name: 'הודעה |||| הודעות - טבלת אדמין',
       fields: {
           ...generalResourceFieldsTranslation,
           description: 'תיאור',
           value: 'ערך',
           filepath: 'נתיב קובץ שמע',  // NEW FIELD
           'filepath:$cont': 'חיפוש בנתיב קובץ',  // NEW FILTER
       }
   },
   ```

2. **Add filepath translations to text_by_user entity**
   ```javascript
   text_by_user: {
       name: 'הודעה |||| הודעות',
       fields: {
           ...generalResourceFieldsTranslation,
           description: 'תיאור',
           value: 'ערך',
           filepath: 'נתיב קובץ שמע',  // NEW FIELD
       }
   },
   ```

#### Update Text Entity Admin Interface (`/client/shared/components/common-entities/text.jsx`)

1. **Add filepath field to Datagrid**
   ```jsx
   const Datagrid = ({ isAdmin, children, ...props }) => {
       return (
           <CommonDatagrid {...props}>
               {children}
               {isAdmin && <TextField source="id" />}
               {isAdmin && <ReferenceField source="userId" reference="user" emptyText='system' />}
               <TextField source="name" />
               <TextField source="description" />
               <TextField source="value" />
               <TextField source="filepath" />  {/* NEW FIELD */}
               {isAdmin && <DateField showDate showTime source="createdAt" />}
               {isAdmin && <DateField showDate showTime source="updatedAt" />}
           </CommonDatagrid>
       );
   }
   ```

2. **Add filepath field to Inputs form**
   ```jsx
   const Inputs = ({ isCreate, isAdmin }) => {
       const record = useRecordContext();
       const isSystemText = record?.userId === 0;

       return <>
           {!isCreate && isAdmin && <TextInput source="id" disabled />}
           {isAdmin && <CommonReferenceInput source="userId" reference="user" emptyValue={0} emptyText='system' />}
           <TextInput source="name" disabled={!isCreate} validate={[required(), maxLength(100)]} />
           <TextInput source="description" disabled={!isCreate} validate={[required(), maxLength(500)]} />
           <TextInput source="value" validate={[required(), maxLength(10000)]} />
           {/* NEW FIELD: Only show for user texts, hide for system texts */}
           {!isSystemText && (
               <TextInput 
                   source="filepath" 
                   validate={[maxLength(255)]} 
                   helperText="אופציונלי - אם מלא, ישלח קובץ במקום טקסט"
               />
           )}
           {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
           {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
       </>
   }
   ```

3. **Add filepath to filters**
   ```jsx
   const filters = [
       adminUserFilter,
       <TextInput source="name:$cont" alwaysOn />,
       <TextInput source="description:$cont" />,
       <TextInput source="value:$cont" alwaysOn />,
       <TextInput source="filepath:$cont" />,  {/* NEW FILTER */}
   ];
   ```

#### Update TextByUser Interface (`/client/shared/components/common-entities/text-by-user.jsx`)

1. **Add filepath field to Datagrid**
   ```jsx
   const Datagrid = ({ isAdmin, children, ...props }) => {
       return (
           <CommonDatagrid {...props}>
               {children}
               {isAdmin && <TextField source="id" />}
               {isAdmin && <ReferenceField source="userId" reference="user" emptyText='system' />}
               <TextField source="name" />
               <TextField source="description" />
               <TextField source="value" />
               <TextField source="filepath" />  {/* NEW FIELD */}
               <EditTextButton label='עריכה' icon={<EditIcon />} loader={<CircularProgress size={16} />} />
           </CommonDatagrid>
       );
   }
   ```

2. **Add filepath to filters**
   ```jsx
   const filters = [
       adminUserFilter,
       <TextInput source="name:$cont" alwaysOn />,
       <TextInput source="description:$cont" />,
       <TextInput source="value:$cont" alwaysOn />,
       <TextInput source="filepath:$cont" />,  {/* NEW FILTER */}
   ];
   ```

3. **Enhance EditTextButton dialog to include filepath**
   ```jsx
   <Dialog onClose={handleDialogClose} open={showDialog}>
       <Form onSubmit={handleSubmit}>
           <DialogContent>
               <Stack>
                   <TextInput source='value' label='ערך' validate={[required(), maxLength(10000)]} />
                   <TextInput 
                       source='filepath' 
                       validate={[maxLength(255)]} 
                       helperText="אופציונלי - אם מלא, ישלח קובץ במקום טקסט"
                   />
               </Stack>
           </DialogContent>
           <DialogActions>
               <Button onClick={handleDialogClose} label={translate('ra.action.cancel')} />
               <SaveButton alwaysEnable autoFocus variant='text' icon={null} />
           </DialogActions>
       </Form>
   </Dialog>
   ```

4. **Update handleSave to include filepath**
   ```jsx
   const handleSave = (data) => {
       if (record.overrideTextId) {
           update(resource, {
               id: record.overrideTextId,
               data: {
                   value: data.value,
                   filepath: data.filepath,  // NEW FIELD
               },
               previousData: {}
           });
       } else {
           create(resource, {
               data: {
                   userId: record.userId,
                   name: record.name,
                   description: record.description,
                   value: data.value,
                   filepath: data.filepath,  // NEW FIELD
               }
           });
       }
   }
   ```

### Step 3: Service Layer Enhancements
1. **Add new `*ByKey` methods to BaseYemotHandlerService**
   - `sendMessageByKey(textKey, values?)`
   - `hangupWithMessageByKey(textKey, values?)`
   - `askForInputByKey(textKey, values?, options?)`

2. **Keep existing methods unchanged** for true backward compatibility

3. **Add deprecation warning** to `getTextByUserId` when used with old pattern

### Step 4: Update Existing YemotHandlerService Calls
Replace patterns like:
```typescript
// OLD
this.sendMessage(await this.getTextByUserId('GENERAL.WELCOME', { name: student.name }));

// NEW  
this.sendMessageByKey('GENERAL.WELCOME', { name: student.name });
```

### Step 5: Testing & Validation
1. **Test old methods** still work for direct messages
2. **Test new methods** handle both text and file scenarios
3. **Verify** system texts return null filepath
4. **Validate** user texts can have filepath and it takes precedence
5. **Test frontend** forms hide filepath for system texts
6. **Test TextByUser** edit dialog includes filepath field





## Technical Implementation Details

### Updated Entity Definition
```typescript
@Entity("texts")
export class Text implements IHasUserId {
  // ... existing fields

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  filepath: string;

  // ... rest of entity
}
```

### Service Layer Changes - Final Approach: New Wrapper Methods
```typescript
export class BaseYemotHandlerService {
  // Keep existing methods unchanged for true backward compatibility
  protected sendMessage(message: string) {
    this.logger.log(`Sending direct text message: ${message}`);
    return this.call.id_list_message([{ type: 'text', data: message }], { prependToNextAction: true });
  }

  protected hangupWithMessage(message: string) {
    this.logger.log(`Hanging up with direct message: ${message}`);
    this.call.id_list_message([{ type: 'text', data: message }], { prependToNextAction: true });
    this.call.hangup();
  }

  protected askForInput(message: string, options?: TapOptions) {
    this.logger.log(`Asking for input with direct message: ${message}`);
    return this.call.read([{ type: 'text', data: message }], 'tap', options);
  }

  // New enhanced methods that handle both text and file
  protected async sendMessageByKey(textKey: string, values?: TextParams) {
    const text = await this.dataSource
      .getRepository(TextByUser)
      .findOneBy({ userId: this.user.id, name: textKey });
    
    let textValue = text?.value || textKey;
    let filepath = text?.filepath;
    
    if (values) {
      Object.keys(values).forEach((key) => {
        textValue = textValue.replace(`{${key}}`, values[key].toString());
      });
    }
    
    if (filepath && filepath.trim()) {
      this.logger.log(`Sending file message: ${filepath}`);
      return this.call.id_list_message([{ type: 'file', data: filepath }], { prependToNextAction: true });
    } else {
      this.logger.log(`Sending text message: ${textValue}`);
      return this.call.id_list_message([{ type: 'text', data: textValue }], { prependToNextAction: true });
    }
  }

  protected async hangupWithMessageByKey(textKey: string, values?: TextParams) {
    const text = await this.dataSource
      .getRepository(TextByUser)
      .findOneBy({ userId: this.user.id, name: textKey });
    
    let textValue = text?.value || textKey;
    let filepath = text?.filepath;
    
    if (values) {
      Object.keys(values).forEach((key) => {
        textValue = textValue.replace(`{${key}}`, values[key].toString());
      });
    }
    
    if (filepath && filepath.trim()) {
      this.logger.log(`Hanging up with file: ${filepath}`);
      this.call.id_list_message([{ type: 'file', data: filepath }], { prependToNextAction: true });
    } else {
      this.logger.log(`Hanging up with text: ${textValue}`);
      this.call.id_list_message([{ type: 'text', data: textValue }], { prependToNextAction: true });
    }
    this.call.hangup();
  }

  protected async askForInputByKey(textKey: string, values?: TextParams, options?: TapOptions) {
    const text = await this.dataSource
      .getRepository(TextByUser)
      .findOneBy({ userId: this.user.id, name: textKey });
    
    let textValue = text?.value || textKey;
    let filepath = text?.filepath;
    
    if (values) {
      Object.keys(values).forEach((key) => {
        textValue = textValue.replace(`{${key}}`, values[key].toString());
      });
    }
    
    if (filepath && filepath.trim()) {
      this.logger.log(`Asking for input from file: ${filepath}`);
      return this.call.read([{ type: 'file', data: filepath }], 'tap', options);
    } else {
      this.logger.log(`Asking for input with text: ${textValue}`);
      return this.call.read([{ type: 'text', data: textValue }], 'tap', options);
    }
  }

  // Utility method for getting text data (can be used internally)
  private async getTextDataByUserId(textKey: string, values?: TextParams): Promise<{ value: string; filepath: string | null }> {
    const text = await this.dataSource
      .getRepository(TextByUser)
      .findOneBy({ userId: this.user.id, name: textKey });
    
    let textValue = text?.value || textKey;
    let filepath = text?.filepath || null;
    
    if (values) {
      Object.keys(values).forEach((key) => {
        textValue = textValue.replace(`{${key}}`, values[key].toString());
      });
    }
    
    return { value: textValue, filepath };
  }

  // Add deprecation warning when old pattern is detected
  protected async getTextByUserId(textKey: string, values?: TextParams): Promise<string> {
    this.logger.warn(`getTextByUserId is deprecated. Use sendMessageByKey('${textKey}', values) directly instead of sendMessage(await getTextByUserId('${textKey}', values))`);
    
    const textData = await this.getTextDataByUserId(textKey, values);
    return textData.value; // Return only text for backward compatibility
  }
}
```

## New Questions Raised

Based on your clarifications, here are the remaining implementation details:

### 1. Backward Compatibility Approach ✅ DECIDED
**Decision**: Use **Approach 2** (New wrapper methods) - Keep old methods, add new `*ByKey` methods

**Reasoning**: Method overloading is not safe because there's no reliable way to differentiate between:
- `sendMessage("Hello World")` (direct text)  
- `sendMessage("GENERAL.WELCOME")` (text key)

Both are strings, so TypeScript can't distinguish them at runtime.

### 2. TextByUser View Update ✅ CONFIRMED
**Decision**: Update view to include `t_user.filepath AS filepath`
- System texts (userId=0) will return `filepath = null` ✅ 
- User texts can have their own filepath or null

### 3. Implementation Timeline ✅ DECIDED
**Decision**: Implement everything at once in a single phase

### 4. Migration Strategy for Existing Code
**Current Pattern**:
```typescript
this.sendMessage(await this.getTextByUserId('GENERAL.WELCOME', { name: student.name }));
```

**New Pattern**:
```typescript
this.sendMessageByKey('GENERAL.WELCOME', { name: student.name });
```

**Migration Plan**:
1. Add new `*ByKey` methods to BaseYemotHandlerService
2. Add deprecation warnings to old methods when used with `getTextByUserId` pattern
3. Gradually update existing calls in YemotHandlerService
4. Keep old methods for true backward compatibility (direct string messages)

### 5. Frontend Requirements ✅ DISCOVERED
**Key Findings**:
- Text entity has admin interface at `/client/shared/components/common-entities/text.jsx`
- TextByUser has separate interface with edit dialog for user overrides
- Need to add filepath field to both interfaces
- Should hide filepath field for system texts (userId=0)
- TextByUser edit dialog needs filepath support

### 6. Testing Strategy
**Plan**:
- Create test text records with and without filepath
- Test both old and new method patterns  
- Verify system texts always return null filepath
- Test with non-existent file paths (should still send file message)
- Ensure no breaking changes to existing flows
- Test frontend forms hide filepath for system texts
- Test TextByUser edit functionality with filepath

### 7. Additional Frontend Questions 🔥 NEW
**Question**: Should we add file upload functionality to the admin interface?
- Currently users need to manually type file paths
- Could add file picker/upload component
- Files would need to be stored in accessible location

**Question**: Should we add validation in the frontend?
- File existence validation on the client side?
- File format validation (audio files only)?
- Path format validation?

**Question**: Should we show different icons/indicators for text vs file entries?
- Visual distinction in the datagrid
- Icons to show whether entry uses text or file
- Preview/play functionality for audio files?

## Risk Assessment Updates

### High Risk ⬇️ (Reduced)
- ~~File Storage Management~~: Not applicable (no file validation)
- **Method Signature Changes**: Need careful approach to avoid breaking changes

### Medium Risk ⬇️ (Reduced)  
- ~~Migration Complexity~~: Simplified with no constraints
- **Testing Coverage**: Need comprehensive testing of both old and new patterns

### Low Risk ⬆️ (Increased)
- **Database Schema**: Simple nullable field addition
- **Backward Compatibility**: With proper approach, should be seamless
- **Performance Impact**: Minimal with no additional indexes

## Recommended Approach

Based on your requirements, I recommend:

1. **Use Approach 2** (New wrapper methods) for better safety and clarity
2. **Update TextByUser view** to include filepath field (t_user.filepath)
3. **Implement in single phase** since it's relatively simple
4. **Gradually migrate** existing calls to use new `*ByKey` methods
5. **Add deprecation warnings** to old direct usage patterns

This approach minimizes risk while providing a clear upgrade path.

## Success Criteria

1. **Functional**
   - User texts can have audio files instead of TTS
   - System texts remain text-only
   - Graceful fallback when files are missing
   - All existing flows work unchanged

2. **Performance**
   - No significant performance degradation
   - File access times within acceptable limits
   - Database query performance maintained

3. **Operational**
   - Easy file management in admin interface
   - Clear error logging for file issues
   - Simple deployment process

## Future Enhancements

1. **File Format Validation**: Support multiple audio formats
2. **Cloud Storage**: Integration with S3/Azure for file storage
3. **Audio Generation**: TTS-to-file conversion tools
4. **Bulk Operations**: Mass upload/conversion utilities
5. **Analytics**: Track usage of text vs file messages
