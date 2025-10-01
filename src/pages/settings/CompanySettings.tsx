import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';

const companySchema = Yup.object({
  name: Yup.string().required('Company name is required'),
  code: Yup.string().required('Company code is required'),
  timezone: Yup.string().required('Timezone is required'),
  timeFormat: Yup.string().oneOf(['12', '24']).required(),
  dateFormat: Yup.string().required(),
});

export default function CompanySettings() {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const company = await apiClient.get('/company');
      setInitialData(company);
    } catch (error) {
      toast.error('Failed to fetch company settings');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await apiClient.put('/company', values);
      toast.success('Company settings updated successfully');
    } catch (error) {
      toast.error('Failed to update company settings');
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
        <h1 className="text-3xl font-bold text-foreground">Company Settings</h1>
        <p className="text-muted-foreground">Manage your company information and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>Basic company details and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialData}
            validationSchema={companySchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder="ACME Corporation"
                      className={errors.name && touched.name ? 'border-destructive' : ''}
                    />
                    {errors.name && touched.name && (
                      <p className="text-sm text-destructive">{String(errors.name)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Company Code *</Label>
                    <Field
                      as={Input}
                      id="code"
                      name="code"
                      placeholder="ACM123"
                      className={errors.code && touched.code ? 'border-destructive' : ''}
                    />
                    {errors.code && touched.code && (
                      <p className="text-sm text-destructive">{String(errors.code)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone *</Label>
                    <Select
                      value={values.timezone}
                      onValueChange={(value) => setFieldValue('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Karachi">Asia/Karachi (UTC+5)</SelectItem>
                        <SelectItem value="America/New_York">America/New York (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                        <SelectItem value="Australia/Sydney">Australia/Sydney (UTC+10)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format *</Label>
                    <Select
                      value={values.timeFormat}
                      onValueChange={(value) => setFieldValue('timeFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format *</Label>
                    <Select
                      value={values.dateFormat}
                      onValueChange={(value) => setFieldValue('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={values.language || 'en'}
                      onValueChange={(value) => setFieldValue('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
