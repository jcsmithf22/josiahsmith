function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function resolveElements(
  target: Element | string | Iterable<Element>,
  parentElement?: Element,
): Element[] {
  if (target instanceof EventTarget) {
    return [target];
  }
  if (typeof target === "string") {
    let doc: Document | Element = document;
    if (parentElement) {
      doc = parentElement;
    }
    const elements = doc.querySelectorAll(target);
    return Array.from(elements);
  }
  return Array.from(target);
}

function createSpan(className?: string, index?: number): HTMLSpanElement {
  const span = document.createElement("span");
  if (className) span.className = className;
  if (index !== undefined) span.dataset.index = index.toString();
  span.style.display = "inline-block";
  return span;
}

function appendCharacter(
  wrapper: HTMLElement,
  char: string,
  spanClass: string,
  index?: number,
): HTMLSpanElement {
  const span = createSpan(spanClass, index);
  span.textContent = char;
  wrapper.appendChild(span);
  return span;
}

interface SplitTextOptions {
  splitBy?: string;
  level?: "words" | "chars";
  lines?: boolean;
  charClass?: string;
  wordClass?: string;
  lineClass?: string;
}

interface SplitTextResult {
  chars: HTMLElement[];
  words: HTMLElement[];
  lines: HTMLElement[];
}

export function splitText(
  target: Element | string,
  options: SplitTextOptions = {},
): SplitTextResult {
  const {
    splitBy = " ",
    level = "chars",
    lines: includeLines = false,
    charClass = "split-char",
    wordClass = "split-word",
    lineClass = "split-line",
  } = options;

  // Resolve the target element.
  const [element] = resolveElements(target);
  assert(!!element, "Element not found");

  // Get the original text, remove newline characters, and clear the element.
  const originalText = (element.textContent || "")
    .replace(/\n/g, "") // Remove newlines
    .replace(/\ +/g, " "); // Replace multiple spaces with single space
  element.textContent = "";

  // Prepare the result object.
  const result: SplitTextResult = {
    chars: [],
    words: [],
    lines: [],
  };

  // Split the text into word strings.
  const wordStrings = originalText.split(splitBy);
  const wordElements: HTMLElement[] = [];
  const spacers: (Text | HTMLElement)[] = [];

  for (let i = 0; i < wordStrings.length; i++) {
    const wordText = wordStrings[i];
    const wordSpan = createSpan(wordClass, i);
    result.words.push(wordSpan);
    wordElements.push(wordSpan);

    if (level === "chars") {
      // Create spans for each character.
      const characters = Array.from(wordText);
      for (let j = 0; j < characters.length; j++) {
        const charSpan = appendCharacter(wordSpan, characters[j], charClass, j);
        result.chars.push(charSpan);
      }
    } else {
      wordSpan.textContent = wordText;
    }

    // Append the word span to the container.
    element.appendChild(wordSpan);

    // Insert delimiter (space or custom) between words.
    if (i < wordStrings.length - 1) {
      if (splitBy === " ") {
        const spacer = document.createTextNode(" ");
        element.appendChild(spacer);
        spacers.push(spacer);
      } else {
        const delimiter = appendCharacter(
          wordSpan,
          splitBy,
          `${charClass}-delimiter`,
        );
        if (level === "chars") {
          result.chars.push(delimiter);
        } else {
          result.words.push(delimiter);
        }
      }
    }
  }

  if (!includeLines) return result;

  // Group words into lines based on their vertical offset.
  type PositionedWord = {
    element: HTMLElement;
    top: number;
    index: number;
    spacer: Text | HTMLElement | null;
  };

  const positionedWords: PositionedWord[] = wordElements.map((word, i) => ({
    element: word,
    top: word.offsetTop,
    index: i,
    spacer: i < spacers.length ? spacers[i] : null,
  }));

  type LineGroup = {
    elements: (HTMLElement | Text)[];
    lineIndex: number;
  };

  const lines: LineGroup[] = [];
  let currentLine: (HTMLElement | Text)[] = [];
  let currentTop: number = positionedWords[0]?.top ?? 0;
  let lineIndex = 0;

  for (const item of positionedWords) {
    if (item.top > currentTop && currentLine.length > 0) {
      lines.push({ elements: currentLine, lineIndex: lineIndex++ });
      currentLine = [];
      currentTop = item.top;
    }
    currentLine.push(item.element);
    if (item.spacer) {
      currentLine.push(item.spacer);
    }
  }
  if (currentLine.length > 0) {
    lines.push({ elements: currentLine, lineIndex: lineIndex });
  }

  // Clear the container and rebuild it with line wrappers.
  element.textContent = "";
  for (const { elements: lineElements, lineIndex } of lines) {
    const lineSpan = createSpan(lineClass, lineIndex);
    lineSpan.style.display = "inline-block";
    result.lines.push(lineSpan);
    for (const el of lineElements) {
      lineSpan.appendChild(el);
    }
    element.appendChild(lineSpan);
  }

  return result;
}
