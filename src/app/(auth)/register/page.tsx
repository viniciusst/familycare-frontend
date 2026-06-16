import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Create account · FamilyCare",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
