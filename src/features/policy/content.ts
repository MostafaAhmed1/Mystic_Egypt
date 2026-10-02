import { defaultLocale, locales, type Locale } from "@/core/i18n-config";

/**
 * Full content for the four trust pages (Privacy, Terms, Cancellation, Cookie).
 * Written in plain, realistic, professional language based on the practices of
 * established tour operators, with protective guardrails:
 *  - no absolute refund/service guarantees
 *  - clear limitation-of-liability and force-majeure clauses
 *  - no card data is ever stored (Stripe handles payments)
 * The English version is the governing version; ar/de are translations,
 * any other locale (e.g. hu) falls back to English until translated.
 */

export type PolicyType =
  | "privacy-policy"
  | "terms-and-conditions"
  | "cancellation-policy"
  | "cookie-policy";

export interface PolicySection {
  heading: string;
  paragraphs: string[];
}

export interface PolicyContent {
  title: string;
  description: string;
  updated: string;
  sections: PolicySection[];
}

export const POLICY_TYPES: PolicyType[] = [
  "privacy-policy",
  "terms-and-conditions",
  "cancellation-policy",
  "cookie-policy",
];

export function isPolicyType(value: string | undefined): value is PolicyType {
  return POLICY_TYPES.includes(value as PolicyType);
}

const CONTENT: Record<PolicyType, Partial<Record<Locale, PolicyContent>>> = {
  "privacy-policy": {
    en: {
      title: "Privacy Policy",
      description:
        "How Mystic Egypt collects, uses and protects your personal data, in accordance with the UK GDPR.",
      updated: "1 September 2026",
      sections: [
        {
          heading: "1. Who we are",
          paragraphs: [
            "Mystic Egypt is a travel company registered in the United Kingdom, operating tours across Egypt with a local team of Egyptian experts. Our website is mysticegypt.net and you can reach us at info@mysticegypt.net.",
          ],
        },
        {
          heading: "2. Data we collect",
          paragraphs: [
            "We collect only the information needed to provide and manage your booking: your name, email address, phone number, billing details, and the details of the tour you book (dates, group size, requested add-ons).",
            "When you use our contact form we collect the details you submit so we can reply to your enquiry.",
            "We never store credit or debit card numbers. Card payments are processed entirely by Stripe, a PCI-DSS compliant payment provider.",
          ],
        },
        {
          heading: "3. How we use your data",
          paragraphs: [
            "We use your personal data to: confirm and manage bookings, communicate about your trip, issue invoices and receipts, respond to enquiries, send service messages and legally required notices, and improve our website and services.",
            "Where you have opted in, we may send occasional travel news and offers. You can opt out at any time by replying to any email or contacting us.",
          ],
        },
        {
          heading: "4. Legal basis (GDPR)",
          paragraphs: [
            "We process personal data on one of these lawful bases: performance of a contract (booking and payment), your consent (marketing and optional analytics), legitimate interest (fraud prevention, website improvements), or compliance with a legal obligation (accounting and tax records).",
          ],
        },
        {
          heading: "5. Payments and Stripe",
          paragraphs: [
            "Card payments are handled by Stripe under its own privacy policy. We receive only confirmation that a payment was successful and basic billing details such as the last four digits.",
            "For bank-transfer bookings you upload a payment receipt, which we review to confirm your booking. We retain minimum necessary records for accounting and anti-fraud purposes.",
          ],
        },
        {
          heading: "6. Sharing your data",
          paragraphs: [
            "We share data only with the service providers needed to run the service: Stripe (payments), our email provider (transactional messages and receipts), and our website analytics provider (aggregated, privacy-aware statistics).",
            "We never sell or rent your personal data, and we never share it with third parties for their own marketing.",
          ],
        },
        {
          heading: "7. Data retention",
          paragraphs: [
            "We keep personal data only as long as necessary: booking and financial records are kept for the period required by law (typically up to 7 years for accounting), and other data is deleted or anonymised when it is no longer needed.",
          ],
        },
        {
          heading: "8. Your rights",
          paragraphs: [
            "Under the UK GDPR you have the right to access, correct, delete or restrict the processing of your personal data, the right to data portability, and the right to object to processing based on legitimate interest.",
            "To exercise any of these rights, email us at info@mysticegypt.net. We will respond within the timeframe required by law. You may also lodge a complaint with the UK Information Commissioner's Office (ICO).",
          ],
        },
        {
          heading: "9. International transfers",
          paragraphs: [
            "Your data may be processed by our service providers located outside the United Kingdom. Where this happens, we rely on recognised safeguards such as adequacy decisions or standard contractual clauses.",
          ],
        },
        {
          heading: "10. Children",
          paragraphs: [
            "Our services are not directed at children under 16, and we do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it.",
          ],
        },
        {
          heading: "11. Changes to this policy",
          paragraphs: [
            "We may update this policy from time to time. The current version is always published on this page with its effective date. Material changes will be highlighted on the website.",
          ],
        },
        {
          heading: "12. Contact",
          paragraphs: [
            "For any privacy question or request, contact us at info@mysticegypt.net, by phone on +44 7412 880087 (UK) or +20 102 922 6066 (Egypt), or by post at Cleveland Tower, Holloway Head, Birmingham, United Kingdom.",
          ],
        },
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      description:
        "كيف تجمع شركة ميستك إيجيبت بياناتك الشخصية وتستخدمها وتحميها، وفقاً للائحة حماية البيانات البريطانية (GDPR).",
      updated: "1 سبتمبر 2026",
      sections: [
        {
          heading: "1. من نحن",
          paragraphs: [
            "ميستك إيجيبت شركة سفر مسجلة في المملكة المتحدة، وتنظم جولات في أنحاء مصر بفريق محلي من الخبراء المصريين. موقعنا الإلكتروني mysticegypt.net ويمكنك التواصل معنا عبر info@mysticegypt.net.",
          ],
        },
        {
          heading: "2. البيانات التي نجمعها",
          paragraphs: [
            "نجمع فقط المعلومات اللازمة لإتمام وإدارة حجزك: اسمك، بريدك الإلكتروني، رقم هاتفك، تفاصيل الفوترة، وتفاصيل الجولة التي تحجزها (التواريخ، حجم المجموعة، الإضافات المطلوبة).",
            "عند استخدام نموذج التواصل نجمع التفاصيل التي ترسلها لنتمكن من الرد على استفسارك.",
            "لا نخزّن أرقام بطاقات الائتمان أو الخصم أبداً. تُعالج مدفوعات البطاقات بالكامل عبر Stripe، وهو مزوّد مدفوعات متوافق مع معيار PCI-DSS.",
          ],
        },
        {
          heading: "3. كيف نستخدم بياناتك",
          paragraphs: [
            "نستخدم بياناتك الشخصية من أجل: تأكيد الحجوزات وإدارتها، التواصل حول رحلتك، إصدار الفواتير والإيصالات، الرد على الاستفسارات، إرسال رسائل الخدمة والإشعارات القانونية المطلوبة، وتحسين موقعنا وخدماتنا.",
            "حين توافق، قد نرسل لك أخباراً وعروض سفر من حين لآخر. يمكنك إلغاء الاشتراك في أي وقت بالرد على أي بريد أو بالتواصل معنا.",
          ],
        },
        {
          heading: "4. الأساس القانوني (GDPR)",
          paragraphs: [
            "نعالج البيانات الشخصية على أحد هذه الأسس القانونية: تنفيذ العقد (الحجز والدفع)، موافقتك (التسويق والتحليلات الاختيارية)، المصلحة المشروعة (منع الاحتيال وتحسين الموقع)، أو الامتثال لالتزام قانوني (السجلات المحاسبية والضريبية).",
          ],
        },
        {
          heading: "5. المدفوعات و Stripe",
          paragraphs: [
            "تُعالج مدفوعات البطاقات بواسطة Stripe وفقاً لسياسة الخصوصية الخاصة به. لا نستلم سوى تأكيد نجاح الدفع وتفاصيل فوترة أساسية مثل آخر أربعة أرقام.",
            "بالنسبة لحجوزات التحويل البنكي ترفع إيصال الدفع الذي يراجعه فريقنا لتأكيد حجزك. نحتفظ بالسجلات الضرورية فقط لأغراض المحاسبة ومكافحة الاحتيال.",
          ],
        },
        {
          heading: "6. مشاركة بياناتك",
          paragraphs: [
            "نشارك البيانات فقط مع مزودي الخدمة اللازمين لتشغيل الخدمة: Stripe (المدفوعات)، مزوّد البريد الإلكتروني (الرسائل والإيصالات)، ومزوّد تحليلات موقعنا (إحصاءات مجمّعة تراعي الخصوصية).",
            "لا نبيع بياناتك الشخصية أو نؤجرها أبداً، ولا نشاركها مع أطراف ثالثة لأغراض تسويقية خاصة بهم.",
          ],
        },
        {
          heading: "7. مدة الاحتفاظ بالبيانات",
          paragraphs: [
            "نحتفظ بالبيانات الشخصية فقط للمدة اللازمة: تُحفظ سجلات الحجز والمالية للمدة التي يفرضها القانون (عادة حتى 7 سنوات للمحاسبة)، وتُحذف البيانات الأخرى أو تُجّهَل هويتها عندما لا تعود مطلوبة.",
          ],
        },
        {
          heading: "8. حقوقك",
          paragraphs: [
            "بموجب اللائحة البريطانية GDPR يحق لك الوصول إلى بياناتك الشخصية وتصحيحها وحذفها أو تقييد معالجتها، وحق نقل البيانات، وحق الاعتراض على المعالجة المبنية على المصلحة المشروعة.",
            "لممارسة أي من هذه الحقوق راسلنا على info@mysticegypt.net. سنرد خلال المدة التي ينص عليها القانون. يمكنك أيضاً تقديم شكوى إلى مكتب مفوض المعلومات البريطاني (ICO).",
          ],
        },
        {
          heading: "9. النقل الدولي",
          paragraphs: [
            "قد تُعالج بياناتك بواسطة مزودي الخدمة خارج المملكة المتحدة. وحين يحدث ذلك نعتمد على ضمانات معترف بها مثل قرارات الكفاية أو الشروط التعاقدية القياسية.",
          ],
        },
        {
          heading: "10. الأطفال",
          paragraphs: [
            "خدماتنا غير موجهة للأطفال دون 16 عاماً، ولا نجمع بيانات شخصية من الأطفال عن قصد. إذا كنت تعتقد أن طفلاً زوّدنا ببيانات شخصية، فتواصل معنا وسنحذفها.",
          ],
        },
        {
          heading: "11. التغييرات على هذه السياسة",
          paragraphs: [
            "قد نحدّث هذه السياسة من وقت لآخر. تُنشر النسخة الحالية دائماً في هذه الصفحة مع تاريخ السريان. ستُبرز التغييرات الجوهرية على الموقع.",
          ],
        },
        {
          heading: "12. التواصل",
          paragraphs: [
            "لأي استفسار أو طلب متعلق بالخصوصية تواصل معنا عبر info@mysticegypt.net، أو هاتفياً على +44 7412 880087 (المملكة المتحدة) أو +20 102 922 6066 (مصر)، أو بالبريد إلى كليفلاند تاور، هولواي هيد، برمنغهام، المملكة المتحدة.",
          ],
        },
      ],
    },
    de: {
      title: "Datenschutzerklärung",
      description:
        "Wie Mystic Egypt Ihre personenbezogenen Daten erhebt, verwendet und schützt – gemäß der britischen Datenschutz-Grundverordnung (UK GDPR).",
      updated: "1. September 2026",
      sections: [
        {
          heading: "1. Wer wir sind",
          paragraphs: [
            "Mystic Egypt ist ein im Vereinigten Königreich registriertes Reiseunternehmen, das Touren in ganz Ägypten mit einem lokalen Team ägyptischer Experten anbietet. Unsere Website ist mysticegypt.net und Sie erreichen uns unter info@mysticegypt.net.",
          ],
        },
        {
          heading: "2. Daten, die wir erheben",
          paragraphs: [
            "Wir erheben nur die Informationen, die zur Bereitstellung und Verwaltung Ihrer Buchung erforderlich sind: Name, E-Mail-Adresse, Telefonnummer, Rechnungsdaten und die Details der gebuchten Tour (Termine, Gruppengröße, gewünschte Zusatzleistungen).",
            "Wenn Sie unser Kontaktformular nutzen, erheben wir die von Ihnen übermittelten Angaben, um Ihre Anfrage zu beantworten.",
            "Wir speichern niemals Kredit- oder Debitkartennummern. Kartenzahlungen werden vollständig von Stripe abgewickelt, einem PCI-DSS-konformen Zahlungsdienstleister.",
          ],
        },
        {
          heading: "3. Wie wir Ihre Daten verwenden",
          paragraphs: [
            "Wir verwenden Ihre personenbezogenen Daten, um: Buchungen zu bestätigen und zu verwalten, Sie zu Ihrer Reise zu informieren, Rechnungen und Belege auszustellen, Anfragen zu beantworten, Service- und gesetzlich vorgeschriebene Mitteilungen zu senden sowie unsere Website und Dienste zu verbessern.",
            "Wenn Sie eingewilligt haben, senden wir Ihnen gelegentlich Reisenachrichten und Angebote. Sie können dem jederzeit widersprechen, indem Sie auf eine E-Mail antworten oder uns kontaktieren.",
          ],
        },
        {
          heading: "4. Rechtsgrundlage (UK GDPR)",
          paragraphs: [
            "Wir verarbeiten personenbezogene Daten auf einer dieser Rechtsgrundlagen: Erfüllung eines Vertrags (Buchung und Zahlung), Ihre Einwilligung (Marketing und optionale Analysen), berechtigtes Interesse (Betrugsprävention, Website-Verbesserung) oder Erfüllung einer rechtlichen Verpflichtung (Buchhaltungs- und Steuerunterlagen).",
          ],
        },
        {
          heading: "5. Zahlungen und Stripe",
          paragraphs: [
            "Kartenzahlungen werden von Stripe gemäß dessen eigener Datenschutzrichtlinie abgewickelt. Wir erhalten nur die Bestätigung einer erfolgreichen Zahlung und grundlegende Rechnungsdetails wie die letzten vier Ziffern.",
            "Bei Überweisungs-Buchungen laden Sie einen Zahlungsbeleg hoch, den wir zur Bestätigung Ihrer Buchung prüfen. Wir speichern nur die notwendigsten Aufzeichnungen für Buchhaltung und Betrugsprävention.",
          ],
        },
        {
          heading: "6. Weitergabe Ihrer Daten",
          paragraphs: [
            "Wir geben Daten nur an die für den Betrieb erforderlichen Dienstleister weiter: Stripe (Zahlungen), unseren E-Mail-Anbieter (transaktionale Nachrichten und Belege) und unseren Website-Analyseanbieter (aggregierte, datenschutzfreundliche Statistiken).",
            "Wir verkaufen nie personenbezogene Daten und geben sie nie an Dritte für deren eigene Zwecke weiter.",
          ],
        },
        {
          heading: "7. Speicherdauer",
          paragraphs: [
            "Wir speichern personenbezogene Daten nur so lange wie nötig: Buchungs- und Finanzunterlagen werden für den gesetzlich vorgeschriebenen Zeitraum aufbewahrt (in der Regel bis zu 7 Jahre für die Buchhaltung), sonstige Daten werden gelöscht oder anonymisiert, sobald sie nicht mehr benötigt werden.",
          ],
        },
        {
          heading: "8. Ihre Rechte",
          paragraphs: [
            "Gemäß der UK GDPR haben Sie das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen Verarbeitung auf Grundlage berechtigten Interesses.",
            "Zur Ausübung dieser Rechte schreiben Sie uns an info@mysticegypt.net. Wir antworten innerhalb der gesetzlich vorgeschriebenen Frist. Sie können sich auch beim britischen Information Commissioner's Office (ICO) beschweren.",
          ],
        },
        {
          heading: "9. Internationale Übermittlungen",
          paragraphs: [
            "Ihre Daten können von unseren Dienstleistern außerhalb des Vereinigten Königreichs verarbeitet werden. In diesem Fall stützen wir uns auf anerkannte Garantien wie Angemessenheitsbeschlüsse oder Standardvertragsklauseln.",
          ],
        },
        {
          heading: "10. Kinder",
          paragraphs: [
            "Unsere Dienste richten sich nicht an Kinder unter 16 Jahren, und wir erheben wissentlich keine personenbezogenen Daten von Kindern. Wenn Sie glauben, dass ein Kind uns Daten übermittelt hat, kontaktieren Sie uns, und wir löschen diese.",
          ],
        },
        {
          heading: "11. Änderungen dieser Richtlinie",
          paragraphs: [
            "Wir können diese Richtlinie von Zeit zu Zeit aktualisieren. Die aktuelle Fassung ist stets mit ihrem Gültigkeitsdatum auf dieser Seite veröffentlicht. Wesentliche Änderungen werden auf der Website hervorgehoben.",
          ],
        },
        {
          heading: "12. Kontakt",
          paragraphs: [
            "Für Fragen oder Anliegen zum Datenschutz kontaktieren Sie uns unter info@mysticegypt.net, telefonisch unter +44 7412 880087 (Vereinigtes Königreich) oder +20 102 922 6066 (Ägypten), oder per Post: Cleveland Tower, Holloway Head, Birmingham, Vereinigtes Königreich.",
          ],
        },
      ],
    },
  },
  "terms-and-conditions": {
    en: {
      title: "Terms & Conditions",
      description:
        "The terms that apply when you book a tour with Mystic Egypt, including payments, changes and liability.",
      updated: "1 September 2026",
      sections: [
        {
          heading: "1. Agreement",
          paragraphs: [
            "By using this website or making a booking, you agree to these Terms & Conditions. The English version is the governing version. If we update these terms, the version published on this page at the time of your booking applies.",
          ],
        },
        {
          heading: "2. About the tours",
          paragraphs: [
            "Tour descriptions on this website describe the itinerary, included services and pricing as planned by our local team. Photos are representative and may not reflect the exact view, season or hotel of your travel date. Every reasonable effort is made to provide the services described.",
          ],
        },
        {
          heading: "3. Booking and payment",
          paragraphs: [
            "Bookings are made through this website. Payment is due either by card (processed securely by Stripe) or by bank transfer, in which case a receipt must be uploaded for review before the booking is confirmed.",
            "A booking is confirmed only after payment is received (or the transfer receipt is approved). Prices are shown per person in the currency displayed at the time of booking.",
          ],
        },
        {
          heading: "4. Cancellations and refunds",
          paragraphs: [
            "Our tiered cancellation and refund policy applies to all bookings. It is published on the Cancellation Policy page and summarised at the moment of booking. Non-refundable third-party costs, such as internal flights, are deducted in full regardless of when the cancellation occurs.",
          ],
        },
        {
          heading: "5. Your responsibilities",
          paragraphs: [
            "You are responsible for holding a valid passport, any required visas and sufficient travel insurance, and for arriving at the agreed meeting points on time.",
            "Please inform us of any medical conditions or accessibility needs that may affect your participation, so we can advise whether the tour is suitable.",
          ],
        },
        {
          heading: "6. Changes to your itinerary",
          paragraphs: [
            "Our team may make reasonable changes to the itinerary if needed: for example weather, water levels, security guidance, opening times of sites, or operational requirements. In such cases we will aim to provide an equivalent or better experience.",
            "We are not liable for delays, changes or cancellations caused by events outside our reasonable control, including natural events, strikes, flight changes or government restrictions.",
          ],
        },
        {
          heading: "7. Limitation of liability",
          paragraphs: [
            "To the maximum extent permitted by law, our total liability in connection with any booking is limited to the amount you paid for that booking, and we are not liable for indirect or consequential losses such as lost holiday time, incidental expenses or loss of enjoyment.",
            "Nothing in these terms limits or excludes liability that cannot legally be limited, including liability for death or personal injury caused by our negligence.",
          ],
        },
        {
          heading: "8. Intellectual property",
          paragraphs: [
            "The content of this website, including texts, logos and images, belongs to us or our licensors and may not be reproduced without prior written permission.",
          ],
        },
        {
          heading: "9. Acceptable use",
          paragraphs: [
            "You agree not to use this website for unlawful purposes, to attempt to gain unauthorised access to our systems, or to interfere with the normal operation of the platform.",
          ],
        },
        {
          heading: "10. Governing law",
          paragraphs: [
            "These Terms are governed by the laws of England and Wales, without prejudice to any mandatory consumer-protection rights you may have in your country of residence.",
          ],
        },
        {
          heading: "11. Contact",
          paragraphs: [
            "For any question about these terms, contact us at info@mysticegypt.net or by phone on +44 7412 880087 (UK) or +20 102 922 6066 (Egypt).",
          ],
        },
      ],
    },
    ar: {
      title: "الشروط والأحكام",
      description:
        "الشروط المطبقة عند حجز جولة مع ميستك إيجيبت، بما في ذلك المدفوعات والتغييرات والمسؤولية.",
      updated: "1 سبتمبر 2026",
      sections: [
        {
          heading: "1. الموافقة",
          paragraphs: [
            "باستخدامك هذا الموقع أو إجراء حجز فإنك توافق على هذه الشروط والأحكام. النسخة الإنجليزية هي النسخة الحاكمة. إذا قمنا بتحديث هذه الشروط، تُطبَّق النسخة المنشورة في هذه الصفحة وقت حجزك.",
          ],
        },
        {
          heading: "2. عن الجولات",
          paragraphs: [
            "تصف أوصاف الجولات على هذا الموقع برنامج الرحلة والخدمات المشمولة والأسعار كما خطط لها فريقنا المحلي. الصور توضيحية وقد لا تعكس تماماً المشهد أو الموسم أو الفندق بتاريخ سفرك. نبذل قصارى جهدنا لتقديم الخدمات الموصوفة.",
          ],
        },
        {
          heading: "3. الحجز والدفع",
          paragraphs: [
            "تتم الحجوزات عبر هذا الموقع. يُدفع المبلغ إما بالبطاقة (تُعالج بمعالجة آمنة عبر Stripe) أو بالتحويل البنكي، وفي هذه الحالة يجب رفع إيصال للمراجعة قبل تأكيد الحجز.",
            "لا يُعتبر الحجز مؤكداً إلا بعد استلام الدفع (أو الموافقة على إيصال التحويل). تُعرض الأسعار لكل شخص بالعملة الظاهرة وقت الحجز.",
          ],
        },
        {
          heading: "4. الإلغاء والاسترداد",
          paragraphs: [
            "تنطبق سياسة الإلغاء والاسترداد المتدرجة على جميع الحجوزات. وهي منشورة في صفحة سياسة الإلغاء وملخّصة في لحظة الحجز. تُخصم التكاليف الثالثية غير القابلة للاسترداد، مثل الرحلات الداخلية، بالكامل بغض النظر عن موعد الإلغاء.",
          ],
        },
        {
          heading: "5. مسؤولياتك",
          paragraphs: [
            "أنت مسؤول عن حمل جواز سفر ساري المفعول، وأي تأشيرات مطلوبة، وتأمين سفر كافٍ، وعن الوصول إلى نقاط الالتقاء المتفق عليها في الوقت المحدد.",
            "يرجى إبلاغنا بأي حالات طبية أو احتياجات إمكانية وصول قد تؤثر على مشاركتك، لنتمكن من إرشادك حول ملاءمة الجولة.",
          ],
        },
        {
          heading: "6. تغييرات برنامج الرحلة",
          paragraphs: [
            "قد يعدل فريقنا برنامج الرحلة بشكل معقول عند الحاجة: مثلاً بسبب الطقس، منسوب المياه، الإرشادات الأمنية، مواعيد فتح المواقع، أو متطلبات تشغيلية. في هذه الحالات نهدف إلى تقديم تجربة مكافئة أو أفضل.",
            "لسنا مسؤولين عن التأخير أو التغيير أو الإلغاء الناجم عن أحداث خارجة عن سيطرتنا المعقولة، بما فيها الكوارث الطبيعية والإضرابات وتغير الرحلات أو القيود الحكومية.",
          ],
        },
        {
          heading: "7. حدود المسؤولية",
          paragraphs: [
            "لأقصى حد يسمح به القانون، تقتصر مسؤوليتنا الإجمالية المتعلقة بأي حجز على المبلغ الذي دفعته لذلك الحجز، كما لا نتحمل مسؤولية الخسائر غير المباشرة أو التبعية مثل ضياع وقت العطلة أو المصاريف العرضية أو فقدان المتعة.",
            "لا شيء في هذه الشروط يقيد أو يستثني مسؤولية لا يجوز قانوناً تقييدها، بما فيها المسؤولية عن الوفاة أو الإصابة الشخصية الناجمة عن إهمالنا.",
          ],
        },
        {
          heading: "8. الملكية الفكرية",
          paragraphs: [
            "محتويات هذا الموقع، بما فيها النصوص والشعارات والصور، ملك لنا أو لمرخصينا ولا يجوز نسخها دون إذن كتابي مسبق.",
          ],
        },
        {
          heading: "9. الاستخدام المقبول",
          paragraphs: [
            "أنت توافق على عدم استخدام هذا الموقع لأغراض غير قانونية، أو محاولة الوصول غير المصرح به إلى أنظمتنا، أو التدخل في التشغيل الطبيعي للمنصة.",
          ],
        },
        {
          heading: "10. القانون الحاكم",
          paragraphs: [
            "تخضع هذه الشروط لقوانين إنجلترا وويلز، دون الإخلال بأي حقوق إلزامية لحماية المستهلك قد تتمتع بها في بلد إقامتك.",
          ],
        },
        {
          heading: "11. التواصل",
          paragraphs: [
            "لأي سؤال حول هذه الشروط تواصل معنا عبر info@mysticegypt.net أو هاتفياً على +44 7412 880087 (المملكة المتحدة) أو +20 102 922 6066 (مصر).",
          ],
        },
      ],
    },
    de: {
      title: "Allgemeine Geschäftsbedingungen (AGB)",
      description:
        "Die Bedingungen, die bei der Buchung einer Tour mit Mystic Egypt gelten, einschließlich Zahlungen, Änderungen und Haftung.",
      updated: "1. September 2026",
      sections: [
        {
          heading: "1. Zustimmung",
          paragraphs: [
            "Mit der Nutzung dieser Website oder einer Buchung stimmen Sie diesen AGB zu. Die englische Fassung ist maßgeblich. Bei Aktualisierungen gilt die zum Zeitpunkt Ihrer Buchung auf dieser Seite veröffentlichte Fassung.",
          ],
        },
        {
          heading: "2. Über die Touren",
          paragraphs: [
            "Die Tourenbeschreibungen auf dieser Website stellen Reiseverlauf, enthaltene Leistungen und Preise dar, wie sie von unserem lokalen Team geplant wurden. Fotos sind repräsentativ und können die tatsächliche Aussicht, Jahreszeit oder das Hotel Ihres Reisedatums nicht exakt widerspiegeln. Wir bemühen uns nach besten Kräften, die beschriebenen Leistungen zu erbringen.",
          ],
        },
        {
          heading: "3. Buchung und Zahlung",
          paragraphs: [
            "Buchungen erfolgen über diese Website. Die Zahlung erfolgt per Karte (sicher über Stripe abgewickelt) oder per Überweisung; bei Überweisung muss ein Beleg zur Prüfung hochgeladen werden, bevor die Buchung bestätigt wird.",
            "Eine Buchung ist erst nach Zahlungseingang (oder Freigabe des Überweisungsbelegs) bestätigt. Preise werden pro Person in der zum Buchungszeitpunkt angezeigten Währung angegeben.",
          ],
        },
        {
          heading: "4. Stornierung und Erstattung",
          paragraphs: [
            "Für alle Buchungen gilt unsere gestaffelte Stornierungs- und Erstattungsrichtlinie. Sie ist auf der Seite Stornierungsbedingungen veröffentlicht und wird zum Buchungszeitpunkt zusammengefasst. Nicht erstattungsfähige Drittkosten wie Inlandsflüge werden unabhängig vom Stornierungszeitpunkt in voller Höhe abgezogen.",
          ],
        },
        {
          heading: "5. Ihre Pflichten",
          paragraphs: [
            "Sie sind für einen gültigen Reisepass, ggf. erforderliche Visa und ausreichenden Reiseversicherungsschutz sowie für das pünktliche Erscheinen an den vereinbarten Treffpunkten verantwortlich.",
            "Bitte informieren Sie uns über medizinische Umstände oder Zugangsbedürfnisse, die Ihre Teilnahme beeinflussen können, damit wir beraten können, ob die Tour geeignet ist.",
          ],
        },
        {
          heading: "6. Änderungen des Reiseverlaufs",
          paragraphs: [
            "Unser Team kann den Reiseverlauf bei Bedarf angemessen ändern: z. B. wegen Wetter, Wasserstands, Sicherheitshinweisen, Öffnungszeiten von Sehenswürdigkeiten oder betrieblichen Anforderungen. In solchen Fällen streben wir ein gleichwertiges oder besseres Erlebnis an.",
            "Wir haften nicht für Verzögerungen, Änderungen oder Stornierungen durch Ereignisse außerhalb unserer zumutbaren Kontrolle, einschließlich Naturereignissen, Streiks, Flugänderungen oder staatlichen Beschränkungen.",
          ],
        },
        {
          heading: "7. Haftungsbeschränkung",
          paragraphs: [
            "Soweit gesetzlich zulässig, ist unsere Gesamthaftung im Zusammenhang mit einer Buchung auf den von Ihnen gezahlten Betrag begrenzt; wir haften nicht für mittelbare oder Folgeschäden wie verlorene Urlaubszeit, Nebenkosten oder entgangene Freude.",
            "Nichts in diesen Bedingungen schränkt oder schließt Haftung aus, die gesetzlich nicht ausgeschlossen werden kann, einschließlich Haftung für durch unsere Fahrlässigkeit verursachte Todesfälle oder Personenschäden.",
          ],
        },
        {
          heading: "8. Geistiges Eigentum",
          paragraphs: [
            "Die Inhalte dieser Website, einschließlich Texten, Logos und Bildern, gehören uns oder unseren Lizenzgebern und dürfen ohne vorherige schriftliche Genehmigung nicht vervielfältigt werden.",
          ],
        },
        {
          heading: "9. Zulässige Nutzung",
          paragraphs: [
            "Sie verpflichten sich, diese Website nicht für rechtswidrige Zwecke zu nutzen, keinen unbefugten Zugriff auf unsere Systeme zu versuchen oder den normalen Betrieb der Plattform zu stören.",
          ],
        },
        {
          heading: "10. Anwendbares Recht",
          paragraphs: [
            "Diese Bedingungen unterliegen dem Recht von England und Wales, unbeschadet zwingender Verbraucherschutzrechte, die in Ihrem Wohnsitzland gelten.",
          ],
        },
        {
          heading: "11. Kontakt",
          paragraphs: [
            "Bei Fragen zu diesen Bedingungen kontaktieren Sie uns unter info@mysticegypt.net oder telefonisch unter +44 7412 880087 (Großbritannien) oder +20 102 922 6066 (Ägypten).",
          ],
        },
      ],
    },
  },
  "cancellation-policy": {
    en: {
      title: "Cancellation Policy",
      description:
        "Our tiered cancellation and refund policy for every Mystic Egypt booking.",
      updated: "1 September 2026",
      sections: [
        {
          heading: "1. Overview",
          paragraphs: [
            "If you need to cancel a booking, the refund you receive depends on how many full days remain before the tour date. Refunds are calculated on the amount you paid after deducting any non-refundable third-party costs.",
          ],
        },
        {
          heading: "2. Refund tiers",
          paragraphs: [
            "30 days or more before the tour date: 95% of the refundable amount is returned; a 5% administrative fee is retained.",
            "15 to 29 days before the tour date: 50% of the refundable amount is returned.",
            "Fewer than 15 days before the tour date: no refund is available.",
          ],
        },
        {
          heading: "3. Non-refundable costs",
          paragraphs: [
            "Any non-refundable third-party costs booked on your behalf (for example internal flight tickets or pre-paid entry fees) are deducted in full first, regardless of when the cancellation occurs. These are stated on your booking.",
          ],
        },
        {
          heading: "4. How to cancel",
          paragraphs: [
            "Log in to your account and use the booking details page, or email us at info@mysticegypt.net with your booking reference. Cancellation is effective on the date we receive your notice.",
          ],
        },
        {
          heading: "5. Refund timing",
          paragraphs: [
            "Approved refunds are processed within 14 business days. Refunds are returned using the same method used for the original payment where possible.",
          ],
        },
        {
          heading: "6. No-show",
          paragraphs: [
            "If you do not arrive at the agreed meeting point at the agreed time, the booking is treated as a no-show and no refund applies.",
          ],
        },
        {
          heading: "7. Changes by us",
          paragraphs: [
            "If we must cancel a tour for reasons within our control, you may choose a full refund or an alternative tour. We are not liable for cancellations caused by events outside our reasonable control, including natural events, strikes or government restrictions.",
          ],
        },
      ],
    },
    ar: {
      title: "سياسة الإلغاء",
      description:
        "سياسة الإلغاء والاسترداد المتدرجة لكل حجز لدى ميستك إيجيبت.",
      updated: "1 سبتمبر 2026",
      sections: [
        {
          heading: "1. نظرة عامة",
          paragraphs: [
            "إذا احتجت إلى إلغاء حجز، فإن المبلغ المسترد الذي تتلقاه يعتمد على عدد الأيام الكاملة المتبقية قبل تاريخ الجولة. تُحسب الاستردادات على المبلغ الذي دفعته بعد خصم أي تكاليف ثالثية غير قابلة للاسترداد.",
          ],
        },
        {
          heading: "2. درجات الاسترداد",
          paragraphs: [
            "قبل 30 يوماً أو أكثر من تاريخ الجولة: يُعاد 95% من المبلغ القابل للاسترداد؛ ويُحتجز 5% كرسوم إدارية.",
            "من 15 إلى 29 يوماً قبل تاريخ الجولة: يُعاد 50% من المبلغ القابل للاسترداد.",
            "أقل من 15 يوماً قبل تاريخ الجولة: لا يتوفر استرداد.",
          ],
        },
        {
          heading: "3. التكاليف غير القابلة للاسترداد",
          paragraphs: [
            "أي تكاليف ثالثية غير قابلة للاسترداد حُجزت نيابة عنك (مثل تذاكر الرحلات الداخلية أو رسوم الدخول المسددة مسبقاً) تُخصم بالكامل أولاً، بغض النظر عن موعد الإلغاء. وهي مذكورة في حجزك.",
          ],
        },
        {
          heading: "4. كيفية الإلغاء",
          paragraphs: [
            "سجّل الدخول إلى حسابك واستخدم صفحة تفاصيل الحجز، أو راسلنا على info@mysticegypt.net برقم مرجعي لحجزك. يسري الإلغاء اعتباراً من تاريخ استلامنا لإشعارك.",
          ],
        },
        {
          heading: "5. موعد الاسترداد",
          paragraphs: [
            "تُعالج الاستردادات المعتمدة خلال 14 يوم عمل. تُعاد الاستردادات باستخدام نفس وسيلة الدفع الأصلية حيثما أمكن.",
          ],
        },
        {
          heading: "6. عدم الحضور",
          paragraphs: [
            "إذا لم تصل إلى نقطة الالتقاء المتفق عليها في الوقت المحدد، يُعتبر الحجز بمثابة عدم حضور ولا يُطبَّق أي استرداد.",
          ],
        },
        {
          heading: "7. التغييرات من جانبنا",
          paragraphs: [
            "إذا اضطررنا إلى إلغاء جولة لأسباب ضمن سيطرتنا، يمكنك اختيار استرداد كامل أو جولة بديلة. لسنا مسؤولين عن الإلغاءات الناجمة عن أحداث خارجة عن سيطرتنا المعقولة، بما فيها الكوارث الطبيعية أو الإضرابات أو القيود الحكومية.",
          ],
        },
      ],
    },
    de: {
      title: "Stornierungsbedingungen",
      description:
        "Unsere gestaffelte Stornierungs- und Erstattungsrichtlinie für jede Buchung bei Mystic Egypt.",
      updated: "1. September 2026",
      sections: [
        {
          heading: "1. Überblick",
          paragraphs: [
            "Wenn Sie eine Buchung stornieren müssen, hängt die Erstattung von der Anzahl der vollen Tage ab, die vor dem Tourendatum verbleiben. Erstattungen werden auf Grundlage des gezahlten Betrags nach Abzug nicht erstattungsfähiger Drittkosten berechnet.",
          ],
        },
        {
          heading: "2. Erstattungsstufen",
          paragraphs: [
            "30 Tage oder mehr vor dem Tourendatum: 95 % des erstattungsfähigen Betrags werden zurückgezahlt; eine Verwaltungsgebühr von 5 % wird einbehalten.",
            "15 bis 29 Tage vor dem Tourendatum: 50 % des erstattungsfähigen Betrags werden zurückgezahlt.",
            "Weniger als 15 Tage vor dem Tourendatum: keine Erstattung.",
          ],
        },
        {
          heading: "3. Nicht erstattungsfähige Kosten",
          paragraphs: [
            "Nicht erstattungsfähige Drittkosten, die in Ihrem Auftrag gebucht wurden (z. B. Inlandsflugtickets oder vorab bezahlte Eintrittsgebühren), werden unabhängig vom Stornierungszeitpunkt zunächst in voller Höhe abgezogen. Sie sind in Ihrer Buchung ausgewiesen.",
          ],
        },
        {
          heading: "4. So stornieren Sie",
          paragraphs: [
            "Melden Sie sich in Ihrem Konto an und öffnen Sie die Buchungsdetailseite, oder schreiben Sie uns unter info@mysticegypt.net mit Ihrer Buchungsreferenz. Die Stornierung wird zum Datum des Eingangs Ihrer Mitteilung wirksam.",
          ],
        },
        {
          heading: "5. Erstattungszeitraum",
          paragraphs: [
            "Genehmigte Erstattungen werden innerhalb von 14 Werktagen bearbeitet. Wo möglich, erfolgt die Rückzahlung über dieselbe Zahlungsmethode wie die ursprüngliche Zahlung.",
          ],
        },
        {
          heading: "6. Nichterscheinen",
          paragraphs: [
            "Wenn Sie nicht zum vereinbarten Zeitpunkt am vereinbarten Treffpunkt erscheinen, gilt die Buchung als Nichterscheinen und es wird keine Erstattung gewährt.",
          ],
        },
        {
          heading: "7. Änderungen durch uns",
          paragraphs: [
            "Müssen wir eine Tour aus Gründen in unserer Kontrolle stornieren, können Sie zwischen einer vollständigen Erstattung oder einer alternativen Tour wählen. Wir haften nicht für Stornierungen durch Ereignisse außerhalb unserer zumutbaren Kontrolle, einschließlich Naturereignissen, Streiks oder staatlichen Beschränkungen.",
          ],
        },
      ],
    },
  },
  "cookie-policy": {
    en: {
      title: "Cookie Policy",
      description:
        "How Mystic Egypt uses cookies and similar technologies on mysticegypt.net.",
      updated: "1 September 2026",
      sections: [
        {
          heading: "1. What cookies are",
          paragraphs: [
            "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how it is used.",
          ],
        },
        {
          heading: "2. Cookies we use",
          paragraphs: [
            "Essential cookies are required for core features such as signing in, session management and secure payments. These cannot be switched off.",
            "Analytics cookies (Google Analytics 4) help us understand how visitors use the site so we can improve it. They are loaded only after you accept non-essential cookies via our consent banner, and are configured to anonymise data where supported.",
            "Payment-related cookies are set by Stripe when you book, and are governed by Stripe's own cookie policies.",
          ],
        },
        {
          heading: "3. Managing cookies",
          paragraphs: [
            "You can change your cookie choice at any time using the consent banner, and you can block or delete cookies in your browser settings. Blocking essential cookies may prevent parts of the website from working.",
            "You can opt out of Google Analytics tracking using the browser add-on provided by Google.",
          ],
        },
        {
          heading: "4. Contact",
          paragraphs: [
            "For questions about this policy, contact us at info@mysticegypt.net.",
          ],
        },
      ],
    },
    ar: {
      title: "سياسة ملفات الارتباط",
      description:
        "كيف تستخدم ميستك إيجيبت ملفات الارتباط والتقنيات المشابهة على mysticegypt.net.",
      updated: "1 سبتمبر 2026",
      sections: [
        {
          heading: "1. ما هي ملفات الارتباط",
          paragraphs: [
            "ملفات الارتباط هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة موقع إلكتروني. تساعد الموقع على تذكر تفضيلاتك وفهم طريقة استخدامه.",
          ],
        },
        {
          heading: "2. ملفات الارتباط التي نستخدمها",
          paragraphs: [
            "ملفات الارتباط الأساسية ضرورية للميزات الرئيسية مثل تسجيل الدخول وإدارة الجلسة والمدفوعات الآمنة، ولا يمكن تعطيلها.",
            "تساعدنا ملفات الارتباط التحليلية (Google Analytics 4) على فهم كيفية استخدام الزوار للموقع لتحسينه. تُحمَّل فقط بعد موافقتك على ملفات الارتباط غير الأساسية عبر شريط الموافقة، وهي مُهيأة لإخفاء هوية البيانات حيثما كان ذلك مدعوماً.",
            "ملفات الارتباط المتعلقة بالدفع يضعها Stripe عند الحجز، وتخضع لسياسات ملفات الارتباط الخاصة به.",
          ],
        },
        {
          heading: "3. إدارة ملفات الارتباط",
          paragraphs: [
            "يمكنك تغيير اختيارك لملفات الارتباط في أي وقت عبر شريط الموافقة، ويمكنك حظر أو حذف ملفات الارتباط من إعدادات المتصفح. قد يؤدي حظر ملفات الارتباط الأساسية إلى تعطيل أجزاء من الموقع.",
            "يمكنك إلغاء تتبع Google Analytics باستخدام الإضافة التي يوفرها متصفح Google.",
          ],
        },
        {
          heading: "4. التواصل",
          paragraphs: [
            "لأي سؤال حول هذه السياسة تواصل معنا عبر info@mysticegypt.net.",
          ],
        },
      ],
    },
    de: {
      title: "Cookie-Richtlinie",
      description:
        "Wie Mystic Egypt Cookies und ähnliche Technologien auf mysticegypt.net verwendet.",
      updated: "1. September 2026",
      sections: [
        {
          heading: "1. Was Cookies sind",
          paragraphs: [
            "Cookies sind kleine Textdateien, die beim Besuch einer Website auf Ihrem Gerät gespeichert werden. Sie helfen der Website, Ihre Einstellungen zu merken und ihre Nutzung zu verstehen.",
          ],
        },
        {
          heading: "2. Cookies, die wir verwenden",
          paragraphs: [
            "Notwendige Cookies werden für Kernfunktionen wie Anmeldung, Sitzungsverwaltung und sichere Zahlungen benötigt. Sie können nicht deaktiviert werden.",
            "Analyse-Cookies (Google Analytics 4) helfen uns zu verstehen, wie Besucher die Website nutzen, damit wir sie verbessern können. Sie werden erst nach Ihrer Zustimmung zu nicht notwendigen Cookies über unser Einwilligungsbanner geladen und sind, wo unterstützt, zur Anonymisierung von Daten konfiguriert.",
            "Zahlungsbezogene Cookies werden von Stripe gesetzt, wenn Sie buchen, und unterliegen Stripe eigenen Cookie-Richtlinien.",
          ],
        },
        {
          heading: "3. Cookies verwalten",
          paragraphs: [
            "Sie können Ihre Cookie-Auswahl jederzeit über das Einwilligungsbanner ändern und Cookies in Ihren Browsereinstellungen blockieren oder löschen. Das Blockieren notwendiger Cookies kann Teile der Website unbrauchbar machen.",
            "Sie können Google-Analytics-Tracking mit dem Browser-Add-on von Google ablehnen.",
          ],
        },
        {
          heading: "4. Kontakt",
          paragraphs: [
            "Bei Fragen zu dieser Richtlinie kontaktieren Sie uns unter info@mysticegypt.net.",
          ],
        },
      ],
    },
  },
};

export function getPolicyContent(type: PolicyType, locale: string): PolicyContent {
  const l = (locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : defaultLocale;
  const content = CONTENT[type][l] ?? CONTENT[type][defaultLocale];
  if (!content) {
    throw new Error(`Missing policy content for "${type}"`);
  }
  return content;
}