import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getAllSiteContent, updateSectionContent, DEFAULT_CONTENT } from '@/lib/siteContentService';
import {
  Loader2, Save, RotateCcw, ChevronDown, ChevronRight,
  Home, Info, Phone, FileText, Globe, ExternalLink, Plus, Trash2, GripVertical
} from 'lucide-react';

// ─── Collapsible Section Card ──────────────────────────────
const SectionCard = ({ title, description, pageLink, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-bold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {pageLink && (
            <a
              href={pageLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full font-medium"
            >
              <ExternalLink className="w-3 h-3" /> View
            </a>
          )}
          {open ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">{children}</div>}
    </div>
  );
};

// ─── Repeater Field ────────────────────────────────────────
const RepeaterField = ({ label, items = [], fields, onChange }) => {
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addItem = () => {
    const emptyItem = {};
    fields.forEach(f => { emptyItem[f.key] = ''; });
    onChange([...items, emptyItem]);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-gray-700">{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="text-xs">
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
          <GripVertical className="w-4 h-4 text-gray-300 mt-2.5 shrink-0" />
          <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: fields.length > 1 ? `repeat(${Math.min(fields.length, 3)}, 1fr)` : '1fr' }}>
            {fields.map(f => (
              <div key={f.key}>
                <span className="text-[10px] uppercase text-gray-400 font-bold">{f.label}</span>
                {f.type === 'textarea' ? (
                  <Textarea
                    value={item[f.key] || ''}
                    onChange={e => handleItemChange(i, f.key, e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                ) : (
                  <Input
                    value={item[f.key] || ''}
                    onChange={e => handleItemChange(i, f.key, e.target.value)}
                    className="text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0 mt-1">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-gray-400 italic">No items yet. Click "Add" to create one.</p>}
    </div>
  );
};

// ─── Simple Array (strings) Repeater ───────────────────────
const StringListField = ({ label, items = [], onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-gray-700">{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ''])} className="text-xs">
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item || ''}
            onChange={e => {
              const updated = [...items];
              updated[i] = e.target.value;
              onChange(updated);
            }}
            className="text-sm"
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════

const SiteContentPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [content, setContent] = useState(JSON.parse(JSON.stringify(DEFAULT_CONTENT)));
  const [dbInitialized, setDbInitialized] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllSiteContent();
      // Merge DB data over defaults
      const merged = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
      Object.keys(data).forEach(page => {
        if (!merged[page]) merged[page] = {};
        Object.keys(data[page]).forEach(section => {
          merged[page][section] = { ...(merged[page][section] || {}), ...data[page][section] };
        });
      });
      setContent(merged);
      setDbInitialized(true);
    } catch (err) {
      console.warn('Could not load site_content:', err);
      setDbInitialized(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveSection = async (page, section) => {
    const key = `${page}.${section}`;
    setSaving(p => ({ ...p, [key]: true }));
    try {
      await updateSectionContent(page, section, content[page][section]);
      toast({ title: 'Saved!', description: `${section} content updated successfully.`, className: 'bg-green-50 border-green-200' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to save. Make sure the site_content table exists.' });
    } finally {
      setSaving(p => ({ ...p, [key]: false }));
    }
  };

  const updateField = (page, section, field, value) => {
    setContent(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [section]: {
          ...prev[page]?.[section],
          [field]: value
        }
      }
    }));
  };

  const SectionSaveButton = ({ page, section }) => {
    const key = `${page}.${section}`;
    return (
      <Button onClick={() => saveSection(page, section)} disabled={saving[key]} className="bg-green-600 hover:bg-green-700">
        {saving[key] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Save {section.replace(/_/g, ' ')}
      </Button>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Site Content Management</h1>
          <p className="text-gray-500 mt-1">Edit all website text, images, and links from one place.</p>
        </div>
        <Button variant="outline" onClick={fetchAll}>
          <RotateCcw className="w-4 h-4 mr-2" /> Reload All
        </Button>
      </div>

      {!dbInitialized && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
          <p className="font-bold mb-2">Database table not found</p>
          <p>Create the <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">site_content</code> table in Supabase:</p>
          <pre className="mt-2 bg-amber-100 p-3 rounded-lg text-xs overflow-x-auto">
{`CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page text NOT NULL,
  section text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, section)
);`}
          </pre>
        </div>
      )}

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl h-auto flex-wrap">
          <TabsTrigger value="home" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"><Home className="w-4 h-4" /> Home Page</TabsTrigger>
          <TabsTrigger value="about" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"><Info className="w-4 h-4" /> About Page</TabsTrigger>
          <TabsTrigger value="contact" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"><Phone className="w-4 h-4" /> Contact & Footer</TabsTrigger>
          <TabsTrigger value="pages" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"><FileText className="w-4 h-4" /> Pages</TabsTrigger>
        </TabsList>

        {/* ══════════════════════════ HOME TAB ══════════════════════════ */}
        <TabsContent value="home" className="mt-6 space-y-4">

          {/* How It Works */}
          <SectionCard title="How It Works Section" pageLink="/#how-it-works" description="4-step process shown on the homepage">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={content.home.how_it_works?.title || ''} onChange={e => updateField('home', 'how_it_works', 'title', e.target.value)} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={content.home.how_it_works?.subtitle || ''} onChange={e => updateField('home', 'how_it_works', 'subtitle', e.target.value)} />
              </div>
            </div>
            <RepeaterField
              label="Steps"
              items={content.home.how_it_works?.steps || []}
              fields={[
                { key: 'title', label: 'Title' },
                { key: 'description', label: 'Description', type: 'textarea' },
              ]}
              onChange={v => updateField('home', 'how_it_works', 'steps', v)}
            />
            <SectionSaveButton page="home" section="how_it_works" />
          </SectionCard>

          {/* Our Story */}
          <SectionCard title="Our Story Section" pageLink="/" description="About us preview on homepage">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Label</Label>
                <Input value={content.home.our_story?.label || ''} onChange={e => updateField('home', 'our_story', 'label', e.target.value)} />
              </div>
              <div>
                <Label>Button Text</Label>
                <Input value={content.home.our_story?.buttonText || ''} onChange={e => updateField('home', 'our_story', 'buttonText', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Title (supports HTML)</Label>
              <Input value={content.home.our_story?.title || ''} onChange={e => updateField('home', 'our_story', 'title', e.target.value)} />
            </div>
            <StringListField
              label="Paragraphs (supports HTML)"
              items={content.home.our_story?.paragraphs || []}
              onChange={v => updateField('home', 'our_story', 'paragraphs', v)}
            />
            <RepeaterField
              label="Features"
              items={content.home.our_story?.features || []}
              fields={[
                { key: 'title', label: 'Title' },
                { key: 'description', label: 'Description' },
              ]}
              onChange={v => updateField('home', 'our_story', 'features', v)}
            />
            <StringListField
              label="Image URLs"
              items={content.home.our_story?.images || []}
              onChange={v => updateField('home', 'our_story', 'images', v)}
            />
            <SectionSaveButton page="home" section="our_story" />
          </SectionCard>

          {/* Value Icons */}
          <SectionCard title="Why Choose Us (Value Icons)" pageLink="/" description="Value propositions grid">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={content.home.value_icons?.title || ''} onChange={e => updateField('home', 'value_icons', 'title', e.target.value)} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={content.home.value_icons?.subtitle || ''} onChange={e => updateField('home', 'value_icons', 'subtitle', e.target.value)} />
              </div>
            </div>
            <SectionSaveButton page="home" section="value_icons" />
          </SectionCard>

          {/* FAQ */}
          <SectionCard title="FAQ Section" pageLink="/" description="Frequently asked questions accordion">
            <div>
              <Label>Section Title</Label>
              <Input value={content.home.faq?.title || ''} onChange={e => updateField('home', 'faq', 'title', e.target.value)} />
            </div>
            <RepeaterField
              label="FAQ Items"
              items={content.home.faq?.items || []}
              fields={[
                { key: 'question', label: 'Question' },
                { key: 'answer', label: 'Answer', type: 'textarea' },
              ]}
              onChange={v => updateField('home', 'faq', 'items', v)}
            />
            <SectionSaveButton page="home" section="faq" />
          </SectionCard>

          {/* Testimonials */}
          <SectionCard title="Testimonials Section" pageLink="/" description="Customer reviews and ratings">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={content.home.testimonials?.title || ''} onChange={e => updateField('home', 'testimonials', 'title', e.target.value)} />
              </div>
              <div>
                <Label>Rating</Label>
                <Input value={content.home.testimonials?.rating || ''} onChange={e => updateField('home', 'testimonials', 'rating', e.target.value)} />
              </div>
              <div>
                <Label>Review Count</Label>
                <Input value={content.home.testimonials?.reviewCount || ''} onChange={e => updateField('home', 'testimonials', 'reviewCount', e.target.value)} />
              </div>
            </div>
            <RepeaterField
              label="Reviews"
              items={content.home.testimonials?.reviews || []}
              fields={[
                { key: 'name', label: 'Name' },
                { key: 'location', label: 'Country' },
                { key: 'text', label: 'Review', type: 'textarea' },
                { key: 'date', label: 'Date' },
              ]}
              onChange={v => updateField('home', 'testimonials', 'reviews', v)}
            />
            <SectionSaveButton page="home" section="testimonials" />
          </SectionCard>

          {/* Bottom CTA */}
          <SectionCard title="Bottom CTA Section" pageLink="/" description="Call-to-action banner at bottom of homepage">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={content.home.bottom_cta?.title || ''} onChange={e => updateField('home', 'bottom_cta', 'title', e.target.value)} />
              </div>
              <div>
                <Label>Background Image URL</Label>
                <Input value={content.home.bottom_cta?.backgroundImage || ''} onChange={e => updateField('home', 'bottom_cta', 'backgroundImage', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea value={content.home.bottom_cta?.subtitle || ''} onChange={e => updateField('home', 'bottom_cta', 'subtitle', e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Button Text</Label>
                <Input value={content.home.bottom_cta?.buttonText || ''} onChange={e => updateField('home', 'bottom_cta', 'buttonText', e.target.value)} />
              </div>
              <div>
                <Label>Contact Button Text</Label>
                <Input value={content.home.bottom_cta?.contactButtonText || ''} onChange={e => updateField('home', 'bottom_cta', 'contactButtonText', e.target.value)} />
              </div>
            </div>
            <SectionSaveButton page="home" section="bottom_cta" />
          </SectionCard>

          {/* Driver Registration */}
          <SectionCard title="Driver Registration Section" pageLink="/" description="Driver recruitment banner and form intro text">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Banner Title</Label>
                <Input value={content.home.driver_registration?.bannerTitle || ''} onChange={e => updateField('home', 'driver_registration', 'bannerTitle', e.target.value)} />
              </div>
              <div>
                <Label>Heading</Label>
                <Input value={content.home.driver_registration?.heading || ''} onChange={e => updateField('home', 'driver_registration', 'heading', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={content.home.driver_registration?.description || ''} onChange={e => updateField('home', 'driver_registration', 'description', e.target.value)} rows={3} />
            </div>
            <StringListField
              label="Benefits List"
              items={content.home.driver_registration?.benefits || []}
              onChange={v => updateField('home', 'driver_registration', 'benefits', v)}
            />
            <div>
              <Label>Quote</Label>
              <Input value={content.home.driver_registration?.quote || ''} onChange={e => updateField('home', 'driver_registration', 'quote', e.target.value)} />
            </div>
            <SectionSaveButton page="home" section="driver_registration" />
          </SectionCard>
        </TabsContent>

        {/* ══════════════════════════ ABOUT TAB ════════════════════════ */}
        <TabsContent value="about" className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm flex items-center gap-3">
            <Info className="w-5 h-5 shrink-0" />
            <span>Hero section and Team members are managed from the dedicated <a href="/paneli/hero" className="underline font-bold">Hero Editor</a> and <a href="/paneli/about" className="underline font-bold">About Page</a> editors.</span>
          </div>

          {/* Mission */}
          <SectionCard title="Mission Section" pageLink="/about" description="Our mission statement">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Label</Label>
                <Input value={content.about.mission?.label || ''} onChange={e => updateField('about', 'mission', 'label', e.target.value)} />
              </div>
              <div>
                <Label>Image Caption</Label>
                <Input value={content.about.mission?.imageCaption || ''} onChange={e => updateField('about', 'mission', 'imageCaption', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={content.about.mission?.title || ''} onChange={e => updateField('about', 'mission', 'title', e.target.value)} />
            </div>
            <StringListField
              label="Paragraphs"
              items={content.about.mission?.paragraphs || []}
              onChange={v => updateField('about', 'mission', 'paragraphs', v)}
            />
            <div>
              <Label>Image URL</Label>
              <Input value={content.about.mission?.imageUrl || ''} onChange={e => updateField('about', 'mission', 'imageUrl', e.target.value)} />
            </div>
            <SectionSaveButton page="about" section="mission" />
          </SectionCard>

          {/* Vision */}
          <SectionCard title="Vision Section" pageLink="/about" description="Our vision statement">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Label</Label>
                <Input value={content.about.vision?.label || ''} onChange={e => updateField('about', 'vision', 'label', e.target.value)} />
              </div>
              <div>
                <Label>Image Caption</Label>
                <Input value={content.about.vision?.imageCaption || ''} onChange={e => updateField('about', 'vision', 'imageCaption', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={content.about.vision?.title || ''} onChange={e => updateField('about', 'vision', 'title', e.target.value)} />
            </div>
            <StringListField
              label="Paragraphs"
              items={content.about.vision?.paragraphs || []}
              onChange={v => updateField('about', 'vision', 'paragraphs', v)}
            />
            <div>
              <Label>Image URL</Label>
              <Input value={content.about.vision?.imageUrl || ''} onChange={e => updateField('about', 'vision', 'imageUrl', e.target.value)} />
            </div>
            <SectionSaveButton page="about" section="vision" />
          </SectionCard>

          {/* Values */}
          <SectionCard title="Values Section" pageLink="/about" description="Core values cards">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Label</Label>
                <Input value={content.about.values?.label || ''} onChange={e => updateField('about', 'values', 'label', e.target.value)} />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={content.about.values?.title || ''} onChange={e => updateField('about', 'values', 'title', e.target.value)} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={content.about.values?.subtitle || ''} onChange={e => updateField('about', 'values', 'subtitle', e.target.value)} />
              </div>
            </div>
            <RepeaterField
              label="Value Items"
              items={content.about.values?.items || []}
              fields={[
                { key: 'title', label: 'Title' },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'imageUrl', label: 'Image URL' },
              ]}
              onChange={v => updateField('about', 'values', 'items', v)}
            />
            <SectionSaveButton page="about" section="values" />
          </SectionCard>

          {/* Stats */}
          <SectionCard title="Stats Section" pageLink="/about" description="Number counters (Founded, Travelers, etc.)">
            <RepeaterField
              label="Stats Items"
              items={content.about.stats?.items || []}
              fields={[
                { key: 'value', label: 'Value' },
                { key: 'label', label: 'Label' },
                { key: 'description', label: 'Description' },
              ]}
              onChange={v => updateField('about', 'stats', 'items', v)}
            />
            <SectionSaveButton page="about" section="stats" />
          </SectionCard>

          {/* Gallery */}
          <SectionCard title="Gallery Section" pageLink="/about" description="Photo gallery with Instagram link">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Label</Label>
                <Input value={content.about.gallery?.label || ''} onChange={e => updateField('about', 'gallery', 'label', e.target.value)} />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={content.about.gallery?.title || ''} onChange={e => updateField('about', 'gallery', 'title', e.target.value)} />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input value={content.about.gallery?.instagramUrl || ''} onChange={e => updateField('about', 'gallery', 'instagramUrl', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea value={content.about.gallery?.subtitle || ''} onChange={e => updateField('about', 'gallery', 'subtitle', e.target.value)} rows={2} />
            </div>
            <RepeaterField
              label="Gallery Images"
              items={content.about.gallery?.images || []}
              fields={[
                { key: 'url', label: 'Image URL' },
                { key: 'alt', label: 'Alt Text' },
              ]}
              onChange={v => updateField('about', 'gallery', 'images', v)}
            />
            <SectionSaveButton page="about" section="gallery" />
          </SectionCard>

          {/* CTA */}
          <SectionCard title="CTA Section" pageLink="/about" description="Call-to-action at bottom of About page">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={content.about.cta?.title || ''} onChange={e => updateField('about', 'cta', 'title', e.target.value)} />
              </div>
              <div>
                <Label>Background Image URL</Label>
                <Input value={content.about.cta?.backgroundImage || ''} onChange={e => updateField('about', 'cta', 'backgroundImage', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea value={content.about.cta?.subtitle || ''} onChange={e => updateField('about', 'cta', 'subtitle', e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Button 1 Text</Label>
                <Input value={content.about.cta?.button1Text || ''} onChange={e => updateField('about', 'cta', 'button1Text', e.target.value)} />
              </div>
              <div>
                <Label>Button 2 Text</Label>
                <Input value={content.about.cta?.button2Text || ''} onChange={e => updateField('about', 'cta', 'button2Text', e.target.value)} />
              </div>
            </div>
            <SectionSaveButton page="about" section="cta" />
          </SectionCard>
        </TabsContent>

        {/* ══════════════════════ CONTACT & FOOTER TAB ═════════════════ */}
        <TabsContent value="contact" className="mt-6 space-y-4">

          {/* Contact Info */}
          <SectionCard title="Contact Information" pageLink="/contact" description="Phone, email, address shown on contact page" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone Number</Label>
                <Input value={content.contact.info?.phone || ''} onChange={e => updateField('contact', 'info', 'phone', e.target.value)} />
              </div>
              <div>
                <Label>Phone Note</Label>
                <Input value={content.contact.info?.phoneNote || ''} onChange={e => updateField('contact', 'info', 'phoneNote', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Email</Label>
                <Input value={content.contact.info?.email || ''} onChange={e => updateField('contact', 'info', 'email', e.target.value)} />
              </div>
              <div>
                <Label>Support Email</Label>
                <Input value={content.contact.info?.supportEmail || ''} onChange={e => updateField('contact', 'info', 'supportEmail', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={content.contact.info?.address || ''} onChange={e => updateField('contact', 'info', 'address', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Support Hours</Label>
                <Input value={content.contact.info?.customerSupportHours || ''} onChange={e => updateField('contact', 'info', 'customerSupportHours', e.target.value)} />
              </div>
              <div>
                <Label>Office Hours</Label>
                <Input value={content.contact.info?.officeHours || ''} onChange={e => updateField('contact', 'info', 'officeHours', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Google Maps Embed URL</Label>
              <Input value={content.contact.info?.mapEmbedUrl || ''} onChange={e => updateField('contact', 'info', 'mapEmbedUrl', e.target.value)} className="text-xs" />
            </div>
            <SectionSaveButton page="contact" section="info" />
          </SectionCard>

          {/* Footer */}
          <SectionCard title="Footer Content" description="Footer text, contact info, and social media links">
            <div>
              <Label>Brand Description</Label>
              <Textarea value={content.footer.general?.brandDescription || ''} onChange={e => updateField('footer', 'general', 'brandDescription', e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={content.footer.general?.phone || ''} onChange={e => updateField('footer', 'general', 'phone', e.target.value)} />
              </div>
              <div>
                <Label>Phone Hours</Label>
                <Input value={content.footer.general?.phoneHours || ''} onChange={e => updateField('footer', 'general', 'phoneHours', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input value={content.footer.general?.email || ''} onChange={e => updateField('footer', 'general', 'email', e.target.value)} />
              </div>
              <div>
                <Label>Email Note</Label>
                <Input value={content.footer.general?.emailNote || ''} onChange={e => updateField('footer', 'general', 'emailNote', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={content.footer.general?.address || ''} onChange={e => updateField('footer', 'general', 'address', e.target.value)} />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-2">Social Media Links</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Facebook URL</Label>
                <Input value={content.footer.general?.facebookUrl || ''} onChange={e => updateField('footer', 'general', 'facebookUrl', e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input value={content.footer.general?.instagramUrl || ''} onChange={e => updateField('footer', 'general', 'instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <Label>Twitter/X URL</Label>
                <Input value={content.footer.general?.twitterUrl || ''} onChange={e => updateField('footer', 'general', 'twitterUrl', e.target.value)} placeholder="https://x.com/..." />
              </div>
            </div>
            <SectionSaveButton page="footer" section="general" />
          </SectionCard>
        </TabsContent>

        {/* ═══════════════════════ PAGES TAB ═══════════════════════════ */}
        <TabsContent value="pages" className="mt-6 space-y-4">

          <SectionCard title="Tours Page" pageLink="/tours" description="Tours listing page header" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Page Title</Label>
                <Input value={content.pages.tours?.title || ''} onChange={e => updateField('pages', 'tours', 'title', e.target.value)} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={content.pages.tours?.subtitle || ''} onChange={e => updateField('pages', 'tours', 'subtitle', e.target.value)} />
              </div>
            </div>
            <SectionSaveButton page="pages" section="tours" />
          </SectionCard>

          <SectionCard title="Transfers Page" pageLink="/transfers" description="Transfer routes page header">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Page Title</Label>
                <Input value={content.pages.transfers?.title || ''} onChange={e => updateField('pages', 'transfers', 'title', e.target.value)} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Textarea value={content.pages.transfers?.subtitle || ''} onChange={e => updateField('pages', 'transfers', 'subtitle', e.target.value)} rows={2} />
              </div>
            </div>
            <SectionSaveButton page="pages" section="transfers" />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteContentPage;
