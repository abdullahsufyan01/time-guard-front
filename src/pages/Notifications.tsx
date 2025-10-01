import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, Mail, Smartphone } from 'lucide-react';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  web: boolean;
}

export default function Notifications() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'late_arrival',
      name: 'Late Arrivals',
      description: 'Notify when an employee clocks in late',
      email: true,
      push: true,
      web: true,
    },
    {
      id: 'absence',
      name: 'Absences',
      description: 'Alert when an employee is absent',
      email: true,
      push: false,
      web: true,
    },
    {
      id: 'leave_request',
      name: 'Leave Requests',
      description: 'Notify about new leave requests',
      email: true,
      push: true,
      web: true,
    },
    {
      id: 'timesheet_pending',
      name: 'Pending Timesheets',
      description: 'Remind about timesheets pending approval',
      email: true,
      push: false,
      web: false,
    },
    {
      id: 'geofence_violation',
      name: 'Geofence Violations',
      description: 'Alert when clock in/out happens outside geofence',
      email: false,
      push: true,
      web: true,
    },
  ]);

  const updateNotification = (id: string, channel: 'email' | 'push' | 'web', value: boolean) => {
    setSettings(
      settings.map((setting) =>
        setting.id === id ? { ...setting, [channel]: value } : setting
      )
    );
  };

  const handleSave = () => {
    toast.success('Notification settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notification Center</h1>
          <p className="text-muted-foreground">
            Configure who gets notified and through which channels
          </p>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about important events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header Row */}
            <div className="grid grid-cols-[1fr,120px,120px,120px] gap-4 pb-4 border-b">
              <div className="font-medium">Event Type</div>
              <div className="text-center flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <div className="text-center flex items-center justify-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Push</span>
              </div>
              <div className="text-center flex items-center justify-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Web</span>
              </div>
            </div>

            {/* Notification Settings */}
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="grid grid-cols-[1fr,120px,120px,120px] gap-4 items-center py-2"
              >
                <div>
                  <Label className="font-medium">{setting.name}</Label>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={setting.email}
                    onCheckedChange={(checked) =>
                      updateNotification(setting.id, 'email', checked)
                    }
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={setting.push}
                    onCheckedChange={(checked) =>
                      updateNotification(setting.id, 'push', checked)
                    }
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={setting.web}
                    onCheckedChange={(checked) =>
                      updateNotification(setting.id, 'web', checked)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Recipients</CardTitle>
          <CardDescription>Define who receives notifications for each event type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Admins</p>
                <p className="text-sm text-muted-foreground">Receive all notifications</p>
              </div>
              <Badge>Always Notified</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Managers</p>
                <p className="text-sm text-muted-foreground">
                  Notified about their team members
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Employees</p>
                <p className="text-sm text-muted-foreground">Notified about own attendance</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
