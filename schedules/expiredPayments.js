const cron = require('node-cron');
const paymentRepository = require('../repositories/paymentRepository');

module.exports = () => {
    try {
        console.log('[SCHEDULES] Started');
    
        cron.schedule('*/1 * * * *', async () => {
            const payments = await paymentRepository.findAllPendingPayments();
            const now = moment();
            let paymentsCount = 0;
    
            payments.forEach(async (payment) => {
                const expirationDate = moment(payment.expire_date).subtract(30, 'minutes');
                console.log('Payment date:', expirationDate);
                
                if (now.isAfter(expirationDate)) {
                    await paymentRepository.updateStatus(payment.payment_id, 'cancelled');
                    paymentsCount++;
                }
            });
    
            if (paymentsCount > 0)
                console.log(`[SCHEDULES] ${paymentsCount} expired payments cancelled`);
        });
    } catch (error) {
        console.error(error);
    }
};