import { sum } from "./main";
import { describe, expect, test } from "vitest";

describe("sum should work", () => {
  test("2+2", () => {
    expect(sum(2, 2)).toBe(4);
  });
});
