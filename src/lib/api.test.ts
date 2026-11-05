import { describe, expect, it } from "vitest";
import { endsSessionOn401 } from "./api";

describe("endsSessionOn401", () => {
  it("lets passkey and ticket-exchange failures reach their own UI", () => {
    expect(endsSessionOn401("/auth/passkey/login")).toBe(false);
    expect(endsSessionOn401("/auth/exchange")).toBe(false);
  });
  it("ends the session for every other 401", () => {
    expect(endsSessionOn401("/user/info")).toBe(true);
    expect(endsSessionOn401("/auth/keep-alive")).toBe(true);
    expect(endsSessionOn401("/auth/passkeys")).toBe(true);
  });
});
