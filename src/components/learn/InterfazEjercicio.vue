<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import type { ExerciseDTO, HintDTO, Locale, ResultResponse } from "@/types/api";
import type { ExerciseAnswer, ExerciseApi, ExerciseTexts, ProfileSnapshot } from "./exercise-ui";

/**
 * Exercise screen: context, technical goal, question, answer, 1-coin hints and the
 * "Solved / Not solved" result with the coins and XP earned.
 *
 * - Texts arrive translated by props (T6); placeholders such as {coins} are filled here.
 * - Rewards and balances always come from `api` (the server). This component never computes
 *   them and never knows the solution. Every new balance is emitted (`balance`) so the page
 *   can update the account menu.
 * - Errors of an action go to the `role="alert"` container: 401 with a link to sign in
 *   again (`loginHref`), 403 `forbidden_origin`, anything else a generic retry message.
 * - Accessibility follows docs/guidelines/accessibility.md: one polite live region rendered
 *   empty on the server (§5), locked hints with aria-disabled + visible explanation (§8),
 *   states with icon + text (§7), focus moved to the new content after each action (§3).
 */
const props = defineProps<{
	/** Language of the interface. The exercise content may be in another one (`exercise.locale`). */
	lang: Locale;
	exercise: ExerciseDTO;
	profile: ProfileSnapshot;
	texts: ExerciseTexts;
	api: ExerciseApi;
	/** Name and brand color of the exercise language, from `data/languages.ts`. */
	language?: { name: string; color: string };
	/** Login page with `?next=` back to this exercise, linked when the session has expired. */
	loginHref?: string;
}>();

const emit = defineEmits<{ balance: [balance: ProfileSnapshot] }>();

/** Why the last action failed, shown in the alert container. */
type Failure = "generic" | "unauthorized" | "forbidden";

function failureOf(error: unknown): Failure {
	const status = (error as { status?: number }).status;
	if (status === 401) return "unauthorized";
	if (status === 403) return "forbidden";
	return "generic";
}

type ResultKind = "correct" | "incorrect" | "notSolved";
interface ShownResult {
	kind: ResultKind;
	response: ResultResponse;
	levelBefore: number;
	answer: ExerciseAnswer;
}

const HINT_COST = 1;
const uid = `ex-${props.exercise.slug}`;

const balance = ref<ProfileSnapshot>({ ...props.profile });
const hints = ref<HintDTO[]>(props.exercise.hints.map((hint) => ({ ...hint })));
const completed = ref(props.exercise.completed);
const choice = ref<number | null>(null);
const typed = ref("");
const sending = ref(false);
const pendingHint = ref<string | null>(null);
const result = ref<ShownResult | null>(null);
const failure = ref<Failure | null>(null);
const announcement = ref("");

const resultHeading = ref<HTMLElement | null>(null);
const questionHeading = ref<HTMLElement | null>(null);
const hintTextEls = new Map<string, HTMLElement>();

// ---------- Text helpers ----------

const plural = new Intl.PluralRules(props.lang);
const number = new Intl.NumberFormat(props.lang);

function fill(template: string, vars: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (match, name) =>
		name in vars ? String(typeof vars[name] === "number" ? number.format(vars[name] as number) : vars[name]) : match,
	);
}

function coins(count: number): string {
	const template = plural.select(count) === "one" ? props.texts.coinOne : props.texts.coinOther;
	return fill(template, { count });
}

/** Content written for another locale is marked so screen readers switch voice (WCAG 3.1.2). */
const contentLang = computed(() => (props.exercise.locale !== props.lang ? props.exercise.locale : undefined));

// ---------- Derived state ----------

const levelTotal = computed(() => balance.value.xp + balance.value.xpToNextLevel);
const levelPercent = computed(() =>
	levelTotal.value > 0 ? Math.min(100, (balance.value.xp / levelTotal.value) * 100) : 0,
);
const hasAnswer = computed(() =>
	props.exercise.type === "multiple_choice" ? choice.value !== null : typed.value.trim() !== "",
);
const canPayHint = computed(() => balance.value.coins >= HINT_COST);
const hasLockedHints = computed(() => hints.value.some((hint) => !hint.unlocked));
const answering = computed(() => result.value === null);

const resultTitle = computed(() => {
	if (!result.value) return "";
	const { kind } = result.value;
	if (kind === "correct") return props.texts.resultCorrect;
	if (kind === "incorrect") return props.texts.resultIncorrect;
	return props.texts.resultNotSolved;
});

/** Result lines, shown in the panel and announced together as one message (guide §5). */
const resultLines = computed(() => {
	if (!result.value) return [];
	const { response, levelBefore } = result.value;
	if (!response.correct) return [props.texts.resultNoReward];
	if (!response.firstCompletion) return [props.texts.resultAlreadyCompleted];
	const lines = [fill(props.texts.resultEarned, { coins: coins(response.coinsAwarded), xp: response.xpAwarded })];
	if (response.level > levelBefore) lines.push(fill(props.texts.resultLevelUp, { level: response.level }));
	return lines;
});

const leveledUp = computed(() => !!result.value && result.value.response.level > result.value.levelBefore);

/** "Your session has expired. {signIn} to save your result." split around the link. */
const sessionExpiredParts = computed(() => {
	const [before = "", after = ""] = props.texts.sessionExpired.split("{signIn}");
	return { before, after };
});

function setBalance(next: ProfileSnapshot) {
	balance.value = next;
	emit("balance", { ...next });
}

// ---------- Live region ----------

let announceTimer: ReturnType<typeof setTimeout> | undefined;

/** Clears the region first so repeating the same message is announced again. */
function announce(message: string) {
	clearTimeout(announceTimer);
	announcement.value = "";
	announceTimer = setTimeout(() => {
		announcement.value = message;
	}, 60);
}

onBeforeUnmount(() => clearTimeout(announceTimer));

// ---------- Hints ----------

function setHintTextEl(id: string, el: unknown) {
	if (el instanceof HTMLElement) hintTextEls.set(id, el);
	else hintTextEls.delete(id);
}

async function unlockHint(hint: HintDTO) {
	if (pendingHint.value) return;
	// aria-disabled keeps the button focusable, so the click has to be ignored here (guide §8)
	if (!canPayHint.value) {
		announce(fill(props.texts.hintNoCoins, { coins: coins(HINT_COST) }));
		return;
	}
	pendingHint.value = hint.id;
	failure.value = null;
	try {
		const response = await props.api.unlockHint(hint.id);
		setBalance({ ...balance.value, coins: response.coins });
		hints.value = hints.value.map((item) => (item.id === hint.id ? response.hint : item));
		announce(fill(props.texts.hintUnlocked, { n: hint.order, coins: coins(response.coins) }));
		await nextTick();
		// The button is gone: focus the text that replaced it
		hintTextEls.get(hint.id)?.focus();
	} catch (error) {
		if ((error as { status?: number }).status === 402) {
			// The server has fewer coins than this page thought (e.g. spent in another tab):
			// show the "no coins" state of the hints, with its visible reason (guide §8)
			setBalance({ ...balance.value, coins: 0 });
			announce(fill(props.texts.hintNoCoins, { coins: coins(HINT_COST) }));
		} else {
			// Shown in the role="alert" container, which announces it (guide §5)
			failure.value = failureOf(error);
		}
	} finally {
		pendingHint.value = null;
	}
}

// ---------- Result ----------

async function submit(solved: boolean) {
	if (sending.value || !answering.value) return;
	if (solved && !hasAnswer.value) {
		announce(props.texts.answerFirst);
		return;
	}
	const answer: ExerciseAnswer = !solved
		? null
		: props.exercise.type === "multiple_choice"
			? choice.value
			: typed.value.trim();

	sending.value = true;
	failure.value = null;
	const levelBefore = balance.value.level;
	try {
		const response = await props.api.submitResult(answer);
		const { coins: newCoins, xp, level, xpToNextLevel } = response;
		setBalance({ coins: newCoins, xp, level, xpToNextLevel });
		if (response.correct) completed.value = true;
		result.value = {
			kind: !solved ? "notSolved" : response.correct ? "correct" : "incorrect",
			response,
			levelBefore,
			answer,
		};
		// Focus reads the title ("Correct") from the h2, so the region only adds the rest,
		// as one message and not several in a row: "You earn … Level up! …"
		announce(resultLines.value.join(" "));
		await nextTick();
		// The action buttons were replaced by the result: move focus to it (guide §3)
		resultHeading.value?.focus();
	} catch (error) {
		// Shown in the role="alert" container, which announces it (guide §5)
		failure.value = failureOf(error);
	} finally {
		sending.value = false;
	}
}

async function retry() {
	result.value = null;
	choice.value = null;
	typed.value = "";
	await nextTick();
	questionHeading.value?.focus();
}
</script>

<template>
	<article class="exercise" :aria-labelledby="`${uid}-title`">
		<!-- Balance: level, XP towards the next level and coins -->
		<!-- A named group, not a landmark: only the result is a region (B10) -->
		<div class="progress" role="group" :aria-label="texts.progress">
			<span class="level" :class="{ 'level-up': leveledUp }">{{ fill(texts.level, { level: balance.level }) }}</span>
			<span class="xp">
				<span class="xp-track" aria-hidden="true">
					<span class="xp-fill" :style="{ transform: `scaleX(${levelPercent / 100})` }"></span>
				</span>
				<span class="xp-text">{{ fill(texts.xpProgress, { xp: balance.xp, total: levelTotal }) }}</span>
			</span>
			<span class="coins">
				<svg class="icon coin-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<circle cx="12" cy="12" r="9" />
					<path d="M12 7.5v9M9.5 9.5h3.75a1.75 1.75 0 0 1 0 3.5h-2.5a1.75 1.75 0 0 0 0 3.5h3.75" />
				</svg>
				{{ coins(balance.coins) }}
			</span>
		</div>

		<h1 :id="`${uid}-title`" :lang="contentLang">{{ exercise.title }}</h1>

		<ul class="meta">
			<li v-if="language">
				<span class="lang-dot" :style="{ background: language.color }" aria-hidden="true"></span>
				{{ language.name }}
			</li>
			<li :lang="contentLang">{{ exercise.categoryName }}</li>
			<li>{{ fill(texts.difficulty, { n: exercise.difficulty }) }}</li>
			<li>{{ fill(texts.reward, { coins: coins(exercise.reward.coins), xp: exercise.reward.xp }) }}</li>
			<li v-if="completed" class="state-tag success">
				<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
				{{ texts.completed }}
			</li>
		</ul>

		<dl class="brief">
			<template v-if="exercise.context">
				<dt>{{ texts.context }}</dt>
				<dd :lang="contentLang">{{ exercise.context }}</dd>
			</template>
			<dt>{{ texts.objective }}</dt>
			<dd class="objective" :lang="contentLang">{{ exercise.objective }}</dd>
		</dl>

		<section class="question" :aria-labelledby="`${uid}-question`">
			<h2 :id="`${uid}-question`" ref="questionHeading" tabindex="-1">{{ texts.question }}</h2>
			<p class="prompt" :lang="contentLang">{{ exercise.prompt }}</p>
			<pre v-if="exercise.code" class="code"><code>{{ exercise.code }}</code></pre>

			<fieldset v-if="exercise.type === 'multiple_choice' && exercise.options" class="options" :disabled="!answering">
				<legend>{{ texts.chooseAnswer }}</legend>
				<label v-for="(option, index) in exercise.options" :key="index" class="option">
					<input v-model="choice" type="radio" :name="`${uid}-option`" :value="index" />
					<span class="option-text" :lang="contentLang">{{ option }}</span>
					<span v-if="result && result.answer === index" class="your-answer">{{ texts.resultYourAnswer }}</span>
				</label>
			</fieldset>
			<div v-else class="free-answer">
				<label :for="`${uid}-answer`">{{ texts.answerLabel }}</label>
				<input
					:id="`${uid}-answer`"
					v-model="typed"
					type="text"
					autocomplete="off"
					spellcheck="false"
					:readonly="!answering"
				/>
			</div>
		</section>

		<section v-if="hints.length > 0" class="hints" :aria-labelledby="`${uid}-hints`">
			<h2 :id="`${uid}-hints`">{{ texts.hintHeading }}</h2>
			<p class="hints-intro">{{ fill(texts.hintIntro, { coins: coins(HINT_COST) }) }}</p>
			<ol class="hint-list">
				<li v-for="hint in hints" :key="hint.id">
					<p v-if="hint.unlocked" :ref="(el) => setHintTextEl(hint.id, el)" class="hint-text" tabindex="-1">
						<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z" />
						</svg>
						<span>
							<strong>{{ fill(texts.hintLabel, { n: hint.order }) }}</strong>
							<span :lang="contentLang">{{ hint.text }}</span>
						</span>
					</p>
					<button
						v-else
						type="button"
						class="hint-button"
						:aria-disabled="!canPayHint || pendingHint !== null ? 'true' : undefined"
						:aria-describedby="!canPayHint ? `${uid}-hint-why` : undefined"
						:aria-busy="pendingHint === hint.id ? 'true' : undefined"
						@click="unlockHint(hint)"
					>
						<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<rect x="5" y="11" width="14" height="10" rx="2" />
							<path d="M8 11V8a4 4 0 0 1 8 0v3" />
						</svg>
						{{ fill(texts.hintUnlock, { n: hint.order, coins: coins(hint.cost) }) }}
					</button>
				</li>
			</ol>
			<!-- Visible reason for the locked hint buttons (guide §8) -->
			<p v-if="!canPayHint && hasLockedHints" :id="`${uid}-hint-why`" class="why">
				<svg class="icon warning-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<circle cx="12" cy="12" r="9" />
					<path d="M12 7.5v5.5M12 16.5v.01" />
				</svg>
				{{ fill(texts.hintNoCoins, { coins: coins(HINT_COST) }) }}
			</p>
		</section>

		<div v-if="answering" class="actions">
			<div class="action-buttons">
				<button
					type="button"
					class="primary"
					:aria-disabled="!hasAnswer || sending ? 'true' : undefined"
					:aria-describedby="!hasAnswer ? `${uid}-answer-first` : undefined"
					@click="submit(true)"
				>
					<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
					{{ sending ? texts.sending : texts.solved }}
				</button>
				<button type="button" class="secondary" :aria-disabled="sending ? 'true' : undefined" @click="submit(false)">
					{{ texts.notSolved }}
				</button>
			</div>
			<p v-if="!hasAnswer" :id="`${uid}-answer-first`" class="why">{{ texts.answerFirst }}</p>
		</div>

		<section v-else-if="result" class="result" :class="result.kind === 'correct' ? 'success' : 'error'" :aria-labelledby="`${uid}-result`">
			<span class="result-icon" aria-hidden="true">
				<svg v-if="result.kind === 'correct'" class="icon" viewBox="0 0 24 24" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
				<svg v-else class="icon" viewBox="0 0 24 24" focusable="false"><path d="M7 7l10 10M17 7L7 17" /></svg>
			</span>
			<div class="result-body">
				<h2 :id="`${uid}-result`" ref="resultHeading" tabindex="-1">{{ resultTitle }}</h2>
				<p v-for="(line, index) in resultLines" :key="index" :class="{ 'level-line': leveledUp && index === 1 }">
					<svg v-if="leveledUp && index === 1" class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />
					</svg>
					{{ line }}
				</p>
				<button type="button" class="secondary" @click="retry">{{ texts.resultRetry }}</button>
			</div>
		</section>

		<!-- Always rendered (empty on the server) so the alert is announced when its text
		     appears. Errors are the accepted exception to "one live region" (guide §5, B10) -->
		<div class="submit-error" role="alert">
			<p v-if="failure" class="why error-text">
				<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 7l10 10M17 7L7 17" /></svg>
				<span v-if="failure === 'unauthorized' && loginHref">
					{{ sessionExpiredParts.before }}<a :href="loginHref" data-astro-reload>{{ texts.signIn }}</a>{{ sessionExpiredParts.after }}
				</span>
				<span v-else-if="failure === 'unauthorized'">{{ fill(texts.sessionExpired, { signIn: texts.signIn }) }}</span>
				<span v-else-if="failure === 'forbidden'">{{ texts.forbidden }}</span>
				<span v-else>{{ texts.error }}</span>
			</p>
		</div>

		<!-- Rendered empty on the server so screen readers already track it (guide §5) -->
		<p class="sr-only" aria-live="polite">{{ announcement }}</p>
	</article>
</template>

<style scoped>
.exercise {
	--line: rgba(255, 255, 255, 0.1);
	--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
	max-width: 44rem;
	margin: 0 auto;
	text-align: start;
}

.exercise *,
.exercise *::before,
.exercise *::after {
	box-sizing: border-box;
}

.icon {
	width: 1.15em;
	height: 1.15em;
	flex: none;
	fill: none;
	stroke: currentColor;
	stroke-width: 2;
	stroke-linecap: round;
	stroke-linejoin: round;
}

/* ---------- Balance ---------- */
.progress {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.5rem 1.25rem;
	width: fit-content;
	max-width: 100%;
	margin-bottom: 2.5rem;
	padding: 0.5rem 1.1rem 0.5rem 0.5rem;
	border: 1px solid var(--line);
	border-radius: 99px;
	background: var(--card-bg);
	font-size: 0.9rem;
}

.level {
	padding: 0.2rem 0.75rem;
	border-radius: 99px;
	background: var(--brand);
	color: var(--on-brand);
	font-weight: 800;
}

.level.level-up {
	animation: level-up 0.9s var(--ease-out) 0.2s;
}

@keyframes level-up {
	0% {
		transform: scale(1);
		box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.6);
	}
	40% {
		transform: scale(1.12);
	}
	100% {
		transform: scale(1);
		box-shadow: 0 0 0 14px rgba(167, 139, 250, 0);
	}
}

.xp {
	display: inline-flex;
	align-items: center;
	gap: 0.6rem;
	color: var(--text-muted);
	font-variant-numeric: tabular-nums;
}

.xp-track {
	width: 7rem;
	height: 6px;
	overflow: hidden;
	border-radius: 6px;
	background: var(--grid-dot);
}

.xp-fill {
	display: block;
	height: 100%;
	border-radius: inherit;
	background: var(--brand);
	transform-origin: left center;
	transition: transform 0.7s var(--ease-out);
}

.coins {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	color: var(--text-secondary);
	font-weight: 600;
	font-variant-numeric: tabular-nums;
}

.coin-icon {
	color: var(--warning);
}

/* ---------- Heading and details ---------- */
h1 {
	margin: 0 0 0.9rem;
	font-size: 2.6rem;
	line-height: 1.08;
	letter-spacing: -0.025em;
	text-wrap: balance;
}

.meta {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem 1.25rem;
	margin: 0 0 2.25rem;
	padding: 0;
	list-style: none;
	color: var(--text-muted);
	font-size: 0.92rem;
}

.meta li {
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
}

.lang-dot {
	width: 0.6rem;
	height: 0.6rem;
	border-radius: 50%;
}

.state-tag.success {
	color: var(--success);
	font-weight: 600;
}

.brief {
	display: grid;
	grid-template-columns: 9rem minmax(0, 1fr);
	gap: 0;
	margin: 0 0 2.75rem;
	border-top: 1px solid var(--line);
}

.brief dt,
.brief dd {
	margin: 0;
	padding: 1rem 0;
	border-bottom: 1px solid var(--line);
	line-height: 1.6;
}

.brief dt {
	color: var(--text-muted);
	font-size: 0.92rem;
	font-weight: 600;
	padding-top: 1.1rem;
}

.brief dd {
	color: var(--text-secondary);
}

.brief dd.objective {
	color: var(--text-color);
	font-weight: 600;
}

/* ---------- Question ---------- */
h2 {
	margin: 0 0 0.75rem;
	color: var(--text-color);
	font-size: 1.3rem;
	letter-spacing: -0.01em;
}

h2:focus {
	outline: none;
}

h2:focus-visible {
	outline: 2px solid var(--focus-ring);
	outline-offset: 4px;
	border-radius: 4px;
}

.question {
	margin-bottom: 2.75rem;
}

.prompt {
	max-width: 65ch;
	margin: 0 0 1.25rem;
	color: var(--text-secondary);
	font-size: 1.1rem;
	line-height: 1.6;
}

.code {
	margin: 0 0 1.75rem;
	padding: 1.1rem 1.25rem;
	overflow-x: auto;
	border: 1px solid var(--line);
	border-radius: 14px;
	background: var(--surface-deep);
	color: var(--text-secondary);
	font-family: ui-monospace, "Cascadia Code", "SF Mono", Consolas, monospace;
	font-size: 0.95rem;
	line-height: 1.65;
	tab-size: 2;
}

.options {
	display: grid;
	gap: 0.6rem;
	margin: 0;
	padding: 0;
	border: 0;
	min-width: 0;
}

.options legend {
	margin-bottom: 0.75rem;
	padding: 0;
	color: var(--text-muted);
	font-size: 0.95rem;
	font-weight: 600;
}

.option {
	display: flex;
	align-items: center;
	gap: 0.85rem;
	min-height: 3rem;
	padding: 0.7rem 1rem;
	border: 1px solid var(--line);
	border-radius: 14px;
	background: var(--card-bg);
	color: var(--text-secondary);
	cursor: pointer;
	transition:
		border-color 0.15s ease,
		background 0.15s ease;
}

.option input {
	width: 1.15rem;
	height: 1.15rem;
	margin: 0;
	flex: none;
	accent-color: var(--brand);
	cursor: inherit;
}

.option-text {
	flex: 1;
	min-width: 0;
	overflow-wrap: anywhere;
}

.option:hover {
	border-color: rgba(167, 139, 250, 0.5);
}

/* Selected: thicker border and tint, not only color; the radio itself also shows it */
.option:has(input:checked) {
	border-color: var(--brand);
	box-shadow: inset 0 0 0 1px var(--brand);
	background: rgba(167, 139, 250, 0.08);
	color: var(--text-color);
}

.options:disabled .option {
	cursor: default;
}

.options:disabled .option:not(:has(input:checked)) {
	opacity: 0.6;
}

.your-answer {
	flex: none;
	padding: 0.15rem 0.6rem;
	border: 1px solid var(--text-subtle);
	border-radius: 99px;
	color: var(--text-secondary);
	font-size: 0.8rem;
	font-weight: 600;
}

.free-answer {
	display: grid;
	gap: 0.5rem;
}

.free-answer label {
	color: var(--text-muted);
	font-size: 0.95rem;
	font-weight: 600;
}

.free-answer input {
	min-height: 3rem;
	padding: 0.6rem 1rem;
	border: 1px solid var(--text-subtle);
	border-radius: 12px;
	background: var(--surface-deep);
	color: var(--text-color);
	caret-color: var(--brand);
	font-family: ui-monospace, "Cascadia Code", "SF Mono", Consolas, monospace;
	font-size: 1rem;
}

.free-answer input:read-only {
	border-color: var(--line);
	color: var(--text-secondary);
}

/* ---------- Hints ---------- */
.hints {
	margin-bottom: 2.75rem;
}

.hints-intro {
	margin: 0 0 1rem;
	color: var(--text-muted);
	font-size: 0.95rem;
}

.hint-list {
	display: grid;
	gap: 0.6rem;
	margin: 0;
	padding: 0;
	list-style: none;
}

.hint-button {
	display: inline-flex;
	align-items: center;
	gap: 0.6rem;
	min-height: 2.75rem;
	padding: 0.5rem 1.1rem;
	border: 1px dashed var(--text-subtle);
	border-radius: 12px;
	background: transparent;
	color: var(--text-secondary);
	font: inherit;
	font-size: 0.95rem;
	font-weight: 600;
	cursor: pointer;
	transition:
		border-color 0.15s ease,
		background 0.15s ease;
}

.hint-button:hover:not([aria-disabled="true"]) {
	border-color: var(--brand);
	border-style: solid;
	background: rgba(167, 139, 250, 0.08);
}

/* Still focusable and announced as unavailable; the reason is in .why (guide §8) */
.hint-button[aria-disabled="true"] {
	color: var(--text-subtle);
	cursor: not-allowed;
}

.hint-button[aria-busy="true"] {
	cursor: progress;
}

.hint-text {
	display: flex;
	gap: 0.75rem;
	margin: 0;
	padding: 0.9rem 1.1rem;
	border-radius: 12px;
	background: var(--surface-sunken);
	color: var(--text-secondary);
	line-height: 1.55;
	animation: reveal 0.35s var(--ease-out);
}

.hint-text .icon {
	margin-top: 0.2rem;
	color: var(--brand);
}

.hint-text strong {
	margin-right: 0.4rem;
	color: var(--text-color);
}

.hint-text:focus {
	outline: none;
}

.hint-text:focus-visible {
	outline: 2px solid var(--focus-ring);
	outline-offset: 2px;
}

.why {
	display: flex;
	align-items: flex-start;
	gap: 0.5rem;
	margin: 0.9rem 0 0;
	color: var(--text-muted);
	font-size: 0.92rem;
	line-height: 1.5;
}

.why .icon {
	margin-top: 0.1rem;
}

.warning-icon {
	color: var(--warning);
}

.error-text {
	color: var(--error);
}

.error-text a {
	color: var(--text-color);
	font-weight: 700;
	text-decoration: underline;
	text-underline-offset: 3px;
}

/* ---------- Actions ---------- */
.action-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.primary,
.secondary {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	min-height: 3rem;
	padding: 0.6rem 1.6rem;
	border-radius: 99px;
	font: inherit;
	font-size: 1.02rem;
	font-weight: 700;
	cursor: pointer;
	transition:
		background 0.15s ease,
		border-color 0.15s ease,
		transform 0.1s ease;
}

.primary {
	border: none;
	background: var(--brand);
	color: var(--on-brand);
}

.primary:hover:not([aria-disabled="true"]) {
	background: var(--brand-hover);
}

.secondary {
	border: 1px solid var(--text-subtle);
	background: transparent;
	color: var(--text-secondary);
}

.secondary:hover:not([aria-disabled="true"]) {
	border-color: var(--text-muted);
	color: var(--text-color);
}

.primary:active:not([aria-disabled="true"]),
.secondary:active:not([aria-disabled="true"]) {
	transform: scale(0.97);
}

.primary[aria-disabled="true"] {
	background: var(--grid-dot);
	color: var(--text-muted);
	cursor: not-allowed;
}

.secondary[aria-disabled="true"] {
	cursor: not-allowed;
}

/* ---------- Result ---------- */
.result {
	--state: var(--success);
	display: flex;
	gap: 1.1rem;
	padding: 1.5rem;
	border: 1px solid var(--state);
	border-radius: 18px;
	background: var(--success-bg);
	animation: reveal 0.4s var(--ease-out);
}

.result.error {
	--state: var(--error);
	background: var(--error-bg);
}

.result-icon {
	display: grid;
	place-items: center;
	width: 2.75rem;
	height: 2.75rem;
	flex: none;
	border: 2px solid var(--state);
	border-radius: 50%;
	color: var(--state);
}

.result-icon .icon {
	width: 1.4rem;
	height: 1.4rem;
	stroke-width: 2.5;
}

.result-body {
	min-width: 0;
}

.result h2 {
	margin: 0.35rem 0 0.5rem;
	color: var(--state);
	font-size: 1.45rem;
}

.result p {
	display: flex;
	align-items: flex-start;
	gap: 0.5rem;
	margin: 0 0 0.35rem;
	color: var(--text-secondary);
	line-height: 1.55;
}

.result .level-line {
	color: var(--text-color);
	font-weight: 700;
}

.level-line .icon {
	margin-top: 0.15rem;
	color: var(--brand);
}

.result .secondary {
	margin-top: 1rem;
}

@keyframes reveal {
	from {
		opacity: 0;
		transform: translateY(6px);
	}
	to {
		opacity: 1;
		transform: none;
	}
}

@media (max-width: 846px) {
	h1 {
		font-size: 2rem;
	}

	.progress {
		border-radius: 18px;
	}

	.brief {
		grid-template-columns: minmax(0, 1fr);
	}

	.brief dt {
		padding-bottom: 0;
		border-bottom: 0;
	}

	.brief dd {
		padding-top: 0.25rem;
	}

	.result {
		padding: 1.25rem;
	}

	.action-buttons > button {
		flex: 1 1 10rem;
	}
}

@media (prefers-reduced-motion: reduce) {
	.level.level-up,
	.hint-text,
	.result {
		animation: none;
	}

	.xp-fill,
	.option,
	.hint-button,
	.primary,
	.secondary {
		transition: none;
	}
}
</style>
