import { supabase } from './customSupabaseClient';

/**
 * Fetch all about page content, organized by section
 */
export const getAboutContent = async () => {
  const { data: contentData, error: contentError } = await supabase
    .from('about_content')
    .select('*')
    .order('display_order', { ascending: true });

  if (contentError) throw contentError;

  const { data: teamData, error: teamError } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });

  if (teamError) throw teamError;

  // Transform flat data into structured object if needed, or return as is
  // For this implementation, we'll return a structured object for easier consumption
  const structure = {
    hero: {},
    story: { items: [] },
    features: [],
    stats: [],
    values: [],
    team: teamData || []
  };

  contentData?.forEach(item => {
    if (item.section === 'hero') {
      structure.hero[item.key] = item.value;
      if (item.image_url) structure.hero.image_url = item.image_url;
    } else if (item.section === 'story') {
        structure.story[item.key] = item.value;
        if(item.image_url) structure.story.images = [...(structure.story.images || []), item.image_url];
    } else if (['features', 'stats', 'values'].includes(item.section)) {
      // These are list items
      structure[item.section].push(item);
    }
  });
  
  // Fallback for demo if DB is empty (Hybrid approach)
  if (!structure.hero.title) {
      return getStaticAboutData();
  }

  return structure;
};

/**
 * Update a specific piece of content
 */
export const updateAboutContent = async (id, updates) => {
  const { data, error } = await supabase
    .from('about_content')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createAboutContent = async (newItem) => {
    const { data, error } = await supabase.from('about_content').insert(newItem).select().single();
    if(error) throw error;
    return data;
}

export const deleteAboutContent = async (id) => {
    const { error } = await supabase.from('about_content').delete().eq('id', id);
    if(error) throw error;
}

// Team CRUD
export const getTeamMembers = async () => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const addTeamMember = async (member) => {
  const { data, error } = await supabase
    .from('team_members')
    .insert(member)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTeamMember = async (id, updates) => {
  const { data, error } = await supabase
    .from('team_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTeamMember = async (id) => {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Fallback Static Data
export const getStaticAboutData = () => {
    return {
        hero: {
            title: "About GeorgianTrip",
            subtitle: "Discover the Magic of Georgia with Us",
            imageUrl: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80"
        },
        story: {
            title: "Our Story",
            description: "GeorgianTrip was founded in 2015 with a simple mission: to share the beauty and culture of Georgia with the world. What started as a small family business has grown into a leading travel company, serving thousands of travelers from around the globe. We believe that travel is more than just visiting places—it's about connecting with people, cultures, and the natural wonders that make our country unique.",
            milestones: [
                { year: "2015", title: "Founded in Tbilisi" },
                { year: "2018", title: "Expanded to Nationwide Tours" },
                { year: "2023", title: "Served 10,000+ Happy Travelers" }
            ]
        },
        stats: [
            { id: '1', section: 'stats', label: "Founded", value: "2015", key: 'calendar' },
            { id: '2', section: 'stats', label: "Happy Travelers", value: "10k+", key: 'users' },
            { id: '3', section: 'stats', label: "Unique Tours", value: "50+", key: 'map' },
            { id: '4', section: 'stats', label: "Travel Choice", value: "#1", key: 'award' }
        ],
        values: [
            { id: '1', section: 'values', key: 'Authenticity', value: "We believe in genuine, authentic experiences that connect you with local culture.", image_url: 'heart' },
            { id: '2', section: 'values', key: 'Excellence', value: "We strive for excellence in every detail, from vehicle comfort to guide knowledge.", image_url: 'star' },
            { id: '3', section: 'values', key: 'Sustainability', value: "We care for Georgia's environment and culture, promoting responsible tourism.", image_url: 'leaf' }
        ],
        team: [
            { id: '1', name: "Giorgi Beridze", role: "Founder & CEO", photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400", bio: "Visionary leader with 15 years in tourism." },
            { id: '2', name: "Nino Kvaratskhelia", role: "Head of Operations", photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400", bio: "Logistics expert ensuring smooth journeys." },
            { id: '3', name: "David Mamardashvili", role: "Lead Tour Guide", photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400", bio: "Passionate historian and storyteller." },
            { id: '4', name: "Mariam Tsereteli", role: "Customer Support", photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400", bio: "Dedicated to 24/7 traveler assistance." }
        ]
    };
};