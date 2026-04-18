import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from './app.js'

test('GET /health returns healthy payload', async () => {
  const app = createApp()
  const response = await request(app).get('/health')

  assert.equal(response.statusCode, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.status, 'ok')
})
