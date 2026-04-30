import { test } from '@playwright/test'
import crypto from 'node:crypto'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

test('mock notif', async ({ request }) => {
    const orderId = 'abc'
    const grossAmount = '50000'
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'Mid-server-xxxx'
    const signature = crypto.createHash('sha512').update(`${orderId}200${grossAmount}${serverKey}`).digest('hex')

    const res = await request.post('http://localhost:3000/api/v1/billing/notification', {
        data: {
            order_id: orderId,
            status_code: '200',
            gross_amount: grossAmount,
            signature_key: signature,
            transaction_status: 'settlement',
            fraud_status: 'accept',
        },
    })
    console.log(res.status(), await res.text())
})