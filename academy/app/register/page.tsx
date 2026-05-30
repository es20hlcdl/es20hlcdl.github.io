import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
      <AuthForm mode="register" />
    </section>
  );
}
