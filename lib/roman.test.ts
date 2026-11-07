import { describe, expect, it } from "vitest";
import { toRoman } from "./roman";

describe("toRoman", () => {
  it.each([
    [1, "I"],
    [4, "IV"],
    [9, "IX"],
    [14, "XIV"],
    [40, "XL"],
    [2026, "MMXXVI"],
  ])("%i → %s", (value, expected) => {
    expect(toRoman(value)).toBe(expected);
  });

  it("leaves numbers it can't write as numerals alone", () => {
    expect(toRoman(0)).toBe("0");
    expect(toRoman(2.5)).toBe("2.5");
  });
});
