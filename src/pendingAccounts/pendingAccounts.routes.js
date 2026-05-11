import { Router } from 'express';
import { saveRequest, getPendingBankUsers } from './pendingAccounts.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.post('/account-request', saveRequest);

router.get('/get', getPendingBankUsers);

export default router;