import mongoose from 'mongoose';

const favoriteSchema = mongoose.Schema(
    {
        ownerAuthUserId: {
            type: String,
            required: [true, 'El ID del usuario propietario es obligatorio'],
        },
        favoriteAccountNumber: {
            type: String,
            required: [true, 'El número de cuenta favorita es obligatorio'],
        },
        alias: {
            type: String,
            trim: true,
            maxlength: [50, 'El alias no puede tener más de 50 caracteres'],
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Un usuario no puede agregar la misma cuenta como favorito dos veces
favoriteSchema.index({ ownerAuthUserId: 1, favoriteAccountNumber: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
