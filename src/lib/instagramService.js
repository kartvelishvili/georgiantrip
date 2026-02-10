// Service to handle Instagram feed data
// Simulating high-quality Georgia images for the feed

export const fetchInstagramPosts = async () => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return [
    {
      id: '1',
      permalink: 'https://www.instagram.com/georgiantrip_go/',
      media_url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=600',
      caption: 'The breathtaking Gergeti Trinity Church under the shadow of Mount Kazbek. 🏔️ #Kazbegi #Georgia',
      likes: 1245
    },
    {
      id: '2',
      permalink: 'https://www.instagram.com/georgiantrip_go/',
      media_url: 'https://images.unsplash.com/photo-1569420427352-789a74288019?auto=format&fit=crop&q=80&w=600',
      caption: 'Wandering through the colorful streets of Old Tbilisi. Every balcony tells a story. ✨ #Tbilisi #Architecture',
      likes: 893
    },
    {
      id: '3',
      permalink: 'https://www.instagram.com/georgiantrip_go/',
      media_url: 'https://images.unsplash.com/photo-1582236314811-db8a2046422d?auto=format&fit=crop&q=80&w=600',
      caption: 'The ancient stone towers of Ushguli, Svaneti. A UNESCO World Heritage site frozen in time. 🏛️ #Svaneti #History',
      likes: 1567
    },
    {
      id: '4',
      permalink: 'https://www.instagram.com/georgiantrip_go/',
      media_url: 'https://images.unsplash.com/photo-1628108643883-9a4f4d2217f6?auto=format&fit=crop&q=80&w=600',
      caption: 'Sunset vibes on the Batumi boulevard. The pearl of the Black Sea! 🌊 #Batumi #Summer',
      likes: 2102
    },
    {
      id: '5',
      permalink: 'https://www.instagram.com/georgiantrip_go/',
      media_url: 'https://images.unsplash.com/photo-1541300613939-71366b37c92e?auto=format&fit=crop&q=80&w=600',
      caption: 'Traditional Georgian wine making in Qvevri. Gaumarjos! 🍷 #Wine #Kakheti',
      likes: 1120
    },
    {
      id: '6',
      permalink: 'https://www.instagram.com/georgiantrip_go/',
      media_url: 'https://images.unsplash.com/photo-1629841808620-802c6110292b?auto=format&fit=crop&q=80&w=600',
      caption: 'Exploring the magical Martvili Canyon. Nature at its finest. 🌿 #Nature #Explore',
      likes: 1450
    }
  ];
};