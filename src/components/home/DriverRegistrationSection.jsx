import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Check, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { submitDriverApplication } from '@/lib/contactService';
import { motion } from 'framer-motion';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const DriverRegistrationSection = () => {
  const { toast } = useToast();
  const { content } = useSiteContent('home', 'driver_registration', DEFAULT_CONTENT.home.driver_registration);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    car_model: '',
    license_plate: '',
    years_of_experience: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await submitDriverApplication({
        ...formData,
        years_of_experience: parseInt(formData.years_of_experience)
      });
      
      toast({
        title: "Application Received!",
        description: "We will contact you shortly to complete your registration.",
        className: "bg-green-50 border-green-200"
      });
      
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        car_model: '',
        license_plate: '',
        years_of_experience: ''
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = content.benefits || [
    "Flexible working hours - be your own boss",
    "Competitive earnings and instant payouts",
    "Professional support 24/7",
    "Access to thousands of tourists",
    "Easy registration process"
  ];

  return (
    <section className="bg-gray-950 text-white overflow-hidden relative pb-24">
      {/* Banner */}
      <div className="w-full relative h-[200px] md:h-[300px] mb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-gray-950 z-10" />
        <img 
          src={content.bannerImage || "https://i.postimg.cc/BQQSS2hZ/banner-georgiantrip-2048x439-modified-(1).png"}
          alt="Join GeorgianTrip Driver Team" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-bold mb-4 tracking-wide border border-white/20">
              <Users className="w-4 h-4" />
              Join Us
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white drop-shadow-lg text-center px-4">
              {content.bannerTitle || "Join Our Team of Professionals"}
            </h2>
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-[300px] right-0 w-1/2 h-full bg-green-900/10 skew-x-12 transform origin-top-right z-0" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          <motion.div 
            className="order-2 lg:order-1 pt-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-green-400">
              {content.heading || "Become a Partner"}
            </h3>
            <p className="text-xl text-gray-300 mb-10 font-light leading-relaxed">
              {content.description || "Are you an experienced driver with a reliable vehicle? Join GeorgianTrip and turn your kilometers into income. We provide the passengers; you provide the excellent service."}
            </p>
            
            <div className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-green-500/40 transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-900/50 group-hover:scale-110 transition-transform">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-100 font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 hidden md:block group">
               <img 
                 src={content.quoteImage || "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800"}
                 alt="Professional driver" 
                 className="w-full h-[250px] object-cover group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-6">
                  <p className="text-white font-medium italic border-l-4 border-green-500 pl-4">
                    {content.quote || '"Flexible schedule and great passengers. I recommend it to everyone."'}
                  </p>
               </div>
            </div>
          </motion.div>

          <motion.div 
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 md:p-8 bg-white text-gray-900 shadow-2xl border-0 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-600 to-green-400" />
              <h3 className="text-2xl font-bold mb-2 text-center text-gray-900">Driver Application</h3>
              <p className="text-center text-gray-500 mb-6 text-sm">Fill out the form below to get started</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Full Name</Label>
                  <Input required name="full_name" value={formData.full_name} onChange={handleChange} placeholder="First Last" className="bg-gray-50 border-gray-200 focus:ring-green-500 rounded-xl h-11" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-semibold">Email</Label>
                    <Input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@email.com" className="bg-gray-50 border-gray-200 focus:ring-green-500 rounded-xl h-11" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">Phone</Label>
                    <Input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+995..." className="bg-gray-50 border-gray-200 focus:ring-green-500 rounded-xl h-11" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-semibold">Car Model</Label>
                    <Input required name="car_model" value={formData.car_model} onChange={handleChange} placeholder="e.g. Toyota Prius" className="bg-gray-50 border-gray-200 focus:ring-green-500 rounded-xl h-11" />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">License Plate</Label>
                    <Input required name="license_plate" value={formData.license_plate} onChange={handleChange} placeholder="XX-000-XX" className="bg-gray-50 border-gray-200 focus:ring-green-500 rounded-xl h-11" />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold">Experience (Years)</Label>
                  <Input required type="number" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} placeholder="e.g. 5" className="bg-gray-50 border-gray-200 focus:ring-green-500 rounded-xl h-11" />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold mt-4 shadow-lg shadow-green-200 transition-all active:scale-[0.98] rounded-xl" disabled={loading}>
                  {loading ? "Sending..." : "Submit Application"}
                </Button>
                <p className="text-xs text-center text-gray-400 mt-2">
                  We respect your privacy.
                </p>
              </form>
            </Card>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default DriverRegistrationSection;