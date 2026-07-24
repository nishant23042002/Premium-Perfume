"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";
import { loginWithPhone } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/auth/OtpInput";

const inputClass =
  "h-12 w-full border border-ink/20 bg-transparent px-4 font-sans text-base text-ink placeholder:text-ink/40 focus:border-accent-dark focus:outline-none";

type Step = "phone" | "otp";

const SEND_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-phone-number": "That doesn't look like a valid phone number.",
  "auth/missing-phone-number": "Enter your mobile number first.",
  "auth/quota-exceeded": "Too many attempts right now. Please try again later.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/operation-not-allowed": "Phone sign-in isn't enabled for this project yet.",
  "auth/unauthorized-domain": "This domain isn't authorized for sign-in yet.",
  "auth/captcha-check-failed": "Verification failed. Please try again.",
  "auth/invalid-app-credential": "Verification failed. Please refresh and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
};

const VERIFY_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-verification-code": "That code didn't match. Please try again.",
  "auth/code-expired": "That code has expired. Please request a new one.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
};

function getErrorMessage(err: unknown, messages: Record<string, string>, fallback: string) {
  console.error(err);
  if (err && typeof err === "object" && "code" in err && typeof err.code === "string") {
    return messages[err.code] ?? fallback;
  }
  return fallback;
}

export function PhoneLoginForm({
  redirectTo = "/account",
  onSuccess,
}: {
  redirectTo?: string;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const autoSubmittedCodeRef = useRef<string | null>(null);

  function getRecaptcha() {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return recaptchaRef.current;
  }

  // An invisible reCAPTCHA widget is single-use — once it's backed one
  // signInWithPhoneNumber call, reusing the same instance for a second call
  // (e.g. after "Change Number") fails without a rendering-level error, and
  // surfaces here as "Couldn't send the code" for a number that's actually
  // fine. .clear() tears down the rendered widget so getRecaptcha() builds a
  // fresh one next time instead of reusing the spent one.
  function resetRecaptcha() {
    recaptchaRef.current?.clear();
    recaptchaRef.current = null;
  }

  function handleSendOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    startTransition(async () => {
      try {
        const verifier = getRecaptcha();
        confirmationRef.current = await signInWithPhoneNumber(firebaseAuth, `+91${digits}`, verifier);
        setStep("otp");
      } catch (err) {
        // Whatever state the widget is in after a failure, it can't safely
        // be reused for the next attempt — always rebuild it, not just on
        // the explicit "Change Number" path.
        resetRecaptcha();
        setError(getErrorMessage(err, SEND_ERROR_MESSAGES, "Couldn't send the code. Please try again."));
      }
    });
  }

  function verifyCode(code: string) {
    setError(null);

    startTransition(async () => {
      try {
        const confirmation = confirmationRef.current;
        if (!confirmation) {
          setError("Session expired — please request a new code.");
          setStep("phone");
          return;
        }

        const credential = await confirmation.confirm(code);
        const idToken = await credential.user.getIdToken();

        const formData = new FormData();
        formData.set("idToken", idToken);
        const result = await loginWithPhone({}, formData);

        if (result.error) {
          setError(result.error);
          return;
        }

        if (onSuccess) {
          onSuccess();
        } else {
          // A hard navigation, not router.push()+refresh() — login changes
          // the session cookie, and Next.js's client-side prefetch cache
          // for OTHER routes (e.g. a nav link that got auto-prefetched
          // while still logged out) doesn't get invalidated by refreshing
          // just the current page. Only a full navigation guarantees every
          // route reads the new cookie instead of serving a stale
          // logged-out prefetch.
          window.location.href = redirectTo;
        }
      } catch (err) {
        setError(
          getErrorMessage(err, VERIFY_ERROR_MESSAGES, "That code didn't match. Please try again."),
        );
      }
    });
  }

  function handleVerifySubmit(event: FormEvent) {
    event.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    verifyCode(otp);
  }

  // Submit automatically the moment all 6 digits are in, so a customer who
  // types or pastes the full code never has to also tap "Verify".
  useEffect(() => {
    if (otp.length === 6 && autoSubmittedCodeRef.current !== otp) {
      autoSubmittedCodeRef.current = otp;
      verifyCode(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifySubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-3">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
            Enter the 6-digit code sent to +91 {phone}
          </span>
          <OtpInput
            value={otp}
            onChange={(value) => {
              autoSubmittedCodeRef.current = null;
              setOtp(value);
            }}
            disabled={isPending}
          />
        </label>

        {error && <p className="font-sans text-sm text-secondary">{error}</p>}

        <Button type="submit" variant="primary" size="lg" loading={isPending}>
          {isPending ? "Verifying..." : "Verify & Continue"}
        </Button>

        <button
          type="button"
          onClick={() => {
            resetRecaptcha();
            confirmationRef.current = null;
            setStep("phone");
            setOtp("");
            setError(null);
          }}
          className="font-sans text-xs uppercase tracking-[0.15em] text-ink/50 hover:text-accent-dark"
        >
          Change Number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
          Mobile Number
        </span>
        <div className="flex items-stretch gap-2">
          <span className="flex h-12 items-center border border-ink/20 px-3 font-sans text-sm text-ink/60">
            +91
          </span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="98765 43210"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClass}
          />
        </div>
      </label>

      {error && <p className="font-sans text-sm text-secondary">{error}</p>}

      <div id="recaptcha-container" />

      <Button type="submit" variant="primary" size="lg" loading={isPending}>
        {isPending ? "Sending Code..." : "Send OTP"}
      </Button>
    </form>
  );
}
