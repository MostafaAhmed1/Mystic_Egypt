"use client";

import { useActionState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Field, FieldError } from "@/shared/components/ui/field";
import { customizeTourAction, type CustomizeFormState } from "@/features/tour/actions";

const initial: CustomizeFormState = undefined;

export function CustomizeTourDialog({ tourId, tourTitle }: { tourId: string; tourTitle: string }) {
  const [state, formAction, pending] = useActionState(
    (prev: CustomizeFormState, formData: FormData) =>
      customizeTourAction(tourId, prev, formData),
    initial,
  );

  const success = state?.ok;

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Request a custom tour
      </DialogTrigger>
      <DialogContent>
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle>Request sent</DialogTitle>
              <DialogDescription>{state?.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <DialogClose render={<Button>Done</Button>} />
            </DialogFooter>
          </>
        ) : (
          <form action={formAction} noValidate>
            <DialogHeader>
              <DialogTitle>Customize this tour</DialogTitle>
              <DialogDescription>
                Tell us how we can tailor “{tourTitle}” for you. We will get back to you
                with a personal quote.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Field>
                <Label htmlFor="message">What would you like changed?</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="e.g. add one more night at Luxor, private guide, hotel upgrade…"
                  aria-invalid={Boolean(state?.errors?.message)}
                />
                <FieldError errors={state?.errors?.message ? [{ message: state.errors.message }] : undefined} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <Label htmlFor="people">Number of people</Label>
                  <Input
                    id="people"
                    name="people"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="e.g. 4"
                    aria-invalid={Boolean(state?.errors?.people)}
                  />
                  <FieldError errors={state?.errors?.people ? [{ message: state.errors.people }] : undefined} />
                </Field>

                <Field>
                  <Label htmlFor="budget">Approx. budget (USD)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder="e.g. 2500"
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
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send request"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
