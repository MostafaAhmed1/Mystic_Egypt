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
    return;
  }

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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
