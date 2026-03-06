import mongoose from "mongoose";
import { MoodModel } from "../../../models/mood.model";
import { MoodRepository } from "../../../repositories/mood.repository";

describe("MoodRepository (unit)", () => {
  const repository = new MoodRepository();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("1) getMoodForUserByDateRange scopes query and sorts latest first", async () => {
    const exec = jest.fn().mockResolvedValue({ _id: "m1" });
    const sort = jest.fn().mockReturnValue({ exec });
    const findOneSpy = jest.spyOn(MoodModel, "findOne").mockReturnValue({ sort } as any);

    const start = new Date("2026-03-01T00:00:00.000Z");
    const end = new Date("2026-03-02T00:00:00.000Z");
    const result = await repository.getMoodForUserByDateRange("u1", start, end);

    expect(findOneSpy).toHaveBeenCalledWith({ userId: "u1", date: { $gte: start, $lt: end } });
    expect(sort).toHaveBeenCalledWith({ date: -1 });
    expect(result).toEqual({ _id: "m1" });
  });

  it("2) getRecentMoodsByUser applies sort, limit, and select projection", async () => {
    const exec = jest.fn().mockResolvedValue([]);
    const select = jest.fn().mockReturnValue({ exec });
    const limit = jest.fn().mockReturnValue({ select });
    const sort = jest.fn().mockReturnValue({ limit });
    const findSpy = jest.spyOn(MoodModel, "find").mockReturnValue({ sort } as any);

    await repository.getRecentMoodsByUser("u1", 123);

    expect(findSpy).toHaveBeenCalledWith({ userId: "u1" });
    expect(sort).toHaveBeenCalledWith({ date: -1 });
    expect(limit).toHaveBeenCalledWith(123);
    expect(select).toHaveBeenCalledWith({ mood: 1, moodType: 1, note: 1, date: 1, createdAt: 1, updatedAt: 1 });
  });

  it("3) updateMoodForUser only includes explicitly defined fields", async () => {
    const updateSpy = jest.spyOn(MoodModel, "findOneAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "m1" }),
    } as any);

    await repository.updateMoodForUser("u1", "m1", {
      mood: 9,
      note: "better",
      moodType: undefined,
      dayKey: "2026-03-01",
    } as any);

    expect(updateSpy).toHaveBeenCalledWith(
      { _id: "m1", userId: "u1" },
      { mood: 9, note: "better", dayKey: "2026-03-01" },
      { new: true, runValidators: true }
    );
  });

  it("4) getMoodAnalytics transforms overTime and rounds weekly averages", async () => {
    const overTimeRows = [
      { date: new Date("2026-03-01T00:00:00.000Z"), mood: 6 },
      { date: new Date("2026-03-02T00:00:00.000Z"), mood: 8 },
    ];

    const exec = jest.fn().mockResolvedValue(overTimeRows);
    const lean = jest.fn().mockReturnValue({ exec });
    const select = jest.fn().mockReturnValue({ lean });
    const sort = jest.fn().mockReturnValue({ select });
    const findSpy = jest.spyOn(MoodModel, "find").mockReturnValue({ sort } as any);

    const aggregateSpy = jest.spyOn(MoodModel, "aggregate").mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { isoWeekYear: 2026, isoWeek: 9, averageMood: 7.3333 },
        { isoWeekYear: 2026, isoWeek: 10, averageMood: 8 },
      ]),
    } as any);

    const userId = "65f0dbf6f4f2d28f9a9e0001";
    const result = await repository.getMoodAnalytics(userId);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    expect(findSpy).toHaveBeenCalledWith({ userId: userObjectId });

    const pipeline = aggregateSpy.mock.calls[0][0] as any[];
    expect(pipeline[0].$match.userId).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(pipeline[1].$group._id).toHaveProperty("isoWeekYear");
    expect(result.overTime).toEqual(overTimeRows);
    expect(result.weeklyAverage).toEqual([
      { isoWeekYear: 2026, isoWeek: 9, averageMood: 7.3 },
      { isoWeekYear: 2026, isoWeek: 10, averageMood: 8 },
    ]);
  });
});
