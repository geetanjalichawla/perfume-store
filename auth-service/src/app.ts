import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { metricsRegistry } from './metrics/metrics';
import morgan from 'morgan'
import authRoutes from "./routes/auth.routes";
import userRoutes from './routes/user.routes';  

// Create an instance of an Express application
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// morgan 
app.use(morgan("dev"));


// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Welcome to the auth service!');
});



// all routes for auth services
app.use('/auth', authRoutes);
app.use('/user', userRoutes);



// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
      res.set('Content-Type', metricsRegistry.contentType);
      res.end(await metricsRegistry.metrics());
  } catch (ex) {
      res.status(500).end(ex);
  }
});




export default app;
