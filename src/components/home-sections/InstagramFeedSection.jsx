import React, { useEffect, useState } from 'react';
import { Instagram, Heart, ExternalLink, Loader2, Camera } from 'lucide-react';
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
    <section className="py-24 bg-white">
      <div className="container-custom">
        {/* Header - Consistent with other sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-sm font-bold mb-4 tracking-wide border border-pink-100">
            <Camera className="w-4 h-4" />
            Instagram
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            @georgiantrip_go
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-lg">
            See the beauty of Georgia through our travelers' eyes
          </p>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                onClick={() => handlePostClick(post.permalink)}
              >
                <img 
                  src={post.media_url} 
                  alt={post.caption || "Instagram post"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center">
                   <div className="flex items-center gap-2 mb-2 font-bold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Heart className="w-5 h-5 fill-white" />
                      {(post.likes ?? 0).toLocaleString()}
                   </div>
                   <p className="text-xs line-clamp-2 opacity-90 font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {post.caption}
                   </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Follow Button */}
        <div className="mt-10 text-center">
           <Button 
            onClick={() => window.open('https://www.instagram.com/georgiantrip_go/', '_blank')}
            className="bg-gray-900 text-white hover:bg-gray-800 gap-2 font-bold px-8 rounded-full h-12 shadow-lg"
          >
            <Instagram className="w-4 h-4" />
            Follow Us on Instagram
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeedSection;