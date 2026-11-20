-- =========================================================================
-- BLUEPRINT DATABASE SCHEMA: MEMORIES 2027 — BUKU KENANGAN SMPN 1 RAJAPOLAH
-- PostgreSQL / Supabase Migration & Storage Buckets
-- =========================================================================

-- 1. Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Custom ENUM Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'STUDENT');
CREATE TYPE profile_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE message_recipient AS ENUM ('FRIENDS', 'TEACHERS', 'SCHOOL', 'FUTURE_SELF', 'GRADUATION');

-- 3. Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_name VARCHAR(50) NOT NULL UNIQUE,
  class_slug VARCHAR(50) NOT NULL UNIQUE,
  homeroom_teacher_id UUID,
  class_photo TEXT,
  class_motto TEXT,
  class_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(150) NOT NULL,
  photo TEXT,
  subject VARCHAR(100) NOT NULL,
  position VARCHAR(150),
  description TEXT,
  quote TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key from classes to teachers
ALTER TABLE classes 
  ADD CONSTRAINT fk_classes_teacher 
  FOREIGN KEY (homeroom_teacher_id) 
  REFERENCES teachers(id) 
  ON DELETE SET NULL;

-- 5. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role DEFAULT 'STUDENT',
  is_active BOOLEAN DEFAULT true,
  student_id UUID UNIQUE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  nisn VARCHAR(20),
  profile_photo TEXT,
  hobbies TEXT,
  personality TEXT,
  motto TEXT,
  favorite_subject TEXT,
  favorite_food TEXT,
  favorite_song TEXT,
  favorite_movie TEXT,
  favorite_place TEXT,
  favorite_thing_about_school TEXT,
  describe_three_words TEXT,
  funniest_moment TEXT,
  unforgettable_memory TEXT,
  school_story TEXT,
  favorite_teacher TEXT,
  favorite_activity TEXT,
  dream TEXT,
  future_school TEXT,
  future_message TEXT,
  favorite_quote TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  profile_status profile_status DEFAULT 'DRAFT',
  is_published BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to users table
ALTER TABLE users 
  ADD CONSTRAINT fk_users_student 
  FOREIGN KEY (student_id) 
  REFERENCES students(id) 
  ON DELETE SET NULL;

-- 7. Memories Table (Photo Gallery)
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  category VARCHAR(100) DEFAULT 'Classroom Moments',
  uploaded_by VARCHAR(100),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  event_date VARCHAR(50),
  approval_status approval_status DEFAULT 'APPROVED',
  is_featured BOOLEAN DEFAULT false,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Student Photos Table (Personal memories, max 5 per student)
CREATE TABLE IF NOT EXISTS student_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  approval_status approval_status DEFAULT 'APPROVED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Messages Table (Wall of Messages / Surat Perpisahan)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_name VARCHAR(150) NOT NULL,
  sender_class VARCHAR(50),
  recipient_type message_recipient DEFAULT 'FRIENDS',
  message_type VARCHAR(50) DEFAULT 'LETTER',
  title VARCHAR(200),
  message_content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  approval_status approval_status DEFAULT 'APPROVED',
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Quotes Table (Quote Wall)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  author_name VARCHAR(150) NOT NULL,
  author_class VARCHAR(50),
  quote_text TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Life',
  approval_status approval_status DEFAULT 'APPROVED',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'INFO',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(150),
  activity TEXT NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for fast lookup & search
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_slug ON students(slug);
CREATE INDEX idx_students_status ON students(profile_status, is_published);
CREATE INDEX idx_memories_category ON memories(category);
CREATE INDEX idx_memories_status ON memories(approval_status);
CREATE INDEX idx_messages_recipient ON messages(recipient_type);
CREATE INDEX idx_quotes_category ON quotes(category);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Public can view published students
CREATE POLICY "Public students are viewable by everyone" 
  ON students FOR SELECT 
  USING (is_published = true AND profile_status = 'APPROVED');

-- Public can view approved memories
CREATE POLICY "Approved memories are viewable by everyone" 
  ON memories FOR SELECT 
  USING (approval_status = 'APPROVED');

-- Public can view approved messages
CREATE POLICY "Approved messages are viewable by everyone" 
  ON messages FOR SELECT 
  USING (approval_status = 'APPROVED');

-- Public can view approved quotes
CREATE POLICY "Approved quotes are viewable by everyone" 
  ON quotes FOR SELECT 
  USING (approval_status = 'APPROVED');

-- =========================================================================
-- STORAGE BUCKETS CONFIGURATION (Supabase Storage)
-- =========================================================================
-- 1. avatars: Profile photos (public read)
-- 2. memories: Gallery photos (public read)
-- 3. classes: Class group photos (public read)
-- 4. teachers: Teacher photos (public read)
