# ✅ Implementation Checklist

## Phase 1: Database Setup
- [ ] Review `scripts/create-assessment-structure.sql`
- [ ] Run migration: `node scripts/migrate-assessment-structure.mjs`
- [ ] Verify tables created:
  ```bash
  # Manual verification
  psql -c "SELECT tablename FROM pg_tables WHERE tablename IN ('questions', 'options', 'media_files');"
  ```
- [ ] Check Bahagi table updates:
  ```bash
  psql -c "SELECT column_name FROM information_schema.columns WHERE table_name='bahagi' AND column_name IN ('icon_path', 'icon_type');"
  ```
- [ ] Verify indexes created
- [ ] Backup database before proceeding

## Phase 2: API Setup
- [ ] Create `app/api/teacher/edit-assessment/route.ts`
- [ ] Create `app/api/teacher/upload-media/route.ts`
- [ ] Create `app/api/teacher/bahagi-icon/route.ts`
- [ ] Test endpoints with curl or Postman:
  ```bash
  # Test edit-assessment GET
  curl "http://localhost:3000/api/teacher/edit-assessment?assessmentId=<uuid>"
  
  # Test upload-media POST (requires FormData)
  # Test bahagi-icon GET
  curl "http://localhost:3000/api/teacher/bahagi-icon?bahagiId=1"
  ```
- [ ] Verify error messages are helpful
- [ ] Check logging in console

## Phase 3: Component Creation
- [ ] Create `app/components/TeacherComponents/EditAssessmentV2Form.tsx`
- [ ] Create `app/components/TeacherComponents/BahagiIconSelector.tsx`
- [ ] Create `app/components/TeacherComponents/EnhancedBahagiCardV2.tsx`
- [ ] Update `app/components/TeacherComponents/index.ts` with exports
- [ ] Verify all imports work without errors:
  ```bash
  npm run build
  ```
- [ ] Check no TypeScript errors
- [ ] Validate component props match interfaces

## Phase 4: Supabase Setup
- [ ] Go to Supabase Dashboard
- [ ] Create storage bucket "assessment-media"
- [ ] Set bucket to PUBLIC
- [ ] Enable public read access:
  - [ ] Policy: Allow public read on *.* for all
  - [ ] Policy: Allow authenticated write
- [ ] Test upload manually:
  ```bash
  curl -X POST https://your-project.supabase.co/storage/v1/object/assessment-media/test.jpg \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d @test.jpg
  ```

## Phase 5: Asset Setup
- [ ] Ensure character images exist in `public/Character/`:
  - [ ] `NLLCTeachHalf1.png`
  - [ ] `NLLCTeachHalf2.png`
  - [ ] `NLLCTeachHalf3.png`
  - [ ] `NLLCTeachHalf4.png`
- [ ] Test image access:
  ```bash
  # Should return 200 OK
  curl -I http://localhost:3000/Character/NLLCTeachHalf1.png
  ```
- [ ] Verify image sizes (prefer max 500KB each)
- [ ] Test in browser: http://localhost:3000/Character/NLLCTeachHalf1.png

## Phase 6: Components Integration
- [ ] Find all Assessment edit buttons in codebase
  ```bash
  grep -r "Edit.*Assessment" app/components/
  ```
- [ ] For each edit button:
  - [ ] Create state for showing editor
  - [ ] Import EditAssessmentV2Form
  - [ ] Add modal wrapper
  - [ ] Test opening and closing modal
  - [ ] Test editing works
  - [ ] Test media upload works

- [ ] Find all Bahagi card displays
  ```bash
  grep -r "BahagiCard\|ClassDetailPage" app/components/
  ```
- [ ] For each Bahagi display:
  - [ ] Replace with EnhancedBahagiCardV2
  - [ ] Pass icon_path and icon_type props
  - [ ] Test card displays with icon
  - [ ] Test icon customization
  - [ ] Test all action buttons work

## Phase 7: Testing
- [ ] Run automated test suite:
  ```bash
  node scripts/test-system-enhancements.mjs
  ```
- [ ] All tests pass ✅

### Unit Testing
- [ ] Assessment editing without media
- [ ] Assessment editing with image
- [ ] Assessment editing with audio
- [ ] Question addition/deletion
- [ ] Option addition/deletion
- [ ] Correct answer marking

### Integration Testing
- [ ] Create assessment → Edit → Save (full cycle)
- [ ] Upload image → Verify in Supabase → Display in UI
- [ ] Upload audio → Verify in Supabase → Play in UI
- [ ] Change Bahagi icon multiple times → Persists

### UI/UX Testing
- [ ] Modal opens/closes smoothly
- [ ] Form validation works
- [ ] Error messages clear
- [ ] Success messages appear
- [ ] Loading states show
- [ ] Animations smooth
- [ ] Mobile responsive (if applicable)

### Browser Testing
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅

## Phase 8: Performance
- [ ] Measure component load time
  ```bash
  npm run build
  # Check bundle size increase
  du -sh .next/static/
  ```
- [ ] Test with slow network (DevTools → Slow 3G)
- [ ] Test with large files (~5MB)
- [ ] Monitor database queries (slow query log)
- [ ] Check API response times

## Phase 9: Documentation
- [ ] Update team wiki/docs with:
  - [ ] How to edit assessments
  - [ ] How to customize Bahagi icons
  - [ ] API documentation
  - [ ] Troubleshooting guide
- [ ] Add inline code comments for complex logic
- [ ] Create video tutorial (optional)

## Phase 10: Deployment
- [ ] Set environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`
- [ ] Run production build:
  ```bash
  npm run build
  # Should complete without errors
  ```
- [ ] Deploy to staging first
- [ ] Run tests on staging
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Verify features work in production

## Phase 11: Post-Launch
- [ ] Gather user feedback
- [ ] Monitor error rates (should be 0)
- [ ] Check performance metrics
- [ ] Plan rollback if needed
- [ ] Document any issues
- [ ] Create incident response plan
- [ ] Schedule feature training for teachers

## Rollback Plan (if needed)
If deployment fails:
1. [ ] Revert code to previous version
2. [ ] Clear browser cache
3. [ ] Restart application server
4. [ ] Verify database is intact (no data loss)
5. [ ] Notify users of downtime
6. [ ] Document what went wrong

## Success Criteria
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Teachers can edit assessments
- [ ] Teachers can customize icons
- [ ] Media uploads work
- [ ] All data persists
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] No regression in other features

## Sign-Off
- [ ] Developer review: _____________________
- [ ] QA review: _____________________
- [ ] Product manager: _____________________
- [ ] Deployment date: _____________________

---

## Quick Command Reference

```bash
# Setup
node scripts/migrate-assessment-structure.mjs

# Testing
node scripts/test-system-enhancements.mjs

# Building
npm run build

# Development
npm run dev

# Database verification
psql -c "SELECT * FROM questions LIMIT 1;"
psql -c "SELECT * FROM options LIMIT 1;"
psql -c "SELECT * FROM media_files LIMIT 1;"

# View logs
tail -f .next/server.log
```

---

## Support Contacts
- Backend Issues: [Backend Team Lead]
- Frontend Issues: [Frontend Team Lead]
- Supabase Issues: [DevOps Lead]
- Database Issues: [Database Admin]

---

**Last Updated:** April 9, 2026
**Version:** 1.0
