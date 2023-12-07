const cron = require('node-cron');
const moment = require('moment');
const paymentRepository = require('../repositories/paymentRepository');
const PaymentStatus = require("../utils/paymentStatus");


async function handleExpiredPayments() {
    const payments = await paymentRepository.findAllPixPaymentsPending();
    const now = moment();
    let paymentsCount = 0;

    payments.forEach((payment) => {
        if (!payment.expire_date) return;

        const expirationDate = moment(payment.expire_date);
        if (now.isAfter(expirationDate)) {
            paymentRepository.updateStatus(payment.payment_id, PaymentStatus.Pending);
            paymentsCount++;
        }
    });

    return paymentsCount;
}

module.exports = () => {
    try {
        console.log('[SCHEDULES] Expired payments schedule started');
        cron.schedule('*/30 * * * *', async () => {
            const paymentsCount = await handleExpiredPayments();
            if (paymentsCount > 0) {
                console.log(`[SCHEDULES] ${paymentsCount} expired payments cancelled`);
            }
        });
    } catch (error) {
        console.error(error);
    }
}