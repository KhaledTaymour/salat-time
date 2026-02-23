import { useEffect, useState } from 'react';
import { reverseGeocode } from '@/api/aladhan';
import { useSettingsStore } from '@/stores/settingsStore';
import { suggestMethod } from '@/utils/calculations';
import type { LocationStatus } from '@/types';

export function useLocation() {
  const location = useSettingsStore((s) => s.location);
  const setLocation = useSettingsStore((s) => s.setLocation);
  const setMethod = useSettingsStore((s) => s.setMethod);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const detect = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by your browser');
      return;
    }

    setStatus('detecting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const loc = await reverseGeocode(latitude, longitude);

          if (loc) {
            setLocation(loc);
            // Auto-suggest calculation method based on country
            setMethod(suggestMethod(loc.countryCode));
            setStatus('detected');
          } else {
            // Got coords but no reverse geocode — store raw coords
            setLocation({
              latitude,
              longitude,
              city: 'Unknown',
              country: 'Unknown',
              countryCode: 'XX',
            });
            setStatus('detected');
          }
        } catch {
          setStatus('error');
          setError('Failed to identify your location');
        }
      },
      (err) => {
        setStatus('error');
        switch (err.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            setError('Location permission denied');
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            setError('Location unavailable');
            break;
          case GeolocationPositionError.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('Failed to detect location');
        }
      },
      { timeout: 10_000, enableHighAccuracy: false }
    );
  };

  // Restore status if location already persisted
  useEffect(() => {
    if (location !== null) {
      setStatus('detected');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, error, detect };
}
