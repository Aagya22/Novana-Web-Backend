import { ReminderRepository } from "../../../repositories/reminder.repository";
import { ReminderModel } from "../../../models/reminder.model";

describe("ReminderRepository (unit)", () => {
  const repository = new ReminderRepository();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("1) createReminder normalizes 12-hour time and applies defaults", async () => {
    const createSpy = jest.spyOn(ReminderModel, "create").mockResolvedValue({ _id: "r1" } as any);

    await repository.createReminder("u1", { title: "Hydrate", time: "7:05 AM" } as any);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        title: "Hydrate",
        time: "07:05",
        type: "journal",
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        enabled: true,
        recurring: true,
        scheduleUpdatedAt: expect.any(Date),
      })
    );
  });

  it("2) updateReminder normalizes time and sets scheduleUpdatedAt", async () => {
    const updateSpy = jest.spyOn(ReminderModel, "findByIdAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "r1" }),
    } as any);

    await repository.updateReminder("r1", { time: "7:05 pm" } as any);

    expect(updateSpy).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({ time: "19:05", scheduleUpdatedAt: expect.any(Date) }),
      { new: true }
    );
  });

  it("3) getRemindersByUser queries by user and sorts by time asc", async () => {
    const exec = jest.fn().mockResolvedValue([{ _id: "r1" }]);
    const sort = jest.fn().mockReturnValue({ exec });
    const findSpy = jest.spyOn(ReminderModel, "find").mockReturnValue({ sort } as any);

    const result = await repository.getRemindersByUser("u1");

    expect(findSpy).toHaveBeenCalledWith({ userId: "u1" });
    expect(sort).toHaveBeenCalledWith({ time: 1 });
    expect(result).toEqual([{ _id: "r1" }]);
  });

});
