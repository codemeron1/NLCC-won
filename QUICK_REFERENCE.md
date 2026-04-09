# 🚀 Quick Reference Guide - System Enhancements

## Assessment Editing in 5 Minutes

### 1. Import the Form
```typescript
import { EditAssessmentV2Form } from '@/components/TeacherComponents';
import { useState } from 'react';

export function AssessmentList() {
  const [showEditor, setShowEditor] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
```

### 2. Add Edit Button
```typescript
  return (
    <>
      <button onClick={() => {
        setSelectedAssessmentId(assessment.id);
        setShowEditor(true);
      }}>
        ✏️ Edit Assessment
      </button>
```

### 3. Render the Modal
```typescript
      {showEditor && (
        <EditAssessmentV2Form
          assessmentId={selectedAssessmentId}
          onClose={() => setShowEditor(false)}
          onSuccess={() => {
            setShowEditor(false);
            refreshAssessments(); // Reload list
          }}
          userId={user.id}
        />
      )}
    </>
  );
}
```

**That's it!** Teachers can now:
- Edit assessment title and instructions
- Add/edit/delete questions
- Upload images and audio for questions
- Add image-based or audio-based answer options
- Mark correct answers

---

## Bahagi Icon Customization in 5 Minutes

### 1. Use Enhanced Card Component
```typescript
import { EnhancedBahagiCardV2 } from '@/components/TeacherComponents';
import { useState } from 'react';

export function BahagiDisplay({ bahagi, user }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
```

### 2. Render Card for Each Bahagi
```typescript
  return bahagi.map(b => (
    <EnhancedBahagiCardV2
      key={b.id}
      id={b.id}
      title={b.title}
      iconPath={b.icon_path}      // From database ⭐
      iconType={b.icon_type}      // From database ⭐
      userId={user.id}
      expanded={expandedId === b.id}
      onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
      onIconChange={(icon, type) => {
        // Update database with new icon
        updateBahagiIcon(b.id, icon, type);
      }}
      onEdit={() => handleEditBahagi(b.id)}
      onAddYunit={() => handleAddYunit(b.id)}
      onArchive={() => handleArchiveBahagi(b.id)}
      onDelete={() => handleDeleteBahagi(b.id)}
    />
  ));
}
```

**Features activated:**
- 🎨 Palette icon to customize Bahagi icon
- Choose from 4 predefined characters
- Or upload custom image
- Icon automatically displayed on card

---

## Media Upload Without a Form

### Upload to Any Question or Option
```typescript
// Upload image
const uploadMedia = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadedBy', user.id);
  formData.append('fileType', 'image'); // or 'audio'

  const res = await fetch('/api/teacher/upload-media', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  return data.url; // Use this URL in assessment
};
```

---

## API Reference - Quick Format

### Edit Assessment
```javascript
// GET - Fetch assessment
fetch('/api/teacher/edit-assessment?assessmentId=UUID')

// PUT - Save changes
fetch('/api/teacher/edit-assessment', {
  method: 'PUT',
  body: JSON.stringify({
    assessmentId: string,
    title: string,
    questions: [{ 
      id?: string, 
      question_text: string, 
      options: [{ id?: string, option_text: string, is_correct: boolean }] 
    }]
  })
})
```

### Upload Media
```javascript
// POST - Upload file
const formData = new FormData();
formData.append('file', file);
formData.append('uploadedBy', userId);
formData.append('fileType', 'image' | 'audio');

fetch('/api/teacher/upload-media', {
  method: 'POST',
  body: formData
})

// Returns: { url: string, mediaId: string }
```

### Bahagi Icon
```javascript
// GET - Get current icon
fetch('/api/teacher/bahagi-icon?bahagiId=1')

// PUT - Set icon
fetch('/api/teacher/bahagi-icon', {
  method: 'PUT',
  body: JSON.stringify({
    bahagiId: number,
    iconType: 'default' | 'custom',
    iconPath: string
  })
})
```

---

## Database Queries

### Get Assessment with Questions
```sql
SELECT 
  a.*,
  COUNT(DISTINCT q.id) as question_count,
  COUNT(DISTINCT o.id) as option_count
FROM assessments a
LEFT JOIN questions q ON a.id = q.assessment_id
LEFT JOIN options o ON q.id = o.question_id
WHERE a.id = 'assessment-uuid'
GROUP BY a.id;
```

### Get Bahagi with Icon Info
```sql
SELECT 
  b.*,
  m.file_path,
  m.file_type
FROM bahagi b
LEFT JOIN media_files m ON b.icon_path = m.file_path
WHERE b.id = 1;
```

### Count Media by Teacher
```sql
SELECT 
  uploaded_by,
  file_type,
  COUNT(*) as count,
  SUM(file_size) as total_size
FROM media_files
GROUP BY uploaded_by, file_type;
```

---

## Environment Setup

### Required ENV Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Storage Setup
```
1. Go to Storage tab
2. Create bucket: "assessment-media"
3. Set policies:
   - Allow public read
   - Allow authenticated write
```

---

## Common Patterns

### Pattern 1: Edit on Click
```typescript
<button onClick={() => {
  setAssessmentId(id);
  setShowEditor(true);
}}>
  Edit
</button>

{showEditor && <EditAssessmentV2Form assessmentId={assessmentId} ... />}
```

### Pattern 2: Icon Customization
```typescript
<button onClick={() => setShowIconSelector(true)}>
  🎨 Change Icon
</button>

{showIconSelector && (
  <BahagiIconSelector bahagiId={id} onSuccess={handleIconUpdate} ... />
)}
```

### Pattern 3: Media Input
```typescript
<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files[0];
    const url = await uploadMedia(file);
    updateQuestion(questionId, { image_url: url });
  }}
/>
```

---

## Performance Tips

1. **Lazy Load Components**
   ```typescript
   import dynamic from 'next/dynamic';
   const EditAssessmentV2Form = dynamic(
     () => import('\u0040/components/TeacherComponents').then(m => m.EditAssessmentV2Form),
     { loading: () => <div>Loading...</div> }
   );
   ```

2. **Cache Icon List**
   ```typescript
   const [icons, setIcons] = useState([]);
   
   useEffect(() => {
     fetch('/api/teacher/bahagi-icon').then(r => r.json()).then(d => {
       setIcons(d.predefinedIcons);
     });
   }, []);
   ```

3. **Optimize Images**
   - Compress before upload
   - Use WebP format
   - Lazy load in cards

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Media bucket not configured" | Create "assessment-media" bucket in Supabase Storage |
| Icon not displaying | Check icon_path in database, verify file exists |
| Upload fails silently | Check browser console, verify file type/size |
| Questions not saving | Run migration script: `node scripts/migrate-assessment-structure.mjs` |
| CORS error | Check Supabase Storage bucket policies |

---

## Testing Checklist

- [ ] Can edit assessment title
- [ ] Can add new question
- [ ] Can upload question image
- [ ] Can upload answer option image
- [ ] Can upload audio
- [ ] Can mark correct answer
- [ ] Can delete question
- [ ] Can change Bahagi icon
- [ ] Icon persists after refresh
- [ ] Changes saved in database

---

## File Locations

| Feature | Main File |
|---------|-----------|
| Edit Form | `app/components/TeacherComponents/EditAssessmentV2Form.tsx` |
| Icon Selector | `app/components/TeacherComponents/BahagiIconSelector.tsx` |
| Card Component | `app/components/TeacherComponents/EnhancedBahagiCardV2.tsx` |
| Edit API | `app/api/teacher/edit-assessment/route.ts` |
| Media API | `app/api/teacher/upload-media/route.ts` |
| Icon API | `app/api/teacher/bahagi-icon/route.ts` |
| Database Schema | `scripts/create-assessment-structure.sql` |
| Migration | `scripts/migrate-assessment-structure.mjs` |
| Tests | `scripts/test-system-enhancements.mjs` |
| Docs | `ENHANCEMENT_IMPLEMENTATION_GUIDE.md` |

---

## Next Steps

1. ✅ Run migration: `node scripts/migrate-assessment-structure.mjs`
2. ✅ Create Supabase bucket: "assessment-media"
3. ✅ Import components in your pages
4. ✅ Replace old edit buttons with EditAssessmentV2Form
5. ✅ Replace old cards with EnhancedBahagiCardV2
6. ✅ Test end-to-end workflow
7. ✅ Deploy to production

---

**Questions?** Check [ENHANCEMENT_IMPLEMENTATION_GUIDE.md](ENHANCEMENT_IMPLEMENTATION_GUIDE.md) for detailed documentation.
