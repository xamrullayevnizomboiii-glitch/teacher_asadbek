-- ============================================
-- Supabase SQL Editor ga bu kodni joylashtiring
-- ============================================

-- Foydalanuvchilar jadvali
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'moderator',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kurslar jadvali
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  schedule TEXT,
  students_count INTEGER DEFAULT 0,
  type TEXT CHECK (type IN ('online', 'offline', 'both')) DEFAULT 'both',
  description TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yozilishlar jadvali
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  source_page TEXT DEFAULT 'landing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sharhlar jadvali
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  course TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
  comment TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Statistika jadvali
CREATE TABLE IF NOT EXISTS site_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE DEFAULT CURRENT_DATE,
  visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  enrollments_count INTEGER DEFAULT 0,
  most_visited_page TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sozlamalar jadvali
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Dastlabki ma'lumotlar
-- ============================================

INSERT INTO courses (name, price, schedule, students_count, type, description, is_popular, is_active) VALUES
('Grammatika Guruhi', 250000, 'Juft kunlari 14:00-16:00', 80, 'both', 'Ingliz tilining poydevori', false, true),
('CEFR Guruhi', 300000, 'Har kuni 16:00-18:00', 45, 'both', 'CEFR darajasiga yo\'naltirilgan', true, true)
ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value) VALUES
('teacher_name', 'Asadbek Arakulov'),
('phone', '+998 99 528 27 28'),
('telegram', '@Multilevel_instructor1'),
('instagram', 'teacher_arakulov'),
('site_name', 'Asadbek Arakulov'),
('grammar_price', '250000'),
('cefr_price', '300000'),
('grammar_schedule', 'Juft kunlari 14:00-16:00'),
('cefr_schedule', 'Har kuni 16:00-18:00'),
('address', 'Jizzax viloyati, Forish tumani'),
('years_experience', '6'),
('students_count', '500+')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Row Level Security (RLS) sozlamalari
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Kurslar: hamma o'qiy oladi, faqat adminlar yoza oladi
CREATE POLICY "courses_public_read" ON courses FOR SELECT USING (true);
CREATE POLICY "courses_admin_write" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

-- Sharhlar: tasdiqlanganlari hamma uchun
CREATE POLICY "reviews_approved_read" ON reviews FOR SELECT USING (is_approved = true OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()));
CREATE POLICY "reviews_admin_write" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
);

-- Yozilishlar: faqat autentifikatsiyalangan foydalanuvchilar
CREATE POLICY "enrollments_auth_only" ON enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
);
-- Landing page dan yozilish uchun (anon insert)
CREATE POLICY "enrollments_anon_insert" ON enrollments FOR INSERT WITH CHECK (true);

-- Sozlamalar: o'qish hamma, yozish admin
CREATE POLICY "settings_public_read" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

-- Users: faqat o'zini o'qiy oladi, super_admin hammasini
CREATE POLICY "users_self_read" ON users FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "users_self_update" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_admin_manage" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- ============================================
-- Yangi foydalanuvchi yaratilganda avtomatik profil
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
