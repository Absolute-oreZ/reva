import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create a REVA account to save your echo history.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-xs">
      <SignUpForm />
    </div>
  )
}