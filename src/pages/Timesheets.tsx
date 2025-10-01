import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Check, X, Clock } from 'lucide-react';

interface Timesheet {
  id: string;
  employeeName: string;
  period: string;
  totalHours: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export default function Timesheets() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([
    {
      id: 'ts_1',
      employeeName: 'Ali Khan',
      period: 'Oct 1 - Oct 15, 2025',
      totalHours: 80,
      status: 'pending',
      submittedAt: '2025-10-16',
    },
    {
      id: 'ts_2',
      employeeName: 'Sara Ahmed',
      period: 'Oct 1 - Oct 15, 2025',
      totalHours: 84,
      status: 'pending',
      submittedAt: '2025-10-16',
    },
    {
      id: 'ts_3',
      employeeName: 'John Doe',
      period: 'Sep 16 - Sep 30, 2025',
      totalHours: 88,
      status: 'approved',
      submittedAt: '2025-10-01',
    },
  ]);

  const handleApprove = (id: string) => {
    setTimesheets(
      timesheets.map((ts) =>
        ts.id === id ? { ...ts, status: 'approved' as const } : ts
      )
    );
    toast.success('Timesheet approved');
  };

  const handleReject = (id: string) => {
    setTimesheets(
      timesheets.map((ts) =>
        ts.id === id ? { ...ts, status: 'rejected' as const } : ts
      )
    );
    toast.success('Timesheet rejected');
  };

  const handleReopen = (id: string) => {
    setTimesheets(
      timesheets.map((ts) =>
        ts.id === id ? { ...ts, status: 'pending' as const } : ts
      )
    );
    toast.success('Timesheet reopened');
  };

  const getStatusBadge = (status: Timesheet['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const pendingCount = timesheets.filter((ts) => ts.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Timesheet Approval</h1>
        <p className="text-muted-foreground">Review and approve employee timesheets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved (This Month)
            </CardTitle>
            <Check className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {timesheets.filter((ts) => ts.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {timesheets.reduce((sum, ts) => sum + ts.totalHours, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timesheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No timesheets found
                    </TableCell>
                  </TableRow>
                ) : (
                  timesheets.map((timesheet) => (
                    <TableRow key={timesheet.id}>
                      <TableCell className="font-medium">{timesheet.employeeName}</TableCell>
                      <TableCell>{timesheet.period}</TableCell>
                      <TableCell>{timesheet.totalHours} hrs</TableCell>
                      <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                      <TableCell>
                        {new Date(timesheet.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {timesheet.status === 'pending' ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(timesheet.id)}
                              >
                                <Check className="h-4 w-4 text-success" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(timesheet.id)}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReopen(timesheet.id)}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
