import { PrismaClient } from "../src/core/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

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

  // --- Sample Tours ---
  const existingTours = await prisma.tour.count();
  if (existingTours > 0) {
    console.log("Sample tours already present, skipping.");
  } else {

  const nileTour = await prisma.tour.create({
    data: {
      title: "Classic Nile Cruise & Cairo",
      slug: "classic-nile-cruise-cairo",
      description:
        "A timeless journey along the Nile, from the pyramids of Giza to the temples of Luxor and Aswan. Includes guided tours, Nile cruise accommodation, and local expert guides.",
      inclusions:
        "4-night Nile cruise accommodation\nLicensed Egyptologist tour guides\nAirport transfers & domestic flights\nDaily breakfast & select meals\nAll entrance fees to listed sites",
      exclusions:
        "International flights\nTravel insurance (recommended)\nVisa fees\nPersonal expenses & gratuities",
      base_price: 1499,
      currency: "USD",
      status: "open",
      created_by: admin.id,
      itinerary: {
        create: [
          {
            day_number: 1,
            title: "Arrival & Pyramids of Giza",
            description: "Arrive in Cairo, guided tour of the Pyramids and the Sphinx.",
          },
          {
            day_number: 2,
            title: "Egyptian Museum & Old Cairo",
            description: "Explore the treasures of the Egyptian Museum and historic Cairo.",
          },
          {
            day_number: 3,
            title: "Board the Nile Cruise in Luxor",
            description: "Fly to Luxor, visit Karnak and Luxor temples, board the cruise.",
          },
        ],
      },
      images: {
        create: [
          {
            image_url: "/uploads/tours/nile-cruise-cairo.jpg",
            is_primary: true,
          },
        ],
      },
      route: {
        create: [
          { order: 1, label: "Cairo", lat: 30.0444, lng: 31.2357, is_stop: true },
          {
            order: 2,
            label: "Giza Pyramids",
            lat: 29.9792,
            lng: 31.1342,
            is_stop: true,
          },
          {
            order: 3,
            label: "Luxor",
            lat: 25.6872,
            lng: 32.6396,
            is_stop: true,
          },
          {
            order: 4,
            label: "Karnak Temple",
            lat: 25.7188,
            lng: 32.6573,
            is_stop: true,
          },
          {
            order: 5,
            label: "Aswan",
            lat: 24.0889,
            lng: 32.8998,
            is_stop: true,
          },
        ],
      },
    },
  });

  const desertTour = await prisma.tour.create({
    data: {
      title: "White Desert & Bahariya Oasis Adventure",
      slug: "white-desert-bahariya",
      description:
        "Camp under the stars in Egypt's surreal White Desert, explore crystal mountains, and unwind at Bahariya Oasis hot springs.",
      inclusions:
        "4x4 desert safari transfers\nPrivate licensed desert guide\nCamping equipment & tents\nMeals in the desert\nBottled water & cold drinks",
      exclusions:
        "International flights\nTravel insurance (recommended)\nVisa fees\nTips & personal expenses",
      base_price: 899,
      currency: "USD",
      status: "open",
      created_by: admin.id,
      itinerary: {
        create: [
          {
            day_number: 1,
            title: "Drive to Bahariya Oasis",
            description: "Scenic desert drive, visit the Black Desert and sand dunes.",
          },
          {
            day_number: 2,
            title: "White Desert Camping",
            description: "Explore the White Desert's chalk rock formations and camp overnight.",
          },
        ],
      },
      images: {
        create: [
          {
            image_url: "/uploads/tours/white-desert.jpg",
            is_primary: true,
          },
        ],
      },
      route: {
        create: [
          { order: 1, label: "Cairo", lat: 30.0444, lng: 31.2357, is_stop: true },
          {
            order: 2,
            label: "Bahariya Oasis",
            lat: 28.3366,
            lng: 28.8609,
            is_stop: true,
          },
          {
            order: 3,
            label: "Black Desert",
            lat: 27.9556,
            lng: 28.5295,
            is_stop: true,
          },
          {
            order: 4,
            label: "White Desert",
            lat: 27.3721,
            lng: 28.2309,
            is_stop: true,
          },
        ],
      },
    },
  });

  console.log(`Sample tours created: ${nileTour.slug}, ${desertTour.slug}`);
  }

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
