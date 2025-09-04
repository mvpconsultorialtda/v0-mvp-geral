import LoginForm from "@/src/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">Login</h1>
          <p className="text-center text-muted-foreground">
            Bem-vindo de volta! Faça login para continuar.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
