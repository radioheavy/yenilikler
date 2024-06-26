import express from 'express';
import { getIp } from '../controllers/ipController';

const router = express.Router();

router.get('/get-ip', getIp);

export default router;