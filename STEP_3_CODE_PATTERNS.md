# Step 3: Code Integration Patterns

## Quick Start - Copy/Paste Integration

### Pattern 1: Basic Student Assessment Page
```tsx
// app/student/lesson/[classId]/[bahagiId]/page.tsx
'use client';

import { StudentYunitView } from '@/app/components/TeacherComponents/StudentYunitView';

export default function StudentLessonPage({ 
  params 
}: { 
  params: { classId: string; bahagiId: string } 
}) {
  // Get studentId from your auth system (Supabase, NextAuth, etc.)
  const studentId = '...'; // TODO: Get from auth

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <StudentYunitView
        classId={params.classId}
        bahagiId={params.bahagiId}
        studentId={studentId}
        onBack={() => window.history.back()}
      />
    </div>
  );
}
```

---

### Pattern 2: Embed Assessment in Custom Page
```tsx
'use client';

import { AssessmentAnswerSubmission } from '@/app/components/TeacherComponents/AssessmentAnswerSubmission';
import { useState } from 'react';

export default function QuizPage({ params }: any) {
  const { assessmentId } = params;
  const [assessment, setAssessment] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Fetch assessment details
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/assessments/${assessmentId}`);
      const data = await res.json();
      setAssessment(data);
    };
    load();
  }, [assessmentId]);

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-black text-white mb-8">Quiz Time 📝</h1>

      {assessment && (
        <AssessmentAnswerSubmission
          assessment={assessment}
          yunitId="lesson_id_here"
          studentId="student_id_here"
          allowRetake={true}
          maxAttempts={3}
          onComplete={(result) => {
            console.log(`Got ${result.pointsEarned}/${assessment.points} points`);
            setIsComplete(true);
          }}
        />
      )}

      {isComplete && (
        <button
          onClick={() => window.history.back()}
          className="mt-6 w-full px-6 py-3 bg-brand-purple text-white rounded-xl font-black"
        >
          ← Back to Lessons
        </button>
      )}
    </div>
  );
}
```

---

### Pattern 3: Assessment in Modal Dialog
```tsx
'use client';

import { AssessmentDisplay } from '@/app/components/TeacherComponents/AssessmentDisplay';
import { useState } from 'react';

export function QuizModal({ 
  assessment, 
  isOpen, 
  onClose 
}: { 
  assessment: any; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (answer: any) => {
    setIsSubmitting(true);

    try {
      // Validate answer
      const validRes = await fetch('/api/teacher/validate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment,
          studentAnswer: answer,
          assessmentType: assessment.type
        })
      });

      const validation = await validRes.json();

      // Save answer
      await fetch('/api/teacher/save-yunit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yunitId: 'lesson_id',
          assessmentId: assessment.id,
          studentId: 'student_id',
          studentAnswer: answer,
          isCorrect: validation.isCorrect,
          pointsEarned: validation.pointsEarned,
          assessmentType: assessment.type,
          attemptNumber: 1
        })
      });

      // Show result
      if (validation.isCorrect) {
        alert(`✅ Correct! +${validation.pointsEarned} points`);
      } else {
        alert(`❌ Incorrect. Correct answer: ${validation.correctAnswer}`);
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 rounded-3xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <button
          onClick={onClose}
          className="float-right text-3xl text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <AssessmentDisplay
          assessment={assessment}
          onSubmitAnswer={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
```

---

## Assessment Type Examples

### Example 1: Multiple Choice Assessment
```json
{
  "id": "assess_001",
  "title": "What is the capital of the Philippines?",
  "type": "multiple-choice",
  "options": ["Manila", "Cebu", "Davao", "Makati"],
  "correctAnswer": "Manila",
  "points": 10
}
```

**Student Answer:** `"Manila"`
**Validation:** String exact match

---

### Example 2: Short Answer Assessment
```json
{
  "id": "assess_002",
  "title": "Who is the current president of the Philippines?",
  "type": "short-answer",
  "correctAnswer": "Ferdinand Marcos Jr",
  "points": 15
}
```

**Student Answer:** `"Ferdinand Marcos Jr"`
**Validation:** Case-insensitive string match (trim whitespace)

---

### Example 3: Checkbox Assessment
```json
{
  "id": "assess_003",
  "title": "Select all Philippine island groups",
  "type": "checkbox",
  "options": ["Luzon", "Visayas", "Mindanao", "Calabarzon"],
  "correctAnswers": ["Luzon", "Visayas", "Mindanao"],
  "points": 20
}
```

**Student Answer:** `["Luzon", "Visayas", "Mindanao"]`
**Validation:** Array includes all correct options, no extras

---

### Example 4: Matching Assessment
```json
{
  "id": "assess_004",
  "title": "Match capitals with provinces",
  "type": "matching",
  "options": [
    { "left": "Metro Manila", "right": "NCR" },
    { "left": "Quezon City", "right": "Laguna" },
    { "left": "Cebu City", "right": "Cebu" }
  ],
  "points": 15
}
```

**Student Answer:**
```json
{
  "0": "NCR",
  "1": "Laguna", 
  "2": "Cebu"
}
```

**Validation:** Each key-value pair matches correctly

---

### Example 5: Scramble Word Assessment
```json
{
  "id": "assess_005",
  "title": "Arrange in correct order: 'Hello World Program'",
  "type": "scramble-word",
  "options": ["Program", "Hello", "World"],
  "correctOrder": ["Hello", "World", "Program"],
  "points": 10
}
```

**Student Answer:** `["Hello", "World", "Program"]`
**Validation:** Array order matches exactly

---

### Example 6: Audio Assessment
```json
{
  "id": "assess_006",
  "title": "Record: 'Sing the Philippine national anthem'",
  "type": "audio",
  "points": 25,
  "duration_seconds": 120
}
```

**Student Answer:** `"blob:http://localhost:3000/abc123..."` (audio URL)
**Validation:** Placeholder - requires speech-to-text integration

---

## State Management Patterns

### Track Multiple Assessments
```tsx
const [assessmentResults, setAssessmentResults] = useState<
  Record<string, SubmissionResult>
>({});

const handleAssessmentComplete = (assessmentId: string, result: SubmissionResult) => {
  setAssessmentResults(prev => ({
    ...prev,
    [assessmentId]: result
  }));
};

const isAllComplete = assessments.every(a => assessmentResults[a.id]);
const totalPoints = assessments.reduce((sum, a) => 
  sum + (assessmentResults[a.id]?.pointsEarned || 0), 0
);
```

---

### Track Submission Progress
```tsx
const [submissions, setSubmissions] = useState({
  isSubmitting: false,
  currentAssessmentId: null,
  error: null
});

const updateProgress = (assessmentId: string, state: 'loading' | 'success' | 'error') => {
  setSubmissions(prev => ({
    ...prev,
    currentAssessmentId: state === 'loading' ? assessmentId : null,
    isSubmitting: state === 'loading',
    error: state === 'error' ? `Failed to submit to ${assessmentId}` : null
  }));
};
```

---

## Validation Function Patterns

### Implement Custom Validation
```tsx
// Override validate-answer API with custom logic
const validateCustomAnswer = async (assessment: any, answer: any) => {
  // Custom rules
  if (assessment.type === 'short-answer') {
    // Allow variations
    const variations = [
      assessment.correctAnswer.toLowerCase(),
      assessment.correctAnswer.trim().toLowerCase(),
      assessment.correctAnswer.replaceAll(' ', '').toLowerCase()
    ];

    const normalized = answer.toLowerCase().trim().replaceAll(' ', '');
    const isCorrect = variations.includes(normalized);

    return {
      isCorrect,
      pointsEarned: isCorrect ? assessment.points : 0,
      correctAnswer: assessment.correctAnswer
    };
  }

  // Fall back to API validation
  const res = await fetch('/api/teacher/validate-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assessment,
      studentAnswer: answer,
      assessmentType: assessment.type
    })
  });

  return res.json();
};
```

---

## Error Handling Patterns

### Graceful Degradation
```tsx
const handleSubmitAnswer = async (answer: any) => {
  setIsSubmitting(true);
  setError(null);

  try {
    // Try validation
    let result;
    try {
      const res = await fetch('/api/teacher/validate-answer', { /* ... */ });
      result = await res.json();
    } catch (err) {
      console.warn('Validation failed, marking as pending review');
      result = {
        isCorrect: null, // null = pending teacher review
        pointsEarned: 0,
        correctAnswer: 'Pending teacher review'
      };
    }

    // Try saving
    try {
      await fetch('/api/teacher/save-yunit-answer', { /* ... */ });
    } catch (err) {
      console.warn('Save failed, data may not persist');
      // Still show result to student even if save failed
    }

    setResult(result);
  } catch (err) {
    setError('Failed to submit answer. Please try again.');
    console.error(err);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Real-World Integration: LMS Dashboard

```tsx
'use client';

import { useState, useEffect } from 'react';
import { StudentYunitView } from '@/components/TeacherComponents/StudentYunitView';

export default function StudentDashboard() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedBahagi, setSelectedBahagi] = useState(null);

  useEffect(() => {
    // Load student's classes
    const load = async () => {
      const res = await fetch(`/api/student/my-classes`);
      const data = await res.json();
      setClasses(data.classes);
    };
    load();
  }, []);

  if (!selectedClass) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <h1 className="text-4xl font-black text-white mb-8">My Classes</h1>
        <div className="grid grid-cols-3 gap-6">
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className="p-6 bg-slate-900/50 border border-slate-800/50 rounded-2xl hover:border-brand-purple transition text-left"
            >
              <p className="text-lg font-black text-white">{cls.name}</p>
              <p className="text-sm text-slate-400">{cls.teacher}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedBahagi) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <button
          onClick={() => setSelectedClass(null)}
          className="mb-6 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
        >
          ← Back to Classes
        </button>
        <h1 className="text-4xl font-black text-white mb-8">{selectedClass.name}</h1>
        <div className="grid grid-cols-2 gap-6">
          {selectedClass.bahagis?.map(bahagi => (
            <button
              key={bahagi.id}
              onClick={() => setSelectedBahagi(bahagi)}
              className="p-6 bg-slate-900/50 border border-slate-800/50 rounded-2xl hover:border-brand-purple transition text-left"
            >
              <p className="text-lg font-black text-white">{bahagi.title}</p>
              <p className="text-sm text-slate-400">{bahagi.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <button
        onClick={() => setSelectedBahagi(null)}
        className="mb-6 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
      >
        ← Back to Modules
      </button>
      <StudentYunitView
        classId={selectedClass.id}
        bahagiId={selectedBahagi.id}
        studentId="current_user_id"
      />
    </div>
  );
}
```

---

## Performance Optimization Tips

1. **Lazy Load Media**
   ```tsx
   {selectedYunit.media_url && (
     <img
       src={selectedYunit.media_url}
       loading="lazy"
       alt={selectedYunit.title}
     />
   )}
   ```

2. **Memoize Assessment Display**
   ```tsx
   const MemoizedDisplay = memo(AssessmentDisplay);
   ```

3. **Debounce Text Input**
   ```tsx
   const [textAnswer, setTextAnswer] = useState('');
   const debouncedText = useDebounce(textAnswer, 500);
   ```

4. **Cache Previous Attempts**
   ```tsx
   // Call once on mount, don't refetch
   useEffect(() => {
     loadPreviousAttempts();
   }, [yunitId, assessmentId, studentId]);
   ```

---

## Testing Examples

```tsx
// Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { AssessmentDisplay } from '@/components/TeacherComponents/AssessmentDisplay';

describe('AssessmentDisplay', () => {
  it('renders multiple choice options', () => {
    const assessment = {
      type: 'multiple-choice',
      options: ['A', 'B', 'C', 'D'],
      title: 'Test Question'
    };

    render(
      <AssessmentDisplay
        assessment={assessment}
        onSubmitAnswer={() => {}}
      />
    );

    assessment.options.forEach(opt => {
      expect(screen.getByLabelText(opt)).toBeInTheDocument();
    });
  });

  it('disables submit when no answer selected', () => {
    const mockSubmit = jest.fn();
    render(
      <AssessmentDisplay
        assessment={{ type: 'multiple-choice', options: ['A', 'B'] }}
        onSubmitAnswer={mockSubmit}
      />
    );

    const submitBtn = screen.getByText(/Submit/i);
    fireEvent.click(submitBtn);

    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

---

## Accessibility Patterns

```tsx
// Use proper ARIA labels
<label htmlFor="answer-input" className="text-sm font-bold">
  Provide your answer:
</label>
<textarea
  id="answer-input"
  aria-label="Short answer text input"
  placeholder="Type your answer here..."
/>

// Keyboard navigation
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  }}
>
  Submit (Ctrl+Enter)
</button>

// Skip links
<a href="#assessment-form" className="sr-only focus:not-sr-only">
  Skip to assessment form
</a>
```

All patterns ready for copy-paste implementation! 🚀
