import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, RotateCcw } from 'lucide-react';

interface StoreThemeCustomizerProps {
  storeId: string;
  currentTheme?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  onThemeUpdate?: () => void;
}

const defaultTheme = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#f59e0b',
  background: '#ffffff',
  text: '#1e293b',
};

const StoreThemeCustomizer: React.FC<StoreThemeCustomizerProps> = ({
  storeId,
  currentTheme = defaultTheme,
  onThemeUpdate,
}) => {
  const { toast } = useToast();
  const [theme, setTheme] = useState(currentTheme);
  const [isSaving, setIsSaving] = useState(false);

  const handleColorChange = (key: keyof typeof theme, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({ theme_colors: theme })
        .eq('id', storeId);

      if (error) throw error;

      toast({
        title: 'Theme updated',
        description: 'Your store theme has been successfully updated.',
      });

      if (onThemeUpdate) {
        onThemeUpdate();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update theme.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    toast({
      title: 'Theme reset',
      description: 'Theme colors have been reset to defaults.',
    });
  };

  const colorOptions = [
    { key: 'primary' as const, label: 'Primary Color', description: 'Main brand color for buttons and accents' },
    { key: 'secondary' as const, label: 'Secondary Color', description: 'Supporting color for UI elements' },
    { key: 'accent' as const, label: 'Accent Color', description: 'Highlight color for special elements' },
    { key: 'background' as const, label: 'Background Color', description: 'Main background color' },
    { key: 'text' as const, label: 'Text Color', description: 'Primary text color' },
  ];

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Store Theme</CardTitle>
              <CardDescription>Customize your store's color scheme</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colorOptions.map(({ key, label, description }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id={key}
                    type="color"
                    value={theme[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="h-10 cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  value={theme[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#000000"
                />
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Theme Preview</Label>
          <div
            className="p-6 rounded-lg border-2"
            style={{
              backgroundColor: theme.background,
              borderColor: theme.secondary,
              color: theme.text,
            }}
          >
            <h3 className="text-lg font-bold mb-4">Store Preview</h3>
            <div className="space-y-3">
              <div
                className="p-3 rounded-lg font-medium"
                style={{ backgroundColor: theme.primary, color: '#ffffff' }}
              >
                Primary Button
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: theme.secondary, color: '#ffffff' }}
              >
                Secondary Element
              </div>
              <div
                className="p-3 rounded-lg font-medium"
                style={{ backgroundColor: theme.accent, color: '#ffffff' }}
              >
                Accent Feature
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? 'Saving...' : 'Save Theme'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StoreThemeCustomizer;
