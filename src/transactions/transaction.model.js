'use strict';

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    accountFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'La cuenta de origen es obligatoria']
    },
    accountTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        default: null
    },
    type: {
        type: String,
        enum: ['DEPOSIT', 'TRANSFER', 'PAYMENT'],
        required: [true, 'El tipo de transacción es obligatorio']
    },
    amount: {
        type: Number,
        required: [true, 'El monto es obligatorio'],
        min: [0.01, 'El monto debe ser mayor a cero'],
        max: [2000, 'El monto no puede exceder 2000']
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    description: {
        type: String,
        maxLength: 100
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'REVERSED'],
        default: 'COMPLETED'
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model('Transaction', transactionSchema);