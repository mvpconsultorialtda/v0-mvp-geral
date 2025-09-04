import SignUpForm from "@/src/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">Criar Conta</h1>
          <p className="text-center text-muted-foreground">
            Bem-vindo! Preencha os campos para se cadastrar.
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
