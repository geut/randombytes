// limit of Crypto.getRandomValues()
// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
const MAX_BYTES = 65536

// Node supports requesting up to this number of bytes
// https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
const MAX_UINT32 = 4294967295

const crypto = globalThis.crypto || globalThis.msCrypto
const canUseBuffer = typeof Buffer !== 'undefined' || globalThis.Buffer

export default function randomBytes (size, cb) {
  size = Number(size)

  let err
  if (isNaN(size)) {
    err = new Error('Invalid size')
  } else if (!crypto || !crypto.getRandomValues) {
    err = new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
  } else if (size > MAX_UINT32) {
    err = new RangeError('requested too many random bytes')
  }

  if (err) {
    if (cb) {
      return queueMicrotask(() => {
        cb(err)
      })
    } else {
      throw err
    }
  }

  const bytes = canUseBuffer ? Buffer.allocUnsafe(size) : new Uint8Array(size)

  if (size > 0) { // getRandomValues fails on IE if size == 0
    if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
      // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
      for (let generated = 0; generated < size; generated += MAX_BYTES) {
        crypto.getRandomValues(bytes.subarray(generated, generated + MAX_BYTES))
      }
    } else {
      crypto.getRandomValues(bytes)
    }
  }

  if (cb) {
    return queueMicrotask(() => {
      cb(null, bytes)
    })
  }

  return bytes
}
