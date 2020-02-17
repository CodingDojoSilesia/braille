const PRE_ALPHABET = ['a', 'b', 'c', 'd'];
const ALPHABET = {
    a: 'x     ',
    b: 'xx    ',
    c: 'x  x  ',
    d: 'x  xx ',
    ',': ' x    ',
    '.': ' x  xx',
    '-': '  x  x',
};

function addX(braille, index) {
  return braille.substr(0, index) + 'x' + braille.substr(index + 1);
}

PRE_ALPHABET.map(alpha => {
  const braille = ALPHABET[alpha];
  const nextLetter = String.fromCharCode(alpha.charCodeAt(0) + 10);
  const nextNextLetter = String.fromCharCode(alpha.charCodeAt(0) + 20);
  ALPHABET[nextLetter] = addX(braille, 2);
  ALPHABET[nextNextLetter] = addX(ALPHABET[nextLetter], 5);
});


const SPECIAL_CHARS = {
  SPACE: '      ',
  SMALL: '    xx',
  NUMBER: '  xxxx',
  CAPITAL: '     x',
};

function rawToDots(rawBrailleChar) {
  const brailleChar = rawBrailleChar
    .replace(/x/g, '●')
    .replace(/ /g, '○');
  const firstPart = brailleChar.substr(0, 3);
  const secondPart = brailleChar.substr(3, 3);
  return [firstPart, secondPart, '   '];
}

function charToBraille(state, latinChar) {
  if (latinChar == ' ') {
    return ['SMALL', [SPECIAL_CHARS.SPACE]];
  }
  const [nextState, newState, realChar] = getStateFromChar(state, latinChar);

  let chars = [];
  if (newState != state) {
      chars.push(SPECIAL_CHARS[newState]);
  }
  chars.push(ALPHABET[realChar]);
  return [nextState, chars];  
}

function getStateFromChar(state, latinChar) {
    // returns [nextState, newState, realChar];
    if (latinChar.match(/[a-z]/)) {
        return ['SMALL', 'SMALL', latinChar];
    } else if (latinChar.match(/[A-Z]/)) {
        return ['SMALL', 'CAPITAL', latinChar.toLowerCase()];
    } else if (latinChar.match(/[1-9]/)) {
        const AsciiNumber = latinChar.charCodeAt(0) - '1'.charCodeAt(0) + 'a'.charCodeAt(0);
        return ['NUMBER', 'NUMBER', String.fromCharCode(AsciiNumber)];
    } else {
        return [state, state, latinChar];
    }
}

function barsToLine(bars, lineIndex) {
  return [...bars].map(bar => bar[lineIndex]).join('');
}

function barsToString(bars) {
  const LINES_COUNT = 3;
  const range = [...Array(LINES_COUNT).keys()];
  return range.map(index => barsToLine(bars, index)).join('\n');
}

export default function translate(sentence) {
  const bars = [...sentence]
    .reduce(
        ([state, brailleSentence], latinChar) => {
            const [newState, rawBrailleChars] = charToBraille(state, latinChar);
            const brailleChars = rawBrailleChars.map(rawToDots);
            return [newState, brailleSentence.concat(brailleChars)];
        },
        ['SMALL', []]
    )[1]
    .flat();
  return barsToString(bars);
};
