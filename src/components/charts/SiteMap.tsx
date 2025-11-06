import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as MapTooltip } from 'react-leaflet';
import { ChartHeader } from '../common/ChartHeader';
import { VISUALIZATION_INFO } from '../../config/visualizationInfo';
import { SiteLocation, Case } from '../../types';
import { useMemo } from 'react';
import 'leaflet/dist/leaflet.css';

interface SiteMapProps {
  sites: SiteLocation[];
  cases: Case[];
  onSiteClick?: (siteId: string) => void;
}

export function SiteMap({ sites, cases, onSiteClick }: SiteMapProps) {
  const siteMetrics = useMemo(() => {
    return sites.map(site => {
      const siteCases = cases.filter(c => c.siteId === site.siteId);
      const openCases = siteCases.filter(c => c.isOpen).length;
      const criticalCases = siteCases.filter(c => c.isCritical && c.isOpen).length;

      const severity = criticalCases > 10 ? 'critical' :
                      criticalCases > 5 ? 'high' :
                      criticalCases > 0 ? 'medium' : 'low';

      return {
        ...site,
        openCases,
        criticalCases,
        severity,
        radius: Math.max(10, Math.min(40, openCases * 2)),
      };
    });
  }, [sites, cases]);

  const getColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (sites.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Map</h3>
        <p className="text-gray-500 text-center py-8">No geolocation data available</p>
      </div>
    );
  }

  // Calculate center point (average of all coordinates)
  const center: [number, number] = [
    sites.reduce((sum, s) => sum + s.latitude, 0) / sites.length,
    sites.reduce((sum, s) => sum + s.longitude, 0) / sites.length,
  ];

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Site Map</h3>
      <p className="text-sm text-gray-600 mb-4">
        Geographic view: Marker size = open cases, color = criticality
      </p>

      {/* Summary Stats */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-700">Total Sites</div>
          <div className="text-2xl font-bold text-black">{sites.length}</div>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <div className="text-gray-700">Critical Risk Sites</div>
          <div className="text-2xl font-bold text-red-600">
            {siteMetrics.filter(s => s.severity === 'critical').length}
          </div>
        </div>
        <div className="bg-amber-50 p-3 rounded">
          <div className="text-gray-700">High Risk Sites</div>
          <div className="text-2xl font-bold text-orange-600">
            {siteMetrics.filter(s => s.severity === 'high').length}
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-gray-700">Low Risk Sites</div>
          <div className="text-2xl font-bold text-green-600">
            {siteMetrics.filter(s => s.severity === 'low').length}
          </div>
        </div>
      </div>

      <div className="h-[700px] rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg">
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {siteMetrics.map(site => (
            <CircleMarker
              key={site.siteId}
              center={[site.latitude, site.longitude]}
              radius={site.radius}
              pathOptions={{
                color: getColor(site.severity),
                fillColor: getColor(site.severity),
                fillOpacity: 0.6,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSiteClick?.(site.siteId),
              }}
            >
              <MapTooltip>
                <div className="text-sm">
                  <div className="font-bold">{site.siteName}</div>
                  <div>Open Cases: {site.openCases}</div>
                  <div className="text-red-600 font-semibold">
                    Critical: {site.criticalCases}
                  </div>
                </div>
              </MapTooltip>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-lg mb-2">{site.siteName}</div>
                  <div className="mb-1">Open Cases: <span className="font-semibold">{site.openCases}</span></div>
                  <div className="mb-1 text-red-600">Critical: <span className="font-semibold">{site.criticalCases}</span></div>
                  <button
                    onClick={() => onSiteClick?.(site.siteId)}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <span>Low Risk (0 critical)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-amber-500 rounded-full" />
          <span>Medium (1-5 critical)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-600 rounded-full" />
          <span>High (6-10 critical)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-600 rounded-full" />
          <span>Critical (10+ critical)</span>
        </div>
        <div className="ml-4 text-gray-600 font-medium">
          • Marker size = Open case count
        </div>
      </div>

      {/* Site List */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">All Sites ({siteMetrics.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {siteMetrics
            .sort((a, b) => b.criticalCases - a.criticalCases || b.openCases - a.openCases)
            .map(site => (
              <div
                key={site.siteId}
                className="p-3 border border-gray-200 rounded hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
                onClick={() => onSiteClick?.(site.siteId)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-sm">{site.siteName}</div>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getColor(site.severity) }}
                  />
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Open: <span className="font-semibold">{site.openCases}</span></div>
                  <div className={site.criticalCases > 0 ? 'text-red-600 font-semibold' : ''}>
                    Critical: <span>{site.criticalCases}</span>
                  </div>
                  <div className="text-gray-400">
                    {site.latitude.toFixed(2)}, {site.longitude.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
