const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
const router = express.Router();

router.use(bodyParser.json());

const NOWPAYMENTS_API_KEY = 'Q0V4Y9B-BVA4XMQ-GCP1SJX-8Y5SY4N';
const JWT_TOKEN = "795a73ae-a48c-4912-985a-35380986e5a6"
router.post('/create-payment', async (req, res) => {
    const { price_amount, price_currency, pay_currency } = req.body;

    if (!price_amount || !price_currency || !pay_currency) {
        return res.status(400).json({ error: 'Missing required fields: price_amount, price_currency, pay_currency' });
    }

    try {
        const response = await axios.post('https://api-sandbox.nowpayments.io/v1/payment', {
            price_amount,
            price_currency,
            pay_currency
        }, {
            headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
        });


        res.json(response.data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/payment-status', async (req, res) => {
    const { payment_id } = req.body;
    if (!payment_id) {
        return res.status(400).json({ error: 'Missing required field: payment_id' });
    } try {
        var config = { method: 'get', maxBodyLength: Infinity, url: `https://api-sandbox.nowpayments.io/v1/payment/${payment_id}`, headers: { 'x-api-key': NOWPAYMENTS_API_KEY } };
        axios(config).then(function (response) {
            console.log(JSON.stringify(response.data));
            res.json(response.data);
        }).catch(function (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        });
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            res.status(500).json({ error: error.response.data });
        } else if (error.request) {
            console.log(error.request);
            res.status(500).json({ error: 'No response received from NOWPayments API' });
        } else {
            console.log('Error', error.message);
            res.status(500).json({ error: error.message });
        }
    }
});


router.post('/send-payment', async (req, res) => {
    
    const { amount, currency, payout_address } = req.body;
    if (!amount || !currency || !payout_address) {
        return res.status(400).json({ error: 'Missing required fields: amount, currency, payout_address' });
    } try {
        const response = await axios.post('https://api-sandbox.nowpayments.io/v1/payout', { amount, currency, payout_address, },
            { headers: { 'x-api-key': NOWPAYMENTS_API_KEY, 'Authorization': `Bearer ${JWT_TOKEN}` } });
        const { id, status } = response.data;
        res.json({ id, status }); console.log(response.data);
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            res.status(500).json({ error: error.response.data });
        } else if (error.request) {
            console.log(error.request);
            res.status(500).json({ error: 'No response received from NOWPayments API' });
        } else {
            console.log('Error', error.message);
            res.status(500).json({ error: error.message });
        }
    }
})

module.exports = router;
