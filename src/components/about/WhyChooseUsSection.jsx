import React from 'react';
import { Users, Car, Map, Clock, Wallet, ShieldCheck, Award } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, image }) => (
  <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
    <div className="h-40 overflow-hidden relative">
       <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
       <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-sm text-green-600">
          <Icon className="w-6 h-6" />
       </div>
    </div>
    <div className="p-6 flex-grow">
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  </div>
);

const WhyChooseUsSection = () => {
  const features = [
    {
      icon: Users,
      title: "Expert Local Guides",
      description: "Our experienced guides know Georgia inside and out, offering deep cultural insights you won't find in guidebooks.",
      image: "https://images.unsplash.com/photo-1542318285-8025232822a1?auto=format&fit=crop&q=80&w=500"
    },
    {
      icon: Car,
      title: "Comfortable Transport",
      description: "Travel in style with our modern fleet of well-maintained vehicles, ensuring a smooth and safe journey.",
      image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=500"
    },
    {
      icon: Map,
      title: "Authentic Experiences",
      description: "We take you off the beaten path to discover hidden gems, local families, and authentic Georgian traditions.",
      image: "https://images.unsplash.com/photo-1562095368-2c262a046833?auto=format&fit=crop&q=80&w=500"
    },
    {
      icon: Clock,
      title: "24/7 Customer Support",
      description: "Our dedicated support team is always just a call or message away to assist with any questions or needs.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=500"
    },
    {
      icon: Wallet,
      title: "Competitive Pricing",
      description: "Experience luxury and comfort without breaking the bank. We offer the best value for money in the region.",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=500"
    },
    {
      icon: ShieldCheck,
      title: "Safety & Security",
      description: "Your safety is our top priority. All our drivers are vetted professionals and vehicles are regularly inspected.",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=500"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
           <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">
             <Award className="w-4 h-4" />
             Why Choose Us
           </span>
           <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              We Make Your Georgian Journey Extraordinary
           </h2>
           <p className="text-gray-500 text-lg">
              Here's why thousands of travelers trust GeorgianTrip for their adventures in the Caucasus.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
           ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;