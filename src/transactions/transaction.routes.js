import { Router } from "express";
import { validateEditTransaction, validateCreateDeposit, validateCreatePayment, validateCreateTransfer, validateReverseDeposit, validateGetTopAccounts, validateGetLastFiveMovementsByAccount } from "../../middlewares/transaction-validators.js";
import { createDeposit, createPayment, createTransfer, editDeposit, reverseDeposit, getTopAccounts, getLastFiveMovementsByAccount, getMyTransactionHistory } from "./transaction.controller.js";
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.post(
    '/transfer',
    validateCreateTransfer,
    createTransfer);

router.post(
    '/deposit',
    validateCreateDeposit,
    createDeposit);

router.post(
    '/payment',
    validateCreatePayment,
    createPayment);

router.put(
    '/deposit/:id',
    validateEditTransaction,
    editDeposit
);
router.put('/reverse/:id',
    validateReverseDeposit, 
    reverseDeposit
);
router.get('/topAccounts', 
    validateGetTopAccounts,
    getTopAccounts
);
router.get('/admin/last-movements/:accountId',
    validateGetLastFiveMovementsByAccount,
    getLastFiveMovementsByAccount
);

router.get(
    '/history',
    validateJWT,
    getMyTransactionHistory
);

export default router;