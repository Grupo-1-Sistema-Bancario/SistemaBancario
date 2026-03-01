import Favorite from './favorite.model.js';
import Account from '../users/user.model.js';

/**
 * Agregar un usuario como favorito (con alias opcional)
 * POST /api/v1/bank/favorites
 */
export const addFavorite = async (req, res) => {
    try {
        const ownerAuthUserId = req.user.id;
        const { favoriteAccountNumber, alias } = req.body;

        if (!favoriteAccountNumber) {
            return res.status(400).json({
                success: false,
                message: 'El número de cuenta favorita es obligatorio.',
            });
        }

        // Verificar que la cuenta favorita existe y está activa
        const favoriteAccount = await Account.findOne({
            accountNumber: favoriteAccountNumber,
            isActive: true,
        });

        if (!favoriteAccount) {
            return res.status(404).json({
                success: false,
                message: 'La cuenta que intentas agregar como favorita no existe o está inactiva.',
            });
        }

        // Verificar que el usuario no se agrega a sí mismo
        if (favoriteAccount.authUserId === ownerAuthUserId) {
            return res.status(400).json({
                success: false,
                message: 'No puedes agregarte a ti mismo como favorito.',
            });
        }

        const newFavorite = new Favorite({
            ownerAuthUserId,
            favoriteAccountNumber,
            alias: alias || null,
        });

        await newFavorite.save();

        res.status(201).json({
            success: true,
            message: 'Cuenta agregada a favoritos exitosamente.',
            data: newFavorite,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Esta cuenta ya está en tu lista de favoritos.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al agregar favorito.',
            error: error.message,
        });
    }
};

/**
 * Obtener todos los favoritos del usuario autenticado
 * GET /api/v1/bank/favorites
 */
export const getMyFavorites = async (req, res) => {
    try {
        const ownerAuthUserId = req.user.id;

        const favorites = await Favorite.find({ ownerAuthUserId });

        res.status(200).json({
            success: true,
            total: favorites.length,
            data: favorites,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los favoritos.',
            error: error.message,
        });
    }
};

/**
 * Actualizar el alias de un favorito
 * PUT /api/v1/bank/favorites/:favoriteId
 */
export const updateFavoriteAlias = async (req, res) => {
    try {
        const ownerAuthUserId = req.user.id;
        const { favoriteId } = req.params;
        const { alias } = req.body;

        if (alias === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Debes proporcionar un alias para actualizar.',
            });
        }

        if (typeof alias === 'string' && alias.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: 'El alias no puede tener más de 50 caracteres.',
            });
        }

        const favorite = await Favorite.findOne({
            _id: favoriteId,
            ownerAuthUserId,
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado o no tienes permiso para modificarlo.',
            });
        }

        favorite.alias = alias !== '' ? alias.trim() : null;
        await favorite.save();

        res.status(200).json({
            success: true,
            message: 'Alias actualizado exitosamente.',
            data: favorite,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'El ID del favorito no es válido.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar el alias.',
            error: error.message,
        });
    }
};

/**
 * Eliminar un favorito
 * DELETE /api/v1/bank/favorites/:favoriteId
 */
export const removeFavorite = async (req, res) => {
    try {
        const ownerAuthUserId = req.user.id;
        const { favoriteId } = req.params;

        const favorite = await Favorite.findOneAndDelete({
            _id: favoriteId,
            ownerAuthUserId,
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado o no tienes permiso para eliminarlo.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Favorito eliminado exitosamente.',
            data: favorite,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'El ID del favorito no es válido.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar el favorito.',
            error: error.message,
        });
    }
};

export const searchFavorites = async (req, res) => {
    try {
        const ownerAuthUserId = req.user.id;
        const { q } = req.query;

        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Debes proporcionar un término de búsqueda.',
            });
        }

        const regex = new RegExp(q.trim(), 'i');

        const favorites = await Favorite.find({
            ownerAuthUserId,
            $or: [
                { alias: { $regex: regex } },
                { favoriteAccountNumber: { $regex: regex } },
            ],
        });

        res.status(200).json({
            success: true,
            total: favorites.length,
            data: favorites,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar favoritos.',
            error: error.message,
        });
    }
};

export const checkIsFavorite = async (req, res) => {
    try {
        const ownerAuthUserId = req.user.id;
        const { accountNumber } = req.params;

        const favorite = await Favorite.findOne({
            ownerAuthUserId,
            favoriteAccountNumber: accountNumber,
        });

        res.status(200).json({
            success: true,
            isFavorite: !!favorite,
            data: favorite || null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al verificar el favorito.',
            error: error.message,
        });
    }
};