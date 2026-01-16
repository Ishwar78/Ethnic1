import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  whatsapp: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: "+91 98765 43210",
    email: "support@vasstra.com",
    address: "123 Fashion Street, Textile Hub\nMumbai, Maharashtra 400001",
    businessHours: "Monday - Saturday: 10:00 AM - 7:00 PM\nSunday: Closed",
    whatsapp: "919876543210",
  });
  const [isLoadingContact, setIsLoadingContact] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // Fetch contact information on mount
  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setIsLoadingContact(true);
      const contactUrl = `${API_URL}/contact`;
      console.log('Fetching contact from:', contactUrl);

      const response = await fetch(contactUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Contact fetch failed with status:', response.status);
        throw new Error(`Failed to fetch contact information: ${response.status}`);
      }

      const data = await response.json();
      if (data.contact) {
        setContactInfo({
          phone: data.contact.phone || "+91 98765 43210",
          email: data.contact.email || "support@vasstra.com",
          address: data.contact.address || "123 Fashion Street, Textile Hub\nMumbai, Maharashtra 400001",
          businessHours: data.contact.businessHours || "Monday - Saturday: 10:00 AM - 7:00 PM\nSunday: Closed",
          whatsapp: data.contact.whatsapp || "919876543210",
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Use default values if fetch fails - not showing error to user since we have defaults
    } finally {
      setIsLoadingContact(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${contactInfo.whatsapp}?text=Hi, I have a query about Vasstra products.`, "_blank");
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Vasstra - Get in Touch</title>
        <meta name="description" content="Contact Vasstra for queries about ethnic wear, orders, or support. Reach us via phone, email, or WhatsApp. We're here to help!" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          {/* Hero */}
          <div className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
            <div className="container mx-auto px-4 text-center">
              <nav className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <span className="text-foreground">Contact</span>
              </nav>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                We'd love to hear from you. Our team is always here to help.
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    Contact Information
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Have questions about our products, orders, or need styling advice? 
                    Reach out to us through any of the channels below.
                  </p>
                </div>

                {isLoadingContact ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading contact info...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Phone</h3>
                        <p className="text-muted-foreground">{contactInfo.phone}</p>
                        <p className="text-sm text-muted-foreground">Mon-Sat, 10am-7pm IST</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Email</h3>
                        <p className="text-muted-foreground">{contactInfo.email}</p>
                        <p className="text-sm text-muted-foreground">We reply within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Address</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {contactInfo.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Business Hours</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {contactInfo.businessHours}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp CTA */}
                <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center">
                      <MessageCircle className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Quick Response via WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">Get instant replies on WhatsApp</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleWhatsApp}
                    className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject *</label>
                      <Input
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Order inquiry, Product query, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <Textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you?"
                    />
                  </div>

                  <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}
