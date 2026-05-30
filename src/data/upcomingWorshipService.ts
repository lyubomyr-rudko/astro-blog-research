const ENGLISH_MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

const UKRAINIAN_MONTHS = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
] as const;

const TIME_ZONE = "Europe/Kyiv";

export const WORSHIP_SERVICE_TIME = "11:00";
export const WORSHIP_SERVICE_ADDRESS = "м. Львів, площа Григоренка, 5/17";
export const WORSHIP_SERVICE_SLIDE_GROUP = "101,new_013,new_036,new_035,new_040";

type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export type UpcomingWorshipService = {
  id: string;
  path: string;
  dateDisplay: string;
  time: string;
  address: string;
  slideGroup: string;
  data: {
    title: string;
    description: string;
    pubDate: string;
    tags: string[];
    author: string;
  };
};

const getKyivCalendarDate = (date: Date): CalendarDate => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
};

const addDays = ({ year, month, day }: CalendarDate, days: number): CalendarDate => {
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
};

export const getUpcomingSunday = (date = new Date()): CalendarDate => {
  const today = getKyivCalendarDate(date);
  const weekday = new Date(
    Date.UTC(today.year, today.month - 1, today.day, 12),
  ).getUTCDay();
  const daysUntilSunday = (7 - weekday) % 7;

  return addDays(today, daysUntilSunday);
};

const formatDateKey = ({ year, month, day }: CalendarDate) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const formatSlugDate = ({ year, month, day }: CalendarDate) =>
  `${String(day).padStart(2, "0")}-${ENGLISH_MONTHS[month - 1]}-${year}`;

const formatUkrainianDate = ({ year, month, day }: CalendarDate) =>
  `${day} ${UKRAINIAN_MONTHS[month - 1]} ${year} року`;

export const getUpcomingWorshipService = (
  date = new Date(),
): UpcomingWorshipService => {
  const sunday = getUpcomingSunday(date);
  const dateKey = formatDateKey(sunday);
  const slugDate = formatSlugDate(sunday);
  const dateDisplay = formatUkrainianDate(sunday);
  const id = `church-in-lviv/${slugDate}-worship-service`;
  const title = `Богослужіння церкви у Львові, ${dateDisplay}. 11 година ранку.`;
  const description = `Запрошуємо на богослужіння церкви у Львові, яке відбудеться ${dateDisplay} о 11:00, за адресою ${WORSHIP_SERVICE_ADDRESS}. Приєднуйтесь до спільного поклоніння, молитви та вивчення Божого слова.`;

  return {
    id,
    path: `/${id}/`,
    dateDisplay,
    time: WORSHIP_SERVICE_TIME,
    address: WORSHIP_SERVICE_ADDRESS,
    slideGroup: WORSHIP_SERVICE_SLIDE_GROUP,
    data: {
      title,
      description,
      pubDate: dateKey,
      tags: [],
      author: "",
    },
  };
};
