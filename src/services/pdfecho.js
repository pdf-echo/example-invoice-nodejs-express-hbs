import { PDFECHO_API_KEY } from '../config/envs.js'

export const fetchPdfEcho = async (pathname, init) => {
  const request = await fetch('https://api.pdfecho.com' + pathname, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Basic ${Buffer.from(PDFECHO_API_KEY + ':').toString('base64')}`,
      'pe-test-mode': 'true'
    }
  })

  if (!request.ok) {
    // TODO: improve error handler
    throw new Error('Error')
  }

  return request
}
