import { Router } from "express";
import { validateEditTransaction, validateCreateDeposit, validateCreatePayment, validateCreateTransfer, validateReverseDeposit, validateGetTopAccounts } from "../../middlewares/transaction-validators.js";
import { createDeposit, createPayment, createTransfer, editDeposit, reverseDeposit, getTopAccounts } from "./transaction.controller.js";

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
export default router;