"use client";

import { useActionState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Field, FieldError } from "@/shared/components/ui/field";
import { customizeTourAction, type CustomizeFormState } from "@/features/tour/actions";

const initial: CustomizeFormState = undefined;

export function CustomizeTourDialog({ tourId, tourTitle }: { tourId: string; tourTitle: string }) {
  const { t } = useTranslation("common");
  const [state, formAction, pending] = useActionState(
    (prev: CustomizeFormState, formData: FormData) =>
      customizeTourAction(tourId, prev, formData),
    initial,
  );

  const success = state?.ok;

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        {t("tours.requestCustom")}
      </DialogTrigger>
      <DialogContent>
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("customTour.successTitle")}</DialogTitle>
              <DialogDescription>{state?.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <DialogClose render={<Button>{t("customTour.done")}</Button>} />
            </DialogFooter>
          </>
        ) : (
          <form action={formAction} noValidate>
            <DialogHeader>
              <DialogTitle>{t("customTour.title")}</DialogTitle>
              <DialogDescription>
                {t("customTour.description", { title: tourTitle })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Field>
                <Label htmlFor="message">{t("customTour.messageLabel")}</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder={t("customTour.messagePlaceholder")}
                  aria-invalid={Boolean(state?.errors?.message)}
                />
                <FieldError errors={state?.errors?.message ? [{ message: state.errors.message }] : undefined} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <Label htmlFor="people">{t("customTour.peopleLabel")}</Label>
                  <Input
                    id="people"
                    name="people"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder={t("customTour.peoplePlaceholder")}
                    aria-invalid={Boolean(state?.errors?.people)}
                  />
                  <FieldError errors={state?.errors?.people ? [{ message: state.errors.people }] : undefined} />
                </Field>

                <Field>
                  <Label htmlFor="budget">{t("customTour.budgetLabel")}</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder={t("customTour.budgetPlaceholder")}
                    aria-invalid={Boolean(state?.errors?.budget)}
                  />
                  <FieldError errors={state?.errors?.budget ? [{ message: state.errors.budget }] : undefined} />
                </Field>
              </div>
            </div>

            {state?.message && !state.errors ? (
              <p className="text-sm text-destructive">{state.message}</p>
            ) : null}

            <DialogFooter>
              <DialogClose render={<Button variant="outline">{t("customTour.cancel")}</Button>} />
              <Button type="submit" disabled={pending}>
                {pending ? t("customTour.sending") : t("customTour.sendRequest")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
