import { UserModel } from "../../../models/user.model";
import { ReminderNotificationRepository } from "../../../repositories/reminder-notification.repository";
import { ReminderRepository } from "../../../repositories/reminder.repository";
import { ReminderService } from "../../../services/reminder.service";

describe("ReminderService (unit)", () => {
  const service = new ReminderService();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("1) getReminderById throws when reminder is not found", async () => {
    jest.spyOn(ReminderRepository.prototype, "getReminderById").mockResolvedValue(null);

    await expect(service.getReminderById("r1")).rejects.toMatchObject({
      statusCode: 404,
      message: "Reminder not found",
    });
  });

  it("2) toggleReminderDone throws when reminder is not found", async () => {
    jest.spyOn(ReminderRepository.prototype, "getReminderById").mockResolvedValue(null);

    await expect(service.toggleReminderDone("r1")).rejects.toMatchObject({
      statusCode: 404,
      message: "Reminder not found",
    });
  });

  it("3) toggleReminderDone flips enabled and updates reminder", async () => {
    jest.spyOn(ReminderRepository.prototype, "getReminderById").mockResolvedValue({
      _id: "r1",
      enabled: true,
    } as any);

    const updateSpy = jest.spyOn(ReminderRepository.prototype, "updateReminder").mockResolvedValue({
      _id: "r1",
      enabled: false,
    } as any);

    const result = await service.toggleReminderDone("r1");

    expect(updateSpy).toHaveBeenCalledWith("r1", { enabled: false });
    expect(result).toHaveProperty("enabled", false);
  });

  it("4) clearNotificationHistory sets clearedAt and deletes history", async () => {
    jest.spyOn(UserModel, "updateOne").mockReturnValue({ exec: jest.fn().mockResolvedValue({}) } as any);
    const deleteSpy = jest
      .spyOn(ReminderNotificationRepository.prototype, "deleteAllByUser")
      .mockResolvedValue(3);

    const deleted = await service.clearNotificationHistory("u1");

    expect(deleteSpy).toHaveBeenCalledWith("u1");
    expect(deleted).toBe(3);
  });

  it("5) backfillMissedNotifications creates one eligible notification", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2030, 0, 15, 12, 0, 0));

    jest.spyOn(UserModel, "findById").mockReturnValue({
      select: () => ({ lean: () => ({ exec: async () => null }) }),
    } as any);

    jest.spyOn(ReminderRepository.prototype, "getRemindersByUser").mockResolvedValue([
      {
        _id: "r1",
        title: "Hydrate",
        type: "mood",
        enabled: true,
        time: "10:00",
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        createdAt: new Date(2030, 0, 14, 9, 0, 0),
      },
    ] as any);

    const createIfNotExistsSpy = jest
      .spyOn(ReminderNotificationRepository.prototype, "createIfNotExists")
      .mockResolvedValue({ _id: "n1" } as any);

    const count = await service.backfillMissedNotifications("u1", 24);

    expect(createIfNotExistsSpy).toHaveBeenCalledTimes(1);
    expect(count).toBe(1);
  });

  it("6) deliverDueReminders returns only reminders within window", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2030, 0, 15, 12, 1, 0));

    jest.spyOn(ReminderRepository.prototype, "getRemindersByUser").mockResolvedValue([
      {
        _id: "r1",
        title: "Due",
        type: "journal",
        enabled: true,
        time: "12:00",
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        createdAt: new Date(2030, 0, 14, 9, 0, 0),
      },
      {
        _id: "r2",
        title: "Too old",
        type: "journal",
        enabled: true,
        time: "11:50",
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        createdAt: new Date(2030, 0, 14, 9, 0, 0),
      },
    ] as any);

    jest
      .spyOn(ReminderNotificationRepository.prototype, "createIfNotExists")
      .mockResolvedValueOnce({ _id: "n1" } as any)
      .mockResolvedValueOnce({ _id: "n2" } as any);

    const delivered = await service.deliverDueReminders("u1", 2);

    expect(delivered.length).toBe(1);
    expect(delivered[0]).toHaveProperty("_id", "n1");
  });
});

