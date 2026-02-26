import Transaction from './transaction.model.js';
import Account from '../users/user.model.js';
import Product from '../products/product.model.js';


export const createTransfer = async (req, res) => {
    try {
        const { accountNumberFrom, accountNumberTo, amount, description } = req.body;

        // Buscar cuentas por número de cuenta
        const originAccount = await Account.findOne({ accountNumber: accountNumberFrom });
        const destAccount = await Account.findOne({ accountNumber: accountNumberTo });

        if (!originAccount) return res.status(404).json({ success: false, message: 'Cuenta de origen no encontrada' });
        if (!destAccount) return res.status(404).json({ success: false, message: 'Cuenta de destino no encontrada' });

        // Validar que no se transfiera a sí mismo y que haya fondos suficientes
        if (originAccount.id === destAccount.id) {
            return res.status(400).json({ success: false, message: 'No puedes transferirte a ti mismo' });
        }
        if (originAccount.balance < amount) {
            return res.status(400).json({ success: false, message: 'Fondos insuficientes' });
        }

        const transaction = new Transaction({
            accountFrom: originAccount._id,
            accountTo: destAccount._id,
            type: 'TRANSFER',
            amount,
            description: description || 'Transferencia entre usuarios'
        });

        await transaction.save();

        // Actualizar saldos de ambas cuentas
        await Account.findByIdAndUpdate(originAccount._id, { $inc: { balance: -amount } });
        await Account.findByIdAndUpdate(destAccount._id, { $inc: { balance: amount } });

        res.status(201).json({ success: true, message: 'Transferencia exitosa', data: transaction });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en transferencia', error: error.message });
    }
};

export const createPayment = async (req, res) => {
    try {
        const { accountNumberFrom, product, amount } = req.body;

        // Buscar cuenta de origen por número de cuenta
        const originAccount = await Account.findOne({ accountNumber: accountNumberFrom });
        if (!originAccount) return res.status(404).json({ success: false, message: 'Cuenta de origen no encontrada' });

        const productObj = await Product.findById(product);
        if (!productObj) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        if (originAccount.balance < amount) {
            return res.status(400).json({ success: false, message: 'Fondos insuficientes' });
        }

        const transaction = new Transaction({
            accountFrom: originAccount._id,
            type: 'PAYMENT',
            amount,
            product: productObj._id,
            description: `Pago de servicio/producto: ${productObj.name}`
        });

        await transaction.save();

        // Actualizar saldo de la cuenta de origen
        await Account.findByIdAndUpdate(originAccount._id, { $inc: { balance: -amount } });

        res.status(201).json({ success: true, message: 'Pago realizado con éxito', data: transaction });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en pago', error: error.message });
    }
};

export const createDeposit = async (req, res) => {
    try {
        const { accountNumberTo, amount, description } = req.body;

        // Buscar cuenta del banco
        const vaultAccount = await Account.findOne({ accountNumber: '0000000000' });
        if (!vaultAccount) return res.status(500).json({ success: false, message: 'Cuenta del banco no disponible' });

        // Buscar Cuenta Destino por Número
        const destAccount = await Account.findOne({ accountNumber: accountNumberTo });
        if (!destAccount) return res.status(404).json({ success: false, message: 'Cuenta destino no encontrada' });

        const transaction = new Transaction({
            accountFrom: vaultAccount._id,
            accountTo: destAccount._id,
            type: 'DEPOSIT',
            amount,
            description: description || 'Depósito en efectivo'
        });

        await transaction.save();

        // Sumar saldo al usuario
        await Account.findByIdAndUpdate(destAccount._id, { $inc: { balance: amount } });

        res.status(201).json({ success: true, message: 'Depósito realizado', data: transaction });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en depósito', error: error.message });
    }
};
export const editDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount: newAmount } = req.body;

        const transaction = await Transaction.findById(id);
        if (!transaction) return res.status(404).json({ success: false, message: 'Depósito no encontrado' });

        if (transaction.type !== 'DEPOSIT') {
            return res.status(400).json({ success: false, message: 'Solo se pueden editar depósitos' });
        }

        // Obtener cuenta del usuario para validar el nuevo monto y actualizar el saldo
        const userAccount = await Account.findById(transaction.accountTo);

        if (!userAccount) return res.status(404).json({ success: false, message: 'Cuenta del usuario no encontrada' });

        // Calcular diferencia
        const difference = Number(newAmount) - Number(transaction.amount);

        // Validar que el usuario no quede en negativo si se reduce el depósito
        if (difference < 0 && (userAccount.balance + difference) < 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede reducir el depósito: El usuario ya gastó el dinero y quedaría en negativo.'
            });
        }

        // Actualizar saldo del usuario
        userAccount.balance += difference;
        await userAccount.save();

        // Actualizar transacción
        transaction.amount = newAmount;
        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Depósito actualizado exitosamente',
            data: transaction,
            newBalance: userAccount.balance
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar el depósito', error: error.message });
    }
};