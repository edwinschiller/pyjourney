import type { LessonBlueprint } from "@/lib/pyjo/curricula/types"

/**
 * Lists — ordered collections after Data types.
 *
 * Owns: creating lists with [], indexing (0-based, negative lite),
 * len(), append / item assignment, basic slices, for-loops over items,
 * membership (in / not in), nested lists (read-only intro), mutable vs str,
 * common IndexError bugs, and collect/filter-lite patterns.
 */
export const LISTS_BLUEPRINT: LessonBlueprint = {
  slug: "lists",
  title: "Lists",
  objective:
    "Create lists, index and slice items, mutate with append and assignment, use len(), loop over lists, test membership, and avoid common off-by-one bugs.",
  rationale:
    "Real programs store many values — scores, inventory, names. Strings alone cannot grow or hold mixed data. Lists are the first mutable collection learners need before conditions and richer logic.",
  topics: [
    {
      id: "why_lists",
      title: "Why lists exist",
      teachingGoal:
        "A list holds many ordered values in one variable; order matters.",
      mustCover: [
        "One variable can store a sequence of values: [1, 2, 3].",
        "Lists keep order — first item stays first until you change it.",
        "Use lists when you have a collection (scores, items, names), not one lone value.",
      ],
      misconceptions: [
        "You need a separate variable for every item forever.",
        "Lists shuffle items randomly on their own.",
      ],
      examples: [
        "scores = [10, 14, 8]",
        'names = ["Ada", "Lin", "Sam"]',
        "print(scores[0])  # first score",
      ],
      checkIdeas: [
        "Why use a list instead of three separate variables?",
        "Does list order matter?",
      ],
      masteryChecks: 3,
    },
    {
      id: "create_lists",
      title: "Create lists with [ ]",
      teachingGoal:
        "Build lists with square brackets; separate items with commas.",
      mustCover: [
        "Syntax: [item1, item2, item3] — commas between items.",
        "Lists can hold ints, floats, strs, bools — even mixed types (use carefully).",
        "An empty list is [] — valid and useful as a starting point.",
        "Trailing comma after the last item is fine: [1, 2,].",
      ],
      misconceptions: [
        "Lists must contain only one type (Python allows mixed, but keep exercises simple).",
        "Parentheses () or braces {} create a list.",
      ],
      examples: [
        "inventory = [\"sword\", \"potion\", \"key\"]",
        "mixed = [1, \"two\", 3.0, True]",
        "empty = []",
      ],
      checkIdeas: [
        "Which syntax creates a list?",
        "Is [1, \"a\", True] valid?",
      ],
      masteryChecks: 3,
    },
    {
      id: "indexing",
      title: "Index items (0-based)",
      teachingGoal:
        "Access items with list[i]; first item is index 0; negative indices count from the end (lite).",
      mustCover: [
        "Indexing starts at 0 — items[0] is the first item.",
        "items[1] is the second; items[len(items)-1] is the last.",
        "Negative index lite: items[-1] is the last item, items[-2] second-to-last.",
        "Out-of-range index raises IndexError.",
      ],
      misconceptions: [
        "The first item is at index 1.",
        "items[-1] is an error (it is valid — last item).",
      ],
      examples: [
        "fruits = [\"apple\", \"banana\", \"cherry\"]",
        "print(fruits[0])   # apple",
        "print(fruits[-1])  # cherry",
      ],
      checkIdeas: [
        "What index is the first item?",
        "What does items[-1] return?",
      ],
      masteryChecks: 4,
    },
    {
      id: "len_empty",
      title: "len() and empty lists",
      teachingGoal:
        "Use len(items) for count; [] has length 0.",
      mustCover: [
        "len(list) returns how many items are in the list.",
        "len([]) is 0 — empty is not an error.",
        "Last valid index is len(list) - 1, not len(list).",
        "len works on lists (and strings) — different from list length property (there is none).",
      ],
      misconceptions: [
        "len([]) crashes or is undefined.",
        "The last index equals len(list).",
      ],
      examples: [
        "scores = [10, 20, 30]",
        "print(len(scores))  # 3",
        "print(len([]))      # 0",
      ],
      checkIdeas: [
        "What is len([\"a\", \"b\"])?",
        "What is the last valid index of a 3-item list?",
      ],
      masteryChecks: 3,
    },
    {
      id: "mutate_append",
      title: "Change lists — append & assignment",
      teachingGoal:
        "Lists are mutable: append() adds to the end; list[i] = new replaces an item.",
      mustCover: [
        "items.append(x) adds x to the end — changes the list in place.",
        "items[i] = new_value replaces the item at index i.",
        "append returns None — do not write x = items.append(y) expecting a new list.",
        "Assignment to an index does not change length unless you append.",
      ],
      misconceptions: [
        "append returns the updated list.",
        "lists[i] = x creates a copy instead of changing the original.",
      ],
      examples: [
        "bag = [\"key\"]",
        "bag.append(\"coin\")",
        "bag[0] = \"map\"",
      ],
      checkIdeas: [
        "What does append do?",
        "How do you replace the first item?",
      ],
      masteryChecks: 4,
    },
    {
      id: "slice_intro",
      title: "Basic slices",
      teachingGoal:
        "Use list[start:stop] to get a sub-list; stop is exclusive.",
      mustCover: [
        "items[start:stop] returns items from start up to but not including stop.",
        "items[:3] from the beginning; items[2:] from index 2 to the end.",
        "items[:] copies all items (shallow copy intro — just know it makes a new list).",
        "Slicing does not mutate the original list.",
      ],
      misconceptions: [
        "The stop index is included in the slice.",
        "Slicing removes items from the original list.",
      ],
      examples: [
        "nums = [10, 20, 30, 40]",
        "print(nums[1:3])  # [20, 30]",
        "print(nums[:2])   # [10, 20]",
      ],
      checkIdeas: [
        "What does [1:3] include?",
        "Does slicing change the original?",
      ],
      masteryChecks: 4,
    },
    {
      id: "for_each_item",
      title: "Loop over a list",
      teachingGoal:
        "Use for item in items: to visit every element in order.",
      mustCover: [
        "for x in items: runs the block once per item, left to right.",
        "The loop variable (x) is each item's value — not the index (unless you use range/len later).",
        "Empty list → loop body never runs.",
        "Indentation defines the loop body.",
      ],
      misconceptions: [
        "for i in items gives the index automatically (it gives the value).",
        "The loop skips the last item.",
      ],
      examples: [
        "scores = [8, 9, 10]",
        "for s in scores:",
        "    print(s)",
      ],
      checkIdeas: [
        "What does for x in items assign each time?",
        "How many times does the loop run for a 3-item list?",
      ],
      masteryChecks: 3,
    },
    {
      id: "membership",
      title: "Membership — in / not in",
      teachingGoal:
        "Test whether a value is in a list with in and not in.",
      mustCover: [
        "value in items → True if found, False otherwise.",
        "value not in items is the opposite.",
        "Membership checks content, not index.",
        "Useful before append to avoid duplicates (simple pattern).",
      ],
      misconceptions: [
        "in checks index numbers instead of values.",
        "not in means the list is empty.",
      ],
      examples: [
        'tags = ["python", "lists"]',
        'print("python" in tags)      # True',
        'print("java" not in tags)    # True',
      ],
      checkIdeas: [
        "What does \"a\" in [\"a\", \"b\"] return?",
        "Difference between in and indexing?",
      ],
      masteryChecks: 3,
    },
    {
      id: "nest_lists_lite",
      title: "Lists inside lists (lite)",
      teachingGoal:
        "A list can contain other lists; access with double indexing.",
      mustCover: [
        "matrix = [[1, 2], [3, 4]] — each item is a list.",
        "matrix[0] is the first row; matrix[0][1] is row 0, column 1.",
        "Read-only intro — no mutation of nested structure required yet.",
        "Useful for grids, scoreboards with rounds, simple tables.",
      ],
      misconceptions: [
        "matrix[0][1] means multiply indices.",
        "Nested lists flatten automatically.",
      ],
      examples: [
        "board = [[\"X\", \"O\"], [\" \", \"X\"]]",
        "print(board[0][0])  # X",
        "print(board[1][1])  # X",
      ],
      checkIdeas: [
        "How do you get the first item of the second inner list?",
        "What type is matrix[0]?",
      ],
      masteryChecks: 3,
    },
    {
      id: "list_vs_str",
      title: "Lists vs strings",
      teachingGoal:
        "Lists are mutable; strings are immutable — similar indexing, different mutation.",
      mustCover: [
        "Both support len, indexing, slicing, and for-loops.",
        "You can change a list item; you cannot assign into a string: s[0] = \"x\" fails.",
        "list(\"abc\") → [\"a\", \"b\", \"c\"] splits a string into single-char strings.",
        "str(list) prints a repr-like form — not the same as joining.",
      ],
      misconceptions: [
        "Strings and lists mutate the same way.",
        "word[0] = \"X\" works on a string.",
      ],
      examples: [
        "chars = list(\"hi\")",
        "chars[0] = \"H\"  # OK on list",
        '# word = "hi"; word[0] = "H"  → TypeError',
      ],
      checkIdeas: [
        "Can you change one character in a string?",
        "What does list(\"ab\") produce?",
      ],
      masteryChecks: 4,
    },
    {
      id: "common_list_bugs",
      title: "Common list bugs",
      teachingGoal:
        "Avoid IndexError and off-by-one when indexing or looping.",
      mustCover: [
        "IndexError: index out of range — often index == len(list) or negative beyond -len.",
        "Off-by-one: last valid index is len-1, not len.",
        "Empty list: no valid index 0.",
        "Check len before items[i] when unsure.",
      ],
      misconceptions: [
        "items[len(items)] is the last item.",
        "Loop for i in range(len(items)+1) is always safe.",
      ],
      examples: [
        "items = [\"a\", \"b\"]",
        "# print(items[2])  → IndexError",
        "print(items[len(items) - 1])  # last safely",
      ],
      checkIdeas: [
        "Why does items[3] fail on a 3-item list?",
        "What is the last valid index when len is 5?",
      ],
      masteryChecks: 4,
    },
    {
      id: "list_patterns",
      title: "Collect & filter (lite)",
      teachingGoal:
        "Build a new list in a loop: collect matches or transform items.",
      mustCover: [
        "Start with result = [] then append inside a loop.",
        "Filter lite: if condition: result.append(item).",
        "Collect lite: result.append(transform(item)) — e.g. str(n) or n * 2.",
        "Patterns preview list comprehensions later — keep explicit loops here.",
      ],
      misconceptions: [
        "You must know the final size before creating the list.",
        "Filtering requires a special built-in (a loop + append is enough).",
      ],
      examples: [
        "evens = []",
        "for n in [1, 2, 3, 4]:",
        "    if n % 2 == 0:",
        "        evens.append(n)",
      ],
      checkIdeas: [
        "How do you build a list of only high scores?",
        "Why start with result = []?",
      ],
      masteryChecks: 4,
    },
  ],
  apply: {
    title: "Inventory scoreboard",
    brief:
      "Build a small inventory or scoreboard program: create a list, append at least two items, replace one item by index, print len(), loop to print each entry, use in to check for a specific item, and collect a filtered sub-list (e.g. scores above a threshold or items containing a letter) — all without IndexError.",
    criteria: [
      "Creates a list with at least two initial items",
      "Uses append at least once",
      "Replaces an item with index assignment",
      "Prints len() of the list",
      "Loops with for ... in ... to print each item",
      "Uses in or not in to test membership",
      "Builds a second list in a loop with a simple filter or transform (append inside if)",
      "Runs without IndexError",
    ],
    hints: [
      "Start with inventory = [\"sword\", \"potion\"] or scores = [8, 12, 6].",
      "append adds to the end — bag.append(\"key\").",
      "Replace first item: items[0] = \"map\".",
      "Last index is len(items) - 1, never len(items).",
      "Filter: winners = []; for s in scores: if s >= 10: winners.append(s).",
      "Check membership: print(\"sword\" in inventory).",
    ],
    evaluationGuide:
      "Pass if the learner (1) defines a list with ≥2 items, (2) calls .append at least once, (3) assigns to an index to replace an item, (4) prints len(...), (5) uses for x in list to print items, (6) uses in or not in once, (7) builds a new list in a loop with append guarded by if or a simple transform, (8) would run without IndexError. Names and domain (inventory vs scoreboard) are flexible. Do not require nested lists, slices, or comprehensions.",
  },
}
