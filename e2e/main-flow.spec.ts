import { test, expect } from '@playwright/test'
import crypto from 'node:crypto'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

function sha512Hex(input: string) {
  return crypto.createHash('sha512').update(input).digest('hex')
}

test('main flow: register → login → topup → analyze land', async ({ page, request, baseURL }) => {
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()))
  page.on('pageerror', error => console.log('BROWSER ERROR:', error))
  test.setTimeout(120_000)
  const email = `e2e+${Date.now()}@example.com`
  const password = 'password-e2e-123'
  const fullName = 'E2E User'

  await page.goto('/register')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)

  await page.getByTestId('register-fullname').fill(fullName)
  await page.getByTestId('register-email').fill(email)
  await page.getByTestId('register-password').fill(password)
  await page.getByTestId('register-confirm-password').fill(password)
  const terms = page.locator('#terms')
  await terms.check({ force: true })
  await expect(terms).toBeChecked()
  
  try {
    const registerResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/auth/register') && res.request().method() === 'POST',
      { timeout: 20_000 },
    )
    await page.getByTestId('register-submit').click()
    const registerResponse = await registerResponsePromise
    expect(registerResponse.ok()).toBeTruthy()
  } catch (e) {
    console.log('HTML CONTENT:', await page.content())
    throw e
  }

  // Redirect is delayed (setTimeout 1500ms)
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)

  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(password)
  const loginResponsePromise = page.waitForResponse((res) => res.url().includes('/api/auth/login') && res.request().method() === 'POST')
  await page.getByTestId('login-submit').click()
  const loginResponse = await loginResponsePromise
  expect(loginResponse.ok()).toBeTruthy()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })

  // Ensure we have initial tokens (3) from backend wallet creation
  const token = await page.evaluate(() => localStorage.getItem('nyawit_auth_token'))
  expect(token).toBeTruthy()

  const balanceRes1 = await request.get(`${baseURL}/api/v1/billing/balance`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(balanceRes1.ok()).toBeTruthy()
  const balanceJson1 = await balanceRes1.json()
  expect(balanceJson1.data.balance).toBeGreaterThanOrEqual(3)

  // Avoid loading real snap.js behavior by intercepting the script request
  await page.route('**/*snap.js*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.snap = { 
          pay: function(token, options) { 
            console.log('Mock Snap Pay called');
            if (options && options.onSuccess) options.onSuccess({ status_message: 'simulated' });
            if (options && options.onClose) options.onClose();
          } 
        };
      `
    })
  })

  // Go to billing via sidebar
  await page.getByRole('link', { name: /Token & Billing/i }).click()
  await page.waitForTimeout(1000)

  const topupPromise = page.waitForResponse(
    (res) => res.url().includes('/api/v1/billing/topup') && res.request().method() === 'POST'
  )
  await page.getByTestId('billing-buy-package-1').click()
  const topupResponse = await topupPromise
  expect(topupResponse.ok()).toBeTruthy()

  // Locate pending transaction order_id from history API
  const historyRes = await request.get(`${baseURL}/api/v1/billing/history`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(historyRes.ok()).toBeTruthy()
  const historyJson = await historyRes.json()
  const pendingTopup = (historyJson.data as any[]).find((t) => t.type === 'topup' && t.status === 'pending' && t.midtransOrderId)
  expect(pendingTopup).toBeTruthy()

  const orderId = pendingTopup.midtransOrderId as string
  const tokensAdded = Number(pendingTopup.amount)
  const packageCount = Math.max(1, Math.round(tokensAdded / 10))
  const grossAmount = String(packageCount * 50000)

  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'Mid-server-xxxx'
  const signature = sha512Hex(`${orderId}200${grossAmount}${serverKey}`)

  // Fire Midtrans notification to finalize topup in wallet
  const notifRes = await request.post(`${baseURL}/api/v1/billing/notification`, {
    data: {
      order_id: orderId,
      status_code: '200',
      gross_amount: grossAmount,
      signature_key: signature,
      transaction_status: 'settlement',
      fraud_status: 'accept',
    },
  })
  
  if (!notifRes.ok()) {
    const errText = await notifRes.text()
    throw new Error(`NOTIF FAILED ${notifRes.status()}: ${errText}`)
  }
  expect(notifRes.ok()).toBeTruthy()

  // Refresh balance in UI and assert increased
  await page.getByTestId('billing-refresh-balance').click()

  const balanceRes2 = await request.get(`${baseURL}/api/v1/billing/balance`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(balanceRes2.ok()).toBeTruthy()
  const balanceJson2 = await balanceRes2.json()
  expect(balanceJson2.data.balance).toBeGreaterThan(balanceJson1.data.balance)

  // Run analysis (ML mocked in server) and ensure navigation to detail
  await page.getByRole('link', { name: /Analisis Lahan/i }).click()
  await page.waitForTimeout(1000)
  await page.getByTestId('analysis-province').selectOption({ label: 'Riau' })
  await page.getByTestId('analysis-size-hectares').fill('200')
  await page.getByTestId('analysis-submit').click()

  await expect(page).toHaveURL(/\/dashboard\/analysis\/\d+/, { timeout: 200_000 })
  await expect(page.getByText('Detail Analisis Lahan')).toBeVisible()

  // Wait for the map to finish fetching tiles from ArcGIS so it renders in Playwright traces/screenshots
  await page.waitForResponse(res => res.url().includes('arcgisonline.com'), { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(2000)
})

