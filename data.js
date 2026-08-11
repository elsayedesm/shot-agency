// SHOT Marketing Agency - Centralized State & Dictionary Data Store

export const initialData = {
  hero: {
    en: {
      badge: "🚀 LEADING DIGITAL MARKETING AGENCY",
      title: "WE SHOT YOUR BRAND TO THE MOON",
      subtitle: "Data-driven performance marketing, high-impact video production, and viral social media campaigns built for explosive brand growth.",
      primaryCta: "Explore Portfolio",
      secondaryCta: "Book a Consultation"
    },
    ar: {
      badge: "🚀 وكالة التسويق الرقمي الأولى والرواد في الإبداع",
      title: "نطلق علامتك التجارية نحو القمة والتفوق",
      subtitle: "تسويق إبداعي قائم على تحليل البيانات، إعلانات عالية التحويل، وإنتاج فيديوهات واسعة الانتشار لصناعة نمو استثنائي لعلامتك التجارية.",
      primaryCta: "استعرض أعمالنا",
      secondaryCta: "احجز استشارة مجانية"
    },
    stats: [
      { id: "s1", number: "+150", labelEn: "Campaigns Launched", labelAr: "حملة تسويقية ناجحة" },
      { id: "s2", number: "+380%", labelEn: "Average ROI Boost", labelAr: "متوسط زيادة العائد" },
      { id: "s3", number: "25M+", labelEn: "Total Ad Reach", labelAr: "وصول الإعلانات" },
      { id: "s4", number: "18", labelEn: "Industry Awards", labelAr: "جائزة إبداعية" }
    ]
  },

  about: {
    en: {
      tag: "ABOUT SHOT AGENCY",
      title: "We Turn Bold Ideas Into Viral Commercial Success",
      description: "SHOT is a full-service creative marketing agency born to redefine how modern brands communicate, convert, and scale. We combine cutting-edge visual storytelling with ruthless digital ad strategy to dominate market attention.",
    },
    ar: {
      tag: "عن وكالة SHOT",
      title: "نحول الأفكار الجريئة إلى نجاحات تسويقية ساحقة",
      titleSuffix: "",
      description: "وكالة SHOT هي وكالة تسويق متكاملة تأسست لتعيد تعريف كيفية تواصل العلامات التجارية الحديثة وتحقيق أعلى نسب مبيعات. نجمع بين السرد البصري المبتكر وإستراتيجيات الإعلانات المدفوعة للسيطرة على السوق.",
    },
    services: [
      {
        id: "srv1",
        icon: "Megaphone",
        titleEn: "Performance Ads",
        titleAr: "الإعلانات الممولة عالية التحويل",
        descEn: "ROI-driven campaign execution across Meta, TikTok, Google Ads, and Snapchat.",
        descAr: "حملات إعلانية عالية العائد عبر فيسبوك، انستجرام، تيك توك، جوجل وسناب شات."
      },
      {
        id: "srv2",
        icon: "Video",
        titleEn: "Media & Video Production",
        titleAr: "إنتاج الفيديوهات والإعلانات",
        descEn: "High-end cinematic commercials, Reels, and TikTok short-form viral video content.",
        descAr: "إنتاج إعلانات تجارية سينمائية وفيديوهات ريلز وتيك توك قصيرة واسعة الانتشار."
      },
      {
        id: "srv3",
        icon: "Share2",
        titleEn: "Social Media Growth",
        titleAr: "إدارة وتكبير منصات التواصل",
        descEn: "Full-page management, content calendar creation, graphic design, and community strategy.",
        descAr: "إدارة كاملة للصفحات، تصميم المحتوى البصري، الجدولة، والتفاعل التكتيكي مع الجمهور."
      },
      {
        id: "srv4",
        icon: "Palette",
        titleEn: "Brand Identity Design",
        titleAr: "تصميم الهوية البصرية للعلامات",
        descEn: "Crafting memorable visual brands, packaging, design guidelines, and logo creation.",
        descAr: "بناء هويات بصرية مبتكرة، لوجوهات، أدلة الهوية، والتغليف المميز للشركات."
      },
      {
        id: "srv5",
        icon: "Search",
        titleEn: "SEO & Content Marketing",
        titleAr: "تحسين محركات البحث SEO",
        descEn: "Dominate search engines organically and capture qualified commercial traffic.",
        descAr: "تصدر نتائج محركات البحث جوجل مجاناً وجلب زوار مستهدفين ومستعدين للشراء."
      },
      {
        id: "srv6",
        icon: "TrendingUp",
        titleEn: "Influencer Campaigns",
        titleAr: "تسويق المؤثرين والمشاهير",
        descEn: "Partnering your brand with vetted creators to unlock trust and rapid conversions.",
        descAr: "ربط علامتك التجارية بأبرز صناع المحتوى والمؤثرين لتحقيق ثقة فورية ومبيعات."
      }
    ]
  },

  works: [
    {
      id: "w1",
      category: "video",
      titleEn: "Neon Velocity Commercial",
      titleAr: "إعلان تجاري لشركة سرعة النيون",
      clientEn: "Velocity Motors",
      clientAr: "فيلوسيتي موتورز",
      image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      summaryEn: "A high-octane 4K TV commercial campaign boosting test-drive inquiries by 310%.",
      summaryAr: "إعلان سينمائي 4K بدقة عالية أدى لزيادة حجز تجارب القيادة بنسبة 310%.",
      metricsEn: "+310% Leads | 4.2M Views",
      metricsAr: "+310% عملاء محتملين | 4.2 مليون مشاهدة",
      detailsEn: "Designed complete storyboard, RED 8K camera shooting, VFX animations, and targeted YouTube Bumper Ads strategy.",
      detailsAr: "قمنا بكتابة السيناريو، التصوير بريد 8K، إضافة المؤثرات البصرية وتوجيه الحملة الإعلانية على يوتيوب."
    },
    {
      id: "w2",
      category: "ads",
      titleEn: "Aura Cosmetics E-Commerce Scaling",
      titleAr: "مضاعفة مبيعات متجر أورا للتجميل",
      clientEn: "Aura Beauty Co.",
      clientAr: "أورا لمنتجات التجميل",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      summaryEn: "Scaled monthly revenue from $40k to $290k using UGC TikTok Ads & Meta Retargeting.",
      summaryAr: "زيادة الإيرادات الشهرية من 40 ألف إلى 290 ألف دولار عبر إعلانات تيك توك وفيسبوك.",
      metricsEn: "$290k Monthly Revenue | 5.4x ROAS",
      metricsAr: "290$ ألف إيراد شهري | عائد 5.4x",
      detailsEn: "Created 45+ UGC video variations, built automated WhatsApp funnels, and optimized landing page conversions.",
      detailsAr: "إنتاج أكثر من 45 فيديو إعلاني مع صناع محتوى، وبناء مسارات تحويل تلقائية لزيادة المبيعات."
    },
    {
      id: "w3",
      category: "branding",
      titleEn: "CyberBite Cloud Kitchen Rebrand",
      titleAr: "إعادة بناء الهوية لكلاود كيتشن سايبر بايت",
      clientEn: "CyberBite Foods",
      clientAr: "سلسلة مطاعم سايبر بايت",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      summaryEn: "Complete brand overhaul, futuristic packaging design, and viral launch campaign.",
      summaryAr: "إعادة هيكلة الهوية البصرية كاملة، تصميم التغليف المستقبلي وحملة تدشين واسعة.",
      metricsEn: "12 New Franchise Locations",
      metricsAr: "افتتاح 12 فرعاً جديداً",
      detailsEn: "Modern neon aesthetic logo system, packaging engineering, menu photography, and grand opening social buzz.",
      detailsAr: "تصميم شعار نيوني عصري، علب التغليف، تصوير الأطباق، وحملة إعلامية للافتتاح."
    },
    {
      id: "w4",
      category: "social",
      titleEn: "Apex Fitness App 1M Members Campaign",
      titleAr: "حملة تطبيق آبيكس لفيتنس (مليون مشترك)",
      clientEn: "Apex Global",
      clientAr: "تطبيق آبيكس للرياضة",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      summaryEn: "Generated over 1,000,000 active app downloads across MENA region in 90 days.",
      summaryAr: "تحقيق أكثر من 1,000,000 تحميل للتطبيق في الشرق الأوسط خلال 90 يوماً فقط.",
      metricsEn: "1.2M Downloads | #1 Store Rank",
      metricsAr: "1.2M تحميل | المرتبة الأولى بالمتاجر",
      detailsEn: "Fitness micro-influencers network, challenge hashtag creation, performance Meta app install ads.",
      detailsAr: "إدارة شبكة من 80 مؤثر رياضي، إطلاق هاشتاج تحدي تيك توك، وإعلانات تثبيت التطبيق."
    },
    {
      id: "w5",
      category: "ads",
      titleEn: "Vertex Real Estate Luxury Launches",
      titleAr: "إطلاق المجمعات السكنية الفاخرة لـ فيرتكس",
      clientEn: "Vertex Developments",
      clientAr: "فيرتكس للتطوير العقاري",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      summaryEn: "Sold out $18M compound phase within 14 days using Google Search & Instagram VIP Ads.",
      summaryAr: "بيع مرحلة سكنية بقيمة 18 مليون دولار خلال 14 يوماً عبر إعلانات جوجل وانستجرام.",
      metricsEn: "$18M Inventory Sold Out",
      metricsAr: "بيع بالكامل بقيمة 18$ مليون",
      detailsEn: "3D virtual tour video ads, ultra-high-net-worth customer profiling, lead qualification automation.",
      detailsAr: "إعلانات الجولات الافتراضية ثلاثية الأبعاد، واستخلاص بيانات كبار العملاء المستهدفين."
    },
    {
      id: "w6",
      category: "branding",
      titleEn: "FinPulse NeoBank Brand Creation",
      titleAr: "تأسيس هوية بنك فين بلس الرقمي",
      clientEn: "FinPulse Global",
      clientAr: "بنك فين بلس",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      summaryEn: "Designing a sleek fintech identity for Gen-Z and millennial digital banking users.",
      summaryAr: "تصميم هوية مالية عصرية لبنك رقمي يستهدف جيل الشباب والمبتكرين.",
      metricsEn: "+250k Waiting List Signups",
      metricsAr: "+250 ألف مسجل في قائمة الانتظار",
      detailsEn: "UI/UX design system, debit card metallic foil design, social brand voice guidelines.",
      detailsAr: "نظام التصميم الرقمي للتطبيق، تصميم بطاقات الصراف الآلي المعدنية، ودليل لغة العلامة."
    }
  ],

  clients: [
    { id: "c1", name: "VELOCITY MOTORS" },
    { id: "c2", name: "AURA BEAUTY" },
    { id: "c3", name: "CYBERBITE" },
    { id: "c4", name: "APEX FITNESS" },
    { id: "c5", name: "VERTEX REAL ESTATE" },
    { id: "c6", name: "FINPULSE BANK" },
    { id: "c7", name: "LUMEN PHARMA" },
    { id: "c8", name: "NOVA COFFEE" }
  ],

  testimonials: [
    {
      id: "t1",
      nameEn: "Faris Al-Otaibi",
      nameAr: "فارس العتيبي",
      roleEn: "CEO, Velocity Motors",
      roleAr: "الرئيس التنفيذي، فيلوسيتي موتورز",
      quoteEn: "SHOT Agency completely revolutionized our digital presence. Their video production quality is Hollywood-level, and the ad campaign ROI exceeded all expectations!",
      quoteAr: "وكالة SHOT غيرت تواجدنا الرقمي بالكامل. جودة إنتاج الفيديوهات لديهم بمستوى سينمائي عالمي، وعائد الإعلانات تجاوز كل توقعاتنا!",
      rating: 5
    },
    {
      id: "t2",
      nameEn: "Sarah Jenkins",
      nameAr: "سارة جينكينز",
      roleEn: "CMO, Aura Cosmetics",
      roleAr: "مديرة التسويق، أورا للتجميل",
      quoteEn: "Working with SHOT feels like having a hyper-dedicated growth team. They scaled our store revenue 5x in less than four months. Absolutely incredible execution!",
      quoteAr: "العمل مع SHOT يشبه امتلاك فريق نمو فائق الشغف. ضاعفوا مبيعات متجرنا 5 مرات خلال أقل من 4 أشهر. تنفيذ خيالي ومحترف!",
      rating: 5
    },
    {
      id: "t3",
      nameEn: "Eng. Ahmed Mansour",
      nameAr: "م. أحمد منصور",
      roleEn: "Managing Director, Vertex Developments",
      roleAr: "العضو المنتدب، فيرتكس للتطوير",
      quoteEn: "The speed at which they generated qualified real estate buyers was astonishing. Sold out our compound phase in 2 weeks flat!",
      quoteAr: "السرعة التي جلبوا بها المشتريين المباشرين لطلب العقارات كانت مذهلة! تم بيع كامل المرحلة في أسبوعين فقط!",
      rating: 5
    }
  ],

  plans: [
    {
      id: "p1",
      nameEn: "STARTER LAUNCH",
      nameAr: "باقة الانطلاق",
      popular: false,
      featuresEn: [
        "Manage 2 Main Social Platforms",
        "12 High-Quality Designed Posts",
        "4 Short Reels / TikTok Videos",
        "Basic Paid Ads Management ($1k Spend)",
        "Monthly ROI Performance Report",
        "Dedicated Account Executive"
      ],
      featuresAr: [
        "إدارة منصتين على التواصل الاجتماعي",
        "12 تصميم احترافي منشور",
        "4 فيديوهات ريلز / تيك توك قصيرة",
        "إدارة إعلانات ممولة (إنفاق حتى 1000$)",
        "تقرير أداء ونتائج شهري",
        "مدير حساب مخصص لمشروعك"
      ]
    },
    {
      id: "p2",
      nameEn: "GROWTH SCALE",
      nameAr: "باقة النمو والتوسع",
      popular: true,
      featuresEn: [
        "Manage 4 Social Platforms",
        "24 Custom Designed Posts / Stories",
        "8 Cinematic Shorts & Reels",
        "Advanced Multi-Channel Meta & TikTok Ads",
        "A/B Landing Page Copywriting & Funnels",
        "Weekly Strategy Meetings & 24/7 Priority Support"
      ],
      featuresAr: [
        "إدارة 4 منصات تواصل اجتماعي",
        "24 تصميم بوست وستوري مبتكر",
        "8 فيديوهات ريلز وسينمائية واسعة الانتشار",
        "حملات ممولة متطورة فيسبوك، تيك توك وجوجل",
        "كتابة نصوص صفحات الهبوط وتصميم مسارات التحويل",
        "اجتماعات استراتيجية أسبوعية ودعم أولوية"
      ]
    },
    {
      id: "p3",
      nameEn: "DOMINANCE ENTERPRISE",
      nameAr: "باقة السيطرة الكاملة",
      popular: false,
      featuresEn: [
        "Omnichannel Total Brand Takeover",
        "Unlimited High-Converting Graphics",
        "16 Commercial 4K Videos & Reels",
        "Full Influencer Network & PR Campaigns",
        "Full SEO Domination & Google Ads Scaling",
        "On-Site Shooting Crew & Full Creative Studio"
      ],
      featuresAr: [
        "إدارة وتغطية شاملة لكافة المنصات والموقع",
        "تصاميم جرافيك غير محدودة عالية التحويل",
        "16 فيديو إعلاني وسينمائي 4K شهرياً",
        "حملات مؤثرين وعلاقات عامة وتغطية صحفية",
        "تصدر محركات البحث وجوجل بالكامل",
        "طاقم تصوير ميداني مع استديو كامل مخصص"
      ]
    }
  ],

  messages: [
    {
      id: "msg-101",
      name: "Khaled Abdullah",
      email: "khaled@example.com",
      phone: "+966 50 123 4567",
      service: "Performance Ads",
      budget: "$5,000 - $10,000",
      message: "Hello SHOT team! We want to scale our e-commerce store sales for the upcoming Ramdan season. Need a quote.",
      date: "2026-07-31 14:20",
      read: false
    },
    {
      id: "msg-102",
      name: "Reem Al-Ghamdi",
      email: "reem@fashionbrand.com",
      phone: "+966 55 987 6543",
      service: "Media & Video Production",
      budget: "$10,000+",
      message: "We need 5 commercial videos produced for our new fashion line launch next month.",
      date: "2026-07-30 09:15",
      read: true
    }
  ],

  settings: {
    agencyName: "SHOT Marketing Agency",
    contactEmail: "info@shotagency.com",
    contactPhone: "+966 50 000 7468",
    officeAddressEn: "King Fahd Road, Business Tower 14, Riyadh, Saudi Arabia",
    officeAddressAr: "شارع الجيش، برج العاصمة، طنطا، الغربية، مصر",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
    whatsapp: "https://wa.me/966500007468"
  }
};
