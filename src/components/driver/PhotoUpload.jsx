import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Upload, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const PhotoUpload = ({ 
  bucketName, 
  pathPrefix, 
  onUploadComplete, 
  maxSizeMB = 5,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  multiple = false,
  compact = false
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];
    const errors = [];

    for (const file of files) {
        // Validation
        if (file.size > maxSizeMB * 1024 * 1024) {
            errors.push(`${file.name} is too large (max ${maxSizeMB}MB)`);
            continue;
        }
        if (!acceptedFileTypes.includes(file.type)) {
            errors.push(`${file.name} has unsupported format`);
            continue;
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${pathPrefix}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            uploadedUrls.push(publicUrl);

        } catch (error) {
            console.error('Upload failed:', error);
            errors.push(`Failed to upload ${file.name}`);
        }
    }

    setUploading(false);
    
    if (errors.length > 0) {
        toast({ 
            variant: 'destructive', 
            title: 'Upload Issues', 
            description: errors.join('. ') 
        });
    }

    if (uploadedUrls.length > 0) {
        onUploadComplete(multiple ? uploadedUrls : uploadedUrls[0]);
        toast({ title: 'Success', description: `${uploadedUrls.length} photo(s) uploaded` });
    }
    
    // Reset input
    event.target.value = '';
  };

  return (
    <div className={cn("relative", className)}>
        <input 
            type="file" 
            accept={acceptedFileTypes.join(',')} 
            onChange={handleFileChange} 
            className="hidden" 
            id={`upload-${pathPrefix}`}
            multiple={multiple}
            disabled={uploading}
        />
        <label 
            htmlFor={`upload-${pathPrefix}`}
            className={cn(
                "flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors",
                compact ? "w-24 h-24" : "w-full h-32",
                uploading && "opacity-50 cursor-not-allowed"
            )}
        >
            {uploading ? (
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            ) : (
                <>
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                        <Upload className={cn("text-gray-400 mb-2", compact ? "w-6 h-6" : "w-8 h-8")} />
                        {!compact && (
                            <>
                                <p className="text-sm text-gray-500 font-semibold">{multiple ? 'Add Photos' : 'Upload Photo'}</p>
                                <p className="text-xs text-gray-400">JPG, PNG (Max {maxSizeMB}MB)</p>
                            </>
                        )}
                        {compact && <span className="text-xs text-gray-500">Add</span>}
                    </div>
                </>
            )}
        </label>
    </div>
  );
};

export default PhotoUpload;