import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { addCompany, setCurrentCompany } from '@/store/slices/companySlice';
import { loginSuccess } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';

const registerSchema = Yup.object({
  companyName: Yup.string().required('Company name is required').max(100),
  companyCode: Yup.string().required('Company code is required').max(20),
  industry: Yup.string().required('Industry is required'),
  country: Yup.string().required('Country is required'),
  employeesCountRange: Yup.string().required('Employee count is required'),
  adminFirstName: Yup.string().required('First name is required'),
  adminLastName: Yup.string().required('Last name is required'),
  adminEmail: Yup.string().email('Invalid email').required('Email is required'),
  adminPassword: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('adminPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function RegisterCompany() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Create new company
      const newCompany = {
        id: `comp_${Date.now()}`,
        name: values.companyName,
        code: values.companyCode,
        companyId: `CMP-${values.companyCode.toUpperCase()}`,
        industry: values.industry,
        country: values.country,
        employeesCountRange: values.employeesCountRange,
        primaryColor: '#0ea5e9',
        timeZone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24',
        lengthFormat: 'meters',
        plan: 'Basic',
        seats: 10,
        isActive: true,
        branches: [],
        createdAt: new Date().toISOString(),
      };

      dispatch(addCompany(newCompany));
      dispatch(setCurrentCompany(newCompany));

      // Create admin user and login
      const adminUser = {
        id: `user_${Date.now()}`,
        email: values.adminEmail,
        name: `${values.adminFirstName} ${values.adminLastName}`,
        role: 'company_admin' as const,
        companyId: newCompany.id,
      };

      const mockToken = 'mock_jwt_token_' + Date.now();

      dispatch(
        loginSuccess({
          user: adminUser,
          token: mockToken,
        })
      );

      toast.success('Company registered successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to register company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Register Your Company</CardTitle>
          <CardDescription>Create your attendance management workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              companyName: '',
              companyCode: '',
              industry: '',
              country: '',
              employeesCountRange: '',
              adminFirstName: '',
              adminLastName: '',
              adminEmail: '',
              adminPassword: '',
              confirmPassword: '',
            }}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">Company Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Field
                        as={Input}
                        id="companyName"
                        name="companyName"
                        placeholder="ACME Corporation"
                        className={errors.companyName && touched.companyName ? 'border-destructive' : ''}
                      />
                      {errors.companyName && touched.companyName && (
                        <p className="text-sm text-destructive">{String(errors.companyName)}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyCode">Company Code *</Label>
                      <Field
                        as={Input}
                        id="companyCode"
                        name="companyCode"
                        placeholder="ACME"
                        className={errors.companyCode && touched.companyCode ? 'border-destructive' : ''}
                      />
                      {errors.companyCode && touched.companyCode && (
                        <p className="text-sm text-destructive">{String(errors.companyCode)}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Select value={values.industry} onValueChange={(value) => setFieldValue('industry', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Field
                        as={Input}
                        id="country"
                        name="country"
                        placeholder="United States"
                        className={errors.country && touched.country ? 'border-destructive' : ''}
                      />
                      {errors.country && touched.country && (
                        <p className="text-sm text-destructive">{String(errors.country)}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="employeesCountRange">Number of Employees *</Label>
                      <Select value={values.employeesCountRange} onValueChange={(value) => setFieldValue('employeesCountRange', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="201-500">201-500</SelectItem>
                          <SelectItem value="500+">500+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Admin Account */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">Admin Account</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminFirstName">First Name *</Label>
                      <Field
                        as={Input}
                        id="adminFirstName"
                        name="adminFirstName"
                        placeholder="John"
                        className={errors.adminFirstName && touched.adminFirstName ? 'border-destructive' : ''}
                      />
                      {errors.adminFirstName && touched.adminFirstName && (
                        <p className="text-sm text-destructive">{String(errors.adminFirstName)}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminLastName">Last Name *</Label>
                      <Field
                        as={Input}
                        id="adminLastName"
                        name="adminLastName"
                        placeholder="Doe"
                        className={errors.adminLastName && touched.adminLastName ? 'border-destructive' : ''}
                      />
                      {errors.adminLastName && touched.adminLastName && (
                        <p className="text-sm text-destructive">{String(errors.adminLastName)}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adminEmail">Email *</Label>
                      <Field
                        as={Input}
                        id="adminEmail"
                        name="adminEmail"
                        type="email"
                        placeholder="admin@acme.com"
                        className={errors.adminEmail && touched.adminEmail ? 'border-destructive' : ''}
                      />
                      {errors.adminEmail && touched.adminEmail && (
                        <p className="text-sm text-destructive">{String(errors.adminEmail)}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Password *</Label>
                      <Field
                        as={Input}
                        id="adminPassword"
                        name="adminPassword"
                        type="password"
                        placeholder="••••••••"
                        className={errors.adminPassword && touched.adminPassword ? 'border-destructive' : ''}
                      />
                      {errors.adminPassword && touched.adminPassword && (
                        <p className="text-sm text-destructive">{String(errors.adminPassword)}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Field
                        as={Input}
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className={errors.confirmPassword && touched.confirmPassword ? 'border-destructive' : ''}
                      />
                      {errors.confirmPassword && touched.confirmPassword && (
                        <p className="text-sm text-destructive">{String(errors.confirmPassword)}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Registering...' : 'Register Company'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/auth/login')}
                    className="w-full"
                  >
                    Already have an account? Login
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
