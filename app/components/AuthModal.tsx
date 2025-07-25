"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  id: string
  username: string
  email: string
  password: string
  snippets: any[]
  bugs: any[]
  gameScore: number
}

interface AuthModalProps {
  onLogin: (user: User) => void
}

export default function AuthModal({ onLogin }: AuthModalProps) {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupUsername, setSignupUsername] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: User) => u.email === loginEmail && u.password === loginPassword)

    if (user) {
      onLogin(user)
    } else {
      setError("Invalid email or password")
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const users = JSON.parse(localStorage.getItem("users") || "[]")

    if (users.some((u: User) => u.email === signupEmail)) {
      setError("Email already registered")
      return
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: signupUsername,
      email: signupEmail,
      password: signupPassword,
      snippets: [],
      bugs: [],
      gameScore: 0,
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))
    onLogin(newUser)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="bg-black/80 backdrop-blur-sm border-white/20 w-full max-w-md rounded-lg card-hover-lift">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white text-3d-effect">Login to CodeBuddy AI</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 rounded-md">
              <TabsTrigger
                value="login"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-md"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-md"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-white font-semibold">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/50 rounded-md"
                    placeholder="your@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-white font-semibold">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/50 rounded-md"
                    placeholder="********"
                    required
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button type="submit" className="w-full bg-blue-600/80 hover:bg-blue-700/80 btn-hover-scale rounded-md">
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-username" className="text-white font-semibold">
                    Username
                  </Label>
                  <Input
                    id="signup-username"
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/50 rounded-md"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email" className="text-white font-semibold">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/50 rounded-md"
                    placeholder="your@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password" className="text-white font-semibold">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/50 rounded-md"
                    placeholder="********"
                    required
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-green-600/80 hover:bg-green-700/80 btn-hover-scale rounded-md"
                >
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
