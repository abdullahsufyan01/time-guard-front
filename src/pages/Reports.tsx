import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { apiClient } from '@/lib/apiClient';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('attendance');
  const [period, setPeriod] = useState('this_month');
  const [format, setFormat] = useState('csv');
  const { records } = useSelector((state: RootState) => state.attendance);
  const { users } = useSelector((state: RootState) => state.users);

  const getDateRange = (preset: string) => {
    const today = new Date();
    let from = format(today, 'yyyy-MM-dd');
    let to = format(today, 'yyyy-MM-dd');

    switch (preset) {
      case 'today':
        break;
      case 'this_week':
        from = format(startOfWeek(today), 'yyyy-MM-dd');
        to = format(endOfWeek(today), 'yyyy-MM-dd');
        break;
      case 'this_month':
        from = format(startOfMonth(today), 'yyyy-MM-dd');
        to = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'last_month':
        const lastMonth = subDays(startOfMonth(today), 1);
        from = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        to = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
      case 'this_quarter':
        from = format(startOfQuarter(today), 'yyyy-MM-dd');
        to = format(endOfQuarter(today), 'yyyy-MM-dd');
        break;
      case 'this_year':
        from = format(startOfYear(today), 'yyyy-MM-dd');
        to = format(endOfYear(today), 'yyyy-MM-dd');
        break;
    }

    return { from, to };
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  const handleGenerateReport = async () => {
    try {
      const { from, to } = getDateRange(period);
      const response = await apiClient.get(`/attendance?from=${from}&to=${to}`);
      const attendanceData = response.data || [];

      if (attendanceData.length === 0) {
        toast.error('No data available for the selected period');
        return;
      }

      if (format === 'csv') {
        const exportData = attendanceData.map((record: any) => ({
          Employee: getUserName(record.userId),
          Date: format(new Date(record.date), 'MMM dd, yyyy'),
          'Clock In': record.clockIn,
          'Clock Out': record.clockOut,
          'Duration (hrs)': record.durationHours.toFixed(2),
          Status: record.status.replace('_', ' '),
          Location: record.locationIn?.label || 'N/A',
        }));
        exportToCSV(exportData, `${reportType}-report-${new Date().toISOString().split('T')[0]}`);
        toast.success('Report exported to CSV successfully');
      } else if (format === 'pdf') {
        const headers = ['Employee', 'Date', 'Clock In', 'Clock Out', 'Duration (hrs)', 'Status', 'Location'];
        const data = attendanceData.map((record: any) => [
          getUserName(record.userId),
          format(new Date(record.date), 'MMM dd, yyyy'),
          record.clockIn,
          record.clockOut,
          record.durationHours.toFixed(2),
          record.status.replace('_', ' '),
          record.locationIn?.label || 'N/A',
        ]);
        exportToPDF(headers, data, `${reportType}-report-${new Date().toISOString().split('T')[0]}`, `${reportType} Report`);
        toast.success('Report exported to PDF successfully');
      }
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Error generating report:', error);
    }
  };

  const reportTemplates = [
    {
      id: 'attendance_summary',
      name: 'Attendance Summary',
      description: 'Overview of attendance records by employee',
      icon: FileText,
    },
    {
      id: 'late_arrivals',
      name: 'Late Arrivals Report',
      description: 'List of late clock-ins with details',
      icon: FileText,
    },
    {
      id: 'absences',
      name: 'Absences Report',
      description: 'Track employee absences over time',
      icon: FileText,
    },
    {
      id: 'overtime',
      name: 'Overtime Report',
      description: 'Summary of overtime hours by employee',
      icon: FileText,
    },
    {
      id: 'payroll',
      name: 'Payroll Report',
      description: 'Timesheet data ready for payroll processing',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Exports</h1>
        <p className="text-muted-foreground">Generate and download attendance reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generate Custom Report</CardTitle>
            <CardDescription>Select report parameters and export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance Summary</SelectItem>
                    <SelectItem value="late_arrivals">Late Arrivals</SelectItem>
                    <SelectItem value="absences">Absences</SelectItem>
                    <SelectItem value="overtime">Overtime</SelectItem>
                    <SelectItem value="payroll">Payroll Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="this_quarter">This Quarter</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Excel)</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xlsx">XLSX (Excel)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleGenerateReport} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Generate & Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold">96.5%</p>
              <p className="text-sm text-muted-foreground">Avg Attendance Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold">8.2 hrs</p>
              <p className="text-sm text-muted-foreground">Avg Daily Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Late Arrivals (Month)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Quick access to commonly used reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:bg-accent hover:cursor-pointer transition-colors"
                  onClick={() => {
                    toast.success(`Generating ${template.name}...`);
                  }}
                >
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
