# 🧪 COMPLETE LOCAL TESTING GUIDE

**Status:** Dev Server RUNNING at http://localhost:3000 ✅

---

## 📋 TESTING CHECKLIST (30 minutes total)

This guide tests all new features locally before deployment.

---

## TEST 1: Application Loads (2 min)

### Step 1: Open in Browser
```
URL: http://localhost:3000
```

### Step 2: Expected Results
- ✅ Page loads without errors
- ✅ NLCC logo visible
- ✅ Login form displayed
- ✅ No console errors

### Step 3: Check Browser Console
- Press: `F12`
- Go to: **Console** tab
- Expected: No red errors
- Result: ✅ or ❌

---

## TEST 2: Database Connection (2 min)

### Step 1: Check Network Activity
- Press: `F12`
- Go to: **Network** tab
- Refresh page: `F5`

### Step 2: Check API Calls
- Look for: `/api/user` call
- Status should be: `200` or `404` (not 500)
- Response should have JSON

### Step 3: Check Database Connection
- Open: **Application** → **Storage** → **Local Storage**
- Should have: auth tokens or user data
- Result: ✅ or ❌

---

## TEST 3: Login & Dashboard (3 min)

### Step 1: Login with Test Teacher Account
```
Email: teacher@brightstart.edu
Password: password123
```
*(or use your test account)*

### Step 2: Expected Results
- ✅ Dashboard loads
- ✅ See 5 classes with data
- ✅ Bahagi cards visible
- ✅ Statistics displayed

### Step 3: Verify Data
- Check: Total XP calculation
- Check: Unit counts
- Check: Assessment counts
- Result: ✅ or ❌

---

## TEST 4: NEW - Edit Assessment (5 min)

### Step 1: Click "Edit" Button
- Find: Any Bahagi card
- Click: **Edit** button (pencil icon)

### Step 2: Expected Window
- Modal opens with assessment details
- Fields visible:
  - ✅ Assessment title
  - ✅ Type (dropdown)
  - ✅ Instructions
  - ✅ XP reward
  - ✅ Questions section
  - ✅ Add Question button

### Step 3: Add New Question
- Click: **+ Add Question**
- Enter: "What is 2+2?"
- Select: **Multiple Choice**
- Expected: Question appears with editable fields
- Result: ✅ or ❌

### Step 4: Add Options
- Click: **+ Add Option** under question
- Enter: "3", "4", "5"
- Mark: "4" as correct answer
- Expected: Options appear with checkboxes
- Result: ✅ or ❌

---

## TEST 5: NEW - Media Upload (5 min)

### Step 1: Upload Image for Question
- In Edit form, find question
- Click: **📸 Upload Image** button
- Choose: Any JPG/PNG file from your computer
- Expected:
  - ✅ File picker opens
  - ✅ File selected
  - ✅ Upload starts
  - ✅ Image appears as preview
- Result: ✅ or ❌

### Step 2: Upload Audio for Question
- Find question with image
- Click: **🔊 Upload Audio** button
- Choose: Any MP3 file
- Expected:
  - ✅ File picker opens
  - ✅ Audio control appears
  - ✅ Can play audio
- Result: ✅ or ❌

### Step 3: Upload Media for Option
- Find answer option
- Click: **📸 Add Image** button
- Choose: Another image file
- Expected:
  - ✅ Image uploads
  - ✅ Thumbnail appears
- Result: ✅ or ❌

---

## TEST 6: NEW - Bahagi Icon Customization (5 min)

### Step 1: Click Icon Button
- Find: Bahagi card
- Click: **🎨 Palette** icon button (right side)

### Step 2: Expected Modal
- Modal opens: "Customize Bahagi Icon"
- Shows:
  - ✅ 4 predefined icons (character images)
  - ✅ Radio buttons for selection
  - ✅ Custom upload section
  - ✅ Current icon preview

### Step 3: Select Predefined Icon
- Click: Any of the 4 character icons
- Click: **Save**
- Expected:
  - ✅ Modal closes
  - ✅ Bahagi card icon changes
  - ✅ Icon persists (refresh to verify)
- Result: ✅ or ❌

### Step 4: Upload Custom Icon
- Back to modal
- Click: **📤 Upload Custom Icon**
- Drag/drop: Any image (PNG recommended)
- Expected:
  - ✅ Preview shows uploaded image
  - ✅ Can change size with slider
  - ✅ Save button works
- Result: ✅ or ❌

---

## TEST 7: NEW - Database Integrity (3 min)

### Step 1: Open Browser DevTools
- Press: `F12`
- Go to: **Console** tab

### Step 2: Query Database
```javascript
// Paste this into console and press Enter:
fetch('/api/teacher/edit-assessment?assessmentId=YOUR_ASSESSMENT_ID')
  .then(r => r.json())
  .then(d => console.log(d))
```

Replace: `YOUR_ASSESSMENT_ID` with an actual ID from your dashboard

### Step 3: Verify Response
- Should show:
  - ✅ Assessment data
  - ✅ Questions array
  - ✅ Options nested in questions
  - ✅ Media URLs (if uploaded)
- Result: ✅ or ❌

---

## TEST 8: NEW - API Endpoints (5 min)

### Test 8A: Get Assessment Endpoint
```bash
# Open new terminal
curl -X GET "http://localhost:3000/api/teacher/edit-assessment?assessmentId=YOUR_ID" \
  -H "Content-Type: application/json"
```

Expected: JSON with assessment, questions, options

### Test 8B: Check Media Upload Endpoint
```bash
# In browser console, test file upload
fetch('/api/teacher/upload-media', {
  method: 'POST',
  body: formData  // Would need actual file
}).then(r => r.json()).then(d => console.log(d))
```

### Test 8C: Test Icon Endpoint
```bash
curl -X GET "http://localhost:3000/api/teacher/bahagi-icon?bahagiId=1"
```

Expected: Current icon path and predefined options

---

## TEST 9: Browser Console (2 min)

### Step 1: Open DevTools
- Press: `F12`

### Step 2: Check for Errors
- Go to: **Console** tab
- Expected: No red errors
- Warnings are OK
- Result: ✅ or ❌

### Step 3: Check Performance
- Go to: **Performance** tab
- Record: 10-second session
- Stop recording
- Expected:
  - ✅ Smooth interactions
  - ✅ No jank/freezing
  - ✅ Page interactive
- Result: ✅ or ❌

---

## TEST 10: Data Persistence (2 min)

### Step 1: Edit Assessment
- Follow TEST 4 steps
- Add a question
- Click: **Save**

### Step 2: Refresh Page
- Press: `F5`
- Wait for reload

### Step 3: Edit Same Assessment
- Click: **Edit** again
- Expected:
  - ✅ Question still there
  - ✅ Data persisted
  - ✅ Media URLs still work
- Result: ✅ or ❌

---

## TEST 11: Responsive Design (2 min)

### Step 1: Mobile View
- Press: `F12`
- Click: **📱 Toggle Device Toolbar**
- Select: iPhone or iPad

### Step 2: Expected Results
- ✅ Layout adapts
- ✅ Buttons clickable
- ✅ Text readable
- ✅ Forms work
- Result: ✅ or ❌

### Step 3: Desktop View
- Drag: Browser window to smaller size
- Expected: Layout responsive
- Result: ✅ or ❌

---

## TEST 12: Error Handling (2 min)

### Step 1: Test Invalid Input
- Edit assessment
- Enter: Very long title (500+ chars)
- Expected:
  - ✅ Error message shown
  - ✅ Not allowed to save
- Result: ✅ or ❌

### Step 2: Test File Size Limit
- Try upload: File > 10 MB
- Expected:
  - ✅ Error message
  - ✅ Upload prevented
- Result: ✅ or ❌

---

## ✅ FINAL VERIFICATION

### Functionality Tests
- [ ] TEST 1: App loads
- [ ] TEST 2: Database connects
- [ ] TEST 3: Login works
- [ ] TEST 4: Assessment editing
- [ ] TEST 5: Media upload
- [ ] TEST 6: Icon customization
- [ ] TEST 7: Database integrity
- [ ] TEST 8: APIs responding
- [ ] TEST 9: No console errors
- [ ] TEST 10: Data persistence
- [ ] TEST 11: Responsive
- [ ] TEST 12: Error handling

### Score
```
Passed: ___/12
Failed: ___/12

Required: 11/12 (91.7%)
```

---

## 😼 COMMON ISSUES & FIXES

### Issue: "Cannot read property 'map' of undefined"
```
Fix: Refresh page (F5)
     Check database connection
     Run: npm run dev again
```

### Issue: Media upload shows "404 Not Found"
```
Fix: Create Supabase bucket first!
     See: DEPLOY_NOW.md → Before You Deploy
```

### Issue: Icons don't render
```
Fix: Check if character images exist
     Run: node scripts/quick-start.mjs
     Verify: All 4 PNG files present
```

### Issue: "Too many connections" error
```
Fix: Restart dev server
     Kill: taskkill /F /IM node.exe
     Start: npm run dev
```

### Issue: Assessment won't save
```
Fix: Check browser console for errors
     Verify all required fields filled
     Check database connection
```

---

## 📊 TEST RESULTS TEMPLATE

```
Date:     April 9, 2026
Tester:   [Your name]
Platform: [Windows/Mac/Linux]
Browser:  [Chrome/Firefox/Safari]

RESULTS:
├─ Functionality:  [PASS/FAIL]
├─ Performance:    [PASS/FAIL]
├─ UI/UX:         [PASS/FAIL]
├─ Database:      [PASS/FAIL]
├─ APIs:          [PASS/FAIL]
└─ Overall:       [PASS/FAIL]

Issues Found:
1. [Issue description]
2. [Issue description]

Notes:
[Any additional observations]
```

---

## ✨ READY FOR PRODUCTION?

**If all 12 tests ✅ PASS:**
- Ready to deploy! 🚀
- Follow: DEPLOY_NOW.md

**If some tests ❌ FAIL:**
- Review: Test step that failed
- Check: Error messages
- Fix: Issue
- Re-test: That feature
- Then deploy

---

## 📚 REFERENCES

- **Component Code:** `app/components/TeacherComponents/`
- **API Code:** `app/api/teacher/`
- **Database Schema:** `scripts/create-assessment-structure.sql`
- **Quick Ref:** `QUICK_REFERENCE.md`
- **Full Guide:** `ENHANCEMENT_IMPLEMENTATION_GUIDE.md`

---

## 🎯 Next Steps

**After Testing:**
1. All tests pass → Deploy
2. Some fail → Fix issues
3. Need help → See QUICK_REFERENCE.md

---

**Estimated Testing Time:** 30 minutes ⏱️  
**Dev Server:** Running at http://localhost:3000 ✅  
**Ready to Test:** YES
