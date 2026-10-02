/**
 * Transform old trip data from hellomysticegypt.com to match the new Mystic Egypt platform schema.
 *
 * Source: docs/trips_parsed.json (16 trips extracted from WordPress Travel Engine)
 * Target: New Prisma Tour model with images, itinerary, route, etc.
 *
 * Field mapping:
 * - Name → title
 * - Slug → slug
 * - ID → old_wp_id (reference for migration)
 * - FeaturedImage → primary image (is_primary: true)
 * - Gallery → TourImage[] (all gallery images)
 * - Price → base_price (converted from "€1,850" to 1850.0)
 * - Duration → stored in description (old schema had no duration field)
 * - TripTypes → not available in source (empty)
 *
 * Missing fields (require manual entry or future enhancement):
 * - description: Will use tour name as placeholder
 * - inclusions: Not available from old site
 * - exclusions: Not available from old site
 * - itinerary: Not available from old site
 * - route (TourPoint[]): Not available from old site
 * - tour_dates: Not available from old site
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

interface OldTrip {
  Name: string;
  Slug: string;
  ID: string;
  FeaturedImage: string;
  Gallery: string[];
  Duration: string;
  Price: string;
  TripTypes: string[];
}

interface NewTourImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface NewTour {
  id: string;
  title: string;
  slug: string;
  description: string;
  inclusions: string | null;
  exclusions: string | null;
  base_price: number;
  currency: "EUR"; // All old trips are in EUR
  status: "open";
  old_wp_id: string;
  duration: string; // Custom field preserved from old data
  images: NewTourImage[];
  itinerary: []; // Empty - not available from old site
  route: []; // Empty - not available from old site
}

function parsePrice(priceStr: string): number {
  // "€1,850" → 1850.0
  const cleaned = priceStr.replace(/[€,]/g, "").trim();
  return parseFloat(cleaned) || 0;
}

function generateId(): string {
  return randomUUID();
}

function transformTrip(oldTrip: OldTrip): NewTour {
  const tourId = generateId();

  // Build images array: featured image first (is_primary: true), then rest of gallery
  const images: NewTourImage[] = [];

  // Add featured image as primary
  if (oldTrip.FeaturedImage) {
    images.push({
      id: generateId(),
      image_url: oldTrip.FeaturedImage,
      is_primary: true,
    });
  }

  // Add remaining gallery images (excluding featured if already added)
  for (const imgUrl of oldTrip.Gallery) {
    if (imgUrl !== oldTrip.FeaturedImage) {
      images.push({
        id: generateId(),
        image_url: imgUrl,
        is_primary: false,
      });
    }
  }

  // Create description that includes duration info
  const description = `${oldTrip.Name} - ${oldTrip.Duration} tour. Duration: ${oldTrip.Duration}.`;

  return {
    id: tourId,
    title: oldTrip.Name,
    slug: oldTrip.Slug,
    description,
    inclusions: null,
    exclusions: null,
    base_price: parsePrice(oldTrip.Price),
    currency: "EUR",
    status: "open",
    old_wp_id: oldTrip.ID,
    duration: oldTrip.Duration,
    images,
    itinerary: [],
    route: [],
  };
}

// Main transformation
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const oldTripsPath = join(__dirname, "trips_parsed.json");
const oldTrips: OldTrip[] = JSON.parse(readFileSync(oldTripsPath, "utf-8"));

console.log(`Transforming ${oldTrips.length} trips from old site...`);

const transformedTours: NewTour[] = oldTrips.map(transformTrip);

// Write transformed data
const outputPath = join(__dirname, "tours_seed.json");
writeFileSync(outputPath, JSON.stringify(transformedTours, null, 2));

console.log(`Transformed tours saved to: ${outputPath}`);
console.log(`\nSummary:`);
console.log(`- Total tours: ${transformedTours.length}`);
console.log(`- Tours with images: ${transformedTours.filter((t) => t.images.length > 0).length}`);
console.log(`- Total images: ${transformedTours.reduce((sum, t) => sum + t.images.length, 0)}`);

// Price summary
const prices = transformedTours.map((t) => t.base_price);
console.log(`\nPrice range: €${Math.min(...prices)} - €${Math.max(...prices)}`);

// Duration summary
const durations = [...new Set(transformedTours.map((t) => t.duration))];
console.log(`\nDurations: ${durations.join(", ")}`);
