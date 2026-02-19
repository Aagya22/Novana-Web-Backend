import { CreateMoodDTO, UpdateMoodDTO } from "../dtos/mood.dto";
import { HttpError } from "../errors/http-error";
import { MoodRepository } from "../repositories/mood.repository";
import type { MoodAnalytics } from "../repositories/mood.repository";

const moodRepository = new MoodRepository();

export class MoodService {

    private isSameLocalDay(a: Date, b: Date) {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }

    private getLocalDayRange(d: Date) {
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return { start, end };
    }

    private parseDateInput(date?: string) {
        if (!date) return new Date();
        const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
        if (dateOnly.test(date)) {
            const [y, m, d] = date.split("-").map((v) => Number(v));
            return new Date(y, m - 1, d);
        }

        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) {
            throw new HttpError(400, "Invalid date");
        }
        return parsed;
    }

    private getStartOfLocalWeek(d: Date) {
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const day = start.getDay(); // Sun=0 ... Sat=6
        start.setDate(start.getDate() - day);
        return start;
    }

    private toLocalDateKey(d: Date) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }

    private moodBucketKey(score: number) {
        if (score <= 2) return "very_sad";
        if (score <= 4) return "sad";
        if (score <= 6) return "neutral";
        if (score <= 8) return "happy";
        return "very_happy";
    }

    private averageMoodLabel(score: number) {
        if (score <= 2) return "Awful";
        if (score <= 4) return "Bad";
        if (score <= 6) return "Okay";
        if (score <= 8) return "Good";
        return "Great";
    }

    async createMood(userId: string, data: CreateMoodDTO): Promise<{ mood: any; replaced: boolean }> {
        const now = new Date();
        const requestedDate = this.parseDateInput(data.date);

        const { start, end } = this.getLocalDayRange(requestedDate);
        const isToday = this.isSameLocalDay(requestedDate, now);
        const dayKey = this.toLocalDateKey(requestedDate);

        // Check by date range to also catch legacy records without dayKey.
        const existing = await moodRepository.getMoodForUserByDateRange(userId, start, end);

        if (existing) {
            if (!isToday) {
                throw new HttpError(403, "Mood entries can only be edited on the day they were logged");
            }

            const updated = await moodRepository.updateMoodForUser(userId, existing._id.toString(), {
                mood: data.mood,
                moodType: data.moodType,
                note: data.note,
                dayKey,
            });

            if (!updated) {
                throw new HttpError(404, "Mood entry not found");
            }

            await moodRepository.deleteOtherMoodsForUserInDateRange(userId, start, end, updated._id.toString());
            return { mood: updated, replaced: true };
        }

      
        try {
            const created = await moodRepository.createMood(userId, {
                ...data,
                // dayKey is derived; stored to enforce uniqueness
                dayKey,
                date: (isToday ? now : requestedDate).toISOString(),
            });

            await moodRepository.deleteOtherMoodsForUserInDateRange(userId, start, end, created._id.toString());
            return { mood: created, replaced: false };
        } catch (e: any) {
            // If another request inserted the same day concurrently, treat this as a replacement for today.
            if (e?.code === 11000) {
                if (!isToday) {
                    throw new HttpError(403, "Mood entries can only be edited on the day they were logged");
                }

                const latest = await moodRepository.getMoodForUserByDateRange(userId, start, end);
                if (!latest) {
                    throw new HttpError(500, "Failed to save mood");
                }

                const updated = await moodRepository.updateMoodForUser(userId, latest._id.toString(), {
                    mood: data.mood,
                    moodType: data.moodType,
                    note: data.note,
                    dayKey,
                });

                if (!updated) {
                    throw new HttpError(500, "Failed to save mood");
                }

                await moodRepository.deleteOtherMoodsForUserInDateRange(userId, start, end, updated._id.toString());
                return { mood: updated, replaced: true };
            }

            throw e;
        }
    }

    async getMoodByDate(userId: string, date: string) {
        const requested = this.parseDateInput(date);
        const { start, end } = this.getLocalDayRange(requested);
        return moodRepository.getMoodForUserByDateRange(userId, start, end);
    }

    async getMoodsInRange(userId: string, from: string, to: string) {
        const fromDate = this.parseDateInput(from);
        const toDate = this.parseDateInput(to);

        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(toDate);
        end.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() + 1);

        const entries = await moodRepository.getMoodsForUserByDateRange(userId, start, end);

      
        const seen = new Set<string>();
        const deduped: any[] = [];
        for (const e of entries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())) {
            const key = (e as any).dayKey || this.toLocalDateKey(new Date(e.date));
            if (seen.has(key)) continue;
            seen.add(key);
            deduped.push({
                _id: e._id,
                mood: (e as any).mood,
                moodType: (e as any).moodType,
                note: (e as any).note,
                dayKey: key,
                date: (e as any).date,
            });
        }

      
        return deduped.sort((a, b) => (a.dayKey as string).localeCompare(b.dayKey as string));
    }

    async getMoodOverview(userId: string) {
        const now = new Date();
        const weekStart = this.getStartOfLocalWeek(now);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekEntries = await moodRepository.getMoodsForUserByDateRange(userId, weekStart, weekEnd);
        const byDayKey = new Map<string, any>();
        for (const e of weekEntries) {
            byDayKey.set(this.toLocalDateKey(new Date(e.date)), e);
        }

        const days = Array.from({ length: 7 }).map((_, idx) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + idx);
            const key = this.toLocalDateKey(dayDate);
            return {
                date: key,
                entry: byDayKey.get(key) || null,
            };
        });

        const weekAvg = weekEntries.length
            ? weekEntries.reduce((acc, e) => acc + (e.mood ?? 0), 0) / weekEntries.length
            : null;

        const avgThisWeek = weekAvg === null
            ? null
            : {
                score: Math.round(weekAvg * 10) / 10,
                label: this.averageMoodLabel(weekAvg),
            };

        const recent = await moodRepository.getRecentMoodsByUser(userId, 400);

        // If legacy duplicates exist for the same day, only count the most recent entry for that day.
        const seenRecentDays = new Set<string>();
        const frequency = new Map<string, number>();
        for (const e of recent) {
            const dayKey = (e as any).dayKey || this.toLocalDateKey(new Date(e.date));
            if (seenRecentDays.has(dayKey)) continue;
            seenRecentDays.add(dayKey);

            const key = (e.moodType && e.moodType.trim().length > 0)
                ? e.moodType.trim()
                : this.moodBucketKey(e.mood);
            frequency.set(key, (frequency.get(key) ?? 0) + 1);
        }

        let mostFrequentKey: string | null = null;
        let mostFrequentCount = 0;
        for (const [k, c] of frequency.entries()) {
            if (c > mostFrequentCount) {
                mostFrequentKey = k;
                mostFrequentCount = c;
            }
        }

        const loggedDays = new Set<string>();
        for (const e of recent) {
            loggedDays.add(this.toLocalDateKey(new Date(e.date)));
        }

        let streak = 0;
        for (let i = 0; i < 365; i++) {
            const d = new Date(now);
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            const key = this.toLocalDateKey(d);
            if (loggedDays.has(key)) {
                streak += 1;
            } else {
                break;
            }
        }

        return {
            weekStart: this.toLocalDateKey(weekStart),
            days,
            avgThisWeek,
            streak,
            mostFrequent: mostFrequentKey
                ? { key: mostFrequentKey, count: mostFrequentCount }
                : null,
        };
    }

    async getMoodsByUser(userId: string) {
        const moods = await moodRepository.getMoodsByUser(userId);

       

        const seen = new Set<string>();
        const deduped: any[] = [];
        for (const m of moods) {
            const dayKey = (m as any).dayKey || this.toLocalDateKey(new Date(m.date));
            if (seen.has(dayKey)) continue;
            seen.add(dayKey);
            deduped.push(m);
        }
        return deduped;
    }

    async getMoodAnalytics(userId: string): Promise<MoodAnalytics> {
        return moodRepository.getMoodAnalytics(userId);
    }

    async getMoodById(userId: string, id: string) {
        const mood = await moodRepository.getMoodByIdForUser(userId, id);
        if (!mood) {
            throw new HttpError(404, "Mood entry not found");
        }
        return mood;
    }

    async updateMood(userId: string, id: string, data: UpdateMoodDTO) {
        const existing = await moodRepository.getMoodByIdForUser(userId, id);
        if (!existing) {
            throw new HttpError(404, "Mood entry not found");
        }

        const now = new Date();
        const loggedDate = new Date(existing.date);
        if (!this.isSameLocalDay(loggedDate, now)) {
            throw new HttpError(403, "Mood entries can only be edited on the day they were logged");
        }

        const mood = await moodRepository.updateMoodForUser(userId, id, {
            mood: data.mood,
            moodType: data.moodType,
            note: data.note,
        });

        if (!mood) {
            throw new HttpError(404, "Mood entry not found");
        }

        return mood;
    }

    async deleteMood(userId: string, id: string) {
        const mood = await moodRepository.deleteMoodForUser(userId, id);
        if (!mood) {
            throw new HttpError(404, "Mood entry not found");
        }
        return mood;
    }
}