import express from 'express';
import {
  refreshHandler,
  listHandler,
  getOneHandler,
  deleteHandler,
  statusHandler,
  imageHandler
} from '../controllers/countryController.js';

const router = express.Router();

router.post('/refresh', refreshHandler);
router.get('/', listHandler);
router.get('/:name', getOneHandler);
router.delete('/:name', deleteHandler);
router.get('/image', imageHandler);

export default router;
