import Account from '../src/accounts/account.model.js';
// Seeder para crear por defecti una cuenta para el banco

export const seedBankAccount = async () => {
    try {
        const existingAccount = await Account.findOne({ accountNumber: '0000000000' });

        if (existingAccount) {
            console.log('Cuenta del banco ya existe... Saltando seeder.');
            return;
        }
        const bankAccount = new Account({
            authAccountId: 'BANK_ACCOUNT',
            accountNumber: '0000000000',
            dpi: '0000000000000',
            address: 'Fundación Kinal, Ciudad de Guatemala',
            phone: '00000000',
            jobName: 'Sistema Bancario',
            monthlyIncome: 999999999,
            balance: 999999999,
            isActive: true
        });

        await bankAccount.save();
        console.log('Cuenta del banco creada exitosamente');
    } catch (error) {
        console.error('Error al crear la cuenta del banco:', error);
    }
};