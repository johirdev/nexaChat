"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  LockKeyhole,
  Phone,
  TriangleAlert,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/src/lib/api";
import { LoginResponse, saveAuthSession } from "@/src/lib/auth";
import { getApiErrorMessage, getApiFieldErrors } from "@/src/lib/errors";
import "@/src/app/components/HomeLandingPage/landing.css";

const loginSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(20, "Phone number is too long.")
    .regex(/^\+?[0-9 ()-]+$/, "Use a valid phone number."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const PITCH = [
  {
    title: "No password to invent",
    text: "your phone number is the account",
  },
  {
    title: "New number? Account created",
    text: "known number signs you straight in",
  },
  {
    title: "Straight into your conversations",
    text: "direct chats and groups, delivered live",
  },
];

const LoginForm = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { name: "", phone: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);

    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        name: values.name.trim(),
        phone: values.phone.trim(),
      });

      saveAuthSession(data);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      // The API nests failures under `error`, and validation problems arrive
      // with a per-field `details` array — put those on the fields themselves.
      const fieldErrors = getApiFieldErrors(error);
      let matchedAField = false;

      for (const detail of fieldErrors) {
        if (detail.path === "name" || detail.path === "phone") {
          setError(detail.path, { type: "server", message: detail.message });
          matchedAField = true;
        }
      }

      setSubmitError(
        matchedAField
          ? null
          : getApiErrorMessage(
              error,
              "We could not sign you in right now. Please check your details and try again.",
            ),
      );
    }
  };

  return (
    <section className="ln-auth">
      <div className="ln-auth-grid" aria-hidden="true" />

      <div className="ln-wrap ln-auth-inner">
        {/* ------------------------------------------------------- pitch */}
        <div className="ln-auth-pitch">
          <span className="ln-eyebrow">Welcome back</span>
          <h1>
            One number away from{" "}
            <span className="ln-brand-text">your people</span>.
          </h1>
          <p className="ln-sub">
            NexaChat has no sign-up form to fill in and no password to remember.
            Give us a number and a name, and your conversations open up.
          </p>

          <ul className="ln-checks">
            {PITCH.map((item) => (
              <li key={item.title}>
                <Check size={17} aria-hidden="true" />
                <span>
                  <b>{item.title}</b> — {item.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="ln-auth-proof">
            <span className="ln-faces" aria-hidden="true">
              <i style={{ background: "linear-gradient(135deg,#1fd1b4,#35d0e0)" }}>J</i>
              <i style={{ background: "linear-gradient(135deg,#35d0e0,#4a8cf7)" }}>M</i>
              <i style={{ background: "linear-gradient(135deg,#4a8cf7,#8b4dff)", color: "#fff" }}>
                S
              </i>
              <i style={{ background: "#131d3d", color: "#35d0e0" }}>+</i>
            </span>
            <span>
              <strong>12k+</strong> people are already talking on NexaChat
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------- card */}
        <div className="ln-auth-card">
          <Link href="/" className="ln-auth-mark" aria-label="NexaChat home">
            <Image
              src="/nexaChat.png"
              alt=""
              width={58}
              height={58}
              priority
            />
            <span>
              Nexa<em>Chat</em>
            </span>
          </Link>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <span className="ln-auth-badge">
              <LockKeyhole size={12} aria-hidden="true" /> Secure access
            </span>
          </div>

          <p className="ln-auth-intro">
            Use your phone number to sign in or create your NexaChat account.
          </p>

          <form className="ln-auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="ln-field">
              <label className="ln-label" htmlFor="name">
                Your name
              </label>
              <div className="ln-input-wrap">
                <User size={16} aria-hidden="true" />
                <input
                  id="name"
                  autoComplete="name"
                  className={`ln-input${errors.name ? " has-error" : ""}`}
                  placeholder="Johirul Islam"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="ln-error" id="name-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="ln-field">
              <label className="ln-label" htmlFor="phone">
                Phone number
              </label>
              <div className="ln-input-wrap">
                <Phone size={16} aria-hidden="true" />
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className={`ln-input${errors.phone ? " has-error" : ""}`}
                  placeholder="018XXXXXXXX"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p className="ln-error" id="phone-error">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {submitError && (
              <p className="ln-alert" role="alert">
                <TriangleAlert size={15} aria-hidden="true" />
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="ln-btn ln-btn-primary ln-auth-submit"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin" size={17} />
                  Signing you in
                </>
              ) : (
                <>
                  Continue <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="ln-auth-foot">
            New phone numbers are registered automatically. By continuing you
            agree to use NexaChat responsibly.
          </p>

          <div style={{ textAlign: "center" }}>
            <Link href="/" className="ln-auth-back">
              <ArrowLeft size={14} aria-hidden="true" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
