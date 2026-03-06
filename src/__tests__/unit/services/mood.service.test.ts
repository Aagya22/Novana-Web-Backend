import { MoodRepository } from "../../../repositories/mood.repository";
import { MoodService } from "../../../services/mood.service";

describe("MoodService (unit)", () => {
  const service = new MoodService();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("1) createMood creates new entry when no same-day mood exists", async () => {
    jest.spyOn(MoodRepository.prototype, "getMoodForUserByDateRange").mockResolvedValue(null);

    const createSpy = jest.spyOn(MoodRepository.prototype, "createMood").mockResolvedValue({
      _id: "m1",
      mood: 7,
      moodType: "happy",
      date: new Date(),
    } as any);

    jest.spyOn(MoodRepository.prototype, "deleteOtherMoodsForUserInDateRange").mockResolvedValue({} as any);

    const result = await service.createMood("u1", { mood: 7, moodType: "happy" } as any);

    expect(createSpy).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ mood: 7, moodType: "happy", dayKey: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) })
    );
    expect(result.replaced).toBe(false);
    expect(result.mood).toHaveProperty("_id", "m1");
  });

  it("2) createMood replaces existing mood for today", async () => {
    const existing = { _id: "m1", date: new Date() } as any;

    jest.spyOn(MoodRepository.prototype, "getMoodForUserByDateRange").mockResolvedValue(existing);
    const updateSpy = jest.spyOn(MoodRepository.prototype, "updateMoodForUser").mockResolvedValue({
      _id: "m1",
      mood: 8,
      date: new Date(),
    } as any);
    jest.spyOn(MoodRepository.prototype, "deleteOtherMoodsForUserInDateRange").mockResolvedValue({} as any);

    const result = await service.createMood("u1", { mood: 8, note: "updated" } as any);

    expect(updateSpy).toHaveBeenCalledWith(
      "u1",
      "m1",
      expect.objectContaining({ mood: 8, note: "updated", dayKey: expect.any(String) })
    );
    expect(result.replaced).toBe(true);
  });

  it("3) createMood rejects replacing non-today mood", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    jest.spyOn(MoodRepository.prototype, "getMoodForUserByDateRange").mockResolvedValue({ _id: "m1", date: yesterday } as any);

    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(
      yesterday.getDate()
    ).padStart(2, "0")}`;

    await expect(service.createMood("u1", { mood: 6, date: yesterdayKey } as any)).rejects.toMatchObject({
      statusCode: 403,
      message: "Mood entries can only be edited on the day they were logged",
    });
  });

  it("4) createMood handles duplicate-key race by updating latest today entry", async () => {
    const latest = { _id: "m-latest", date: new Date() } as any;

    jest
      .spyOn(MoodRepository.prototype, "getMoodForUserByDateRange")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(latest);

    jest.spyOn(MoodRepository.prototype, "createMood").mockRejectedValue({ code: 11000 });
    const updateSpy = jest.spyOn(MoodRepository.prototype, "updateMoodForUser").mockResolvedValue({
      _id: "m-latest",
      mood: 9,
      date: new Date(),
    } as any);
    jest.spyOn(MoodRepository.prototype, "deleteOtherMoodsForUserInDateRange").mockResolvedValue({} as any);

    const result = await service.createMood("u1", { mood: 9, moodType: "great" } as any);

    expect(updateSpy).toHaveBeenCalledWith(
      "u1",
      "m-latest",
      expect.objectContaining({ mood: 9, moodType: "great" })
    );
    expect(result.replaced).toBe(true);
  });

  it("5) updateMood throws when target mood is missing", async () => {
    jest.spyOn(MoodRepository.prototype, "getMoodByIdForUser").mockResolvedValue(null);

    await expect(service.updateMood("u1", "m1", { mood: 7 } as any)).rejects.toMatchObject({
      statusCode: 404,
      message: "Mood entry not found",
    });
  });

  it("6) updateMood updates current-day mood", async () => {
    const now = new Date();

    jest.spyOn(MoodRepository.prototype, "getMoodByIdForUser").mockResolvedValue({ _id: "m1", date: now } as any);
    const updateSpy = jest.spyOn(MoodRepository.prototype, "updateMoodForUser").mockResolvedValue({
      _id: "m1",
      mood: 9,
      note: "better",
      date: now,
    } as any);

    const result = await service.updateMood("u1", "m1", { mood: 9, note: "better" } as any);

    expect(updateSpy).toHaveBeenCalledWith(
      "u1",
      "m1",
      expect.objectContaining({ mood: 9, note: "better" })
    );
    expect(result).toHaveProperty("mood", 9);
  });
});

