import { Router } from "express";
import { validateEditTransaction, validateCreateDeposit, validateCreatePayment, validateCreateTransfer, validateReverseDeposit, validateGetTopAccounts, validateGetLastFiveMovementsByUser } from "../../middlewares/transaction-validators.js";
import { createDeposit, createPayment, createTransfer, editDeposit, reverseDeposit, getTopAccounts, getLastFiveMovementsByUser } from "./transaction.controller.js";

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
router.get('/admin/last-movements/:userId',
    validateGetLastFiveMovementsByUser,
    getLastFiveMovementsByUser
);
export default router;