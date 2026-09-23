import type { ExerciseDTO, ResultResponse } from "./api-contract";

/**
 * Sample data for the exercise screen demo (/learn/demo/exercise). No real content:
 * the `exercises` table starts empty (D4) and the user writes the real exercises.
 *
 * Exercise texts are in English only (`locale: "en"`), the way the API would answer
 * when a translation is missing; the component marks them with `lang="en"`.
 */

/** Balance shown next to the exercise. Same fields as a ResultResponse, so the
 * screen can replace it with the server answer without any mapping. */
export type ProfileSnapshot = Pick<ResultResponse, "coins" | "xp" | "level" | "xpToNextLevel">;

/**
 * DEMO ONLY. What the server knows and the client never receives: the solution and
 * the text of the locked hints. `demo-api.ts` reads it to simulate the endpoints.
 */
export interface ServerSecrets {
	/** Index of the right option (multiple_choice) or expected text (other types). */
	solution: number | string;
	hintTexts: Record<string, string>;
}

export interface DemoScenario {
	id: string;
	/** Demo tooling, not product UI: English only and never translated. */
	label: string;
	profile: ProfileSnapshot;
	exercise: ExerciseDTO;
	secrets: ServerSecrets;
}

export const demoScenarios: DemoScenario[] = [
	{
		id: "no-coins",
		label: "New player: 0 coins, hints locked",
		profile: { coins: 0, xp: 0, level: 1, xpToNextLevel: 100 },
		exercise: {
			id: "5b1d0a4e-0c7a-4b8e-9f51-2f7d7c1a0001",
			slug: "python-list-slicing",
			languageSlug: "python",
			conceptSlug: "data-structures",
			category: "fundamentals",
			difficulty: 2,
			type: "multiple_choice",
			locale: "en",
			title: "Last three readings",
			context:
				"A weather station keeps its temperature readings in a list, oldest first. The dashboard only shows the latest ones.",
			objective: "Use negative indexes and slicing to read the end of a list without knowing its length.",
			prompt: "Which expression returns the last three readings, in their original order?",
			code: "readings = [14.2, 15.0, 15.8, 16.1, 15.4, 14.9]\nlatest = ???",
			options: ["readings[-3:]", "readings[:-3]", "readings[3:]", "readings[-1:-4:-1]"],
			reward: { coins: 1, xp: 20 },
			hints: [
				{ id: "h-py-1", order: 1, cost: 1, unlocked: false },
				{ id: "h-py-2", order: 2, cost: 1, unlocked: false },
			],
			completed: false,
		},
		secrets: {
			solution: 0,
			hintTexts: {
				"h-py-1": "A negative index counts from the end: readings[-1] is the last reading.",
				"h-py-2": "In a slice, leaving the end empty means \"up to the end of the list\".",
			},
		},
	},
	{
		id: "with-coins",
		label: "Coins to spend, one hint already unlocked",
		profile: { coins: 3, xp: 60, level: 2, xpToNextLevel: 140 },
		exercise: {
			id: "5b1d0a4e-0c7a-4b8e-9f51-2f7d7c1a0002",
			slug: "react-effect-dependencies",
			languageSlug: "react",
			conceptSlug: "hooks",
			category: "debugging",
			difficulty: 5,
			type: "multiple_choice",
			locale: "en",
			title: "The effect that never stops",
			context:
				"A profile page fetches the user every time it renders. The network tab shows hundreds of requests per second.",
			objective: "Choose the dependency array that runs an effect only when the value it uses changes.",
			prompt: "How should the effect be written so it fetches again only when userId changes?",
			code: "useEffect(() => {\n  fetchUser(userId).then(setUser);\n});",
			options: [
				"Add [] as the second argument",
				"Add [userId] as the second argument",
				"Add [user] as the second argument",
				"Move fetchUser outside the component",
			],
			reward: { coins: 2, xp: 50 },
			hints: [
				{
					id: "h-re-1",
					order: 1,
					cost: 1,
					unlocked: true,
					text: "Without a second argument, an effect runs after every render.",
				},
				{ id: "h-re-2", order: 2, cost: 1, unlocked: false },
				{ id: "h-re-3", order: 3, cost: 1, unlocked: false },
			],
			completed: false,
		},
		secrets: {
			solution: 1,
			hintTexts: {
				"h-re-2": "An empty array runs the effect once, so a new userId would be ignored.",
				"h-re-3": "List every value from the component that the effect reads.",
			},
		},
	},
	{
		id: "completed",
		label: "Exercise already completed: no reward",
		profile: { coins: 1, xp: 10, level: 3, xpToNextLevel: 290 },
		exercise: {
			id: "5b1d0a4e-0c7a-4b8e-9f51-2f7d7c1a0003",
			slug: "java-equals-hashcode",
			languageSlug: "java",
			conceptSlug: "oop",
			category: "fundamentals",
			difficulty: 8,
			type: "multiple_choice",
			locale: "en",
			title: "Duplicates in a HashSet",
			context:
				"An online shop stores products in a HashSet to avoid duplicates, yet the same product shows up twice in the cart.",
			objective: "Know which methods a class must override for hash-based collections to treat two objects as equal.",
			prompt: "Product overrides equals(). What else must it override so the HashSet removes duplicates?",
			code: "Set<Product> cart = new HashSet<>();\ncart.add(new Product(\"SKU-42\"));\ncart.add(new Product(\"SKU-42\"));\n// cart.size() == 2",
			options: ["toString()", "compareTo()", "hashCode()", "clone()"],
			reward: { coins: 3, xp: 80 },
			hints: [{ id: "h-ja-1", order: 1, cost: 1, unlocked: false }],
			completed: true,
		},
		secrets: {
			solution: 2,
			hintTexts: {
				"h-ja-1": "A HashSet first compares hashes, and only calls equals() when two hashes match.",
			},
		},
	},
	{
		id: "level-up",
		label: "Close to the next level: solving levels up",
		profile: { coins: 0, xp: 90, level: 1, xpToNextLevel: 10 },
		exercise: {
			id: "5b1d0a4e-0c7a-4b8e-9f51-2f7d7c1a0004",
			slug: "php-array-map-output",
			languageSlug: "php",
			conceptSlug: "functions-data",
			category: "fundamentals",
			difficulty: 7,
			type: "code_output",
			locale: "en",
			title: "What does it print?",
			context: "A shopping list script formats prices before printing them.",
			objective: "Follow how array_map applies a function to every element and keeps the order.",
			prompt: "What does this script print? Type the exact output.",
			code: "$prices = [3, 5, 8];\n$doubled = array_map(fn($p) => $p * 2, $prices);\necho implode(\",\", $doubled);",
			reward: { coins: 3, xp: 70 },
			hints: [
				{ id: "h-php-1", order: 1, cost: 1, unlocked: false },
				{ id: "h-php-2", order: 2, cost: 1, unlocked: false },
			],
			completed: false,
		},
		secrets: {
			solution: "6,10,16",
			hintTexts: {
				"h-php-1": "array_map returns a new array with the result of the function for each price.",
				"h-php-2": "implode joins the values with the separator and adds no spaces.",
			},
		},
	},
];
