import PendingAccount from './pendingAccounts.model.js';
import Account from '../accounts/account.model.js';
import fetch from 'node-fetch';
import axios from 'axios';

export const saveRequest = async (req, res) => {
    try {
        const newRequest = new PendingAccount(req.body);
        await newRequest.save();
        res.status(201).json({ success: true, message: 'Solicitud guardada' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const getPendingBankUsers = async (req, res) => {
    try {

        const authResponse = await fetch('http://localhost:5023/api/v1/users/by-role/USER_ROLE', {
            headers: {
                'Authorization': req.headers.authorization
            }
        });

        if (!authResponse.ok) {
            // Agregamos otro log para ver qué nos dice .NET exactamente
            const errorText = await authResponse.text();
            console.log("ERROR DE .NET:", authResponse.status, errorText);

            throw new Error(`Error de .NET: ${authResponse.status}`);
        }

        const authUsers = await authResponse.json();

        const safeAuthUsers = Array.isArray(authUsers) ? authUsers : [];

        const pendingRequests = await PendingAccount.find();

        const existingAccounts = await Account.find({}, 'authAccountId');
        const existingAuthIds = existingAccounts.map(acc => acc.authAccountId);

        const combinedData = pendingRequests.map(request => {
            const baseUser = safeAuthUsers.find(u => u.id === request.authAccountId);

            if (!baseUser || existingAuthIds.includes(request.authAccountId)) {
                return null;
            }

            // Solo si está verificado (Regla de Astra Bank)
            if (baseUser.isEmailVerified) {
                return {
                    id: baseUser.id,
                    name: baseUser.name,
                    surname: baseUser.surname,
                    email: baseUser.email,
                    profilePicture: baseUser.profilePicture,
                    dpi: request.dpi,
                    address: request.address,
                    phone: request.phone,
                    jobType: request.jobType,
                    requestId: request._id
                };
            }
            return null;
        }).filter(item => item !== null);

        return res.status(200).json({
            success: true,
            total: combinedData.length,
            data: combinedData
        });

    } catch (error) {
        console.error("CRITICAL ERROR IN GET:", error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al procesar expedientes',
            error: error.message
        });
    }
};

