"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/core/lib/prisma";
import { getCurrentUser } from "@/core/lib/session";

export type CustomizeFieldErrors = {
  message?: string;
  people?: string;
  budget?: string;
};

export type CustomizeFormState = {
  errors?: CustomizeFieldErrors;
  message?: string;
  ok?: boolean;
} | undefined;

/**
 * Records a "request customization" submission for a tour. Requires an
 * authenticated, verified user (PRD §4.1). The request is later reviewed by
 * an admin (Milestone 6).
 */
export async function customizeTourAction(
  tourId: string,
  state: CustomizeFormState,
  formData: FormData,
): Promise<CustomizeFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const message = formData.get("message")?.toString().trim() ?? "";
  const peopleRaw = formData.get("people")?.toString().trim() ?? "";
  const budgetRaw = formData.get("budget")?.toString().trim() ?? "";

  const errors: CustomizeFieldErrors = {};
  if (message.length === 0) {
    errors.message = "Please tell us what changes you would like.";
  } else if (message.length > 2000) {
    errors.message = "Please keep your request under 2000 characters.";
  }

  const people = peopleRaw ? Number(peopleRaw) : null;
  if (peopleRaw && (!Number.isInteger(people) || (people as number) < 1)) {
    errors.people = "Please enter a valid number of people.";
  }

  const budget = budgetRaw ? Number(budgetRaw) : null;
  if (budgetRaw && (!Number.isFinite(budget) || (budget as number) <= 0)) {
    errors.budget = "Please enter a valid approximate budget (USD).";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true },
  });
  if (!tour) {
    return { message: "This tour could not be found." };
  }

  try {
    await prisma.customizationRequest.create({
      data: {
        user_id: user.id,
        tour_id: tourId,
        message,
        budget: budget ?? null,
        people: people ?? null,
      },
    });
  } catch {
    return { message: "Something went wrong. Please try again." };
  }

  return { ok: true, message: "Your customization request has been sent. We will be in touch." };
}
