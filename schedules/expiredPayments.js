const cron = require('node-cron');
const moment = require('moment');
const paymentRepository = require('../repositories/paymentRepository');

module.exports = () => {
    {
        try {
            console.log('[SCHEDULES] Expired payments schedule started');
        
            cron.schedule('*/1 * * * *', async () => {
                const payments = await paymentRepository.findAllPendingPayments();
                const now = moment();
                var paymentsCount = 0;
        
                await payments.forEach(async (payment) => {
                    if (! payment.expire_date) return;

                    const expirationDate = moment(payment.expire_date);
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
}