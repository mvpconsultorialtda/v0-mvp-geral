import SignUpForm from "@/src/components/auth/SignUpForm";
import { GoBackButton } from "@/src/components/ui/go-back-button";

export default function SignUpPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background">
        <div className="absolute top-4 left-4">
         <GoBackButton />
        </div>
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
