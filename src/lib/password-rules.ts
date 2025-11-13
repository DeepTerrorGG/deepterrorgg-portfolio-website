
import { WordleMinigame, isWordleSolved, getTodaysWordleSolution } from "@/components/projects/password-game/wordle-minigame";
import { CountryGuesserMinigame, isCountryGuesserSolved, getCountryGuesserSolution } from "@/components/projects/password-game/country-guesser-minigame";
import { ChessPuzzleMinigame, isChessPuzzleSolved, getChessPuzzleSolution } from "@/components/projects/password-game/chess-puzzle-minigame";
import { PaulTheEgg, validatePaulIsHappy } from "@/components/projects/password-game/paul-the-egg";
import { CurrentTime, CurrentWeather } from "@/components/projects/password-game/current-time";

export type Rule = {
  id: number;
  text: string;
  isAi?: boolean;
  validate: (password: string) => boolean;
  // Optional component to render for interactive rules
  component?: React.ComponentType;
};

// These rules will be added sequentially at the start of the game.
export const initialRules: Rule[] = [
  { id: 1, text: 'Your password must be at least 8 characters long.', validate: (p) => p.length >= 8 },
  { id: 2, text: 'Your password must contain an uppercase letter.', validate: (p) => /[A-Z]/.test(p) },
  { id: 3, text: 'Your password must contain a number.', validate: (p) => /\d/.test(p) },
  { id: 4, text: 'Your password must contain a special character.', validate: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(p) },
];

// These rules will be picked randomly after the initial rules are satisfied.
export const rulePool: Rule[] = [
    { id: 101, text: 'The sum of all digits in your password must be a multiple of 5.', validate: (p) => {
        const sum = (p.match(/\d/g) || []).reduce((sum, digit) => sum + parseInt(digit), 0);
        return sum > 0 && sum % 5 === 0;
    }},
    { id: 102, text: 'Your password must include at least two different Roman numerals.', validate: (p) => {
        const found = new Set(p.toUpperCase().match(/(I|V|X|L|C|D|M)/g) || []);
        return found.size >= 2;
    }},
    { id: 103, text: 'Your password must include the name of a month.', validate: (p) => /(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(p) },
    { id: 104, text: 'Your password must include a zodiac sign.', validate: (p) => /(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)/i.test(p) },
    { id: 105, text: 'Your password must include the name of a planet.', validate: (p) => /(Mercury|Venus|Earth|Mars|Jupiter|Saturn|Uranus|Neptune)/i.test(p) },
    { id: 106, text: 'Your password\'s length must be a prime number.', validate: (p) => { const len = p.length; if (len <= 1) return false; for (let i = 2; i * i <= len; i++) { if (len % i === 0) return false; } return len > 1; } },
    { id: 107, text: 'Your password must include the current year.', validate: (p) => p.includes(new Date().getFullYear().toString()) },
    {
      id: 108,
      text: "This rule is sponsored by YouTube! Your password must include a valid YouTube video URL.",
      validate: (p) => /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/.test(p)
    },
    { id: 109, text: 'Your password must contain a color of the rainbow.', validate: (p) => /(red|orange|yellow|green|blue|indigo|violet)/i.test(p) },
    { id: 110, text: 'Your password must include the name of a chess piece.', validate: (p) => /(king|queen|rook|bishop|knight|pawn)/i.test(p) },
    {
      id: 111,
      text: 'Your password must contain one of the following two-letter country codes: US, DE, FR, JP, CN, GB.',
      validate: (p) => /(US|DE|FR|JP|CN|GB)/i.test(p)
    },
    { id: 112, text: 'The number of lowercase letters must be exactly double the number of uppercase letters.', validate: (p) => {
        const lower = (p.match(/[a-z]/g) || []).length;
        const upper = (p.match(/[A-Z]/g) || []).length;
        return upper > 0 && lower === upper * 2;
    }},
    { id: 113, text: 'Your password must contain a year that was a leap year.', validate: (p) => {
        const numbers = p.match(/\d{4}/g);
        if (!numbers) return false;
        return numbers.some(yearStr => {
            const year = parseInt(yearStr);
            return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        });
    }},
    {
      id: 114,
      text: 'Your password must be a palindrome (reads the same forwards and backwards).',
      validate: (p) => p.length > 0 && Array.from(p.toLowerCase()).join('') === Array.from(p.toLowerCase()).reverse().join('')
    },
    { id: 115, text: 'Your password must contain a valid hexadecimal color code.', validate: (p) => /#([0-9a-fA-F]{3}){1,2}/.test(p) },
    { id: 116, text: "Your password must contain an element's atomic number and its corresponding symbol.", validate: (p) => {
        const elements: Record<string, number> = { 'H':1, 'He':2, 'Li':3, 'Be':4, 'B':5, 'C':6, 'N':7, 'O':8, 'F':9, 'Ne':10, 'Na':11, 'Mg':12, 'Al':13, 'Si':14, 'P':15, 'S':16, 'Cl':17, 'Ar':18, 'K':19, 'Ca':20, 'Fe':26, 'Ni':28, 'Cu':29, 'Zn':30, 'Ag':47, 'Au':79, 'Hg':80, 'Pb':82 };
        for (const symbol in elements) {
            if (p.includes(symbol) && p.includes(elements[symbol].toString())) return true;
        }
        return false;
    }},
     { id: 117, text: "The length of your password must be the result of a factorial of a digit also present in the password.", validate: (p) => {
        const factorials = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880]; // 0! to 9!
        const digits = (p.match(/[1-9]/g) || []).map(Number);
        if (digits.length === 0) return false;
        return digits.some(d => p.length === factorials[d]);
    }},
    {
        id: 201,
        text: "Solve today's Wordle. The 5-letter solution must be in your password.",
        validate: (p) => isWordleSolved() && p.toLowerCase().includes(getTodaysWordleSolution().toLowerCase()),
        component: WordleMinigame
    },
    {
        id: 202,
        text: 'This is Paul 🥚. Paul is a fragile egg. To keep him safe, you must place him inside a "shell" of brackets.',
        validate: validatePaulIsHappy,
        component: PaulTheEgg
    },
    {
        id: 203,
        text: 'Your password must contain a valid move in algebraic chess notation.',
        validate: (p) => /\b([a-h][1-8])|([a-h]x[a-h][1-8])|([N,B,R,Q,K][a-h]?[1-8]?[x]?[a-h][1-8])\b/.test(p)
    },
    {
        id: 204,
        text: 'Your password must contain the emoji for the current moon phase.',
        validate: (p) => {
            const getMoonPhase = () => {
                const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
                const day = new Date().getDate(); // Simple logic for demonstration
                return phases[day % phases.length];
            }
            return Array.from(p).includes(getMoonPhase());
        }
    },
    {
        id: 205,
        text: "Solve the Geo-puzzle. Your password must include the correct country's name.",
        validate: (p) => isCountryGuesserSolved() && p.toLowerCase().includes(getCountryGuesserSolution().toLowerCase()),
        component: CountryGuesserMinigame
    },
    {
        id: 206,
        text: 'Solve the chess puzzle. Your password must contain the best next move in algebraic notation.',
        validate: (p) => isChessPuzzleSolved() && p.replace(/[+#]/g, '').includes(getChessPuzzleSolution().replace(/[+#]/g, '')),
        component: ChessPuzzleMinigame,
    },
    { 
        id: 207, 
        text: "If your password includes a YouTube URL, it must also include the video's duration.", 
        validate: (p) => {
            const hasUrl = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/.test(p);
            if (!hasUrl) return true; // Rule doesn't apply if there's no URL
            // Checks for formats like 1:23 or 12:34:56
            return /(\d{1,2}:\d{2}(:\d{2})?)/.test(p);
    }},
    {
        id: 301,
        text: 'Your password must include the current time.', // Placeholder text
        validate: (p) => false, // This will be handled dynamically in the component
        component: CurrentTime,
    },
    {
        id: 302,
        text: 'The current weather is... Your password must include this word.', // Placeholder text
        validate: (p) => false, // This will be handled dynamically in the component
        component: CurrentWeather,
    }
];
