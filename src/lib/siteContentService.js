import { supabase } from './customSupabaseClient';

/**
 * Site Content Service
 * Manages editable site content stored in the `site_content` Supabase table.
 * 
 * Table schema:
 *   id         uuid primary key default uuid_generate_v4()
 *   page       text not null        -- e.g. 'home', 'about', 'contact', 'footer', 'header'
 *   section    text not null        -- e.g. 'how_it_works', 'testimonials', 'faq'
 *   content    jsonb not null       -- arbitrary JSON blob
 *   updated_at timestamptz default now()
 *   UNIQUE(page, section)
 * 
 * SQL to create:
 * CREATE TABLE IF NOT EXISTS site_content (
 *   id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   page text NOT NULL,
 *   section text NOT NULL,
 *   content jsonb NOT NULL DEFAULT '{}',
 *   updated_at timestamptz DEFAULT now(),
 *   UNIQUE(page, section)
 * );
 */

// ── Reads ──────────────────────────────────────────────

/** Get all content for a given page */
export const getPageContent = async (page) => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('page', page);

    if (error) throw error;

    const result = {};
    data?.forEach(item => {
      result[item.section] = item.content;
    });
    return result;
  } catch (error) {
    // Table may not exist yet — return empty gracefully
    console.warn('site_content fetch:', error.message);
    return {};
  }
};

/** Get content for a single section */
export const getSectionContent = async (page, section) => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('page', page)
      .eq('section', section)
      .maybeSingle();

    if (error) throw error;
    return data?.content || null;
  } catch (error) {
    console.warn('site_content section fetch:', error.message);
    return null;
  }
};

/** Get ALL site content (for admin page) */
export const getAllSiteContent = async () => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('page')
      .order('section');

    if (error) throw error;

    const result = {};
    data?.forEach(item => {
      if (!result[item.page]) result[item.page] = {};
      result[item.page][item.section] = item.content;
    });
    return result;
  } catch (error) {
    console.warn('site_content all fetch:', error.message);
    return {};
  }
};

// ── Writes ─────────────────────────────────────────────

/** Insert or update a section's content */
export const updateSectionContent = async (page, section, content) => {
  try {
    // Try upsert first
    const { data, error } = await supabase
      .from('site_content')
      .upsert(
        { page, section, content, updated_at: new Date().toISOString() },
        { onConflict: 'page,section' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('site_content update error:', error.message);
    throw error;
  }
};

/** Delete a section's content (reset to defaults) */
export const deleteSectionContent = async (page, section) => {
  try {
    const { error } = await supabase
      .from('site_content')
      .delete()
      .eq('page', page)
      .eq('section', section);

    if (error) throw error;
  } catch (error) {
    console.error('site_content delete error:', error.message);
    throw error;
  }
};

// ── Defaults ───────────────────────────────────────────

/** Default content for all site sections – used as fallback when DB is empty */
export const DEFAULT_CONTENT = {
  home: {
    how_it_works: {
      title: 'How It Works',
      subtitle: 'Simple and easy booking process',
      steps: [
        { title: 'Search', description: 'Enter your pickup location, destination, and preferred date.' },
        { title: 'Choose', description: 'Select from a wide range of vehicles and professional drivers.' },
        { title: 'Book', description: 'Complete your booking in 4 easy steps with instant confirmation.' },
        { title: 'Enjoy', description: 'Meet your driver and relax as you enjoy a safe ride.' },
      ],
    },
    our_story: {
      label: 'About Us',
      title: 'Our Story: Discover Georgia with Locals',
      paragraphs: [
        'Welcome to <strong>GeorgianTrip</strong>, where every journey is a story waiting to be told. Born from a passion for our homeland\'s breathtaking landscapes and rich traditions, we started as a small team of local enthusiasts dedicated to sharing the real Georgia with the world.',
        'We believe that travel isn\'t just about reaching a destination; it\'s about the warmth of the welcome, the stories shared on the road, and the hidden gems you find along the way.',
      ],
      features: [
        { title: 'Passionate Locals', description: 'Drivers who know every corner and legend.' },
        { title: 'Safe & Reliable', description: 'Verified vehicles and professional service.' },
      ],
      buttonText: 'Read More About Us',
      images: [
        'https://images.unsplash.com/photo-1682667027683-19908f23dd89',
        'https://images.unsplash.com/photo-1597566360895-5d93e580554e',
        'https://images.unsplash.com/photo-1492713239497-a6fa9352daff',
        'https://images.unsplash.com/photo-1672674779705-a58c96cdc8c5',
      ],
    },
    value_icons: {
      title: 'Why Choose GeorgianTrip?',
      subtitle: 'We provide the safest, most comfortable way to explore Georgia\'s beautiful landscapes.',
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'Can I request stops along the way?', answer: 'Yes! You can add as many stops as you like for sightseeing or lunch. There is no extra fee for waiting time, as the price is per vehicle for the day.' },
        { question: 'Is the price per person or per car?', answer: 'The price shown is for the entire vehicle, not per person. It includes fuel and driver services.' },
        { question: 'Do I need to pay in advance?', answer: 'No prepayment is required. You pay the driver directly in cash (GEL, USD, or EUR) after you reach your destination.' },
        { question: 'Are tips included?', answer: 'Tips are not included in the price but are appreciated if you are happy with the service. Standard tipping in Georgia is around 10%.' },
      ],
    },
    bottom_cta: {
      title: 'Ready to Explore Georgia?',
      subtitle: 'Book your private transfer today and discover the hidden gems of the Caucasus with our trusted local drivers.',
      buttonText: 'Plan Your Trip',
      contactButtonText: 'Contact Support',
      backgroundImage: 'https://images.unsplash.com/photo-1678984451800-4a21019d74f0',
    },
    testimonials: {
      title: 'What Travelers Say',
      rating: '4.9/5',
      reviewCount: '1,500+ reviews',
      reviews: [
        { name: 'Sarah Jenkins', location: 'United Kingdom', text: "The best way to travel in Georgia! Our driver Giorgi was amazing, he showed us hidden gems we wouldn't have found otherwise.", date: 'January 2026' },
        { name: 'Michael Weber', location: 'Germany', text: 'Much more comfortable than a bus and cheaper than a standard taxi. The car was clean and the driver drove very safely.', date: 'December 2025' },
        { name: 'Elena Sokolova', location: 'Israel', text: 'We booked 3 transfers during our week in Georgia. Every time the driver was on time and very polite. Highly recommended!', date: 'January 2026' },
      ],
    },
    driver_registration: {
      bannerTitle: 'Join Our Team of Professionals',
      heading: 'Become a Partner',
      description: 'Are you an experienced driver with a reliable vehicle? Join GeorgianTrip and turn your kilometers into income. We provide the passengers; you provide the excellent service.',
      benefits: [
        'Flexible working hours - be your own boss',
        'Competitive earnings and instant payouts',
        'Professional support 24/7',
        'Access to thousands of tourists',
        'Easy registration process',
      ],
      quote: '"Flexible schedule and great passengers. I recommend it to everyone."',
    },
  },
  about: {
    hero: {
      title: 'About GeorgianTrip',
      subtitle: 'We are more than just a transfer service. We are your local friends, dedicated to showing you the real beauty, culture, and warmth of Georgia.',
      ctaText: 'Discover Our Mission',
      backgroundImage: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
    },
    mission: {
      label: 'Our Mission',
      title: 'Preserving Culture, Creating Connections',
      paragraphs: [
        'Our mission is to connect travelers with the authentic spirit of Georgia through safe, comfortable, and personalized transportation and tour experiences.',
        'We aim to empower local drivers and communities while providing world-class service that turns every journey into an unforgettable adventure.',
      ],
      imageCaption: 'Sharing our heritage with the world.',
      imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
    },
    vision: {
      label: 'Our Vision',
      title: 'The Future of Georgian Travel',
      paragraphs: [
        'We envision a future where every traveler to Georgia experiences the country through the eyes of passionate locals.',
        'By leveraging technology and deep cultural knowledge, we are building the most trusted travel platform in the Caucasus region.',
      ],
      imageCaption: 'Building the future of travel.',
      imageUrl: 'https://images.unsplash.com/photo-1597566360895-5d93e580554e',
    },
    values: {
      label: 'Our DNA',
      title: 'Values That Guide Us',
      subtitle: 'At GeorgianTrip, these core principles shape everything we do.',
      items: [
        { title: 'Authenticity', description: 'We believe in genuine experiences that connect travelers with Georgian culture and traditions.', imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c' },
        { title: 'Trust & Safety', description: 'Every driver is verified, every vehicle is inspected, and every journey is tracked for your peace of mind.', imageUrl: 'https://images.unsplash.com/photo-1597566360895-5d93e580554e' },
        { title: 'Excellence', description: 'We strive for excellence in every detail, from vehicle comfort to guide knowledge.', imageUrl: 'https://images.unsplash.com/photo-1492713239497-a6fa9352daff' },
        { title: 'Sustainability', description: 'We care for Georgia\'s environment and culture, promoting responsible tourism.', imageUrl: 'https://images.unsplash.com/photo-1672674779705-a58c96cdc8c5' },
      ],
    },
    stats: {
      items: [
        { value: '2015', label: 'Founded', description: 'Years of excellence' },
        { value: '10k+', label: 'Happy Travelers', description: 'From all over the world' },
        { value: '50+', label: 'Unique Tours', description: 'Crafted to perfection' },
        { value: '#1', label: 'Travel Choice', description: 'Top rated service' },
      ],
    },
    gallery: {
      label: 'Our Gallery',
      title: 'Beauty of Georgia',
      subtitle: 'A glimpse into the diverse landscapes and breathtaking scenery you can discover with GeorgianTrip.',
      instagramUrl: 'https://www.instagram.com/georgiantrip_go/',
      images: [
        { url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c', alt: 'Tbilisi Old Town' },
        { url: 'https://images.unsplash.com/photo-1682667027683-19908f23dd89', alt: 'Kazbegi Mountains' },
        { url: 'https://images.unsplash.com/photo-1597566360895-5d93e580554e', alt: 'Georgian Wine Country' },
        { url: 'https://images.unsplash.com/photo-1492713239497-a6fa9352daff', alt: 'Old Tbilisi' },
        { url: 'https://images.unsplash.com/photo-1672674779705-a58c96cdc8c5', alt: 'Martvili Canyon' },
      ],
    },
    cta: {
      title: 'Ready to Explore Georgia?',
      subtitle: 'Start your adventure with us today. Explore breathtaking tours or book a private transfer with trusted local drivers.',
      button1Text: 'Explore Tours',
      button2Text: 'Contact Us',
      backgroundImage: 'https://images.unsplash.com/photo-1678984451800-4a21019d74f0',
    },
  },
  contact: {
    info: {
      phone: '+995 555 123 456',
      phoneNote: 'Available on WhatsApp & Telegram',
      email: 'info@georgiantrip.com',
      supportEmail: 'support@georgiantrip.com',
      address: '123 Rustaveli Avenue, Tbilisi 0108, Georgia',
      customerSupportHours: 'Customer Support: 24/7',
      officeHours: 'Office: Mon-Fri, 10:00 - 19:00',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.597362777326!2d44.79377401568057!3d41.69666797923714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40440cf6e37e179d%3A0x6001a0e1b071060!2sRustaveli%20Ave%2C%20Tbilisi!5e0!3m2!1sen!2sge!4v1689771234567!5m2!1sen!2sge',
    },
  },
  footer: {
    general: {
      brandDescription: 'The most reliable way to travel across Georgia. We connect travelers with verified local drivers for safe, comfortable, and affordable private transfers.',
      phone: '+995 32 2 000 000',
      phoneHours: 'Mon-Sun 9am-9pm',
      email: 'info@georgiantrip.com',
      emailNote: 'Online support 24/7',
      address: 'Rustaveli Ave 12, Tbilisi, Georgia',
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
    },
  },
  pages: {
    tours: {
      title: 'Tours',
      subtitle: 'Discover the beauty of Georgia with our curated selection of tours.',
    },
    transfers: {
      title: 'Transfer Routes',
      subtitle: 'Fixed price private transfers to all major destinations in Georgia. Book online, pay driver in cash.',
    },
  },
};
