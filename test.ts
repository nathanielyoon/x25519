import { generate, x25519 } from "@nyoon/x25519";
import { assertEquals } from "@std/assert";

const hex = ($: string) =>
  Uint8Array.from(
    $.match(
      /(?<=(?:^|0x|\W)(?:[\da-f]{2})*)[\da-f]{2}(?=(?:[\da-f]{2})*(?:\W|$))/g,
    ) ?? [],
    ($) => parseInt($, 16),
  );
Deno.test("rfc", () =>
  fetch("https://www.rfc-editor.org/rfc/rfc7748.txt").then(($) => $.text())
    .then(($) => {
      assertEquals(
        generate(hex($.slice(24624, 24688))),
        hex($.slice(24731, 24795)),
      );
      assertEquals(
        generate(hex($.slice(24826, 24890))),
        hex($.slice(24931, 24995)),
      );
      assertEquals(
        x25519(hex($.slice(18645, 18709)), hex($.slice(18866, 18930))),
        hex($.slice(19094, 19158)),
      );
      assertEquals(
        x25519(hex($.slice(19182, 19246)), hex($.slice(19403, 19467))),
        hex($.slice(19630, 19694)),
      );
      assertEquals(
        x25519(hex($.slice(24624, 24688)), hex($.slice(24931, 24995))),
        hex($.slice(25028, 25092)),
      );
      assertEquals(
        x25519(hex($.slice(24826, 24890)), hex($.slice(24731, 24795))),
        hex($.slice(25028, 25092)),
      );
    }));
Deno.test("wycheproof", () =>
  fetch(
    "https://raw.githubusercontent.com/C2SP/wycheproof/9c081e6132063024c84aa6154649deee71e286f5/testvectors_v1/x25519_test.json",
  ).then(($) => $.text()).then(($) =>
    JSON.parse($).testGroups[0].tests.forEach(($: Record<string, string>) => {
      assertEquals(
        x25519(hex($.private), hex($.public)),
        $.shared === "0".repeat(64) ? null : hex($.shared),
      );
    })
  ));
