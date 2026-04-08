# Complete Integration Guide - Wire Everything Together

## 🔌 Full Page Examples

### 1. Teacher Analytics Page

```tsx
// app/teacher/class/[classId]/analytics/page.tsx
'use client';

import { TeacherAnalyticsDashboard } from '@/app/components/TeacherComponents/TeacherAnalyticsDashboard';
import { useParams } from 'next/navigation';

export default function TeacherAnalyticsPage() {
  const params = useParams();
  const classId = params.classId as string;
  
  // TODO: Get teacherId from your auth system
  const teacherId = 'teacher_from_auth_context';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header Navigation */}
      <div className="border-b border-slate-800/50 p-6">
        <button
          onClick={() => window.history.back()}
          className="mb-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
        >
          ← Back to Class
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <TeacherAnalyticsDashboard
          classId={classId}
          teacherId={teacherId}
        />
      </div>
    </div>
  );
}
```

---

### 2. Student Gradebook Page

```tsx
// app/student/gradebook/page.tsx
'use client';

import { StudentGradebook } from '@/app/components/TeacherComponents/StudentGradebook';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Your auth hook

export default function GradebookPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  // Get classId from URL or query
  const classId = params?.classId as string;

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800/50 p-6 bg-slate-900/30">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-black text-white">📚 My Gradebook</h1>
      </div>

      {/* Content */}
      <div className="p-6">
        <StudentGradebook
          classId={classId}
          studentId={user.id}
        />
      </div>
    </div>
  );
}
```

---

### 3. Enhanced Lesson Creation (with Draft Mode)

```tsx
// app/teacher/class/[classId]/bahagi/[bahagiId]/create-lesson/page.tsx
'use client';

import { DraftLessonManager } from '@/app/components/TeacherComponents/DraftLessonManager';
import { RichTextEditor, useRichTextEditor } from '@/app/components/TeacherComponents/RichTextEditor';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CreateLessonPage() {
  const params = useParams();
  const router = useRouter();
  const { bahagiId } = params;
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveDraft = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/teacher/save-lesson-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        throw new Error('Failed to save draft');
      }

      const result = await res.json();
      alert('✅ Draft saved successfully');
      return result;
    } catch (err) {
      alert('❌ Failed to save draft');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/teacher/manage-yunit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bahagiId: data.bahagiId,
          title: data.title,
          subtitle: data.subtitle,
          discussion: data.discussion,
          mediaUrl: data.mediaUrl,
          isPublished: true
        })
      });

      if (!res.ok) {
        throw new Error('Failed to publish');
      }

      alert('🚀 Lesson published successfully');
      router.push(`/teacher/class/${params.classId}/bahagi/${bahagiId}`);
    } catch (err) {
      alert('❌ Failed to publish lesson');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <DraftLessonManager
        bahagiId={bahagiId as string}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isLoading={isLoading}
      />
    </div>
  );
}
```

---

### 4. Student Lesson with Timed Assessment

```tsx
// app/student/class/[classId]/bahagi/[bahagiId]/lesson/[unitId]/page.tsx
'use client';

import { AssessmentAnswerSubmission } from '@/app/components/TeacherComponents/AssessmentAnswerSubmission';
import { TimedAssessment } from '@/app/components/TeacherComponents/TimedAssessment';
import { RandomizedAssessment } from '@/app/components/TeacherComponents/RandomizedAssessment';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Assessment {
  id: string;
  title: string;
  type: string;
  points: number;
  timeLimit?: number;
  randomizeOptions?: boolean;
}

export default function StudentLessonPage() {
  const params = useParams();
  const { classId, bahagiId, unitId } = params;
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentId] = useState('student_from_auth');

  useEffect(() => {
    // Fetch assessment details
    const load = async () => {
      try {
        const res = await fetch(`/api/assessment/${unitId}`);
        const data = await res.json();
        setAssessment(data.assessment);
      } catch (err) {
        console.error('Error loading assessment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [unitId]);

  if (isLoading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!assessment) {
    return <div className="text-center py-20">Assessment not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="mb-6 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
        >
          ← Back
        </button>

        {/* Use Timed Assessment if has time limit */}
        {assessment.timeLimit ? (
          <TimedAssessment
            assessment={assessment}
            timeLimit={assessment.timeLimit}
            studentId={studentId}
            onSubmitAnswer={async (answer) => {
              // Handle submission
              await fetch('/api/teacher/save-yunit-answer', {
                method: 'POST',
                body: JSON.stringify({
                  yunitId: unitId,
                  assessmentId: assessment.id,
                  studentId,
                  studentAnswer: answer,
                  // isCorrect and pointsEarned come from validation
                })
              });
            }}
          />
        ) : assessment.randomizeOptions ? (
          // Use Randomized Assessment if randomization enabled
          <RandomizedAssessment
            assessment={assessment}
            seed={`${studentId}-${assessment.id}`}
            studentId={studentId}
            onSubmitAnswer={async (answer) => {
              // Handle submission
            }}
          />
        ) : (
          // Use standard submission for regular assessments
          <AssessmentAnswerSubmission
            assessment={assessment}
            yunitId={unitId as string}
            studentId={studentId}
            allowRetake={true}
            maxAttempts={3}
          />
        )}
      </div>
    </div>
  );
}
```

---

### 5. Dashboard with All Features

```tsx
// app/teacher/dashboard/page.tsx
'use client';

import { ClassDetailPage } from '@/app/components/TeacherComponents/ClassDetailPage';
import { TeacherAnalyticsDashboard } from '@/app/components/TeacherComponents/TeacherAnalyticsDashboard';
import { useState } from 'react';

export default function TeacherDashboard() {
  const [view, setView] = useState<'classes' | 'analytics'>('classes');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const teacherId = 'teacher_from_auth';

  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setView('classes');
  };

  const handleViewAnalytics = (classId: string) => {
    setSelectedClassId(classId);
    setView('analytics');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Navigation */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setView('classes')}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            view === 'classes'
              ? 'bg-brand-purple text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          📚 My Classes
        </button>
        {selectedClassId && (
          <button
            onClick={() => handleViewAnalytics(selectedClassId)}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              view === 'analytics'
                ? 'bg-brand-purple text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 Analytics
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {view === 'classes' && selectedClassId ? (
          <ClassDetailPage
            classId={selectedClassId}
            classNameProp="Current Class"
          />
        ) : view === 'analytics' && selectedClassId ? (
          <TeacherAnalyticsDashboard
            classId={selectedClassId}
            teacherId={teacherId}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 font-bold">Select a class to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 6. Student Dashboard with Assessments

```tsx
// app/student/dashboard/page.tsx
'use client';

import { StudentYunitView } from '@/app/components/TeacherComponents/StudentYunitView';
import { StudentGradebook } from '@/app/components/TeacherComponents/StudentGradebook';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [view, setView] = useState<'lessons' | 'gradebook'>('lessons');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedBahagi, setSelectedBahagi] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  // Load classes on mount
  React.useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/student/my-classes?studentId=${user?.id}`);
      const data = await res.json();
      setClasses(data.classes || []);
    };
    if (user) load();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Navigation */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setView('lessons')}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            view === 'lessons'
              ? 'bg-brand-purple text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          📚 Lessons
        </button>
        <button
          onClick={() => setView('gradebook')}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            view === 'gradebook'
              ? 'bg-brand-purple text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          📊 My Gradebook
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {view === 'lessons' ? (
          <>
            {selectedBahagi ? (
              <StudentYunitView
                classId={selectedClass.id}
                bahagiId={selectedBahagi.id}
                studentId={user?.id || ''}
                onBack={() => setSelectedBahagi(null)}
              />
            ) : selectedClass ? (
              <div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="mb-6 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  ← Back to Classes
                </button>
                <h1 className="text-3xl font-black text-white mb-6">
                  {selectedClass.name}
                </h1>
                <div className="grid grid-cols-2 gap-6">
                  {selectedClass.bahagis?.map((bahagi: any) => (
                    <button
                      key={bahagi.id}
                      onClick={() => setSelectedBahagi(bahagi)}
                      className="p-6 bg-slate-900/50 border border-slate-800/50 rounded-2xl hover:border-brand-purple transition text-left"
                    >
                      <p className="text-lg font-black text-white">{bahagi.title}</p>
                      <p className="text-sm text-slate-400 mt-2">
                        {bahagi.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-black text-white mb-6">📚 My Classes</h1>
                <div className="grid grid-cols-3 gap-6">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls)}
                      className="p-6 bg-slate-900/50 border border-slate-800/50 rounded-2xl hover:border-brand-purple transition text-left"
                    >
                      <p className="text-lg font-black text-white">{cls.name}</p>
                      <p className="text-sm text-slate-400 mt-2">{cls.teacher}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          selectedClass ? (
            <StudentGradebook
              classId={selectedClass.id}
              studentId={user?.id || ''}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 font-bold">Select a class to view gradebook</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 Essential API Implementation Patterns

### Updating Enhanced Validation Endpoint

```tsx
// Update your existing validate-answer endpoint or create enhanced version
// Now supports partial credit for checkbox and matching

export async function POST(req: NextRequest) {
  const { assessment, studentAnswer, assessmentType } = await req.json();

  // ... validation logic ...
  
  return NextResponse.json({
    isCorrect,
    pointsEarned,     // May be partial (e.g., 6 out of 10)
    totalPoints: assessment.points,
    correctAnswer,
    feedback,
    partialCredit     // NEW: indicates if this is partial credit
  });
}
```

### Draft Lesson Endpoints

```tsx
// POST /api/teacher/save-lesson-draft
export async function POST(req: NextRequest) {
  const { bahagiId, title, subtitle, discussion, mediaUrl } = await req.json();

  const { data, error } = await supabase
    .from('lesson_drafts')  // Create this table
    .upsert({
      id: draft_id,
      bahagi_id: bahagiId,
      title,
      subtitle,
      discussion,
      media_url: mediaUrl,
      is_published: false,
      updated_at: new Date()
    });

  if (error) throw error;
  return NextResponse.json({ data });
}

// POST /api/teacher/publish-lesson
export async function POST(req: NextRequest) {
  const { bahagiId, title, subtitle, discussion, mediaUrl } = await req.json();

  // Create published yunit
  const { data, error } = await supabase
    .from('lesson')
    .insert({
      bahagi_id: bahagiId,
      title,
      subtitle,
      discussion,
      media_url: mediaUrl,
      is_published: true
    });

  if (error) throw error;
  return NextResponse.json({ data });
}
```

---

## 📋 Database Additions

### New Tables Needed

```sql
-- Lesson drafts (optional, for draft mode)
CREATE TABLE lesson_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bahagi_id UUID NOT NULL REFERENCES bahagi(id),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  discussion TEXT,
  media_url VARCHAR(500),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Already created in step 3:
-- yunit_answers table for tracking submissions
```

---

## 🚀 Deployment Quick Checklist

- [ ] Add Quill.js to layout.tsx
- [ ] Install recharts: `npm install recharts`
- [ ] Create all 5 analytics API endpoints
- [ ] Create lesson draft endpoints (optional)
- [ ] Update existing validate-answer endpoint with partial credit
- [ ] Wire up teacher analytics page
- [ ] Wire up student gradebook page
- [ ] Wire up lesson creation page with draft mode
- [ ] Create student lesson page with assessment
- [ ] Test complete end-to-end flow
- [ ] Deploy to production

**All files ready for integration!** 🎉
