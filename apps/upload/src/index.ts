import { init as CUID2 } from '@paralleldrive/cuid2'
import { Hono } from 'hono'
import { AwsClient } from 'aws4fetch'

/**
 * Upload service. Serves the drag-drop UI (static assets in ./public) and one
 * API endpoint that presigns an R2 PUT URL.
 *
 * The R2 presigning + key + URL logic is verbatim from sharath.boi.gg's
 * `src/lib/s3` and `src/server/rpcs/owner` — same aws4fetch AwsClient config,
 * same `YYYYM-<cuid2(5)>.<ext>` key, same `new URL(key, CDN_BASE_URL)` result.
 * The only delta is transport: the browser PUTs directly to R2 instead of the
 * server proxying via S3.put, so we stay robust at the 100MB ceiling.
 *
 * No auth here — access control is handled by an upstream proxy layer.
 */

const createId = () => CUID2({ length: 5 })()
const MAX_SIZE = 100 * 1024 * 1024

interface Env {
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_ACCOUNT_ID: string
  R2_BUCKET_NAME: string
  CDN_BASE_URL: string
}

const app = new Hono<{ Bindings: Env }>()

app.post('/api/presign', async (c) => {
  const {
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_ACCOUNT_ID,
    R2_BUCKET_NAME,
    CDN_BASE_URL,
  } = c.env

  let filename: unknown
  let size: unknown
  try {
    const body = await c.req.json()
    filename = body.filename
    size = body.size
  } catch {
    return c.json({ error: 'Invalid request body' }, 400)
  }

  if (typeof filename !== 'string' || typeof size !== 'number') {
    return c.json({ error: 'filename (string) and size (number) are required' }, 400)
  }
  if (size <= 0) {
    return c.json({ error: 'File is empty' }, 400)
  }
  if (size > MAX_SIZE) {
    return c.json({ error: 'File exceeds the 100MB limit' }, 413)
  }

  // Same key format as sharath.boi.gg: `YYYYM-<cuid2>.<ext>`
  const ext = filename.split('.').pop() ?? 'unknown'
  const today = new Date()
  const key =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString() +
    `-${createId()}.${ext}`

  // Same presigning as sharath.boi.gg's S3.presignedPut.
  const r2Url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}`
  const client = new AwsClient({
    accessKeyId: R2_ACCESS_KEY_ID,
    region: 'auto',
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    service: 's3',
  })
  const signed = await client.sign(
    new Request(`${r2Url}/${key}?X-Amz-Expires=3600`, { method: 'PUT' }),
    { aws: { signQuery: true } },
  )

  return c.json({
    uploadUrl: signed.url,
    publicUrl: new URL(key, CDN_BASE_URL).toString(),
  })
})

export default app
