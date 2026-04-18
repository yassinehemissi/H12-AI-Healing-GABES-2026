"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { ArrowRight, Sparkles } from "lucide-react"

import { signUpAction } from "@/app/(auth)/actions"
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

export default function SignUpPage() {
  const [state, action] = useActionState(signUpAction, initialState)
  const [userType, setUserType] = useState("")

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f8f4] px-4 py-8">
      <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(to_right,rgba(39,39,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(39,39,42,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-emerald-300/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-12 h-72 w-80 rounded-full bg-cyan-300/35 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-5xl items-stretch overflow-hidden rounded-4xl border border-zinc-900/10 bg-white/75 backdrop-blur-lg md:grid-cols-[1fr_1fr]">
        <section className="hidden border-r border-zinc-900/10 p-8 md:block">
          <Badge className="rounded-full border-emerald-600/30 bg-emerald-100 text-emerald-800">
            <Sparkles className="size-3.5" />
            Smart onboarding
          </Badge>
          <h1 className="mt-5 font-heading text-4xl leading-tight text-zinc-950">
            Create your AI healing workspace
          </h1>
          <p className="mt-4 text-sm text-zinc-600">
            Register as normal or enterprise, then move directly into your dashboard
            with role-aware access.
          </p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8">
          <Card className="w-full max-w-md border-zinc-900/10 bg-white/90">
            <CardHeader>
              <CardTitle>Create account</CardTitle>
              <p className="text-sm text-zinc-600">Set your account details and select your role.</p>
            </CardHeader>
            <CardContent>
              <form action={action} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Full name
                  </label>
                  <Input id="fullName" name="fullName" placeholder="John Doe" />
                  {state.fieldErrors?.fullName?.[0] ? (
                    <p className="text-sm text-red-600">{state.fieldErrors.fullName[0]}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" name="email" type="email" placeholder="you@company.com" />
                  {state.fieldErrors?.email?.[0] ? (
                    <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input id="password" name="password" type="password" />
                    {state.fieldErrors?.password?.[0] ? (
                      <p className="text-sm text-red-600">{state.fieldErrors.password[0]}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm
                    </label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" />
                    {state.fieldErrors?.confirmPassword?.[0] ? (
                      <p className="text-sm text-red-600">
                        {state.fieldErrors.confirmPassword[0]}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">User type</label>
                  <input type="hidden" name="userType" value={userType} />
                  <Select value={userType} onValueChange={setUserType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose your account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal user</SelectItem>
                      <SelectItem value="enterprise">Enterprise user</SelectItem>
                    </SelectContent>
                  </Select>
                  {state.fieldErrors?.userType?.[0] ? (
                    <p className="text-sm text-red-600">{state.fieldErrors.userType[0]}</p>
                  ) : null}
                </div>

                {state.error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Sign-up failed</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                ) : null}

                <AuthSubmitButton text="Create account" pendingText="Creating account..." />
              </form>

              <p className="mt-4 text-sm text-zinc-600">
                Already have an account?{" "}
                <Link href="/sign-in" className="inline-flex items-center gap-1 text-zinc-950 underline">
                  Sign in
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
