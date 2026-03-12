import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
    title: "Login",
    description: "Login to your REVA account.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-xs">
      <LoginForm />
    </div>
  )
}
