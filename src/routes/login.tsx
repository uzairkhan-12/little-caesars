import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import littleCaesarsLogo from "@/assets/little-caesars-logo.png";
import primewaveLogo from "@/assets/primewave-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthSession, login } from "@/lib/auth.functions";

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
    <div className="login-page min-h-dvh flex flex-col items-center justify-center px-4 py-10">
      <div className="login-card w-full max-w-md rounded-2xl border border-border/60 bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 mb-8">
          <img
            src={littleCaesarsLogo}
            alt="Little Caesars"
            className="h-10 w-auto object-contain"
          />
          <img
            src={primewaveLogo}
            alt="PrimeWave AI Solutions"
            className="h-9 w-auto object-contain opacity-90"
          />
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Kitchen Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              className="h-10 border-border/60 bg-background/80"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={pending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="h-10 border-border/60 bg-background/80"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              required
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
