// Service to handle Instagram feed data
// Uses Instagram Graph API when access token is available, falls back to curated Georgia images
import { supabase } from '@/lib/customSupabaseClient';

const INSTAGRAM_API_URL = 'https://graph.instagram.com';

// Try to fetch real Instagram posts using access token from admin_settings
const fetchRealInstagramPosts = async () => {
  // Check if there's an Instagram token in admin_settings
  const { data: settings } = await supabase
    .from('admin_settings')
    .select('*')
    .maybeSingle();

  const token = settings?.instagram_access_token;
  if (!token) return null;

  try {
    const response = await fetch(
      `${INSTAGRAM_API_URL}/me/media?fields=id,caption,media_url,permalink,timestamp,media_type,thumbnail_url&limit=12&access_token=${token}`
    );
    
    if (!response.ok) {
      console.warn('Instagram API returned error:', response.status);
      return null;
    }

    const json = await response.json();
    
    if (!json.data || json.data.length === 0) return null;

    // Filter to only images and carousels (skip videos without thumbnails)
    return json.data
      .filter(post => post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM' || post.thumbnail_url)
      .slice(0, 6)
      .map(post => ({
        id: post.id,
        permalink: post.permalink,
        media_url: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
        caption: post.caption || '',
        likes: 0, // Like count requires additional permissions
        timestamp: post.timestamp
      }));
  } catch (err) {
    console.warn('Failed to fetch real Instagram posts:', err);
    return null;
  }
};

// Fallback curated images of Georgia
const getFallbackPosts = () => [
  {
    id: '1',
    permalink: 'https://www.instagram.com/georgiantrip_go/',
    media_url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=600',
    caption: 'The breathtaking Gergeti Trinity Church under the shadow of Mount Kazbek. #Kazbegi #Georgia',
    likes: 1245
  },
  {
    id: '2',
    permalink: 'https://www.instagram.com/georgiantrip_go/',
    media_url: 'https://images.unsplash.com/photo-1569420427352-789a74288019?auto=format&fit=crop&q=80&w=600',
    caption: 'Wandering through the colorful streets of Old Tbilisi. Every balcony tells a story. #Tbilisi',
    likes: 893
  },
  {
    id: '3',
    permalink: 'https://www.instagram.com/georgiantrip_go/',
    media_url: 'https://images.unsplash.com/photo-1582236314811-db8a2046422d?auto=format&fit=crop&q=80&w=600',
    caption: 'The ancient stone towers of Ushguli, Svaneti. A UNESCO World Heritage site. #Svaneti',
    likes: 1567
  },
  {
    id: '4',
    permalink: 'https://www.instagram.com/georgiantrip_go/',
    media_url: 'https://images.unsplash.com/photo-1628108643883-9a4f4d2217f6?auto=format&fit=crop&q=80&w=600',
    caption: 'Sunset vibes on the Batumi boulevard. The pearl of the Black Sea! #Batumi',
    likes: 2102
  },
  {
    id: '5',
    permalink: 'https://www.instagram.com/georgiantrip_go/',
    media_url: 'https://images.unsplash.com/photo-1541300613939-71366b37c92e?auto=format&fit=crop&q=80&w=600',
    caption: 'Traditional Georgian wine making in Qvevri. Gaumarjos! #Wine #Kakheti',
    likes: 1120
  },
  {
    id: '6',
    permalink: 'https://www.instagram.com/georgiantrip_go/',
    media_url: 'https://images.unsplash.com/photo-1629841808620-802c6110292b?auto=format&fit=crop&q=80&w=600',
    caption: 'Exploring the magical Martvili Canyon. Nature at its finest. #Nature #Explore',
    likes: 1450
  }
];

export const fetchInstagramPosts = async () => {
  // Try real API first
  const realPosts = await fetchRealInstagramPosts();
  if (realPosts && realPosts.length > 0) {
    return realPosts;
  }
  
  // Fallback to curated images
  return getFallbackPosts();
};