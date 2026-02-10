import React from 'react';
import { Linkedin, Twitter, Mail, Instagram } from 'lucide-react';

const TeamMember = ({ name, role, image, bio }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-xl transition-all duration-300 group">
    <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-green-50 group-hover:border-green-100 transition-colors shadow-inner">
       <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
       />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-1 font-heading">{name}</h3>
    <p className="text-green-600 font-bold text-sm mb-4 uppercase tracking-wide">{role}</p>
    <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-4">
       {bio}
    </p>
    <div className="flex justify-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
       <button className="text-gray-400 hover:text-blue-600 transition-colors transform hover:-translate-y-1">
          <Linkedin className="w-5 h-5" />
       </button>
       <button className="text-gray-400 hover:text-pink-600 transition-colors transform hover:-translate-y-1">
          <Instagram className="w-5 h-5" />
       </button>
       <button className="text-gray-400 hover:text-green-600 transition-colors transform hover:-translate-y-1">
          <Mail className="w-5 h-5" />
       </button>
    </div>
  </div>
);

const TeamSection = () => {
  const team = [
    {
       name: "Vasil Sidamonidze",
       role: "Founder & CEO",
       image: "https://lekwouwaajnnjhoomyrc.supabase.co/storage/v1/object/public/portfolio/portfolio/3e082f34-8ddc-4024-b3fa-89763fcb3605-client-logo-1766261719548.jpeg",
       bio: "A visionary leader with deep roots in Georgian tourism. Vasil founded GeorgianTrip with a mission to connect the world to the unparalleled beauty and hospitality of the Caucasus. His leadership drives the company's commitment to authentic experiences."
    },
    {
       name: "Nino Kvaratskhelia",
       role: "Head of Operations",
       image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
       bio: "With over a decade of experience in logistics, Nino ensures that every transfer and tour operates with clockwork precision. She is the backbone of our daily operations and customer satisfaction."
    },
    {
       name: "David Mamardashvili",
       role: "Lead Guide & Culture Expert",
       image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
       bio: "A historian by training and a storyteller at heart. David curates our tour itineraries, ensuring travelers don't just see the sights but understand the legends and history behind every stone in Georgia."
    },
    {
       name: "Mariam Tsereteli",
       role: "Customer Experience Manager",
       image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
       bio: "Mariam leads our support team with empathy and efficiency. She is dedicated to making sure every guest feels supported from the moment they land in Tbilisi until their departure."
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-gray-50">
       {/* Background Decoration */}
       <div className="absolute inset-0 z-0 opacity-10">
          <img 
             src="https://images.unsplash.com/photo-1578326457399-3b34dbbf23b8?auto=format&fit=crop&q=80&w=1920" 
             alt="Georgian Mountains Texture" 
             className="w-full h-full object-cover grayscale" 
          />
       </div>

       <div className="container-custom relative z-10">
          <div className="text-center mb-16">
             <span className="text-green-600 font-bold uppercase tracking-wider text-sm">Our People</span>
             <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mt-2 mb-6">Meet the Team</h2>
             <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                We are a group of passionate locals, explorers, and professionals dedicated to showing you the real Georgia.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {team.map((member, index) => (
                <TeamMember key={index} {...member} />
             ))}
          </div>
       </div>
    </section>
  );
};

export default TeamSection;