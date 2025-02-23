export function wrapWordsInSpan(element: HTMLElement): Array<HTMLSpanElement> {
  const text = element.textContent;

  if (!text) return [];

  element.innerHTML = text
    .split(" ")
    .filter((word) => word !== "")
    .map((word) => `<span class="word">${word}</span>`)
    .join(" ");

  return [...element.querySelectorAll<HTMLSpanElement>(".word")];
}

interface LineReturnType {
  lines: Array<HTMLSpanElement>;
  words: Array<HTMLSpanElement>;
}

export function wordsPerLine(words: Array<HTMLSpanElement>) {
  // We will have an array of lines that contain an array of words
  const lines: Array<Array<HTMLSpanElement>> = [[]];
  let lineIndex = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Distance of the top outer border of the word to to the top edge of its parent
    const offsetTop = word.offsetTop;

    // If distance is different from previous word we start a new line
    if (i > 0 && offsetTop !== words[i - 1].offsetTop) {
      // We start a new line
      lines.push([]);
      lineIndex++;
    }

    lines[lineIndex].push(word);
  }

  return lines;
}

export function wrapLinesInSpan(element: HTMLElement): LineReturnType {
  const words = wrapWordsInSpan(element)!;

  element.innerHTML = wordsPerLine(words)
    .map(
      (lineWords) =>
        `<span class="mask"><span class="line">${lineWords
          .map((word) => word.outerHTML)
          .join(" ")}</span></span>`,
    )
    .join("");

  const lines = [...element.querySelectorAll<HTMLSpanElement>(".line")];

  return {
    lines,
    words,
  };
}
