import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requestLimit } from '../../middlewares/request-limit.js';
import {
    addFavorite,
    getMyFavorites,
    updateFavoriteAlias,
    removeFavorite,
    searchFavorites,
    checkIsFavorite,
    transferByAlias
} from './favorite.controller.js';

import { validateTransferByAlias } from '../../middlewares/favorite-validators.js';

const router = Router();

router.use(requestLimit);

// Todas las rutas requieren autenticación (cualquier rol)
router.use(validateJWT);


router.get(
    '/search', 
    searchFavorites);

router.get(
    '/check/:accountNumber'
    , checkIsFavorite);
// Obtener mis favoritos


router.get('/', getMyFavorites);

// Agregar un favorito (con alias opcional)
router.post('/', addFavorite);

// Actualizar el alias de un favorito
router.put('/:favoriteId', updateFavoriteAlias);

// Eliminar un favorito
router.delete('/:favoriteId', removeFavorite);

router.post('/transfer', validateTransferByAlias, transferByAlias);

export default router;
