<script setup lang="ts">
import InterfazEjercicio from "./InterfazEjercicio.vue";
import { createExerciseApi, publishBalance } from "./exercise-api";
import type { ExerciseTexts, ProfileSnapshot } from "./exercise-ui";
import type { ExerciseDTO, Locale } from "@/types/api";

/**
 * The exercise screen connected to the real API. Astro cannot pass functions to an island,
 * so this wrapper builds the `fetch`-backed `api` in the browser and forwards every new
 * balance to the account menu of the header (`publishBalance`).
 *
 * Exercise and profile arrive already loaded by the page (SSR), so there is no loading state.
 */
const props = defineProps<{
	lang: Locale;
	exercise: ExerciseDTO;
	profile: ProfileSnapshot;
	texts: ExerciseTexts;
	language?: { name: string; color: string };
	loginHref: string;
}>();

// Hint texts in the language of the content, so they match its `lang` attribute
const api = createExerciseApi(props.exercise.id, props.exercise.locale);
</script>

<template>
	<InterfazEjercicio
		:lang="props.lang"
		:exercise="props.exercise"
		:profile="props.profile"
		:texts="props.texts"
		:api="api"
		:language="props.language"
		:login-href="props.loginHref"
		@balance="publishBalance"
	/>
</template>
