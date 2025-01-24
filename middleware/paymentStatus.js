const axios = require('axios');
const NOWPAYMENTS_API_KEY = "Q0V4Y9B-BVA4XMQ-GCP1SJX-8Y5SY4N";

const protectRoute2 = async (req, res, next) => {
    const { payment_id } = req.body;
    if (!payment_id) {
        return res.status(400).json({ error: 'Missing required field: payment_id' });
    }
    try {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.sandbox.nowpayments.io/v1/payment/${payment_id}`,
            headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
        };
        axios(config).then(function (response) {
            req.data = response.data.payment_status;
            console.log(response.data.payment_status);
            req.paymentID = payment_id;
            next();
        }).catch(function (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        });
    } catch (error) {
        if (error.response) {
            console.log(error);
            res.status(500).json({ error: error.response.data });
        } else if (error.request) {
            console.log(error.request);
            res.status(500).json({ error: 'No response received from NOWPayments API' });
        } else {
            console.log('Error', error.message);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = protectRoute2;
