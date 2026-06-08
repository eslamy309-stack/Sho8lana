import type { Company, Job, Document, SimTrack, Tutorial } from './types'

export const GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'New Capital', '6th October',
  'Smart Village', 'Maadi', 'Heliopolis', 'New Cairo',
  'Sheikh Zayed', 'Nasr City', 'Mansoura', 'Zamalek', 'Downtown Cairo',
  'Fifth Settlement', 'October City',
]

export const SOURCE_CONFIG = {
  linkedin: { label: 'LinkedIn',  color: '#0077B5' },
  wuzzuf:   { label: 'Wuzzuf',    color: '#E8464E' },
  company:  { label: 'Direct',    color: '#0D9488' },
}

export const COMPANIES: Company[] = [
  { id: 1,  name: 'Vodafone Egypt',        logo: '🔴', industry: 'Telecom',      location: 'Smart Village',    rating: 4.3, color: '#E60000', description: 'Leading telecom provider with 40M+ subscribers in Egypt.', descriptionAr: 'مزود اتصالات رائد مع أكثر من 40 مليون مشترك.', coords: { lat: 30.0712, lng: 31.0191 }, website: 'vodafone.com.eg', employees: '7,000+', founded: '1998' },
  { id: 2,  name: 'CIB Egypt',             logo: '🏦', industry: 'Banking',      location: 'New Cairo',        rating: 4.5, color: '#003B71', description: "Egypt's leading private-sector bank.", descriptionAr: 'أكبر بنك خاص في مصر.', coords: { lat: 30.0211, lng: 31.4806 }, website: 'cibeg.com', employees: '9,000+', founded: '1975' },
  { id: 3,  name: 'P&G Egypt',             logo: '🧴', industry: 'FMCG',         location: '6th October',      rating: 4.6, color: '#003DA5', description: 'Global consumer goods leader since 1986 in Egypt.', descriptionAr: 'رائد عالمي في السلع الاستهلاكية منذ 1986.', coords: { lat: 29.9490, lng: 30.9300 }, website: 'pg.com', employees: '1,500+', founded: '1986' },
  { id: 4,  name: 'Microsoft Egypt',       logo: '💻', industry: 'Technology',   location: 'Smart Village',    rating: 4.7, color: '#00A4EF', description: 'Tech giant empowering Egyptian businesses and developers.', descriptionAr: 'عملاق التكنولوجيا يدعم الأعمال المصرية.', coords: { lat: 30.0712, lng: 31.0191 }, website: 'microsoft.com/en-eg', employees: '500+', founded: '1995' },
  { id: 5,  name: 'McKinsey Cairo',        logo: '📊', industry: 'Consulting',   location: 'New Cairo',        rating: 4.8, color: '#00205B', description: 'Top-tier management consulting firm.', descriptionAr: 'شركة استشارات إدارية من الدرجة الأولى.', coords: { lat: 30.0211, lng: 31.4806 }, website: 'mckinsey.com', employees: '200+', founded: '2000' },
  { id: 6,  name: 'Fawry',                logo: '💳', industry: 'Fintech',       location: 'Maadi',            rating: 4.1, color: '#F7941D', description: "Egypt's leading fintech and e-payment platform.", descriptionAr: 'منصة التكنولوجيا المالية والدفع الإلكتروني الرائدة في مصر.', coords: { lat: 29.9602, lng: 31.2569 }, website: 'fawry.com', employees: '3,000+', founded: '2008' },
  { id: 7,  name: 'Orange Egypt',          logo: '🟠', industry: 'Telecom',      location: 'Smart Village',    rating: 4.1, color: '#FF6600', description: 'Telecom innovator serving 30M+ subscribers.', descriptionAr: 'مبتكر اتصالات يخدم أكثر من 30 مليون مشترك.', coords: { lat: 30.0712, lng: 31.0191 }, website: 'orange.eg', employees: '5,000+', founded: '1998' },
  { id: 8,  name: 'Nestlé Egypt',          logo: '☕', industry: 'FMCG',         location: '6th October',      rating: 4.2, color: '#7B5427', description: "World's largest food company with deep roots in Egypt.", descriptionAr: 'أكبر شركة أغذية في العالم بجذور عميقة في مصر.', coords: { lat: 29.9490, lng: 30.9300 }, website: 'nestle-eg.com', employees: '4,000+', founded: '1960' },
  { id: 9,  name: 'Unilever Egypt',        logo: '🌿', industry: 'FMCG',         location: '6th October',      rating: 4.3, color: '#1F36C7', description: 'Global household and personal care brands leader.', descriptionAr: 'قائد عالمي في منتجات الرعاية المنزلية والشخصية.', coords: { lat: 29.9490, lng: 30.9300 }, website: 'unilever.com.eg', employees: '2,500+', founded: '1979' },
  { id: 10, name: 'EFG Hermes',            logo: '📈', industry: 'Finance',      location: 'New Cairo',        rating: 4.4, color: '#C41E3A', description: "MENA's premier investment bank and financial services group.", descriptionAr: 'البنك الاستثماري الرائد في منطقة الشرق الأوسط وشمال أفريقيا.', coords: { lat: 30.0211, lng: 31.4806 }, website: 'efghermes.com', employees: '4,500+', founded: '1984' },
  { id: 11, name: 'Amazon Egypt',          logo: '📦', industry: 'E-Commerce',   location: 'New Capital',      rating: 4.5, color: '#FF9900', description: 'Global e-commerce giant operating in Egypt through Souq/Amazon.', descriptionAr: 'عملاق التجارة الإلكترونية العالمي يعمل في مصر عبر سوق/أمازون.', coords: { lat: 30.0146, lng: 31.7501 }, website: 'amazon.eg', employees: '3,000+', founded: '2017' },
  { id: 12, name: 'IBM Egypt',             logo: '🔷', industry: 'Technology',   location: 'New Cairo',        rating: 4.4, color: '#006699', description: 'Global technology and IT services leader in Egypt.', descriptionAr: 'رائد عالمي في تكنولوجيا المعلومات والخدمات في مصر.', coords: { lat: 30.0211, lng: 31.4806 }, website: 'ibm.com/eg', employees: '800+', founded: '1960' },
  { id: 13, name: 'Bupa Egypt (GlobeMed)',  logo: '🏥', industry: 'Healthcare',   location: 'Heliopolis',       rating: 4.0, color: '#00B2A9', description: 'Leading health insurance and medical services provider.', descriptionAr: 'مزود رائد لخدمات التأمين الصحي والرعاية الطبية.', coords: { lat: 30.0892, lng: 31.3381 }, website: 'bupaegypt.com', employees: '1,200+', founded: '2002' },
  { id: 14, name: 'Coca-Cola Egypt',       logo: '🥤', industry: 'FMCG',         location: 'Maadi',            rating: 4.4, color: '#E61B23', description: 'Iconic global beverage brand with strong Egypt presence since 1945.', descriptionAr: 'علامة المشروبات العالمية الأيقونية في مصر منذ 1945.', coords: { lat: 29.9602, lng: 31.2569 }, website: 'coca-colaegypt.com', employees: '3,000+', founded: '1945' },
  { id: 15, name: 'Deloitte Egypt',        logo: '🟢', industry: 'Consulting',   location: 'New Cairo',        rating: 4.6, color: '#86BC25', description: 'Big Four professional services: audit, consulting, tax, advisory.', descriptionAr: 'خدمات مهنية من الأربعة الكبار: التدقيق، الاستشارات، الضرائب.', coords: { lat: 30.0211, lng: 31.4806 }, website: 'deloitte.com/eg', employees: '1,000+', founded: '1995' },
  { id: 16, name: 'PwC Egypt',             logo: '🔴', industry: 'Consulting',   location: 'Maadi',            rating: 4.5, color: '#D04A02', description: "PricewaterhouseCoopers Egypt — one of the Big Four in assurance, consulting, and tax.", descriptionAr: 'برايس ووترهاوس كوبرز مصر — واحدة من الأربعة الكبار.', coords: { lat: 29.9602, lng: 31.2569 }, website: 'pwc.com/eg', employees: '1,500+', founded: '1936' },
  { id: 17, name: 'Egyptian Media Production City', logo: '📺', industry: 'Media', location: '6th October', rating: 3.9, color: '#8B0000', description: 'Largest integrated media production hub in the Middle East.', descriptionAr: 'أكبر مجمع إنتاج إعلامي متكامل في الشرق الأوسط.', coords: { lat: 29.9490, lng: 30.9300 }, website: 'empc-eg.com', employees: '10,000+', founded: '1997' },
  { id: 18, name: 'Majid Al Futtaim Egypt', logo: '🛍️', industry: 'Retail',     location: 'New Cairo',        rating: 4.2, color: '#7B1F8E', description: 'Operator of Mall of Egypt, City Centre Malls, and Carrefour Egypt.', descriptionAr: 'مشغّل مول مصر ومراكز سيتي سنتر وكارفور مصر.', coords: { lat: 30.0211, lng: 31.4806 }, website: 'majidalfuttaim.com', employees: '10,000+', founded: '2004' },
  { id: 19, name: 'Careem Egypt',          logo: '🚗', industry: 'Technology',   location: 'Nasr City',        rating: 4.0, color: '#3CB648', description: "MENA's leading mobility and delivery super-app.", descriptionAr: 'تطبيق التنقل والتوصيل الرائد في الشرق الأوسط.', coords: { lat: 30.0626, lng: 31.3417 }, website: 'careem.com', employees: '1,000+', founded: '2015' },
  { id: 20, name: 'Valeo Egypt',           logo: '⚙️', industry: 'Automotive',  location: 'New Capital',      rating: 4.3, color: '#00529B', description: 'French auto parts technology leader with large Egypt R&D center.', descriptionAr: 'قائد تقنيات قطع السيارات الفرنسي مع مركز بحث وتطوير ضخم في مصر.', coords: { lat: 30.0146, lng: 31.7501 }, website: 'valeo.com', employees: '5,000+', founded: '2002' },
  { id: 21, name: 'Mentor Graphics Egypt', logo: '🖥️', industry: 'Technology',  location: 'Smart Village',    rating: 4.5, color: '#1E90FF', description: 'EDA software pioneer (now Siemens EDA) with major Egypt R&D hub.', descriptionAr: 'رائد برمجيات التصميم الإلكتروني مع مركز بحث وتطوير كبير في مصر.', coords: { lat: 30.0712, lng: 31.0191 }, website: 'mentor.com', employees: '2,000+', founded: '1997' },
  { id: 22, name: 'NBE (National Bank of Egypt)', logo: '🏛️', industry: 'Banking', location: 'Downtown Cairo', rating: 4.1, color: '#003366', description: "Egypt's largest state-owned bank with 550+ branches nationwide.", descriptionAr: 'أكبر بنك مملوك للدولة في مصر مع أكثر من 550 فرعاً.', coords: { lat: 30.0444, lng: 31.2357 }, website: 'nbe.com.eg', employees: '25,000+', founded: '1898' },
  { id: 23, name: 'Banque Misr',           logo: '🏦', industry: 'Banking',      location: 'Downtown Cairo',   rating: 4.0, color: '#006633', description: "Egypt's second-largest bank, 100% state-owned, nationwide reach.", descriptionAr: 'ثاني أكبر بنك في مصر، مملوك للدولة بالكامل، تغطية وطنية.', coords: { lat: 30.0444, lng: 31.2357 }, website: 'banquemisr.com', employees: '20,000+', founded: '1920' },
  { id: 24, name: 'Breadfast',             logo: '🍞', industry: 'E-Commerce',   location: 'Heliopolis',       rating: 4.3, color: '#F5A623', description: "Egypt's fastest-growing grocery and essentials delivery startup.", descriptionAr: 'شركة توصيل البقالة والضروريات الأسرع نمواً في مصر.', coords: { lat: 30.0892, lng: 31.3381 }, website: 'breadfast.com', employees: '1,000+', founded: '2017' },
  { id: 25, name: 'Paymob',               logo: '📲', industry: 'Fintech',       location: 'Maadi',            rating: 4.4, color: '#7C3AED', description: "Egypt's leading payment gateway powering 150,000+ merchants.", descriptionAr: 'بوابة الدفع الرائدة في مصر تخدم أكثر من 150,000 تاجر.', coords: { lat: 29.9602, lng: 31.2569 }, website: 'paymob.com', employees: '500+', founded: '2015' },
]


/** Company ID → display initials (replaces emoji logos in UI) */
export const COMPANY_INITIALS: Record<number, string> = {
  1:  'VE',  2:  'CIB', 3:  'P&G', 4:  'MS',  5:  'MC',
  6:  'FW',  7:  'OE',  8:  'NE',  9:  'UE',  10: 'EFG',
  11: 'AE',  12: 'IBM', 13: 'BE',  14: 'CC',  15: 'DE',
  16: 'PwC', 17: 'EM',  18: 'MAF', 19: 'CR',  20: 'VL',
  21: 'MG',  22: 'NBE', 23: 'BM',  24: 'BF',  25: 'PM',
}


export const JOBS: Job[] = [
  // Vodafone Egypt
  { id: 1,  companyId: 1,  title: 'Marketing Intern',            titleAr: 'متدرب تسويق',              location: 'Smart Village',  salary: 'EGP 5,000/mo',  postedAgo: '2d',  applicants: 47,  skills: ['Social Media','Analytics','Content'],                type: 'internship', industry: 'Telecom',    description: "Join Vodafone's marketing team and work on real campaigns reaching millions of Egyptian subscribers.", descriptionAr: 'انضم لفريق التسويق في فودافون واعمل على حملات حقيقية تصل لملايين المشتركين.', requirements: ['Marketing or Business student','Strong English skills','Basic analytics knowledge'], requirementsAr: ['طالب تسويق أو أعمال','إنجليزي قوي','معرفة أساسية بالتحليلات'], featured: true,  source: 'linkedin', deadline: '2026-06-30' },
  { id: 2,  companyId: 2,  title: 'Financial Analyst Intern',    titleAr: 'متدرب محلل مالي',          location: 'New Cairo',      salary: 'EGP 6,000/mo',  postedAgo: '1d',  applicants: 32,  skills: ['Excel','Financial Modeling','Data Analysis'],       type: 'internship', industry: 'Banking',    description: "Work alongside CIB's finance team analyzing real portfolios and building financial models.", descriptionAr: 'اعمل مع فريق المالية في CIB لتحليل محافظ حقيقية وبناء نماذج مالية.', requirements: ['Finance or Accounting major','Advanced Excel','GPA 3.0+'], requirementsAr: ['تخصص مالية أو محاسبة','Excel متقدم','معدل 3.0+'], featured: true,  source: 'company', deadline: '2026-06-15' },
  { id: 3,  companyId: 4,  title: 'Software Engineering Intern', titleAr: 'متدرب هندسة برمجيات',     location: 'Smart Village',  salary: 'EGP 8,000/mo',  postedAgo: '5h',  applicants: 89,  skills: ['Python','React','Azure'],                            type: 'internship', industry: 'Technology', description: 'Build real features used by millions at Microsoft Egypt. Work with cutting-edge cloud and AI technologies.', descriptionAr: 'ابنِ ميزات حقيقية يستخدمها الملايين في مايكروسوفت مصر مع تقنيات السحاب والذكاء الاصطناعي.', requirements: ['CS or Engineering major','Python/JS proficiency','Problem-solving skills'], requirementsAr: ['حاسبات أو هندسة','Python/JS','حل المشكلات'], featured: true,  source: 'linkedin', deadline: '2026-05-31' },
  { id: 4,  companyId: 5,  title: 'Business Analyst Intern',     titleAr: 'متدرب محلل أعمال',        location: 'New Cairo',      salary: 'EGP 10,000/mo', postedAgo: '12h', applicants: 120, skills: ['Problem Solving','Excel','PowerPoint'],             type: 'internship', industry: 'Consulting', description: 'Work on real client engagements at McKinsey. Analyze complex business problems.', descriptionAr: 'اعمل على مشاريع عملاء حقيقية في ماكنزي. حلّل مشكلات الأعمال المعقدة.', requirements: ['Top university student','GPA 3.5+','Exceptional analytical skills'], requirementsAr: ['جامعة مرموقة','معدل 3.5+','مهارات تحليلية استثنائية'], featured: true,  source: 'linkedin', deadline: '2026-05-25' },
  { id: 5,  companyId: 3,  title: 'Supply Chain Intern',         titleAr: 'متدرب سلسلة إمداد',      location: '6th October',    salary: 'EGP 4,500/mo',  postedAgo: '3d',  applicants: 28,  skills: ['Logistics','SAP','Problem Solving'],                 type: 'internship', industry: 'FMCG',       description: "Support P&G's supply chain operations across Egypt.", descriptionAr: 'ادعم عمليات سلسلة الإمداد في P&G عبر مصر.', requirements: ['Business or Engineering student','Analytical mindset'], requirementsAr: ['طالب أعمال أو هندسة','تحليلي'], featured: false, source: 'wuzzuf' },
  { id: 6,  companyId: 6,  title: 'Product Management Intern',   titleAr: 'متدرب إدارة منتجات',     location: 'Maadi',          salary: 'EGP 6,000/mo',  postedAgo: '2d',  applicants: 37,  skills: ['Product Thinking','UX','Agile'],                     type: 'internship', industry: 'Fintech',    description: "Shape Egypt's leading fintech platform at Fawry.", descriptionAr: 'شكّل منصة التكنولوجيا المالية الرائدة في مصر مع فوري.', requirements: ['Business or CS student','User-centric mindset'], requirementsAr: ['أعمال أو حاسبات','تركيز على المستخدم'], featured: false, source: 'wuzzuf' },
  { id: 7,  companyId: 7,  title: 'Data Analytics Intern',       titleAr: 'متدرب تحليل بيانات',    location: 'Smart Village',  salary: 'EGP 5,500/mo',  postedAgo: '4d',  applicants: 41,  skills: ['SQL','Python','Tableau'],                            type: 'internship', industry: 'Telecom',    description: 'Analyze customer data patterns for Orange Egypt. Build dashboards.', descriptionAr: 'حلّل أنماط بيانات العملاء لأورانج مصر. ابنِ لوحات البيانات.', requirements: ['Data Science or CS','SQL proficiency'], requirementsAr: ['علم بيانات أو حاسبات','إجادة SQL'], featured: false, source: 'company' },
  { id: 8,  companyId: 8,  title: 'Brand Management Intern',     titleAr: 'متدرب إدارة العلامة',    location: '6th October',    salary: 'EGP 4,000/mo',  postedAgo: '1w',  applicants: 55,  skills: ['Brand Strategy','Market Research','Presentation'],  type: 'internship', industry: 'FMCG',       description: "Assist Nestlé's brand team with market research and campaign analytics.", descriptionAr: 'ساعد فريق العلامة التجارية في نستله بأبحاث السوق.', requirements: ['Marketing major','Creative thinker'], requirementsAr: ['تخصص تسويق','مفكر إبداعي'], featured: false, source: 'wuzzuf' },
  // Unilever Egypt
  { id: 9,  companyId: 9,  title: 'HR Operations Intern',        titleAr: 'متدرب عمليات الموارد البشرية', location: '6th October', salary: 'EGP 4,500/mo', postedAgo: '3d', applicants: 23, skills: ['HR','Communication','Excel'],                          type: 'internship', industry: 'FMCG',       description: "Support Unilever Egypt's HR team with recruitment, onboarding, and employee engagement programs.", descriptionAr: 'ادعم فريق الموارد البشرية في يونيليفر مصر بالتوظيف والتهيئة وبرامج إشراك الموظفين.', requirements: ['HR or Business student','Strong communication','Excel skills'], requirementsAr: ['طالب موارد بشرية أو أعمال','تواصل قوي','Excel'], featured: false, source: 'company', deadline: '2026-06-20' },
  { id: 10, companyId: 9,  title: 'Sales & Distribution Intern', titleAr: 'متدرب مبيعات وتوزيع',    location: '6th October',    salary: 'EGP 4,000/mo',  postedAgo: '5d',  applicants: 18,  skills: ['Sales','Negotiation','Route Planning'],             type: 'internship', industry: 'FMCG',       description: 'Learn real sales operations, distributor management, and territory planning at Unilever.', descriptionAr: 'تعلّم عمليات المبيعات الحقيقية وإدارة الموزعين في يونيليفر.', requirements: ['Business or Marketing student','Willingness to be field-based'], requirementsAr: ['طالب أعمال أو تسويق','استعداد للعمل الميداني'], featured: false, source: 'wuzzuf' },
  // EFG Hermes
  { id: 11, companyId: 10, title: 'Investment Banking Intern',   titleAr: 'متدرب بنك استثماري',     location: 'New Cairo',      salary: 'EGP 8,000/mo',  postedAgo: '6h',  applicants: 74,  skills: ['Financial Modeling','Valuation','PowerPoint'],      type: 'internship', industry: 'Finance',    description: 'Join EFG Hermes investment banking team. Work on real M&A and capital markets transactions.', descriptionAr: 'انضم لفريق الخدمات المصرفية الاستثمارية في EFG هيرمس. اعمل على صفقات حقيقية.', requirements: ['Finance or Economics major','Financial modeling skills','GPA 3.3+'], requirementsAr: ['مالية أو اقتصاد','نمذجة مالية','معدل 3.3+'], featured: true,  source: 'linkedin', deadline: '2026-06-01' },
  { id: 12, companyId: 10, title: 'Equity Research Intern',      titleAr: 'متدرب بحوث الأسهم',     location: 'New Cairo',      salary: 'EGP 7,000/mo',  postedAgo: '2d',  applicants: 42,  skills: ['Bloomberg','Financial Analysis','Report Writing'],  type: 'internship', industry: 'Finance',    description: 'Research Egyptian and MENA listed companies for EFG Hermes research division.', descriptionAr: 'ابحث الشركات المصرية والخليجية المدرجة لقسم الأبحاث في EFG هيرمس.', requirements: ['Finance/Economics student','Bloomberg familiarity a plus'], requirementsAr: ['طالب مالية أو اقتصاد','معرفة Bloomberg ميزة'], featured: false, source: 'company' },
  // Amazon Egypt
  { id: 13, companyId: 11, title: 'Operations Excellence Intern', titleAr: 'متدرب تحسين العمليات', location: 'New Capital',    salary: 'EGP 6,500/mo',  postedAgo: '1d',  applicants: 63,  skills: ['Lean','Data Analysis','Process Improvement'],       type: 'internship', industry: 'E-Commerce', description: 'Improve fulfillment center operations at Amazon Egypt. Apply Lean and Six Sigma principles.', descriptionAr: 'حسّن عمليات مركز التوزيع في أمازون مصر باستخدام مبادئ Lean و Six Sigma.', requirements: ['Engineering or Operations student','Analytical skills','Data-driven mindset'], requirementsAr: ['طالب هندسة أو عمليات','مهارات تحليلية','تفكير بالبيانات'], featured: true,  source: 'linkedin' },
  { id: 14, companyId: 11, title: 'E-Commerce Category Intern',  titleAr: 'متدرب فئة تجارة إلكترونية', location: 'New Capital', salary: 'EGP 5,500/mo',  postedAgo: '3d',  applicants: 38,  skills: ['Excel','Vendor Management','Market Research'],      type: 'internship', industry: 'E-Commerce', description: 'Manage a product category at Amazon Egypt. Work with vendors and optimize listings.', descriptionAr: 'أدِر فئة منتجات في أمازون مصر. اعمل مع البائعين وحسّن القوائم.', requirements: ['Business student','Detail-oriented','Basic Excel'], requirementsAr: ['طالب أعمال','انتباه للتفاصيل','Excel أساسي'], featured: false, source: 'company' },
  // IBM Egypt
  { id: 15, companyId: 12, title: 'Cloud Solutions Intern',      titleAr: 'متدرب حلول السحابة',    location: 'New Cairo',      salary: 'EGP 7,000/mo',  postedAgo: '2d',  applicants: 55,  skills: ['IBM Cloud','Python','DevOps'],                       type: 'internship', industry: 'Technology', description: 'Work on IBM Cloud deployments and enterprise client implementations across Egypt.', descriptionAr: 'اعمل على نشر IBM Cloud وتطبيقات العملاء المؤسسيين في مصر.', requirements: ['CS or IT student','Cloud basics','Python familiarity'], requirementsAr: ['حاسبات أو تقنية معلومات','أساسيات السحابة','Python'], featured: false, source: 'linkedin' },
  // Coca-Cola Egypt
  { id: 16, companyId: 14, title: 'Commercial Operations Intern', titleAr: 'متدرب العمليات التجارية', location: 'Maadi',         salary: 'EGP 5,000/mo',  postedAgo: '4d',  applicants: 29,  skills: ['Route-to-Market','KPIs','FMCG'],                    type: 'internship', industry: 'FMCG',       description: "Learn Coca-Cola Egypt's go-to-market strategy and distributor ecosystem firsthand.", descriptionAr: 'تعلّم استراتيجية كوكاكولا مصر في الوصول للسوق ومنظومة الموزعين بشكل مباشر.', requirements: ['Business student','Enthusiastic about FMCG',"Driver's license a plus"], requirementsAr: ['طالب أعمال','متحمس للسلع الاستهلاكية','رخصة قيادة ميزة'], featured: false, source: 'wuzzuf' },
  // Deloitte Egypt
  { id: 17, companyId: 15, title: 'Audit & Assurance Intern',    titleAr: 'متدرب تدقيق وتأكيد',    location: 'New Cairo',      salary: 'EGP 5,500/mo',  postedAgo: '1d',  applicants: 61,  skills: ['Accounting','Auditing','IFRS'],                      type: 'internship', industry: 'Consulting', description: 'Gain hands-on audit experience at Deloitte Egypt, working on Big Four-quality engagements.', descriptionAr: 'اكتسب خبرة تدقيق عملية في ديلويت مصر مع مشاريع من الدرجة الأولى.', requirements: ['Accounting or Finance major','GPA 3.0+','Attention to detail'], requirementsAr: ['محاسبة أو مالية','معدل 3.0+','انتباه للتفاصيل'], featured: true,  source: 'linkedin' },
  { id: 18, companyId: 15, title: 'Management Consulting Intern', titleAr: 'متدرب استشارات إدارية', location: 'New Cairo',      salary: 'EGP 7,000/mo',  postedAgo: '3d',  applicants: 88,  skills: ['Strategy','PowerPoint','Excel'],                     type: 'internship', industry: 'Consulting', description: 'Work on strategy and transformation projects for top Egyptian and multinational clients.', descriptionAr: 'اعمل على مشاريع الاستراتيجية والتحول للعملاء المصريين والعالميين الكبار.', requirements: ['Business/Engineering student','GPA 3.5+','Structured thinking'], requirementsAr: ['أعمال أو هندسة','معدل 3.5+','تفكير منهجي'], featured: true,  source: 'company' },
  // PwC Egypt
  { id: 19, companyId: 16, title: 'Tax Advisory Intern',         titleAr: 'متدرب الاستشارات الضريبية', location: 'Maadi',       salary: 'EGP 5,000/mo',  postedAgo: '5d',  applicants: 34,  skills: ['Tax Law','Excel','Client Advisory'],                 type: 'internship', industry: 'Consulting', description: "Join PwC Egypt's tax team. Learn Egyptian tax law and advise real business clients.", descriptionAr: 'انضم لفريق الضرائب في PwC مصر. تعلّم قانون الضرائب المصري واستشر العملاء.', requirements: ['Accounting/Law/Finance student','Analytical','Strong Arabic & English'], requirementsAr: ['محاسبة أو قانون أو مالية','تحليلي','عربي وإنجليزي قوي'], featured: false, source: 'company' },
  // Majid Al Futtaim
  { id: 20, companyId: 18, title: 'Retail Operations Intern',    titleAr: 'متدرب عمليات التجزئة',  location: 'New Cairo',      salary: 'EGP 4,500/mo',  postedAgo: '1w',  applicants: 22,  skills: ['Retail','Customer Experience','Excel'],             type: 'internship', industry: 'Retail',     description: "Work inside Mall of Egypt or City Centre, learning retail operations from the ground up.", descriptionAr: 'اعمل داخل مول مصر أو سيتي سنتر، وتعلّم عمليات التجزئة من الأساس.', requirements: ['Business student','Customer-first mindset','Presentable'], requirementsAr: ['طالب أعمال','عقلية العميل أولاً','مظهر لائق'], featured: false, source: 'wuzzuf' },
  // Careem
  { id: 21, companyId: 19, title: 'Growth & Marketing Intern',  titleAr: 'متدرب النمو والتسويق',  location: 'Nasr City',      salary: 'EGP 5,000/mo',  postedAgo: '2d',  applicants: 58,  skills: ['Growth Hacking','A/B Testing','Data'],              type: 'internship', industry: 'Technology', description: "Run growth experiments at Careem Egypt. A/B test campaigns and analyze driver/captain acquisition.", descriptionAr: 'أجرِ تجارب النمو في كريم مصر. اختبر الحملات وحلّل اكتساب الكابتن.', requirements: ['Marketing/Business student','Data curiosity','Growth mindset'], requirementsAr: ['تسويق أو أعمال','فضول للبيانات','عقلية نمو'], featured: false, source: 'linkedin' },
  // Valeo Egypt
  { id: 22, companyId: 20, title: 'Embedded Systems Intern',    titleAr: 'متدرب أنظمة مدمجة',    location: 'New Capital',    salary: 'EGP 7,000/mo',  postedAgo: '3d',  applicants: 45,  skills: ['C/C++','AUTOSAR','CAN Bus'],                         type: 'internship', industry: 'Automotive', description: "Work on cutting-edge automotive embedded systems at Valeo's Egypt R&D center.", descriptionAr: 'اعمل على أنظمة السيارات المدمجة المتطورة في مركز البحث والتطوير في فاليو مصر.', requirements: ['Electronics or CS student','C/C++ proficiency','RTOS knowledge a plus'], requirementsAr: ['إلكترونيات أو حاسبات','C/C++','RTOS ميزة'], featured: true,  source: 'company' },
  // Paymob
  { id: 23, companyId: 25, title: 'Merchant Success Intern',     titleAr: 'متدرب نجاح التجار',    location: 'Maadi',          salary: 'EGP 4,500/mo',  postedAgo: '1d',  applicants: 27,  skills: ['Customer Success','Fintech','Communication'],       type: 'internship', industry: 'Fintech',    description: "Help merchants integrate and succeed on Paymob's payment gateway. Egypt's hottest fintech startup.", descriptionAr: 'ساعد التجار على الاندماج والنجاح مع بوابة دفع Paymob. أسرع شركة تقنية مالية في مصر.', requirements: ['Business/CS student','Excellent communication','Problem-solver'], requirementsAr: ['أعمال أو حاسبات','تواصل ممتاز','حلّال مشكلات'], featured: false, source: 'wuzzuf' },
  // Breadfast
  { id: 24, companyId: 24, title: 'Operations Intern',           titleAr: 'متدرب عمليات',          location: 'Heliopolis',     salary: 'EGP 4,000/mo',  postedAgo: '2d',  applicants: 19,  skills: ['Operations','Logistics','Data Entry'],              type: 'internship', industry: 'E-Commerce', description: 'Work at the heart of Breadfast operations — delivery routing, rider management, fulfilment.', descriptionAr: 'اعمل في قلب عمليات Breadfast — توجيه التوصيل وإدارة المندوبين والتنفيذ.', requirements: ['Any major','Detail-oriented','Morning person'], requirementsAr: ['أي تخصص','منتبه للتفاصيل','صباحي'], featured: false, source: 'company' },
  // Entry-Level Full-Time Jobs
  { id: 25, companyId: 2,  title: 'Junior Corporate Banker',     titleAr: 'موظف مصرفي مؤسسي مبتدئ', location: 'New Cairo',    salary: 'EGP 12,000/mo', postedAgo: '1d',  applicants: 142, skills: ['Credit Analysis','Financial Modeling','Excel'],    type: 'full-time', industry: 'Banking',    description: 'Join CIB corporate banking as a junior banker. Manage client portfolios and structure credit facilities.', descriptionAr: 'انضم لمصرفية الشركات في CIB كمصرفي مبتدئ. أدر محافظ العملاء وهيكل التسهيلات الائتمانية.', requirements: ['Finance/Accounting grad','1 year experience or strong internship','CFA Level 1 a plus'], requirementsAr: ['خريج مالية أو محاسبة','سنة خبرة أو تدريب قوي','CFA ميزة'], featured: true,  source: 'linkedin', deadline: '2026-06-30' },
  { id: 26, companyId: 4,  title: 'Junior Software Engineer',    titleAr: 'مهندس برمجيات مبتدئ',   location: 'Smart Village',  salary: 'EGP 18,000/mo', postedAgo: '6h',  applicants: 210, skills: ['JavaScript','TypeScript','React','Node.js'],        type: 'full-time', industry: 'Technology', description: 'Build Microsoft products used by millions of Egyptians. Mentorship from senior engineers.', descriptionAr: 'ابنِ منتجات مايكروسوفت يستخدمها الملايين في مصر. إرشاد من مهندسين كبار.', requirements: ['CS degree or equivalent','JavaScript/TypeScript proficiency','Problem-solving skills'], requirementsAr: ['شهادة حاسبات أو ما يعادلها','JavaScript/TypeScript','مهارات حل المشكلات'], featured: true,  source: 'linkedin' },
  { id: 27, companyId: 5,  title: 'Associate Consultant',        titleAr: 'مستشار مشارك',          location: 'New Cairo',      salary: 'EGP 22,000/mo', postedAgo: '2d',  applicants: 385, skills: ['Strategy','Analysis','Communication','PowerPoint'],  type: 'full-time', industry: 'Consulting', description: "McKinsey Cairo's 2026 Associate Consultant class. Shape Egypt's largest organizations.", descriptionAr: 'دفعة 2026 من المستشارين المشاركين في ماكنزي القاهرة. شكّل أكبر المنظمات المصرية.', requirements: ['Top-university grad (any field)','GPA 3.7+','Exceptional problem-solving'], requirementsAr: ['خريج جامعة مرموقة (أي تخصص)','معدل 3.7+','حل مشكلات استثنائي'], featured: true,  source: 'linkedin', deadline: '2026-06-01' },
  { id: 28, companyId: 15, title: 'Junior Auditor',              titleAr: 'مدقق مبتدئ',            location: 'New Cairo',      salary: 'EGP 9,000/mo',  postedAgo: '3d',  applicants: 95,  skills: ['Auditing','IFRS','Risk Assessment'],                 type: 'full-time', industry: 'Consulting', description: "Start your Big Four career at Deloitte Egypt's audit practice.", descriptionAr: 'ابدأ مسيرتك مع الأربعة الكبار في ممارسة التدقيق في ديلويت مصر.', requirements: ['Accounting grad','ACCA/CPA pursuing a plus','Attention to detail'], requirementsAr: ['خريج محاسبة','ACCA/CPA ميزة','انتباه للتفاصيل'], featured: false, source: 'company' },
  { id: 29, companyId: 6,  title: 'Junior Product Manager',      titleAr: 'مدير منتجات مبتدئ',    location: 'Maadi',          salary: 'EGP 14,000/mo', postedAgo: '1d',  applicants: 78,  skills: ['Product','Agile','User Research','SQL'],             type: 'full-time', industry: 'Fintech',    description: 'Own a product area at Fawry. Define roadmaps, run sprints, and ship features to 40M+ users.', descriptionAr: 'امتلك منطقة منتج في فوري. حدد خارطة الطريق وأرسل ميزات لأكثر من 40 مليون مستخدم.', requirements: ['CS or Business grad','1 year PM or tech experience','Data-driven decision maker'], requirementsAr: ['خريج حاسبات أو أعمال','سنة خبرة PM أو تقنية','قرارات قائمة على البيانات'], featured: false, source: 'wuzzuf' },
  { id: 30, companyId: 25, title: 'Sales Account Executive',     titleAr: 'مدير حسابات مبيعات',   location: 'Maadi',          salary: 'EGP 10,000/mo', postedAgo: '5d',  applicants: 44,  skills: ['B2B Sales','Fintech','Negotiation'],                 type: 'full-time', industry: 'Fintech',    description: "Sell Paymob's payment solutions to Egyptian merchants and e-commerce businesses.", descriptionAr: 'بع حلول الدفع من Paymob للتجار والشركات الإلكترونية المصرية.', requirements: ['Business grad','Strong communication','Results-driven personality'], requirementsAr: ['خريج أعمال','تواصل قوي','شخصية موجهة نحو النتائج'], featured: false, source: 'company' },
  // More internships
  { id: 31, companyId: 21, title: 'VLSI Design Intern',          titleAr: 'متدرب تصميم VLSI',      location: 'Smart Village',  salary: 'EGP 8,000/mo',  postedAgo: '2d',  applicants: 33,  skills: ['VLSI','Verilog','Cadence'],                          type: 'internship', industry: 'Technology', description: 'Work on chip design at Siemens EDA (formerly Mentor Graphics) Egypt, one of the best R&D centers in MENA.', descriptionAr: 'اعمل على تصميم الرقائق في سيمنز EDA مصر، أحد أفضل مراكز البحث والتطوير في المنطقة.', requirements: ['Electronics/CS student','Digital design knowledge','VHDL or Verilog'], requirementsAr: ['إلكترونيات أو حاسبات','معرفة التصميم الرقمي','VHDL أو Verilog'], featured: false, source: 'company' },
  { id: 32, companyId: 22, title: 'Retail Banking Intern',       titleAr: 'متدرب مصرفية التجزئة', location: 'Downtown Cairo', salary: 'EGP 3,500/mo',  postedAgo: '1w',  applicants: 85,  skills: ['Customer Service','Banking','Communication'],        type: 'internship', industry: 'Banking',    description: "Rotate through NBE's retail banking branches and learn banking operations from Egypt's oldest bank.", descriptionAr: 'تناوب على فروع المصرفية التجزئة في بنك مصر الوطني وتعلّم عمليات البنك.', requirements: ['Any finance/business student','Customer-oriented','Professional appearance'], requirementsAr: ['أي طالب مالية أو أعمال','موجه نحو العميل','مظهر مهني'], featured: false, source: 'company' },
  { id: 33, companyId: 13, title: 'Healthcare Operations Intern', titleAr: 'متدرب عمليات رعاية صحية', location: 'Heliopolis',  salary: 'EGP 4,000/mo',  postedAgo: '4d',  applicants: 16,  skills: ['Healthcare','Excel','Operations'],                    type: 'internship', industry: 'Healthcare', description: 'Work inside a leading health insurance company. Learn claims processing, provider networks, and operations.', descriptionAr: 'اعمل داخل شركة تأمين صحي رائدة. تعلّم معالجة المطالبات وشبكات مقدمي الخدمة.', requirements: ['Healthcare management or Business student','Organized','Detail-oriented'], requirementsAr: ['إدارة رعاية صحية أو أعمال','منظم','انتباه للتفاصيل'], featured: false, source: 'wuzzuf' },
  { id: 34, companyId: 17, title: 'Media Production Intern',     titleAr: 'متدرب إنتاج إعلامي',   location: '6th October',    salary: 'EGP 3,000/mo',  postedAgo: '6d',  applicants: 72,  skills: ['Video Editing','Adobe Premiere','Content'],         type: 'internship', industry: 'Media',      description: 'Work at EMPC — the largest media city in the Middle East. Support production teams on real TV/film projects.', descriptionAr: 'اعمل في EMPC — أكبر مدينة إعلامية في الشرق الأوسط. ادعم فرق الإنتاج في مشاريع حقيقية.', requirements: ['Media/Film student','Adobe Creative Suite','Portfolio preferred'], requirementsAr: ['طالب إعلام أو سينما','Adobe Creative Suite','محفظة أعمال مفضلة'], featured: false, source: 'company' },
  { id: 35, companyId: 1,  title: 'Corporate Communications Intern', titleAr: 'متدرب اتصالات مؤسسية', location: 'Smart Village', salary: 'EGP 4,500/mo', postedAgo: '3d', applicants: 31,  skills: ['PR','Writing','Stakeholder Management'],            type: 'internship', industry: 'Telecom',    description: "Shape Vodafone Egypt's corporate narrative. Write press releases, manage media relations.", descriptionAr: 'شكّل الرواية المؤسسية لفودافون مصر. اكتب البيانات الصحفية وأدِر العلاقات الإعلامية.', requirements: ['Communications or Journalism student','Excellent English','Strong writing skills'], requirementsAr: ['طالب اتصالات أو صحافة','إنجليزي ممتاز','كتابة قوية'], featured: false, source: 'linkedin' },
]

export const DOCUMENTS: Document[] = [
  {
    key: 'cv',
    label: 'CV / Resume',
    labelAr: 'السيرة الذاتية',
    description: 'PDF or Word · max 5 MB',
    descriptionAr: 'PDF أو Word · حجم أقصى 5 ميجا',
    required: true,
    acceptedTypes: '.pdf,.doc,.docx',
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSizeMB: 5,
  },
  {
    key: 'transcript',
    label: 'Academic Transcript',
    labelAr: 'كشف الدرجات الأكاديمي',
    description: 'PDF or image · max 10 MB',
    descriptionAr: 'PDF أو صورة · حجم أقصى 10 ميجا',
    required: true,
    acceptedTypes: '.pdf,.jpg,.jpeg,.png',
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeMB: 10,
  },
  {
    key: 'nationalId',
    label: 'National ID',
    labelAr: 'بطاقة الرقم القومي',
    description: 'Image or PDF · max 5 MB',
    descriptionAr: 'صورة أو PDF · حجم أقصى 5 ميجا',
    required: true,
    acceptedTypes: '.jpg,.jpeg,.png,.pdf',
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeMB: 5,
  },
  {
    key: 'photo',
    label: 'Personal Photo',
    labelAr: 'صورة شخصية',
    description: 'JPG or PNG · max 3 MB',
    descriptionAr: 'JPG أو PNG · حجم أقصى 3 ميجا',
    required: false,
    acceptedTypes: '.jpg,.jpeg,.png,.webp',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB: 3,
  },
  {
    key: 'certificates',
    label: 'Certificates',
    labelAr: 'الشهادات والدورات',
    description: 'PDF or image · max 10 MB',
    descriptionAr: 'PDF أو صورة · حجم أقصى 10 ميجا',
    required: false,
    acceptedTypes: '.pdf,.jpg,.jpeg,.png',
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeMB: 10,
  },
  {
    key: 'coverLetter',
    label: 'Cover Letter',
    labelAr: 'خطاب التقديم',
    description: 'PDF or Word · max 2 MB',
    descriptionAr: 'PDF أو Word · حجم أقصى 2 ميجا',
    required: false,
    acceptedTypes: '.pdf,.doc,.docx',
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSizeMB: 2,
  },
  {
    key: 'portfolio',
    label: 'Portfolio / Projects',
    labelAr: 'المحفظة والمشاريع',
    description: 'PDF, image, or ZIP · max 20 MB',
    descriptionAr: 'PDF أو صورة أو ZIP · حجم أقصى 20 ميجا',
    required: false,
    acceptedTypes: '.pdf,.jpg,.jpeg,.png,.zip',
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/zip'],
    maxSizeMB: 20,
  },
]

// ─────────── Tutorials ───────────
const marketingTutorials: Tutorial[] = [
  { title: 'How to Create a Social Media Marketing Strategy', titleAr: 'كيف تبني استراتيجية تسويق على السوشيال ميديا', channel: 'HubSpot Marketing', duration: '18 min', url: 'https://www.youtube.com/results?search_query=social+media+marketing+strategy+for+beginners', thumbnail: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=225&fit=crop' },
  { title: 'Writing a Campaign Brief That Gets Approved', titleAr: 'كتابة موجز حملة يحصل على الموافقة', channel: 'Marketing School', duration: '12 min', url: 'https://www.youtube.com/results?search_query=how+to+write+a+campaign+brief+marketing', thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&h=225&fit=crop' },
]
const competitorTutorials: Tutorial[] = [
  { title: 'Competitor Analysis Step by Step', titleAr: 'تحليل المنافسين خطوة بخطوة', channel: 'Neil Patel', duration: '15 min', url: 'https://www.youtube.com/results?search_query=competitor+analysis+for+beginners+marketing', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop' },
]
const financeTutorials: Tutorial[] = [
  { title: 'Budget Variance Analysis in Excel', titleAr: 'تحليل انحراف الميزانية في Excel', channel: 'Corporate Finance Institute', duration: '22 min', url: 'https://www.youtube.com/results?search_query=budget+variance+analysis+excel+tutorial', thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop' },
  { title: 'How to Write an Executive Summary', titleAr: 'كيف تكتب ملخصاً تنفيذياً احترافياً', channel: 'Business Finance Coach', duration: '10 min', url: 'https://www.youtube.com/results?search_query=how+to+write+executive+summary+finance', thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=225&fit=crop' },
]
const operationsTutorials: Tutorial[] = [
  { title: 'Process Mapping & Bottleneck Analysis', titleAr: 'رسم العمليات وتحليل نقاط الاختناق', channel: 'Lean Enterprise Institute', duration: '20 min', url: 'https://www.youtube.com/results?search_query=process+mapping+bottleneck+analysis+lean', thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=225&fit=crop' },
  { title: 'The 5 Whys Root Cause Analysis', titleAr: 'أسلوب الـ 5 لماذا في تحليل الأسباب الجذرية', channel: 'Quality Gurus', duration: '14 min', url: 'https://www.youtube.com/results?search_query=5+whys+root+cause+analysis+tutorial', thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop' },
]
const bizdevTutorials: Tutorial[] = [
  { title: 'How to Write a Partnership Proposal', titleAr: 'كيف تكتب اقتراح شراكة تجارية', channel: 'Startup Grind', duration: '16 min', url: 'https://www.youtube.com/results?search_query=how+to+write+a+partnership+proposal+business', thumbnail: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=225&fit=crop' },
  { title: 'Cold Email Strategy That Gets Responses', titleAr: 'استراتيجية البريد البارد التي تحصل على ردود', channel: 'Alex Berman', duration: '19 min', url: 'https://www.youtube.com/results?search_query=cold+email+outreach+strategy+business+development', thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=225&fit=crop' },
]
const hrTutorials: Tutorial[] = [
  { title: 'How to Screen CVs Like a Pro', titleAr: 'كيف تفرز السير الذاتية كالمحترفين', channel: 'SHRM', duration: '14 min', url: 'https://www.youtube.com/results?search_query=how+to+screen+resumes+hr+recruiter', thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=225&fit=crop' },
  { title: 'Behavioral Interview Techniques', titleAr: 'تقنيات المقابلة السلوكية', channel: 'LinkedIn Talent', duration: '20 min', url: 'https://www.youtube.com/results?search_query=behavioral+interview+techniques+STAR+method+hr', thumbnail: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=400&h=225&fit=crop' },
]
const dataTutorials: Tutorial[] = [
  { title: 'SQL for Beginners — Full Course', titleAr: 'SQL للمبتدئين — دورة كاملة', channel: 'freeCodeCamp', duration: '4h', url: 'https://www.youtube.com/results?search_query=SQL+for+beginners+full+tutorial', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop' },
  { title: 'Python Pandas Data Analysis Tutorial', titleAr: 'تحليل البيانات بـ Python Pandas', channel: 'Corey Schafer', duration: '1h 15min', url: 'https://www.youtube.com/results?search_query=python+pandas+data+analysis+tutorial+beginner', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop' },
]

// ─────────── Simulation Tracks ───────────
export const SIM_TRACKS: SimTrack[] = [
  {
    id: 'marketing', label: 'Marketing', labelAr: 'التسويق',
    color: '#E8464E', icon: 'megaphone',
    description: 'Run campaigns, analyze metrics, build brand strategies',
    descriptionAr: 'أدِر الحملات، حلّل البيانات، ابنِ الاستراتيجيات',
    tasks: [
      {
        id: 'm1', title: 'Social Media Campaign Brief', titleAr: 'موجز حملة وسائل التواصل',
        scenario: 'You are the marketing intern at a mid-size FMCG company launching a new snack product targeting Egyptian Gen Z (18–24). Your manager needs a social media campaign brief by end of week.',
        scenarioAr: 'أنت متدرب التسويق في شركة سلع استهلاكية تطلق منتج وجبات خفيفة جديد يستهدف الجيل Z المصري (18-24). مديرك يحتاج موجز حملة بنهاية الأسبوع.',
        xp: 120, badge: 'Campaign Strategist', badgeAr: 'استراتيجي حملات', time: '45 min',
        steps: [
          { title: 'Define Your Target Audience', titleAr: 'حدد جمهورك المستهدف', type: 'text', placeholder: 'Describe in detail: age, interests, pain points, daily habits...', placeholderAr: 'صف بالتفصيل: العمر، الاهتمامات، نقاط الألم، العادات اليومية...', hint: 'Egyptian Gen Z (18-24) spends 3+ hours daily on TikTok and Instagram. Think about what they care about: self-expression, trends, humor, local culture.', hintAr: 'الجيل Z المصري (18-24) يقضي 3+ ساعات يومياً على TikTok و Instagram. ما الذي يهمهم؟', tutorials: marketingTutorials },
          { title: 'Choose Your Top 2 Platforms', titleAr: 'اختر أفضل منصتين', type: 'multi', options: ['TikTok','Instagram','Twitter/X','Facebook','YouTube','Snapchat'], hint: 'TikTok = short viral video, Instagram = Reels + Stories. Pick where your audience is most active.', hintAr: 'TikTok = فيديو قصير، Instagram = Reels + Stories، اختر بناءً على مكان جمهورك.' },
          { title: 'Write 3 Content Pillars', titleAr: 'اكتب 3 أعمدة محتوى', type: 'text', placeholder: 'Pillar 1: ...\nPillar 2: ...\nPillar 3: ...', placeholderAr: 'العمود 1: ...\nالعمود 2: ...\nالعمود 3: ...', hint: "Content pillars are recurring themes. Example: 1) 'Snack Moments', 2) 'Fan Challenges', 3) 'Behind the Flavor'.", hintAr: 'أعمدة المحتوى هي المواضيع المتكررة. مثال: 1) لحظات الوجبة، 2) تحديات المتابعين.' },
          { title: 'Set 3 Campaign KPIs', titleAr: 'حدد 3 مؤشرات أداء', type: 'multi', options: ['Reach > 500,000 accounts','Engagement Rate > 4%','50+ UGC posts','10,000 website visits','Brand awareness +20%','TikTok views > 1M','CTR > 2.5%'], hint: 'KPIs make success measurable. Set ambitious but realistic targets for a 1-month campaign.', hintAr: 'KPIs تجعل النجاح قابلاً للقياس.' },
          { title: 'Draft a Sample Post', titleAr: 'اكتب منشور نموذجي', type: 'text', placeholder: 'Write a full post: hook, body, call-to-action, hashtags...', placeholderAr: 'اكتب منشوراً كاملاً: خطاف، محتوى، دعوة للعمل، وسوم...', hint: 'Structure: HOOK (stops scrolling) → BODY (2-3 lines) → CTA → HASHTAGS (3-5 targeted).', hintAr: 'الهيكل: خطاف → محتوى → دعوة للعمل → وسوم.' },
        ],
      },
      {
        id: 'm2', title: 'Competitor Analysis Report', titleAr: 'تقرير تحليل المنافسين',
        scenario: 'Your marketing director needs a competitive analysis of 3 brands in the Egyptian snack market before the quarterly strategy meeting tomorrow.',
        scenarioAr: 'مدير التسويق يحتاج تحليلاً تنافسياً لـ 3 علامات تجارية في سوق الوجبات الخفيفة المصري قبل اجتماع الاستراتيجية الربعي صباح الغد.',
        xp: 100, badge: 'Market Analyst', badgeAr: 'محلل أسواق', time: '35 min',
        steps: [
          { title: 'Pick 3 Competitors to Analyze', titleAr: 'اختر 3 منافسين للتحليل', type: 'multi', options: ['Chipsy (PepsiCo)','Doritos Egypt','Edita Snacks','Bake Rolz','Pringles Egypt','Molto'], hint: 'Choose competitors that are closest to your target customer and price point.', hintAr: 'اختر منافسين الأقرب لعميلك المستهدف وسعرك.' },
          { title: 'Describe Each Brand\'s Positioning', titleAr: 'صف مكانة كل علامة', type: 'text', placeholder: 'Brand 1: [name] — positioning: ...\nBrand 2: ...\nBrand 3: ...', placeholderAr: 'العلامة 1: ... — المكانة: ...\nالعلامة 2: ...\nالعلامة 3: ...', hint: 'Positioning = who they target + what makes them different. Think price, quality, fun, tradition.', hintAr: 'المكانة = من يستهدفون + ما الذي يميزهم.', tutorials: competitorTutorials },
          { title: 'Identify Their Weaknesses', titleAr: 'حدد نقاط ضعفهم', type: 'text', placeholder: 'For each competitor, identify 1-2 weaknesses your brand can exploit...', placeholderAr: 'لكل منافس، حدد نقطة ضعف أو اثنتين يمكن لعلامتك استغلالها...', hint: 'Weaknesses could be: boring packaging, no Arabic content, high price, old audience image.', hintAr: 'نقاط الضعف: تغليف ممل، لا محتوى عربي، سعر مرتفع، صورة جمهور قديمة.' },
          { title: 'Write Your Recommendation', titleAr: 'اكتب توصيتك', type: 'text', placeholder: 'Based on your analysis, where is the market gap and how should your brand position itself?', placeholderAr: 'بناءً على تحليلك، أين الفجوة في السوق وكيف يجب أن تضع علامتك نفسها؟', hint: "Structure: 'The market gap is [X]. Our brand should position as [Y] because [Z].'", hintAr: 'الهيكل: الفجوة هي [X]. يجب أن تتمركز علامتنا كـ [Y] لأن [Z].' },
        ],
      },
    ],
  },
  {
    id: 'finance', label: 'Finance', labelAr: 'المالية',
    color: '#0D9488', icon: 'credit-card',
    description: 'Build financial models, analyze budgets, create reports',
    descriptionAr: 'ابنِ نماذج مالية، حلّل الميزانيات، أنشئ التقارير',
    tasks: [
      {
        id: 'f1', title: 'Budget Variance Analysis', titleAr: 'تحليل انحراف الميزانية',
        scenario: 'It is end of Q2. Your finance manager has asked you to prepare a budget variance analysis comparing Q2 actual results to the budget. Marketing spend came in at EGP 2.3M vs. EGP 2.0M budgeted. Revenue was EGP 8.1M vs. EGP 9.0M budgeted.',
        scenarioAr: 'نهاية الربع الثاني. مديرك المالي طلب منك تحليل انحراف الميزانية مقارنةً بالنتائج الفعلية. المبيعات 8.1 مليون جنيه مقابل 9 مليون مستهدف. التسويق 2.3 مليون مقابل 2 مليون مستهدف.',
        xp: 140, badge: 'Financial Analyst', badgeAr: 'محلل مالي', time: '40 min',
        steps: [
          { title: 'Calculate the Variances', titleAr: 'احسب الانحرافات', type: 'text', placeholder: 'Revenue variance: EGP __ (favorable/unfavorable)\nMarketing variance: EGP __ (favorable/unfavorable)\nExplain what these numbers mean...', placeholderAr: 'انحراف الإيراد: جنيه __ (إيجابي/سلبي)\nانحراف التسويق: جنيه __ (إيجابي/سلبي)\nاشرح ما تعنيه هذه الأرقام...', hint: 'Variance = Actual - Budget. A revenue variance below budget is unfavorable. A cost variance above budget is unfavorable.', hintAr: 'الانحراف = الفعلي - الميزانية. انحراف الإيراد دون الميزانية سلبي. انحراف التكلفة فوق الميزانية سلبي.', tutorials: financeTutorials },
          { title: 'Identify Potential Root Causes', titleAr: 'حدد الأسباب الجذرية المحتملة', type: 'multi', options: ['Lower-than-expected sales volume','Pricing pressure from competitors','Delayed product launch','Higher marketing costs than planned','Supply chain disruptions','Economic headwinds (inflation/FX)','Seasonality effects'], hint: 'Think about what external or internal factors could explain BOTH the revenue miss AND the cost overrun.', hintAr: 'فكّر في العوامل الداخلية والخارجية التي قد تفسر انخفاض الإيراد وزيادة التكاليف في آنٍ واحد.' },
          { title: 'Write the Executive Summary', titleAr: 'اكتب الملخص التنفيذي', type: 'text', placeholder: 'Write a 3-4 sentence executive summary for your CFO covering: what happened, why, and what action you recommend...', placeholderAr: 'اكتب ملخصاً تنفيذياً من 3-4 جمل للمدير المالي يغطي: ماذا حدث، لماذا، وما التوصية...', hint: "Formula: 'Q2 results showed a [X] unfavorable revenue variance and [Y] unfavorable cost variance. The primary driver was [Z]. We recommend [action].'", hintAr: 'صيغة الملخص: نتائج الربع الثاني أظهرت انحراف إيراد سلبياً بـ [X] وانحراف تكلفة سلبياً بـ [Y]. السبب الرئيسي [Z]. نوصي بـ [إجراء].' },
        ],
      },
      {
        id: 'f2', title: 'Investment Pitch Memo', titleAr: 'مذكرة عرض استثماري',
        scenario: "Your team at a venture capital fund is evaluating whether to invest EGP 5M into a food-tech startup called 'FreshRoute' — an app connecting Cairo residents to local farms for fresh produce delivery.",
        scenarioAr: 'فريقك في صندوق رأس المال المغامر يدرس الاستثمار 5 ملايين جنيه في شركة ناشئة في تقنية الأغذية تسمى FreshRoute — تطبيق يربط سكان القاهرة بالمزارع المحلية.',
        xp: 160, badge: 'Investment Analyst', badgeAr: 'محلل استثمار', time: '50 min',
        steps: [
          { title: 'Assess the Market Opportunity', titleAr: 'قيّم فرصة السوق', type: 'text', placeholder: 'How big is the Egyptian food delivery / fresh produce market? Is it growing? Who are the main competitors?', placeholderAr: 'ما حجم سوق توصيل الأغذية / المنتجات الطازجة في مصر؟ هل ينمو؟ من المنافسون؟', hint: "Egypt has 7M+ Cairo households. Online grocery grew 300% post-COVID. Main players: Breadfast, El Dawly. FreshRoute targets a premium 'farm-to-table' niche.", hintAr: 'مصر فيها 7 مليون+ أسرة في القاهرة. البقالة الإلكترونية نمت 300% بعد كوفيد.' },
          { title: 'Identify the Top 3 Risks', titleAr: 'حدد أهم 3 مخاطر', type: 'multi', options: ['Supply chain reliability (farm dependency)','Competition from Breadfast/Amazon Fresh','Customer acquisition cost','Cold chain logistics','Regulatory (food safety)','FX risk (imported packaging)','Founder team risk'], hint: "Pick risks that are specific to THIS startup's model — not just generic risks that apply to every business.", hintAr: 'اختر المخاطر المحددة لنموذج هذه الشركة الناشئة.' },
          { title: 'State Your Investment Recommendation', titleAr: 'أعلن توصيتك الاستثمارية', type: 'text', placeholder: 'Recommend: Invest / Do Not Invest / Invest with conditions\n\nReasoning (3-4 sentences):...', placeholderAr: 'التوصية: استثمر / لا تستثمر / استثمر بشروط\n\nالمبرر (3-4 جمل): ...', hint: "A strong recommendation has a clear stance + 2-3 specific reasons + one condition or milestone you'd want to see.", hintAr: 'التوصية القوية تحتوي: موقف واضح + 2-3 أسباب محددة + شرط أو معلم تريد رؤيته.' },
        ],
      },
    ],
  },
  {
    id: 'operations', label: 'Operations', labelAr: 'العمليات',
    color: '#7C3AED', icon: 'package',
    description: 'Optimize processes, solve bottlenecks, manage logistics',
    descriptionAr: 'حسّن العمليات، حلّ نقاط الاختناق، أدِر اللوجستيات',
    tasks: [
      {
        id: 'o1', title: 'Warehouse Bottleneck Fix', titleAr: 'حل اختناق المستودع',
        scenario: "You're the operations intern at a large FMCG distribution center in 6th October City. Average order fulfillment time has jumped from 4 hours to 7 hours over the past month, causing 15% of orders to miss delivery windows.",
        scenarioAr: 'أنت متدرب العمليات في مركز توزيع سلع استهلاكية كبير في مدينة 6 أكتوبر. ارتفع وقت تنفيذ الطلبات من 4 ساعات إلى 7 ساعات، مما أدى إلى تفويت 15% من الطلبات لمواعيد التسليم.',
        xp: 130, badge: 'Process Optimizer', badgeAr: 'محسّن العمليات', time: '40 min',
        steps: [
          { title: 'Map the Current Process', titleAr: 'رسم العملية الحالية', type: 'text', placeholder: 'Describe the steps: Order received → Picking → Packing → Quality Check → Loading → Dispatch. Where do you think the delays are?', placeholderAr: 'صف الخطوات: استلام الطلب → التجميع → التعبئة → مراقبة الجودة → التحميل → الإرسال. أين تعتقد أن التأخير يحدث؟', hint: 'Bottlenecks usually occur at handoff points between teams or in the slowest step. The 5 Whys technique helps trace root causes.', hintAr: 'نقاط الاختناق عادةً تحدث عند نقاط التسليم بين الفرق أو في الخطوة الأبطأ.', tutorials: operationsTutorials },
          { title: 'Identify Root Cause', titleAr: 'حدد السبب الجذري', type: 'multi', options: ['Understaffing in picking team','New SKUs added without process update','System (WMS) slowdown','Seasonal demand spike','Receiving area congestion','Equipment breakdown (forklifts)','Poor pick-path optimization'], hint: 'Use the 5 Whys: ask "why?" five times to trace back from symptom to root cause.', hintAr: 'استخدم أسلوب 5 لماذا: اسأل "لماذا؟" خمس مرات لتتبع السبب الجذري.' },
          { title: 'Propose Your Fix', titleAr: 'اقترح الحل', type: 'text', placeholder: 'Describe your solution: What would you change, how, and what KPI improvement do you expect?', placeholderAr: 'صف حلك: ماذا ستغير، وكيف، وما تحسن KPI المتوقع؟', hint: "Good operations proposals include: What to change + Who is responsible + Timeline + Measurable outcome. E.g., 'Reroute pick paths using WMS zone logic → reduce average pick time from 2.5 hrs to 1.5 hrs within 2 weeks.'", hintAr: 'مقترحات العمليات الجيدة تشمل: ماذا تغير + من المسؤول + الجدول الزمني + النتيجة القابلة للقياس.' },
        ],
      },
      {
        id: 'o2', title: 'Supply Chain Cost Reduction', titleAr: 'خفض تكاليف سلسلة التوريد',
        scenario: "You're the operations analyst at a fast-growing Egyptian food delivery startup. The CFO wants to reduce delivery costs by 20% in Q3 without cutting rider pay or delivery quality. You have 48 hours to propose a plan.",
        scenarioAr: 'أنت محلل العمليات في شركة توصيل طعام مصرية سريعة النمو. يريد المدير المالي تخفيض تكاليف التوصيل بنسبة 20% في الربع الثالث دون خفض أجور السائقين أو جودة التوصيل. لديك 48 ساعة لتقديم خطة.',
        xp: 140, badge: 'Cost Engineer', badgeAr: 'مهندس التكاليف', time: '40 min',
        steps: [
          { title: 'Break Down the Cost Structure', titleAr: 'حلّل هيكل التكاليف', type: 'multi', options: ['Rider idle time (waiting for orders)','Long delivery distances per order','Fuel costs per km','Vehicle maintenance overhead','Packaging material costs','Customer support costs (complaints)','Technology platform fees','Marketing cost per order'], hint: 'Focus on the 20% of costs that drive 80% of the total. In last-mile delivery, rider idle time and long distances are usually the biggest drivers. Start there.', hintAr: 'ركّز على 20% من التكاليف التي تولّد 80% من الإجمالي. في التوصيل الأخير، وقت الانتظار والمسافات الطويلة عادةً هي الأكبر.' },
          { title: 'Identify Your Top 3 Cost Levers', titleAr: 'حدد أهم 3 محركات للتكلفة', type: 'text', placeholder: 'For each lever:\n1. What is it?\n2. What % of total cost does it represent?\n3. How would you reduce it by how much?\n\nLever 1: ...\nLever 2: ...\nLever 3: ...', placeholderAr: 'لكل محرك:\n1. ما هو؟\n2. ما نسبته من إجمالي التكلفة؟\n3. كيف ستخفضه وبكم؟\n\nمحرك 1: ...\nمحرك 2: ...\nمحرك 3: ...', hint: 'Classic delivery cost levers: 1) Route optimization (GPS clustering reduces distance 15-25%), 2) Batching orders (1 rider, 2 orders = 50% cost split), 3) Dynamic pricing for peak hours (reduce demand spike).', hintAr: 'محركات التوصيل الكلاسيكية: 1) تحسين المسارات (15-25% تخفيض)، 2) تجميع الطلبات (راكب لطلبين = 50% توفير)، 3) التسعير الديناميكي لأوقات الذروة.' },
          { title: 'Write the 90-Day Action Plan', titleAr: 'اكتب خطة العمل لـ 90 يوماً', type: 'text', placeholder: 'Month 1 (Quick wins): ...\nMonth 2 (Medium-term): ...\nMonth 3 (Structural changes): ...\n\nExpected cost savings: EGP __ per month', placeholderAr: 'الشهر 1 (مكاسب سريعة): ...\nالشهر 2 (متوسط المدى): ...\nالشهر 3 (تغييرات هيكلية): ...\n\nالتوفير المتوقع: __ جنيه شهرياً', hint: "Structure your plan by time horizon: Quick wins (can be implemented in days, no tech required), Medium-term (need system changes or small investment), Structural (re-think the model — e.g., hub-and-spoke instead of direct delivery).", hintAr: 'هيكل الخطة حسب الأفق الزمني: مكاسب سريعة (أيام)، متوسط المدى (تغييرات نظام)، هيكلي (إعادة تفكير النموذج).' },
        ],
      },
    ],
  },
  {
    id: 'bizdev', label: 'Biz Dev', labelAr: 'تطوير الأعمال',
    color: '#F59E0B', icon: 'users',
    description: 'Close deals, write proposals, build partnerships',
    descriptionAr: 'أغلق الصفقات، اكتب المقترحات، ابنِ الشراكات',
    tasks: [
      {
        id: 'bd1', title: 'Partnership Proposal', titleAr: 'مقترح شراكة',
        scenario: "You work in business development at a growing Egyptian EdTech startup. Your CEO wants to explore a B2B partnership with Vodafone Egypt to bundle your app with their student mobile plans.",
        scenarioAr: 'تعمل في تطوير الأعمال في شركة تعليم إلكتروني مصرية ناشئة. رئيسك يريد شراكة B2B مع فودافون مصر لتجميع تطبيقك مع باقات المحمول الطلابية.',
        xp: 150, badge: 'Deal Maker', badgeAr: 'مغلق الصفقات', time: '50 min',
        steps: [
          { title: 'Define the Value for Vodafone', titleAr: 'حدد القيمة لفودافون', type: 'text', placeholder: "What does Vodafone get from this partnership? (Think: customer acquisition, differentiation, revenue, brand...)", placeholderAr: 'ماذا تستفيد فودافون من هذه الشراكة؟ (فكّر في: اكتساب عملاء، تمييز، إيراد، علامة...)', hint: "Frame it from THEIR perspective: 'Vodafone gains X because Y.' Partnerships work when both sides win clearly.", hintAr: "ضعها من منظورهم: 'فودافون تكسب X لأن Y.' الشراكات تنجح عندما يربح الطرفان بوضوح.", tutorials: bizdevTutorials },
          { title: 'Structure the Commercial Terms', titleAr: 'هيكل الشروط التجارية', type: 'multi', options: ['Revenue share (% per subscription)','Fixed monthly fee','Bundled data (free app data for users)','Co-marketing budget contribution','White-label integration','Performance-based milestones','Equity stake (partnership fund)'], hint: "Choose terms that are realistic for an early-stage startup negotiating with a large telco. Think: what can you offer that doesn't drain your cash?", hintAr: 'اختر شروطاً واقعية لشركة ناشئة في مرحلة مبكرة تتفاوض مع شركة اتصالات كبيرة.' },
          { title: 'Write the Opening Email', titleAr: 'اكتب رسالة البريد الأولى', type: 'text', placeholder: 'Subject: ...\n\nDear [Name],\n\n[Your cold outreach email — max 150 words]', placeholderAr: 'الموضوع: ...\n\nعزيزي [الاسم],\n\n[رسالتك الباردة — بحد أقصى 150 كلمة]', hint: "Formula: 1 sentence who you are + 1 sentence what you're proposing + 1 sentence why it benefits THEM + clear CTA (30-min call?). No fluff.", hintAr: 'الصيغة: جملة عن نفسك + جملة عمّا تقترح + جملة عن فائدتهم + دعوة للعمل واضحة.' },
        ],
      },
    ],
  },
  {
    id: 'hr', label: 'HR & Recruitment', labelAr: 'الموارد البشرية والتوظيف',
    color: '#EC4899', icon: 'users',
    description: 'Screen candidates, conduct interviews, build job descriptions',
    descriptionAr: 'فرز المرشحين، أجرِ المقابلات، ابنِ وصف الوظائف',
    tasks: [
      {
        id: 'hr1', title: 'Campus Recruitment Drive', titleAr: 'حملة التوظيف الجامعي',
        scenario: "You're the HR intern at a large bank. Your manager has asked you to design a campus recruitment plan to hire 20 fresh-graduate management trainees from Cairo's top 5 universities within the next 8 weeks.",
        scenarioAr: 'أنت متدرب الموارد البشرية في بنك كبير. مديرك طلب منك تصميم خطة توظيف جامعي لتعيين 20 خريجاً جديداً كمتدربين إداريين من أفضل 5 جامعات في القاهرة خلال 8 أسابيع.',
        xp: 120, badge: 'Talent Scout', badgeAr: 'صائد المواهب', time: '40 min',
        steps: [
          { title: 'Select Target Universities', titleAr: 'اختر الجامعات المستهدفة', type: 'multi', options: ['GUC — German International University','AUC — American University in Cairo','BUE — British University in Egypt','Cairo University','Ain Shams University','Alexandria University','MSA University'], hint: 'Pick universities with strong business programs whose graduates match the bank profile. Consider reputation, GPA distributions, and alumni performance.', hintAr: 'اختر جامعات ذات برامج أعمال قوية تتناسب مطلوباتها مع ملف البنك.', tutorials: hrTutorials },
          { title: 'Design the Screening Process', titleAr: 'صمّم عملية الفرز', type: 'text', placeholder: 'Describe each step: CV screening → Online test → ... → Final offer. Include who does each step and how long it takes.', placeholderAr: 'صف كل خطوة: فرز السير الذاتية → اختبار إلكتروني → ... → العرض النهائي. من يقوم بكل خطوة وكم تأخذ.', hint: 'Typical banking grad recruitment: CV screen (HR) → Aptitude test → HiPo assessment → 2 interviews (HR + Business) → Offer. Total: 4-6 weeks.', hintAr: 'توظيف البنوك النموذجي: فرز السير → اختبار القدرات → تقييم → مقابلتان → عرض.' },
          { title: 'Write the Job Description', titleAr: 'اكتب وصف الوظيفة', type: 'text', placeholder: "Write a job description for 'Management Trainee – Retail Banking'. Include: role summary, responsibilities, requirements, and benefits...", placeholderAr: "اكتب وصف وظيفة 'متدرب إداري – مصرفية التجزئة'. تضمّن: ملخص الدور، المسؤوليات، المتطلبات، الفوائد...", hint: 'Good JDs are honest, specific, and candidate-centric. Lead with what the candidate GAINS (learning, exposure, mentorship), not just what you want.', hintAr: 'وصف الوظيفة الجيد صادق ومحدد ومتمحور حول المرشح. ابدأ بما يكتسبه المرشح.' },
        ],
      },
    ],
  },
  {
    id: 'data', label: 'Data Analytics', labelAr: 'تحليل البيانات',
    color: '#06B6D4', icon: 'credit-card',
    description: 'Run SQL queries, build dashboards, extract business insights',
    descriptionAr: 'شغّل استعلامات SQL، ابنِ لوحات البيانات، استخلص الأفكار التجارية',
    tasks: [
      {
        id: 'da1', title: 'Sales Performance Dashboard', titleAr: 'لوحة أداء المبيعات',
        scenario: "You're the data analytics intern at an Egyptian e-commerce company. The Sales Director needs a weekly dashboard showing: revenue by region, top 10 products, and customer acquisition cost — to be ready by Monday morning.",
        scenarioAr: 'أنت متدرب تحليل البيانات في شركة تجارة إلكترونية مصرية. مدير المبيعات يحتاج لوحة أسبوعية تظهر: الإيراد حسب المنطقة، أفضل 10 منتجات، وتكلفة اكتساب العميل — جاهزة صباح الاثنين.',
        xp: 130, badge: 'Data Analyst', badgeAr: 'محلل بيانات', time: '45 min',
        steps: [
          { title: 'Define the Key Metrics', titleAr: 'حدد المؤشرات الرئيسية', type: 'multi', options: ['Revenue by Region (Cairo/Alex/Upper Egypt)','Top 10 Products by Revenue','Customer Acquisition Cost (CAC)','Average Order Value (AOV)','Conversion Rate','Return Rate','Monthly Active Users'], hint: 'Pick 4-5 metrics that tell a clear story about sales performance. Too many metrics confuse; too few hide problems.', hintAr: 'اختر 4-5 مؤشرات تروي قصة واضحة عن أداء المبيعات.', tutorials: dataTutorials },
          { title: 'Write the SQL Query for Top Products', titleAr: 'اكتب استعلام SQL لأفضل المنتجات', type: 'text', placeholder: 'Write a SQL query to get the top 10 products by total revenue this week:\n\nSELECT ...\nFROM ...\nWHERE ...\nGROUP BY ...\nORDER BY ...\nLIMIT 10', placeholderAr: 'اكتب استعلام SQL للحصول على أفضل 10 منتجات من حيث الإيراد هذا الأسبوع:', hint: 'You need: product_name, SUM(revenue) as total_revenue FROM orders_table WHERE order_date >= last 7 days GROUP BY product_name ORDER BY total_revenue DESC LIMIT 10.', hintAr: 'تحتاج: product_name, SUM(revenue) من جدول الطلبات WHERE آخر 7 أيام GROUP BY LIMIT 10.' },
          { title: 'Interpret the Results', titleAr: 'فسّر النتائج', type: 'text', placeholder: "Imagine the dashboard shows: Cairo = 65% revenue, Top product = iPhone cases (EGP 450K), CAC = EGP 85. What does this tell you? What would you recommend to the Sales Director?", placeholderAr: 'افترض أن اللوحة تظهر: القاهرة = 65% من الإيراد، المنتج الأول = حافظات iPhone (450K جنيه)، CAC = 85 جنيه. ماذا تعني؟ ما توصيتك لمدير المبيعات؟', hint: "Good data interpretation: 1) State what the data shows, 2) Infer why (hypothesis), 3) Recommend action. 'Cairo concentration suggests we're under-investing in Alexandria expansion.'", hintAr: 'تفسير البيانات الجيد: 1) ما تظهره البيانات، 2) لماذا (فرضية)، 3) التوصية.' },
        ],
      },
    ],
  },
  {
    id: 'consulting', label: 'Strategy Consulting', labelAr: 'الاستشارات الاستراتيجية',
    color: '#00A651', icon: 'bar-chart',
    description: 'Solve real client cases, build recommendations, present to C-suite',
    descriptionAr: 'حلّ حالات عملاء حقيقية، ابنِ التوصيات، قدّم للإدارة العليا',
    tasks: [
      {
        id: 'cs1', title: 'Client Case Decomposition', titleAr: 'تحليل قضية العميل',
        scenario: "You're a new analyst at a top consulting firm. Your client is a large Egyptian supermarket chain losing 3% in same-store sales for 6 months. The partner has asked you to structure the problem before tomorrow's client meeting.",
        scenarioAr: 'أنت محلل جديد في شركة استشارات كبرى. عميلك سلسلة سوبرماركت مصرية كبيرة تفقد 3% من مبيعاتها في المتاجر القائمة منذ 6 أشهر. الشريك يريدك أن تهيكل المشكلة قبل اجتماع العميل غداً.',
        xp: 160, badge: 'Case Cracker', badgeAr: 'محلل القضايا', time: '50 min',
        steps: [
          { title: 'Define the Problem Statement', titleAr: 'حدد بيان المشكلة', type: 'text', placeholder: 'Write a crisp 1-2 sentence problem statement. What is the core question the client needs answered?', placeholderAr: 'اكتب بيان مشكلة موجز في 1-2 جملة. ما السؤال الجوهري الذي يحتاج العميل إجابته؟', hint: 'A good problem statement is: Specific (not vague), outcome-focused (not activity-focused), and measurable. "Why are same-store sales declining 3% YoY and how can we reverse this within 12 months?"', hintAr: 'بيان المشكلة الجيد: محدد، يركز على النتيجة، وقابل للقياس.' },
          { title: 'Build Your Issue Tree', titleAr: 'ابنِ شجرة القضايا', type: 'multi', options: ['Customer volume decrease (fewer transactions)','Basket size decrease (less spent per visit)','Competitor opening nearby','Product mix issues (wrong SKUs)','Pricing too high vs. competition','Store experience deterioration','Macro factors (inflation, consumer spending)','Seasonal / timing effects'], hint: 'An issue tree breaks the problem into MECE (Mutually Exclusive, Collectively Exhaustive) branches. Revenue = Volume × Price. Volume = Transactions × Basket. Pick 3-4 most plausible hypotheses.', hintAr: 'شجرة القضايا تقسم المشكلة إلى فروع MECE. الإيراد = الحجم × السعر. اختر 3-4 فرضيات محتملة.' },
          { title: 'Prioritize Your Analysis', titleAr: 'رتّب أولويات التحليل', type: 'text', placeholder: 'Which hypothesis would you test first and why? What data would you ask the client for? What would prove or disprove your #1 hypothesis?', placeholderAr: 'أي فرضية ستختبر أولاً ولماذا؟ ما البيانات التي ستطلبها من العميل؟ ما الذي سيثبت أو ينفي فرضيتك الأولى؟', hint: "Prioritize by: 1) Impact (does solving this move the needle most?), 2) Feasibility (can we test this quickly with available data?). Start with transaction data split by day/hour/category.", hintAr: 'رتّب بحسب: 1) الأثر (هل حلّها يحرك المؤشرات أكثر؟)، 2) الجدوى (هل يمكننا اختبارها بسرعة؟).' },
          { title: 'Write the Opening Slide Hypothesis', titleAr: 'اكتب فرضية الشريحة الأولى', type: 'text', placeholder: 'Write a "So What?" hypothesis for your opening slide. Structure: "We believe [X] is happening because [Y]. If confirmed, the fix is [Z]."', placeholderAr: 'اكتب فرضية "ماذا يعني هذا؟" للشريحة الأولى. الهيكل: "نعتقد أن [X] يحدث لأن [Y]. إذا تأكد، الحل هو [Z]."', hint: 'Consultants call this a "ghost deck" hypothesis — you commit to a point of view before all data is in. This forces structured thinking and gives the client something concrete to react to.', hintAr: 'الاستشاريون يسمون هذا فرضية "المجموعة الشبحية" — تلتزم بوجهة نظر قبل اكتمال البيانات.' },
        ],
      },
      {
        id: 'cs2', title: 'Strategic Recommendation Deck', titleAr: 'عرض التوصية الاستراتيجية',
        scenario: "You're presenting to the CEO of a mid-size Egyptian logistics company. They want to expand into last-mile delivery for e-commerce. Your analysis shows 3 strategic options. You have 10 minutes to present your recommendation.",
        scenarioAr: 'تقدّم للرئيس التنفيذي لشركة لوجستية مصرية متوسطة. يريدون التوسع في توصيل المرحلة الأخيرة للتجارة الإلكترونية. تحليلك يظهر 3 خيارات استراتيجية. لديك 10 دقائق لتقديم توصيتك.',
        xp: 180, badge: 'Strategy Advisor', badgeAr: 'مستشار استراتيجي', time: '55 min',
        steps: [
          { title: 'Evaluate the 3 Strategic Options', titleAr: 'قيّم الخيارات الاستراتيجية الثلاثة', type: 'text', placeholder: 'Option A: Build in-house (full control, high cost, 18 months)\nOption B: Acquire competitor (fast, EGP 80M cost)\nOption C: Partner with Aramex/Bosta (low risk, less margin)\n\nFor each: What are the pros, cons, and key risks?', placeholderAr: 'خيار أ: بناء داخلي (تحكم كامل، تكلفة عالية، 18 شهراً)\nخيار ب: استحواذ على منافس (سريع، 80 مليون جنيه)\nخيار ج: شراكة مع Aramex/Bosta (مخاطر منخفضة، هامش أقل)\n\nلكل خيار: الإيجابيات والسلبيات والمخاطر الرئيسية.', hint: 'Evaluate each option against: Cost, Speed to market, Risk level, Strategic fit, Reversibility. Use a simple 3x3 scoring matrix if helpful.', hintAr: 'قيّم كل خيار وفق: التكلفة، السرعة، مستوى المخاطر، الملاءمة الاستراتيجية، قابلية التراجع.' },
          { title: 'State Your Recommendation', titleAr: 'أعلن توصيتك', type: 'multi', options: ['Option A: Build in-house','Option B: Acquire a competitor','Option C: Strategic partnership','Hybrid: Partner first, acquire later','Hybrid: Build tech + partner for ops','No expansion — focus on core business first'], hint: 'Pick ONE clear recommendation. Great consulting advice is decisive. Hedging ("it depends") without a clear recommendation loses credibility. Explain the 2-3 most critical reasons.', hintAr: 'اختر توصية واحدة واضحة. الاستشارات الجيدة حاسمة. التهرب بـ"يعتمد" دون توصية واضحة يفقدك المصداقية.' },
          { title: 'Anticipate Objections', titleAr: 'توقّع الاعتراضات', type: 'text', placeholder: "The CEO will likely push back. Write how you'd handle: 'What if the partner goes with a competitor?' and 'Can we really afford 18 months of wait?'", placeholderAr: 'الرئيس التنفيذي سيرفض. اكتب كيف ستتعامل مع: "ماذا لو ذهب الشريك لمنافس؟" و"هل نستطيع الانتظار 18 شهراً؟"', hint: 'Handle objections with data + confidence. "That risk is real — here is how we mitigate it: [X]. The cost of waiting 18 months is estimated at EGP Y in lost market share, which is less than the acquisition premium."', hintAr: 'تعامل مع الاعتراضات بالبيانات والثقة. "هذا الخطر حقيقي — إليك كيف نخففه: [X]."' },
        ],
      },
    ],
  },
  {
    id: 'tech', label: 'Technology & Product', labelAr: 'التكنولوجيا والمنتج',
    color: '#6366F1', icon: 'monitor',
    description: 'Design products, write technical specs, solve engineering trade-offs',
    descriptionAr: 'صمّم منتجات، اكتب المواصفات التقنية، حلّ مقايضات هندسية',
    tasks: [
      {
        id: 'tp1', title: 'Product Requirements Document', titleAr: 'وثيقة متطلبات المنتج',
        scenario: "You're a junior product manager at a growing Egyptian fintech startup. The CEO wants to add a 'Pay Later' (BNPL) feature to the app. You need to write the PRD that the engineering team will use to build it.",
        scenarioAr: 'أنت مدير منتجات مبتدئ في شركة تقنية مالية مصرية ناشئة. الرئيس التنفيذي يريد إضافة ميزة "اشتر الآن وادفع لاحقاً" للتطبيق. تحتاج لكتابة وثيقة متطلبات المنتج التي سيستخدمها الفريق الهندسي.',
        xp: 150, badge: 'Product Thinker', badgeAr: 'مفكر المنتج', time: '50 min',
        steps: [
          { title: 'Define the Target User & Problem', titleAr: 'حدد المستخدم المستهدف والمشكلة', type: 'text', placeholder: 'Who exactly is this for? What problem does BNPL solve for them? Write a 2-3 sentence user problem statement.', placeholderAr: 'لمن هذه الميزة بالضبط؟ ما المشكلة التي يحلها "اشتر الآن وادفع لاحقاً" لهم؟ اكتب بيان مشكلة المستخدم في 2-3 جمل.', hint: 'Think about Egyptian 25-35 year olds shopping online who want to buy EGP 3,000+ items (electronics, furniture) but lack the cash upfront. The problem: high-ticket purchases are blocked by liquidity, not desire.', hintAr: 'فكّر في المصريين من 25-35 عاماً الذين يتسوقون عبر الإنترنت ويريدون شراء منتجات بأكثر من 3,000 جنيه لكن يفتقرون للسيولة الفورية.' },
          { title: 'Write the Key User Stories', titleAr: 'اكتب قصص المستخدم الرئيسية', type: 'text', placeholder: 'Write 3 user stories in the format: "As a [user], I want to [action], so that [benefit]."\n\nUS1: As a ...\nUS2: As a ...\nUS3: As a ...', placeholderAr: 'اكتب 3 قصص مستخدم بالصيغة: "كـ[مستخدم]، أريد [فعل]، حتى [فائدة]."\n\nقصة 1: كـ...\nقصة 2: كـ...\nقصة 3: كـ...', hint: 'Examples: "As a shopper, I want to split my EGP 4,500 purchase into 3 monthly installments so I can buy the laptop I need without waiting." Keep each story focused on one specific need.', hintAr: 'أمثلة: "كمتسوق، أريد تقسيم مشترياتي على 3 أقساط شهرية حتى أتمكن من شراء ما أحتاجه دون انتظار."' },
          { title: 'Identify Technical Risks & Trade-offs', titleAr: 'حدد المخاطر التقنية والمقايضات', type: 'multi', options: ['Credit scoring / underwriting complexity','Integration with Egypt\'s CIB/ISETS credit bureau','Fraud & identity verification','Regulatory (FRA approval for BNPL)','Merchant integration API complexity','User experience — too many steps in checkout','Interest rate disclosure requirements','Cash flow / capital requirements for the startup'], hint: "BNPL in Egypt requires FRA licensing. Credit scoring is the hardest technical problem — you can't underwrite without credit history data. Identify the 3 risks you'd flag to engineering on Day 1.", hintAr: 'BNPL في مصر يتطلب ترخيصاً من الهيئة. تقييم الائتمان هو المشكلة التقنية الأصعب — لا يمكنك الاكتتاب بدون تاريخ ائتماني.' },
          { title: 'Define Success Metrics', titleAr: 'حدد مقاييس النجاح', type: 'text', placeholder: 'What are your 3 key success metrics for the first 6 months? How will you know BNPL is working?\n\nMetric 1: ...\nMetric 2: ...\nMetric 3: ...', placeholderAr: 'ما هي مقاييسك الثلاثة الرئيسية للنجاح في الأشهر الستة الأولى؟ كيف ستعرف أن BNPL يعمل؟\n\nمقياس 1: ...\nمقياس 2: ...\nمقياس 3: ...', hint: "Strong PM metrics tie business outcomes to feature usage. Examples: 1) BNPL adoption rate (target: 15% of eligible transactions), 2) Default rate (target: <3%), 3) Average order value lift (+40% vs non-BNPL), 4) NPS delta for BNPL users.", hintAr: 'المقاييس الجيدة تربط نتائج الأعمال باستخدام الميزة. أمثلة: معدل تبني BNPL، معدل التعثر، ارتفاع متوسط قيمة الطلب.' },
        ],
      },
      {
        id: 'tp2', title: 'Technical Architecture Decision', titleAr: 'قرار البنية التقنية',
        scenario: "You're the lead developer at a Cairo-based SaaS startup. The CTO just left. You need to decide: do you migrate the monolithic PHP app to microservices, or scale it vertically? The team has 3 engineers and a June launch deadline.",
        scenarioAr: 'أنت المطور الرئيسي في شركة SaaS بالقاهرة. غادر المدير التقني للتو. عليك أن تقرر: هل تهاجر التطبيق الأحادي PHP إلى الخدمات المصغرة، أم تحسّنه عمودياً؟ الفريق 3 مهندسين والموعد يونيو.',
        xp: 140, badge: 'Tech Architect', badgeAr: 'مهندس بنية', time: '45 min',
        steps: [
          { title: 'Analyze the Trade-offs', titleAr: 'حلّل المقايضات', type: 'text', placeholder: 'List the pros and cons of each approach:\n\nOption 1 - Microservices migration:\nPros: ...\nCons: ...\n\nOption 2 - Vertical scaling (optimize monolith):\nPros: ...\nCons: ...', placeholderAr: 'اسرد إيجابيات وسلبيات كل نهج:\n\nالخيار 1 - الهجرة للخدمات المصغرة:\nإيجابيات: ...\nسلبيات: ...\n\nالخيار 2 - التحسين العمودي:\nإيجابيات: ...\nسلبيات: ...', hint: 'Microservices: great for scale, terrible for small teams with tight deadlines. Monolith: simpler, faster to ship, easier to debug. Martin Fowler says: "Don\'t start with microservices." 3 engineers + June deadline = probably not the time to refactor architecture.', hintAr: 'الخدمات المصغرة: رائعة للتوسع، سيئة لفرق صغيرة مع مواعيد ضيقة. مارتن فاولر يقول: "لا تبدأ بالخدمات المصغرة."' },
          { title: 'Make Your Decision', titleAr: 'اتخذ قرارك', type: 'multi', options: ['Migrate to microservices now (before June)','Optimize monolith + scale vertically for now, revisit in Q4','Partial refactor: extract only the 2 most bottlenecked services','Containerize the monolith (Docker) without full microservices','Hire a new CTO before making this decision','Delay launch to properly migrate architecture'], hint: "The right answer considers BOTH technical excellence AND business context. A technically perfect migration that causes a launch delay can kill a startup. What serves the company best RIGHT NOW?", hintAr: 'الجواب الصحيح يأخذ في الاعتبار كل من التميز التقني وسياق الأعمال. الهجرة الكاملة قد تؤخر الإطلاق وتقتل الشركة الناشئة.' },
          { title: 'Write the Technical Brief', titleAr: 'اكتب الموجز التقني', type: 'text', placeholder: 'Write a 3-4 sentence technical decision brief for the CEO. Include: your recommendation, why, and what it means for the June deadline.', placeholderAr: 'اكتب موجزاً تقنياً من 3-4 جمل للرئيس التنفيذي. تضمّن: توصيتك، السبب، وماذا يعني ذلك لموعد يونيو.', hint: "CEO-friendly format: 'We recommend [X] because [2 business reasons]. This means we will [concrete action] by [date], and [June launch is/is not affected] because [explanation].'", hintAr: 'صيغة صديقة للرئيس التنفيذي: "نوصي بـ[X] لأن [سببان تجاريان]. هذا يعني أننا سنقوم بـ[إجراء] بحلول [تاريخ]."' },
        ],
      },
    ],
  },
]
