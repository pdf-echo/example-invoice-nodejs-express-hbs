import express from 'express'
import { engine } from 'express-handlebars'
import { format } from '@formkit/tempo'
import path from 'node:path'
import { fetchPdfEcho } from './services/pdfecho.js'
import { TAX } from './config/consts.js'
import { invoices } from './exampleData.js'

const app = express()

app.engine('hbs', engine({
  defaultLayout: false,
  helpers: {
    sum: (a, b) => a + b,
    multiply: (a, b) => a * b,
    calculateTax: (value) => Math.round(value * (TAX / 100))
  }
}))
app.set('view engine', 'hbs')
app.set('views', path.join('src', 'views'))

app.use((req, res, next) => {
  res.getRenderHTML = (view, options) => new Promise((resolve, reject) => {
    res.render(view, options, (error, html) => {
      if (error) {
        return reject(error)
      }

      return resolve(html)
    })
  })

  next()
})

app.get('/invoices/:id/pdf', async (req, res) => {
  const invoice = invoices.find(({ id }) => id === req.params.id)

  if (invoice === undefined) {
    res.status(404).json({ error: { code: 'invoice_not_found', type: 'invalid_request_error' } })
  }

  const totalAmount = invoice.items.reduce((acc, value) => acc + value.unit_price * value.quantity, 0)

  try {
    const html = await res.getRenderHTML('index', {
      ...invoice,
      tax: TAX,
      total_amount: totalAmount,
      created_at: format({ date: invoice.created_at, tz: 'America/New_York', format: 'DD-MM-YYYY' })
    })

    const request = await fetchPdfEcho('/v1/pdf', {
      method: 'POST',
      body: JSON.stringify({
        source: html,
        filename: `${invoice.id}.pdf`
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await request.arrayBuffer()

    res
      .contentType('application/pdf')
      .send(Buffer.from(data))
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: { code: 'server_internal_error', type: 'api_error' } })
  }
})

export { app }
