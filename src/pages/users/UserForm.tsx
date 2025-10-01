import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';

const userSchema = Yup.object({
  firstName: Yup.string().required('First name is required').max(50),
  lastName: Yup.string().required('Last name is required').max(50),
  email: Yup.string().email('Invalid email').required('Email is required'),
  role: Yup.string().oneOf(['employee', 'manager', 'admin']).required(),
  kioskNumber: Yup.string().required('Kiosk number is required'),
  branch: Yup.string().required('Branch is required'),
  active: Yup.boolean(),
});

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const user = await apiClient.get(`/users/${id}`);
      setInitialData(user);
      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    } catch (error) {
      toast.error('Failed to fetch user');
      navigate('/users');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        setFieldValue('avatarUrl', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/users/${id}`, values);
        toast.success('User updated successfully');
      } else {
        await apiClient.post('/users', values);
        toast.success('User created successfully');
      }
      navigate('/users');
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} user`);
    } finally {
      setLoading(false);
    }
  };

  if (isEditMode && !initialData) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEditMode ? 'Edit User' : 'Add New User'}</h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Update user information' : 'Create a new employee account'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={
              initialData || {
                firstName: '',
                lastName: '',
                email: '',
                role: 'employee',
                kioskNumber: '',
                branch: '',
                active: true,
                avatarUrl: '',
              }
            }
            validationSchema={userSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setFieldValue)}
                      className="hidden"
                    />
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>Upload Photo</span>
                      </Button>
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Field
                      as={Input}
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      className={errors.firstName && touched.firstName ? 'border-destructive' : ''}
                    />
                    {errors.firstName && touched.firstName && (
                      <p className="text-sm text-destructive">{String(errors.firstName)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Field
                      as={Input}
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      className={errors.lastName && touched.lastName ? 'border-destructive' : ''}
                    />
                    {errors.lastName && touched.lastName && (
                      <p className="text-sm text-destructive">{String(errors.lastName)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      className={errors.email && touched.email ? 'border-destructive' : ''}
                    />
                    {errors.email && touched.email && (
                      <p className="text-sm text-destructive">{String(errors.email)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kioskNumber">Kiosk Number *</Label>
                    <Field
                      as={Input}
                      id="kioskNumber"
                      name="kioskNumber"
                      placeholder="K-1001"
                      className={errors.kioskNumber && touched.kioskNumber ? 'border-destructive' : ''}
                    />
                    {errors.kioskNumber && touched.kioskNumber && (
                      <p className="text-sm text-destructive">{String(errors.kioskNumber)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={values.role}
                      onValueChange={(value) => setFieldValue('role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch *</Label>
                    <Field
                      as={Input}
                      id="branch"
                      name="branch"
                      placeholder="Branch 1"
                      className={errors.branch && touched.branch ? 'border-destructive' : ''}
                    />
                    {errors.branch && touched.branch && (
                      <p className="text-sm text-destructive">{String(errors.branch)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Field type="checkbox" id="active" name="active" className="h-4 w-4" />
                  <Label htmlFor="active" className="cursor-pointer">
                    Active User
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                    Cancel
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
