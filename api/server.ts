import app from './app.js';
import { WebSocketServer } from 'ws';
import { initWSService } from './services/WSService.js';

const PORT = process.env.PORT || 8821;

const server = app.listen(PORT, () => {
  console.log(`[Estate Management] Server ready on port ${PORT}`);
});

const wss = new WebSocketServer({ server, path: '/ws' });
initWSService(wss);

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  wss.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  wss.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;