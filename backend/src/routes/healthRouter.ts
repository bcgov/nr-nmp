// Root|/api endpoint router
// Any routes in /api can be accessed through here
import express from 'express';
import checkHealth from '../controllers/health-api-controller';

const healthRouter = express.Router();

healthRouter.route('/health').get(checkHealth); // Simple health endpoint to check API status

export default healthRouter;
