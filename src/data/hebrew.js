import hebrewBibleSource from "./hebrew.json";
import { bibleChapters } from "./bible.js";

const hebrewBookInfo = [
  ["Genesis", "gen", "Буття"],
  ["Exodus", "exod", "Вихід"],
  ["Leviticus", "lev", "Левит"],
  ["Numbers", "num", "Числа"],
  ["Deuteronomy", "deut", "Повторення Закону"],
  ["Joshua", "josh", "Ісус Навин"],
  ["Judges", "judg", "Судді"],
  ["Ruth", "ruth", "Рут"],
  ["I Samuel", "1sam", "1 Самуїлова"],
  ["II Samuel", "2sam", "2 Самуїлова"],
  ["I Kings", "1kgs", "1 Царів"],
  ["II Kings", "2kgs", "2 Царів"],
  ["I Chronicles", "1chr", "1 Хронік"],
  ["II Chronicles", "2chr", "2 Хронік"],
  ["Ezra", "ezra", "Ездра"],
  ["Nehemiah", "neh", "Неемія"],
  ["Esther", "esth", "Естер"],
  ["Job", "job", "Йов"],
  ["Psalms", "ps", "Псалми"],
  ["Proverbs", "prov", "Приповісті"],
  ["Ecclesiastes", "eccl", "Екклезіяст"],
  ["Song of Solomon", "song", "Пісня над піснями"],
  ["Isaiah", "isa", "Ісая"],
  ["Jeremiah", "jer", "Єремія"],
  ["Lamentations", "lam", "Плач Єремії"],
  ["Ezekiel", "ezek", "Єзекіїль"],
  ["Daniel", "dan", "Даниїл"],
  ["Hosea", "hos", "Осія"],
  ["Joel", "joel", "Йоіл"],
  ["Amos", "amos", "Амос"],
  ["Obadiah", "obad", "Овдій"],
  ["Jonah", "jonah", "Йона"],
  ["Micah", "mic", "Михей"],
  ["Nahum", "nah", "Наум"],
  ["Habakkuk", "hab", "Авакум"],
  ["Zephaniah", "zeph", "Софонія"],
  ["Haggai", "hag", "Огій"],
  ["Zechariah", "zech", "Захарій"],
  ["Malachi", "mal", "Малахія"],
];

const getHebrewWord = (token) => {
  const value = Array.isArray(token) ? token[0] : token;

  return String(value ?? "").replaceAll("/", "");
};

const ukrainianChaptersByKey = new Map(
  bibleChapters.map((chapter) => [`${chapter.slug}:${chapter.chapter}`, chapter]),
);

const getUkrainianVerseText = (chapter, verseNumber) =>
  chapter?.verses.find((verse) => verse.number === verseNumber)?.text ?? "";

const allChapters = hebrewBookInfo.flatMap(
  ([sourceTitle, slug, title], bookIndex) => {
    const chapters = hebrewBibleSource[sourceTitle] ?? [];

    return chapters.map((verses, chapterIndex) => {
      const chapter = chapterIndex + 1;
      const ukrainianChapter = ukrainianChaptersByKey.get(`${slug}:${chapter}`);

      return {
        number: bookIndex + 1,
        sourceTitle,
        slug,
        title,
        chapter,
        path: `/hebrew-bible/${slug}/${chapter}/`,
        verses: verses.map((tokens, verseIndex) => ({
          number: verseIndex + 1,
          text: tokens.map(getHebrewWord).join(" "),
          ukrainianText: getUkrainianVerseText(ukrainianChapter, verseIndex + 1),
        })),
      };
    });
  },
);

export const hebrewBibleBooks = hebrewBookInfo
  .map(([sourceTitle, slug, title], index) => {
    const number = index + 1;
    const chaptersForBook = allChapters.filter(
      (chapter) => chapter.number === number,
    );

    return {
      number,
      sourceTitle,
      slug,
      title,
      chapters: chaptersForBook.map((chapter) => chapter.chapter),
      chapterCount: chaptersForBook.length,
    };
  })
  .filter((book) => book.chapterCount > 0);

export const hebrewBibleChapters = allChapters;

export const getAdjacentHebrewBibleChapters = (currentChapter) => {
  const currentIndex = allChapters.findIndex(
    (chapter) =>
      chapter.slug === currentChapter.slug &&
      chapter.chapter === currentChapter.chapter,
  );

  return {
    previousChapter: currentIndex > 0 ? allChapters[currentIndex - 1] : null,
    nextChapter:
      currentIndex >= 0 && currentIndex < allChapters.length - 1
        ? allChapters[currentIndex + 1]
        : null,
  };
};
