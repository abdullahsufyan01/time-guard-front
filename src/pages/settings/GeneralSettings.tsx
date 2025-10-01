import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Settings2, Upload } from 'lucide-react';

export default function GeneralSettings() {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settings = await apiClient.get('/company');
      setInitialData(settings);
      if (settings.logoUrl) {
        setLogoPreview(settings.logoUrl);
      }
    } catch (error) {
      toast.error('Failed to fetch settings');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setFieldValue('logoUrl', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await apiClient.put('/company', values);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">General Settings</h1>
        <p className="text-muted-foreground">Customize your app appearance and branding</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Appearance & Branding
          </CardTitle>
          <CardDescription>Logo, colors, and visual preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              logoUrl: initialData.logoUrl || '',
              primaryColor: initialData.primaryColor || '#0ea5a4',
            }}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ setFieldValue, values }) => (
              <Form className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-2" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, setFieldValue)}
                        className="hidden"
                      />
                      <Label htmlFor="logo" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>Upload Logo</span>
                        </Button>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-2">
                        PNG, JPG up to 2MB. Recommended: 200x200px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Color */}
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Brand Color</Label>
                  <div className="flex gap-4 items-center">
                    <Field
                      as={Input}
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      className="w-24 h-12"
                    />
                    <Field
                      as={Input}
                      name="primaryColor"
                      placeholder="#0ea5a4"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This color will be used for buttons, links, and accents throughout the app
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
