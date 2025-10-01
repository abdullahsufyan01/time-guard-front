import { useState } from 'react';
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

  const handleGenerateReport = () => {
    toast.success(`Generating ${reportType} report in ${format.toUpperCase()} format...`);
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
