<script setup lang="ts">
import { computed, ref } from "vue";
import InterfazEjercicio from "./InterfazEjercicio.vue";
import type { Locale } from "./fixtures/api-contract";
import { createDemoApi } from "./fixtures/demo-api";
import { demoScenarios } from "./fixtures/exercises";
import type { ExerciseTexts } from "./exercise-ui";

/**
 * DEMO ONLY (phase B): shows `InterfazEjercicio` with the fixtures and a simulated API,
 * plus a scenario picker. In phase C the exercise page renders `InterfazEjercicio` with
 * data from `GET /api/exercises` and an `api` backed by `fetch`; this island goes away.
 *
 * The picker is developer tooling, not product UI: it stays in English (`lang="en"`).
 */
const props = defineProps<{
	lang: Locale;
	texts: ExerciseTexts;
	/** slug → name and brand color, from `data/languages.ts`. */
	languages: Record<string, { name: string; color: string }>;
}>();

const scenarioId = ref(demoScenarios[0].id);
const scenario = computed(() => demoScenarios.find((item) => item.id === scenarioId.value) ?? demoScenarios[0]);
// A fresh simulated server per scenario, so switching back starts from the fixture again
const api = computed(() => createDemoApi(scenario.value));
</script>

<template>
	<div class="exercise-demo">
		<fieldset class="demo-picker" lang="en">
			<legend>Demo scenario</legend>
			<p class="demo-note">Sample data. Rewards are simulated in the browser; in phase C the server decides them.</p>
			<div class="demo-options">
				<label v-for="item in demoScenarios" :key="item.id" class="demo-option">
					<input v-model="scenarioId" type="radio" name="demo-scenario" :value="item.id" />
					{{ item.label }}
				</label>
			</div>
		</fieldset>

		<InterfazEjercicio
			:key="scenario.id"
			:lang="props.lang"
			:exercise="scenario.exercise"
			:profile="scenario.profile"
			:texts="props.texts"
			:api="api"
			:language="props.languages[scenario.exercise.languageSlug]"
		/>
	</div>
</template>

<style scoped>
.exercise-demo {
	text-align: start;
}

.demo-picker {
	max-width: 44rem;
	margin: 0 auto 3rem;
	padding: 1rem 1.25rem 1.1rem;
	border: 1px dashed var(--text-subtle);
	border-radius: 14px;
	min-width: 0;
}

.demo-picker legend {
	padding: 0 0.4rem;
	color: var(--text-secondary);
	font-size: 0.9rem;
	font-weight: 700;
}

.demo-note {
	margin: 0 0 0.75rem;
	color: var(--text-muted);
	font-size: 0.88rem;
}

.demo-options {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem 1.25rem;
}

.demo-option {
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
	min-height: 2rem;
	color: var(--text-secondary);
	font-size: 0.9rem;
	cursor: pointer;
}

.demo-option input {
	margin: 0;
	accent-color: var(--brand);
}
</style>
