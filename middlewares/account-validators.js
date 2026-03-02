import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateAccount = [
    validateJWT, 
    requireRole('ADMIN_ROLE'), 
    body('authAccountId')
        .notEmpty()
        .withMessage('El ID de autenticación de la cuenta es requerido'),
    body('dpi')
        .notEmpty()
        .withMessage('El DPI es requerido')
        .matches(/^[0-9]{13}$/)
        .withMessage('El DPI debe tener exactamente 13 números'),
    body('address')
        .trim()
        .notEmpty()
        .withMessage('La dirección es requerida'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('El número de celular es requerido'),
    body('jobName')
        .trim()
        .notEmpty()
        .withMessage('El nombre del trabajo es requerido'),
    body('monthlyIncome')
        .notEmpty()
        .withMessage('Los ingresos mensuales son requeridos')
        .isFloat({ min: 100 })
        .withMessage('Debes ganar al menos Q100 al mes'),
    checkValidators,
];

export const validateUpdateAccountRequest = [
    validateJWT,
    param('id')
        .isMongoId()
        .withMessage('El ID de la cuenta debe ser un ObjectId válido'),
    body('address').optional().trim().notEmpty(),
    body('phone').optional().trim().notEmpty(),
    body('jobName').optional().trim().notEmpty(),
    body('monthlyIncome')
        .optional()
        .isFloat({ min: 100 })
        .withMessage('Los ingresos no pueden bajar de Q100'),
    checkValidators,
];

// Validaciones para activar/desactivar
export const validateAccountStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'), // Solo un admin puede bloquear/desbloquear cuentas
    param('id')
        .isMongoId()
        .withMessage('El ID de la cuenta debe ser válido'),
    checkValidators,
];