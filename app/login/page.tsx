"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Frontend-only placeholder: no real authentication, this just validates
  // the fields are filled in and navigates to the contacts page. Wire this up
  // to a real auth endpoint when the backend exists.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError(null);
    setPasswordError(null);

    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }
    if (!password.trim()) {
      setPasswordError("Password is required.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      router.push("/contacts");
    }, 500);
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-y-auto bg-app px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-subtle bg-card p-8 shadow-sm">
        <div className="flex justify-center">
          <Logo size={44} />
        </div>

        <h1 className="mt-5 text-center text-xl font-bold text-primary">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-secondary">Sign in to manage your SMS campaigns</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-sm font-semibold text-primary">
              Email
            </label>
            <div
              className={`flex h-11 items-center gap-2.5 rounded-lg border bg-card px-3.5 transition-colors focus-within:ring-1 ${
                emailError ? "border-danger focus-within:border-danger" : "border-subtle focus-within:border-ink focus-within:ring-ink"
              }`}
            >
              <Mail size={16} className="shrink-0 text-secondary" />
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@sparkr.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError(null);
                }}
                className="w-full bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
              />
            </div>
            {emailError && <p className="text-sm text-danger">{emailError}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-sm font-semibold text-primary">
              Password
            </label>
            <div
              className={`flex h-11 items-center gap-2.5 rounded-lg border bg-card px-3.5 transition-colors focus-within:ring-1 ${
                passwordError ? "border-danger focus-within:border-danger" : "border-subtle focus-within:border-ink focus-within:ring-ink"
              }`}
            >
              <Lock size={16} className="shrink-0 text-secondary" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                className="w-full bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="shrink-0 text-secondary hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordError && <p className="text-sm text-danger">{passwordError}</p>}
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Sign In
            {!isLoading && <ArrowRight size={16} />}
          </Button>
        </form>
      </div>

      <p className="mt-4 text-xs text-secondary">© {new Date().getFullYear()} Sparkr. All rights reserved.</p>
    </div>
  );
}
