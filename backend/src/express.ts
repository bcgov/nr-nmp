/**
 * @desc This is where middleware and routes are activated
 * Any processing of Requests is done here before routing
 * to their target endpoints
 * @summary The file where middleware and routes are activated
 * @author GDamaso
 */
import './db';
import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { sso } from '@bcgov/citz-imb-sso-express';
import swaggerConfig from './config/swaggerConfig';
import * as routers from './routes/index';
import * as middleware from './middleware';

const app = express();

sso(app);

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // Compressor of body data, improving transfer speeds
app.use(morgan('dev')); // Logger Requests and Responses in the console
app.use(cors()); // Activate CORS, allowing access
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(swaggerConfig)));

// Add the protectedRoute function to any endpoint routes in the Admin Portal

// Routes
app.use('/api', [routers.healthRouter, routers.developersRouter]);

// Integrate global error handler after routes to cover all ends.
app.use(middleware.globalErrorHandler);

export default app;
