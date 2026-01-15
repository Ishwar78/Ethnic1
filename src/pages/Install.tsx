import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { 
  Download, 
  Smartphone, 
  Zap, 
  Wifi, 
  Bell, 
  Shield, 
  ChevronRight,
  CheckCircle2,
  Share,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setDeferredPrompt(null);
    }
  };

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Load instantly with cached resources for a native app experience"
    },
    {
      icon: Wifi,
      title: "Works Offline",
      description: "Browse products and view saved items even without internet"
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Get notified about exclusive deals, sales, and new arrivals"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data stays safe with secure connections and encryption"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Install Vasstra App | Shop Ethnic Fashion On-the-Go</title>
        <meta 
          name="description" 
          content="Install the Vasstra app for a faster, offline-capable shopping experience. Get instant access to exclusive deals and new arrivals." 
        />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Progressive Web App</span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Install <span className="text-primary">Vasstra</span> on Your Device
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Experience the best of ethnic fashion shopping with our app. 
                Faster loading, offline access, and exclusive notifications.
              </p>

              {/* Install Button / Status */}
              {isInstalled ? (
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <span className="text-lg font-medium text-green-600">App Already Installed!</span>
                </div>
              ) : installSuccess ? (
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <span className="text-lg font-medium text-green-600">Installation Successful!</span>
                </div>
              ) : isIOS ? (
                <div className="max-w-md mx-auto">
                  <div className="bg-card border border-border rounded-xl p-6 mb-4">
                    <h3 className="font-display text-lg font-semibold mb-4">Install on iOS</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold">1</span>
                        </div>
                        <div className="flex items-center gap-2 text-left">
                          <span>Tap the</span>
                          <Share className="w-5 h-5 text-primary" />
                          <span>Share button</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold">2</span>
                        </div>
                        <div className="flex items-center gap-2 text-left">
                          <span>Select</span>
                          <Plus className="w-5 h-5 text-primary" />
                          <span>"Add to Home Screen"</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold">3</span>
                        </div>
                        <span className="text-left">Tap "Add" to confirm</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : deferredPrompt ? (
                <Button 
                  size="lg" 
                  onClick={handleInstallClick}
                  className="text-lg px-8 py-6 h-auto gap-3"
                >
                  <Download className="w-6 h-6" />
                  Install Vasstra App
                </Button>
              ) : (
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    disabled
                    className="text-lg px-8 py-6 h-auto gap-3 opacity-50"
                  >
                    <Download className="w-6 h-6" />
                    Install Vasstra App
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Open this page in Chrome, Edge, or Safari to install
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Install Our App?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get the full native app experience without downloading from an app store
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  How It Works
                </h2>
                <p className="text-muted-foreground">
                  Simple steps to get started with our app
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    1
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">Click Install</h3>
                  <p className="text-sm text-muted-foreground">
                    Tap the install button or use browser menu
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    2
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">Confirm Install</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow the installation when prompted
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    3
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">Start Shopping</h3>
                  <p className="text-sm text-muted-foreground">
                    Open from home screen and enjoy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8">
                Install now and discover the best in ethnic fashion with an app-like experience
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isInstalled && !installSuccess && !isIOS && deferredPrompt && (
                  <Button size="lg" onClick={handleInstallClick} className="gap-2">
                    <Download className="w-5 h-5" />
                    Install Now
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild>
                  <Link to="/shop" className="gap-2">
                    Browse Collection
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Install;
