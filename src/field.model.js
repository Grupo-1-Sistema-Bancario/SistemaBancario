import mongoose from "mongoose";
 
const accountSchema = mongoose.Schema(
    {
        authUserId: {
            type: String,
            required: [true, 'El ID de autenticación es obligatorio'],
            unique: true // Un usuario de .NET solo puede tener un perfil bancario 
        },
        accountNumber: {
            type: String,
            required: true,
            unique: true
        },
        dpi: {
            type: String,
            required: [true, 'El DPI es requerido'],
            match: [/^[0-9]{13}$/, 'El DPI debe tener exactamente 13 números']
        },
        address: {
            type: String,
            required: [true, 'La dirección es requerida']
        },
        phone: {
            type: String,
            required: [true, 'El celular es requerido']
        },
        jobName: {
            type: String,
            required: [true, 'El nombre del trabajo es requerido']
        },
        monthlyIncome: {
            type: Number,
            required: [true, 'Los ingresos mensuales son requeridos'],
            min: [100, 'Debes ganar al menos Q100 para abrir una cuenta.']
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
);
 
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ authUserId: 1 });
 
export default mongoose.model('Account', accountSchema);