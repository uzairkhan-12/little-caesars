import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import littleCaesarsLogo from "@/assets/little-caesars-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="login-page min-h-dvh flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="login-card w-full max-w-[22rem] sm:max-w-sm">
        <div className="login-brand">
          <img
            src={littleCaesarsLogo}
            alt="Little Caesars"
            className="login-brand__logo"
          />
          <p className="login-brand__subtitle">Sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <Label htmlFor="username">Username</Label>
            <Input
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
            <Label htmlFor="password">Password</Label>
            <Input
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

          <Button type="submit" className="login-submit w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        </div>
      </div>

      <PrimewaveFooter />
    </div>
  );
}
