import { ExerciseRepository } from "../../../repositories/exercise.repository";
import { JournalRepository } from "../../../repositories/journal.repository";
import { ScheduleRepository } from "../../../repositories/schedule.repository";
import { ExerciseService } from "../../../services/exercise.service";
import { JournalService } from "../../../services/journal.service";
import { ScheduleService } from "../../../services/schedule.service";

describe("Journal/Schedule/Exercise Services (unit)", () => {
  const journalService = new JournalService();
  const scheduleService = new ScheduleService();
  const exerciseService = new ExerciseService();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("1) JournalService createJournal delegates to repository", async () => {
    const spy = jest.spyOn(JournalRepository.prototype, "createJournal").mockResolvedValue({ _id: "j1" } as any);

    const created = await journalService.createJournal("u1", { title: "T", content: "C" } as any);

    expect(spy).toHaveBeenCalledWith("u1", { title: "T", content: "C" });
    expect(created).toHaveProperty("_id", "j1");
  });

  it("2) JournalService getJournalById throws when missing", async () => {
    jest.spyOn(JournalRepository.prototype, "getJournalByIdForUser").mockResolvedValue(null);

    await expect(journalService.getJournalById("u1", "j1")).rejects.toMatchObject({
      statusCode: 404,
      message: "Journal not found",
    });
  });

  it("3) ScheduleService createSchedule delegates to repository", async () => {
    const spy = jest.spyOn(ScheduleRepository.prototype, "createSchedule").mockResolvedValue({ _id: "s1" } as any);

    const created = await scheduleService.createSchedule("u1", {
      title: "Meeting",
      date: "2026-03-10",
      time: "10:00",
    } as any);

    expect(spy).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ title: "Meeting", date: "2026-03-10", time: "10:00" })
    );
    expect(created).toHaveProperty("_id", "s1");
  });

  it("4) ScheduleService getScheduleById throws when missing", async () => {
    jest.spyOn(ScheduleRepository.prototype, "getScheduleByIdForUser").mockResolvedValue(null);

    await expect(scheduleService.getScheduleById("u1", "s1")).rejects.toMatchObject({
      statusCode: 404,
      message: "Schedule not found",
    });
  });

  it("5) ExerciseService completeGuidedExercise delegates to repository", async () => {
    const repoResult = { _id: "e1", source: "guided" } as any;
    const spy = jest.spyOn(ExerciseRepository.prototype, "completeGuidedExercise").mockResolvedValue(repoResult);

    const result = await exerciseService.completeGuidedExercise("u1", {
      title: "Breathing",
      category: "mindfulness",
      plannedDurationSeconds: 120,
      elapsedSeconds: 95,
    } as any);

    expect(spy).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ title: "Breathing", category: "mindfulness" })
    );
    expect(result).toBe(repoResult);
  });

  it("6) ExerciseService getExerciseById throws when missing", async () => {
    jest.spyOn(ExerciseRepository.prototype, "getExerciseByIdForUser").mockResolvedValue(null);

    await expect(exerciseService.getExerciseById("u1", "e1")).rejects.toMatchObject({
      statusCode: 404,
      message: "Exercise not found",
    });
  });

  it("7) ExerciseService deleteExercise throws when missing", async () => {
    jest.spyOn(ExerciseRepository.prototype, "deleteExerciseForUser").mockResolvedValue(null);

    await expect(exerciseService.deleteExercise("u1", "e1")).rejects.toMatchObject({
      statusCode: 404,
      message: "Exercise not found",
    });
  });

});

