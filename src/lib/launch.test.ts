import { describe, expect, it } from "vitest";
import { launchUrl } from "./launch";

describe("launchUrl", () => {
  it("builds the /sso address on an https origin", () => {
    expect(launchUrl("https://pos.example/app", "t1")).toBe("https://pos.example/sso?ticket=t1");
  });
  it("refuses http off loopback and embedded credentials", () => {
    expect(launchUrl("http://pos.example", "t1")).toBeNull();
    expect(launchUrl("https://u:p@pos.example", "t1")).toBeNull();
    expect(launchUrl("http://localhost:3000", "t1")).toBe("http://localhost:3000/sso?ticket=t1");
  });
});
