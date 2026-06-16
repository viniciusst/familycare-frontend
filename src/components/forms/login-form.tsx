"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField, FormRootError } from "@/components/forms/form-primitives";
import { Input } from "@/components/ui/input";
import { ApiError, clientFetch } from "@/lib/api/client";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      await clientFetch("/api/auth/login", { method: "POST", body: data });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          setError("root", { message: "Invalid email or password." });
        } else if (error.status === 429) {
          setError("root", {
            message: "Too many attempts. Please wait a minute and try again.",
          });
        } else {
          setError("root", {
            message: error.problem.title || "Something went wrong.",
          });
        }
      } else {
        toast.error("Network error. Please try again.");
      }
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-h2">Welcome back</CardTitle>
          <CardDescription className="text-body-lg">
            Sign in to manage your family&apos;s well-being.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <FormField htmlFor="email" label="Email" error={errors.email?.message} required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
          </FormField>

          <FormField htmlFor="password" label="Password" error={errors.password?.message} required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
          </FormField>

          <FormRootError message={errors.root?.message} />
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="h-11 w-full text-base font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-muted-foreground text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
