import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

// Validaciones para crear campos (field)
export const validateCreateProduct = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del producto es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('type')
        .notEmpty()
        .withMessage('El tipo de producto es requerido')
        .isIn(['PRODUCT', 'SERVICE'])
        .withMessage('Tipo de producto no válida'),
    body('price')
        .notEmpty()
        .withMessage('El precio es el requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser mayor o igual a 0'),
    checkValidators,
];

export const validateUpdateProductRequest = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    body('name')
        .trim()
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('type')
        .isIn(['PRODUCT', 'SERVICE'])
        .withMessage('Tipo de producto no válida'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser mayor o igual a 0'),
    checkValidators,
];

export const validateProductStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetProductById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];