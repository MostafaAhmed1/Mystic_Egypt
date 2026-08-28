\---



\# 📋 دليل التنفيذ الفني الشامل (Technical Execution SOP)

\*\*المشروع:\*\* Mystic Egypt Tourism Platform  

\*\*المرجع:\*\* وثيقة PRD v1.0 + المخطط التقني المعتمد.



\---



\## 🟢 المرحلة الأولى: التهيئة وإعداد بيئة العمل (Initialization)

\*المسؤول: Lead Developer / DevOps\*



1\. \*\*إنشاء المستودع وتثبيت المشروع الأساسي:\*\*

&#x20;  ```bash

&#x20;  npx create-next-app@latest mystic-egypt --typescript --tailwind --eslint --app --src-dir --import-alias "@/\*"

&#x20;  cd mystic-egypt

&#x20;  ```

2\. \*\*تثبيت الاعتماديات (Dependencies) بدقة:\*\*

&#x20;  ```bash

&#x20;  # قاعدة البيانات والمصادقة

&#x20;  npm install @prisma/client @auth/prisma-adapter next-auth resend

&#x20;  

&#x20;  # إدارة الحالة والواجهات

&#x20;  npm install @tanstack/react-query zustand lucide-react

&#x20;  

&#x20;  # تعدد اللغات والخرائط و PDF

&#x20;  npm install i18next react-i18next i18next-resources-to-backend leaflet react-leaflet @react-pdf/renderer

&#x20;  

&#x20;  # أدوات التطوير

&#x20;  npm install -D prisma @types/leaflet

&#x20;  ```

3\. \*\*تهيئة مكتبة المكونات (shadcn/ui):\*\*

&#x20;  ```bash

&#x20;  npx shadcn@latest init

&#x20;  # إضافة المكونات الأساسية المطلوبة فوراً:

&#x20;  npx shadcn@latest add button input card table dialog form toast calendar select tabs

&#x20;  ```

4\. \*\*إعداد ملفات البيئة والأمان:\*\*

&#x20;  \* إنشاء ملف `.env.example` وتعبئته بالمتغيرات المطلوبة (`DATABASE\_URL`, `NEXTAUTH\_SECRET`, `RESEND\_API\_KEY`).

&#x20;  \* إنشاء ملف `.env` محلي وعدم رفعه أبداً لـ Git (موجود بالفعل في `.gitignore`).



\---



\## 🟡 المرحلة الثانية: بناء الأساس التقني (Core Architecture Setup)

\*المسؤول: Backend / Full-Stack Developer\*



1\. \*\*إعداد هيكلية المجلدات:\*\* إنشاء المجلدات التالية حرفياً كما تم الاتفاق:

&#x20;  `src/core/`, `src/features/`, `src/shared/`, `public/locales/`, `public/uploads/`.

2\. \*\*تكوين Next.js (`next.config.js`):\*\*

&#x20;  \* تفعيل تحسين الصور: `formats: \['image/avif', 'image/webp']`.

&#x20;  \* إضافة رؤوس الأمان (Security Headers): `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options: DENY`.

&#x20;  \* \*\*تحذير:\*\* عدم إضافة أي إعدادات متعلقة بـ CDN أو External Domains للصور إلا إذا كانت من نطاق الموقع نفسه.

3\. \*\*إعداد مسارات الاستيراد (Path Aliases) في `tsconfig.json`:\*\*

&#x20;  ```json

&#x20;  "paths": {

&#x20;    "@/\*": \["./src/\*"],

&#x20;    "@/core/\*": \["./src/core/\*"],

&#x20;    "@/features/\*": \["./src/features/\*"],

&#x20;    "@/shared/\*": \["./src/shared/\*"]

&#x20;  }

&#x20;  ```

4\. \*\*تهيئة Prisma و NextAuth:\*\*

&#x20;  \* نسخ مخطط `schema.prisma` المعتمد وتشغيل: `npx prisma db push`.

&#x20;  \* إنشاء ملف `src/core/lib/prisma.ts` (Singleton Pattern لمنع اتصالات متعددة).

&#x20;  \* إعداد `src/core/lib/auth.ts` لتفعيل مزود Resend للـ OTP مع تحديد مدة صلاحية الرمز (مثلاً 10 دقائق).



\---



\## 🟠 المرحلة الثالثة: تطوير منطق الأعمال والواجهات الخلفية (Backend \& Business Logic)

\*المسؤول: Backend Developer\*

\*القاعدة الذهبية: لا يوجد منطق أعمال (Business Logic) داخل مجلد `app/`. كل المنطق يكون في `src/features/`.\*



1\. \*\*تحديد نقاط النهاية (API Endpoints):\*\*

&#x20;  \* إنشاء ملف `src/core/api/endpoints.ts` وتعبئته بجميع المسارات كما تم تحديدها مسبقاً.

2\. \*\*تنفيذ ميزة رفع الملفات (Local VPS Storage):\*\*

&#x20;  \* إنشاء Server Action في `src/features/booking/actions/uploadReceipt.ts`.

&#x20;  \* استخدام واجهة `FormData` الأصلية في Next.js.

&#x20;  \* \*\*فحوصات إلزامية قبل الحفظ:\*\* التحقق من `file.type` (image/jpeg, image/png, image/pdf)، التحقق من الحجم (< 5MB)، وإعادة تسمية الملف بـ `crypto.randomUUID()` قبل حفظه في `public/uploads/`.

3\. \*\*تنفيذ سياسة الإلغاء (Cancellation Policy):\*\*

&#x20;  \* إنشاء دالة نقية (Pure Function) في `src/core/utils/cancellation.ts` تطبق قواعد الـ 30/15/14 يوماً حرفياً، وإرجاع نسبة الاسترداد المسموحة.

4\. \*\*تطوير Route Handlers (في `src/app/api/`):\*\*

&#x20;  \* يجب أن تكون مجرد "ممرات" (Pass-through) تستدعي الدوال من `src/features/` وتعيد الاستجابة الموحدة (Unified JSON Response).



\---



\## 🔵 المرحلة الرابعة: تطوير الواجهات الأمامية (Frontend Development)

\*المسؤول: Frontend Developer\*



1\. \*\*إعداد الطبقة المشتركة (Shared Layer):\*\*

&#x20;  \* تكوين `react-i18next` في `src/core/lib/i18n.ts` وربطه بملفات `public/locales`.

&#x20;  \* إنشاء `Providers.tsx` لدمج `SessionProvider` (NextAuth) و `QueryClientProvider` (TanStack Query).

2\. \*\*تطوير الواجهة العامة (Public - SSG):\*\*

&#x20;  \* الصفحة الرئيسية وصفحات الرحلات يجب أن تستخدم `export const dynamic = 'force-static'`.

&#x20;  \* دمج خريطة Leaflet.js في صفحة تفاصيل الرحلة (مع التأكد من تحميلها كـ Dynamic Import لتجنب أخطاء SSR).

3\. \*\*تطوير تدفق الحجز (Checkout Flow):\*\*

&#x20;  \* استخدام `Zustand` لإدارة حالة "سلة الإضافات" (Add-ons Cart) عبر خطوات الحجز.

&#x20;  \* دمج Stripe Elements (في وضع الاختبار أولاً) مع التأكد من أن مفاتيح API تُحقن عبر متغيرات البيئة فقط.

4\. \*\*تطوير لوحات التحكم (Dashboards - SSR):\*\*

&#x20;  \* \*\*لوحة العميل:\*\* عرض الحجوزات، المفضلة، وزر "تحميل الفاتورة" الذي يستدعي مكون `@react-pdf/renderer` لتوليد الملف محلياً في المتصفح.

&#x20;  \* \*\*لوحة المدير:\*\* بناء واجهة Kanban باستخدام مكونات `shadcn/ui` (Drag and Drop يمكن استخدام `@hello-pangea/dnd` لها)، مع فرض Middleware للتحقق من `is\_2fa\_verified === true`.



\---



\## 🟣 المرحلة الخامسة: الاختبار وضمان الجودة (QA \& Testing)

\*المسؤول: QA Engineer / Lead Developer\*



1\. \*\*اختبار الوحدة (Unit Testing):\*\* اختبار دالة سياسة الإلغاء ودالة التحقق من نوع الملف المرفوع.

2\. \*\*اختبار التكامل (Integration Testing):\*\*

&#x20;  \* دورة حجز كاملة: اختيار رحلة -> إضافة Add-on -> تسجيل دخول بـ OTP -> اختيار تحويل بنكي -> رفع إيصال -> تحقق المدير من لوحة التحكم -> تغيير الحالة إلى "مؤكد".

3\. \*\*اختبار الأداء والأمان:\*\*

&#x20;  \* تشغيل `Lighthouse` على الصفحة الرئيسية وصفحة الرحلة: يجب أن يكون الأداء (Performance) والأفضل ممارسات (Best Practices) والأمان (Accessibility) \*\*90+\*\*.

&#x20;  \* التأكد من أن مجلد `public/uploads/` لا يسمح بتنفيذ ملفات PHP أو Scripts (يتم ضبط ذلك عبر Nginx).



\---



\## 🔴 المرحلة السادسة: النشر والإطلاق النهائي (Deployment \& Go-Live)

\*المسؤول: DevOps / Lead Developer\*

\*القاعدة: لا توجد بيئة Staging. النشر مباشر على الخادم الإنتاجي عبر SSH.\*



1\. \*\*تجهيز الخادم (VPS Provisioning):\*\*

&#x20;  \* تثبيت: Node.js (LTS), PM2, Nginx, MariaDB, Certbot (للـ SSL).

&#x20;  \* إنشاء قاعدة بيانات MariaDB ومستخدم مخصص للمشروع.

&#x20;  \* إعداد Nginx كـ Reverse Proxy لتوجيه النطاق `mysticegypt.net` إلى منفذ Next.js (مثلاً 3000)، مع فرض HTTPS وإعادة التوجيه من HTTP.

2\. \*\*سكربت النشر (Deployment Script):\*\*

&#x20;  يجب على المطور تنفيذ الأوامر التالية بالترتيب عبر SSH:

&#x20;  ```bash

&#x20;  # 1. الدخول للمجلد وسحب أحدث كود

&#x20;  cd /var/www/mystic-egypt

&#x20;  git pull origin main

&#x20;  

&#x20;  # 2. تثبيت الاعتماديات الجديدة (إن وجدت)

&#x20;  npm install --production

&#x20;  

&#x20;  # 3. تطبيق أي تغييرات جديدة على قاعدة البيانات بأمان

&#x20;  npx prisma migrate deploy

&#x20;  

&#x20;  # 4. بناء المشروع (Next.js Build)

&#x20;  npm run build

&#x20;  

&#x20;  # 5. إعادة تشغيل التطبيق عبر PM2

&#x20;  pm2 restart mystic-egypt-app

&#x20;  ```

3\. \*\*التحقق النهائي (Post-Deployment Check):\*\*

&#x20;  \* زيارة الموقع عبر HTTPS.

&#x20;  \* اختبار إرسال بريد إلكتروني فعلي عبر Resend.

&#x20;  \* التأكد من أن الصور تُخدم بصيغة WebP/AVIF (عبر فحص Network Tab في المتصفح).



\---



\### ⚠️ بروتوكول الطوارئ والمخالفات

\* \*\*ممنوع منعاً باتاً:\*\* استخدام `any` في TypeScript.

\* \*\*ممنوع منعاً باتاً:\*\* تخزين بيانات بطاقات الائتمان أو أي بيانات حساسة في قاعدة البيانات (يتم الاعتماد كلياً على Stripe Tokens).

\* \*\*ممنوع منعاً باتاً:\*\* كتابة استعلامات SQL خام (Raw Queries) إلا في حالات استثنائية موثقة ومراجعة من Lead Developer، ويجب استخدام Prisma في 99% من الحالات.



\---

