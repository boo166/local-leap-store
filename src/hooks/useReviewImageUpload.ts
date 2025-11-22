import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReviewImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImages = async (files: File[], userId: string) => {
    if (files.length === 0) return [];
    if (files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload up to 5 images per review",
        variant: "destructive",
      });
      return [];
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 5MB limit`,
            variant: "destructive",
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('review-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        toast({
          title: "Images uploaded",
          description: `${uploadedUrls.length} image(s) uploaded successfully`,
        });
      }

      return uploadedUrls;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setUploading(false);
    }
  };

  return { uploadImages, uploading };
};
