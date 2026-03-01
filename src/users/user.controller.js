import Account from './user.model.js';
import { getExchangeRates } from '../../utils/currency.service.js';

export const createAccount = async (req, res) => {
    try {
        const { authUserId, dpi, address, phone, jobName, monthlyIncome } = req.body; 

        if (!authUserId) {
             return res.status(400).json({
                success: false,
                message: 'Debes proporcionar el ID del usuario al que le vas a crear la cuenta.'
            });
        }

        if (monthlyIncome < 100) {
            return res.status(400).json({
                success: false,
                message: 'No puedes crear una cuenta con ingresos menores a Q100.'
            });
        }

        const generatedAccountNumber = Math.floor(Math.random() * 9000000000) + 1000000000;

        const accountData = {
            authUserId, // Este es el ID del cliente de .NET
            accountNumber: generatedAccountNumber.toString(),
            dpi,
            address,
            phone,
            jobName,
            monthlyIncome,
            balance: 0 
        };

        const newAccount = new Account(accountData);
        await newAccount.save();

        res.status(201).json({
            success: true,
            message: 'Cuenta bancaria creada exitosamente',
            data: newAccount
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Este usuario ya tiene una cuenta bancaria asignada.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear la cuenta bancaria',
            error: error.message
        });
    }
};

export const getMyAccount = async (req, res) => {
    try {
        const authId = req.user.id; 
        const account = await Account.findOne({ authUserId: authId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Perfil bancario no encontrado para este usuario',
            });
        }

        res.status(200).json({
            success: true,
            data: account,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la cuenta',
            error: error.message,
        });
    }
};

export const getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.find();
        
        res.status(200).json({
            success: true,
            total: accounts.length,
            data: accounts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas',
            error: error.message
        });
    }
}

export const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { address, phone, jobName, monthlyIncome } = req.body;

        const currentAccount = await Account.findById(id); 
        if (!currentAccount) {
            return res.status(404).json({
                success: false,
                message: "Cuenta bancaria no encontrada.",
            });
        }

        if (req.user.role !== 'ADMIN_ROLE' && currentAccount.authUserId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. No tienes permisos para editar la cuenta de otro usuario.',
            });
        }

        const updateData = {};
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;
        if (jobName) updateData.jobName = jobName;
        if (monthlyIncome) updateData.monthlyIncome = monthlyIncome;
        
        const updatedAccount = await Account.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Datos de la cuenta actualizados exitosamente",
            data: updatedAccount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar la cuenta bancaria",
            error: error.message,
        });
    }
};

export const changeAccountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'desbloqueada' : 'bloqueada'; 

        const account = await Account.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta bancaria no encontrada.',
            });
        }

        res.status(200).json({
            success: true,
            message: `Cuenta bancaria ${action} exitosamente`,
            data: account,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al intentar cambiar el estado de la cuenta',
            error: error.message,
        });
    }
};

export const getMyAccountWithCurrencies = async (req, res) => {
    try {
        const authId = req.user.id; 
        const account = await Account.findOne({ authUserId: authId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Perfil bancario no encontrado para este usuario',
            });
        }

        const rates = await getExchangeRates();
        const balanceUSD = parseFloat((account.balance * (rates.USD || 0)).toFixed(2));
        const balanceEUR = parseFloat((account.balance * (rates.EUR || 0)).toFixed(2));
        const balanceMXN = parseFloat((account.balance * (rates.MXN || 0)).toFixed(2));
        const balanceRUB = parseFloat((account.balance * (rates.RUB || 0)).toFixed(2));
        const balanceJPY = parseFloat((account.balance * (rates.JPY || 0)).toFixed(2));
        const balanceGBP = parseFloat((account.balance * (rates.GBP || 0)).toFixed(2));
        const balanceCHF = parseFloat((account.balance * (rates.CHF || 0)).toFixed(2));
        const balanceCNY = parseFloat((account.balance * (rates.CNY || 0)).toFixed(2));
        const balanceBTC = parseFloat((account.balance * (rates.BTC || 0)).toFixed(2));

        res.status(200).json({
            success: true,
            data: {
                balances: {
                    GTQ: account.balance,
                    USD: balanceUSD,
                    EUR: balanceEUR,
                    MXN: balanceMXN,
                    RUB: balanceRUB,
                    JPY: balanceJPY,
                    GBP: balanceGBP,
                    CHF: balanceCHF,
                    CNY: balanceCNY,
                    BTC: balanceBTC,
                }
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la cuenta con divisas',
            error: error.message,
        });
    }
};