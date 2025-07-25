import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Twitter, Facebook, Github } from "lucide-react"
import Link from "next/link"

export default function Component() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          {/* Logo/Brand Mark */}
          <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>

          {/* Headlines */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Subscribe to My Newsletter</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get the latest updates, exclusive content, and insights delivered straight to your inbox every week.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Sign-up Options */}
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center">Sign up with</p>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-10 bg-transparent">
                <Twitter className="w-4 h-4" />
                <span className="sr-only">Sign up with Twitter</span>
              </Button>
              <Button variant="outline" className="h-10 bg-transparent">
                <Facebook className="w-4 h-4" />
                <span className="sr-only">Sign up with Facebook</span>
              </Button>
              <Button variant="outline" className="h-10 bg-transparent">
                <Github className="w-4 h-4" />
                <span className="sr-only">Sign up with GitHub</span>
              </Button>
            </div>
          </div>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-2 text-xs text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="h-12 text-base"
                required
              />
            </div>

            <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium">
              Subscribe Now
            </Button>
          </form>

          {/* Additional Links */}
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <Link href="/terms" className="hover:text-purple-600 transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-purple-600 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:text-purple-600 transition-colors">
              Help
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Mail className="w-3 h-3" />
              We respect your privacy and never share your data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
