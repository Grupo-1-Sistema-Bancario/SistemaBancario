import { body } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';

export const validateTransferByAlias = [
    validateJWT,
    body('alias')
        .notEmpty()
        .withMessage('El alias del favorito es requerido')
        .isString()
        .withMessage('El alias debe ser un texto'),
    body('amount')
        .notEmpty()
        .withMessage('El monto es requerido')
        .isNumeric()
        .withMessage('El monto debe ser un número')
        .isFloat({ min: 0.01 })
        .withMessage('El monto debe ser mayor a 0')
        .isFloat({ max: 2000 })
        .withMessage('No puedes transferir más de Q2000 por transacción'),
    body('description')
        .optional()
        .isString()
        .isLength({ max: 255 })
        .withMessage('La descripción no puede exceder los 255 caracteres'),
    checkValidators
];