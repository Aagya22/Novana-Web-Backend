import { ScheduleModel } from "../../../models/schedule.model";
import { ScheduleRepository } from "../../../repositories/schedule.repository";

describe("ScheduleRepository (unit)", () => {
  const repository = new ScheduleRepository();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("1) createSchedule maps all schedule fields", async () => {
    const createSpy = jest.spyOn(ScheduleModel, "create").mockResolvedValue({ _id: "s1" } as any);

    await repository.createSchedule("u1", {
      title: "Therapy",
      date: "2026-03-10",
      time: "18:30",
      description: "Session",
      location: "Clinic",
    } as any);

    expect(createSpy).toHaveBeenCalledWith({
      userId: "u1",
      title: "Therapy",
      date: "2026-03-10",
      time: "18:30",
      description: "Session",
      location: "Clinic",
    });
  });

  it("2) getSchedulesByUser escapes q regex and trims input", async () => {
    const exec = jest.fn().mockResolvedValue([]);
    const sort = jest.fn().mockReturnValue({ exec });
    const findSpy = jest.spyOn(ScheduleModel, "find").mockReturnValue({ sort } as any);

    await repository.getSchedulesByUser("u1", { q: "  therapy.*(x)  " });

    const filter = findSpy.mock.calls[0][0] as Record<string, any>;
    expect(filter.title.$regex).toBe("therapy\\.\\*\\(x\\)");
    expect(filter.title.$options).toBe("i");
  });

  it("3) deleteScheduleForUser scopes delete by id and user", async () => {
    const deleteSpy = jest.spyOn(ScheduleModel, "findOneAndDelete").mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "s1" }),
    } as any);

    await repository.deleteScheduleForUser("u1", "s1");

    expect(deleteSpy).toHaveBeenCalledWith({ _id: "s1", userId: "u1" });
  });
});
