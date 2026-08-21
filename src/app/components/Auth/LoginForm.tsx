"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ArrowRight, LoaderCircle, LockKeyhole, } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/src/lib/api";
import { LoginResponse, saveAuthSession } from "@/src/lib/auth";
import Link from "next/link";
import Image from "next/image";

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

const LoginForm = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
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
      const responseError = error as AxiosError<{ message?: string }>;
      setSubmitError(
        responseError.response?.data?.message ??
          "We could not sign you in right now. Please check your details and try again.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <section className="site-card w-full max-w-md p-7 shadow-2xl sm:p-9">
        <div className="mb-3 flex flex items-center justify-center gap-0">
          <Link href="/" className="site-brand flex-col gap-0!" aria-label="NexaChat home">
            <Image width={60} height={60} src="/nexaChat.png" alt="NexaChat" />{" "}
              <span>
                Nexa<span>Chat</span>
              </span>
          </Link>
        </div>

        <div className="mb-1">
          <div className="mb-3 flex max-w-[160px] mx-auto justify-center items-center gap-2 rounded-full bg-cyan-soft px-3 py-1 text-xs font-semibold text-cyan">
            <LockKeyhole size={13} /> Secure access
          </div>
         
          <p className="mt-2 text-sm max-w-[80%] mx-auto text-center leading-6 text-ink-soft">
            Use your phone number to sign in or create your NexaChat account.
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-ink"
              htmlFor="name"
            >
              Your name
            </label>
            <input
              id="name"
              autoComplete="name"
              className={`site-input w-full px-4 py-3 text-sm ${errors.name ? "border-danger" : ""}`}
              placeholder="Johirul Islam"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-2 text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-semibold text-ink"
              htmlFor="phone"
            >
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={`site-input w-full px-4 py-3 text-sm ${errors.phone ? "border-danger" : ""}`}
              placeholder="018XXXXXXXX"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="mt-2 text-xs text-danger">{errors.phone.message}</p>
            )}
          </div>

          {submitError && (
            <p
              role="alert"
              className="rounded-sm border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="site-btn cursor-pointer site-btn-primary flex w-full justify-center px-4 py-3 text-sm"
          >
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <>
                Continue <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-ink-faint">
          New phone numbers are registered automatically. By continuing, you
          agree to use NexaChat responsibly.
        </p>
      </section>
    </main>
  );
};

export default LoginForm;