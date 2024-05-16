# x25519

```ts
import { x25519 } from "@nyoon/x25519";

const secret_1 = crypto.getRandomValues(new Uint8Array(32));
const public_1 = x25519(secret_1);
const secret_2 = crypto.getRandomValues(new Uint8Array(32));
const public_2 = x25519(secret_2);

x25519(secret_1, public_2).join() === x25519(secret_2, public_1).join(); // true
```
