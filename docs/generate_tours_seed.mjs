/**
 * Generates a full SQL seed file for the 16 tours migrated from hellomysticegypt.com.
 *
 * - Reads docs/trips_parsed.json (source prices/durations)
 * - Assigns clean slugs, placeholder descriptions, inclusions, exclusions, and
 *   destination-aware placeholder itineraries.
 * - Outputs docs/tours_seed_full.sql ready for `mysql` on the production VPS.
 *
 * Run: node docs/generate_tours_seed.mjs
 */
import { readFileSync, writeFileSync } from "fs";

/* Destination-aware placeholder content (to be reviewed/fixed by the client) */
const TOUR_CONTENT = {
  fayoum: {
    title: "Fayoum Oasis",
    description:
      "Discover the lush Fayoum Oasis, Egypt's oldest oasis and a haven of green orchards, serene lakes and desert camps. Cross the remarkable Qarun Lake, tour the historic Water Wheels and visit Wadi El Rayan waterfalls on this relaxing escape from Cairo.",
    inclusions: [
      "Private air-conditioned vehicle with driver",
      "English-speaking Egyptologist guide (placeholder)",
      "Hotel pickup and drop-off in Cairo",
      "Bottled water during the tour (placeholder)",
      "Entry fees to all mentioned sites",
    ],
    exclusions: [
      "Lunch and personal expenses",
      "Tips and gratuities",
      "Quad bike / sand-boarding activities (optional)",
    ],
    itinerary: [
      {
        day: 1,
        title: "Fayoum Oasis & Qarun Lake",
        description:
          "Depart Cairo in the morning, travel to the Fayoum oasis, explore Qarun Lake (placeholder), Wadi El Rayan waterfalls and the traditional water wheels before returning to Cairo (placeholder).",
      },
    ],
  },
  cairo: {
    title: "Cairo City Tour",
    description:
      "Explore the heart of Cairo: the world-famous Pyramids of Giza and the Sphinx, the treasures of the Egyptian Museum, and the vibrant lanes of Khan El Khalili bazaar, all guided by a certified Egyptologist.",
    inclusions: [
      "Private air-conditioned vehicle with driver",
      "Certified Egyptologist guide",
      "Hotel pickup and drop-off",
      "Bottled water",
      "Entry fees to the Pyramids plateau & Egyptian Museum",
    ],
    exclusions: [
      "Lunch and personal expenses",
      "Tips and gratuities",
      "Entry inside the Great Pyramid (optional)",
    ],
    itinerary: [
      {
        day: 1,
        title: "Pyramids, Museum & Old Cairo",
        description:
          "Visit the Pyramids of Giza and the Sphinx, transfer to the Egyptian Museum of Antiquities, then walk through the historic Khan El Khalili bazaar (placeholder).",
      },
    ],
  },
  luxor: {
    title: "Luxor Tour",
    description:
      "Step into the world's greatest open-air museum: Karnak and Luxor temples on the East Bank, and the Valley of the Kings, Hatshepsut Temple and the Colossi of Memnon on the West Bank of Luxor.",
    inclusions: [
      "Private air-conditioned vehicle with driver",
      "Certified Egyptologist guide",
      "Hotel pickup and drop-off in Luxor",
      "Bottled water",
      "Entry fees to Karnak, Valley of the Kings & Hatshepsut Temple",
    ],
    exclusions: [
      "Lunch and personal expenses",
      "Tips and gratuities",
      "Extra entry: Tutankhamun tomb, Deir el-Medina (optional)",
    ],
    itinerary: [
      {
        day: 1,
        title: "East & West Bank of Luxor",
        description:
          "Start with Karnak Temple, cross the Nile to the Valley of the Kings, visit Hatshepsut's Temple and stop at the Colossi of Memnon (placeholder).",
      },
    ],
  },
  aswan: {
    title: "Aswan Tour",
    description:
      "Sail the tranquil waters of the Nile in Aswan: the High Dam, the Unfinished Obelisk, Philae Temple by boat, the Botanical Garden and the colourful Nubian village, all in two unforgettable days.",
    inclusions: [
      "Private air-conditioned vehicle with driver",
      "Certified Egyptologist guide",
      "Hotel pickup and drop-off in Aswan",
      "Felucca ride on the Nile (placeholder)",
      "Entry fees to Philae Temple & the High Dam",
    ],
    exclusions: [
      "Lunch and personal expenses",
      "Tips and gratuities",
      "Nubian museum tickets (optional)",
    ],
    itinerary: [
      {
        day: 1,
        title: "High Dam, Obelisk & Philae Temple",
        description:
          "Tour the Aswan High Dam and the Unfinished Obelisk, then take a boat to the majestic Philae Temple of Isis and explore the Nubian village (placeholder).",
      },
      {
        day: 2,
        title: "Nile & Nubia",
        description:
          "Enjoy a relaxing felucca sail around Elephantine Island and the Botanical Garden, with free time to explore Aswan before returning in the evening (placeholder).",
      },
    ],
  },
  alexandria: {
    title: "Alexandria Tour",
    description:
      "Visit Egypt's Mediterranean bride: the Bibliotheca Alexandrina, the Catacombs of Kom El Shoqafa, Pompey's Pillar and the coastal sweep of the Corniche, with glimpses of the royal heritage of Alexandria.",
    inclusions: [
      "Private air-conditioned vehicle with driver",
      "English-speaking guide",
      "Hotel pickup and drop-off in Alexandria",
      "Bottled water",
      "Entry fees to the Catacombs & Bibliotheca (placeholder)",
    ],
    exclusions: [
      "Lunch and personal expenses",
      "Tips and gratuities",
      "Qaitbay Castle entry (optional)",
    ],
    itinerary: [
      {
        day: 1,
        title: "Alexandria City Highlights",
        description:
          "Explore the Bibliotheca Alexandrina (placeholder), the Catacombs of Kom El Shoqafa and Pompey's Pillar, then enjoy the Corniche and coastal promenade (placeholder).",
      },
    ],
  },
  "nile-trip-cairo": {
    title: "Nile Trip (Cairo)",
    description:
      "An authentic Cairo Nile experience: board a traditional Nile boat and soak up the city lights and landmarks from the water, with a delicious onboard dinner and folklore entertainment.",
    inclusions: [
      "Nile boat cruise with dinner",
      "Belly-dancing & Tanoura folklore show (placeholder)",
      "Hotel pickup and drop-off in Cairo",
      "Soft drinks and tea onboard",
    ],
    exclusions: [
      "Extra beverages",
      "Tips and gratuities",
      "Private cabin (for overnight cruises only)",
    ],
    itinerary: [
      {
        day: 1,
        title: "Sunset Nile Dinner Cruise",
        description:
          "Board the Nile cruise at dusk, enjoy the Cairo skyline and landmarks from the water, followed by a buffet dinner and live folklore entertainment (placeholder).",
      },
    ],
  },
  hurghada: {
    title: "Hurghada Day Trip",
    description:
      "A fun-filled day on the Red Sea: an optional desert safari and quad-bike ride, a snorkeling or glass-bottom boat excursion, and free time on the golden beaches of Hurghada.",
    inclusions: [
      "Private or shared transfers",
      "Snorkeling / glass-bottom boat trip (placeholder)",
      "Lunch on the boat (placeholder)",
      "Beach free time",
      "Bottled water",
    ],
    exclusions: [
      "Photo & video packages",
      "Tips and gratuities",
      "Personal expenses",
    ],
    itinerary: [
      {
        day: 1,
        title: "Red Sea & Beach Day",
        description:
          "Red Sea snorkeling or boat trip in the morning, followed by beach time and optional desert safari in the afternoon (placeholder).",
      },
    ],
  },
  "marsa-alam": {
    title: "Marsa Alam Tour",
    description:
      "Discover the unspoiled Red Sea of Marsa Alam: world-class snorkeling and diving sites, pristine beaches, and the famous dolphins of the deep blue waters.",
    inclusions: [
      "Private transfers",
      "Snorkeling / diving trip with equipment (placeholder)",
      "Lunch on the boat",
      "Bottled water",
    ],
    exclusions: [
      "Extra equipment rental",
      "Tips and gratuities",
      "Personal expenses",
    ],
    itinerary: [
      {
        day: 1,
        title: "Snorkeling, Diving & Beaches",
        description:
          "Snorkel or dive the coral reefs of Marsa Alam (placeholder), enjoy the pristine beaches and a boat lunch before returning to the resort.",
      },
    ],
  },
  "siwa-oasis": {
    title: "Siwa Oasis Tour",
    description:
      "Venture deep into the Western Desert to the legendary Siwa Oasis: the Oracle Temple of Amun, the Mountain of the Dead, salt lakes and hot springs, and camp beneath the vast desert stars.",
    inclusions: [
      "Private 4x4 transfers from Cairo",
      "English-speaking Bedouin guide",
      "Two nights accommodation (placeholder)",
      "Orange & olive farm visit (Siwa signature)",
      "Camping equipment for one desert night",
      "All meals during the tour",
    ],
    exclusions: [
      "Flights",
      "Personal expenses",
      "Tips and gratuities",
    ],
    itinerary: [
      {
        day: 1,
        title: "Drive to Siwa & Town Highlights",
        description:
          "Long 4x4 drive across the desert to Siwa, then visit the Temple of Amun Oracle, the Mountain of the Dead and the salt lakes at sunset (placeholder).",
      },
      {
        day: 2,
        title: "Desert Camping & Springs",
        description:
          "Explore the date and olive groves, swim in Cleopatra's hot springs, then overnight camping (optional) in the Great Sand Sea dunes before returning (placeholder).",
      },
    ],
  },
  "abydos-dendera-temples": {
    title: "Abydos & Dendera Temples Tour",
    description:
      "A deep, off-the-beaten-path day tour to two of Egypt's most magnificent temples: the Temple of Seti I at Abydos and the beautifully preserved Hathor Temple at Dendera.",
    inclusions: [
      "Private air-conditioned vehicle with driver",
      "Certified Egyptologist guide (placeholder)",
      "Hotel pickup and drop-off in Luxor",
      "Bottled water",
      "Entry fees to Abydos & Dendera temples",
    ],
    exclusions: [
      "Lunch and personal expenses",
      "Tips and gratuities",
    ],
    itinerary: [
      {
        day: 1,
        title: "Abydos & Dendera",
        description:
          "Drive to Abydos to visit the temple of Seti I, then continue to Dendera to admire the magnificent Hathor temple before returning to Luxor (placeholder).",
      },
    ],
  },
  "sharm-el-sheikh": {
    title: "Sharm El Sheikh Tour",
    description:
      "Enjoy the Red Sea Riviera of Sharm El Sheikh: snorkeling at Ras Mohammed, glass-bottom boats, the charm of Naama Bay and optional desert stargazing under Sinai's clear skies.",
    inclusions: [
      "Private or shared transfers",
      "Snorkeling trip to Ras Mohammed (placeholder)",
      "Lunch on the boat",
      "Bottled water",
    ],
    exclusions: [
      "Diving course fees",
      "Tips and gratuities",
      "Personal expenses",
    ],
    itinerary: [
      {
        day: 1,
        title: "Ras Mohammed, Naama Bay & Desert",
        description:
          "Snorkel at Ras Mohammed National Park (placeholder), relax at Naama Bay, and optionally enjoy a desert safari and Bedouin dinner in the evening.",
      },
    ],
  },
  "hurghada-cairo-trip-program": {
    title: "Hurghada – Cairo Trip Program",
    description:
      "An 8-day package combining the Red Sea charm of Hurghada with the pyramids and museums of Cairo. Includes flights, hotel accommodation, transfers and daily excursions (placeholder itinerary).",
    inclusions: [
      "Return flights Hurghada ↔ Cairo (placeholder)",
      "Hotel accommodation with breakfast",
      "Daily excursions as per itinerary",
      "Private transfers & guides",
      "Bottled water during tours",
      "24/7 local support",
    ],
    exclusions: [
      "International flights",
      "Travel insurance",
      "Optional activities & personal expenses",
      "Tips and gratuities",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Hurghada",
        description: "Airport pickup and transfer to your hotel, welcome briefing and free evening (placeholder).",
      },
      {
        day: 2,
        title: "Hurghada Excursion",
        description: "Desert safari and quad biking, or a Red Sea snorkeling trip (placeholder).",
      },
      {
        day: 3,
        title: "Fly to Cairo",
        description: "Transfer to the airport, flight to Cairo, evening free at the hotel (placeholder).",
      },
      {
        day: 4,
        title: "Pyramids & Egyptian Museum",
        description: "Full-day guided tour of the Giza Pyramids, Sphinx and the Egyptian Museum (placeholder).",
      },
      {
        day: 5,
        title: "Old Cairo & Khan El Khalili",
        description: "Visit Coptic Cairo, the Citadel and the vibrant Khan El Khalili bazaar (placeholder).",
      },
      {
        day: 6,
        title: "Fly Back to Hurghada",
        description: "Flight back to Hurghada, free beach day (placeholder).",
      },
      {
        day: 7,
        title: "Free Beach Day in Hurghada",
        description: "Relax on the Red Sea or join an optional excursion (placeholder).",
      },
      {
        day: 8,
        title: "Departure",
        description: "Check-out and airport transfer for your departure (placeholder).",
      },
    ],
  },
  "hurghada-excursions-program": {
    title: "Hurghada Excursions Program",
    description:
      "An 8-day Red Sea holiday based in Hurghada with a daily programme of excursions: desert safaris, island snorkeling trips, boat days and Bedouin nights (placeholder itinerary).",
    inclusions: [
      "Hotel accommodation with breakfast",
      "Daily excursions as per itinerary",
      "Private transfers & guides",
      "Bottled water during tours",
      "24/7 local support",
    ],
    exclusions: [
      "Flights",
      "Travel insurance",
      "Optional activities & personal expenses",
      "Tips and gratuities",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Hurghada",
        description: "Airport pickup and transfer to your hotel, welcome briefing and free evening (placeholder).",
      },
      {
        day: 2,
        title: "Desert Safari & Quad Biking",
        description: "Afternoon desert safari, quad biking and Bedouin dinner under the stars (placeholder).",
      },
      {
        day: 3,
        title: "Red Sea Snorkeling",
        description: "Full-day boat trip with lunch and two snorkeling stops on the Red Sea reefs (placeholder).",
      },
      {
        day: 4,
        title: "Giftun Island Trip",
        description: "Boat trip to Giftun Island, snorkeling and beach time on white sands (placeholder).",
      },
      {
        day: 5,
        title: "Free Day / Optional Trip",
        description: "Relax at the resort or join an optional city or shopping tour (placeholder).",
      },
      {
        day: 6,
        title: "Submarine or Glass Boat",
        description: "Discover the Red Sea underwater world from a submarine or glass-bottom boat (placeholder).",
      },
      {
        day: 7,
        title: "Free Beach Day",
        description: "Unwind on the beach with resort facilities and water sports (placeholder).",
      },
      {
        day: 8,
        title: "Departure",
        description: "Check-out and airport transfer for your departure (placeholder).",
      },
    ],
  },
  "hurghada-luxor-excursions-program": {
    title: "Hurghada & Luxor Excursions Program",
    description:
      "An 8-day journey combining Red Sea relaxation in Hurghada with the ancient wonders of Luxor, including the Valley of the Kings and Karnak Temple (placeholder itinerary).",
    inclusions: [
      "Hotel accommodation with breakfast",
      "Daily excursions as per itinerary",
      "Private transfers & guides",
      "Bottled water during tours",
      "24/7 local support",
    ],
    exclusions: [
      "Flights",
      "Travel insurance",
      "Optional activities & personal expenses",
      "Tips and gratuities",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Hurghada",
        description: "Airport pickup and transfer to your hotel, welcome briefing and free evening (placeholder).",
      },
      {
        day: 2,
        title: "Red Sea Snorkeling",
        description: "Full-day boat trip with lunch and snorkeling stops on the Red Sea reefs (placeholder).",
      },
      {
        day: 3,
        title: "Transfer to Luxor",
        description: "Drive to Luxor, hotel check-in and an evening stroll on the Corniche (placeholder).",
      },
      {
        day: 4,
        title: "Luxor East & West Bank",
        description: "Full-day tour of Karnak, Luxor Temple, the Valley of the Kings and Hatshepsut Temple (placeholder).",
      },
      {
        day: 5,
        title: "Return to Hurghada",
        description: "Morning transfer back to Hurghada, free beach afternoon (placeholder).",
      },
      {
        day: 6,
        title: "Desert Safari & Bedouin Night",
        description: "Desert safari, quad biking and a traditional Bedouin dinner (placeholder).",
      },
      {
        day: 7,
        title: "Giftun Island Trip",
        description: "Boat trip to Giftun Island with snorkeling and beach time (placeholder).",
      },
      {
        day: 8,
        title: "Departure",
        description: "Check-out and airport transfer for your departure (placeholder).",
      },
    ],
  },
  "hurghada-luxor-cairo-excursions-program": {
    title: "Hurghada, Luxor & Cairo Excursions Program",
    description:
      "The ultimate 8-day Egyptian highlight: the heights of the Giza Pyramids and Cairo, the temples of Luxor, and the Red Sea bliss of Hurghada — all in one comprehensive program (placeholder itinerary).",
    inclusions: [
      "Hotel accommodation with breakfast",
      "Daily excursions as per itinerary",
      "Private transfers & guides",
      "Bottled water during tours",
      "24/7 local support",
    ],
    exclusions: [
      "Flights",
      "Travel insurance",
      "Optional activities & personal expenses",
      "Tips and gratuities",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Hurghada",
        description: "Airport pickup and transfer to your hotel, welcome briefing and free evening (placeholder).",
      },
      {
        day: 2,
        title: "Red Sea Snorkeling",
        description: "Full-day boat trip with lunch and snorkeling stops on the Red Sea reefs (placeholder).",
      },
      {
        day: 3,
        title: "Transfer to Cairo",
        description: "Fly or drive to Cairo, evening free at the hotel (placeholder).",
      },
      {
        day: 4,
        title: "Pyramids & Egyptian Museum",
        description: "Full-day guided tour of the Giza Pyramids, Sphinx and the Egyptian Museum (placeholder).",
      },
      {
        day: 5,
        title: "Transfer to Luxor",
        description: "Fly or drive to Luxor, hotel check-in and evening free (placeholder).",
      },
      {
        day: 6,
        title: "Luxor East & West Bank",
        description: "Full-day tour of Karnak, the Valley of the Kings, Hatshepsut Temple and the Colossi of Memnon (placeholder).",
      },
      {
        day: 7,
        title: "Return to Hurghada",
        description: "Transfer back to Hurghada, free beach evening (placeholder).",
      },
      {
        day: 8,
        title: "Departure",
        description: "Check-out and airport transfer for your departure (placeholder).",
      },
    ],
  },
  dahab: {
    title: "Dahab Tour",
    description:
      "Escape to Dahab, the laid-back Bedouin town on the Gulf of Aqaba: the Blue Hole, the Canyon, Mount Sinai sunrise and golden beach time in the Red Sea.",
    inclusions: [
      "Private transfers",
      "Snorkeling / diving trip (placeholder)",
      "Lunch at a beach cafe",
      "Bottled water",
    ],
    exclusions: [
      "Diving course fees",
      "Mount Sinai trip (optional)",
      "Tips and gratuities",
      "Personal expenses",
    ],
    itinerary: [
      {
        day: 1,
        title: "Dahab, Blue Hole & Beach Time",
        description:
          "Discover the Blue Hole and the famous diving sites of Dahab, relax at the beach resorts and wander the Bedouin promenade (placeholder).",
      },
    ],
  },
};

const ADMIN_ID = "56fd4067-1072-4a31-9830-7e73852d207d";

/** Map source trip name -> clean slug key used in TOUR_CONTENT */
const SLUG_OVERRIDE = {
  Fayoum: "fayoum",
  Cairo: "cairo",
  Luxor: "luxor",
  Aswan: "aswan",
  Alexandria: "alexandria",
  "Nile Trip (Cairo)": "nile-trip-cairo",
  Hurghada: "hurghada",
  "Marsa Alam": "marsa-alam",
  "Siwa Oasis": "siwa-oasis",
  "Abydos & Dendera Temples Tour": "abydos-dendera-temples",
  "Sharm El Sheikh": "sharm-el-sheikh",
  "Hurghada – Cairo Trip Program (Includes flight booking and hotel accommodation)":
    "hurghada-cairo-trip-program",
  "Hurghada Excursions Program (Includes flight booking and hotel accommodation)":
    "hurghada-excursions-program",
  "Hurghada & Luxor Excursions Program (Includes flight booking and hotel accommodation)":
    "hurghada-luxor-excursions-program",
  "Hurghada, Luxor & Cairo Excursions Program (Includes flight booking and hotel accommodation)":
    "hurghada-luxor-cairo-excursions-program",
  Dahab: "dahab",
};

const trips = JSON.parse(readFileSync(new URL("./trips_parsed.json", import.meta.url), "utf-8"));

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const lines = [];
lines.push("-- Generated by docs/generate_tours_seed.mjs");
lines.push("-- 16 tours migrated from hellomysticegypt.com (WordPress Travel Engine)");
lines.push("");
lines.push("START TRANSACTION;");
lines.push("");

let tourCount = 0;
let itinCount = 0;

for (const trip of trips) {
  const key = SLUG_OVERRIDE[trip.Name];
  if (!key) {
    throw new Error(`No slug/content mapping for trip: ${trip.Name}`);
  }
  const content = TOUR_CONTENT[key];
  const tourId = uuid();

  // Price: "€1,850" -> 1850, "€110" -> 110
  const price = parseFloat(String(trip.Price).replace(/[€,]/g, "").trim());

  const description = content.description || `${trip.Name} - ${trip.Duration} tour.`;
  const inclusions = content.inclusions.join("\n");
  const exclusions = content.exclusions.join("\n");

  lines.push(`-- ===== ${trip.Name} (${trip.Duration}, €${price}) ====`);
  lines.push(`INSERT INTO tours (id, title, slug, description, inclusions, exclusions, duration, base_price, currency, status, created_by, created_at) VALUES (`);
  lines.push(`  '${tourId}',`);
  lines.push(`  '${sqlEscape(content.title)}',`);
  lines.push(`  '${sqlEscape(key)}',`);
  lines.push(`  '${sqlEscape(description)}',`);
  lines.push(`  '${sqlEscape(inclusions)}',`);
  lines.push(`  '${sqlEscape(exclusions)}',`);
  lines.push(`  '${sqlEscape(trip.Duration)}',`);
  lines.push(`  ${price},`);
  lines.push(`  'EUR',`);
  lines.push(`  'open',`);
  lines.push(`  '${ADMIN_ID}',`);
  lines.push(`  NOW()`);
  lines.push(`);`);
  lines.push("");

  // Itinerary placeholders
  for (const day of content.itinerary) {
    const itinId = uuid();
    lines.push(`INSERT INTO tour_itineraries (id, tour_id, day_number, title, description) VALUES (`);
    lines.push(`  '${itinId}',`);
    lines.push(`  '${tourId}',`);
    lines.push(`  ${day.day},`);
    lines.push(`  '${sqlEscape(day.title)}',`);
    lines.push(`  '${sqlEscape(day.description)}'`);
    lines.push(`);`);
    itinCount++;
  }
  lines.push("");
  tourCount++;
}

lines.push("COMMIT;");
lines.push("");
lines.push(`-- ${tourCount} tours, ${itinCount} itinerary entries`);

const out = new URL("./tours_seed_full.sql", import.meta.url);
writeFileSync(out, lines.join("\n"), "utf-8");
console.log(`Wrote ${tourCount} tours + ${itinCount} itinerary rows to ${out.pathname}`);