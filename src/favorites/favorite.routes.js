import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requestLimit } from '../../middlewares/request-limit.js';
import {
    addFavorite,
    getMyFavorites,
    updateFavoriteAlias,
    removeFavorite,
} from './favorite.controller.js';

const router = Router();

router.use(requestLimit);

// Todas las rutas requieren autenticación (cualquier rol)
router.use(validateJWT);

// Obtener mis favoritos
router.get('/', getMyFavorites);

// Agregar un favorito (con alias opcional)
router.post('/', addFavorite);

// Actualizar el alias de un favorito
router.put('/:favoriteId', updateFavoriteAlias);

// Eliminar un favorito
router.delete('/:favoriteId', removeFavorite);

export default router;
