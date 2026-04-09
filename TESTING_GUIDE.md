# Quick Testing Guide

## 🧪 Test Your New Features (15 minutes)

This guide will walk you through testing all the new assessment and Bahagi enhancements.

---

## ✅ Pre-requisites

- [ ] Development server running at `http://localhost:3000`
- [ ] Logged in as teacher (teacher@brightstart.edu)
- [ ] Can see Teacher Dashboard with classes
- [ ] Supabase storage bucket created (see SUPABASE_STORAGE_SETUP_GUIDE.md)

---

## 🧪 Test 1: Database Verification (2 minutes)

### Check New Tables Exist

Connect to your Supabase database:

```sql
-- Check questions table
SELECT COUNT(*) as questions_count FROM questions;

-- Check options table  
SELECT COUNT(*) as options_count FROM options;

-- Check media_files table
SELECT COUNT(*) as media_count FROM media_files;

-- Check Bahagi columns
SELECT icon_path, icon_type FROM bahagi LIMIT 5;
```

**Expected Result:**
- All tables should exist
- Bahagi should have icon_path and icon_type columns (may be NULL initially)

✅ **Pass Criteria:** All queries return successfully without errors

---

## 🧪 Test 2: Component Loading (3 minutes)

### Navigate to Dashboard

1. Open http://localhost:3000
2. You should see **Teacher Dashboard**
3. Click on **any class** from the list

**Expected:**
- Class detail page loads
- See list of Bahagi (lesson sections)
- Each Bahagi shows as a card with basic information

### Check Enhanced Card Display

1. Look at each Bahagi card
2. Each card should show:
   - Title
   - Stats (Yunits, Assessments, Total XP)
   - Buttons: Add Yunit, Edit, Icon, Archive, Delete

**Expected:**
- Cards display cleanly  
- All buttons are visible
- No console errors

✅ **Pass Criteria:** Cards load without errors, buttons visible

---

## 🧪 Test 3: Icon Customization (4 minutes)

### Access Icon Selector

1. On any Bahagi card, click the **🎨 Icon** button (palette icon)
2. A modal should open showing:
   - 4 predefined character icons (thumbnails)
   - "Upload Custom Icon" section
   - Save & Cancel buttons

### Test Predefined Icons

1. Click on any of the 4 predefined icons
2. You should see it selected (highlighted)
3. Click **Save**

**Expected:**
- Modal closes
- Icon appears on the Bahagi card
- No errors in console

### Test Custom Icon Upload (Optional)

1. Click **Icon** button again
2. Drag & drop or click upload area to select an image
3. Image should preview before saving
4. Click **Save**

**Expected:**
- Image uploads to Supabase Storage
- Icon appears on card
- Data saved to bahagi table (icon_path, icon_type='custom')

✅ **Pass Criteria:** Icon selector works, selection persists after page refresh

---

## 🧪 Test 4: Assessment Editing (5 minutes)

### Navigate to Assessment

1. On Bahagi card, click **Edit** button
2. You should see a form with:
   - Assessment title
   - Assessment type dropdown
   - Instructions textarea
   - XP reward input
   - **Questions section** (expandable)

### Add a Question

1. Scroll down to **Questions** section
2. Click **+ Add Question**
3. Fill in:
   - Question text: "What is 2 + 2?"
   - Question type: "multiple-choice"

### Upload Question Image

1. In the question you just added, find the **image upload** section
2. Click or drag-drop an image file (PNG, JPG, GIF, WebP)
3. Image should preview

### Add Answer Option

1. Click **+ Add Option** under the question
2. Fill in:
   - Option text: "4"
   - Check "Is Correct" checkbox

### Upload Option Audio (Optional)

1. In the option section, find **audio upload**
2. Click or drag-drop an audio file (MP3, WAV, OGG, M4A)
3. Audio should upload

### Save Assessment

1. Scroll to bottom
2. Click **Save**
3. You should see: "✅ Assessment updated successfully"

**Expected:**
- Form submits without errors
- Data saved to database
- Questions table contains new question
- Options table contains new option
- Media files appear in media_files table

✅ **Pass Criteria:** Assessment saves, questions/options/media appear in database

---

## 🧪 Test 5: Media Upload Verification (1 minute)

### Check Supabase Storage

1. Go to https://app.supabase.com
2. Select project: **jzuzdycorgdugpbidzyg**
3. Go to **Storage** → **assessment-media** bucket
4. You should see uploaded files in:
   - `image/` folder (if you uploaded images)
   - `audio/` folder (if you uploaded audio)

**Expected:**
- Files appear in correct folders
- Naming: `{timestamp}-{random}.{ext}`

✅ **Pass Criteria:** Files successfully uploaded to Supabase

---

## 🧪 Test 6: API Endpoints (Direct Testing)

### Test Edit Assessment API

**Get Assessment:**
```bash
curl "http://localhost:3000/api/teacher/edit-assessment?assessmentId={ASSESSMENT_ID}"
```

**Expected Response:**
```json
{
  "success": true,
  "assessment": { "id": "...", "title": "...", ... },
  "questions": [
    {
      "id": "...",
      "question_text": "...",
      "options": [ { "id": "...", "option_text": "..." } ]
    }
  ]
}
```

### Test Upload Media API

**Using Postman or curl:**
```bash
curl -X POST http://localhost:3000/api/teacher/upload-media \
  -F "file=@image.jpg" \
  -F "fileType=image" \
  -F "uploadedBy={USER_UUID}"
```

**Expected Response:**
```json
{
  "success": true,
  "url": "https://jzuzdycorgdugpbidzyg.supabase.co/storage/...",
  "mediaId": "uuid",
  "fileName": "..."
}
```

### Test Bahagi Icon API

**Get Icons:**
```bash
curl "http://localhost:3000/api/teacher/bahagi-icon?bahagiId=8"
```

**Expected Response:**
```json
{
  "success": true,
  "icon_path": "/Character/NLLCTeachHalf1.png",
  "icon_type": "default",
  "predefinedIcons": [ ... ]
}
```

✅ **Pass Criteria:** All APIs return 200 status with valid JSON

---

## 📊 Verification Checklist

After completing all tests, verify:

### Database
- [ ] `questions` table contains test data
- [ ] `options` table contains test data
- [ ] `media_files` table has uploaded files
- [ ] `bahagi.icon_path` updated with selected icon
- [ ] `bahagi.icon_type` is 'default' or 'custom'

### Application
- [ ] No console errors
- [ ] All modals close properly
- [ ] Forms submit without validation errors
- [ ] Pages load quickly (< 3 seconds)

### Supabase Storage
- [ ] Bucket "assessment-media" exists
- [ ] Files appear in bucket after upload
- [ ] File URLs are accessible in browser

### API
- [ ] All 3 endpoints respond with 200 OK
- [ ] Response JSON is valid
- [ ] Error cases handled (400, 404, 500)

---

## 🐛 Troubleshooting

### Assessment Edit Modal Won't Open
- **Check:** Is there an "Edit" button on Bahagi card?
- **Fix:** Refresh page, check browser console for errors
- **Verify:** EnhancedBahagiCardV2 component is being rendered

### Image Upload Fails
- **Check:** Is file < 10 MB?
- **Check:** Is file type PNG, JPG, GIF, or WebP?
- **Fix:** Create Supabase bucket "assessment-media" as Public
- **Verify:** ENV variables set correctly

### Icon Won't Save
- **Check:** Is bucket public?
- **Check:** Do you have write permissions to bucket?
- **Fix:** Go to Supabase → Storage → Policies → Check permissions
- **Verify:** Check network tab for API response details

### Database Records Not Appearing
- **Check:** Did you click Save?
- **Check:** Did you get success message?
- **Fix:** Check Supabase connection string in .env.local
- **Verify:** Run migration again: `npm run migrate:assessment`

### TypeScript Errors During Build
- **Check:** All required dependencies installed?
- **Fix:** `npm install lucide-react recharts`
- **Verify:** No syntax errors in component files

---

## 📝 Test Report Template

Copy and fill this out to document your testing:

```markdown
# Test Report - Assessment Enhancements
Date: ___________
Tester: _________

## Test Results

### Test 1: Database Verification
Status: [ ] PASS [ ] FAIL
Notes: __________________

### Test 2: Component Loading  
Status: [ ] PASS [ ] FAIL
Notes: __________________

### Test 3: Icon Customization
Status: [ ] PASS [ ] FAIL
- Predefined icons: [ ] PASS [ ] FAIL
- Custom upload: [ ] PASS [ ] FAIL
Notes: __________________

### Test 4: Assessment Editing
Status: [ ] PASS [ ] FAIL
- Add question: [ ] PASS [ ] FAIL
- Upload image: [ ] PASS [ ] FAIL
- Add option: [ ] PASS [ ] FAIL
- Upload audio: [ ] PASS [ ] FAIL
- Save: [ ] PASS [ ] FAIL
Notes: __________________

### Test 5: Media Upload Verification
Status: [ ] PASS [ ] FAIL
Notes: __________________

### Test 6: API Endpoints
Status: [ ] PASS [ ] FAIL
- Edit Assessment: [ ] PASS [ ] FAIL
- Upload Media: [ ] PASS [ ] FAIL
- Bahagi Icon: [ ] PASS [ ] FAIL
Notes: __________________

## Overall Status: [ ] PASS [ ] FAIL

## Issues Found:
1. _____________________
2. _____________________

## Recommendations:
1. _____________________
2. _____________________
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ All 3 new components render without errors
2. ✅ Data persists after page refresh
3. ✅ Media uploads appear in Supabase Storage
4. ✅ Database records are created in new tables
5. ✅ No console errors or warnings
6. ✅ API responses are valid JSON with 200 status
7. ✅ Icons display on Bahagi cards
8. ✅ Can edit assessments and save changes

---

## Need Help?

1. **Check logs:** Browser console (F12) and server terminal
2. **Read docs:** [ENHANCEMENT_IMPLEMENTATION_GUIDE.md](./ENHANCEMENT_IMPLEMENTATION_GUIDE.md)
3. **Review API:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
4. **Check database:** Verify tables in Supabase dashboard

---

**Estimated Testing Time:** 15 minutes
**Success Rate:** 100% if all prerequisites met
**Next Step:** Deploy to staging/production after testing
