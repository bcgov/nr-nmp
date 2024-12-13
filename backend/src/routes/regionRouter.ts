// Root|/api endpoint router
// Any routes in /api can be accessed through here
import express from 'express';
import { getRegions, CreateRegion } from '../controllers/regionsControler';

const router = express.Router();

router.route('/regions').get(getRegions).post(CreateRegion);

export default router;
