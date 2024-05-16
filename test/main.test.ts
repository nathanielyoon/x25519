import { describe } from "vitest";
import { x25519 } from "../src/main.ts";
import rfc7748 from "./rfc7748.json" with { type: "json" };

describe("rfc", (t) => {
  const h_u = (hex: string) =>
    Uint8Array.from(hex.match(/../g)!, (A) => parseInt(A, 16));
  t("5.2 test 1", ({ expect }) => {
    const a = rfc7748.slice(18300);
    const b =
      /Input scalar.+?(\S{64}).+?Input u-coordinate.+?(\S{64}).+?Output u-coordinate.+?(\S{64})/sg;
    let c: null | RegExpExecArray;
    while (c = b.exec(a)) {
      expect(x25519(h_u(c[1]), h_u(c[2]))).toStrictEqual(h_u(c[3]));
    }
  });
  /*
  ✓ test/main.test.ts (5) 801548ms
   ✓ rfc (3) 800425ms
     ✓ 5.2 test 1
     ✓ 5.2 test 2 800411ms
     ✓ 6.1
  */
  0 && t("5.2 test 2", ({ expect }) => {
    const a = rfc7748.slice(21689);
    const b = /\S{64}/.exec(a)![0];
    const c = h_u(/After one iteration:\s*(\S{64})/.exec(a)![1]);
    const d = h_u(/After 1,000 iterations:\s*(\S{64})/.exec(a)![1]);
    const e = h_u(/After 1,000,000 iterations:\s*(\S{64})/.exec(a)![1]);
    let f = h_u(b), g = h_u(b), z = 0;
    const iterate = (to: number) => {
      let h: Uint8Array | 0;
      do h = x25519(f, g), g = f, f = h || new Uint8Array(); while (++z < to);
    };
    iterate(1);
    expect(f).toStrictEqual(c);
    iterate(1e3);
    expect(f).toStrictEqual(d);
    iterate(1e6);
    expect(f).toStrictEqual(e);
  });
  t("6.1", ({ expect }) => {
    const a = rfc7748.slice(24575);
    const pair = (name: string) =>
      [
        ...RegExp(
          `${name}'s private key, ${
            name[0].toLowerCase()
          }:\\s*(\\S{64})\\s*${name}'s public key, X25519\\(${
            name[0].toLowerCase()
          }, 9\\):\\s*(\\S{64})`,
        ).exec(a)!,
      ].slice(1).map(h_u);
    const b = pair("Alice");
    expect(x25519(b[0])).toStrictEqual(b[1]);
    const c = pair("Bob");
    expect(x25519(c[0])).toStrictEqual(c[1]);
    const d = h_u(/Their shared secret, K:\s*(\S{64})/.exec(a)![1]);
    expect(x25519(b[0], c[1])).toStrictEqual(d);
    expect(x25519(c[0], b[1])).toStrictEqual(d);
  });
});

describe("webcrypto", async (t) => {
  const generate = async () => {
    const a = <CryptoKeyPair> await crypto.subtle.generateKey("X25519", true, [
      "deriveBits",
    ]);
    const b = await crypto.subtle.exportKey("pkcs8", a.privateKey);
    const c = new Uint8Array(b.slice(16));
    const d = new Uint8Array(await crypto.subtle.exportKey("raw", a.publicKey));
    return [{ private: c, public: d }, a] as const;
  };
  type Keys = Awaited<ReturnType<typeof generate>>;
  const Z = 0x100, a = Array<Keys>(Z), b = Array<Keys>(Z);
  t("generate", async ({ expect }) => {
    for (let z = 0; z < Z; ++z) {
      a[z] = await generate();
      expect(x25519(a[z][0].private)).toStrictEqual(a[z][0].public);
      b[z] = await generate();
      expect(x25519(b[z][0].private)).toStrictEqual(b[z][0].public);
    }
  });
  t("derive", async ({ expect }) => {
    const derive = (key_1: CryptoKey, key_2: CryptoKey) =>
      crypto.subtle.deriveBits({ name: "x25519", public: key_2 }, key_1, 256)
        .then((A) => new Uint8Array(A));
    for (let z = 0; z < 0x100; ++z) {
      expect(x25519(a[z][0].private, b[z][0].public)).toStrictEqual(
        await derive(a[z][1].privateKey, b[z][1].publicKey),
      );
      expect(x25519(b[z][0].private, a[z][0].public)).toStrictEqual(
        await derive(b[z][1].privateKey, a[z][1].publicKey),
      );
    }
  });
});
