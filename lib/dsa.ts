/* DSA Journey roadmap — Apna College C++ course order.
 * One entry per course module. Blurb = lecture count + video time.
 * Topic TITLES are stored on sessions (human-readable in CSV/exports),
 * so don't rename a title casually — old logs won't match anymore.
 */

export type DsaStatus = "todo" | "doing" | "done";

export interface DsaTopicMeta {
  key: string;
  title: string;
  blurb: string;
}

export const DSA_TOPICS: DsaTopicMeta[] = [
  { key: "patterns", title: "Patterns", blurb: "11 lectures · 1h 43m of videos" },
  { key: "functions", title: "Functions", blurb: "11 lectures · 1h 2m of videos" },
  { key: "binary-number-system", title: "Binary Number System", blurb: "8 lectures · 47m of videos" },
  { key: "introduction-to-pointers", title: "Introduction to Pointers", blurb: "9 lectures · 40m of videos" },
  { key: "arrays-part-i", title: "Arrays (Part I)", blurb: "15 lectures · 2h 2m of videos" },
  { key: "arrays-part-ii", title: "Arrays (Part II)", blurb: "8 lectures · 1h 31m of videos" },
  { key: "basic-sorting-algorithms", title: "Basic Sorting Algorithms", blurb: "10 lectures · 1h 3m of videos" },
  { key: "2d-arrays", title: "2D Arrays", blurb: "11 lectures · 1h 39m of videos" },
  { key: "char-arrays-strings", title: "Char Arrays & Strings", blurb: "13 lectures · 1h 31m of videos" },
  { key: "vectors", title: "Vectors", blurb: "11 lectures · 1h 21m of videos" },
  { key: "bit-manipulation", title: "Bit Manipulation", blurb: "14 lectures · 1h 28m of videos" },
  { key: "oops-part-1", title: "OOPS (Part 1)", blurb: "15 lectures · 1h 34m of videos" },
  { key: "oops-part-2", title: "OOPS (Part 2)", blurb: "12 lectures · 1h 1m of videos" },
  { key: "recursion-part-1", title: "Recursion (Part 1)", blurb: "14 lectures · 1h 38m of videos" },
  { key: "recursion-part-2", title: "Recursion (Part 2)", blurb: "9 lectures · 1h 19m of videos" },
  { key: "divide-conquer", title: "Divide & Conquer", blurb: "10 lectures · 1h 39m of videos" },
  { key: "time-space-complexity-part-1", title: "Time & Space Complexity (Part 1)", blurb: "17 lectures · 1h 38m of videos" },
  { key: "time-space-complexity-part-2", title: "Time & Space Complexity (Part 2)", blurb: "8 lectures · 1h 10m of videos" },
  { key: "backtracking", title: "Backtracking", blurb: "19 lectures · 2h 25m of videos" },
  { key: "linked-list-part-1", title: "Linked List (Part 1)", blurb: "14 lectures · 1h 42m of videos" },
  { key: "linked-list-part-2", title: "Linked List (Part 2)", blurb: "13 lectures · 2h 2m of videos" },
  { key: "stacks-part-1", title: "Stacks (Part 1)", blurb: "12 lectures · 1h 36m of videos" },
  { key: "stacks-part-2", title: "Stacks (Part 2)", blurb: "9 lectures · 1h 20m of videos" },
  { key: "queue", title: "Queue", blurb: "14 lectures · 1h 33m of videos" },
  { key: "greedy-algorithms", title: "Greedy Algorithms", blurb: "15 lectures · 2h 35m of videos" },
  { key: "binary-trees-part-1", title: "Binary Trees (Part 1)", blurb: "12 lectures · 1h 55m of videos" },
  { key: "binary-trees-part-2", title: "Binary Trees (Part 2)", blurb: "10 lectures · 1h 40m of videos" },
  { key: "binary-trees-part-3", title: "Binary Trees (Part 3)", blurb: "9 lectures · 1h 35m of videos" },
  { key: "bst-part-1", title: "BST (Part 1)", blurb: "11 lectures · 2h 9m of videos" },
  { key: "bst-part-2", title: "BST (Part 2)", blurb: "7 lectures · 1h 14m of videos" },
  { key: "heaps-part-1", title: "Heaps (Part 1)", blurb: "11 lectures · 1h 42m of videos" },
  { key: "heaps-part-2", title: "Heaps (Part 2)", blurb: "10 lectures · 1h 34m of videos" },
  { key: "hashing-part-1", title: "Hashing (Part 1)", blurb: "13 lectures · 1h 53m of videos" },
  { key: "hashing-part-2", title: "Hashing (Part 2)", blurb: "12 lectures · 1h 38m of videos" },
  { key: "tries", title: "Tries", blurb: "14 lectures · 2h 1m of videos" },
  { key: "graphs-part-1", title: "Graphs (Part 1)", blurb: "11 lectures · 1h 37m of videos" },
  { key: "graphs-part-2", title: "Graphs (Part 2)", blurb: "12 lectures · 1h 40m of videos" },
  { key: "graphs-part-3", title: "Graphs (Part 3)", blurb: "9 lectures · 1h 22m of videos" },
  { key: "graphs-part-4", title: "Graphs (Part 4)", blurb: "9 lectures · 1h 51m of videos" },
  { key: "graphs-part-5", title: "Graphs (Part 5)", blurb: "8 lectures · 1h 51m of videos" },
  { key: "dynamic-programming-part-1", title: "Dynamic Programming (Part 1)", blurb: "10 lectures · 1h 26m of videos" },
  { key: "dynamic-programming-part-2", title: "Dynamic Programming (Part 2)", blurb: "7 lectures · 1h 48m of videos" },
  { key: "dynamic-programming-part-3", title: "Dynamic Programming (Part 3)", blurb: "7 lectures · 1h 20m of videos" },
  { key: "dynamic-programming-part-4", title: "Dynamic Programming (Part 4)", blurb: "6 lectures · 1h 7m of videos" },
  { key: "dynamic-programming-part-5", title: "Dynamic Programming (Part 5)", blurb: "8 lectures · 1h 35m of videos" },
  { key: "dynamic-programming-part-6", title: "Dynamic Programming (Part 6)", blurb: "9 lectures · 1h 31m of videos" },
  { key: "segment-trees", title: "Segment Trees", blurb: "13 lectures · 1h 47m of videos" },
];

export const DSA_KEY_SET = new Set(DSA_TOPICS.map((t) => t.key));

/** Timers treat any subject with "DSA" in its name as the DSA subject. */
export const isDsaSubjectName = (name?: string | null) => /dsa/i.test(name || "");

export const topicTitle = (key: string) =>
  DSA_TOPICS.find((t) => t.key === key)?.title ?? key;
