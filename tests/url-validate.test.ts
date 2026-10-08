import { describe, it, expect } from "vitest";
import { validateUrl } from "../lib/url-validate";

describe("url validation (SSRF guard)", () => {
  it("accepts public https model-directory URLs", () => {
    expect(validateUrl("https://models.dev").ok).toBe(true);
    expect(validateUrl("https://platform.openai.com/docs/models").ok).toBe(true);
    expect(validateUrl("https://docs.anthropic.com/en/docs/about-claude/models").ok).toBe(true);
  });
  it("blocks localhost / loopback", () => {
    expect(validateUrl("http://localhost:3000/x").ok).toBe(false);
    expect(validateUrl("http://127.0.0.1/").ok).toBe(false);
    expect(validateUrl("http://[::1]/").ok).toBe(false);
  });
  it("blocks private ranges + metadata + internal suffixes", () => {
    expect(validateUrl("http://10.0.0.5/").ok).toBe(false);
    expect(validateUrl("http://192.168.1.1/").ok).toBe(false);
    expect(validateUrl("http://172.20.4.1/").ok).toBe(false);
    expect(validateUrl("http://169.254.169.254/latest/meta-data/").ok).toBe(false);
    expect(validateUrl("http://svc.internal/models").ok).toBe(false);
  });
  it("blocks non-http(s) and credentialed URLs", () => {
    expect(validateUrl("file:///etc/passwd").ok).toBe(false);
    expect(validateUrl("data:text/plain,hi").ok).toBe(false);
    expect(validateUrl("https://user:pass@example.com/").ok).toBe(false);
  });
});
