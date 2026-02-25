'use strict';

import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del producto/servicio es obligatorio'],
            unique: [true, 'El nombre debe de ser unico']
        },
        description: {
            type: String,
            required: [true, 'La descripción es obligatoria']
        },
        type: {
            type: String,
            enum: {
                values: ['PRODUCT', 'SERVICE',],
                message: 'Tipo no valido',
            },
            required: [true, 'El tipo es obligatorio'],
            uppercase: true
        },
        price: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

export default mongoose.model('Product', productSchema);