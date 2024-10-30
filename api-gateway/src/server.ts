import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { metricsRegistry } from './metrics/metrics';
import { errorMiddleware } from './middlewares/error.middleware';


// Create an instance of an Express application
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('This is the api for the api gateway');
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
      res.set('Content-Type', metricsRegistry.contentType);
      res.end(await metricsRegistry.metrics());
  } catch (ex) {
      res.status(500).end(ex);
  }
});

app.use(errorMiddleware);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
