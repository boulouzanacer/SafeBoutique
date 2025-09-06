import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteSettings } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message envoyé!",
        description: "Nous vous répondrons dans les plus brefs délais.",
        className: "border-green-200 bg-green-50 text-green-800"
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide text-primary mb-4" data-testid="contact-title">
              Contactez-nous
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nous sommes là pour vous aider. N'hésitez pas à nous contacter pour toute question ou demande d'information.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-light text-primary mb-8">Informations de contact</h2>
            
            <div className="space-y-6">
              {settings?.contactPhone && (
                <div className="flex items-start space-x-4" data-testid="contact-info-phone">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Téléphone</h3>
                    <p className="text-gray-600">{settings.contactPhone}</p>
                  </div>
                </div>
              )}

              {settings?.contactEmail && (
                <div className="flex items-start space-x-4" data-testid="contact-info-email">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">{settings.contactEmail}</p>
                  </div>
                </div>
              )}

              {settings?.contactAddress && (
                <div className="flex items-start space-x-4" data-testid="contact-info-address">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600 leading-relaxed">{settings.contactAddress}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Horaires d'ouverture</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>Lundi - Vendredi: 8h00 - 18h00</p>
                    <p>Samedi: 8h00 - 14h00</p>
                    <p>Dimanche: Fermé</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg border p-8">
              <h2 className="text-2xl font-light text-primary mb-8">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-12"
                      placeholder="Votre nom complet"
                      data-testid="input-name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-12"
                      placeholder="votre.email@exemple.com"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="h-12"
                      placeholder="Votre numéro de téléphone"
                      data-testid="input-phone"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="h-12"
                      placeholder="Sujet de votre message"
                      data-testid="input-subject"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Votre message détaillé..."
                    className="resize-none"
                    data-testid="input-message"
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3 h-12 bg-primary hover:bg-primary/90 text-white font-medium"
                    data-testid="button-submit"
                  >
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Pourquoi nous choisir ?</h3>
            <p className="text-gray-600 leading-relaxed">
              {settings?.siteDescription || "Nous offrons des produits de qualité premium avec un service client exceptionnel. Notre équipe d'experts est là pour vous accompagner dans tous vos projets."}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}