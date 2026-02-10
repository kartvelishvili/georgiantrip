import React from 'react';
import { Helmet } from 'react-helmet';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const ContactPage = () => {
  const { content } = useSiteContent('contact', 'info', DEFAULT_CONTENT.contact.info);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Contact Us | GeorgianTrip</title>
        <meta name="description" content="Get in touch with GeorgianTrip team. 24/7 support for your travel needs in Georgia." />
      </Helmet>

      {/* Header */}
      <div className="bg-gray-950 text-white py-28 pb-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-gray-950 to-blue-900/30 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.12),transparent_60%)]" />
        <motion.div 
          className="container-custom relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-bold mb-4 tracking-wide border border-white/20">
            <MessageSquare className="w-4 h-4" />
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We'd love to hear from you. Our friendly team is always here to chat.
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="container-custom -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-full">
              <ContactInfo />
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16 bg-gray-100 rounded-2xl overflow-hidden h-[400px] shadow-lg border border-gray-200">
          <iframe 
            src={content.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.597362777326!2d44.79377401568057!3d41.69666797923714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40440cf6e37e179d%3A0x6001a0e1b071060!2sRustaveli%20Ave%2C%20Tbilisi!5e0!3m2!1sen!2sge!4v1689771234567!5m2!1sen!2sge"}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Office Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;