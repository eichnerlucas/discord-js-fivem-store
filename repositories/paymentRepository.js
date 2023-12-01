module.exports = {
    findById: async (id) => {
        const client = require('../index');

        const payment = await client.db.getPaymentById(id);
        return payment
    },

    findAllPendingPayments: async () => {
        const client = require('../index');

        const payments = await client.db.getAllPaymentsPending();
        return payments
    },

    updateStatus: async (payment_id, status) => {
        const client = require('../index');
        console.log(payment_id)
        return await client.db.updatePaymentStatus(payment_id, status);
    },

    updateStatusByExternalRef: async(external_ref, status) => {
        const client = require('../index');

        return await client.db.updatePaymentStatusByExternalRef(external_ref, status);
    }
};