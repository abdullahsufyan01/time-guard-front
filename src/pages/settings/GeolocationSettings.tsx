import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Plus, Trash2 } from 'lucide-react';

interface Geofence {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  active: boolean;
}

export default function GeolocationSettings() {
  const [breadcrumbEnabled, setBreadcrumbEnabled] = useState(true);
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [geofences, setGeofences] = useState<Geofence[]>([
    {
      id: 'gf_1',
      name: 'Main Office',
      lat: 31.5204,
      lng: 74.3587,
      radius: 100,
      active: true,
    },
    {
      id: 'gf_2',
      name: 'Branch Office',
      lat: 31.4694,
      lng: 74.2728,
      radius: 150,
      active: true,
    },
  ]);

  const [newGeofence, setNewGeofence] = useState({
    name: '',
    lat: '',
    lng: '',
    radius: '100',
  });

  const handleAddGeofence = () => {
    if (!newGeofence.name || !newGeofence.lat || !newGeofence.lng) {
      toast.error('Please fill in all fields');
      return;
    }

    const geofence: Geofence = {
      id: `gf_${geofences.length + 1}`,
      name: newGeofence.name,
      lat: parseFloat(newGeofence.lat),
      lng: parseFloat(newGeofence.lng),
      radius: parseInt(newGeofence.radius),
      active: true,
    };

    setGeofences([...geofences, geofence]);
    setNewGeofence({ name: '', lat: '', lng: '', radius: '100' });
    toast.success('Geofence added successfully');
  };

  const handleDeleteGeofence = (id: string) => {
    setGeofences(geofences.filter((gf) => gf.id !== id));
    toast.success('Geofence removed');
  };

  const toggleGeofence = (id: string) => {
    setGeofences(
      geofences.map((gf) =>
        gf.id === id ? { ...gf, active: !gf.active } : gf
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Geolocation Settings</h1>
        <p className="text-muted-foreground">Configure location tracking and geofencing</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Tracking
            </CardTitle>
            <CardDescription>Enable or disable location tracking features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Breadcrumb Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Track employee location throughout the day
                </p>
              </div>
              <Switch
                checked={breadcrumbEnabled}
                onCheckedChange={setBreadcrumbEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Geofence Validation</Label>
                <p className="text-sm text-muted-foreground">
                  Require employees to be within geofence to clock in/out
                </p>
              </div>
              <Switch
                checked={geofenceEnabled}
                onCheckedChange={setGeofenceEnabled}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geofences</CardTitle>
            <CardDescription>Define allowed clock in/out locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Geofences */}
            <div className="space-y-3">
              {geofences.map((geofence) => (
                <div
                  key={geofence.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{geofence.name}</h4>
                      <Badge variant={geofence.active ? 'default' : 'secondary'}>
                        {geofence.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lat: {geofence.lat.toFixed(4)}, Lng: {geofence.lng.toFixed(4)} • Radius: {geofence.radius}m
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Switch
                      checked={geofence.active}
                      onCheckedChange={() => toggleGeofence(geofence.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGeofence(geofence.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Geofence */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Add New Geofence</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Office"
                    value={newGeofence.name}
                    onChange={(e) =>
                      setNewGeofence({ ...newGeofence, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="radius">Radius (meters)</Label>
                  <Input
                    id="radius"
                    type="number"
                    placeholder="100"
                    value={newGeofence.radius}
                    onChange={(e) =>
                      setNewGeofence({ ...newGeofence, radius: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    placeholder="31.5204"
                    value={newGeofence.lat}
                    onChange={(e) =>
                      setNewGeofence({ ...newGeofence, lat: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    placeholder="74.3587"
                    value={newGeofence.lng}
                    onChange={(e) =>
                      setNewGeofence({ ...newGeofence, lng: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button className="mt-4" onClick={handleAddGeofence}>
                <Plus className="h-4 w-4 mr-2" />
                Add Geofence
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
