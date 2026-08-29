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
    },
  });

  const desertTour = await prisma.tour.create({
    data: {
      title: "White Desert & Bahariya Oasis Adventure",
      slug: "white-desert-bahariya",
      description:
        "Camp under the stars in Egypt's surreal White Desert, explore crystal mountains, and unwind at Bahariya Oasis hot springs.",
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
