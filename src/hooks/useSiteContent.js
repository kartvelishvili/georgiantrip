import { useState, useEffect } from 'react';
import { getSectionContent } from '@/lib/siteContentService';

/**
 * Hook to load site content for a page section with fallback defaults.
 * 
 * Usage:
 *   const { content, loading } = useSiteContent('home', 'faq', DEFAULT_FAQ);
 *   // content.title, content.items, etc.
 */
export const useSiteContent = (page, section, defaults = {}) => {
  const [content, setContent] = useState(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getSectionContent(page, section)
      .then(data => {
        if (mounted && data && typeof data === 'object') {
          // Deep merge: defaults provide structure, DB overrides values
          setContent(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        // Graceful — keep defaults
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [page, section]);

  return { content, loading };
};

export default useSiteContent;
