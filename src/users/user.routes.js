import { Router } from 'express';

import { 
    createAccount,
    getMyAccount, 
    updateAccount, 
    changeAccountStatus,
    getAllAccounts,
    getMyAccountWithCurrencies
} from './user.controller.js';

import { 
    validateCreateUser, 
    validateUpdateUserRequest, 
    validateUserStatusChange 
} from '../../middlewares/user-validators.js';

import { requestLimit } from '../../middlewares/request-limit.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

router.use(requestLimit);

router.post(
    '/create',
    validateCreateUser, 
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
    validateUpdateUserRequest,
    updateAccount
);

router.put(
    '/:id/activate', 
    validateUserStatusChange, 
    changeAccountStatus
);

router.put(
    '/:id/desactivate', 
    validateUserStatusChange, 
    changeAccountStatus
);

router.get(
    '/my-account/currencies',
    validateJWT,
    getMyAccountWithCurrencies
);

export default router;