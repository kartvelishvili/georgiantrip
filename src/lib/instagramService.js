// Service to handle Instagram feed data
// Fetches real Instagram posts using Instagram Basic Display API

const INSTAGRAM_ACCESS_TOKEN = process.env.VITE_INSTAGRAM_ACCESS_TOKEN || '';
const INSTAGRAM_USER_ID = process.env.VITE_INSTAGRAM_USER_ID || '';

// Fallback posts in case API fails
const FALLBACK_POSTS = [
  {
    id: '1',
    permalink: 'https://www.instagram.com/georgiantrip_go_/',
    media_url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=600',
    caption: 'The breathtaking Gergeti Trinity Church under the shadow of Mount Kazbek. 🏔️ #Kazbegi #Georgia',
    likes: 1245
  },
  {
    id: '2',
    permalink: 'https://www.instagram.com/georgiantrip_go_/',
    media_url: 'https://images.unsplash.com/photo-1569420427352-789a74288019?auto=format&fit=crop&q=80&w=600',
    caption: 'Wandering through the colorful streets of Old Tbilisi. Every balcony tells a story. ✨ #Tbilisi #Architecture',
    likes: 893
  },
  {
    id: '3',
    permalink: 'https://www.instagram.com/georgiantrip_go_/',
    media_url: 'https://images.unsplash.com/photo-1582236314811-db8a2046422d?auto=format&fit=crop&q=80&w=600',
    caption: 'The ancient stone towers of Ushguli, Svaneti. A UNESCO World Heritage site frozen in time. 🏛️ #Svaneti #History',
    likes: 1567
  },
  {
    id: '4',
    permalink: 'https://www.instagram.com/georgiantrip_go_/',
    media_url: 'https://images.unsplash.com/photo-1628108643883-9a4f4d2217f6?auto=format&fit=crop&q=80&w=600',
    caption: 'Sunset vibes on the Batumi boulevard. The pearl of the Black Sea! 🌊 #Batumi #Summer',
    likes: 2102
  },
  {
    id: '5',
    permalink: 'https://images.unsplash.com/photo-1541300613939-71366b37c92e?auto=format&fit=crop&q=80&w=600',
    caption: 'Traditional Georgian wine making in Qvevri. Gaumarjos! 🍷 #Wine #Kakheti',
    likes: 1120
  },
  {
    id: '6',
    permalink: 'https://images.unsplash.com/photo-1629841808620-802c6110292b?auto=format&fit=crop&q=80&w=600',
    caption: 'Exploring the magical Martvili Canyon. Nature at its finest. 🌿 #Nature #Explore',
    likes: 1450
  }
];

// Function to fetch Instagram posts using Instagram Basic Display API
export const fetchInstagramPosts = async () => {
  try {
    // If we have access token, try to fetch real posts
    if (INSTAGRAM_ACCESS_TOKEN && INSTAGRAM_USER_ID) {
      const response = await fetch(`https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,media_url,permalink,caption,thumbnail_url,media_type&access_token=${INSTAGRAM_ACCESS_TOKEN}&limit=6`);

      if (response.ok) {
        const data = await response.json();

        if (data.data && data.data.length > 0) {
          return data.data.map(post => ({
            id: post.id,
            permalink: post.permalink,
            media_url: post.media_url || post.thumbnail_url,
            caption: post.caption || 'Beautiful moment from Georgia! 🏔️',
            likes: Math.floor(Math.random() * 2000) + 500, // Mock likes since API doesn't provide them
            media_type: post.media_type
          })).filter(post => post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM');
        }
      }
    }

    // If API fails or no credentials, try alternative approach with specific post IDs
    const specificPosts = await fetchSpecificInstagramPosts();
    if (specificPosts.length > 0) {
      return specificPosts;
    }

    // Fallback to mock data
    console.log('Using fallback Instagram posts');
    return FALLBACK_POSTS;

  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return FALLBACK_POSTS;
  }
};

// Function to fetch specific Instagram posts using oEmbed API
const fetchSpecificInstagramPosts = async () => {
  // Get post URLs from environment variables
  const postUrlsString = process.env.VITE_INSTAGRAM_POST_URLS || '';
  const postUrls = postUrlsString.split(',').map(url => url.trim()).filter(url => url.length > 0);

  if (postUrls.length === 0) {
    return [];
  }

  try {
    const posts = [];

    for (const url of postUrls.slice(0, 6)) {
      try {
        const response = await fetch(`https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          posts.push({
            id: data.media_id || url.split('/p/')[1]?.split('/')[0] || Math.random().toString(),
            permalink: url,
            media_url: data.thumbnail_url,
            caption: data.title || 'Beautiful moment from Georgia! 🏔️',
            likes: Math.floor(Math.random() * 2000) + 500
          });
        }
      } catch (postError) {
        console.error('Error fetching specific post:', postError);
      }
    }

    return posts;
  } catch (error) {
    console.error('Error fetching specific posts:', error);
    return [];
  }
};

// Function to get Instagram profile info
export const getInstagramProfile = async () => {
  try {
    if (INSTAGRAM_ACCESS_TOKEN && INSTAGRAM_USER_ID) {
      const response = await fetch(`https://graph.instagram.com/${INSTAGRAM_USER_ID}?fields=username,followers_count,follows_count,media_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`);

      if (response.ok) {
        const data = await response.json();
        return {
          username: data.username,
          followers: data.followers_count,
          following: data.follows_count,
          posts: data.media_count
        };
      }
    }

    // Fallback profile info
    return {
      username: 'georgiantrip_go_',
      followers: 1250,
      following: 150,
      posts: 89
    };
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    return {
      username: 'georgiantrip_go_',
      followers: 1250,
      following: 150,
      posts: 89
    };
  }
};