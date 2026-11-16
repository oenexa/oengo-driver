import http from 'node:http';
import { DriverService } from './service/DriverService.js';

export * from './domain/types.js';
export * from './domain/events.js';
export * from './service/DriverService.js';

const driver = new DriverService();
const PORT = Number(process.env.PORT) || 3010;

export const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'UP', service: 'oengo-driver', timestamp: new Date().toISOString() }));
  }

  if (req.url === '/api/driver/outbox' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ success: true, data: driver.getOutbox() }));
  }

  res.writeHead(404);
  return res.end(JSON.stringify({ success: false, error: 'Endpoint Not Found' }));
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[oengo-driver] Driver Telematics & Mission Tracking Microservice listening on port ${PORT}`);
  });
}
