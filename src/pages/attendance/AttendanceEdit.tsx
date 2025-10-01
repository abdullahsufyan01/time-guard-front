import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { calculateDuration } from '@/lib/dateUtils';

const attendanceSchema = Yup.object({
  clockIn: Yup.string().required('Clock in time is required'),
  clockOut: Yup.string().required('Clock out time is required'),
  status: Yup.string().oneOf(['present', 'absent', 'late', 'on_leave']).required(),
  notes: Yup.string().max(500, 'Notes must be less than 500 characters'),
});

export default function AttendanceEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [id]);

  const fetchAttendance = async () => {
    try {
      const record = await apiClient.get(`/attendance/${id}`);
      setInitialData(record);
      
      // Fetch user name
      const user = await apiClient.get(`/users/${record.userId}`);
      setUserName(`${user.firstName} ${user.lastName}`);
    } catch (error) {
      toast.error('Failed to fetch attendance record');
      navigate('/attendance');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const duration = calculateDuration(values.clockIn, values.clockOut);
      const updatedRecord = {
        ...values,
        durationHours: duration,
      };
      
      await apiClient.put(`/attendance/${id}`, updatedRecord);
      toast.success('Attendance record updated successfully');
      navigate('/attendance');
    } catch (error) {
      toast.error('Failed to update attendance record');
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/attendance')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Attendance Record</h1>
          <p className="text-muted-foreground">
            Editing record for {userName} on {initialData.date}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              clockIn: initialData.clockIn,
              clockOut: initialData.clockOut,
              status: initialData.status,
              notes: initialData.notes || '',
            }}
            validationSchema={attendanceSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clockIn">Clock In Time *</Label>
                    <Field
                      as={Input}
                      id="clockIn"
                      name="clockIn"
                      type="time"
                      className={errors.clockIn && touched.clockIn ? 'border-destructive' : ''}
                    />
                    {errors.clockIn && touched.clockIn && (
                      <p className="text-sm text-destructive">{String(errors.clockIn)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clockOut">Clock Out Time *</Label>
                    <Field
                      as={Input}
                      id="clockOut"
                      name="clockOut"
                      type="time"
                      className={errors.clockOut && touched.clockOut ? 'border-destructive' : ''}
                    />
                    {errors.clockOut && touched.clockOut && (
                      <p className="text-sm text-destructive">{String(errors.clockOut)}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={values.status}
                    onValueChange={(value) => setFieldValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Field
                    as={Textarea}
                    id="notes"
                    name="notes"
                    placeholder="Add any notes or comments..."
                    rows={4}
                    className={errors.notes && touched.notes ? 'border-destructive' : ''}
                  />
                  {errors.notes && touched.notes && (
                    <p className="text-sm text-destructive">{String(errors.notes)}</p>
                  )}
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Location In:</strong> {initialData.locationIn.label}
                    <br />
                    <strong>Coordinates:</strong> {initialData.locationIn.lat.toFixed(4)}, {initialData.locationIn.lng.toFixed(4)}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Update Record'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/attendance')}>
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
