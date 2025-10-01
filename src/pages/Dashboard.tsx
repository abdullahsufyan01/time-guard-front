import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, AlertCircle, Download } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface DashboardStats {
  totalEmployees: number;
  activeToday: number;
  pendingRequests: number;
  lateArrivals: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeToday: 0,
    pendingRequests: 0,
    lateArrivals: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const users = await apiClient.get('/users');
      const today = new Date().toISOString().split('T')[0];
      const attendance = await apiClient.get(`/attendance?from=${today}&to=${today}`);

      setStats({
        totalEmployees: users.data?.length || 0,
        activeToday: attendance.data?.length || 0,
        pendingRequests: 0,
        lateArrivals: attendance.data?.filter((a: any) => a.status === 'late').length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Today',
      value: stats.activeToday,
      icon: Clock,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Late Arrivals',
      value: stats.lateArrivals,
      icon: AlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of attendance and employee metrics</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Quick Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">Ali Khan clocked in</p>
                  <p className="text-sm text-muted-foreground">2 minutes ago</p>
                </div>
                <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">On Time</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">Sara Ahmed clocked out</p>
                  <p className="text-sm text-muted-foreground">15 minutes ago</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Completed</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Doe requested leave</p>
                  <p className="text-sm text-muted-foreground">1 hour ago</p>
                </div>
                <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Average Clock In</span>
                <span className="font-semibold">9:05 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Average Clock Out</span>
                <span className="font-semibold">5:15 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Attendance Rate</span>
                <span className="font-semibold text-success">96.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">On Leave Today</span>
                <span className="font-semibold">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
