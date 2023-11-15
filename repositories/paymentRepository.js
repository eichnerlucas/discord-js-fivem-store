const client = require('../index');

module.exports = {
    findById: async (id) => {
        console.log(client.db)
        const payment = await client.db.getPaymentById(id);
        return payment[0]
    },

    updateStatus: async (payment_id, status) => {
        return await client.db.updatePaymentStatus(payment_id, status);
    }
};