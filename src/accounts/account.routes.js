import { Router } from 'express';

import { 
    createAccount,
    getMyAccount, 
    updateAccount, 
    changeAccountStatus,
    getAllAccounts,
    getMyAccountWithCurrencies
} from './account.controller.js';

import { 
    validateCreateAccount, 
    validateUpdateAccountRequest, 
    validateAccountStatusChange 
} from '../../middlewares/account-validators.js';

import { requestLimit } from '../../middlewares/request-limit.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

router.use(requestLimit);

router.post(
    '/create',
    validateCreateAccount, 
    createAccount
);

router.get(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    getAllAccounts
);

router.get(
    '/my-account',
    validateJWT,
    getMyAccount
);

router.put(
    '/:id',
    validateUpdateAccountRequest,
    updateAccount
);

router.put(
    '/:id/activate', 
    validateAccountStatusChange, 
    changeAccountStatus
);

router.put(
    '/:id/desactivate', 
    validateAccountStatusChange, 
    changeAccountStatus
);

router.get(
    '/my-account/currencies',
    validateJWT,
    getMyAccountWithCurrencies
);

export default router;