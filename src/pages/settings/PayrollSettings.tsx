import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { DollarSign } from 'lucide-react';

export default function PayrollSettings() {
  const [settings, setSettings] = useState({
    weekStartsOn: 'monday',
    payPeriodEnd: '15',
    autoClockOut: true,
    autoClockOutHours: '13',
    timesheetApproval: true,
    overtimeEnabled: true,
    overtimeThreshold: '40',
  });

  const handleSave = () => {
    toast.success('Payroll settings updated successfully');
  };

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payroll Settings</h1>
        <p className="text-muted-foreground">Configure payroll and timesheet preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Work Week & Pay Period
            </CardTitle>
            <CardDescription>Set up your work week and pay period configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Week Starts On</Label>
                <Select
                  value={settings.weekStartsOn}
                  onValueChange={(value) => updateSetting('weekStartsOn', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pay Period End Day</Label>
                <Select
                  value={settings.payPeriodEnd}
                  onValueChange={(value) => updateSetting('payPeriodEnd', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Rules</CardTitle>
            <CardDescription>Configure automatic clock out and overtime settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Clock Out</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically clock out employees after specified hours
                </p>
              </div>
              <Switch
                checked={settings.autoClockOut}
                onCheckedChange={(checked) => updateSetting('autoClockOut', checked)}
              />
            </div>

            {settings.autoClockOut && (
              <div className="space-y-2 pl-6">
                <Label>Auto Clock Out After (Hours)</Label>
                <Select
                  value={settings.autoClockOutHours}
                  onValueChange={(value) => updateSetting('autoClockOutHours', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="10">10 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="13">13 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Timesheet Approval Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require manager approval for timesheets
                </p>
              </div>
              <Switch
                checked={settings.timesheetApproval}
                onCheckedChange={(checked) => updateSetting('timesheetApproval', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Overtime Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Track overtime hours automatically
                </p>
              </div>
              <Switch
                checked={settings.overtimeEnabled}
                onCheckedChange={(checked) => updateSetting('overtimeEnabled', checked)}
              />
            </div>

            {settings.overtimeEnabled && (
              <div className="space-y-2 pl-6">
                <Label>Overtime Threshold (Hours per Week)</Label>
                <Select
                  value={settings.overtimeThreshold}
                  onValueChange={(value) => updateSetting('overtimeThreshold', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="38">38 hours</SelectItem>
                    <SelectItem value="40">40 hours</SelectItem>
                    <SelectItem value="42">42 hours</SelectItem>
                    <SelectItem value="44">44 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
