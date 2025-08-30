import { app } from './app.js'

const PORT = 4000

app.listen(PORT, '0.0.0.0', (error) => {
  if (error !== undefined) {
    console.log(error)
    return
  }

  console.log(`SV ON PORT: ${PORT}`)
})