'use client'

import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await sendPasswordResetEmail(auth, email)
      toast({
        title: 'Email Enviado',
        description: 'Verifique sua caixa de entrada para o link de redefinição de senha.',
      })
      setMessage('Verifique sua caixa de entrada para o link de redefinição de senha.')
    } catch (error: any) {
      console.error('Password reset error', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o email de redefinição. Verifique o email digitado.',
        variant: 'destructive',
      })
      setMessage('Não foi possível enviar o email de redefinição. Verifique o email digitado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Esqueceu sua Senha?</CardTitle>
          <CardDescription>
            Digite seu email para receber um link de redefinição de senha.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            {message && <p className="text-sm text-center text-muted-foreground">{message}</p>}
          </CardContent>
          <div className="p-6 pt-0">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
            </Button>
            <div className="mt-4 text-center text-sm">
                <Link href="/login" className="underline">
                    Voltar para o Login
                </Link>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
