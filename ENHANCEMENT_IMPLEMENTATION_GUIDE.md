# System Enhancement Implementation Guide

## Overview

This guide explains the new features added to the system:
1. **Assessment Edit Functionality** - Edit all assessment details and questions
2. **Media Support** - Add images and audio to questions and options
3. **Database-Backed Question Structure** - Questions, Options, and Media tables
4. **Bahagi Icon Customization** - Default and custom icons for Bahagi

---

## 1. Database Schema Changes

### New Tables Created

#### `questions` Table
```sql
- id (UUID, PK)
- assessment_id (UUID, FK → assessments)
- question_text (TEXT)
- question_type (VARCHAR)
- question_order (INT)
- instructions (TEXT)
- correct_answer (TEXT)
- image_url (VARCHAR) -- Question image
- audio_url (VARCHAR) -- Question audio
- created_at, updated_at (TIMESTAMP)
```

#### `options` Table
```sql
- id (UUID, PK)
- question_id (UUID, FK → questions)
- option_text (TEXT)
- option_order (INT)
- is_correct (BOOLEAN)
- image_url (VARCHAR) -- Option image for image-based MCQ
- audio_url (VARCHAR) -- Option audio for audio-based MCQ
- created_at, updated_at (TIMESTAMP)
```

#### `media_files` Table
```sql
- id (UUID, PK)
- file_name (VARCHAR)
- file_path (VARCHAR) -- Path in Supabase storage
- file_type (VARCHAR) -- 'image' or 'audio'
- mime_type (VARCHAR)
- file_size (INT)
- uploaded_by (UUID, FK → users)
- uploaded_at (TIMESTAMP)
- bucket_name (VARCHAR) DEFAULT 'assessment-media'
```

### Bahagi Table Updates

Added two new columns to the `bahagi` table:
```sql
- icon_path (VARCHAR) -- Path to icon file
- icon_type (VARCHAR) -- 'default' or 'custom'
```

### Apply Database Changes

Run the migration script:
```bash
node scripts/migrate-assessment-structure.mjs
```

---

## 2. New API Endpoints

### Assessment Editing

#### GET `/api/teacher/edit-assessment`
Fetch assessment with all questions and options
```javascript
// Query parameters
?assessmentId=<uuid>

// Response
{
  assessment: { id, title, type, instructions, reward },
  questions: [
    {
      id, question_text, question_type, question_order,
      instructions, correct_answer, image_url, audio_url,
      options: [{ id, option_text, is_correct, image_url, audio_url, option_order }]
    }
  ]
}
```

#### PUT `/api/teacher/edit-assessment`
Update assessment and all related questions/options
```javascript
{
  assessmentId: "uuid",
  title: "string",
  type: "multiple-choice|short-answer|checkbox|media-audio|scramble|matching",
  instructions: "string",
  reward: number,
  questions: [
    {
      id?: "uuid", // omit for new questions
      question_text: "string",
      question_type: "string",
      question_order: number,
      instructions: "string",
      correct_answer: "string",
      image_url: "string",
      audio_url: "string",
      options: [
        {
          id?: "uuid", // omit for new options
          option_text: "string",
          is_correct: boolean,
          option_order: number,
          image_url: "string",
          audio_url: "string"
        }
      ]
    }
  ]
}
```

### Media Upload

#### POST `/api/teacher/upload-media`
Upload image or audio file
```javascript
// FormData
- file: File
- uploadedBy: string (userId)
- fileType: 'image' | 'audio'

// Response
{
  success: true,
  mediaId: "uuid",
  fileName: "string",
  filePath: "string",
  fileType: "image|audio",
  url: "https://...", // Public URL
  mimeType: "string",
  size: number
}
```

#### GET `/api/teacher/upload-media`
List media files
```javascript
// Query parameters
?fileType=image|audio&uploadedBy=<uuid>

// Response
{
  success: true,
  mediaFiles: [{ id, file_name, file_type, file_path, url, size }]
}
```

### Bahagi Icon Management

#### GET `/api/teacher/bahagi-icon`
Get current icon for a Bahagi
```javascript
// Query parameters
?bahagiId=<number>

// Response
{
  success: true,
  icon_path: "string",
  icon_type: "default|custom",
  predefinedIcons: [
    { name: "NLLCTeachHalf1.png", path: "/Character/NLLCTeachHalf1.png", type: "default" }
  ]
}
```

#### PUT `/api/teacher/bahagi-icon`
Update Bahagi icon
```javascript
{
  bahagiId: number,
  iconType: "default" | "custom",
  iconPath: "string", // for default: filename, for custom: will be updated after upload
  uploadedFile?: File // only for custom type
}

// Response
{
  success: true,
  bahagiId: number,
  iconPath: "string", // final path/URL
  iconType: "string"
}
```

---

## 3. New Components

### EditAssessmentV2Form
Full-featured assessment editor with question and media management

**Location:** `app/components/TeacherComponents/EditAssessmentV2Form.tsx`

**Props:**
```typescript
interface EditAssessmentV2FormProps {
  assessmentId: string;
  onClose: () => void;
  onSuccess?: () => void;
  userId: string;
}
```

**Features:**
- ✓ Edit assessment title, type, instructions, and rewards
- ✓ Add/edit/delete questions with auto-expanded sections
- ✓ Upload image and audio for questions
- ✓ Add/edit/delete options for multiple-choice questions
- ✓ Upload image and audio for each option
- ✓ Mark correct answer per question
- ✓ Full validation and error handling

**Usage:**
```typescript
import { EditAssessmentV2Form } from '@/components/TeacherComponents';
import { useState } from 'react';

export function MyComponent() {
  const [showEdit, setShowEdit] = useState(false);
  const [assessmentId, setAssessmentId] = useState('');
  
  return (
    <>
      <button onClick={() => {
        setAssessmentId('assessment-uuid');
        setShowEdit(true);
      }}>
        Edit Assessment
      </button>
      
      {showEdit && (
        <EditAssessmentV2Form
          assessmentId={assessmentId}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            // Refresh assessments or show success message
          }}
          userId={currentUser.id}
        />
      )}
    </>
  );
}
```

### BahagiIconSelector
Modal for selecting and customizing Bahagi icons

**Location:** `app/components/TeacherComponents/BahagiIconSelector.tsx`

**Props:**
```typescript
interface BahagiIconSelectorProps {
  bahagiId: number;
  currentIcon?: string;
  currentIconType?: string;
  onClose: () => void;
  onSuccess?: (iconPath: string, iconType: string) => void;
  userId: string;
}
```

**Features:**
- ✓ Predefined icon selection (4 built-in characters)
- ✓ Custom icon upload (drag-drop or file selector)
- ✓ Real-time preview
- ✓ File validation (image only, max 2MB)
- ✓ Automatic Supabase storage upload

**Usage:**
```typescript
import { BahagiIconSelector } from '@/components/TeacherComponents';
import { useState } from 'react';

export function MyComponent() {
  const [showSelector, setShowSelector] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowSelector(true)}>
        Customize Icon
      </button>
      
      {showSelector && (
        <BahagiIconSelector
          bahagiId={bahagiId}
          currentIcon={bahagi.icon_path}
          currentIconType={bahagi.icon_type}
          onClose={() => setShowSelector(false)}
          onSuccess={(iconPath, iconType) => {
            // Update UI with new icon
            console.log('Icon updated:', iconPath, iconType);
          }}
          userId={currentUser.id}
        />
      )}
    </>
  );
}
```

### EnhancedBahagiCardV2
Enhanced card component for displaying Bahagi with icon support

**Location:** `app/components/TeacherComponents/EnhancedBahagiCardV2.tsx`

**Props:**
```typescript
interface EnhancedBahagiCardProps {
  id: number;
  title: string;
  yunit?: string;
  iconPath?: string;        // Icon path from DB
  iconType?: string;        // 'default' or 'custom'
  description?: string;
  isOpen?: boolean;
  isArchived?: boolean;
  lessonCount?: number;
  assessmentCount?: number;
  totalXP?: number;
  onEdit?: () => void;
  onAddYunit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onIconChange?: (iconPath: string, iconType: string) => void;
  userId: string;
  expanded?: boolean;
  onToggleExpand?: (id: number) => void;
}
```

**Features:**
- ✓ Displays Bahagi icon with custom/default indicator
- ✓ Palette button to customize icon inline
- ✓ Expandable actions (Edit, Add Yunit, Archive, Delete)
- ✓ Stats display (Yunits, Assessments, XP)
- ✓ Status badges (Draft, Archived)
- ✓ Confirmation modals for destructive actions
- ✓ Smooth animations with Framer Motion

**Usage:**
```typescript
import { EnhancedBahagiCardV2 } from '@/components/TeacherComponents';

export function MyComponent() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  return bahagi.map(b => (
    <EnhancedBahagiCardV2
      key={b.id}
      id={b.id}
      title={b.title}
      yunit={b.yunit}
      iconPath={b.icon_path}     // From database
      iconType={b.icon_type}  // From database
      description={b.description}
      isOpen={b.is_open}
      isArchived={b.is_archived}
      lessonCount={b.yunit_count}
      assessmentCount={b.assessment_count}
      totalXP={b.total_xp}
      userId={user.id}
      expanded={expandedId === b.id}
      onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
      onEdit={() => {
        // Handle edit
      }}
      onAddYunit={() => {
        // Handle add yunit
      }}
      onIconChange={(iconPath, iconType) => {
        // Update bahagi in DB
        updateBahagiIcon(b.id, iconPath, iconType);
      }}
      onArchive={() => {
        // Handle archive
      }}
      onDelete={() => {
        // Handle delete
      }}
    />
  ));
}
```

---

## 4. Integration Steps

### Step 1: Apply Database Migration
```bash
node scripts/migrate-assessment-structure.mjs
```

### Step 2: Update Supabase Storage
Ensure you have a bucket named `assessment-media` in Supabase Storage with public access enabled.

**For local development with Supabase:**
- Go to Supabase Dashboard → Storage
- Create new bucket: `assessment-media`
- Set to "Public" for public read access

### Step 3: Add Character Images to Public Folder
Ensure these files exist in `public/Character/`:
- `NLLCTeachHalf1.png`
- `NLLCTeachHalf2.png`
- `NLLCTeachHalf3.png`
- `NLLCTeachHalf4.png`

### Step 4: Update Assessment Display Components
Replace edit buttons with EditAssessmentV2Form:

```typescript
// OLD CODE
<button onClick={() => handleEditAssessment(assessment.id)}>
  Edit
</button>

// NEW CODE
import { EditAssessmentV2Form } from '@/components/TeacherComponents';
import { useState } from 'react';

const [showAssessmentEditor, setShowAssessmentEditor] = useState(false);
const [selectedAssessmentId, setSelectedAssessmentId] = useState('');

<button onClick={() => {
  setSelectedAssessmentId(assessment.id);
  setShowAssessmentEditor(true);
}}>
  Edit
</button>

{showAssessmentEditor && (
  <EditAssessmentV2Form
    assessmentId={selectedAssessmentId}
    onClose={() => setShowAssessmentEditor(false)}
    onSuccess={() => {
      setShowAssessmentEditor(false);
      // Refresh assessment list
      refreshAssessments();
    }}
    userId={user.id}
  />
)}
```

### Step 5: Replace Bahagi Card Display
Replace existing Bahagi displays with EnhancedBahagiCardV2:

```typescript
// In ClassDetailPage or similar component
import { EnhancedBahagiCardV2 } from '@/components/TeacherComponents';

// Replace old card rendering with:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {bahagi.map(b => (
    <EnhancedBahagiCardV2
      key={b.id}
      id={b.id}
      title={b.title}
      yunit={b.yunit}
      iconPath={b.icon_path}
      iconType={b.icon_type}
      description={b.description}
      isOpen={b.is_open}
      isArchived={b.is_archived}
      userId={user.id}
      expanded={expandedBahagiId === b.id}
      onToggleExpand={(id) => setExpandedBahagiId(expandedBahagiId === id ? null : id)}
      onEdit={() => handleEditBahagi(b.id)}
      onAddYunit={() => handleAddYunit(b.id)}
      onIconChange={(icon, type) => handleIconChange(b.id, icon, type)}
      onArchive={() => handleArchiveBahagi(b.id)}
      onDelete={() => handleDeleteBahagi(b.id)}
    />
  ))}
</div>
```

---

## 5. Data Flow

### Assessment Editing Flow
```
Teacher clicks "Edit" on Assessment Card
  ↓
EditAssessmentV2Form loads data from /api/teacher/edit-assessment
  ↓
Form displays assessment, questions, and options
  ↓
Teacher edits details, questions, options, or media
  ↓
Teacher clicks "Save Changes"
  ↓
Media files uploaded to /api/teacher/upload-media
  ↓
Complete data sent to /api/teacher/edit-assessment (PUT)
  ↓
Database updates (atomic transaction for consistency)
  ↓
Form closes, success callback triggers
  ↓
Parent component refreshes assessment list
```

### Icon Selection Flow
```
Teacher clicks Palette icon on Bahagi Card
  ↓
BahagiIconSelector modal opens
  ↓
Option 1: Select predefined icon → Save
  ↓
Option 2: Upload custom → Upload to /api/teacher/upload-media → Save
  ↓
/api/teacher/bahagi-icon (PUT) updates bahagi table
  ↓
onIconChange callback updates UI
  ↓
Modal closes
```

---

## 6. Key Features

### Assessment Editing
- ✓ Edit all assessment metadata (title, type, instructions, XP reward)
- ✓ Add/edit/delete questions
- ✓ Add/edit/delete answer options
- ✓ Upload images for questions
- ✓ Upload audio for questions
- ✓ Upload images for answer options (image-based MCQ)
- ✓ Upload audio for answer options (audio-based MCQ)
- ✓ Mark correct answers
- ✓ Auto-fill all existing data
- ✓ Expandable question sections for easy navigation

### Media Management
- ✓ Upload images (PNG, JPG, GIF, WebP)
- ✓ Upload audio (MP3, WAV, OGG, M4A)
- ✓ 10MB max file size for media
- ✓ Automatic Supabase storage integration
- ✓ Media files linked to questions/options in database
- ✓ Media retrieval and display during assessments

### Bahagi Icon Customization
- ✓ 4 predefined character icons
- ✓ Custom image upload (drag-drop or file select)
- ✓ Real-time preview
- ✓ Icon displayed on Bahagi cards
- ✓ Inline customization (Palette button on card)
- ✓ Automatic Supabase storage for custom images

### Data Persistence
- ✓ All assessment changes saved in questions/options tables
- ✓ Media files stored in Supabase Storage
- ✓ Icon paths stored in bahagi table
- ✓ Proper foreign key relationships
- ✓ ON DELETE CASCADE for data consistency
- ✓ Automatic timestamps for audit trail

---

## 7. Error Handling

### Common Issues & Solutions

**Issue:** "Media bucket not configured"
```
Solution: Create 'assessment-media' bucket in Supabase Storage
- Go to Supabase Dashboard
- Storage → Create new bucket
- Name: assessment-media
- Set to Public
```

**Issue:** Icon not displaying on Bahagi card
```
Solutions:
1. Ensure icon_path is saved in database
2. Check if file exists (predefined or in Supabase)
3. Fall back to default icon if path invalid
4. Check browser console for CORS errors
```

**Issue:** Media upload fails
```
Solutions:
1. Check file type is supported (images/audio)
2. Verify file size < 10MB
3. Ensure SUPABASE_SERVICE_ROLE_KEY is set
4. Check bucket has public read permissions
```

---

## 8. Testing Checklist

### Assessment Editing
- [ ] Open edit form for existing assessment
- [ ] Verify all fields auto-filled
- [ ] Edit assessment title and description
- [ ] Change assessment type
- [ ] Add new question
- [ ] Edit existing question text
- [ ] Upload question image
- [ ] Upload question audio
- [ ] Add new option
- [ ] Upload option image
- [ ] Upload option audio
- [ ] Delete question
- [ ] Delete option
- [ ] Save all changes
- [ ] Verify data persisted in database

### Bahagi Icon Customization
- [ ] Click Palette button on Bahagi card
- [ ] Select predefined icon
- [ ] Verify icon updates on card
- [ ] Upload custom image
- [ ] Verify custom image displays
- [ ] Refresh page - icon persists
- [ ] Change icon multiple times

### Media Upload
- [ ] Upload PNG image
- [ ] Upload JPG image
- [ ] Upload MP3 audio
- [ ] Verify file stored in Supabase
- [ ] Verify URL accessible
- [ ] Test max file size validation
- [ ] Test invalid file type validation

---

## 9. Performance Optimization Tips

1. **Lazy load form components** - Load EditAssessmentV2Form only when needed
2. **Paginate questions** - For assessments with many questions, consider pagination
3. **Optimize images** - Compress images before uploading
4. **Cache icon list** - Cache predefined icons in component state
5. **Database indexes** - Already added on questions, options, media tables

---

## 10. Future Enhancements

- [ ] Bulk edit multiple assessments
- [ ] Assessment templates
- [ ] Question bank/library reuse
- [ ] Media library (reuse uploaded media)
- [ ] Assessment preview before saving
- [ ] Real-time collaboration (multiple teachers editing)
- [ ] Assessment analytics (student performance on questions)
- [ ] More predefined Bahagi icons
- [ ] Custom icon gallery/marketplace

---

This implementation provides a complete, production-ready system for assessment editing, media management, and Bahagi customization with a seamless teacher experience.
