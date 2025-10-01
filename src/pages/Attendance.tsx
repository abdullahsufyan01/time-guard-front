import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setRecords, setLoading, setFilters } from '@/store/slices/attendanceSlice';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Download, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function Attendance() {
  const dispatch = useDispatch();
  const { records, loading, filters } = useSelector((state: RootState) => state.attendance);
  const { users } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const fetchAttendance = async () => {
    dispatch(setLoading(true));
    try {
      const { from, to } = getDateRange(filters.preset);
      const response = await apiClient.get(`/attendance?from=${from}&to=${to}`);
      dispatch(setRecords(response));
    } catch (error) {
      toast.error('Failed to fetch attendance records');
      console.error('Error fetching attendance:', error);
    }
  };

  const getDateRange = (preset: string) => {
    const today = new Date();
    let from = format(today, 'yyyy-MM-dd');
    let to = format(today, 'yyyy-MM-dd');

    switch (preset) {
      case 'today':
        break;
      case 'last_week':
        from = format(subDays(today, 7), 'yyyy-MM-dd');
        break;
      case 'last_month':
        from = format(subDays(today, 30), 'yyyy-MM-dd');
        break;
      case 'this_month':
        from = format(startOfMonth(today), 'yyyy-MM-dd');
        to = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
    }

    return { from, to };
  };

  const handlePresetChange = (preset: string) => {
    dispatch(setFilters({ preset }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'present':
        return 'default';
      case 'late':
        return 'secondary';
      case 'absent':
        return 'destructive';
      case 'on_leave':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">Track and manage employee attendance records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={filters.preset} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last_week">Last 7 Days</SelectItem>
                  <SelectItem value="last_month">Last 30 Days</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Duration (hrs)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {getUserName(record.userId)}
                        </TableCell>
                        <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{record.clockIn}</TableCell>
                        <TableCell>{record.clockOut}</TableCell>
                        <TableCell>{record.durationHours.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(record.status)}>
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.locationIn.label}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
