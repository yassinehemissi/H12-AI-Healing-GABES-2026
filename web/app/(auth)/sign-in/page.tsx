"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { ArrowRight, ShieldCheck } from "lucide-react"

import { signInAction } from "@/app/(auth)/actions"
import { AuthSubmitButton } from "@/app/(auth)/_components/auth-submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AuthActionState } from "@/lib/auth/validation"

const initialState: AuthActionState = {}

export default function SignInPage() {
  const [state, action] = useActionState(signInAction, initialState)
  const [userType, setUserType] = useState("")

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0e1015] px-4 py-8 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="pointer-events-none absolute -left-10 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-5xl items-stretch overflow-hidden rounded-4xl border border-white/10 bg-black/30 backdrop-blur-xl md:grid-cols-[1fr_1fr]">
        <section className="hidden border-r border-white/10 p-8 md:block">
          <Badge className="rounded-full border-emerald-300/30 bg-emerald-400/20 text-emerald-100">
            <ShieldCheck className="size-3.5" />
            Secure access
          </Badge>
          <h1 className="mt-5 font-heading text-4xl leading-tight">
            Welcome back to your
            <span className="text-cyan-300"> mission console</span>
          </h1>
          <p className="mt-4 text-sm text-zinc-300">
            Sign in with your account type to enter your personalized workspace and
            continue your active programs.
          </p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8">
          <Card className="w-full max-w-md border-white/10 bg-[#11141b] text-zinc-100">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <p className="text-sm text-zinc-400">Access your normal or enterprise workspace.</p>
            </CardHeader>
            <CardContent>
              <form action={action} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    className="border-white/10 bg-white/5"
                  />
                  {state.fieldErrors?.email?.[0] ? (
                    <p className="text-sm text-red-300">{state.fieldErrors.email[0]}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="border-white/10 bg-white/5"
                  />
                  {state.fieldErrors?.password?.[0] ? (
                    <p className="text-sm text-red-300">{state.fieldErrors.password[0]}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">User type</label>
                  <input type="hidden" name="userType" value={userType} />
                  <Select value={userType} onValueChange={setUserType}>
                    <SelectTrigger className="w-full border-white/10 bg-white/5">
                      <SelectValue placeholder="Choose your account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal user</SelectItem>
                      <SelectItem value="enterprise">Enterprise user</SelectItem>
                    </SelectContent>
                  </Select>
                  {state.fieldErrors?.userType?.[0] ? (
                    <p className="text-sm text-red-300">{state.fieldErrors.userType[0]}</p>
                  ) : null}
                </div>

                {state.error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Sign-in failed</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                ) : null}

                <AuthSubmitButton text="Sign in" pendingText="Signing in..." />
              </form>

              <p className="mt-4 text-sm text-zinc-400">
                New here?{" "}
                <Link href="/sign-up" className="inline-flex items-center gap-1 text-zinc-100 underline">
                  Create an account
                  <ArrowRight className="size-3.5" />
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
