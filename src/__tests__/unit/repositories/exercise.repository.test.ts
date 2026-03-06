import { ExerciseModel } from "../../../models/exercise.model";
import { ExerciseRepository } from "../../../repositories/exercise.repository";

describe("ExerciseRepository (unit)", () => {
  const repository = new ExerciseRepository();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("1) createExercise creates manual source entry and converts date", async () => {
    const createSpy = jest.spyOn(ExerciseModel, "create").mockResolvedValue({ _id: "e1" } as any);

    await repository.createExercise("u1", {
      type: "Run",
      duration: 25,
      date: "2026-03-01T10:00:00.000Z",
      notes: "Morning",
    } as any);

    const payload = createSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.source).toBe("manual");
    expect(payload.date).toBeInstanceOf(Date);
    expect(payload.notes).toBe("Morning");
  });

  it("2) completeGuidedExercise rounds elapsed seconds to duration minutes", async () => {
    const createSpy = jest.spyOn(ExerciseModel, "create").mockResolvedValue({ _id: "e1" } as any);

    await repository.completeGuidedExercise("u1", {
      title: "Body Scan",
      category: "mindfulness",
      plannedDurationSeconds: 120,
      elapsedSeconds: 91,
    } as any);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        type: "Body Scan",
        category: "mindfulness",
        durationSeconds: 91,
        duration: 2,
        source: "guided",
      })
    );
  });

  it("3) getExerciseByIdForUser scopes by id and user", async () => {
    const findOneSpy = jest.spyOn(ExerciseModel, "findOne").mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "e1" }),
    } as any);

    await repository.getExerciseByIdForUser("u1", "e1");

    expect(findOneSpy).toHaveBeenCalledWith({ _id: "e1", userId: "u1" });
  });

  it("4) deleteExerciseForUser scopes delete by id and user", async () => {
    const deleteSpy = jest.spyOn(ExerciseModel, "findOneAndDelete").mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "e1" }),
    } as any);

    await repository.deleteExerciseForUser("u1", "e1");

    expect(deleteSpy).toHaveBeenCalledWith({ _id: "e1", userId: "u1" });
  });
});
