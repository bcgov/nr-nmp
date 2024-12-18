import express from 'express';
import getBlah from '../controllers/admin-controller';

const router = express.Router();

router.route('/foo').get(getBlah);

export default router;
