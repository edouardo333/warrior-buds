// Centralized store hours. Replace these values once the owner confirms
// official hours — everything else (badge, footer, etc.) reads from here.

export type DayHours = { open: string; close: string } | null;

// 0 = Sunday ... 6 = Saturday. "close" earlier than "open" means the store
// closes after midnight (e.g. open 10:00, close 02:00 = open until 2am).
export const STORE_HOURS: Record<number, DayHours> = {
  0: { open: "10:00", close: "02:00" },
  1: { open: "10:00", close: "02:00" },
  2: { open: "10:00", close: "02:00" },
  3: { open: "10:00", close: "02:00" },
  4: { open: "10:00", close: "02:00" },
  5: { open: "10:00", close: "02:00" },
  6: { open: "10:00", close: "02:00" },
};

export const STORE_TIMEZONE = "America/Toronto";

const CLOSING_SOON_THRESHOLD_MINUTES = 120;
const LAST_MINUTES_THRESHOLD = 30;

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12}:00 ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function getMontrealParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    hourCycle: "h23",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    weekday: weekdayMap[map.weekday],
    minutesSinceMidnight: Number(map.hour) * 60 + Number(map.minute),
  };
}

export type StoreStatus = {
  state: "open" | "closing-soon" | "last-30" | "closed";
  primaryLabel: string;
  secondaryLabel: string;
};

export function getStoreStatus(date: Date = new Date()): StoreStatus {
  const { weekday, minutesSinceMidnight } = getMontrealParts(date);
  // Continuous timeline: yesterday = [0, 1440), today = [1440, 2880).
  const nowAbs = 1440 + minutesSinceMidnight;

  const yesterday = (weekday + 6) % 7;
  const yesterdayHours = STORE_HOURS[yesterday];
  if (yesterdayHours) {
    const openAbs = toMinutes(yesterdayHours.open);
    const rawClose = toMinutes(yesterdayHours.close);
    const rollsOver = rawClose <= openAbs;
    if (rollsOver) {
      const closeAbs = 1440 + rawClose;
      if (nowAbs < closeAbs) {
        return buildOpenStatus(closeAbs - nowAbs, yesterdayHours.close);
      }
    }
  }

  const todayHours = STORE_HOURS[weekday];
  if (todayHours) {
    const openAbs = 1440 + toMinutes(todayHours.open);
    const rawClose = toMinutes(todayHours.close);
    const rollsOver = rawClose <= toMinutes(todayHours.open);
    const closeAbs = rollsOver ? 1440 + 1440 + rawClose : 1440 + rawClose;
    if (nowAbs >= openAbs && nowAbs < closeAbs) {
      return buildOpenStatus(closeAbs - nowAbs, todayHours.close);
    }
  }

  const next = findNextOpen(weekday, nowAbs);
  return {
    state: "closed",
    primaryLabel: "CLOSED",
    secondaryLabel: next
      ? `Opens ${next.dayLabel} at ${formatTime12h(next.openTime)}`
      : "Hours coming soon",
  };
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function buildOpenStatus(minutesUntilClose: number, closeTime: string): StoreStatus {
  if (minutesUntilClose <= LAST_MINUTES_THRESHOLD) {
    return {
      state: "last-30",
      primaryLabel: "LAST 30 MINUTES",
      secondaryLabel: `Closing in ${formatDuration(minutesUntilClose)}`,
    };
  }
  if (minutesUntilClose <= CLOSING_SOON_THRESHOLD_MINUTES) {
    return {
      state: "closing-soon",
      primaryLabel: "CLOSING SOON",
      secondaryLabel: `Closing in ${formatDuration(minutesUntilClose)}`,
    };
  }
  return {
    state: "open",
    primaryLabel: "OPEN NOW",
    secondaryLabel: `Open until ${formatTime12h(closeTime)}`,
  };
}

function findNextOpen(weekday: number, nowAbs: number) {
  for (let offset = 0; offset <= 7; offset++) {
    const day = (weekday + offset) % 7;
    const hours = STORE_HOURS[day];
    if (!hours) continue;
    const openAbs = 1440 + offset * 1440 + toMinutes(hours.open);
    if (openAbs <= nowAbs) continue;
    const dayLabel = offset === 0 ? "today" : offset === 1 ? "tomorrow" : WEEKDAY_NAMES[day];
    return { dayLabel, openTime: hours.open };
  }
  return null;
}

export type WeeklyScheduleEntry = { label: string; hours: string };

export function getWeeklySchedule(): WeeklyScheduleEntry[] {
  const entries: WeeklyScheduleEntry[] = [];
  let i = 0;
  while (i < 7) {
    const hours = STORE_HOURS[i];
    const key = hours ? `${hours.open}-${hours.close}` : "closed";
    let j = i;
    while (j + 1 < 7) {
      const nextHours = STORE_HOURS[j + 1];
      const nextKey = nextHours ? `${nextHours.open}-${nextHours.close}` : "closed";
      if (nextKey !== key) break;
      j++;
    }
    const label = i === j ? WEEKDAY_NAMES[i].slice(0, 3) : `${WEEKDAY_NAMES[i].slice(0, 3)} – ${WEEKDAY_NAMES[j].slice(0, 3)}`;
    const value = hours ? `${formatTime12h(hours.open)} – ${formatTime12h(hours.close)}` : "Closed";
    entries.push({ label, hours: value });
    i = j + 1;
  }
  return entries;
}
