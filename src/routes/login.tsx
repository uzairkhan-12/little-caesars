import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import littleCaesarsLogo from "@/assets/little-caesars-logo.png";
import { getAuthSession, login } from "@/lib/auth.functions";
import { PrimewaveFooter } from "@/components/PrimewaveFooter";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — Kitchen Dashboard" }],
  }),
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (session.authenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const loginFn = useServerFn(login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      await loginFn({ data: { username, password } });
      await router.invalidate();
      await router.navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-page min-h-dvh flex flex-col text-foreground">
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="login-card w-full max-w-[24rem]">
          <div className="login-brand">
            <img
              src={littleCaesarsLogo}
              alt="Little Caesars"
              className="login-brand__logo sm:h-16"
            />
            <p className="login-brand__subtitle">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="Enter username"
                className="login-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={pending}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
                required
              />
            </div>

            {error ? (
              <p className="login-error" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={pending} className="login-submit">
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      <PrimewaveFooter />
    </div>
  );
}
