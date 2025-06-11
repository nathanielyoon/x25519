# x25519

Exchange keys over curve25519 ([RFC 7748](https://rfc-editor.org/rfc/rfc7748)).

```ts
import { generate, x25519 } from "@nyoon/x25519";
import { assertEquals } from "@std/assert@^1.0.13";

const key_1 = crypto.getRandomValues(new Uint8Array(32));
const key_2 = crypto.getRandomValues(new Uint8Array(32));

assertEquals(x25519(key_1, generate(key_2)), x25519(key_2, generate(key_1)));
assertEquals(
  x25519(crypto.getRandomValues(new Uint8Array(32)), new Uint8Array(32)),
  null,
);
```
