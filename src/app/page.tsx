import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LoadingSpinner } from "@/components/common/loading-spinner";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Tangibly logo"
              width={120}
              height={25}
              priority
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Welcome Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome to Tangibly
              </h1>
              <p className="text-muted-foreground text-xl">
                A modern Next.js application with the latest frontend tools and
                optimizations.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>🚀 Modern Stack</CardTitle>
                <CardDescription>
                  Built with the latest and greatest frontend technologies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-medium">Frontend</div>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Next.js 15</li>
                      <li>• React 19</li>
                      <li>• TypeScript</li>
                      <li>• Tailwind CSS v4</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">Tools & Libraries</div>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• shadcn/ui</li>
                      <li>• Zustand</li>
                      <li>• React Query</li>
                      <li>• Framer Motion</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-muted-foreground text-sm">
                    All components are optimized and ready to use
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button size="lg">Get Started</Button>
              <Button variant="outline" size="lg">
                View Docs
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="flex justify-center lg:justify-end">
            <ContactForm />
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Optimized with Next.js 15, Turbopack, and modern build tools for
                lightning-fast performance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Design System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Built-in design system with shadcn/ui components, dark mode, and
                consistent styling.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🛠️ Developer Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Modern tooling with ESLint, Prettier, Husky, and TypeScript for
                the best DX.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
