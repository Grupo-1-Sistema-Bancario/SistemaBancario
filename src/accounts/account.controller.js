import Account from './account.model.js';
import { getExchangeRates } from '../../utils/currency.service.js';
import PendingAccount from '../pendingAccounts/pendingAccounts.model.js';
import { sendEmail } from '../../helpers/email-service.js';

export const createAccount = async (req, res) => {
    try {
        const { authAccountId, dpi, address, phone, jobName, monthlyIncome } = req.body; 

        if (!authAccountId) {
             return res.status(400).json({
                success: false,
                message: 'Debes proporcionar el ID de la cuenta a la que le vas a crear la cuenta bancaria.'
            });
        }

        if (monthlyIncome < 100) {
            return res.status(400).json({
                success: false,
                message: 'No puedes crear una cuenta con ingresos menores a Q100.'
            });
        }

        //Consultar el rol real a .NET
        // Reenviamos el token del administrador actual para tener permisos
        const roleResponse = await fetch(`http://localhost:5023/api/v1/users/${authAccountId}/roles`, {
            headers: { 'Authorization': req.headers.authorization }
        });

        if (!roleResponse.ok) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo verificar el rol del usuario. Asegúrate de que el authAccountId exista en el AuthService.'
            });
        }

        const rolesArray = await roleResponse.json();
        const finalRole = rolesArray.includes('ADMIN_ROLE') ? 'ADMIN_ROLE' : 'USER_ROLE';

        const generatedAccountNumber = Math.floor(Math.random() * 9000000000) + 1000000000;

        const accountData = {
            authAccountId,
            accountNumber: generatedAccountNumber.toString(),
            dpi,
            address,
            phone,
            jobName,
            monthlyIncome,
            balance: 0,
            role: finalRole // Ahora el rol está sincronizado con .NET
        };

        const newAccount = new Account(accountData);
        await newAccount.save();

        // Cambiar estado de la solicitud pendiente a "APPROVED" si existe
        await PendingAccount.findOneAndUpdate(
            { authAccountId },
            { status: 'APPROVED' },
            { new: true }
            
        );

        const requestClient = await PendingAccount.findOne({ authAccountId });


        if (!requestClient) {
            return res.status(404).json({ success: false, message: "Solicitud no encontrada" });
        }

        console.log("Intentando enviar correo a:", requestClient.email);

        if (!requestClient.email) {
            throw new Error("La solicitud no tiene un correo electrónico válido para enviar la notificación.");
        }

        await sendEmail(requestClient.email, 'APPROVED');


        res.status(201).json({
            success: true,
            message: 'Cuenta bancaria creada exitosamente',
            data: newAccount
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Esta cuenta ya tiene una cuenta bancaria asignada.'
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
        const authId = req.account.id; 
        const account = await Account.findOne({ authAccountId: authId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Perfil bancario no encontrado para esta cuenta',
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

        if (req.account.role === 'ADMIN_ROLE' && currentAccount.role === 'ADMIN_ROLE' && currentAccount.authAccountId !== req.account.id) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: No puedes editar los datos bancarios de otro administrador.'
            });
        }

        if (req.account.role !== 'ADMIN_ROLE' && currentAccount.authAccountId !== req.account.id) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: No tienes permisos para editar la cuenta de otro usuario.',
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
        const authId = req.account.id; 
        const account = await Account.findOne({ authAccountId: authId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Perfil bancario no encontrado para esta cuenta',
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

export const getPendingBankUsers = async (req, res) => {
    try {
        //Obtener todos los usuarios "USER_ROLE" desde el AuthService (.NET)
        //Reenviamos el token JWT del administrador actual para tener permisos
        const authResponse = await fetch('http://localhost:5023/api/v1/users/by-role/USER_ROLE', {
            headers: { 'Authorization': req.headers.authorization }
        });

        if (!authResponse.ok) {
            throw new Error('Error de comunicación con el servicio de autenticación');
        }

        const authUsers = await authResponse.json();

        //Obtener todas las cuentas bancarias registradas en Mongo
        const existingAccounts = await Account.find({}, 'authAccountId');
        const existingAuthIds = existingAccounts.map(acc => acc.authAccountId);

        //Filtrar los usuarios que están verificados pero no existen en Mongo
        const usersWithoutBankAccount = authUsers.filter(user => 
            user.isEmailVerified && !existingAuthIds.includes(user.id)
        );

        res.status(200).json({
            success: true,
            total: usersWithoutBankAccount.length,
            data: usersWithoutBankAccount
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cruzar datos para obtener usuarios pendientes',
            error: error.message
        });
    }
};