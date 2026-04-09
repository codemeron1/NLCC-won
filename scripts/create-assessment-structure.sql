-- ==========================================
-- Assessment System Enhancement
-- Tables: questions, options, media_files
-- ==========================================

-- 1. CREATE QUESTIONS TABLE
-- Stores individual questions for assessments
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN (
        'multiple-choice', 'short-answer', 'checkbox', 
        'media-audio', 'scramble', 'matching'
    )),
    question_order INT NOT NULL,
    instructions TEXT,
    correct_answer TEXT,                    -- For short-answer, scramble
    image_url VARCHAR(500),                 -- Question image
    audio_url VARCHAR(500),                 -- Question audio
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. CREATE OPTIONS TABLE
-- Stores answer options for multiple-choice and checkbox questions
CREATE TABLE IF NOT EXISTS options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_order INT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),                 -- Option image (for image-based MCQ)
    audio_url VARCHAR(500),                 -- Option audio (for audio-based MCQ)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. CREATE MEDIA_FILES TABLE
-- Centralized storage for all media (images, audio)
-- Can be referenced by questions or options
CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,        -- Path in storage bucket
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'audio')),
    mime_type VARCHAR(50),                  -- e.g., image/png, audio/mp3
    file_size INT,                          -- Size in bytes
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT NOW(),
    bucket_name VARCHAR(100) DEFAULT 'assessment-media'
);

-- 4. UPDATE BAHAGI TABLE WITH ICON SUPPORT
-- Add icon customization columns to bahagi table
ALTER TABLE bahagi ADD COLUMN IF NOT EXISTS icon_path VARCHAR(500);
ALTER TABLE bahagi ADD COLUMN IF NOT EXISTS icon_type VARCHAR(50) DEFAULT 'default' 
    CHECK (icon_type IN ('default', 'custom'));

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_questions_question_order ON questions(assessment_id, question_order);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_options_question_order ON options(question_id, option_order);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_bahagi_icon_type ON bahagi(icon_type);

-- 6. ADD COMMENT FOR CLARITY
COMMENT ON TABLE questions IS 'Individual questions within an assessment with media support';
COMMENT ON TABLE options IS 'Answer options for questions with image/audio support';
COMMENT ON TABLE media_files IS 'Centralized media file storage for questions and options';
COMMENT ON COLUMN bahagi.icon_path IS 'Path to icon/image file (default: predefined, custom: uploaded)';
COMMENT ON COLUMN bahagi.icon_type IS 'Type of icon (default=predefined, custom=user-uploaded)';
