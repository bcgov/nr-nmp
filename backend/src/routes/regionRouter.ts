// Root|/api endpoint router
// Any routes in /api can be accessed through here
import express from 'express';
import { getRegions, CreateRegion } from '../controllers/regionsController';

const regionRouter = express.Router();

regionRouter.route('/regions').get(getRegions).post(CreateRegion);

export default regionRouter;
