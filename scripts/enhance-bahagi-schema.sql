-- Enhance Bahagi Table with status and archive columns
ALTER TABLE bahagi 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS class_id UUID,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Enhance Lesson Table (used as Yunit)
ALTER TABLE lesson
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Enhance Assessment Table
ALTER TABLE bahagi_assessment
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lesson_id INT,
ADD COLUMN IF NOT EXISTS options JSONB,
ADD COLUMN IF NOT EXISTS correct_answer JSONB,
ADD COLUMN IF NOT EXISTS points INT DEFAULT 10;

-- Create Yunit Answers Table for validation
CREATE TABLE IF NOT EXISTS yunit_answers (
    id SERIAL PRIMARY KEY,
    assessment_id INT REFERENCES bahagi_assessment(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    answer JSONB NOT NULL,
    is_correct BOOLEAN,
    earned_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bahagi_is_archived ON bahagi(is_archived) WHERE is_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_bahagi_is_published ON bahagi(is_published);
CREATE INDEX IF NOT EXISTS idx_lesson_is_archived ON lesson(is_archived) WHERE is_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_assessment_is_archived ON bahagi_assessment(is_archived) WHERE is_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_yunit_answers_assessment ON yunit_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_yunit_answers_student ON yunit_answers(student_id);
