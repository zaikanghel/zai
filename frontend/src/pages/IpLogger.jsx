import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, GlobeIcon, Chrome, InfoIcon } from 'lucide-react';
import { useAuthStore } from "../store/authStore";
import Countdown from '../utils/Countdown';

const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="p-4">{children}</div>
);

const CardContent = ({ children }) => (
  <div className="px-4 pb-4">{children}</div>
);

const CardFooter = ({ children }) => (
  <div className="px-4 py-4 bg-gray-50">{children}</div>
);

const DetailsModal = ({ isVisible, onClose, details }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-1/2">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          X
        </button>
        <h2 className="text-2xl font-semibold mb-4">Detailed Information</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>IP:</strong> {details.ip}</p>
          <p><strong>Type:</strong> {details.type}</p>
          <p><strong>Continent:</strong> {details.continent_name}</p>
          <p><strong>Country:</strong> {details.country_name}</p>
          <p><strong>Region:</strong> {details.region_name}</p>
          <p><strong>City:</strong> {details.city}</p>
          <p><strong>Zip:</strong> {details.zip}</p>
          <p><strong>Latitude:</strong> {details.latitude}</p>
          <p><strong>Longitude:</strong> {details.longitude}</p>
          <p><strong>IP Routing Type:</strong> {details.ip_routing_type}</p>
          <p><strong>Connection Type:</strong> {details.connection_type}</p>
          <p><strong>Languages:</strong> {details.location.languages.map(lang => `${lang.name} (${lang.native})`).join(', ')}</p>
          <p><strong>Flag:</strong> <img src={details.location.country_flag} alt="Country Flag" /></p>
          <p><strong>Map:</strong> <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${details.longitude},${details.latitude},${details.longitude},${details.latitude}&layer=mapnik`}
            style={{ width: '100%', height: '100%', border: '0' }}
            title={`Location: ${details.city}`}
            allowFullScreen
          ></iframe></p>
        </div>
      </div>
    </div>
  );
};

const IpLogger = () => {
  const { user } = useAuthStore();
  const [initialTime] = Countdown(user.time);
  const { shortUrl } = useParams();
  const [logs, setLogs] = useState([]);
  const [linkInfo, setLinkInfo] = useState({});
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`/api/logs/${shortUrl}`);
        setLogs(response.data.visits);
        setLinkInfo(response.data);
        setError('');
      } catch (error) {
        setError('Error fetching logs');
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, [shortUrl]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Visit Logs</h1>
          <p className="text-gray-600">Detailed log information for short URL visits</p>
        </div>
      </div>

      {error && <p className="text-red-600">Invalid Code</p>}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Link Information</h2>
          <p><strong>Original URL:</strong> {linkInfo.originalUrl}</p>
          <p><strong>New Url:</strong> <a href={linkInfo.newUrl} className="text-blue-600 underline">{linkInfo.newUrl}</a></p>
          <p><strong>Logger Code:</strong> {linkInfo.shortUrl}</p>
          <p><strong>Logger Url:</strong> <a href={linkInfo.loggerUrl} className="text-blue-600 underline">{linkInfo.loggerUrl}</a></p>
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <Card key={index}>
              <div className="aspect-w-16 aspect-h-9 relative">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${log.longitude},${log.latitude},${log.longitude},${log.latitude}&layer=mapnik`}
                  style={{ width: '100%', height: '100%', border: '0' }}
                  title={`Location: ${log.city}`}
                  allowFullScreen
                ></iframe>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">{log.ip}</h2>
                  <span className="text-gray-500 text-sm">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{log.country_name}, {log.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="h-4 w-4" />
                    <span>{log.region_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chrome className="h-4 w-4" />
                    <span>{log.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{log.ip_routing_type || 'No referrer'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <button
                  className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  Details
                </button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p>No visits recorded yet.</p>
        )}
      </div>

      {selectedLog && (
        <DetailsModal
          isVisible={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          details={selectedLog}
        />
      )}
    </div>
  );
};

export default IpLogger;