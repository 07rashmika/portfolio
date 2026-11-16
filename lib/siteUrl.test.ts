import { describe, expect, it } from "vitest";
import { siteUrl } from "./siteUrl";

describe("siteUrl", () => {
  it("prefers an explicitly configured address", () => {
    const url = siteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.dev", VERCEL_PROJECT_PRODUCTION_URL: "me.vercel.app" });
    expect(url.href).toBe("https://example.dev/");
  });

  it("uses the Vercel production domain, which comes without a protocol", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "me.vercel.app" }).href).toBe("https://me.vercel.app/");
  });

  it("ignores blank values", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "  ", VERCEL_PROJECT_PRODUCTION_URL: "me.vercel.app" }).host).toBe("me.vercel.app");
  });

  it("falls back to the local dev server", () => {
    expect(siteUrl({}).href).toBe("http://localhost:3000/");
  });
});
