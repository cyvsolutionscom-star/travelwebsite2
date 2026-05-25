import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Fleet from "@/components/Fleet";
import Reviews from "@/components/Reviews";
import Payment from "@/components/Payment";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { useSiteSettings } from "@/hooks/useSiteData";

const Index = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    // Browser title
    const title = settings.seo_meta_title || `${settings.business_name || "Aim Car Travels"} — Self-Drive Car Rentals`;
    document.title = title;

    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", settings.seo_meta_description || "Vijayawada's trusted self-drive car rental.");
    }

    // Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", settings.seo_meta_keywords || "self drive cars, car rental vijayawada");

    // OG Title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", settings.seo_meta_title || settings.business_name || "Aim Car Travels");
    }

    // OG Description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", settings.seo_meta_description || "Premium self-drive rentals — book anytime, drive anywhere.");
    }

    // OG Image
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (settings.seo_og_image_url) {
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", settings.seo_og_image_url);
    } else if (ogImage) {
      ogImage.remove();
    }

    // Favicon link update
    if (settings.seo_favicon_url) {
      const favicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      favicons.forEach((el) => {
        el.setAttribute("href", settings.seo_favicon_url || "/favicon.png");
      });
    }
  }, [settings]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Fleet />
      <Reviews />
      <Payment />
      <CTA />
      <Footer />
      <FloatingActions />
    </main>
  );
};

export default Index;
