-- ─────────────────────────────────────────────────────────────────────────────
-- Sho8lana — Schema migrations + full seed
-- Run this once in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (uses ON CONFLICT DO NOTHING / DO UPDATE)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Schema additions ───────────────────────────────────────────────────────

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS local_id   integer UNIQUE,
  ADD COLUMN IF NOT EXISTS owner_id   uuid    REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS industry   text,
  ADD COLUMN IF NOT EXISTS location   text,
  ADD COLUMN IF NOT EXISTS website    text,
  ADD COLUMN IF NOT EXISTS logo_emoji text;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS local_id   integer UNIQUE,
  ADD COLUMN IF NOT EXISTS salary     text,
  ADD COLUMN IF NOT EXISTS source     text    DEFAULT 'company',
  ADD COLUMN IF NOT EXISTS industry   text,
  ADD COLUMN IF NOT EXISTS deadline   date,
  ADD COLUMN IF NOT EXISTS featured   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS title_ar   text,
  ADD COLUMN IF NOT EXISTS requirements text;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS saved_job_ids jsonb DEFAULT '[]';

-- ── 2. Seed companies ─────────────────────────────────────────────────────────
-- local_id matches the numeric id in lib/data.ts COMPANIES array

INSERT INTO companies (id, name, industry, location, logo_emoji, website, local_id) VALUES
  (gen_random_uuid(), 'Vodafone Egypt',               'Telecom',      'Smart Village',    '🔴', 'vodafone.com.eg',         1),
  (gen_random_uuid(), 'CIB Egypt',                    'Banking',      'New Cairo',        '🏦', 'cibeg.com',               2),
  (gen_random_uuid(), 'P&G Egypt',                    'FMCG',         '6th October',      '🧴', 'pg.com',                  3),
  (gen_random_uuid(), 'Microsoft Egypt',              'Technology',   'Smart Village',    '💻', 'microsoft.com/en-eg',     4),
  (gen_random_uuid(), 'McKinsey Cairo',               'Consulting',   'New Cairo',        '📊', 'mckinsey.com',            5),
  (gen_random_uuid(), 'Fawry',                        'Fintech',      'Maadi',            '💳', 'fawry.com',               6),
  (gen_random_uuid(), 'Orange Egypt',                 'Telecom',      'Smart Village',    '🟠', 'orange.eg',               7),
  (gen_random_uuid(), 'Nestlé Egypt',                 'FMCG',         '6th October',      '☕', 'nestle-eg.com',           8),
  (gen_random_uuid(), 'Unilever Egypt',               'FMCG',         '6th October',      '🌿', 'unilever.com.eg',         9),
  (gen_random_uuid(), 'EFG Hermes',                   'Finance',      'New Cairo',        '📈', 'efghermes.com',          10),
  (gen_random_uuid(), 'Amazon Egypt',                 'E-Commerce',   'New Capital',      '📦', 'amazon.eg',              11),
  (gen_random_uuid(), 'IBM Egypt',                    'Technology',   'New Cairo',        '🔷', 'ibm.com/eg',             12),
  (gen_random_uuid(), 'Bupa Egypt (GlobeMed)',        'Healthcare',   'Heliopolis',       '🏥', 'bupaegypt.com',          13),
  (gen_random_uuid(), 'Coca-Cola Egypt',              'FMCG',         'Maadi',            '🥤', 'coca-colaegypt.com',     14),
  (gen_random_uuid(), 'Deloitte Egypt',               'Consulting',   'New Cairo',        '🟢', 'deloitte.com/eg',        15),
  (gen_random_uuid(), 'PwC Egypt',                    'Consulting',   'Maadi',            '🔴', 'pwc.com/eg',             16),
  (gen_random_uuid(), 'Egyptian Media Production City','Media',       '6th October',      '📺', 'empc-eg.com',            17),
  (gen_random_uuid(), 'Majid Al Futtaim Egypt',       'Retail',       'New Cairo',        '🛍️', 'majidalfuttaim.com',    18),
  (gen_random_uuid(), 'Careem Egypt',                 'Technology',   'Nasr City',        '🚗', 'careem.com',             19),
  (gen_random_uuid(), 'Valeo Egypt',                  'Automotive',   'New Capital',      '⚙️', 'valeo.com',             20),
  (gen_random_uuid(), 'Mentor Graphics Egypt',        'Technology',   'Smart Village',    '🖥️', 'mentor.com',            21),
  (gen_random_uuid(), 'NBE (National Bank of Egypt)', 'Banking',      'Downtown Cairo',   '🏛️', 'nbe.com.eg',            22),
  (gen_random_uuid(), 'Banque Misr',                  'Banking',      'Downtown Cairo',   '🏦', 'banquemisr.com',         23),
  (gen_random_uuid(), 'Breadfast',                    'E-Commerce',   'Heliopolis',       '🍞', 'breadfast.com',          24),
  (gen_random_uuid(), 'Paymob',                       'Fintech',      'Maadi',            '📲', 'paymob.com',             25)
ON CONFLICT (local_id) DO UPDATE SET
  name        = EXCLUDED.name,
  industry    = EXCLUDED.industry,
  location    = EXCLUDED.location,
  logo_emoji  = EXCLUDED.logo_emoji,
  website     = EXCLUDED.website;

-- ── 3. Seed jobs ──────────────────────────────────────────────────────────────
-- Each INSERT looks up company_id via the local_id we just upserted above.
-- local_id matches the numeric id in lib/data.ts JOBS array.

INSERT INTO jobs (id, company_id, title, title_ar, location, type, salary, source, industry, description, requirements, featured, local_id, created_at) VALUES

-- Vodafone Egypt (company local_id=1)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=1),
 'Marketing Intern','متدرب تسويق','Smart Village','internship','EGP 5,000/mo','linkedin','Telecom',
 'Join Vodafone''s marketing team and work on real campaigns reaching millions of Egyptian subscribers.',
 'Marketing or Business student; Strong English skills; Basic analytics knowledge',
 true, 1, now() - interval '2 days'),

-- CIB Egypt (company local_id=2)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=2),
 'Financial Analyst Intern','متدرب محلل مالي','New Cairo','internship','EGP 6,000/mo','company','Banking',
 'Work alongside CIB''s finance team analyzing real portfolios and building financial models.',
 'Finance or Accounting major; Advanced Excel; GPA 3.0+',
 true, 2, now() - interval '1 day'),

-- Microsoft Egypt (company local_id=4)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=4),
 'Software Engineering Intern','متدرب هندسة برمجيات','Smart Village','internship','EGP 8,000/mo','linkedin','Technology',
 'Build real features used by millions at Microsoft Egypt. Work with cutting-edge cloud and AI technologies.',
 'CS or Engineering major; Python/JS proficiency; Problem-solving skills',
 true, 3, now() - interval '5 hours'),

-- McKinsey Cairo (company local_id=5)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=5),
 'Business Analyst Intern','متدرب محلل أعمال','New Cairo','internship','EGP 10,000/mo','linkedin','Consulting',
 'Work on real client engagements at McKinsey. Analyze complex business problems.',
 'Top university student; GPA 3.5+; Exceptional analytical skills',
 true, 4, now() - interval '12 hours'),

-- P&G Egypt (company local_id=3)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=3),
 'Supply Chain Intern','متدرب سلسلة إمداد','6th October','internship','EGP 4,500/mo','wuzzuf','FMCG',
 'Support P&G''s supply chain operations across Egypt.',
 'Business or Engineering student; Analytical mindset',
 false, 5, now() - interval '3 days'),

-- Fawry (company local_id=6)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=6),
 'Product Management Intern','متدرب إدارة منتجات','Maadi','internship','EGP 6,000/mo','wuzzuf','Fintech',
 'Shape Egypt''s leading fintech platform at Fawry.',
 'Business or CS student; User-centric mindset',
 false, 6, now() - interval '2 days'),

-- Orange Egypt (company local_id=7)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=7),
 'Data Analytics Intern','متدرب تحليل بيانات','Smart Village','internship','EGP 5,500/mo','company','Telecom',
 'Analyze customer data patterns for Orange Egypt. Build dashboards.',
 'Data Science or CS; SQL proficiency',
 false, 7, now() - interval '4 days'),

-- Nestlé Egypt (company local_id=8)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=8),
 'Brand Management Intern','متدرب إدارة العلامة','6th October','internship','EGP 4,000/mo','wuzzuf','FMCG',
 'Assist Nestlé''s brand team with market research and campaign analytics.',
 'Marketing major; Creative thinker',
 false, 8, now() - interval '7 days'),

-- Unilever Egypt (company local_id=9)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=9),
 'HR Operations Intern','متدرب عمليات الموارد البشرية','6th October','internship','EGP 4,500/mo','company','FMCG',
 'Support Unilever Egypt''s HR team with recruitment, onboarding, and employee engagement programs.',
 'HR or Business student; Strong communication; Excel skills',
 false, 9, now() - interval '3 days'),

((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=9),
 'Sales & Distribution Intern','متدرب مبيعات وتوزيع','6th October','internship','EGP 4,000/mo','wuzzuf','FMCG',
 'Learn real sales operations, distributor management, and territory planning at Unilever.',
 'Business or Marketing student; Willingness to be field-based',
 false, 10, now() - interval '5 days'),

-- EFG Hermes (company local_id=10)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=10),
 'Investment Banking Intern','متدرب بنك استثماري','New Cairo','internship','EGP 8,000/mo','linkedin','Finance',
 'Join EFG Hermes investment banking team. Work on real M&A and capital markets transactions.',
 'Finance or Economics major; Financial modeling skills; GPA 3.3+',
 true, 11, now() - interval '6 hours'),

((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=10),
 'Equity Research Intern','متدرب بحوث الأسهم','New Cairo','internship','EGP 7,000/mo','company','Finance',
 'Research Egyptian and MENA listed companies for EFG Hermes research division.',
 'Finance/Economics student; Bloomberg familiarity a plus',
 false, 12, now() - interval '2 days'),

-- Amazon Egypt (company local_id=11)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=11),
 'Operations Excellence Intern','متدرب تحسين العمليات','New Capital','internship','EGP 6,500/mo','linkedin','E-Commerce',
 'Improve fulfillment center operations at Amazon Egypt. Apply Lean and Six Sigma principles.',
 'Engineering or Operations student; Analytical skills; Data-driven mindset',
 true, 13, now() - interval '1 day'),

((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=11),
 'E-Commerce Category Intern','متدرب فئة تجارة إلكترونية','New Capital','internship','EGP 5,500/mo','company','E-Commerce',
 'Manage a product category at Amazon Egypt. Work with vendors and optimize listings.',
 'Business student; Detail-oriented; Basic Excel',
 false, 14, now() - interval '3 days'),

-- IBM Egypt (company local_id=12)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=12),
 'Cloud Solutions Intern','متدرب حلول السحابة','New Cairo','internship','EGP 7,000/mo','linkedin','Technology',
 'Work on IBM Cloud deployments and enterprise client implementations across Egypt.',
 'CS or IT student; Cloud basics; Python familiarity',
 false, 15, now() - interval '2 days'),

-- Coca-Cola Egypt (company local_id=14)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=14),
 'Commercial Operations Intern','متدرب العمليات التجارية','Maadi','internship','EGP 5,000/mo','wuzzuf','FMCG',
 'Learn Coca-Cola Egypt''s go-to-market strategy and distributor ecosystem firsthand.',
 'Business student; Enthusiastic about FMCG; Driver''s license a plus',
 false, 16, now() - interval '4 days'),

-- Deloitte Egypt (company local_id=15)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=15),
 'Audit & Assurance Intern','متدرب تدقيق وتأكيد','New Cairo','internship','EGP 5,500/mo','linkedin','Consulting',
 'Gain hands-on audit experience at Deloitte Egypt, working on Big Four-quality engagements.',
 'Accounting or Finance major; GPA 3.0+; Attention to detail',
 true, 17, now() - interval '1 day'),

((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=15),
 'Management Consulting Intern','متدرب استشارات إدارية','New Cairo','internship','EGP 7,000/mo','company','Consulting',
 'Work on strategy and transformation projects for top Egyptian and multinational clients.',
 'Business/Engineering student; GPA 3.5+; Structured thinking',
 true, 18, now() - interval '3 days'),

-- PwC Egypt (company local_id=16)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=16),
 'Tax Advisory Intern','متدرب الاستشارات الضريبية','Maadi','internship','EGP 5,000/mo','company','Consulting',
 'Join PwC Egypt''s tax team. Learn Egyptian tax law and advise real business clients.',
 'Accounting/Law/Finance student; Analytical; Strong Arabic & English',
 false, 19, now() - interval '5 days'),

-- Majid Al Futtaim (company local_id=18)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=18),
 'Retail Operations Intern','متدرب عمليات التجزئة','New Cairo','internship','EGP 4,500/mo','wuzzuf','Retail',
 'Work inside Mall of Egypt or City Centre, learning retail operations from the ground up.',
 'Business student; Customer-first mindset; Presentable',
 false, 20, now() - interval '7 days'),

-- Careem Egypt (company local_id=19)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=19),
 'Growth & Marketing Intern','متدرب النمو والتسويق','Nasr City','internship','EGP 5,000/mo','linkedin','Technology',
 'Run growth experiments at Careem Egypt. A/B test campaigns and analyze driver/captain acquisition.',
 'Marketing/Business student; Data curiosity; Growth mindset',
 false, 21, now() - interval '2 days'),

-- Valeo Egypt (company local_id=20)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=20),
 'Embedded Systems Intern','متدرب أنظمة مدمجة','New Capital','internship','EGP 7,000/mo','company','Automotive',
 'Work on cutting-edge automotive embedded systems at Valeo''s Egypt R&D center.',
 'Electronics or CS student; C/C++ proficiency; RTOS knowledge a plus',
 true, 22, now() - interval '3 days'),

-- Paymob (company local_id=25)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=25),
 'Merchant Success Intern','متدرب نجاح التجار','Maadi','internship','EGP 4,500/mo','wuzzuf','Fintech',
 'Help merchants integrate and succeed on Paymob''s payment gateway. Egypt''s hottest fintech startup.',
 'Business/CS student; Excellent communication; Problem-solver',
 false, 23, now() - interval '1 day'),

-- Breadfast (company local_id=24)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=24),
 'Operations Intern','متدرب عمليات','Heliopolis','internship','EGP 4,000/mo','company','E-Commerce',
 'Work at the heart of Breadfast operations — delivery routing, rider management, fulfilment.',
 'Any major; Detail-oriented; Morning person',
 false, 24, now() - interval '2 days'),

-- CIB Egypt full-time (company local_id=2)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=2),
 'Junior Corporate Banker','موظف مصرفي مؤسسي مبتدئ','New Cairo','full-time','EGP 12,000/mo','linkedin','Banking',
 'Join CIB corporate banking as a junior banker. Manage client portfolios and structure credit facilities.',
 'Finance/Accounting grad; 1 year experience or strong internship; CFA Level 1 a plus',
 true, 25, now() - interval '1 day'),

-- Microsoft Egypt full-time (company local_id=4)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=4),
 'Junior Software Engineer','مهندس برمجيات مبتدئ','Smart Village','full-time','EGP 18,000/mo','linkedin','Technology',
 'Build Microsoft products used by millions of Egyptians. Mentorship from senior engineers.',
 'CS degree or equivalent; JavaScript/TypeScript proficiency; Problem-solving skills',
 true, 26, now() - interval '6 hours'),

-- McKinsey Cairo full-time (company local_id=5)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=5),
 'Associate Consultant','مستشار مشارك','New Cairo','full-time','EGP 22,000/mo','linkedin','Consulting',
 'McKinsey Cairo''s 2026 Associate Consultant class. Shape Egypt''s largest organizations.',
 'Top-university grad (any field); GPA 3.7+; Exceptional problem-solving',
 true, 27, now() - interval '2 days'),

-- Deloitte Egypt full-time (company local_id=15)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=15),
 'Junior Auditor','مدقق مبتدئ','New Cairo','full-time','EGP 9,000/mo','company','Consulting',
 'Start your Big Four career at Deloitte Egypt''s audit practice.',
 'Accounting grad; ACCA/CPA pursuing a plus; Attention to detail',
 false, 28, now() - interval '3 days'),

-- Fawry full-time (company local_id=6)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=6),
 'Junior Product Manager','مدير منتجات مبتدئ','Maadi','full-time','EGP 14,000/mo','wuzzuf','Fintech',
 'Own a product area at Fawry. Define roadmaps, run sprints, and ship features to 40M+ users.',
 'CS or Business grad; 1 year PM or tech experience; Data-driven decision maker',
 false, 29, now() - interval '1 day'),

-- Paymob full-time (company local_id=25)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=25),
 'Sales Account Executive','مدير حسابات مبيعات','Maadi','full-time','EGP 10,000/mo','company','Fintech',
 'Sell Paymob''s payment solutions to Egyptian merchants and e-commerce businesses.',
 'Business grad; Strong communication; Results-driven personality',
 false, 30, now() - interval '5 days'),

-- Mentor Graphics Egypt (company local_id=21)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=21),
 'VLSI Design Intern','متدرب تصميم VLSI','Smart Village','internship','EGP 8,000/mo','company','Technology',
 'Work on chip design at Siemens EDA (formerly Mentor Graphics) Egypt, one of the best R&D centers in MENA.',
 'Electronics/CS student; Digital design knowledge; VHDL or Verilog',
 false, 31, now() - interval '2 days'),

-- NBE (company local_id=22)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=22),
 'Retail Banking Intern','متدرب مصرفية التجزئة','Downtown Cairo','internship','EGP 3,500/mo','company','Banking',
 'Rotate through NBE''s retail banking branches and learn banking operations from Egypt''s oldest bank.',
 'Any finance/business student; Customer-oriented; Professional appearance',
 false, 32, now() - interval '7 days'),

-- Bupa Egypt (company local_id=13)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=13),
 'Healthcare Operations Intern','متدرب عمليات رعاية صحية','Heliopolis','internship','EGP 4,000/mo','wuzzuf','Healthcare',
 'Work inside a leading health insurance company. Learn claims processing, provider networks, and operations.',
 'Healthcare management or Business student; Organized; Detail-oriented',
 false, 33, now() - interval '4 days'),

-- EMPC (company local_id=17)
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=17),
 'Media Production Intern','متدرب إنتاج إعلامي','6th October','internship','EGP 3,000/mo','company','Media',
 'Work at EMPC — the largest media city in the Middle East. Support production teams on real TV/film projects.',
 'Media/Film student; Adobe Creative Suite; Portfolio preferred',
 false, 34, now() - interval '6 days'),

-- Vodafone Egypt (company local_id=1) — second job
((SELECT gen_random_uuid()), (SELECT id FROM companies WHERE local_id=1),
 'Corporate Communications Intern','متدرب اتصالات مؤسسية','Smart Village','internship','EGP 4,500/mo','linkedin','Telecom',
 'Shape Vodafone Egypt''s corporate narrative. Write press releases, manage media relations.',
 'Communications or Journalism student; Excellent English; Strong writing skills',
 false, 35, now() - interval '3 days')

ON CONFLICT (local_id) DO UPDATE SET
  title       = EXCLUDED.title,
  salary      = EXCLUDED.salary,
  source      = EXCLUDED.source,
  featured    = EXCLUDED.featured;

-- ── 4. Row-level security hint ────────────────────────────────────────────────
-- Allow anyone to read companies and jobs (public job board):
-- ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read" ON companies FOR SELECT USING (true);
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read" ON jobs FOR SELECT USING (true);
-- Only the company owner can insert/update their jobs:
-- CREATE POLICY "Owner write" ON jobs FOR ALL USING (
--   company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
-- );
