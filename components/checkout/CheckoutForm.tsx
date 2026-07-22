"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  placeOrder,
  verifyRazorpayPayment,
  cancelPendingOrder,
  type CheckoutState,
} from "@/lib/actions/checkout";
import type { AddressDoc } from "@/lib/data/users";

const initialState: CheckoutState = {};

const inputClass =
  "h-11 border border-ink/20 bg-transparent px-4 font-sans text-sm text-ink placeholder:text-ink/40 focus:border-accent-dark focus:outline-none";

type FormFields = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY_FIELDS: FormFields = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

function fieldsFromAddress(address: AddressDoc): FormFields {
  return {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  };
}

function formatAddressLine(fields: FormFields): string {
  return `${fields.line1}${fields.line2 ? `, ${fields.line2}` : ""}, ${fields.city}, ${fields.state} ${fields.pincode}`;
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; contact?: string; email?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Couldn't load the payment widget. Please try again."));
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

type AddressMode = "collapsed" | "list" | "new";

export function CheckoutForm({
  savedAddresses = [],
  children,
}: {
  savedAddresses?: AddressDoc[];
  children?: ReactNode;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(placeOrder, initialState);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");
  const [razorpayError, setRazorpayError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const handledOrderId = useRef<string | null>(null);

  const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
  const [fields, setFields] = useState<FormFields>(
    defaultAddress ? fieldsFromAddress(defaultAddress) : EMPTY_FIELDS,
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddress?._id ?? null);
  const [addressMode, setAddressMode] = useState<AddressMode>(defaultAddress ? "collapsed" : "new");
  const [email, setEmail] = useState("");

  function updateField(key: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function selectAddress(address: AddressDoc) {
    setSelectedAddressId(address._id);
    setFields(fieldsFromAddress(address));
    setAddressMode("collapsed");
  }

  function startNewAddress() {
    setSelectedAddressId(null);
    setFields(EMPTY_FIELDS);
    setAddressMode("new");
  }

  useEffect(() => {
    if (!state.razorpay || handledOrderId.current === state.razorpay.orderId) return;
    handledOrderId.current = state.razorpay.orderId;
    const { orderId, amountPaise, keyId, orderNumber } = state.razorpay;

    setRazorpayError(null);

    loadRazorpayScript()
      .then(() => {
        if (!window.Razorpay) throw new Error("Payment widget unavailable.");
        const instance = new window.Razorpay({
          key: keyId,
          amount: amountPaise,
          currency: "INR",
          order_id: orderId,
          name: "THE RARESKIN",
          description: `Order ${orderNumber}`,
          prefill: { name: fields.fullName, contact: fields.phone, email: email || undefined },
          theme: { color: "#c48b3e" },
          handler: (response) => {
            setIsVerifying(true);
            verifyRazorpayPayment({
              orderNumber,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).catch(() => {
              // A NEXT_REDIRECT "error" is how a successful redirect() surfaces
              // when called outside a <form action>; only genuine failures
              // reach here in practice, but fail safe with a clear message.
              setIsVerifying(false);
              setRazorpayError("Payment succeeded but confirmation failed — please contact support.");
            });
          },
          modal: {
            ondismiss: () => {
              cancelPendingOrder(orderNumber);
              setRazorpayError("Payment cancelled. Your bag is unchanged — you can try again.");
              router.refresh();
            },
          },
        });
        instance.open();
      })
      .catch((error: Error) => setRazorpayError(error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.razorpay]);

  return (
    <form action={formAction} className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-8">
          {children}

          <div className="flex flex-col gap-3">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
              Shipping Address
            </span>

            {addressMode === "collapsed" && (
              <div className="flex items-start justify-between gap-4 border border-ink/15 bg-ivory-2 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" strokeWidth={1.5} />
                  <div className="font-sans text-sm text-ink">
                    <p className="font-medium">
                      {fields.fullName} · {fields.phone}
                    </p>
                    <p className="text-ink/60">{formatAddressLine(fields)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAddressMode("list")}
                  className="shrink-0 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-accent-dark hover:underline"
                >
                  Change
                </button>
              </div>
            )}

            {addressMode === "list" && (
              <div className="flex flex-col gap-2">
                {savedAddresses.map((address) => (
                  <button
                    key={address._id}
                    type="button"
                    onClick={() => selectAddress(address)}
                    className={cn(
                      "flex items-start justify-between gap-3 border p-4 text-left transition-colors",
                      selectedAddressId === address._id
                        ? "border-accent-dark bg-accent/10"
                        : "border-ink/15 hover:border-accent-dark/60",
                    )}
                  >
                    <div className="font-sans text-sm text-ink">
                      <p className="font-medium">
                        {address.label}
                        {address.isDefault && (
                          <span className="ml-2 text-xs font-normal uppercase tracking-wide text-accent-dark">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-ink/60">
                        {address.fullName} · {address.phone}
                      </p>
                      <p className="text-ink/60">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                        {address.pincode}
                      </p>
                    </div>
                    {selectedAddressId === address._id && (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" />
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={startNewAddress}
                  className="flex items-center justify-center gap-2 border border-dashed border-ink/25 p-4 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-ink/60 transition-colors hover:border-accent-dark hover:text-accent-dark"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                  Add New Address
                </button>
              </div>
            )}

            {addressMode === "new" && (
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    name="fullName"
                    required
                    placeholder="Full Name"
                    value={fields.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className={inputClass}
                  />
                  <input
                    name="phone"
                    required
                    placeholder="Phone Number"
                    value={fields.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputClass}
                  />
                  <input
                    name="line1"
                    required
                    placeholder="Address Line 1"
                    value={fields.line1}
                    onChange={(e) => updateField("line1", e.target.value)}
                    className={cn(inputClass, "sm:col-span-2")}
                  />
                  <input
                    name="line2"
                    placeholder="Address Line 2 (optional)"
                    value={fields.line2}
                    onChange={(e) => updateField("line2", e.target.value)}
                    className={cn(inputClass, "sm:col-span-2")}
                  />
                  <input
                    name="city"
                    required
                    placeholder="City"
                    value={fields.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={inputClass}
                  />
                  <input
                    name="state"
                    required
                    placeholder="State"
                    value={fields.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className={inputClass}
                  />
                  <input
                    name="pincode"
                    required
                    placeholder="Pincode"
                    value={fields.pincode}
                    onChange={(e) => updateField("pincode", e.target.value)}
                    className={inputClass}
                  />
                </div>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAddressMode("list")}
                    className="w-fit font-sans text-xs font-semibold uppercase tracking-[0.1em] text-ink/50 hover:text-ink"
                  >
                    ← Choose a saved address instead
                  </button>
                )}
              </div>
            )}

            {/* Mirrors `fields` into the form when the editable inputs above
                aren't mounted (collapsed/list view), so a saved address still
                submits correctly without the customer re-typing it. */}
            {addressMode !== "new" && (
              <>
                <input type="hidden" name="fullName" value={fields.fullName} />
                <input type="hidden" name="phone" value={fields.phone} />
                <input type="hidden" name="line1" value={fields.line1} />
                <input type="hidden" name="line2" value={fields.line2} />
                <input type="hidden" name="city" value={fields.city} />
                <input type="hidden" name="state" value={fields.state} />
                <input type="hidden" name="pincode" value={fields.pincode} />
              </>
            )}
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email (optional — for your receipt)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />

          <div className="flex flex-col gap-3">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
              Coupon Code
            </span>
            <input
              name="couponCode"
              placeholder="e.g. WELCOME10"
              className={cn(inputClass, "sm:max-w-xs")}
              style={{ textTransform: "uppercase" }}
            />
            <p className="font-sans text-xs text-ink/50">
              Applied at checkout — you&apos;ll see the discount on your order confirmation.
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-ink/10 bg-ivory px-5 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <label
              className={cn(
                "flex flex-1 items-center gap-2 border px-3 py-2.5 transition-colors",
                paymentMethod === "cod" ? "border-accent-dark bg-accent/10" : "border-ink/15",
              )}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="accent-accent-dark"
              />
              <span className="font-sans text-xs text-ink">Cash on Delivery</span>
            </label>
            <label
              className={cn(
                "flex flex-1 items-center gap-2 border px-3 py-2.5 transition-colors",
                paymentMethod === "razorpay" ? "border-accent-dark bg-accent/10" : "border-ink/15",
              )}
            >
              <input
                type="radio"
                name="payment"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
                className="accent-accent-dark"
              />
              <span className="font-sans text-xs text-ink">Pay Online</span>
            </label>
          </div>

          {(state?.error || razorpayError) && (
            <p className="font-sans text-sm text-secondary">{state?.error || razorpayError}</p>
          )}

          <Button type="submit" variant="primary" size="lg" disabled={isPending || isVerifying}>
            {isVerifying
              ? "Confirming Payment..."
              : isPending
                ? paymentMethod === "razorpay"
                  ? "Preparing Payment..."
                  : "Placing Order..."
                : "Place Order"}
          </Button>
        </div>
      </div>
    </form>
  );
}
