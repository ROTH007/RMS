import { Router } from 'express';
import {
  listEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  addPayment,
} from '../controllers/employeeController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listEmployees);
router.get('/:id', requireAuth, getEmployee);
router.patch('/:id', requireAuth, updateEmployee);
router.delete('/:id', requireAuth, deleteEmployee);
router.post('/:id/payments', requireAuth, addPayment);

export default router;