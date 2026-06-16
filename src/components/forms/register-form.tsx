"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, clientFetch } from "@/lib/api/client";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      preferredLanguage: 2,
    },
  });

  const preferredLanguage = watch("preferredLanguage");

  const onSubmit = async (data: RegisterInput) => {
    try {
      await clientFetch("/api/auth/register", { method: "POST", body: data });
      toast.success("Account created. Please sign in.");
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setError("email", {
            message: "An account with this email already exists.",
          });
        } else if (error.problem.errors) {
          for (const [field, messages] of Object.entries(error.problem.errors)) {
            const key = field.charAt(0).toLowerCase() + field.slice(1);
            setError(key as keyof RegisterInput, {
              message: messages[0],
            });
          }
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
          <CardTitle className="text-h2">Create your account</CardTitle>
          <CardDescription className="text-body-lg">
            Start managing your family&apos;s well-being.
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

          <FormField
            htmlFor="password"
            label="Password"
            hint="At least 8 characters with uppercase, digit, and special character."
            error={errors.password?.message}
            required
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="h-11"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
          </FormField>

          <FormField
            htmlFor="confirmPassword"
            label="Confirm password"
            error={errors.confirmPassword?.message}
            required
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="h-11"
              {...register("confirmPassword")}
              aria-invalid={!!errors.confirmPassword}
            />
          </FormField>

          <FormField htmlFor="preferredLanguage" label="Preferred language">
            <Select
              value={String(preferredLanguage)}
              onValueChange={(val) =>
                setValue("preferredLanguage", Number(val) as RegisterInput["preferredLanguage"])
              }
            >
              <SelectTrigger id="preferredLanguage" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">English (Canada)</SelectItem>
                <SelectItem value="3">Français (Canada)</SelectItem>
                <SelectItem value="1">Português (Brasil)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormRootError message={errors.root?.message} />
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="h-11 w-full text-base font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
