import mongoose from "mongoose";
import { ReminderNotificationModel } from "../../../models/reminder-notification.model";
import { ReminderNotificationRepository } from "../../../repositories/reminder-notification.repository";

describe("ReminderNotificationRepository (unit)", () => {
  const repository = new ReminderNotificationRepository();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("1) listByUser applies filters, sort, and limit", async () => {
    const exec = jest.fn().mockResolvedValue([{ _id: "n1" }]);
    const limit = jest.fn().mockReturnValue({ exec });
    const sort = jest.fn().mockReturnValue({ limit });
    const findSpy = jest.spyOn(ReminderNotificationModel, "find").mockReturnValue({ sort } as any);

    const result = await repository.listByUser("u1", 15);

    expect(findSpy).toHaveBeenCalledWith({ userId: "u1", deletedAt: null });
    expect(sort).toHaveBeenCalledWith({ deliveredAt: -1 });
    expect(limit).toHaveBeenCalledWith(15);
    expect(result).toEqual([{ _id: "n1" }]);
  });

  it("2) createIfNotExists persists ObjectId-based payload", async () => {
    const createSpy = jest.spyOn(ReminderNotificationModel, "create").mockResolvedValue({ _id: "n1" } as any);
    const scheduledFor = new Date("2026-03-06T10:00:00.000Z");

    const result = await repository.createIfNotExists({
      userId: "67c95f4bf4e79f1f5d111111",
      reminderId: "67c95f4bf4e79f1f5d222222",
      title: "Hydrate",
      type: "mood",
      scheduledFor,
    });

    const payload = createSpy.mock.calls[0][0] as any;
    expect(mongoose.isValidObjectId(payload.userId)).toBe(true);
    expect(mongoose.isValidObjectId(payload.reminderId)).toBe(true);
    expect(payload.title).toBe("Hydrate");
    expect(payload.type).toBe("mood");
    expect(payload.scheduledFor).toBe(scheduledFor);
    expect(payload.deliveredAt).toBeInstanceOf(Date);
    expect(result).toEqual({ _id: "n1" });
  });

  it("3) markRead updates by user and notification id", async () => {
    const exec = jest.fn().mockResolvedValue({ _id: "n1", readAt: new Date() });
    const updateSpy = jest.spyOn(ReminderNotificationModel, "findOneAndUpdate").mockReturnValue({ exec } as any);

    const result = await repository.markRead("u1", "n1");

    expect(updateSpy).toHaveBeenCalledWith(
      { _id: "n1", userId: "u1", deletedAt: null },
      { readAt: expect.any(Date) },
      { new: true }
    );
    expect(result).toHaveProperty("_id", "n1");
  });
});
