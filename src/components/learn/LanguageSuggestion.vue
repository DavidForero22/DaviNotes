<script setup lang="ts">
import { ref } from "vue";

/**
 * Suggests a random language from the catalog. It is the first Vue island of the
 * learning area and the starting point of the language roulette (phase B).
 *
 * Texts arrive already translated from the Astro page, so the island does not ship
 * the i18n dictionaries to the browser. `resultTemplate` contains a `{lang}` placeholder.
 */
const props = defineProps<{
	languages: string[];
	buttonLabel: string;
	resultTemplate: string;
}>();

const suggestion = ref("");
let lastName = "";

function suggest() {
	// Never repeat the previous suggestion, so every click visibly changes the result
	const options = props.languages.filter((name) => name !== lastName);
	const pool = options.length > 0 ? options : props.languages;
	lastName = pool[Math.floor(Math.random() * pool.length)];
	suggestion.value = props.resultTemplate.replace("{lang}", lastName);
}
</script>

<template>
	<div class="language-suggestion">
		<button type="button" class="suggest-button" @click="suggest">
			{{ buttonLabel }}
		</button>
		<!-- Rendered empty on the server so screen readers already track it when it changes -->
		<p class="suggest-result" aria-live="polite">{{ suggestion }}</p>
	</div>
</template>

<style scoped>
.language-suggestion {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 1rem;
}

.suggest-button {
	min-height: 2.5rem;
	padding: 0.5rem 1.25rem;
	border: none;
	border-radius: 99px;
	background: #a78bfa;
	color: #13151a;
	font: inherit;
	font-weight: bold;
	cursor: pointer;
	transition: background 0.2s ease;
}

.suggest-button:hover {
	background: #c4b5fd;
}

.suggest-result {
	margin: 0;
	color: var(--text-color);
	font-size: 1.1rem;
	font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
	.suggest-button {
		transition: none;
	}
}
</style>
