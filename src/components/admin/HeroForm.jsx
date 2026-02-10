import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2, FileImage as ImageIcon, Save, Trash2 } from 'lucide-react';
import PhotoUpload from '@/components/driver/PhotoUpload';

// Now fully controlled component
const HeroForm = ({ settings, onSave, loading, externalOnChange }) => {
  // Local state initialized from props, but we prioritize props if we want controlled behavior
  // Actually, if it's controlled, we rely on props.
  // But to support both modes (stand-alone vs controlled), we can check.
  
  // Since we want real-time preview in AdminHeroPage, we MUST use controlled mode where parent holds state.
  // So 'settings' prop IS the current state.
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (externalOnChange) {
        externalOnChange({ [name]: value });
    }
  };

  const handleImageUpload = (url) => {
    if (externalOnChange) {
        externalOnChange({ image_url: url });
    }
  };
  
  const handleClearImage = () => {
    if (externalOnChange) {
        externalOnChange({ image_url: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(); // Parent handles saving the current state it holds
  };

  if (!settings) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 bg-white shadow-sm border-gray-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-gray-500" />
          Background Image
        </h3>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
             <PhotoUpload 
                bucketName="car-photos" 
                pathPrefix="hero"
                onUploadComplete={handleImageUpload}
                className="h-48"
             />
          </div>
          <div className="flex-1 space-y-4">
             <div>
                <Label>Image URL (Manual)</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input 
                    name="image_url" 
                    value={settings.image_url || ''} 
                    onChange={handleChange} 
                    placeholder="https://..." 
                  />
                  {settings.image_url && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon"
                      onClick={handleClearImage}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
             </div>
             <p className="text-xs text-gray-500">
               Recommended size: 1920x1080px (16:9 aspect ratio). 
               Use high-quality compressed images (JPG, WEBP) under 2MB for best performance.
             </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white shadow-sm border-gray-200">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-bold">Content Management</h3>
        </div>

        <Tabs defaultValue="en" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
            <TabsTrigger value="ka">🇬🇪 Georgian</TabsTrigger>
            <TabsTrigger value="ru">🇷🇺 Russian</TabsTrigger>
          </TabsList>
          
          {['en', 'ka', 'ru'].map((lang) => (
            <TabsContent key={lang} value={lang} className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <Label className="mb-1.5 block">Hero Title ({lang.toUpperCase()})</Label>
                  <span className="text-xs text-gray-400">{(settings[`title_${lang}`] || '').length}/100</span>
                </div>
                <Input 
                  name={`title_${lang}`} 
                  value={settings[`title_${lang}`] || ''} 
                  onChange={handleChange} 
                  maxLength={100}
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between">
                  <Label className="mb-1.5 block">Hero Subtitle ({lang.toUpperCase()})</Label>
                  <span className="text-xs text-gray-400">{(settings[`subtitle_${lang}`] || '').length}/200</span>
                </div>
                <Textarea 
                  name={`subtitle_${lang}`} 
                  value={settings[`subtitle_${lang}`] || ''} 
                  onChange={handleChange} 
                  maxLength={200}
                  required
                  rows={3}
                />
              </div>

              <div>
                <Label className="mb-1.5 block">Search Button Text ({lang.toUpperCase()})</Label>
                <Input 
                  name={`button_text_${lang}`} 
                  value={settings[`button_text_${lang}`] || ''} 
                  onChange={handleChange} 
                  maxLength={50}
                  required
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      <div className="sticky bottom-4 z-20 flex justify-end bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-lg">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Changes</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default HeroForm;