const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
const router = express.Router();
const NowPaymentsApi = require('@nowpaymentsio/nowpayments-api-js');
const Order = require('../Order');
const Listing = require('../Listing');
router.use(bodyParser.json());
const protectRoute2 = require('../middleware/paymentStatus');
const uprotectRoute = require('../middleware/uprotectRoute');


const JWT_TOKEN = "795a73ae-a48c-4912-985a-35380986e5a6"
const NOWPAYMENTS_API_KEY = "Q0V4Y9B-BVA4XMQ-GCP1SJX-8Y5SY4N"
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

// router.post('/create-payment', async (req, res) => {
//     try {
//         const { price_amount, price_currency, pay_currency, order_id, order_description } = req.body;
//         const payment = await api.createPayment({ price_amount, price_currency, pay_currency, order_id, order_description },); // Indicating a sandbox payment
//         res.json(payment);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// })

router.post('/create-payment',uprotectRoute, async (req, res) => {
 const { userID } = req.userID;
 const {data, shippingAddress, shippingMode, pay_currency} = req.body
 try{
    let totalPrice = 0;
    for(const item of data){
      const order = await Listing.findById(item._id)
      console.log(order)
      if(order)
        totalPrice += order.price * item.quantity;
    else 
    return res.status(400).json({ error: 'Order not found' });

    totalPrice = (totalPrice*1.1) + 9.99; 
    const paymentRequest = {
        price_amount: totalPrice,
        
        price_currency: 'USD',
        pay_currency: pay_currency,
        order_description: 'Payment for order'
    }

    const response = await axios.post('https://api-sandbox.nowpayments.io/v1/payment', paymentRequest, {
        headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
    }); 
        
        const paymentID = response.data.payment_id;

        const newOrder = new Order({
            data: data,
            userID: userID,
            shippingAddress: shippingAddress,
            shippingMode: shippingMode,
            pay_currency: pay_currency,
            paymentID: paymentID,
            price_amount: totalPrice
        });

        await newOrder.save();
        res.json(response.data);

 }
    }
    catch (error){
        console.error(error); 
        res.status(500).json({ error: error.message });
    } 
})

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

router.post('/verifyPayment', async (req, res) => {
    const { payment_id, order_id } = req.body;

    if (!payment_id || !order_id) {
        return res.status(400).json({ error: 'Missing required fields: payment_id or order_id' });
    }

    let paymentCompleted = false;
    const timeout = 600000; // 10 minutes in 
    const checkInterval = 5000; // 5 seconds in milliseconds
    let elapsedTime = 0;

    // Function to check payment status
    const checkPayment = async () => {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api-sandbox.nowpayments.io/v1/payment/${payment_id}`,
            headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
        };

        while (!paymentCompleted && elapsedTime < timeout) {
            try { 
                const response = await axios(config);
                const paymentStatus = response.data.payment_status;
                console.log(paymentStatus);

                if (paymentStatus === 'finished') {
                    paymentCompleted = true;
                    break;
                }
            } catch (error) {
                console.log(error);
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval)); // Wait for the check interval
            elapsedTime += checkInterval;
        }

        if (paymentCompleted) {
            try {
                const updatedOrder = await Order.findOneAndUpdate(
                    { _id: order_id },
                    { escrowStatus: 'completed' },
                    { new: true }
                );

                if (!updatedOrder) {
                    return res.status(404).json({ message: 'Order not found' });
                }

                res.status(200).json(updatedOrder);
            } catch (error) {
                res.status(500).json({ message: 'Error updating order' });
            }
        } else {
            res.status(400).json({ message: 'Payment not completed within the expected time' });
        }
    };

    checkPayment();
});

module.exports = router;

