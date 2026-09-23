<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";

/**
 * Suggests a random language from the catalog with a short "reel" spin. It is the
 * first Vue island of the learning area and the starting point of the language
 * roulette (phase B).
 *
 * Texts arrive already translated from the Astro page, so the island does not ship
 * the i18n dictionaries to the browser. `resultTemplate` contains a `{lang}` placeholder.
 */
export interface SuggestedLanguage {
	name: string;
	/** Brand color of the language, the same one its home page card glows with. */
	color: string;
}

const props = defineProps<{
	languages: SuggestedLanguage[];
	buttonLabel: string;
	resultTemplate: string;
}>();

const SPIN_STEPS = 9;
const SPIN_STEP_MS = 70;

const shown = ref<SuggestedLanguage | null>(null);
const announcement = ref("");
const spinning = ref(false);
let lastName = "";
let timer: ReturnType<typeof setInterval> | undefined;

function randomFrom(list: SuggestedLanguage[]): SuggestedLanguage {
	return list[Math.floor(Math.random() * list.length)];
}

function land() {
	// Never repeat the previous suggestion, so every click visibly changes the result
	const options = props.languages.filter((language) => language.name !== lastName);
	const choice = randomFrom(options.length > 0 ? options : props.languages);
	lastName = choice.name;
	shown.value = choice;
	spinning.value = false;
	announcement.value = props.resultTemplate.replace("{lang}", choice.name);
}

function suggest() {
	if (spinning.value) return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		land();
		return;
	}
	spinning.value = true;
	let step = 0;
	timer = setInterval(() => {
		shown.value = randomFrom(props.languages);
		step += 1;
		if (step >= SPIN_STEPS) {
			clearInterval(timer);
			land();
		}
	}, SPIN_STEP_MS);
}

onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
	<div class="language-suggestion">
		<!-- Visual only: the result is announced once, through the live region below -->
		<div
			class="reel"
			:class="{ spinning }"
			:style="shown ? { '--lang-color': shown.color } : undefined"
			aria-hidden="true"
		>
			<span v-if="shown" class="reel-name">{{ shown.name }}</span>
			<span v-else class="reel-name idle">?</span>
		</div>
		<!-- Rendered empty on the server so screen readers already track it when it changes -->
		<p class="sr-only" aria-live="polite">{{ announcement }}</p>
		<button type="button" class="suggest-button" :aria-disabled="spinning" @click="suggest">
			{{ buttonLabel }}
		</button>
	</div>
</template>

<style scoped>
.language-suggestion {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5rem;
}

.reel {
	position: relative;
	display: grid;
	place-items: center;
	width: min(100%, 22rem);
	height: 5.5rem;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 18px;
	background: var(--card-bg);
	box-shadow:
		inset 0 10px 18px -12px rgba(0, 0, 0, 0.8),
		inset 0 -10px 18px -12px rgba(0, 0, 0, 0.8);
}

/* Brand color of the language under its name */
.reel::after {
	content: "";
	position: absolute;
	right: 1rem;
	bottom: 0.9rem;
	left: 1rem;
	height: 3px;
	border-radius: 3px;
	background: var(--lang-color, transparent);
	transition: background 0.3s ease;
}

.reel-name {
	color: var(--text-color);
	font-size: 2.25rem;
	font-weight: 800;
	letter-spacing: -0.02em;
}

.reel-name.idle {
	color: var(--text-muted);
	font-size: 2rem;
}

.reel.spinning .reel-name {
	filter: blur(1.5px);
}

.suggest-button {
	min-height: 3rem;
	padding: 0.6rem 1.75rem;
	border: none;
	border-radius: 99px;
	background: var(--brand);
	color: var(--on-brand);
	font: inherit;
	font-size: 1.05rem;
	font-weight: bold;
	cursor: pointer;
	transition:
		background 0.15s ease,
		transform 0.1s ease;
}

.suggest-button:hover:not([aria-disabled="true"]) {
	background: var(--brand-hover);
}

.suggest-button:active:not([aria-disabled="true"]) {
	transform: scale(0.97);
}

/* Only during the ~0.6s spin; aria-disabled keeps keyboard focus on the button */
.suggest-button[aria-disabled="true"] {
	cursor: progress;
}

@media (prefers-reduced-motion: reduce) {
	.reel::after,
	.suggest-button {
		transition: none;
	}
}
</style>
