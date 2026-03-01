import { Router } from 'express';
import { createProduct, getProducts, getProductById, updateProduct, changeProductStatus, getProductsWithCurrencies } from './product.controller.js';
import { validateCreateProduct, validateUpdateProductRequest, validateProductStatusChange, validateGetProductById } from '../../middlewares/products-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateProduct,
    createProduct
)

router.get(
    '/get',
    getProducts
)

router.get('/:id', validateGetProductById, getProductById);

router.put(
    '/:id',
    validateUpdateProductRequest,
    updateProduct
);
router.put('/:id/activate', validateProductStatusChange, changeProductStatus);
router.put('/:id/deactivate', validateProductStatusChange, changeProductStatus);

router.get(
    '/get/currencies',
    getProductsWithCurrencies
);

export default router;