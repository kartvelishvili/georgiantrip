import React, { useEffect, useState } from 'react';
import { Instagram, Heart, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { fetchInstagramPosts } from '@/lib/instagramService';

const InstagramFeedSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchInstagramPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to load Instagram posts", error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const handlePostClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-center md:text-left w-full md:w-auto">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-pink-600 font-bold">
              <Instagram className="w-5 h-5" />
              <span className="uppercase tracking-wider text-sm">Follow Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
              @georgiantrip_go
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Share your journey with us using #GeorgianTrip. See the beauty of Georgia through our travelers' eyes.
              {process.env.NODE_ENV === 'development' && (
                <span className="block text-xs text-amber-600 mt-1">
                  🔗 Real Instagram API integration ready
                </span>
              )}
            </p>
          </div>
          
          <Button 
            onClick={() => window.open('https://www.instagram.com/georgiantrip_go/', '_blank')}
            className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:text-pink-600 gap-2 shadow-sm font-medium px-6 hidden md:flex"
          >
            <Instagram className="w-4 h-4" />
            View Profile
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                onClick={() => handlePostClick(post.permalink)}
              >
                <img 
                  src={post.media_url} 
                  alt={post.caption || "Instagram post"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center backdrop-blur-[2px]">
                   <div className="flex items-center gap-2 mb-2 font-bold text-lg">
                      <Heart className="w-6 h-6 fill-white" />
                      {(post.likes ?? 0).toLocaleString()}
                   </div>
                   <p className="text-xs line-clamp-3 opacity-90 font-medium">
                      {post.caption}
                   </p>
                   <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                      <span className="bg-white/20 hover:bg-white/30 p-2 rounded-full inline-flex">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Mobile Button */}
        <div className="mt-8 text-center md:hidden">
           <Button 
            onClick={() => window.open('https://www.instagram.com/georgiantrip_go/', '_blank')}
            className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:text-pink-600 gap-2"
          >
            <Instagram className="w-4 h-4" />
            View Profile
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeedSection;