import { describe, it, expect } from "vitest";
import { store } from "./store";
import { STATUSES } from "./types";

const keys = STATUSES.map((s) => s.key);

describe("IssueStore", () => {
  it("seeds cases with valid statuses only", () => {
    for (const i of store.list()) expect(keys).toContain(i.status);
  });

  it("creates in backlog by default with next order", () => {
    const a = store.create({ title: "a" });
    const b = store.create({ title: "b" });
    expect(a.status).toBe("backlog");
    expect(b.order).toBe(a.order + 1);
  });

  it("moving status appends to end of target column", () => {
    const c = store.create({ title: "c" });
    const moved = store.update(c.id, { status: "done" })!;
    const doneOrders = store.list().filter((i) => i.status === "done" && i.id !== c.id).map((i) => i.order);
    expect(moved.order).toBeGreaterThan(Math.max(...doneOrders));
  });

  it("reorders a column", () => {
    const x = store.create({ title: "x", status: "todo" });
    const y = store.create({ title: "y", status: "todo" });
    const res = store.reorder("todo", [y.id, x.id]);
    expect(res.filter((i) => [x.id, y.id].includes(i.id)).map((i) => i.id)).toEqual([y.id, x.id]);
    expect(y.order).toBeLessThan(x.order);
  });

  it("update/delete of unknown id", () => {
    expect(store.update("nope", { title: "t" })).toBeUndefined();
    expect(store.delete("nope")).toBe(false);
  });
});
