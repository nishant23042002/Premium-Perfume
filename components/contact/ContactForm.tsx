"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { submitContactMessage, type ContactFormState } from "@/lib/actions/contact";

const initialState: ContactFormState = {};

const inputClass =
  "h-11 border border-ink/20 bg-transparent px-4 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-accent-dark focus:outline-none";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactMessage, initialState);

  if (state?.success) {
    return (
      <div className="flex flex-col gap-2 border border-accent-dark/30 bg-accent/10 p-6">
        <p className="font-display text-xl text-secondary">Message sent</p>
        <p className="font-sans text-sm text-ink/70">
          Thanks for reaching out — our team will get back to you within 1-2 business days.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Full Name" className={inputClass} />
        <input name="email" type="email" required placeholder="Email Address" className={inputClass} />
        <input name="phone" placeholder="Phone Number (optional)" className={inputClass} />
        <input name="subject" placeholder="Subject (optional)" className={inputClass} />
      </div>

      <textarea
        name="message"
        required
        rows={5}
        placeholder="How can we help?"
        className={cn(inputClass, "h-auto resize-none py-3")}
      />

      {state?.error && <p className="font-sans text-sm text-secondary">{state.error}</p>}

      <Button type="submit" variant="primary" size="lg" disabled={isPending} className="w-fit">
        {isPending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
