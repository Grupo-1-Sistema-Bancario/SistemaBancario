import { Router } from 'express';
import { createProduct, getProducts, getProductById, updateProduct, changeProductStatus, getProductsWithCurrencies, acquireProduct, getMyProducts } from './product.controller.js';
import { validateCreateProduct, validateUpdateProductRequest, validateProductStatusChange, validateGetProductById } from '../../middlewares/products-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

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

router.get(
    '/my-products',
    validateJWT,
    getMyProducts
)

router.get(
    '/:id', 
    validateGetProductById, 
    getProductById
);

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

router.post(
    '/acquire',
    validateJWT,
    acquireProduct
);

export default router;