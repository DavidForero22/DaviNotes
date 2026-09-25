<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Language roulette of /learn (C7, D8). Evolves the reel of `LanguageSuggestion`: it spins
 * only among the active languages of the user and the result links to
 * `/learn/play?language=x`, which opens a random exercise of that language.
 *
 * - Two or more languages: "Spin" button (shown once hydrated) and, under it, a direct link
 *   per language, so the page also works without JavaScript.
 * - One language: no spin; the reel already shows it with its link.
 * - Zero languages: the page renders its own invitation to the profile, not this island.
 *
 * Texts arrive already translated from the Astro page (T6); `{lang}` is replaced here.
 */
export interface RouletteLanguage {
	slug: string;
	name: string;
	/** Brand color of the language (the same one of its home page card). */
	color: string;
	icon?: string;
}

export interface RouletteTexts {
	spin: string;
	spinAgain: string;
	/** "Ha salido {lang}." — announced once the reel stops. */
	result: string;
	/** "Resolver un ejercicio de {lang}" */
	play: string;
	direct: string;
}

const props = defineProps<{
	languages: RouletteLanguage[];
	/** Localized `/learn/play`; `?language=` is added here. */
	playHref: string;
	texts: RouletteTexts;
}>();

/** Rows the strip runs through before stopping; the last one is the result. */
const SPIN_ROWS = 16;
const SPIN_MS = 1700;

const single = props.languages.length === 1;
const ready = ref(false);
const spinning = ref(false);
const landed = ref<RouletteLanguage | null>(single ? props.languages[0]! : null);
const announcement = ref("");

/** Rows of the reel strip (null = the idle "?"); `offset` is the visible row. */
const strip = ref<(RouletteLanguage | null)[]>([landed.value]);
const offset = ref(0);
const animated = ref(false);
const stripEl = ref<HTMLElement | null>(null);
let fallback: ReturnType<typeof setTimeout> | undefined;

const fill = (template: string, language: RouletteLanguage) => template.replace("{lang}", language.name);
const hrefFor = (language: RouletteLanguage) => `${props.playHref}?language=${encodeURIComponent(language.slug)}`;

const current = computed(() => strip.value[offset.value] ?? null);

function pick(exclude?: RouletteLanguage | null): RouletteLanguage {
	const options = props.languages.filter((language) => language !== exclude);
	const pool = options.length > 0 ? options : props.languages;
	return pool[Math.floor(Math.random() * pool.length)]!;
}

function land(choice: RouletteLanguage) {
	clearTimeout(fallback);
	strip.value = [choice];
	animated.value = false;
	offset.value = 0;
	landed.value = choice;
	spinning.value = false;
	announcement.value = fill(props.texts.result, choice);
}

async function spin() {
	if (spinning.value || props.languages.length < 2) return;
	// Never repeats the previous result, so every spin visibly changes it
	const choice = pick(landed.value);
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		land(choice);
		return;
	}

	spinning.value = true;
	announcement.value = "";
	const rows: (RouletteLanguage | null)[] = [current.value];
	for (let i = 0; i < SPIN_ROWS - 1; i += 1) rows.push(pick(rows[rows.length - 1]));
	if (rows[rows.length - 1] === choice) rows.push(pick(choice));
	rows.push(choice);

	// Jump to the first row without a transition, then run the strip to the last one
	animated.value = false;
	offset.value = 0;
	strip.value = rows;
	await nextTick();
	void stripEl.value?.offsetHeight;
	animated.value = true;
	offset.value = rows.length - 1;
	fallback = setTimeout(() => land(choice), SPIN_MS + 200);
}

function onStripEnd(event: TransitionEvent) {
	if (event.target !== stripEl.value || !spinning.value) return;
	const choice = strip.value[strip.value.length - 1];
	if (choice) land(choice);
}

onMounted(() => {
	ready.value = true;
});
onBeforeUnmount(() => clearTimeout(fallback));
</script>

<template>
	<div class="roulette" :class="{ landed: landed && !spinning }">
		<!-- Visual only: the result is announced once, through the live region below -->
		<div class="reel" :style="landed && !spinning ? { '--lang-color': landed.color } : undefined" aria-hidden="true">
			<div class="window">
				<div
					ref="stripEl"
					class="strip"
					:class="{ animated }"
					:style="{ transform: `translateY(${(-offset / strip.length) * 100}%)`, '--rows': strip.length, '--spin-ms': `${SPIN_MS}ms` }"
					@transitionend="onStripEnd"
				>
					<div v-for="(row, index) in strip" :key="index" class="row" :style="{ height: `${100 / strip.length}%` }">
						<template v-if="row">
							<img v-if="row.icon" :src="row.icon" alt="" width="36" height="36" class="row-icon" />
							<span class="row-name">{{ row.name }}</span>
						</template>
						<span v-else class="row-name idle">?</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Rendered empty on the server so screen readers already track it when it changes -->
		<p class="sr-only" aria-live="polite">{{ announcement }}</p>

		<div class="actions">
			<!-- The button does nothing without JavaScript, so it only appears once hydrated -->
			<button
				v-if="!single"
				type="button"
				class="spin-button"
				:class="{ secondary: landed }"
				:hidden="!ready"
				:aria-disabled="spinning"
				@click="spin"
			>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M20 12a8 8 0 1 1-2.34-5.66L20 8.5M20 4v4.5h-4.5" />
				</svg>
				{{ landed ? texts.spinAgain : texts.spin }}
			</button>
			<a v-if="landed && !spinning" :href="hrefFor(landed)" class="play-link">
				{{ fill(texts.play, landed) }}
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M5 12h14M13 6l6 6-6 6" />
				</svg>
			</a>
		</div>

		<div v-if="!single" class="direct">
			<p id="roulette-direct" class="direct-label">{{ texts.direct }}</p>
			<ul class="direct-list" aria-labelledby="roulette-direct">
				<li v-for="language in languages" :key="language.slug">
					<a :href="hrefFor(language)" class="direct-link" :style="{ '--lang-color': language.color }">
						<span class="direct-dot" aria-hidden="true" />
						{{ language.name }}
					</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<style scoped>
.roulette {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5rem;
}

/* ---------- Reel ---------- */
.reel {
	position: relative;
	width: min(100%, 24rem);
	height: 6rem;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 20px;
	background: var(--card-bg);
	box-shadow:
		inset 0 12px 20px -14px rgba(0, 0, 0, 0.85),
		inset 0 -12px 20px -14px rgba(0, 0, 0, 0.85),
		0 18px 40px -24px rgba(0, 0, 0, 0.8);
	transition: border-color 0.3s ease;
}

.landed .reel {
	border-color: color-mix(in srgb, var(--lang-color, var(--brand)) 55%, transparent);
}

/* Brand color of the language under its name, once it stops */
.reel::after {
	content: "";
	position: absolute;
	right: 1.25rem;
	bottom: 0.85rem;
	left: 1.25rem;
	height: 3px;
	border-radius: 3px;
	background: var(--lang-color, transparent);
	transition: background 0.3s ease;
}

/* Names fade in and out at the top and bottom edges while the strip runs */
.window {
	position: absolute;
	inset: 0;
	mask-image: linear-gradient(to bottom, transparent 0, #000 24%, #000 76%, transparent 100%);
}

.strip {
	height: calc(var(--rows) * 100%);
	will-change: transform;
}

/* Fast start, long settle: the one authored motion of the page */
.strip.animated {
	transition: transform var(--spin-ms) cubic-bezier(0.12, 0.72, 0.18, 1);
}

.row {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.85rem;
}

.row-icon {
	width: 2.25rem;
	height: 2.25rem;
	object-fit: contain;
}

.row-name {
	color: var(--text-color);
	font-size: 2.25rem;
	font-weight: 800;
	letter-spacing: -0.02em;
}

.row-name.idle {
	color: var(--text-muted);
	font-size: 2rem;
}

/* ---------- Actions ---------- */
.actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.75rem;
}

.spin-button,
.play-link {
	box-sizing: border-box;
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	min-height: 3rem;
	padding: 0.6rem 1.6rem;
	border-radius: 99px;
	font: inherit;
	font-size: 1.05rem;
	font-weight: 700;
	text-decoration: none;
	cursor: pointer;
	transition:
		background 0.15s ease,
		border-color 0.15s ease,
		color 0.15s ease,
		transform 0.1s ease;
}

.spin-button svg,
.play-link svg {
	width: 1.15rem;
	height: 1.15rem;
	flex: none;
	fill: none;
	stroke: currentColor;
	stroke-width: 2;
	stroke-linecap: round;
	stroke-linejoin: round;
}

.spin-button[hidden] {
	display: none;
}

.spin-button {
	border: 1px solid transparent;
	background: var(--brand);
	color: var(--on-brand);
}

.spin-button:hover:not([aria-disabled="true"]) {
	background: var(--brand-hover);
}

/* After the first spin the exercise link is the main action */
.spin-button.secondary {
	border-color: var(--text-subtle);
	background: transparent;
	color: var(--text-secondary);
}

.spin-button.secondary:hover:not([aria-disabled="true"]) {
	border-color: var(--text-muted);
	background: transparent;
	color: var(--text-color);
}

.spin-button:active:not([aria-disabled="true"]) {
	transform: scale(0.97);
}

/* Only during the spin; aria-disabled keeps keyboard focus on the button */
.spin-button[aria-disabled="true"] {
	cursor: progress;
}

.spin-button[aria-disabled="true"] svg {
	animation: turn 0.8s linear infinite;
}

@keyframes turn {
	to {
		transform: rotate(360deg);
	}
}

.play-link {
	background: var(--brand);
	color: var(--on-brand);
	animation: rise 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.play-link:hover {
	background: var(--brand-hover);
}

.play-link:hover svg {
	transform: translateX(2px);
}

@keyframes rise {
	from {
		opacity: 0;
		transform: translateY(6px);
	}
}

/* ---------- Direct links (also the path without JavaScript) ---------- */
.direct {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	gap: 0.5rem 0.75rem;
}

.direct-label {
	margin: 0;
	color: var(--text-muted);
	font-size: 0.92rem;
}

.direct-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.5rem;
	margin: 0;
	padding: 0;
	list-style: none;
}

.direct-link {
	box-sizing: border-box;
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
	min-height: 2.25rem;
	padding: 0.25rem 0.85rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 99px;
	color: var(--text-secondary);
	font-size: 0.9rem;
	font-weight: 600;
	text-decoration: none;
	transition:
		border-color 0.15s ease,
		color 0.15s ease;
}

.direct-link:hover {
	border-color: var(--text-muted);
	color: var(--text-color);
}

.direct-dot {
	width: 0.55rem;
	height: 0.55rem;
	border-radius: 50%;
	background: var(--lang-color);
}

@media (max-width: 420px) {
	.row-name {
		font-size: 1.9rem;
	}

	.row-icon {
		width: 1.9rem;
		height: 1.9rem;
	}
}

@media (prefers-reduced-motion: reduce) {
	.reel,
	.reel::after,
	.strip.animated,
	.spin-button,
	.play-link,
	.direct-link {
		transition: none;
	}

	.play-link,
	.spin-button[aria-disabled="true"] svg {
		animation: none;
	}
}
</style>
