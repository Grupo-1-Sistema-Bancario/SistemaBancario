import { Router } from "express";
import { validateEditTransaction, validateCreateDeposit, validateCreatePayment, validateCreateTransfer } from "../../middlewares/transaction-validators.js";
import { createDeposit, createPayment, createTransfer, editDeposit } from "./transaction.controller.js";

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

export default router;