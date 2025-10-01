import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
  label: string;
}

export const BreadcrumbTracker = ({ userId }: { userId: string }) => {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    if (!isTracking) return;

    const baseLocations = [
      { lat: 31.5204, lng: 74.3587, label: 'Office A' },
      { lat: 31.5210, lng: 74.3590, label: 'Conference Room' },
      { lat: 31.5198, lng: 74.3585, label: 'Parking Lot' },
      { lat: 31.5215, lng: 74.3600, label: 'Cafeteria' },
    ];

    const generateLocation = (): LocationPoint => {
      const randomBase = baseLocations[Math.floor(Math.random() * baseLocations.length)];
      const randomOffset = 0.0001 * (Math.random() - 0.5);

      return {
        lat: randomBase.lat + randomOffset,
        lng: randomBase.lng + randomOffset,
        timestamp: new Date().toISOString(),
        label: randomBase.label,
      };
    };

    setLocations([generateLocation()]);

    const interval = setInterval(() => {
      setLocations((prev) => {
        const newLocation = generateLocation();
        const updated = [newLocation, ...prev];
        return updated.slice(0, 10);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, isTracking]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Location Tracking
          </CardTitle>
          <Badge variant={isTracking ? 'default' : 'secondary'}>
            {isTracking ? 'Active' : 'Paused'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {locations.map((location, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{location.label}</p>
                <p className="text-xs text-muted-foreground">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(location.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {index === 0 && (
                <Badge variant="default" className="text-xs">
                  Current
                </Badge>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Location updates every 5 seconds. This is a mock implementation for demonstration purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
