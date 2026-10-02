import { PrismaClient } from "../src/core/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import { seedTours } from "./seed-tours";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@mysticegypt.net";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Site Administrator";

async function main() {
  // --- Admin user ---
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: "ADMIN",
      email_verified: true,
      is_2fa_verified: false,
    },
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password_hash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "ADMIN",
      email_verified: true,
      is_2fa_verified: false,
    },
  });

  console.log(`Admin ready: ${admin.email}`);

  // --- Sample Add-ons (upsert so they exist even when tours are already seeded) ---
  const sampleAddons = [
    {
      name: "Airport transfer (round trip)",
      description: "Private transfer from Cairo airport to your hotel and back.",
      price: 60,
    },
    {
      name: "Nile dinner cruise",
      description: "Evening dinner cruise with live entertainment on the Nile.",
      price: 75,
    },
    {
      name: "Hot air balloon (Luxor)",
      description: "Sunrise hot air balloon ride over the Valley of the Kings.",
      price: 120,
    },
    {
      name: "Photo & drone package",
      description: "Professional photography and licensed drone footage of your trip.",
      price: 90,
    },
  ] as const;

  for (const addon of sampleAddons) {
    await prisma.addon.upsert({
      where: { id: addon.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {
        description: addon.description,
        price: addon.price,
      },
      create: {
        id: addon.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: addon.name,
        description: addon.description,
        price: addon.price,
        currency: "USD",
      },
    });
  }
  console.log("Sample add-ons ready.");

  const homepageCategories = [
    {
      slug: "desert-safari",
      name_en: "Desert Safari",
      name_ar: "رحلات الصحراء",
      name_de: "Wüsten-Safari",
      image_url: "/uploads/categories/desert-safari.webp",
      sort_order: 1,
    },
    {
      slug: "city-cultural-tours",
      name_en: "City & Cultural Tours",
      name_ar: "رحلات المدن والثقافة",
      name_de: "Stadt- und Kulturtouren",
      image_url: "/uploads/categories/city-cultural-tours.webp",
      sort_order: 2,
    },
    {
      slug: "entertainment-nightlife",
      name_en: "Entertainment & Nightlife",
      name_ar: "الترفيه والحياة الليلية",
      name_de: "Unterhaltung und Nachtleben",
      image_url: "/uploads/categories/entertainment-nightlife.webp",
      sort_order: 3,
    },
    {
      slug: "island-boat-trips",
      name_en: "Island & Boat Trips",
      name_ar: "رحلات الجزر والقوارب",
      name_de: "Insel- und Bootstouren",
      image_url: "/uploads/categories/island-boat-trips.webp",
      sort_order: 4,
    },
    {
      slug: "water-activities",
      name_en: "Water Activities",
      name_ar: "الأنشطة المائية",
      name_de: "Wasseraktivitäten",
      image_url: "/uploads/categories/water-activities.webp",
      sort_order: 5,
    },
    {
      slug: "private-yacht-tours",
      name_en: "Private Yacht Tours",
      name_ar: "رحلات اليخوت الخاصة",
      name_de: "Private Yacht-Touren",
      image_url: "/uploads/categories/private-yacht-tours.webp",
      sort_order: 6,
    },
  ] as const;

  for (const category of homepageCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name_en: category.name_en,
        name_ar: category.name_ar,
        name_de: category.name_de,
        image_url: category.image_url,
        sort_order: category.sort_order,
        is_active: true,
      },
      create: { ...category, is_active: true },
    });
  }

  const homepageServices = [
    {
      slug: "hotel-reservations",
      name_en: "Hotel Reservations",
      name_ar: "حجز الفنادق",
      name_de: "Hotelreservierungen",
      description_en: "Handpicked stays with comfort, character, and confidence.",
      description_ar: "إقامات مختارة بعناية توفر الراحة والطابع الخاص والاطمئنان.",
      description_de: "Ausgewählte Unterkünfte mit Komfort, Charakter und Sicherheit.",
      icon: "hotel",
      sort_order: 1,
    },
    {
      slug: "flight-reservations",
      name_en: "Flight Reservations",
      name_ar: "حجز الطيران",
      name_de: "Flugbuchungen",
      description_en: "Smooth flight planning for a seamless Egyptian journey.",
      description_ar: "تخطيط سهل للرحلات الجوية لرحلة مصرية سلسة.",
      description_de: "Einfache Flugplanung für eine reibungslose Reise durch Ägypten.",
      icon: "plane",
      sort_order: 2,
    },
    {
      slug: "airport-transfers",
      name_en: "Airport Transfers",
      name_ar: "نقل المطارات",
      name_de: "Flughafentransfers",
      description_en: "Reliable private transfers from arrival to departure.",
      description_ar: "نقل خاص موثوق من الوصول حتى المغادرة.",
      description_de: "Zuverlässige private Transfers von der Ankunft bis zur Abreise.",
      icon: "car",
      sort_order: 3,
    },
    {
      slug: "guided-tours",
      name_en: "Guided Tours",
      name_ar: "الجولات المصحوبة بمرشد",
      name_de: "Geführte Touren",
      description_en: "Local expertise and memorable journeys across Egypt.",
      description_ar: "خبرة محلية ورحلات لا تُنسى في جميع أنحاء مصر.",
      description_de: "Lokales Wissen und unvergessliche Reisen durch Ägypten.",
      icon: "compass",
      sort_order: 4,
    },
  ] as const;

  for (const service of homepageServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name_en: service.name_en,
        name_ar: service.name_ar,
        name_de: service.name_de,
        description_en: service.description_en,
        description_ar: service.description_ar,
        description_de: service.description_de,
        icon: service.icon,
        sort_order: service.sort_order,
        is_active: true,
      },
      create: { ...service, is_active: true },
    });
  }
  console.log("Homepage categories and services ready.");

  await seedTours(prisma, admin.id);


  // --- CMS Pages ---
  const cmsPages = [
    {
      slug: "about",
      title: "About Mystic Egypt",
      content: `<h2>Our Story</h2>
<p>Mystic Egypt is a UK-registered tour operator specializing in authentic, luxurious experiences across Egypt. Founded by a team of passionate Egyptologists and travel experts, we bridge the gap between ancient wonders and modern comfort.</p>

<h2>Our Mission</h2>
<p>To provide safe, immersive, and unforgettable journeys through Egypt's most iconic and hidden destinations — while supporting local communities and preserving cultural heritage.</p>

<h2>Why Choose Us</h2>
<ul>
<li><strong>UK-Registered:</strong> Full compliance with UK travel regulations and ATOL protection.</li>
<li><strong>Local Experts:</strong> Licensed Egyptian guides with deep historical knowledge.</li>
<li><strong>Tailored Experiences:</strong> Every tour can be customized to your interests and pace.</li>
<li><strong>Transparent Pricing:</strong> No hidden fees. What you see is what you pay.</li>
</ul>

<h2>Contact</h2>
<p>Email: info@mysticegypt.net<br/>
WhatsApp: +44 7XXX XXX XXX</p>`,
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      content: `<h2>Introduction</h2>
<p>Mystic Egypt ("we", "our", "us") respects your privacy. This policy explains how we collect, use, and protect your personal data when you use our website and services.</p>

<h2>Data We Collect</h2>
<ul>
<li><strong>Account Data:</strong> Name, email address, and encrypted password when you create an account.</li>
<li><strong>Booking Data:</strong> Tour selections, travel dates, add-on preferences, and payment method details.</li>
<li><strong>Payment Data:</strong> Stripe processes all card payments. We never store credit card numbers on our servers.</li>
<li><strong>Usage Data:</strong> Pages visited, search queries, and browser information for analytics.</li>
</ul>

<h2>How We Use Your Data</h2>
<ul>
<li>To process bookings and deliver tour services.</li>
<li>To communicate booking confirmations, updates, and support.</li>
<li>To improve our website and services.</li>
<li>To comply with legal obligations.</li>
</ul>

<h2>Data Sharing</h2>
<p>We share your data only with:</p>
<ul>
<li><strong>Stripe:</strong> For payment processing (PCI-DSS compliant).</li>
<li><strong>Tour Operators:</strong> Limited booking details to fulfill your tour.</li>
<li><strong>Resend:</strong> For transactional emails (booking confirmations, password resets).</li>
</ul>

<h2>Your Rights</h2>
<p>Under UK GDPR, you have the right to:</p>
<ul>
<li>Access your personal data.</li>
<li>Correct inaccurate data.</li>
<li>Request deletion of your data.</li>
<li>Object to processing of your data.</li>
</ul>
<p>To exercise these rights, contact us at privacy@mysticegypt.net.</p>

<h2>Data Retention</h2>
<p>We retain your data for as long as your account is active or as needed to provide services. Booking records are retained for 7 years for tax and legal compliance.</p>

<h2>Security</h2>
<p>We implement industry-standard security measures including encryption, secure authentication, and regular security audits.</p>

<h2>Updates</h2>
<p>We may update this policy from time to time. Changes will be posted on this page with an updated revision date.</p>`,
    },
    {
      slug: "terms",
      title: "Terms & Conditions",
      content: `<h2>1. Acceptance of Terms</h2>
<p>By accessing and using the Mystic Egypt website and services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>

<h2>2. Booking & Payment</h2>
<ul>
<li>A booking is confirmed only upon receipt of payment (full or deposit as specified).</li>
<li>Prices are quoted in USD unless otherwise stated.</li>
<li>Stripe processes all card payments. We do not store credit card details.</li>
<li>Bank transfer bookings are confirmed only after payment is received and verified.</li>
</ul>

<h2>3. Cancellation Policy</h2>
<ul>
<li><strong>More than 30 days before departure:</strong> Full refund minus administrative fee.</li>
<li><strong>15–30 days before departure:</strong> 50% refund.</li>
<li><strong>Less than 15 days before departure:</strong> No refund.</li>
<li><strong>No-show:</strong> No refund.</li>
</ul>

<h2>4. Travel Requirements</h2>
<ul>
<li>Valid passport required (minimum 6 months validity from travel date).</li>
<li>Visa requirements vary by nationality — please check with your local Egyptian embassy.</li>
<li>Travel insurance is strongly recommended.</li>
</ul>

<h2>5. Health & Safety</h2>
<p>Your safety is our priority. All tours comply with Egyptian tourism regulations. Participants must disclose relevant health conditions. Mystic Egypt reserves the right to modify itineraries for safety reasons.</p>

<h2>6. Liability</h2>
<p>Mystic Egypt acts as an intermediary between travelers and local tour operators. We are not liable for:</p>
<ul>
<li>Acts of God, natural disasters, or political instability.</li>
<li>Personal injury caused by third-party operators.</li>
<li>Loss of personal belongings.</li>
</ul>

<h2>7. Intellectual Property</h2>
<p>All content on this website (images, text, logos) is the property of Mystic Egypt and protected by international copyright laws.</p>

<h2>8. Governing Law</h2>
<p>These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

<h2>9. Contact</h2>
<p>For questions about these terms, contact us at legal@mysticegypt.net.</p>`,
    },
  ];

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        published: true,
      },
      create: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        published: true,
        created_by: admin.id,
      },
    });
  }
  console.log("CMS pages ready: about, privacy, terms");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
