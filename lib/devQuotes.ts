// Curated 100 Pure Developer Jokes, Puns, and Programming Memes
// Rotated deterministically every 6 hours — zero external bloat

export const DEV_QUOTES: string[] = [
  "I give my programming jokes a C++.",
  "What do you call a group of programmers? An Assembly.",
  "Why do Java developers wear sunglasses? Because they stare straight into the Eclipse!",
  "What do you call software that kills someone? A code-blooded murderer.",
  "What did the .NET developer name their boat? Sea Sharp.",
  "I like my coffee like I like my IDEs... Dark and free.",
  "What's a better name for Frontend Developers? <div>elopers.",
  "Which Hogwarts house is able to communicate securely? SSLytheryn.",
  "You know how a hacker escapes the FBI? \\FBI",
  "What's the difference between a delicious dinner and a slow computer? One's a rack of lamb and the other's a lack of RAM.",
  "What is a software developer's favorite herb? Parsley.",
  "What is a web developer's favorite tea? URL Grey.",
  "What do toll booths and Microsoft have in common? They're both bill gates.",
  "What's a programmer's favorite horror movie? The XORcist.",
  "What do you call people who used the internet before it was cool? Httpsters.",
  "Why do opticians hate Microsoft software developers? Because they C#.",
  "Why aren't frontend developers humble? Because they display: flex;",
  "You know what screams 'I'm insecure'? http://",
  "Why did the programmer cross the road? To get to the other IDE.",
  "Why was a web developer's boat always sinking? They had too many anchors.",
  "Why are i and j good sources of information? Because they're always in the loop.",
  "How did pirates communicate before the internet? Pier-to-pier networking.",
  "Why do software developers use dark themes? Because bugs are attracted to the light.",
  "Why do SQL developers have high rates of divorce? Because they have one-to-many relationships.",
  "What's a programmer's favorite beverage? soda.pop()",
  "What do you call a group of eight hobbits? A hobbyte.",
  "Why do web developers wear glasses? To improve their site.",
  "What's the easiest way to find a public bathroom? Look up the IP address.",
  "I store all of my dad jokes in my dadabase.",
  "I tried to tell a dad joke to a function. But it didn't get the reference.",
  "My team had a debate on what the best looping variable name is. i won.",
  "Never ask a SQL dev to help you move furniture. They drop tables.",
  "A GET request was reluctant to go to the party. They had no body to go with.",
  "I got really angry and smashed my keyboard. I completely lost CTRL.",
  "If you write Python, you know the road to hell is paved with good indentations.",
  "Say what you want about SQL, but it brings a lot to the table.",
  "I don't trust Matlab developers. They're always plotting something.",
  "A new database query walks into a bar. The server says, 'Sorry, cache only.'",
  "Programmers aren't good endurance athletes. They work in sprints.",
  "Developing a web browser takes time. Chrome wasn't built in a day.",
  "I walked down a street where houses were numbered 64K, 128K, 256K, 512K and 1MB. Nice trip down memory lane.",
  "Building a website is like baking brownies. Best when they're pretty GUI.",
  "I have a joke about documentation, but it's not done yet.",
  "I have a joke about computers, but it's not PC.",
  "Why do programmers hate nature? Too many bugs and no reboot button.",
  "There are 10 types of people in the world: those who understand binary, and those who don't.",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
  "To understand what recursion is, you must first understand recursion.",
  "There are two hard things in Computer Science: cache invalidation, naming things, and off-by-one errors.",
  "Keyboard not found. Press F1 to continue.",
  "Algorithm: Word used by programmers when they don't want to explain what they did.",
  "Hardware: The part of a computer that you can kick when the software crashes.",
  "A programmer's wife tells him: 'Go to the store and get a loaf of bread. If they have eggs, get a dozen.' He comes back with 12 loaves of bread.",
  "Debugging is like being the detective in a crime movie where you are also the murderer.",
  "Real programmers count from 0.",
  "It's not a bug, it's an undocumented feature.",
  "If at first you don't succeed, call it version 1.0.",
  "Code never lies, comments sometimes do.",
  "Walking away from the keyboard solves 80% of stubborn bugs.",
  "The best feature is the one that solves the user's problem without writing any new code.",
  "The code worked yesterday. Nobody touched it. Today it doesn't work. Welcome to computer science.",
  "The secret to fast code is doing less work.",
  "The three virtues of a programmer: Laziness, Impatience, and Hubris. — Larry Wall",
  "There's no place like 127.0.0.1.",
  "Think twice, code once, rewrite three times.",
  "Two bytes meet. The first says, 'Are you ill?' The second says, 'No, just feeling a bit off.'",
  "Unit testing: Testing that the wheels spin while the car is falling off a cliff.",
  "Vim users don't sleep; they just press ZZ.",
  "When all else fails, read the manual.",
  "When in doubt, add more logs.",
  "When you finally fix a bug that was bothering you for 3 days: 'I AM A GENIUS.'",
  "Why do programmers prefer iOS over Android? Because swift beats slow.",
  "Why was the JavaScript developer sad? Because they didn't Node how to Express themselves.",
  "Why did the functions stop calling each other? Because they had too many arguments.",
  "How do you comfort a JavaScript bug? You console it.",
  "Why did the developer go broke? Because they used up all their cache.",
  "What is the object-oriented way to become wealthy? Inheritance.",
  "Why do programmers love Git? Because it lets them commit to things without panic.",
  "What did the router say to the doctor? 'It hurts when IP.'",
  "Why was the cell phone wearing glasses? It lost its contacts.",
  "What do computers eat for a snack? Microchips.",
  "Where do programmers go to dance? The algorithm.",
  "Why did the computer keep freezing? Because it left its Windows open.",
  "What did the boolean say to the integer? 'You're so conditioned.'",
  "Why did the CSS developer leave the restaurant? No table layout.",
  "What is a programmer's favorite place in the house? The root directory.",
  "Why did the developer fail the driving test? Too many runtime crashes.",
  "What's a server's favorite sport? Ping pong.",
  "Why did the database administrator walk out of the bar? Uncommitted transactions.",
  "Why do developers dislike daylight savings? Timezone math gets worse.",
  "What do you call a programmer with a guitar? A string manipulator.",
  "Why are assembly programmers so calm? They have register control.",
  "What did the thread say to the worker? 'Don't block me.'",
  "Why did the API break up with the frontend? Bad payload.",
  "Why was the loop so dizzy? It couldn't find a break condition.",
  "What do you call a clean refactor? Pure poetry.",
  "Why do coders love tea? Because proper brewing takes async patience.",
  "When your code compiles on the first try: *suspicious silence*.",
  "Ship early, sleep well, log errors."
];

/**
 * Returns the deterministic joke/meme for the current 6-hour window.
 * Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC), a new joke activates.
 */
export const getActive6HourQuote = (customOffset: number = 0): { quote: string; index: number; slot: number; hoursRemaining: number } => {
  const now = Date.now();
  const SIX_HOURS_MS = 6 * 3600 * 1000;
  const slot = Math.floor(now / SIX_HOURS_MS) + customOffset;
  
  // Deterministic hash so the joke is stable across all users and devices
  const index = Math.abs((slot * 2654435761) % DEV_QUOTES.length);
  const quote = DEV_QUOTES[index];
  
  const nextSlotTime = (Math.floor(now / SIX_HOURS_MS) + 1) * SIX_HOURS_MS;
  const msRemaining = Math.max(0, nextSlotTime - now);
  const hoursRemaining = Math.max(1, Math.ceil(msRemaining / (3600 * 1000)));

  return { quote, index: index + 1, slot, hoursRemaining };
};
