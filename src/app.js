import express from 'express'
import { engine } from 'express-handlebars'
import path from 'node:path'

const app = express()

app.engine('hbs', engine({
  defaultLayout: false,
  helpers: {
    sum: (a, b) => a + b,
    multiply: (a, b) => a * b,
    calculateTax: (tax, totalAmount) => Math.round(totalAmount * (tax / 100))
  }
}))
app.set('view engine', 'hbs')
app.set('views', path.join('src', 'views'))

app.get('/invoice', (req, res) => {
  const MOCKUP_DATA = {
    id: 'inv_cmeyqpbks000008iccyi9fd20',
    customer_name: 'Joe Doe',
    account_no: 'CUST-12312332',
    service_no: 'SRV-123123213',
    items: [
      { name: 'Graphic Design', unit_price: 125, quantity: 2 },
      { name: 'Web Design', unit_price: 150, quantity: 1 },
      { name: 'Branding Design', unit_price: 50, quantity: 1 },
      { name: 'Brochure Design', unit_price: 50, quantity: 1 }
    ],
    created_at: '30-08-2025',
    tax: 7.5
  }

  const totalAmount = MOCKUP_DATA.items.reduce((acc, value) => acc + value.unit_price * value.quantity, 0)

  res.render('invoice', {
    ...MOCKUP_DATA,
    total_amount: totalAmount
  })
})

app.get('/invoice/pdf', async (req, res) => {
  const MOCKUP_DATA = {
    id: 'inv_cmeyqpbks000008iccyi9fd20',
    customer_name: 'Joe Doe',
    account_no: 'CUST-12312332',
    service_no: 'SRV-123123213',
    items: [
      { name: 'Graphic Design', unit_price: 125, quantity: 2 },
      { name: 'Web Design', unit_price: 150, quantity: 1 },
      { name: 'Branding Design', unit_price: 50, quantity: 1 },
      { name: 'Brochure Design', unit_price: 50, quantity: 1 }
    ],
    created_at: '30-08-2025',
    tax: 7.5
  }

  const totalAmount = MOCKUP_DATA.items.reduce((acc, value) => acc + value.unit_price * value.quantity, 0)

  res.render(
    'invoice',
    {
      ...MOCKUP_DATA,
      total_amount: totalAmount
    },
    async (error, html) => {
      if (error !== undefined) {
        res.status(400).json({ error: { type: 'invalid_request_error', code: 'invalid_html' } })
        return
      }

      try {
        const request = await fetch('https://api.pdfecho.com/v1/pdf', {
          method: 'POST',
          body: JSON.stringify({ source: html }),
          headers: {
            Authorization: `Basic ${Buffer.from('YOUR_API_KEY:').toString('base64')}`,
            'pe-test-mode': 'true',
            'Content-Type': 'application/json'
          }
        })

        const data = await request.arrayBuffer()

        res
          .contentType('application/pdf')
          .send(Buffer.from(data))
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: { type: 'api_error', code: 'server_internal_error' } })
      }
    }
  )
})

export { app }
