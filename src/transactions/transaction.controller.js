import Transaction from './transaction.model.js';
import Account from '../accounts/account.model.js';
import Product from '../products/product.model.js';


export const createTransfer = async (req, res) => {
    try {
        const { accountNumberFrom, accountNumberTo, amount, description } = req.body;

        const originAccount = await Account.findOne({ accountNumber: accountNumberFrom });
        const destAccount = await Account.findOne({ accountNumber: accountNumberTo });

        if (!originAccount) return res.status(404).json({ success: false, message: 'Cuenta de origen no encontrada' });
        if (!destAccount) return res.status(404).json({ success: false, message: 'Cuenta de destino no encontrada' });

        if (originAccount.id === destAccount.id) {
            return res.status(400).json({ success: false, message: 'No puedes transferirte a ti mismo' });
        }
        if (originAccount.balance < amount) {
            return res.status(400).json({ success: false, message: 'Fondos insuficientes' });
        }

        // --- LÓGICA DE LÍMITE DIARIO (Q10,000) ---
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayTransfers = await Transaction.aggregate([
            {
                $match: {
                    accountFrom: originAccount._id,
                    type: 'TRANSFER',
                    createdAt: { $gte: startOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const totalTransferredToday = todayTransfers.length > 0 ? todayTransfers[0].total : 0;

        if (totalTransferredToday + amount > 10000) {
            return res.status(400).json({
                success: false,
                message: `Límite diario excedido. Has transferido Q${totalTransferredToday} hoy. Tu límite restante es Q${10000 - totalTransferredToday}.`
            });
        }

        const transaction = new Transaction({
            accountFrom: originAccount._id,
            accountTo: destAccount._id,
            type: 'TRANSFER',
            amount,
            description: description || 'Transferencia entre usuarios'
        });

        await transaction.save();

        await Account.findByIdAndUpdate(originAccount._id, { $inc: { balance: -amount } });
        await Account.findByIdAndUpdate(destAccount._id, { $inc: { balance: amount } });

        res.status(201).json({ success: true, message: 'Transferencia exitosa', data: transaction });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en transferencia', error: error.message });
    }
};

export const createPayment = async (req, res) => {
    try {
        const { accountNumberFrom, product } = req.body;

        // Buscar cuenta de origen por número de cuenta
        const originAccount = await Account.findOne({ accountNumber: accountNumberFrom });
        if (!originAccount) return res.status(404).json({ success: false, message: 'Cuenta de origen no encontrada' });

        const productObj = await Product.findById(product);
        if (!productObj) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        const amount = productObj.price;

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

        // Obtener cuenta para validar el nuevo monto y actualizar el saldo
        const accountToUpdate = await Account.findById(transaction.accountTo);

        if (!accountToUpdate) return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });

        // Calcular diferencia
        const difference = Number(newAmount) - Number(transaction.amount);

        if (difference < 0 && (accountToUpdate.balance + difference) < 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede reducir el depósito: la cuenta ya gastó el dinero y quedaría en negativo.'
            });
        }

        accountToUpdate.balance += difference;
        await accountToUpdate.save();

        // Actualizar transacción
        transaction.amount = newAmount;
        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Depósito actualizado exitosamente',
            data: transaction,
            newBalance: accountToUpdate.balance
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar el depósito', error: error.message });
    }
};

export const reverseDeposit = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Depósito no encontrado' });
        }

        if (transaction.type !== 'DEPOSIT') {
            return res.status(400).json({ success: false, message: 'Esta operación solo es válida para depósitos' });
        }
        if (transaction.status === 'REVERSED') {
            return res.status(400).json({ success: false, message: 'Este depósito ya fue revertido previamente' });
        }

        const now = new Date();
        const createdAt = new Date(transaction.createdAt);
        const diff = now - createdAt;

        if (diff > 60000) {
            return res.status(400).json({
                success: false,
                message: 'El tiempo límite para revertir (1 minuto) ha expirado'
            });
        }

        const accountToUpdate = await Account.findById(transaction.accountTo);
        if (!accountToUpdate) {
            return res.status(404).json({ success: false, message: 'La cuenta asociada al depósito no existe' });
        }

        if (accountToUpdate.balance < transaction.amount) {
            return res.status(400).json({
                success: false,
                message: 'No se puede revertir: la cuenta ya no tiene saldo suficiente'
            });
        }

        accountToUpdate.balance -= transaction.amount;
        await accountToUpdate.save();

        transaction.status = 'REVERSED';
        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Depósito revertido correctamente',
            data: {
                transactionId: transaction._id,
                newBalance: accountToUpdate.balance
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al procesar la reversión',
            error: error.message
        });
    }
};

export const getTopAccounts = async (req, res) => {
    try {
        //Usamoe el aggregation para poder obtener las cuentas con más moviemiento de manera personalizada.
        const topAccounts = await Transaction.aggregate([
            {
                $group: {
                    _id: "$accountTo",
                    totalMovements: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            },
            { $match: { _id: { $ne: null } } },
            { $sort: { totalMovements: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "accounts",
                    localField: "_id",
                    foreignField: "_id",
                    as: "accountDetails"
                }
            },
            { $unwind: "$accountDetails" },
            {
                $project: {
                    _id: 0,
                    accountId: "$_id",
                    totalMovements: 1,
                    accountNumber: "$accountDetails.accountNumber",
                    ownerName: "$accountDetails.name",
                    balance: "$accountDetails.balance"
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Top 10 cuentas con más movimientos obtenido',
            data: topAccounts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el top de cuentas',
            error: error.message
        });
    }
};

export const getLastFiveMovementsByAccount = async (req, res) => {
    try {
        const { accountId } = req.params;

        const account = await Account.findById(accountId);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        const lastTransactions = await Transaction.find({
            $or: [
                { accountFrom: account._id },
                { accountTo: account._id }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            total: lastTransactions.length,
            data: lastTransactions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los movimientos',
            error: error.message
        });
    }
};

export const getMyTransactionHistory = async (req, res) => {
    try {
        const authId = req.account.id;
        
        const account = await Account.findOne({ authAccountId: authId });
        
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró una cuenta bancaria asociada a tu perfil.'
            });
        }

        const history = await Transaction.find({
            $or: [
                { accountFrom: account._id },
                { accountTo: account._id }
            ]
        })
        .sort({ createdAt: -1 }) // Orden descendente (más recientes primero)
        .populate('accountFrom', 'accountNumber') 
        .populate('accountTo', 'accountNumber')
        .populate('product', 'name'); // Trae el nombre del producto si fue un pago

        res.status(200).json({
            success: true,
            total: history.length,
            data: history
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de transacciones',
            error: error.message
        });
    }
};