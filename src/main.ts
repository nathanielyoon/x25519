const P = (1n << 255n) - 19n, F = ~(1n << 255n), a24 = 121665n;
const x = (base_1: bigint, base_2 = base_1) => base_1 * base_2 % P;
const o = (condition: bigint, one: bigint, two: bigint) =>
  -condition & (one ^ two);
const t = (base: bigint, power: bigint) => {
  do base = x(base); while (--power);
  return base;
};
const l = (k: bigint, u: bigint) => {
  let a = 1n, b = 0n, c = u &= F, d = 1n, e = 0n, f, g, z = 254n;
  k = k & ~7n & F | a << z;
  do {
    a ^= f = o(g = e ^ (e = k >> z & 1n), a, c), b ^= g = o(g, b, d), c ^= f;
    d = x(u, x((g = x(c - (d ^= g), f = a + b)) - (c = x(c + d, b = a - b))));
    c = x(g + c), a = x(g = x(f), b = x(b)), b = x(b = g - b, g + x(b, a24));
  } while (z--);
  f = x(f = x(b, t(x(t(d = x(b ^= o(e, b, d), x(b)), 2n), d), 1n)), t(f, 5n));
  g = x(g = x(g = x(f, t(f, 10n)), t(g, 20n)), t(g, 40n));
  g = x(d, t(x(b, t(x(f, t(x(t(x(g, t(g, 80n)), 80n), g), 10n)), 2n)), 3n));
  return (x(a ^ o(e, a, c), g) + P) % P & F;
};
const i = (bytes: Uint8Array) => {
  let a = 0n, z = 0, y = 0n;
  do a |= BigInt(bytes[z] ?? 0) << y; while (y += 8n, ++z < 32);
  return a;
};
export const x25519 = (key_1: Uint8Array, key_2?: Uint8Array) => {
  let a = new Uint8Array(32), b, c = 0, z = 0;
  if (key_2) a.set(key_2.subarray(0, 32)), b = i(a);
  a.set(key_1.subarray(0, 32)), b = l(i(a), b ?? 9n);
  do c |= a[z] = Number(b & 255n); while (b >>= 8n, ++z < 32);
  return c && a;
};
