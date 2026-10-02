// Public URL prefix for tour images uploaded from the admin panel.
// Files live under public/uploads/tours/admin on the server (bind-mounted in
// production) — this is where new uploads are written.
export const TOUR_IMAGE_URL_PREFIX = "/uploads/tours/admin/";

// Whole tour-image tree on the server. Any file inside this directory may be
// deleted from disk; anything outside it (receipts, categories, external URLs)
// must never be touched by the delete flow.
export const TOURS_UPLOAD_URL_PREFIX = "/uploads/tours/";
