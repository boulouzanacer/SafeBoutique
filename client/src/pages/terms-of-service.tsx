import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { SiteSettings } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AnimatedText from "@/components/animated-text";

export default function TermsOfService() {
  const { t } = useTranslation();
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl" data-testid="terms-of-service-page">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-light tracking-wide text-primary mb-8" data-testid="terms-of-service-title">
            <AnimatedText translationKey="terms.title" />
          </h1>
          
          <div className="prose max-w-none">
            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap" data-testid="terms-of-service-content">
              {settings?.termsOfService || "Terms of service content is being updated. Please check back later."}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <AnimatedText translationKey="terms.lastUpdated" className="inline" />: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}