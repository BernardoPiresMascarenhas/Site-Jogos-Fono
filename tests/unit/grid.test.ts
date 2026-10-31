import { describe, expect, it } from "vitest";
import { computeFitGrid } from "@/games/shared/use-fit-grid";

describe("grade adaptativa", () => {
  it("6 opções viram 3×2 na paisagem e 2×3 no retrato", () => {
    expect(computeFitGrid(6, 1200, 600, 1, 16).cols).toBe(3);
    expect(computeFitGrid(6, 360, 640, 1, 16).cols).toBe(2);
  });
  it("nunca deixa uma linha órfã quando há grade completa", () => {
    for (const n of [4, 6, 8, 12]) {
      for (const [w, h] of [[1366, 700], [820, 1000], [390, 650], [1000, 400]]) {
        const g = computeFitGrid(n, w, h, 1, 12);
        expect(n % g.cols, `${n} em ${w}x${h}`).toBe(0);
      }
    }
  });
});
