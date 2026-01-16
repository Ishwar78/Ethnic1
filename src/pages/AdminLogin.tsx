import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@vasstra.com");
  const [password, setPassword] = useState("admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      console.log('Attempting to connect to:', `${API_URL}/auth/login`);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      // Check if user is admin
      if (data.user.role !== "admin") {
        setError("Only admin users can access this panel");
        toast({
          title: "Access Denied",
          description: "Only admin users can access this panel",
          variant: "destructive",
        });
        return;
      }

      // Store token and user
      localStorage.setItem("vasstra_auth_token", data.token);
      localStorage.setItem("vasstra_auth_user", JSON.stringify(data.user));

      toast({
        title: "Login Successful",
        description: "Welcome to Vasstra Admin Panel!",
      });

      // Redirect to admin dashboard
      navigate("/admin");
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error instanceof Error ? error.message : "Network error";

      // Check if it's a connection error
      if (errorMsg.includes("Failed to fetch") || errorMsg.includes("fetch")) {
        setError(`Cannot connect to backend API at: ${API_URL}\n\nMake sure the backend server is running on port 5000`);
      } else {
        setError(errorMsg);
      }

      toast({
        title: "Connection Error",
        description: `Cannot reach API. Backend might not be running. Check: ${API_URL}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | Vasstra</title>
        <meta name="description" content="Vasstra Admin Panel Login" />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <div className="w-full max-w-md">
          {/* Admin Panel Header */}
          <div className="text-center mb-10">
            <div className="inline-block mb-4 p-3 bg-primary/10 rounded-lg">
              <span className="text-3xl font-bold text-primary">⚙️</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Vasstra Management System</p>
          </div>

          {/* Login Card */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Sign In</h2>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>
                <p className="text-xs text-destructive/70 mt-2">
                  API URL: {API_URL}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@vasstra.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gold"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In to Admin Panel"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs font-semibold text-foreground mb-2">Demo Credentials:</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Email:</span> admin@vasstra.com
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Password:</span> admin@123
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Not an admin?{" "}
                <a href="/" className="text-primary font-medium hover:underline">
                  Go to home
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground">
              Vasstra Admin Management System © 2024
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
