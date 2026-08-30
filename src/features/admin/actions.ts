"use server";

import { requireAdmin } from "@/core/lib/session";
import {
  toggleTourStatus,
  updateBookingStatus,
  createAdmin,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
  toggleCmsPagePublished,
  deleteAdmin,
  type CreateAdminParams,
} from "@/features/admin/service";

// ---------------------------------------------------------------------------
// Tour Actions
// ---------------------------------------------------------------------------

export async function toggleTourStatusAction(
  tourId: string,
): Promise<{ ok: boolean; status?: string; error?: string }> {
  try {
    await requireAdmin();
    const status = await toggleTourStatus(tourId);
    return { ok: true, status };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[toggleTourStatusAction]", msg);
    return { ok: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Booking Actions
// ---------------------------------------------------------------------------

export async function approveBookingAction(
  bookingId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    await updateBookingStatus(bookingId, "CONFIRMED");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[approveBookingAction]", msg);
    return { ok: false, error: msg };
  }
}

export async function rejectBookingAction(
  bookingId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    await updateBookingStatus(bookingId, "CANCELLED");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[rejectBookingAction]", msg);
    return { ok: false, error: msg };
  }
}

export async function completeBookingAction(
  bookingId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    await updateBookingStatus(bookingId, "COMPLETED");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[completeBookingAction]", msg);
    return { ok: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Admin Management Actions
// ---------------------------------------------------------------------------

export async function createAdminAction(
  params: CreateAdminParams,
): Promise<{ ok: boolean; admin?: { id: string; name: string; email: string }; error?: string }> {
  try {
    await requireAdmin();
    const admin = await createAdmin(params);
    return { ok: true, admin: { id: admin.id, name: admin.name, email: admin.email } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[createAdminAction]", msg);
    return { ok: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// CMS Actions
// ---------------------------------------------------------------------------

export async function createCmsPageAction(
  params: { title: string; slug: string; content: string; published?: boolean },
): Promise<{ ok: boolean; page?: { id: string; slug: string }; error?: string }> {
  try {
    const admin = await requireAdmin();
    const page = await createCmsPage({ ...params, created_by: admin.id });
    return { ok: true, page: { id: page.id, slug: page.slug } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[createCmsPageAction]", msg);
    return { ok: false, error: msg };
  }
}

export async function updateCmsPageAction(
  id: string,
  params: { title?: string; slug?: string; content?: string; published?: boolean },
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    await updateCmsPage(id, params);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[updateCmsPageAction]", msg);
    return { ok: false, error: msg };
  }
}

export async function deleteCmsPageAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    await deleteCmsPage(id);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[deleteCmsPageAction]", msg);
    return { ok: false, error: msg };
  }
}

export async function toggleCmsPagePublishedAction(
  id: string,
): Promise<{ ok: boolean; published?: boolean; error?: string }> {
  try {
    await requireAdmin();
    const published = await toggleCmsPagePublished(id);
    return { ok: true, published };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[toggleCmsPagePublishedAction]", msg);
    return { ok: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Admin Management Actions
// ---------------------------------------------------------------------------

export async function deleteAdminAction(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const currentAdmin = await requireAdmin();
    await deleteAdmin(userId, currentAdmin.id);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[deleteAdminAction]", msg);
    return { ok: false, error: msg };
  }
}
