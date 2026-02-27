import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

const validateAmount =
    body('amount')
        .notEmpty()
        .withMessage('El monto es requerido')
        .isNumeric()
        .withMessage('El monto debe ser un número')
        .isFloat({ min: 0.01 })
        .withMessage('El monto debe ser mayor a 0')
        .isFloat({ max: 2000 })
        .withMessage('El monto no puede ser mayor a 2000');

export const validateCreateTransfer = [
    validateJWT,
    requireRole('USER_ROLE'),
    body('accountNumberFrom')
        .notEmpty()
        .withMessage('El número de cuenta de origen es requerido')
        .isLength({ min: 10, max: 10 })
        .withMessage('El número de cuenta debe tener 10 dígitos'),
    body('accountNumberTo')
        .notEmpty()
        .withMessage('El número de cuenta de destino es requerido')
        .isLength({ min: 10, max: 10 })
        .withMessage('El número de cuenta debe tener 10 dígitos'),
body('description')
    .optional()
    .isString()
    .withMessage('La descripción debe ser una cadena de texto')
    .isLength({ max: 255 })
    .withMessage('La descripción no puede exceder los 255 caracteres'),
    validateAmount,
    checkValidators
]
export const validateCreatePayment = [
    validateJWT,
    requireRole('USER_ROLE'),
    body('type')
        .isIn(['PAYMENT'])
        .withMessage('El tipo de transacción debe ser PAYMENT'),
    body('accountNumberFrom')
        .notEmpty()
        .withMessage('La cuenta de origen es requerida')
        .isLength({ min: 10, max: 10 })
        .withMessage('El número de cuenta debe tener 10 dígitos'),
    body('product')
        .optional()
        .isMongoId()
        .withMessage('El producto debe ser un ID de Mongo válido'),
    validateAmount,
];

export const validateCreateDeposit = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    body('type')
        .equals('DEPOSIT')
        .withMessage('El tipo de transacción debe ser DEPOSIT'),
    body('accountNumberTo')
        .notEmpty()
        .withMessage('La cuenta de destino es requerida')
        .isLength({ min: 10, max: 10 })
        .withMessage('El número de cuenta debe tener 10 dígitos'),
    body('description').optional().isString(),
    validateAmount,
    checkValidators
];


export const validateEditTransaction = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('El ID de la transacción debe ser un ID de Mongo válido'),
    validateAmount,
    checkValidators

];

export const validateReverseDeposit = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('El ID de la transacción debe ser un ID de Mongo válido'),
    checkValidators
];

export const validateGetTopAccounts = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    checkValidators
];
