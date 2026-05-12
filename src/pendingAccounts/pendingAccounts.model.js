'use strict';

import mongoose from "mongoose";

const pendingAccountSchema = mongoose.Schema(
    {
        authAccountId: {
            type: String,
            required: true,
            unique: true
        },
        dpi: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/.+@.+\..+/, 'El correo electrónico debe ser válido']
        },
        jobType: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        monthlyIncome: {
            type: Number,
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

export default mongoose.model('PendingAccount', pendingAccountSchema);