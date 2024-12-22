const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
const router = express.Router();
const NowPaymentsApi = require('@nowpaymentsio/nowpayments-api-js');
router.use(bodyParser.json());


const JWT_TOKEN = "795a73ae-a48c-4912-985a-35380986e5a6"
const NOWPAYMENTS_API_KEY = "4HE9HCY-1B5MZ8V-KA4TCQ1-BCN4F8R"
const api = new NowPaymentsApi({ apiKey: '4HE9HCY-1B5MZ8V-KA4TCQ1-BCN4F8R' })

// router.post('/create-payment', async (req, res) => {
//     const { price_amount, price_currency, pay_currency } = req.body;

//     if (!price_amount || !price_currency || !pay_currency) {
//         return res.status(400).json({ error: 'Missing required fields: price_amount, price_currency, pay_currency' });
//     }

//     try {
//         const response = await axios.post('https://api-sandbox.nowpayments.io/v1/payment', {
//         }, {
//             headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
//         });
//             price_amount,
//             price_currency,
//             pay_currency


//         res.json(response.data);

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
router.post('/test', async (req, res) => {
    const { currencies } = await api.getCurrencies()
    console.log(currencies)

})

router.post('/create-payment', async (req, res) => {
    try {
        const { price_amount, price_currency, pay_currency, order_id, order_description } = req.body;
        const payment = await api.createPayment({ price_amount, price_currency, pay_currency, order_id, order_description },); // Indicating a sandbox payment
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


router.post('/payment-status', async (req, res) => {
    const { payment_id } = req.body;
    if (!payment_id) {
        return res.status(400).json({ error: 'Missing required field: payment_id' });
    } try {
        var config = { method: 'get', maxBodyLength: Infinity, url: `https://api.nowpayments.io/v1/payment/${payment_id}`, headers: { 'x-api-key': NOWPAYMENTS_API_KEY } };
        axios(config).then(function (response) {
            console.log(JSON.stringify(response.data));
            res.json(response.data);
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
});





router.post('/send-payment', async (req, res) => {

    const { amount, currency, payout_address, payout_id } = req.body;
    if (!amount || !currency || !payout_address) {
        return res.status(400).json({ error: 'Missing required fields: amount, currency, payout_address' });
    } try {
        const response2 = await axios.post('https://api.nowpayments.io/v1/auth', { email: "subhcintak@openmail.pro", password:"Eleph@nT87777" });
        const token = await response2.data.token
        
        const payout = await axios.post('https://api.nowpayments.io/v1/payout', { withdrawals: [{ address: payout_address, amount:amount, currency: currency} ] }, {
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY, 'Authorization': `Bearer ${token}` } }); res.json(payout.data);
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
