فيما يلي **المخطط التقني النهائي (Final Technical Blueprint)** الذي سيسلم مباشرة لفريق التطوير للبدء بالتنفيذ.

---

### 🏗️ أولاً: هيكلية المشروع النهائية (Modular Monolith - Next.js App Router)
تم تصميم هذه الهيكلية لتطبيق مبادئ **Clean Architecture** و **Feature-Sliced Design** داخل مستودع واحد (Monorepo)، مما يضمن فصل الاهتمامات (Separation of Concerns)، سهولة الصيانة، والتوسع المستقبلي.

```text
mystic-egypt-platform/
├── prisma/
│   ├── schema.prisma         # تعريف قاعدة البيانات والعلاقات (انظر القسم الثالث أدناه)
│   ├── migrations/           # سجل تغييرات قاعدة البيانات
│   └── seed.ts               # بيانات أولية (Admin user, Sample Tours)
├── public/
│   ├── locales/              # ملفات الترجمة (ar.json, en.json, de.json) لـ react-i18next
│   └── uploads/              # مجلد التخزين المحلي للصور والإيصالات (VPS Local Storage)
├── src/
│   ├── app/                  # طبقة التوجيه (Routing Layer) فقط - لا منطق أعمال هنا
│   │   ├── (public)/         # الصفحة الرئيسية، صفحات الرحلات (SSG)
│   │   ├── (auth)/           # تسجيل الدخول، التسجيل، استعادة كلمة المرور
│   │   ├── (dashboard)/      # لوحة تحكم العميل (SSR, محمية)
│   │   ├── (admin)/          # لوحة تحكم المدير (SSR, محمية، تتطلب 2FA)
│   │   ├── api/              # Next.js Route Handlers (تفوض المنطق للـ features)
│   │   ├── layout.tsx        # التخطيط العام (يحتوي على i18n Provider, Toaster)
│   │   └── globals.css       # إعدادات Tailwind CSS الأساسية
│   ├── features/             # القلب النابض للمشروع (Modular Business Logic)
│   │   ├── auth/             # (مكونات، Actions، قواعد المصادقة و OTP)
│   │   ├── booking/          # (منطق الحجز، سياسة الإلغاء، رفع الإيصالات)
│   │   ├── tour/             # (عرض الرحلات، خط السير، الخرائط)
│   │   └── invoice/          # (مكونات توليد PDF باستخدام @react-pdf/renderer)
│   ├── core/                 # الطبقة الأساسية المشتركة (Framework Agnostic)
│   │   ├── api/              # مركزية استدعاءات الـ API و Endpoints
│   │   ├── constants/        # الثوابت (أدوار المستخدمين، سياسات الإلغاء، العملات)
│   │   ├── lib/              # إعدادات المكتبات (Prisma Client, Resend, NextAuth, i18n)
│   │   └── utils/            # دوال مساعدة نقية (تنسيق التواريخ، العملات، التحقق)
│   └── shared/               # مكونات واجهة المستخدم المعاد استخدامها (shadcn/ui)
│       ├── components/       # Button, Input, Dialog, Table, Calendar
│       └── hooks/            # Custom Hooks مشتركة (مثل useDebounce)
├── .env.example              # متغيرات البيئة المطلوبة (قالب للفريق)
├── next.config.js            # إعدادات Next.js (تحسين الصور، Headers الأمان)
├── tailwind.config.ts        # إعدادات Tailwind و shadcn/ui
└── package.json              # الاعتماديات (Dependencies)
```

---

### ⚙️ ثانياً: القواعد التقنية الصارمة (No Ambiguity Rules)

#### 1. إدارة الحالة (State Management) - الخيار الأقل تعقيداً والأكثر كفاءة
* **حالة الخادم (Server State):** استخدام **TanStack Query (React Query)**. هو المعيار الذهبي لجلب البيانات، التخزين المؤقت (Caching)، وإعادة المحاولة. يلغي الحاجة لكتابة `useEffect` معقد لجلب البيانات.
* **حالة العميل (Client State):** استخدام **Zustand**. خفيف جداً، لا يتطلب `Context Provider` معقد، ومثالي لحالات مثل: حالة سلة التسوق (Cart)، فتح/إغلاق القوائم الجانبية، أو بيانات نموذج متعدد الخطوات (Wizard).

#### 2. مركزية عناوين الـ API (Strict API Endpoint Management)
ممنوع كتابة الروابط كنصوص حرفية (Hardcoded Strings) في أي مكان. يجب استخدام ملف مركزي:
```typescript
// src/core/api/endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REQUEST_OTP: '/api/auth/request-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
  },
  TOURS: {
    LIST: '/api/tours',
    BY_SLUG: (slug: string) => `/api/tours/${slug}`,
  },
  BOOKINGS: {
    CREATE: '/api/bookings',
    UPLOAD_RECEIPT: (id: string) => `/api/bookings/${id}/receipt`,
  }
} as const;
```

#### 3. معالجة رفع الملفات (File Uploads on VPS)
بما أن التخزين محلي على الـ VPS وممنوع استخدام CDN:
* سيتم استخدام واجهة `FormData` الأصلية في Next.js App Router (لا حاجة لمكتبة `multer` الثقيلة، Next.js يدعم ذلك أصلاً).
* يتم حفظ الملفات في المجلد `public/uploads/` مع إعادة تسمية الملف باستخدام `crypto.randomUUID()` لمنع تعارض الأسماء.
* **قاعدة أمان:** يجب التحقق من نوع الملف (MIME Type) وحجمه (Max 5MB للإيصالات) في الـ Server Action قبل الحفظ.

#### 4. توليد الفواتير (PDF Generation)
* سيتم إنشاء مكون React مخصص داخل `src/features/invoice/components/InvoicePDF.tsx` باستخدام `@react-pdf/renderer`.
* يتم استدعاؤه داخل لوحة تحكم العميل كـ Client Component، حيث يقوم بتوليد الـ PDF في المتصفح (Browser-side) للسماح للمستخدم بتحميله فوراً دون إحمال خادم الـ Backend.

#### 5. تحسين محركات البحث والأداء (SEO & Performance)
* صفحات `(public)` يجب أن تستخدم `export const dynamic = 'force-static'` (أو SSG الافتراضي) مع `revalidate` لضمان سرعة تحميل أقل من 2 ثانية.
* استخدام مكون `<Image />` من Next.js حصرياً لجميع الصور، مع تحديد `width` و `height` لتجنب Cumulative Layout Shift (CLS).

---

### 🗄️ ثالثاً: مخطط قاعدة البيانات المبدئي (Prisma Schema)
هذا المخطط مبني حرفياً على القسم 7 من وثيقة PRD، مع إضافة العلاقات (Relations) والأنواع (Enums) الضرورية لضمان سلامة البيانات.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql" // MariaDB compatible
  url      = env("DATABASE_URL")
}

// --- Enums ---
enum Role {
  CLIENT
  ADMIN
}

enum BookingStatus {
  PENDING_PAYMENT
  PENDING_RECEIPT_REVIEW
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum Currency {
  USD
  GBP
  EUR
}

// --- Models ---
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password_hash String?   // Nullable because OTP users might not have a password initially
  role          Role      @default(CLIENT)
  phone         String?
  is_2fa_verified Boolean @default(false) // للمديرين فقط
  created_at    DateTime  @default(now())
  
  bookings      Booking[]
  custom_requests CustomizationRequest[]
  wishlist      Tour[]    @relation("UserWishlist")

  @@map("users")
}

model Tour {
  id            String    @id @default(uuid())
  title         String
  slug          String    @unique
  description   String    @db.Text
  base_price    Float
  currency      Currency  @default(USD)
  status        String    @default("open") // open, closed
  created_by    String    // Admin ID
  created_at    DateTime  @default(now())

  itinerary     TourItinerary[]
  images        TourImage[]
  bookings      Booking[]
  wishlist_users User[]   @relation("UserWishlist")
  custom_requests CustomizationRequest[]

  @@map("tours")
}

model TourItinerary {
  id          String  @id @default(uuid())
  tour_id     String
  day_number  Int
  title       String
  description String  @db.Text

  tour        Tour    @relation(fields: [tour_id], references: [id], onDelete: Cascade)

  @@map("tour_itineraries")
}

model TourImage {
  id          String  @id @default(uuid())
  tour_id     String
  image_url   String
  is_primary  Boolean @default(false)

  tour        Tour    @relation(fields: [tour_id], references: [id], onDelete: Cascade)

  @@map("tour_images")
}

model Addon {
  id          String   @id @default(uuid())
  name        String
  description String?  @db.Text
  price       Float
  currency    Currency @default(USD)

  booking_addons BookingAddon[]

  @@map("addons")
}

model Booking {
  id                String        @id @default(uuid())
  user_id           String
  tour_id           String
  tour_date         DateTime
  num_people        Int
  total_amount      Float
  currency          Currency      @default(USD)
  status            BookingStatus @default(PENDING_PAYMENT)
  payment_method    String        // "stripe" or "bank_transfer"
  receipt_image_url String?       // للتحويلات البنكية
  created_at        DateTime      @default(now())

  user        User           @relation(fields: [user_id], references: [id])
  tour        Tour           @relation(fields: [tour_id], references: [id])
  addons      BookingAddon[]
  invoice     Invoice?

  @@map("bookings")
}

model BookingAddon {
  id               String  @id @default(uuid())
  booking_id       String
  addon_id         String
  quantity         Int
  price_at_time    Float   // حفظ السعر وقت الحجز لتجنب تغيرات الأسعار المستقبلية

  booking          Booking @relation(fields: [booking_id], references: [id], onDelete: Cascade)
  addon            Addon   @relation(fields: [addon_id], references: [id])

  @@map("booking_addons")
}

model Invoice {
  id             String   @id @default(uuid())
  booking_id     String   @unique
  invoice_number String   @unique
  pdf_url        String?  // يمكن تركها فارغة إذا كان التوليد يتم في الـ Frontend فقط، أو حفظ مسار محلي
  issued_at      DateTime @default(now())

  booking        Booking  @relation(fields: [booking_id], references: [id], onDelete: Cascade)

  @@map("invoices")
}

model CustomizationRequest {
  id        String   @id @default(uuid())
  user_id   String
  tour_id   String
  message   String   @db.Text
  budget    Float?
  status    String   @default("pending") // pending, reviewed, rejected

  user      User     @relation(fields: [user_id], references: [id])
  tour      Tour     @relation(fields: [tour_id], references: [id])
  created_at DateTime @default(now())

  @@map("customization_requests")
}
```

---

### 🚀 رابعاً: خطة التنفيذ الفوري (خطوة بخطوة للمطورين)

لتجنب أي حيرة، يجب على فريق التطوير اتباع هذا الترتيب الحرفي:

1. **تهيئة المشروع (Initialization):**
   ```bash
   npx create-next-app@latest mystic-egypt --typescript --tailwind --eslint --app --src-dir
   cd mystic-egypt
   npx shadcn-ui@latest init
   npm install @prisma/client next-auth @auth/prisma-adapter resend react-i18next i18next zustand @tanstack/react-query @react-pdf/renderer lucide-react
   npm install -D prisma
   ```
2. **إعداد قاعدة البيانات:**
   * إنشاء ملف `.env` يحتوي على `DATABASE_URL`.
   * تشغيل `npx prisma db push` لإنشاء الجداول محلياً.
3. **تكوين الطبقة الأساسية (Core Setup):**
   * إعداد `src/core/lib/prisma.ts` (Singleton Pattern).
   * إعداد `src/core/lib/auth.ts` (NextAuth مع Resend للـ OTP).
   * إنشاء ملف `src/core/api/endpoints.ts`.
4. **تطوير أول ميزة تجريبية (Proof of Concept):**
   * بناء ميزة "عرض الرحلات" (`src/features/tour`) للتأكد من عمل الـ SSG، جلب البيانات عبر Prisma، وعرض الصور عبر Next.js Image Component.

---

### ✅ تأكيد نهائي
هذا المستند الآن يمثل **العقد التقني الملزم** بين إدارة المشروع وفريق التطوير. أي انحراف عن هذه الهيكلية، أو استخدام مكتبات غير مذكورة، أو كتابة منطق أعمال داخل مجلد `app/` بدلاً من `features/`، يعتبر مخالفة لمعايير الجودة المتفق عليها.