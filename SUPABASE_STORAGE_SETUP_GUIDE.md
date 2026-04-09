# Supabase Storage Setup Guide

## Create Assessment Media Bucket Manually

Follow these steps to set up the Supabase storage bucket for media uploads:

### Step 1: Go to Supabase Dashboard
1. Open browser: https://app.supabase.com
2. Login with your Supabase account
3. Select your project: **jzuzdycorgdugpbidzyg**

### Step 2: Create Storage Bucket
1. In the left sidebar, click **Storage**
2. Click **Create a new bucket**
3. Fill in the details:
   - **Bucket name:** `assessment-media`
   - **Public bucket:** ✅ Check this box (to allow public access to uploaded media)
   - **File size limit:** 10 MB
4. Click **Create bucket**

### Step 3: Create Folders (Optional but Recommended)
1. Inside the `assessment-media` bucket, click **+ Add folder**
2. Create two folders:
   - `image` - for question and option images
   - `audio` - for question and option audio files

### Step 4: Set Bucket Policies
The bucket should already be public by default. If you need to manually set policies:

1. Click on the **assessment-media** bucket
2. Go to **Policies** tab
3. Add a new policy for **SELECT** (GET requests):
   - **Everyone can select files** (public access)

### Step 5: Verify Setup
Once created, your bucket should be accessible at:
```
https://jzuzdycorgdugpbidzyg.supabase.co/storage/v1/object/public/assessment-media/
```

## Features Now Enabled

✅ **Assessment Editing**
- Teachers can add/edit/delete questions
- Upload images (PNG, JPG, GIF, WebP) for questions
- Upload audio (MP3, WAV, OGG, M4A) for questions
- Upload images/audio for answer options

✅ **Bahagi Icon Customization**
- Select from 4 predefined character icons
- Upload custom icon images
- Real-time icon preview

✅ **Media Management**
- All media files stored in Supabase Storage
- Max file size: 10 MB per file
- Public access for displaying in app

## Testing the Features

### 1. Test Assessment Edit
```
1. Go to Teacher Dashboard → Select Class
2. Click on a Bahagi
3. Click "Edit" on any assessment
4. In the form:
   - Add a new question
   - Upload an image for the question
   - Add answer options
   - Upload audio for an option
5. Click Save
6. Verify in database that data was stored
```

### 2. Test Bahagi Icon Customization
```
1. Click the palette icon on any Bahagi card
2. Try selecting different predefined icons
3. Upload a custom image
4. Click Save
5. Verify icon appears on card after refresh
```

### 3. Test Media Upload
```
POST /api/teacher/upload-media
Content-Type: multipart/form-data

Fields:
- file: (image/audio file)
- fileType: "image" or "audio"
- uploadedBy: (user UUID)

Response:
{
  "success": true,
  "url": "https://...",
  "mediaId": "uuid",
  "fileName": "..."
}
```

## Environment Variables Required

Make sure your `.env.local` (or deployed env) has:
```
NEXT_PUBLIC_SUPABASE_URL=https://jzuzdycorgdugpbidzyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (for admin operations)
DATABASE_URL=postgres://...
```

## Troubleshooting

### "Bucket not found" error
- Verify bucket name is exactly: `assessment-media`
- Check bucket is set to Public

### "File upload failed" error
- Check file size is under 10MB
- Verify file type is allowed (image or audio)
- Ensure bucket has public write access

### Media URL not loading
- Verify bucket is public
- Check media file was actually uploaded
- Verify file name in database matches upload response

## Database Structure

Once set up, your media will be stored in:

```sql
-- Media files
INSERT INTO media_files (
  id,
  file_name,
  file_path,
  file_type,
  mime_type,
  file_size,
  uploaded_by,
  bucket_name
) VALUES (...)

-- Questions with media links
INSERT INTO questions (
  id,
  assessment_id,
  question_text,
  question_type,
  image_url,     -- Link to media_files
  audio_url,     -- Link to media_files
  ...
) VALUES (...)

-- Options with media links
INSERT INTO options (
  id,
  question_id,
  option_text,
  image_url,     -- Link to media_files
  audio_url,     -- Link to media_files
  ...
) VALUES (...)

-- Bahagi with custom icons
UPDATE bahagi SET
  icon_path = 'https://...',  -- Custom icon URL
  icon_type = 'custom'         -- 'default' or 'custom'
WHERE id = ...
```

## API Endpoints Reference

### Edit Assessment
```
GET /api/teacher/edit-assessment?assessmentId=<UUID>
PUT /api/teacher/edit-assessment
```

### Upload Media
```
POST /api/teacher/upload-media
GET /api/teacher/upload-media?fileType=image&uploadedBy=<UUID>
```

### Manage Bahagi Icon
```
GET /api/teacher/bahagi-icon?bahagiId=<number>
PUT /api/teacher/bahagi-icon
```

## Success Checklist

- [ ] Supabase bucket "assessment-media" created
- [ ] Bucket set to Public
- [ ] Development server running at localhost:3000
- [ ] Database migration completed (17/17 ✅)
- [ ] All 3 components created and exported
- [ ] Can navigate to assessment edit page
- [ ] Can upload image for question
- [ ] Can upload audio for option
- [ ] Can select/upload Bahagi icon
- [ ] Media files appear in Supabase Storage
- [ ] Database records created in questions/options/media_files tables

---

**Status:** ✅ Ready for Integration Testing
