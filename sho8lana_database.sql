-- ════════════════════════════════════════════
--  SHO8LANA DATABASE SCHEMA
--  Paste this into MySQL Workbench → Query tab
--  Then press Ctrl+Shift+Enter to run all
-- ════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS sho8lana CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sho8lana;

-- ── Companies ──────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    name_ar     VARCHAR(150),
    logo_emoji  VARCHAR(10),
    industry    VARCHAR(80),
    city        VARCHAR(80),
    size        VARCHAR(30),
    rating      DECIMAL(2,1)    DEFAULT 0.0,
    description TEXT,
    desc_ar     TEXT,
    website     VARCHAR(255),
    is_verified TINYINT(1)      DEFAULT 0,
    is_premium  TINYINT(1)      DEFAULT 0,
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP
);

-- ── Internship Listings ─────────────────────
CREATE TABLE IF NOT EXISTS internships (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    company_id    INT            NOT NULL,
    title         VARCHAR(200)   NOT NULL,
    title_ar      VARCHAR(200),
    description   TEXT,
    desc_ar       TEXT,
    city          VARCHAR(80),
    industry      VARCHAR(80),
    stipend       VARCHAR(60),
    duration      VARCHAR(60),
    skills        VARCHAR(500),   -- comma-separated
    requirements  TEXT,
    req_ar        TEXT,
    source        ENUM('linkedin','wuzzuf','company','other') DEFAULT 'company',
    is_featured   TINYINT(1)     DEFAULT 0,
    applicants    INT            DEFAULT 0,
    posted_at     DATETIME       DEFAULT CURRENT_TIMESTAMP,
    expires_at    DATETIME,
    is_active     TINYINT(1)     DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ── Students (Users) ────────────────────────
CREATE TABLE IF NOT EXISTS students (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(150)   NOT NULL,
    email         VARCHAR(200)   UNIQUE NOT NULL,
    phone         VARCHAR(20),
    password_hash VARCHAR(255),   -- bcrypt hash
    university    VARCHAR(200),
    major         VARCHAR(150),
    gpa           DECIMAL(3,2),
    grad_year     YEAR,
    city          VARCHAR(80)    DEFAULT 'Cairo',
    is_active     TINYINT(1)     DEFAULT 1,
    lang_pref     ENUM('en','ar') DEFAULT 'en',
    created_at    DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Student Documents ────────────────────────
CREATE TABLE IF NOT EXISTS student_documents (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT            NOT NULL,
    doc_type    ENUM('cv','transcript','nationalId','photo','certificates','coverLetter') NOT NULL,
    file_name   VARCHAR(255),
    file_path   VARCHAR(500),   -- path to stored file
    uploaded_at DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doc (student_id, doc_type)
);

-- ── Applications ────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT            NOT NULL,
    internship_id   INT            NOT NULL,
    status          ENUM('applied','reviewing','interview','offer','rejected') DEFAULT 'applied',
    cover_letter    TEXT,          -- AI-generated or custom
    ai_match_score  INT,           -- 0-100
    applied_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)    REFERENCES students(id)    ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    UNIQUE KEY unique_app (student_id, internship_id)
);

-- ── Simulation Tracks ───────────────────────
CREATE TABLE IF NOT EXISTS sim_tracks (
    id          VARCHAR(30)    PRIMARY KEY,
    label       VARCHAR(100)   NOT NULL,
    label_ar    VARCHAR(100),
    description TEXT,
    desc_ar     TEXT,
    color       VARCHAR(10),
    created_at  DATETIME       DEFAULT CURRENT_TIMESTAMP
);

-- ── Simulation Tasks ────────────────────────
CREATE TABLE IF NOT EXISTS sim_tasks (
    id          VARCHAR(30)    PRIMARY KEY,
    track_id    VARCHAR(30)    NOT NULL,
    title       VARCHAR(200)   NOT NULL,
    title_ar    VARCHAR(200),
    scenario    TEXT,
    scenario_ar TEXT,
    xp_reward   INT            DEFAULT 100,
    badge       VARCHAR(100),
    badge_ar    VARCHAR(100),
    est_minutes INT            DEFAULT 30,
    step_count  INT            DEFAULT 3,
    created_at  DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_id) REFERENCES sim_tracks(id) ON DELETE CASCADE
);

-- ── Student Simulation Progress ─────────────
CREATE TABLE IF NOT EXISTS sim_progress (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT            NOT NULL,
    task_id         VARCHAR(30)    NOT NULL,
    track_id        VARCHAR(30)    NOT NULL,
    answers         JSON,          -- stored as JSON array of step answers
    ai_feedback     TEXT,
    ai_feedback_ar  TEXT,
    xp_earned       INT            DEFAULT 0,
    badge_earned    VARCHAR(100),
    completed_at    DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_progress (student_id, task_id)
);

-- ── AI Interaction Logs ─────────────────────
CREATE TABLE IF NOT EXISTS ai_logs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT,
    type        ENUM('cover_letter','match_score','chat','sim_feedback') NOT NULL,
    prompt_len  INT,
    response_len INT,
    model_used  VARCHAR(60)    DEFAULT 'claude-sonnet-4-20250514',
    tokens_used INT,
    created_at  DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

-- ══════════════════════════════════════════════
--  SEED DATA — Real Egyptian Companies
-- ══════════════════════════════════════════════
INSERT INTO companies (name, name_ar, logo_emoji, industry, city, size, rating, description, desc_ar, is_verified) VALUES
('Vodafone Egypt',   'فودافون مصر',      '🔴', 'Telecom',          'Smart Village', '5000+', 4.3, 'Leading telecom provider with 40M+ subscribers.', 'مزود اتصالات رائد مع أكثر من 40 مليون مشترك.', 1),
('CIB Egypt',        'بنك CIB مصر',      '🏦', 'Banking',          'New Cairo',     '8000+', 4.5, "Egypt's leading private-sector bank.", 'أكبر بنك خاص في مصر.', 1),
('P&G Egypt',        'بروكتر وغامبل',    '🧴', 'FMCG',             '6th October',   '3000+', 4.6, 'Global consumer goods leader since 1986.', 'رائد عالمي في السلع الاستهلاكية منذ 1986.', 1),
('Microsoft Egypt',  'مايكروسوفت مصر',   '💻', 'Technology',       'Smart Village', '500+',  4.7, 'Tech giant empowering Egyptian businesses.', 'عملاق التكنولوجيا يدعم الأعمال المصرية.', 1),
('McKinsey Cairo',   'ماكنزي القاهرة',   '📊', 'Consulting',       'New Cairo',     '200+',  4.8, 'Top-tier management consulting firm.', 'شركة استشارات إدارية من الدرجة الأولى.', 1),
('Fawry',            'فوري',             '💳', 'Technology',       'Maadi',         '1500+', 4.1, "Egypt's leading fintech platform.", 'منصة التكنولوجيا المالية الرائدة في مصر.', 1),
('Orange Egypt',     'أورانج مصر',       '🟠', 'Telecom',          'Smart Village', '6000+', 4.1, 'Telecom innovator serving 30M+ subscribers.', 'مبتكر اتصالات يخدم 30 مليون مشترك.', 1),
('Nestlé Egypt',     'نستله مصر',        '☕', 'FMCG',             '6th October',   '4000+', 4.2, 'World largest food company in Egypt.', 'أكبر شركة أغذية في العالم بمصر.', 1);

-- ── Seed: Simulation Tracks ─────────────────
INSERT INTO sim_tracks (id, label, label_ar, description, desc_ar, color) VALUES
('marketing',  'Marketing',             'التسويق',         'Run campaigns, analyze metrics, build brand strategies',      'أدِر الحملات، حلّل البيانات، ابنِ الاستراتيجيات', '#E8464E'),
('finance',    'Finance & Banking',     'المالية والمصرفية','Budget analysis, financial modeling, banking operations',     'تحليل الميزانيات، النمذجة المالية، العمليات المصرفية', '#3B82F6'),
('operations', 'Operations & Logistics','العمليات واللوجستيات','Process improvement, supply chain, bottlenecks',         'تحسين العمليات، سلاسل الإمداد', '#10B981'),
('bizdev',     'Business Development',  'تطوير الأعمال',   'Research markets, pitch ideas, build partnerships',           'ابحث، قدّم الأفكار، ابنِ الشراكات', '#8B5CF6');

-- ── Seed: Simulation Tasks ──────────────────
INSERT INTO sim_tasks (id, track_id, title, title_ar, xp_reward, badge, badge_ar, est_minutes, step_count) VALUES
('m1', 'marketing',  'Social Media Campaign Brief',     'موجز حملة وسائل التواصل',    120, 'Campaign Strategist', 'استراتيجي حملات', 45, 5),
('m2', 'marketing',  'Competitor Analysis Report',      'تقرير تحليل المنافسين',       100, 'Market Analyst',      'محلل أسواق',       35, 4),
('f1', 'finance',    'Monthly Budget Variance Analysis','تحليل انحراف الميزانية',       130, 'Budget Analyst',      'محلل ميزانيات',    40, 5),
('o1', 'operations', 'Warehouse Process Improvement',  'تحسين عمليات المستودع',        110, 'Process Optimizer',   'محسّن عمليات',     35, 4),
('b1', 'bizdev',     'University Partnership Proposal', 'اقتراح شراكة مع جامعة',       140, 'Deal Maker',          'صانع صفقات',       50, 5);

-- ════════════════════════════════════════════
--  USEFUL QUERIES — Run these to manage data
-- ════════════════════════════════════════════

-- View all internships with company name:
-- SELECT i.title, c.name, i.city, i.stipend, i.is_featured
-- FROM internships i JOIN companies c ON i.company_id = c.id ORDER BY i.posted_at DESC;

-- View all applications with student and internship:
-- SELECT s.full_name, s.university, i.title, c.name, a.status, a.applied_at
-- FROM applications a
-- JOIN students s ON a.student_id = s.id
-- JOIN internships i ON a.internship_id = i.id
-- JOIN companies c ON i.company_id = c.id
-- ORDER BY a.applied_at DESC;

-- Top students by XP:
-- SELECT s.full_name, s.university, SUM(sp.xp_earned) as total_xp, COUNT(sp.id) as tasks_done
-- FROM sim_progress sp JOIN students s ON sp.student_id = s.id
-- GROUP BY s.id ORDER BY total_xp DESC LIMIT 20;

-- Application funnel stats:
-- SELECT status, COUNT(*) as count FROM applications GROUP BY status;

-- Add a new internship (example):
-- INSERT INTO internships (company_id, title, title_ar, description, city, stipend, skills, source, is_featured)
-- VALUES (1, 'Data Analyst Intern', 'متدرب تحليل بيانات',
--         'Join our analytics team...', 'Smart Village', 'EGP 5,500/mo',
--         'SQL,Python,Tableau', 'linkedin', 1);
