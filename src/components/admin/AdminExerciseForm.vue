<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, useId, watch } from "vue";
import AdminIcon from "./AdminIcon.vue";
import { AdminRequestError, adminRequest } from "./admin-api";
import { EXERCISE_TYPES, SLUG_PATTERN, TYPE_HINTS, TYPE_LABELS, slugify, type AdminExerciseCatalog } from "./admin-options";
import type { AdminExerciseDTO, AdminExerciseInput, AdminExerciseResponse, ExerciseType } from "@/types/api";

/**
 * Create / edit form of one exercise (C8), inside the panel modal. Editing first reads the
 * detail (`GET /api/admin/exercises/[id]`, the only response with the hints). The answer block
 * follows the type: options with the correct one for `multiple_choice`, accepted answers for
 * the other two. Field errors of the server (`field`, e.g. `hints[2].text`) land on their input.
 */
const props = defineProps<{
	/** null = new exercise. */
	exerciseId: string | null;
	catalog: AdminExerciseCatalog;
}>();

const emit = defineEmits<{
	saved: [exercise: AdminExerciseDTO, created: boolean];
	cancel: [];
	busy: [value: boolean];
}>();

const id = useId();
let keySeed = 0;
const item = (text = "") => ({ key: ++keySeed, text });
type Item = ReturnType<typeof item>;

const form = reactive({
	slug: "",
	languageSlug: "",
	frameworkSlug: "",
	conceptSlug: "",
	category: props.catalog.categories[0]?.slug ?? "",
	type: "multiple_choice" as ExerciseType,
	difficulty: 1,
	title: "",
	context: "",
	objective: "",
	prompt: "",
	code: "",
	options: [item(), item()] as Item[],
	correctOption: -1,
	acceptedAnswers: [item()] as Item[],
	hints: [] as Item[],
});

const loading = ref(props.exerciseId !== null);
const loadError = ref("");
const saving = ref(false);
const fieldErrors = reactive<Record<string, string>>({});
const formError = ref("");
/** On a new exercise the slug follows the title until the author edits it. */
const slugTouched = ref(props.exerciseId !== null);

watch(saving, (value) => emit("busy", value));

watch(
	() => form.title,
	(title) => {
		if (!slugTouched.value) form.slug = slugify(title);
	},
);

const frameworks = computed(() =>
	props.catalog.frameworks.filter((f) => !form.languageSlug || f.language === form.languageSlug),
);
const concepts = computed(() => {
	const key = form.frameworkSlug ? `${form.languageSlug}/${form.frameworkSlug}` : form.languageSlug;
	return props.catalog.concepts[key] ?? [];
});

function fill(exercise: AdminExerciseDTO) {
	Object.assign(form, {
		slug: exercise.slug,
		languageSlug: exercise.languageSlug,
		frameworkSlug: exercise.frameworkSlug ?? "",
		conceptSlug: exercise.conceptSlug ?? "",
		category: exercise.category,
		type: exercise.type,
		difficulty: exercise.difficulty,
		title: exercise.title,
		context: exercise.context ?? "",
		objective: exercise.objective,
		prompt: exercise.prompt,
		code: exercise.code ?? "",
		options: exercise.options?.length ? exercise.options.map((text) => item(text)) : [item(), item()],
		correctOption: exercise.correctOption ?? -1,
		acceptedAnswers: exercise.acceptedAnswers?.length ? exercise.acceptedAnswers.map((text) => item(text)) : [item()],
		hints: [...exercise.hints].sort((a, b) => a.order - b.order).map((hint) => item(hint.text)),
	});
}

async function loadDetail() {
	if (!props.exerciseId) return;
	loading.value = true;
	loadError.value = "";
	try {
		const { exercise } = await adminRequest<AdminExerciseResponse>(
			"GET",
			`/api/admin/exercises/${encodeURIComponent(props.exerciseId)}`,
		);
		fill(exercise);
		loading.value = false;
		await nextTick();
		document.getElementById(`${id}-title`)?.focus();
	} catch (error) {
		loadError.value = error instanceof AdminRequestError ? error.message : "Error inesperado.";
	}
}

onMounted(loadDetail);

// ------------------------------------------------------------------ lists

async function focusById(target: string) {
	await nextTick();
	document.getElementById(target)?.focus();
}

function addOption() {
	form.options.push(item());
	focusById(`${id}-option-${form.options.length - 1}`);
}

function removeOption(index: number) {
	form.options.splice(index, 1);
	if (form.correctOption === index) form.correctOption = -1;
	else if (form.correctOption > index) form.correctOption--;
	focusById(`${id}-option-${Math.max(0, index - 1)}`);
}

function addAnswer() {
	form.acceptedAnswers.push(item());
	focusById(`${id}-answer-${form.acceptedAnswers.length - 1}`);
}

function removeAnswer(index: number) {
	form.acceptedAnswers.splice(index, 1);
	focusById(`${id}-answer-${Math.max(0, index - 1)}`);
}

function addHint() {
	form.hints.push(item());
	focusById(`${id}-hints-${form.hints.length - 1}`);
}

function removeHint(index: number) {
	form.hints.splice(index, 1);
	focusById(form.hints.length ? `${id}-hints-${Math.max(0, index - 1)}` : `${id}-add-hint`);
}

const moveAnnouncement = ref("");

function moveHint(index: number, delta: -1 | 1) {
	const to = index + delta;
	if (to < 0 || to >= form.hints.length) return;
	const [moved] = form.hints.splice(index, 1);
	form.hints.splice(to, 0, moved!);
	moveAnnouncement.value = `Pista movida a la posición ${to + 1} de ${form.hints.length}.`;
	// Keep the focus on the same button of the moved hint, if it still exists at the new edge
	const edge = (delta < 0 && to === 0) || (delta > 0 && to === form.hints.length - 1);
	focusById(edge ? `${id}-hints-${to}` : `${id}-hint-${delta < 0 ? "up" : "down"}-${to}`);
}

// ------------------------------------------------------------------ submit

/** Server field name → id of the element that gets focus and shows the message. */
function fieldTarget(field: string): string {
	const hint = /^hints\[(\d+)\]\.text$/.exec(field);
	if (hint) return `${id}-hints-${hint[1]}`;
	if (field === "options") return `${id}-option-0`;
	if (field === "correctOption") return `${id}-correct-0`;
	if (field === "acceptedAnswers") return `${id}-answer-0`;
	if (field === "type") return `${id}-type-0`;
	return `${id}-${field}`;
}

const KNOWN_FIELDS = new Set([
	"slug",
	"languageSlug",
	"frameworkSlug",
	"conceptSlug",
	"category",
	"type",
	"difficulty",
	"title",
	"context",
	"objective",
	"prompt",
	"code",
	"options",
	"correctOption",
	"acceptedAnswers",
]);

function isKnown(field: string) {
	return KNOWN_FIELDS.has(field) || /^hints\[\d+\]\.text$/.test(field);
}

/** Order of the fields in the form, to focus the first error. */
const ORDER = [
	"title",
	"slug",
	"languageSlug",
	"frameworkSlug",
	"conceptSlug",
	"category",
	"difficulty",
	"type",
	"context",
	"objective",
	"prompt",
	"code",
	"options",
	"correctOption",
	"acceptedAnswers",
];

function resetErrors() {
	for (const key of Object.keys(fieldErrors)) delete fieldErrors[key];
	formError.value = "";
}

function validate(): boolean {
	resetErrors();
	const need = (field: keyof typeof form, message: string) => {
		if (String(form[field]).trim() === "") fieldErrors[field] = message;
	};
	need("title", "Escribe el título.");
	if (!form.slug.trim()) fieldErrors.slug = "Escribe el slug.";
	else if (!SLUG_PATTERN.test(form.slug.trim())) fieldErrors.slug = "Usa solo minúsculas, números y guiones, como bucles-for.";
	need("languageSlug", "Indica el lenguaje.");
	need("category", "Elige una categoría.");
	need("objective", "Escribe el objetivo.");
	need("prompt", "Escribe el enunciado.");
	if (form.type === "multiple_choice") {
		const filled = form.options.filter((o) => o.text.trim() !== "");
		if (filled.length !== form.options.length) fieldErrors.options = "Rellena o quita las opciones vacías.";
		else if (form.options.length < 2) fieldErrors.options = "Añade al menos 2 opciones.";
		else if (form.correctOption < 0 || form.correctOption >= form.options.length) {
			fieldErrors.correctOption = "Marca cuál es la opción correcta.";
		}
	} else if (form.acceptedAnswers.some((a) => a.text.trim() === "")) {
		fieldErrors.acceptedAnswers = "Rellena o quita las respuestas vacías.";
	} else if (form.acceptedAnswers.length === 0) {
		fieldErrors.acceptedAnswers = "Añade al menos una respuesta aceptada.";
	}
	form.hints.forEach((hint, i) => {
		if (hint.text.trim() === "") fieldErrors[`hints[${i}].text`] = "Escribe el texto de la pista o quítala.";
	});
	return Object.keys(fieldErrors).length === 0;
}

async function focusFirstError() {
	await nextTick();
	const first = ORDER.find((f) => fieldErrors[f]) ?? Object.keys(fieldErrors).find((f) => f.startsWith("hints["));
	document.getElementById(first ? fieldTarget(first) : `${id}-error`)?.focus();
}

function payload(): AdminExerciseInput {
	const text = (value: string) => (value.trim() === "" ? null : value);
	const body: AdminExerciseInput = {
		slug: form.slug.trim(),
		languageSlug: form.languageSlug.trim(),
		frameworkSlug: text(form.frameworkSlug.trim()),
		conceptSlug: text(form.conceptSlug.trim()),
		category: form.category,
		type: form.type,
		difficulty: Number(form.difficulty),
		title: form.title.trim(),
		context: text(form.context),
		objective: form.objective,
		prompt: form.prompt,
		code: text(form.code),
		hints: form.hints.map((h) => ({ text: h.text.trim() })),
	};
	if (form.type === "multiple_choice") {
		body.options = form.options.map((o) => o.text.trim());
		body.correctOption = form.correctOption;
	} else {
		body.acceptedAnswers = form.acceptedAnswers.map((a) => a.text.trim());
	}
	return body;
}

async function submit() {
	if (saving.value || loading.value) return;
	if (!validate()) return focusFirstError();
	saving.value = true;
	try {
		const created = props.exerciseId === null;
		const { exercise } = created
			? await adminRequest<AdminExerciseResponse>("POST", "/api/admin/exercises", payload())
			: await adminRequest<AdminExerciseResponse>(
					"PATCH",
					`/api/admin/exercises/${encodeURIComponent(props.exerciseId!)}`,
					payload(),
				);
		saving.value = false;
		emit("saved", exercise, created);
	} catch (error) {
		saving.value = false;
		const failure = error instanceof AdminRequestError ? error : new AdminRequestError(0, undefined, "Error inesperado.");
		if (failure.field && isKnown(failure.field)) fieldErrors[failure.field] = failure.message;
		else formError.value = failure.message;
		focusFirstError();
	}
}

/** `aria-describedby` of a field: its hint (if any) and its error (if any). */
function describedBy(field: string, hint = false): string | undefined {
	const ids = [hint ? `${id}-${field}-hint` : "", fieldErrors[field] ? `${id}-${field}-error` : ""].filter(Boolean);
	return ids.length ? ids.join(" ") : undefined;
}
</script>

<template>
	<div v-if="loading" class="admin-dialog-state">
		<template v-if="loadError">
			<div class="admin-form-error" role="alert">
				<AdminIcon name="alert" />
				<p>No se pudo abrir el ejercicio. {{ loadError }}</p>
			</div>
			<div class="admin-form-actions">
				<button type="button" class="admin-button admin-button--ghost" @click="emit('cancel')">Cerrar</button>
				<button type="button" class="admin-button" @click="loadDetail">
					<AdminIcon name="refresh" />
					Reintentar
				</button>
			</div>
		</template>
		<p v-else class="admin-state admin-state--loading" role="status">
			<AdminIcon name="spinner" />
			Cargando el ejercicio…
		</p>
	</div>

	<form v-else class="admin-form admin-form--exercise" novalidate @submit.prevent="submit">
		<div v-if="formError" :id="`${id}-error`" class="admin-form-error" role="alert" tabindex="-1">
			<AdminIcon name="alert" />
			<p>{{ formError }}</p>
		</div>

		<!-- ---------------------------------------------------------- identity -->
		<fieldset class="admin-fieldset">
			<legend>Identificación</legend>
			<div class="admin-grid admin-grid--2">
				<div class="admin-field admin-span-2" :class="{ 'is-invalid': fieldErrors.title }">
					<label :for="`${id}-title`">Título</label>
					<input
						:id="`${id}-title`"
						v-model="form.title"
						class="admin-input"
						maxlength="200"
						data-autofocus
						:aria-invalid="fieldErrors.title ? 'true' : undefined"
						:aria-describedby="describedBy('title')"
					/>
					<p v-if="fieldErrors.title" :id="`${id}-title-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.title }}</p>
				</div>
				<div class="admin-field admin-span-2" :class="{ 'is-invalid': fieldErrors.slug }">
					<label :for="`${id}-slug`">Slug</label>
					<input
						:id="`${id}-slug`"
						v-model="form.slug"
						class="admin-input admin-input--mono"
						maxlength="100"
						spellcheck="false"
						autocomplete="off"
						:aria-invalid="fieldErrors.slug ? 'true' : undefined"
						:aria-describedby="describedBy('slug', true)"
						@input="slugTouched = true"
					/>
					<p :id="`${id}-slug-hint`" class="admin-field-hint">
						Identificador único en minúsculas y con guiones.<template v-if="!slugTouched"> Se genera a partir del título.</template>
					</p>
					<p v-if="fieldErrors.slug" :id="`${id}-slug-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.slug }}</p>
				</div>
			</div>
		</fieldset>

		<!-- ---------------------------------------------------------- classification -->
		<fieldset class="admin-fieldset">
			<legend>Clasificación</legend>
			<div class="admin-grid admin-grid--3">
				<div class="admin-field" :class="{ 'is-invalid': fieldErrors.languageSlug }">
					<label :for="`${id}-languageSlug`">Lenguaje</label>
					<input
						:id="`${id}-languageSlug`"
						v-model="form.languageSlug"
						class="admin-input"
						:list="`${id}-languages`"
						spellcheck="false"
						autocomplete="off"
						:aria-invalid="fieldErrors.languageSlug ? 'true' : undefined"
						:aria-describedby="describedBy('languageSlug')"
					/>
					<datalist :id="`${id}-languages`">
						<option v-for="l in catalog.languages" :key="l.slug" :value="l.slug">{{ l.name }}</option>
					</datalist>
					<p v-if="fieldErrors.languageSlug" :id="`${id}-languageSlug-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.languageSlug }}</p>
				</div>
				<div class="admin-field" :class="{ 'is-invalid': fieldErrors.frameworkSlug }">
					<label :for="`${id}-frameworkSlug`">Framework <span class="admin-optional">(opcional)</span></label>
					<input
						:id="`${id}-frameworkSlug`"
						v-model="form.frameworkSlug"
						class="admin-input"
						:list="`${id}-frameworks`"
						spellcheck="false"
						autocomplete="off"
						:aria-invalid="fieldErrors.frameworkSlug ? 'true' : undefined"
						:aria-describedby="describedBy('frameworkSlug')"
					/>
					<datalist :id="`${id}-frameworks`">
						<option v-for="f in frameworks" :key="f.slug" :value="f.slug">{{ f.name }}</option>
					</datalist>
					<p v-if="fieldErrors.frameworkSlug" :id="`${id}-frameworkSlug-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.frameworkSlug }}</p>
				</div>
				<div class="admin-field" :class="{ 'is-invalid': fieldErrors.conceptSlug }">
					<label :for="`${id}-conceptSlug`">Concepto <span class="admin-optional">(opcional)</span></label>
					<input
						:id="`${id}-conceptSlug`"
						v-model="form.conceptSlug"
						class="admin-input"
						:list="`${id}-concepts`"
						spellcheck="false"
						autocomplete="off"
						:aria-invalid="fieldErrors.conceptSlug ? 'true' : undefined"
						:aria-describedby="describedBy('conceptSlug')"
					/>
					<datalist :id="`${id}-concepts`">
						<option v-for="c in concepts" :key="c.slug" :value="c.slug">{{ c.name }}</option>
					</datalist>
					<p v-if="fieldErrors.conceptSlug" :id="`${id}-conceptSlug-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.conceptSlug }}</p>
				</div>
				<div class="admin-field" :class="{ 'is-invalid': fieldErrors.category }">
					<label :for="`${id}-category`">Categoría</label>
					<select
						:id="`${id}-category`"
						v-model="form.category"
						class="admin-select"
						:aria-invalid="fieldErrors.category ? 'true' : undefined"
						:aria-describedby="describedBy('category')"
					>
						<option v-if="!form.category" value="" disabled>Elige una categoría</option>
						<option v-for="c in catalog.categories" :key="c.slug" :value="c.slug">{{ c.name }}</option>
					</select>
					<p v-if="fieldErrors.category" :id="`${id}-category-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.category }}</p>
				</div>
				<div class="admin-field" :class="{ 'is-invalid': fieldErrors.difficulty }">
					<label :for="`${id}-difficulty`">Dificultad</label>
					<select
						:id="`${id}-difficulty`"
						v-model.number="form.difficulty"
						class="admin-select"
						:aria-invalid="fieldErrors.difficulty ? 'true' : undefined"
						:aria-describedby="describedBy('difficulty', true)"
					>
						<option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
					</select>
					<p :id="`${id}-difficulty-hint`" class="admin-field-hint">De 1 (muy fácil) a 10 (experto).</p>
					<p v-if="fieldErrors.difficulty" :id="`${id}-difficulty-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.difficulty }}</p>
				</div>
			</div>
		</fieldset>

		<!-- ---------------------------------------------------------- statement -->
		<fieldset class="admin-fieldset">
			<legend>Enunciado</legend>
			<div class="admin-field" :class="{ 'is-invalid': fieldErrors.context }">
				<label :for="`${id}-context`">Contexto <span class="admin-optional">(opcional)</span></label>
				<textarea :id="`${id}-context`" v-model="form.context" class="admin-input admin-textarea" rows="2" :aria-invalid="fieldErrors.context ? 'true' : undefined" :aria-describedby="describedBy('context', true)" />
				<p :id="`${id}-context-hint`" class="admin-field-hint">Situación que enmarca el ejercicio.</p>
				<p v-if="fieldErrors.context" :id="`${id}-context-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.context }}</p>
			</div>
			<div class="admin-field" :class="{ 'is-invalid': fieldErrors.objective }">
				<label :for="`${id}-objective`">Objetivo</label>
				<textarea :id="`${id}-objective`" v-model="form.objective" class="admin-input admin-textarea" rows="2" :aria-invalid="fieldErrors.objective ? 'true' : undefined" :aria-describedby="describedBy('objective')" />
				<p v-if="fieldErrors.objective" :id="`${id}-objective-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.objective }}</p>
			</div>
			<div class="admin-field" :class="{ 'is-invalid': fieldErrors.prompt }">
				<label :for="`${id}-prompt`">Pregunta</label>
				<textarea :id="`${id}-prompt`" v-model="form.prompt" class="admin-input admin-textarea" rows="3" :aria-invalid="fieldErrors.prompt ? 'true' : undefined" :aria-describedby="describedBy('prompt')" />
				<p v-if="fieldErrors.prompt" :id="`${id}-prompt-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.prompt }}</p>
			</div>
			<div class="admin-field" :class="{ 'is-invalid': fieldErrors.code }">
				<label :for="`${id}-code`">Código <span class="admin-optional">(opcional)</span></label>
				<textarea
					:id="`${id}-code`"
					v-model="form.code"
					class="admin-input admin-textarea admin-input--mono"
					rows="6"
					spellcheck="false"
					wrap="off"
					:aria-invalid="fieldErrors.code ? 'true' : undefined"
					:aria-describedby="describedBy('code', true)"
				/>
				<p :id="`${id}-code-hint`" class="admin-field-hint">Se muestra como bloque de código, respetando los espacios.</p>
				<p v-if="fieldErrors.code" :id="`${id}-code-error`" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.code }}</p>
			</div>
		</fieldset>

		<!-- ---------------------------------------------------------- answer -->
		<fieldset class="admin-fieldset">
			<legend>Respuesta</legend>
			<fieldset class="admin-field admin-choice" :class="{ 'is-invalid': fieldErrors.type }">
				<legend>Tipo de ejercicio</legend>
				<div class="admin-segmented">
					<label v-for="(type, i) in EXERCISE_TYPES" :key="type" class="admin-segment">
						<input :id="`${id}-type-${i}`" v-model="form.type" type="radio" :name="`${id}-type`" :value="type" />
						<span class="admin-segment-label">{{ TYPE_LABELS[type] }}</span>
						<span class="admin-segment-hint">{{ TYPE_HINTS[type] }}</span>
					</label>
				</div>
				<p v-if="fieldErrors.type" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.type }}</p>
			</fieldset>

			<fieldset
				v-if="form.type === 'multiple_choice'"
				class="admin-field admin-list-field"
				:class="{ 'is-invalid': fieldErrors.options || fieldErrors.correctOption }"
				:aria-describedby="fieldErrors.options || fieldErrors.correctOption ? `${id}-options-error` : `${id}-options-hint`"
			>
				<legend>Opciones</legend>
				<p :id="`${id}-options-hint`" class="admin-field-hint">Marca la opción correcta. Mínimo 2 opciones.</p>
				<ol class="admin-items">
					<li v-for="(option, i) in form.options" :key="option.key" class="admin-item admin-item--option" :class="{ 'is-correct': form.correctOption === i }">
						<label class="admin-correct">
							<input :id="`${id}-correct-${i}`" v-model="form.correctOption" type="radio" :name="`${id}-correct`" :value="i" />
							<AdminIcon name="check" />
							<span class="admin-correct-text">Correcta</span>
							<span class="sr-only"> (opción {{ i + 1 }})</span>
						</label>
						<label :for="`${id}-option-${i}`" class="sr-only">Opción {{ i + 1 }}</label>
						<input :id="`${id}-option-${i}`" v-model="option.text" class="admin-input" autocomplete="off" />
						<button type="button" class="admin-icon-button" :disabled="form.options.length <= 2" @click="removeOption(i)">
							<AdminIcon name="trash" />
							<span class="sr-only">Quitar la opción {{ i + 1 }}</span>
						</button>
					</li>
				</ol>
				<p v-if="fieldErrors.options || fieldErrors.correctOption" :id="`${id}-options-error`" class="admin-field-error">
					<AdminIcon name="alert" />{{ fieldErrors.options || fieldErrors.correctOption }}
				</p>
				<button type="button" class="admin-button admin-button--ghost admin-button--small" :disabled="form.options.length >= 8" @click="addOption">
					<AdminIcon name="plus" />
					Añadir opción
				</button>
			</fieldset>

			<fieldset
				v-else
				class="admin-field admin-list-field"
				:class="{ 'is-invalid': fieldErrors.acceptedAnswers }"
				:aria-describedby="fieldErrors.acceptedAnswers ? `${id}-acceptedAnswers-error` : `${id}-acceptedAnswers-hint`"
			>
				<legend>Respuestas aceptadas</legend>
				<p :id="`${id}-acceptedAnswers-hint`" class="admin-field-hint">Cualquiera de ellas cuenta como correcta. Añade las variantes válidas.</p>
				<ol class="admin-items">
					<li v-for="(answer, i) in form.acceptedAnswers" :key="answer.key" class="admin-item">
						<label :for="`${id}-answer-${i}`" class="sr-only">Respuesta aceptada {{ i + 1 }}</label>
						<input :id="`${id}-answer-${i}`" v-model="answer.text" class="admin-input admin-input--mono" autocomplete="off" spellcheck="false" />
						<button type="button" class="admin-icon-button" :disabled="form.acceptedAnswers.length <= 1" @click="removeAnswer(i)">
							<AdminIcon name="trash" />
							<span class="sr-only">Quitar la respuesta {{ i + 1 }}</span>
						</button>
					</li>
				</ol>
				<p v-if="fieldErrors.acceptedAnswers" :id="`${id}-acceptedAnswers-error`" class="admin-field-error">
					<AdminIcon name="alert" />{{ fieldErrors.acceptedAnswers }}
				</p>
				<button type="button" class="admin-button admin-button--ghost admin-button--small" @click="addAnswer">
					<AdminIcon name="plus" />
					Añadir respuesta
				</button>
			</fieldset>
		</fieldset>

		<!-- ---------------------------------------------------------- hints -->
		<fieldset class="admin-fieldset">
			<legend>Pistas <span class="admin-optional">(opcional)</span></legend>
			<p class="admin-field-hint">Cada pista cuesta 1 moneda. Se desbloquean en este orden.</p>
			<p v-if="form.hints.length === 0" class="admin-muted admin-empty-line">Sin pistas.</p>
			<ol v-else class="admin-items admin-items--hints">
				<li v-for="(hint, i) in form.hints" :key="hint.key" class="admin-item admin-item--hint" :class="{ 'is-invalid': fieldErrors[`hints[${i}].text`] }">
					<div class="admin-hint-head">
						<label :for="`${id}-hints-${i}`">Pista {{ i + 1 }}</label>
						<div class="admin-hint-tools">
							<button :id="`${id}-hint-up-${i}`" type="button" class="admin-icon-button" :disabled="i === 0" @click="moveHint(i, -1)">
								<AdminIcon name="arrow-up" />
								<span class="sr-only">Subir la pista {{ i + 1 }}</span>
							</button>
							<button :id="`${id}-hint-down-${i}`" type="button" class="admin-icon-button" :disabled="i === form.hints.length - 1" @click="moveHint(i, 1)">
								<AdminIcon name="arrow-down" />
								<span class="sr-only">Bajar la pista {{ i + 1 }}</span>
							</button>
							<button type="button" class="admin-icon-button admin-icon-button--danger" @click="removeHint(i)">
								<AdminIcon name="trash" />
								<span class="sr-only">Quitar la pista {{ i + 1 }}</span>
							</button>
						</div>
					</div>
					<textarea
						:id="`${id}-hints-${i}`"
						v-model="hint.text"
						class="admin-input admin-textarea"
						rows="2"
						:aria-invalid="fieldErrors[`hints[${i}].text`] ? 'true' : undefined"
						:aria-describedby="fieldErrors[`hints[${i}].text`] ? `${id}-hints-${i}-error` : undefined"
					/>
					<p v-if="fieldErrors[`hints[${i}].text`]" :id="`${id}-hints-${i}-error`" class="admin-field-error">
						<AdminIcon name="alert" />{{ fieldErrors[`hints[${i}].text`] }}
					</p>
				</li>
			</ol>
			<p class="sr-only" role="status" aria-live="polite">{{ moveAnnouncement }}</p>
			<button :id="`${id}-add-hint`" type="button" class="admin-button admin-button--ghost admin-button--small" @click="addHint">
				<AdminIcon name="plus" />
				Añadir pista
			</button>
		</fieldset>

		<div class="admin-form-actions admin-form-actions--sticky">
			<button type="button" class="admin-button admin-button--ghost" :disabled="saving" @click="emit('cancel')">Cancelar</button>
			<button type="submit" class="admin-button admin-button--primary" :disabled="saving">
				<AdminIcon v-if="saving" name="spinner" />
				{{ saving ? "Guardando…" : exerciseId ? "Guardar cambios" : "Crear ejercicio" }}
			</button>
		</div>
	</form>
</template>
