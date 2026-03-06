import { JournalModel } from "../../../models/journal.model";
import { JournalRepository } from "../../../repositories/journal.repository";

describe("JournalRepository (unit)", () => {
  const repository = new JournalRepository();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("1) createJournal maps payload and converts provided date", async () => {
    const createSpy = jest.spyOn(JournalModel, "create").mockResolvedValue({ _id: "j1" } as any);

    await repository.createJournal("u1", {
      title: "My Day",
      content: "Good",
      date: "2026-03-01T10:00:00.000Z",
    } as any);

    const payload = createSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.userId).toBe("u1");
    expect(payload.title).toBe("My Day");
    expect(payload.date).toBeInstanceOf(Date);
  });

  it("2) getJournalsByUserWithFilters builds escaped title regex", async () => {
    const exec = jest.fn().mockResolvedValue([]);
    const sort = jest.fn().mockReturnValue({ exec });
    const findSpy = jest.spyOn(JournalModel, "find").mockReturnValue({ sort } as any);

    await repository.getJournalsByUserWithFilters("u1", { q: "mood.*(test)" });

    const filter = findSpy.mock.calls[0][0] as Record<string, any>;
    expect(filter.userId).toBe("u1");
    expect(filter.title.$options).toBe("i");
    expect(filter.title.$regex).toBe("mood\\.\\*\\(test\\)");
    expect(sort).toHaveBeenCalledWith({ date: -1, createdAt: -1 });
  });

  it("3) deleteJournalForUser scopes delete by id and user", async () => {
    const deleteSpy = jest.spyOn(JournalModel, "findOneAndDelete").mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "j1" }),
    } as any);

    await repository.deleteJournalForUser("u1", "j1");

    expect(deleteSpy).toHaveBeenCalledWith({ _id: "j1", userId: "u1" });
  });
});
