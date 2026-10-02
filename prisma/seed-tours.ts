import "dotenv/config";
import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "../src/core/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

type Day = { day_number: number; title: string; description: string };
type CatalogTour = {
  slug: string;
  title: string;
  description: string;
  duration: string | null;
  price: number;
  image: string;
  inclusions?: string | null;
  exclusions?: string | null;
  itinerary?: Day[];
  /** Featured in the homepage hot-offers bar/section. */
  isOffer?: boolean;
};

const usd = (eur: number) => Math.round(eur * 1.1355);
const image = (subject: string) => `/uploads/tours/catalog/${subject}.webp`;

const safari: Day = {
  day_number: 1,
  title: "Super Desert Safari",
  description: "Jeep transfer from the hotel. Beach buggy ride (about 20 minutes) and spider car ride (about 20 minutes). Jeep tour through the desert and into the mountains for approximately 25–35 km (about 2 hours). Camel ride and a look at Bedouin life. Dinner and drinks, followed by belly dancing, tanoura and fireworks. Total excursion: about 7 hours.",
};
const city: Day = {
  day_number: 2,
  title: "Hurghada City Tour",
  description: "Tour Hurghada, visiting the marina, mosque, church, markets and main sights. About 6–7 hours.",
};
const orange: Day = {
  day_number: 3,
  title: "Orange Bay Island",
  description: "Round-trip transfer, two snorkeling stops and about 2–3 hours of free time on the island. Lunch on the boat and drinks throughout the trip. Total excursion: about 7 hours.",
};
const panorama = (day_number: number): Day => ({
  day_number,
  title: "Sea Panorama & Parasailing",
  description: "Panorama semi-submarine: view Red Sea coral reefs and fish, with snorkeling (about 2 hours). Parasailing over the Red Sea (about 45 minutes).",
});
const cairoDay = (day_number: number): Day => ({
  day_number,
  title: "Cairo Day Trip",
  description: "Round-trip transfer from Hurghada. Visit the pyramids and Sphinx, then either the Grand Egyptian Museum or the Egyptian Museum. Lunch and drinks; return to Hurghada in the evening. Approximately a full day.",
});
const luxorDay: Day = {
  day_number: 5,
  title: "Luxor Day Trip",
  description: "Round-trip transfer from Hurghada. Visit Karnak Temple, Hatshepsut Temple and the Valley of the Kings. Lunch and drinks throughout the trip; return to Hurghada in the evening. Approximately a full day.",
};

const catalog: CatalogTour[] = [
  { slug: "cairo", title: "Cairo City Tour", description: "Explore the Giza pyramids and Sphinx, the treasures of the Egyptian Museum and the lanes of Khan el-Khalili with a licensed Egyptologist.", duration: "1 Day", price: usd(250), image: image("cairo-pyramids"), inclusions: "Licensed Egyptologist guide", isOffer: true },
  { slug: "nile-trip-cairo", title: "Cairo Nile Trip", description: "Sail the Nile in Cairo on a traditional boat, taking in the city lights and landmarks from the water, with dinner on board and folkloric entertainment.", duration: "1 Day", price: usd(50), image: image("cairo-nile-boat"), inclusions: "Dinner on board\nFolkloric entertainment" },
  { slug: "luxor", title: "Luxor Trip", description: "Explore Karnak and Luxor temples on the east bank, and the Valley of the Kings, Hatshepsut Temple and the Colossi of Memnon on the west bank.", duration: "1 Day", price: usd(250), image: image("luxor-karnak"), isOffer: true },
  { slug: "aswan", title: "Aswan Trip", description: "Discover the High Dam, Unfinished Obelisk, Philae Temple by boat, Botanical Garden and Nubian Village along the Nile at Aswan.", duration: "2 Days", price: usd(300), image: image("aswan-philae") },
  { slug: "abydos-dendera-temples", title: "Abydos & Dendera Temples", description: "Visit the Temple of Seti I at Abydos and the well-preserved Temple of Hathor at Dendera in Sohag and Qena.", duration: "1 Day", price: usd(105), image: image("abydos-dendera") },
  { slug: "alexandria", title: "Alexandria Trip", description: "Visit the Bibliotheca Alexandrina, the Catacombs of Kom el-Shoqafa, Pompey's Pillar and the seafront Corniche, with glimpses of the city's royal heritage.", duration: "1 Day", price: usd(120), image: image("alexandria-library") },
  { slug: "hurghada", title: "Hurghada Day Trip", description: "Enjoy the Red Sea with a snorkeling or glass-bottom boat trip and free time on the beaches. An optional desert safari and quad biking are also available.", duration: "1 Day", price: usd(45), image: image("hurghada-red-sea"), isOffer: true },
  { slug: "sharm-el-sheikh", title: "Sharm El Sheikh Trip", description: "Snorkel at Ras Mohammed, see the sea from a glass-bottom boat and explore Naama Bay. Stargazing in the Sinai desert is optional.", duration: "1 Day", price: usd(75), image: image("sharm-ras-mohammed") },
  { slug: "marsa-alam", title: "Marsa Alam Trip", description: "Explore Red Sea snorkeling and diving sites, pristine beaches and dolphin watching in the deep blue waters of Marsa Alam.", duration: "1 Day", price: usd(50), image: image("marsa-alam-reef") },
  { slug: "dahab", title: "Dahab Trip", description: "Visit the Blue Hole and the Canyon, see sunrise at Mount Sinai and relax on Dahab's beach on the Gulf of Aqaba.", duration: "1 Day", price: usd(120), image: image("dahab-blue-hole") },
  { slug: "white-desert-bahariya", title: "White Desert & Bahariya Oasis Adventure", description: "Camp under the stars in the White Desert, explore the crystal mountains and relax in the hot springs of Bahariya Oasis.", duration: null, price: 899, image: image("white-desert") },
  { slug: "fayoum", title: "Fayoum Oasis Trip", description: "Discover Fayoum's gardens and lakes, cross Lake Qarun, see the historic waterwheels and visit the waterfalls of Wadi El Rayan.", duration: "1 Day", price: usd(110), image: image("fayoum-waterfalls"), isOffer: true },
  { slug: "siwa-oasis", title: "Siwa Oasis Trip", description: "Explore the Temple of Amun, Mountain of the Dead, salt lakes and hot springs, and camp under the stars in Siwa Oasis.", duration: "2 Days", price: usd(500), image: image("siwa-oasis") },
  { slug: "classic-nile-cruise-cairo", title: "Classic Nile Cruise & Cairo", description: "Travel along the Nile from the Giza pyramids to the temples of Luxor and Aswan, with guided tours, Nile cruise accommodation and expert local guides.", duration: null, price: 1499, image: image("nile-cruise"), inclusions: "Guided tours\nNile cruise accommodation\nExpert local guides", isOffer: true },
  { slug: "hurghada-cairo-trip-program", title: "Hurghada & Cairo Excursions Programme", description: "Five days of Hurghada desert and sea activities, Orange Bay and a day trip to Cairo's pyramids and museum.", duration: "5 Days", price: usd(1850), image: image("cairo-pyramids"), itinerary: [safari, city, orange, panorama(4), cairoDay(5)] },
  { slug: "hurghada-luxor-excursions-program", title: "Hurghada & Luxor Excursions Programme", description: "Five days of Hurghada desert and sea activities, Orange Bay and a day trip to Luxor's temples and the Valley of the Kings.", duration: "5 Days", price: usd(1750), image: image("luxor-karnak"), itinerary: [safari, city, orange, panorama(4), luxorDay] },
  { slug: "hurghada-luxor-cairo-excursions-program", title: "Hurghada, Luxor & Cairo Excursions Programme", description: "Five days combining Hurghada's desert and Red Sea with day trips to Cairo and Luxor.", duration: "5 Days", price: 1999, image: image("cairo-pyramids"), itinerary: [safari, city, panorama(3), cairoDay(4), luxorDay] },
  { slug: "hurghada-excursions-program", title: "Hurghada Excursions Programme", description: "Five days of Hurghada desert safari, city sights, Red Sea activities, Orange Bay and dolphin show with horse riding.", duration: "5 Days", price: usd(1650), image: image("hurghada-red-sea"), itinerary: [safari, { ...city, description: "Tour Hurghada, visiting the marina, markets, mosque, church and main sights. About 6–7 hours." }, panorama(3), { ...orange, day_number: 4 }, { day_number: 5, title: "Dolphin Show & Horse Riding", description: "Dolphin show (about 1 hour); swimming with a dolphin is optional and costs extra. Horse ride on the beach or in the desert (about 1.5–2 hours)." }] },
  { slug: "hurghada-beginner-diving-two-stops", title: "Hurghada Beginner Diving (Two Stops)", description: "A full-day beginner diving trip exploring Red Sea reefs, with lunch and hotel pickup and return.", duration: "7 Hours", price: 40, image: image("hurghada-diving"), inclusions: "Lunch\nHotel pickup and return" },
  { slug: "hurghada-dolphin-show", title: "Hurghada Dolphin Show", description: "Watch a dolphin show suitable for the whole family.", duration: "2 Hours", price: 25, image: image("hurghada-dolphins") },
  { slug: "hurghada-desert-jeep-safari", title: "Hurghada Desert Jeep Safari", description: "Explore the desert landscape around Hurghada by jeep.", duration: "3 Hours", price: 16, image: image("hurghada-desert-safari") },
  { slug: "hurghada-buggy-camel-safari", title: "Hurghada Buggy & Camel Safari", description: "Drive a buggy through the sand dunes and ride a camel in the Hurghada desert.", duration: "3 Hours", price: 95, image: image("hurghada-desert-safari") },
  { slug: "hurghada-family-quad-buggy-dinner", title: "Hurghada Family Quad & Buggy Safari with Dinner", description: "A family desert adventure by quad and buggy, ending with dinner under the desert sky.", duration: "3 Hours", price: 20, image: image("hurghada-desert-safari"), inclusions: "Dinner" },
  { slug: "hurghada-horse-riding-beach-swim", title: "Hurghada Horse Riding & Beach Swim", description: "Three hours of horse riding by the sea with a swim at the beach.", duration: "3 Hours", price: 35, image: image("hurghada-horse-riding") },
  { slug: "hurghada-two-hour-horse-riding", title: "Hurghada Two-Hour Horse Riding", description: "A relaxed horse riding experience in natural surroundings.", duration: "2 Hours", price: 30, image: image("hurghada-horse-riding") },
  { slug: "hurghada-luxor-bus-tour", title: "Luxor Bus Tour from Hurghada", description: "Travel by bus from Hurghada for a guided visit to Luxor's temples.", duration: "18 Hours", price: 45, image: image("luxor-karnak") },
  { slug: "luxor-hot-air-balloon", title: "Luxor Hot Air Balloon", description: "See sunrise or sunset above the temples of the Valley of the Kings from a hot air balloon.", duration: "1 Hour", price: 65, image: image("luxor-balloon") },
  { slug: "hurghada-cairo-pyramids-bus-tour", title: "Cairo & Pyramids Bus Tour from Hurghada", description: "Travel by bus from Hurghada to the Giza pyramids and Egyptian Museum with a tour guide.", duration: "22 Hours", price: 60, image: image("cairo-pyramids"), inclusions: "Tour guide" },
  { slug: "hurghada-city-crafts-shopping", title: "Hurghada City & Crafts Shopping Tour", description: "See Hurghada's main sights and enjoy an opportunity to shop for local crafts and souvenirs.", duration: "3 Hours", price: 8, image: image("hurghada-marina") },
  { slug: "el-gouna-private-tour-transfer", title: "Private El Gouna Tour with Transfer", description: "Explore El Gouna and its canals on a private introductory tour with transfer.", duration: "1 Hour (tour)", price: 19, image: image("el-gouna-canals"), inclusions: "Transfer" },
  { slug: "hurghada-airport-hotel-transfer", title: "Hurghada Airport to Hotel Transfer", description: "Transfer from Hurghada airport to your hotel on arrival.", duration: "Varies by hotel location", price: 5, image: image("hurghada-airport") },
];

function isLocalImage(url: string): boolean {
  if (!url.startsWith("/uploads/") || url.includes("..") || !/\.(webp|png|jpe?g)$/i.test(url)) return false;
  const path = join(fileURLToPath(new URL("../public/", import.meta.url)), url.slice(1));
  return existsSync(path) && statSync(path).isFile();
}

export async function seedTours(prisma: PrismaClient, adminId: string): Promise<void> {
  for (const item of catalog) {
    await prisma.$transaction(async (tx) => {
      const tour = await tx.tour.upsert({
        where: { slug: item.slug },
        update: { title: item.title, description: item.description, duration: item.duration, base_price: item.price, currency: "USD", inclusions: item.inclusions ?? null, exclusions: item.exclusions ?? null, ...(item.isOffer !== undefined ? { isOffer: item.isOffer } : {}) },
        create: { title: item.title, slug: item.slug, description: item.description, duration: item.duration, base_price: item.price, currency: "USD", inclusions: item.inclusions ?? null, exclusions: item.exclusions ?? null, isOffer: item.isOffer ?? false, created_by: adminId },
      });

      if (item.itinerary) {
        await tx.tourItinerary.deleteMany({ where: { tour_id: tour.id } });
        await tx.tourItinerary.createMany({ data: item.itinerary.map((day) => ({ ...day, tour_id: tour.id })) });
      } else {
        await tx.tourItinerary.deleteMany({ where: { tour_id: tour.id } });
      }

      const images = await tx.tourImage.findMany({ where: { tour_id: tour.id }, orderBy: { id: "asc" } });
      const primary = images.find((existing) => existing.image_url === item.image) ?? images.find((existing) => existing.is_primary);
      if (primary) {
        await tx.tourImage.update({ where: { id: primary.id }, data: { image_url: item.image, is_primary: true } });
      } else {
        await tx.tourImage.create({ data: { tour_id: tour.id, image_url: item.image, is_primary: true } });
      }
      const discard = images.filter((existing) => existing.id !== primary?.id && (existing.is_primary || existing.image_url === item.image || !isLocalImage(existing.image_url)));
      if (discard.length) await tx.tourImage.deleteMany({ where: { id: { in: discard.map((existing) => existing.id) } } });
    });
  }
  console.log(`Tour catalog ready: ${catalog.length} products.`);
}

if (process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL environment variable is not set.");
  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(connectionString) });
  try {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { created_at: "asc" }, select: { id: true } });
    if (!admin) throw new Error("An existing admin user is required to seed tours.");
    await seedTours(prisma, admin.id);
  } finally {
    await prisma.$disconnect();
  }
}
