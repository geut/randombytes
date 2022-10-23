import { test } from 'uvu'
import * as assert from 'uvu/assert'
import crypto from 'crypto'

const MAX_BYTES = 65536
const MAX_UINT32 = 4294967295

const assertThrow = async (p, ErrorClass) => {
  try {
    await p
    assert.unreachable('should have thrown')
  } catch (err) {
    return err
  }
}

globalThis.crypto = {
  getRandomValues (buf) {
    buf.set(crypto.randomBytes(buf.length))
    return buf
  }
}

test('sync', async () => {
  const { default: randomBytes } = await import('../src/browser.js')
  assert.instance(randomBytes(0), Uint8Array)
  assert.is(randomBytes(0).length, 0, 'len: ' + 0)
  assert.is(randomBytes(3).length, 3, 'len: ' + 3)
  assert.is(randomBytes(30).length, 30, 'len: ' + 30)
  assert.is(randomBytes(300).length, 300, 'len: ' + 300)
  assert.is(randomBytes(17 + MAX_BYTES).length, 17 + MAX_BYTES, 'len: ' + 17 + MAX_BYTES)
  assert.is(randomBytes(MAX_BYTES * 100).length, MAX_BYTES * 100, 'len: ' + MAX_BYTES * 100)
  assert.not.equal(randomBytes(3), new Uint8Array([0, 0, 0]))
  assert.throws(() => randomBytes(MAX_UINT32 + 1))
  assert.throws(() => randomBytes(-1))
  assert.throws(() => randomBytes('hello'))
})

test('async', async () => {
  const { default: randomBytes } = await import('../src/browser.js')

  const randomBytesAsync = (size) => new Promise((resolve, reject) => {
    randomBytes(size, (err, bytes) => {
      if (err) return reject(err)
      resolve(bytes)
    })
  })

  assert.instance(await randomBytes(0), Uint8Array)
  assert.is((await randomBytesAsync(0)).length, 0, 'len: ' + 0)
  assert.is((await randomBytesAsync(3)).length, 3, 'len: ' + 3)
  assert.is((await randomBytesAsync(30)).length, 30, 'len: ' + 30)
  assert.is((await randomBytesAsync(300)).length, 300, 'len: ' + 300)
  assert.is((await randomBytesAsync(17 + MAX_BYTES)).length, 17 + MAX_BYTES, 'len: ' + 17 + MAX_BYTES)
  assert.is((await randomBytesAsync(MAX_BYTES * 100)).length, MAX_BYTES * 100, 'len: ' + MAX_BYTES * 100)
  assert.not.equal(await randomBytesAsync(3), new Uint8Array([0, 0, 0]))

  await assertThrow(randomBytesAsync(MAX_UINT32 + 1))
  await assertThrow(randomBytesAsync(-1))
  await assertThrow(randomBytesAsync('hello'))
})

test.run()
