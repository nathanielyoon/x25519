const P = (1n << 255n) - 19n;
const s = (base: bigint, power: number, multiplier = base) => {
  do base = base * base % P; while (--power);
  return base * multiplier % P;
};
const ladder = (scalar: bigint, point: bigint) => {
  scalar = scalar & ~7n & ~(1n << 255n) | 1n << 254n, point &= ~(1n << 255n);
  let a = 1n, b = 0n, c = point, d = 1n, e = 0n, f, g, z = 254n;
  do e ^= f = scalar >> z & 1n,
    a ^= g = (a ^ c) & -e,
    c ^= g,
    d ^= g = (b ^ d) & -e,
    a -= b ^= g,
    e = f,
    b += a + b,
    f = b * (c - d) % P,
    g = a * (c + d) % P,
    c = (f + g) ** 2n % P,
    d = (f - g) ** 2n % P * point % P,
    a = a * a % P,
    g = b * b % P,
    f = g - a,
    a = a * g % P,
    b = f * (f * 121665n % P + g) % P; while (z--);
  a ^= (a ^ c) & -e, b ^= (b ^ d) & -e;
  d = b ** 3n % P, f = s(d ** 10n * b % P, 5), g = s(s(s(f, 10), 20), 40);
  a = s(s(s(s(g, 80), 80, g), 10, f) ** 4n % P * b % P, 3, a) * d % P + P;
  a = a % P & ~(1n << 255n), f = new Uint8Array(32), g = new DataView(f.buffer);
  g.setBigUint64(24, a >> 192n, true), g.setBigUint64(16, a >> 128n, true);
  return g.setBigUint64(8, a >> 64n, true), g.setBigUint64(0, a, true), f;
};
const b_i = ($: Uint8Array) => {
  const a = new DataView($.buffer, $.byteOffset);
  return a.getBigUint64(0, true) | a.getBigUint64(8, true) << 64n |
    a.getBigUint64(16, true) << 128n | a.getBigUint64(24, true) << 192n;
};
/** Derives a 32-byte public key from a 32-byte secret key. */
export const generate = (secret_key: Uint8Array): Uint8Array =>
  ladder(b_i(secret_key), 9n);
/** Creates a shared secret, excluding the all-zero value. */
export const x25519 = (
  secret_key: Uint8Array,
  public_key: Uint8Array,
): Uint8Array | null => {
  const a = ladder(b_i(secret_key), b_i(public_key));
  let z = 32, b = 0;
  do b |= a[--z]; while (z);
  return b ? a : null;
};
