<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import AdminDialog from "./AdminDialog.vue";
import AdminExerciseForm from "./AdminExerciseForm.vue";
import AdminIcon from "./AdminIcon.vue";
import AdminPager from "./AdminPager.vue";
import AdminSortHeader from "./AdminSortHeader.vue";
import { AdminRequestError, adminRequest, longDate, numberFormat, queryString, shortDate } from "./admin-api";
import { EXERCISE_TYPES, TYPE_LABELS, type AdminExerciseCatalog } from "./admin-options";
import type {
	AdminDeleteResponse,
	AdminExerciseDTO,
	AdminExerciseListResponse,
	AdminExerciseSort,
	AdminOrder,
	ExerciseType,
} from "@/types/api";

/**
 * Exercises of the admin panel (C8): search by title, filters (language, framework, concept,
 * category, type, difficulty), sortable columns, pagination, and create / edit / delete.
 * Talks to `/api/admin/exercises`. The list state lives in the URL, like the users page.
 */
const props = defineProps<{
	catalog: AdminExerciseCatalog;
	loginHref: string;
}>();

const SORTS: readonly AdminExerciseSort[] = ["created_at", "title", "difficulty", "slug"];
const SORT_LABELS: Record<AdminExerciseSort, string> = {
	created_at: "fecha de creación",
	title: "título",
	difficulty: "dificultad",
	slug: "slug",
};
const LIMITS = [10, 20, 50, 100];
const FILTERS = ["language", "framework", "concept", "category", "type", "difficulty"] as const;
type Filter = (typeof FILTERS)[number];

const languageNames = new Map(props.catalog.languages.map((l) => [l.slug, l.name]));
const frameworkNames = new Map(props.catalog.frameworks.map((f) => [f.slug, f.name]));
const categoryNames = new Map(props.catalog.categories.map((c) => [c.slug, c.name]));

// ------------------------------------------------------------------ list state

const query = reactive({
	q: "",
	language: "",
	framework: "",
	concept: "",
	category: "",
	type: "" as ExerciseType | "",
	difficulty: "",
	sort: "created_at" as AdminExerciseSort,
	order: "desc" as AdminOrder,
	limit: 20,
	offset: 0,
});
const searchText = ref("");
const conceptText = ref("");
const exercises = ref<AdminExerciseDTO[]>([]);
const total = ref(0);
const status = ref<"loading" | "ready" | "error">("loading");
const loadError = ref<AdminRequestError | null>(null);
const announcement = ref("");
const summary = ref<HTMLElement | null>(null);
let requestId = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const hasFilters = computed(() => query.q !== "" || FILTERS.some((f) => query[f] !== ""));
const firstLoad = computed(() => status.value === "loading" && exercises.value.length === 0);
const frameworkOptions = computed(() =>
	props.catalog.frameworks.filter((f) => !query.language || f.language === query.language),
);

function readUrl() {
	const p = new URLSearchParams(window.location.search);
	query.q = p.get("q")?.trim() ?? "";
	for (const f of ["language", "framework", "concept", "category"] as const) query[f] = p.get(f)?.trim() ?? "";
	const type = p.get("type");
	query.type = (EXERCISE_TYPES as readonly string[]).includes(type ?? "") ? (type as ExerciseType) : "";
	const difficulty = Number(p.get("difficulty"));
	query.difficulty = Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 10 ? String(difficulty) : "";
	const sort = p.get("sort");
	query.sort = (SORTS as readonly string[]).includes(sort ?? "") ? (sort as AdminExerciseSort) : "created_at";
	query.order = p.get("order") === "asc" ? "asc" : "desc";
	const limit = Number(p.get("limit"));
	query.limit = LIMITS.includes(limit) ? limit : 20;
	const offset = Number(p.get("offset"));
	query.offset = Number.isInteger(offset) && offset > 0 ? offset : 0;
	searchText.value = query.q;
	conceptText.value = query.concept;
}

function params() {
	return {
		q: query.q,
		language: query.language,
		framework: query.framework,
		concept: query.concept,
		category: query.category,
		type: query.type,
		difficulty: query.difficulty,
		sort: query.sort,
		order: query.order,
		limit: query.limit,
		offset: query.offset,
	};
}

function writeUrl() {
	const p = params();
	const search = queryString({
		...p,
		sort: p.sort === "created_at" ? "" : p.sort,
		order: p.order === "desc" ? "" : p.order,
		limit: p.limit === 20 ? "" : p.limit,
		offset: p.offset || "",
	});
	history.replaceState(history.state, "", `${window.location.pathname}${search}`);
}

async function load(announce = true) {
	const id = ++requestId;
	status.value = "loading";
	writeUrl();
	try {
		const data = await adminRequest<AdminExerciseListResponse>("GET", `/api/admin/exercises${queryString(params())}`);
		if (id !== requestId) return;
		if (data.exercises.length === 0 && data.total > 0 && query.offset > 0) {
			query.offset = Math.max(0, Math.floor((data.total - 1) / query.limit) * query.limit);
			return load(announce);
		}
		exercises.value = data.exercises;
		total.value = data.total;
		status.value = "ready";
		loadError.value = null;
		if (announce) announcement.value = data.total === 1 ? "1 ejercicio." : `${numberFormat.format(data.total)} ejercicios.`;
	} catch (error) {
		if (id !== requestId) return;
		loadError.value = error instanceof AdminRequestError ? error : new AdminRequestError(0, undefined, "Error inesperado.");
		status.value = "error";
		announcement.value = `No se pudo cargar la lista. ${loadError.value.message}`;
	}
}

function onSearchInput() {
	clearTimeout(searchTimer);
	searchTimer = setTimeout(applySearch, 350);
}

function applySearch() {
	clearTimeout(searchTimer);
	const q = searchText.value.trim();
	const concept = conceptText.value.trim();
	if (q === query.q && concept === query.concept) return;
	query.q = q;
	query.concept = concept;
	query.offset = 0;
	load();
}

function setFilter(filter: Filter, value: string) {
	query[filter] = value as never;
	// A framework of another language would always give an empty list
	if (filter === "language" && query.framework && !frameworkOptions.value.some((f) => f.slug === query.framework)) {
		query.framework = "";
	}
	query.offset = 0;
	load();
}

function setSort(column: string) {
	if (query.sort === column) query.order = query.order === "asc" ? "desc" : "asc";
	else {
		query.sort = column as AdminExerciseSort;
		query.order = column === "title" || column === "slug" ? "asc" : "desc";
	}
	query.offset = 0;
	load();
}

function setSortOrder(value: string) {
	const [sort, order] = value.split(":");
	query.sort = sort as AdminExerciseSort;
	query.order = order === "asc" ? "asc" : "desc";
	query.offset = 0;
	load();
}

function setOffset(offset: number) {
	query.offset = offset;
	load();
	summary.value?.focus();
}

function setLimit(limit: number) {
	query.limit = limit;
	query.offset = 0;
	load();
}

function clearFilters() {
	searchText.value = "";
	conceptText.value = "";
	query.q = "";
	for (const f of FILTERS) query[f] = "";
	query.offset = 0;
	load();
}

onMounted(() => {
	readUrl();
	load(false);
});

onBeforeUnmount(() => clearTimeout(searchTimer));

const caption = computed(
	() => `Ejercicios, ordenados por ${SORT_LABELS[query.sort]} (${query.order === "asc" ? "ascendente" : "descendente"})`,
);

// ------------------------------------------------------------------ create / edit

const formOpen = ref(false);
const editingId = ref<string | null>(null);
const editingTitle = ref("");
const formBusy = ref(false);

function openCreate() {
	editingId.value = null;
	editingTitle.value = "";
	formOpen.value = true;
}

function openEdit(exercise: AdminExerciseDTO) {
	editingId.value = exercise.id;
	editingTitle.value = exercise.title;
	formOpen.value = true;
}

function closeForm() {
	if (!formBusy.value) formOpen.value = false;
}

async function onSaved(exercise: AdminExerciseDTO, created: boolean) {
	formOpen.value = false;
	if (created) {
		await load(false);
		announcement.value = `Ejercicio creado: ${exercise.title}.`;
	} else {
		exercises.value = exercises.value.map((row) => (row.id === exercise.id ? exercise : row));
		announcement.value = `Cambios guardados en ${exercise.title}.`;
	}
}

// ------------------------------------------------------------------ delete

const deleting = ref<AdminExerciseDTO | null>(null);
const deleteOpen = ref(false);
const deleteBusy = ref(false);
const deleteError = ref("");

function openDelete(exercise: AdminExerciseDTO) {
	deleting.value = exercise;
	deleteError.value = "";
	deleteOpen.value = true;
}

function closeDelete() {
	if (!deleteBusy.value) deleteOpen.value = false;
}

async function confirmDelete() {
	const target = deleting.value;
	if (!target || deleteBusy.value) return;
	deleteBusy.value = true;
	deleteError.value = "";
	try {
		await adminRequest<AdminDeleteResponse>("DELETE", `/api/admin/exercises/${encodeURIComponent(target.id)}`);
		deleteOpen.value = false;
		await load(false);
		announcement.value = `Ejercicio eliminado: ${target.title}.`;
		await nextTick();
		summary.value?.focus();
	} catch (error) {
		deleteError.value = error instanceof AdminRequestError ? error.message : "Error inesperado.";
	} finally {
		deleteBusy.value = false;
	}
}

const languageName = (slug: string) => languageNames.get(slug) ?? slug;
const categoryName = (slug: string) => categoryNames.get(slug) ?? slug;
</script>

<template>
	<section class="admin-list" aria-labelledby="admin-exercises-heading">
		<div class="admin-toolbar">
			<form role="search" class="admin-search" @submit.prevent="applySearch">
				<label for="admin-exercises-q" class="sr-only">Buscar por título</label>
				<AdminIcon name="search" />
				<input
					id="admin-exercises-q"
					v-model="searchText"
					type="search"
					class="admin-input"
					placeholder="Buscar por título"
					autocomplete="off"
					@input="onSearchInput"
				/>
			</form>
			<button type="button" class="admin-button admin-button--primary admin-toolbar-action" @click="openCreate">
				<AdminIcon name="plus" />
				Nuevo ejercicio
			</button>
		</div>

		<div class="admin-filters" role="group" aria-label="Filtros">
			<div class="admin-filter">
				<label for="admin-ex-language">Lenguaje</label>
				<select id="admin-ex-language" class="admin-select" :value="query.language" @change="setFilter('language', ($event.target as HTMLSelectElement).value)">
					<option value="">Todos</option>
					<option v-for="l in catalog.languages" :key="l.slug" :value="l.slug">{{ l.name }}</option>
				</select>
			</div>
			<div class="admin-filter">
				<label for="admin-ex-framework">Framework</label>
				<select id="admin-ex-framework" class="admin-select" :value="query.framework" @change="setFilter('framework', ($event.target as HTMLSelectElement).value)">
					<option value="">Todos</option>
					<option v-for="f in frameworkOptions" :key="f.slug" :value="f.slug">{{ f.name }}</option>
				</select>
			</div>
			<form class="admin-filter" @submit.prevent="applySearch">
				<label for="admin-ex-concept">Concepto</label>
				<input
					id="admin-ex-concept"
					v-model="conceptText"
					class="admin-input"
					placeholder="slug"
					autocomplete="off"
					spellcheck="false"
					@input="onSearchInput"
				/>
			</form>
			<div class="admin-filter">
				<label for="admin-ex-category">Categoría</label>
				<select id="admin-ex-category" class="admin-select" :value="query.category" @change="setFilter('category', ($event.target as HTMLSelectElement).value)">
					<option value="">Todas</option>
					<option v-for="c in catalog.categories" :key="c.slug" :value="c.slug">{{ c.name }}</option>
				</select>
			</div>
			<div class="admin-filter">
				<label for="admin-ex-type">Tipo</label>
				<select id="admin-ex-type" class="admin-select" :value="query.type" @change="setFilter('type', ($event.target as HTMLSelectElement).value)">
					<option value="">Todos</option>
					<option v-for="t in EXERCISE_TYPES" :key="t" :value="t">{{ TYPE_LABELS[t] }}</option>
				</select>
			</div>
			<div class="admin-filter">
				<label for="admin-ex-difficulty">Dificultad</label>
				<select id="admin-ex-difficulty" class="admin-select" :value="query.difficulty" @change="setFilter('difficulty', ($event.target as HTMLSelectElement).value)">
					<option value="">Todas</option>
					<option v-for="n in 10" :key="n" :value="String(n)">{{ n }}</option>
				</select>
			</div>
		</div>

		<div class="admin-summary-row">
			<h2 id="admin-exercises-heading" ref="summary" class="admin-summary" tabindex="-1">
				<template v-if="status === 'ready' || exercises.length > 0">
					{{ total === 1 ? "1 ejercicio" : `${numberFormat.format(total)} ejercicios` }}
					<span v-if="hasFilters" class="admin-summary-note">con los filtros actuales</span>
				</template>
				<template v-else>Ejercicios</template>
			</h2>
			<button v-if="hasFilters" type="button" class="admin-button admin-button--ghost admin-button--small" @click="clearFilters">
				<AdminIcon name="filter-off" />
				Quitar filtros
			</button>
			<!-- Cards (narrow screens) have no column headers: sorting moves to a select -->
			<div class="admin-sort-mobile">
				<label for="admin-ex-sort">Ordenar por</label>
				<select id="admin-ex-sort" class="admin-select admin-select--small" :value="`${query.sort}:${query.order}`" @change="setSortOrder(($event.target as HTMLSelectElement).value)">
					<template v-for="s in SORTS" :key="s">
						<option :value="`${s}:asc`">{{ SORT_LABELS[s].charAt(0).toUpperCase() + SORT_LABELS[s].slice(1) }}, ascendente</option>
						<option :value="`${s}:desc`">{{ SORT_LABELS[s].charAt(0).toUpperCase() + SORT_LABELS[s].slice(1) }}, descendente</option>
					</template>
				</select>
			</div>
		</div>

		<p class="sr-only" role="status" aria-live="polite">{{ announcement }}</p>

		<div v-if="status === 'error'" class="admin-state admin-state--error" role="alert">
			<AdminIcon name="alert" />
			<div>
				<p class="admin-state-title">No se pudo cargar la lista de ejercicios.</p>
				<p>{{ loadError?.message }}</p>
				<p class="admin-state-actions">
					<a v-if="loadError?.status === 401" :href="loginHref" class="admin-button admin-button--primary">Iniciar sesión</a>
					<button v-else type="button" class="admin-button" @click="load()">
						<AdminIcon name="refresh" />
						Reintentar
					</button>
				</p>
			</div>
		</div>

		<div v-else-if="firstLoad" class="admin-state admin-state--loading">
			<AdminIcon name="spinner" />
			<p>Cargando ejercicios…</p>
		</div>

		<div v-else-if="status === 'ready' && exercises.length === 0" class="admin-state">
			<AdminIcon name="search" />
			<div>
				<p class="admin-state-title">{{ hasFilters ? "Ningún ejercicio coincide con los filtros." : "Todavía no hay ejercicios." }}</p>
				<p v-if="hasFilters">Prueba con otro título o quita los filtros.</p>
				<p v-else>Crea el primero con «Nuevo ejercicio».</p>
			</div>
		</div>

		<div v-else class="admin-table-wrap" :class="{ 'is-loading': status === 'loading' }" :aria-busy="status === 'loading'">
			<table class="admin-table admin-table--exercises">
				<caption class="sr-only">{{ caption }}</caption>
				<thead>
					<tr>
						<AdminSortHeader label="Título" column="title" :sort="query.sort" :order="query.order" @sort="setSort" />
						<th scope="col">Lenguaje</th>
						<th scope="col">Categoría</th>
						<th scope="col">Tipo</th>
						<AdminSortHeader label="Dificultad" column="difficulty" :sort="query.sort" :order="query.order" numeric @sort="setSort" />
						<AdminSortHeader label="Creado" column="created_at" :sort="query.sort" :order="query.order" @sort="setSort" />
						<th scope="col" class="is-actions"><span class="sr-only">Acciones</span></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="exercise in exercises" :key="exercise.id">
						<th scope="row" class="admin-cell-main">
							<span class="admin-cell-title">{{ exercise.title }}</span>
							<span class="admin-cell-sub admin-mono">{{ exercise.slug }}</span>
						</th>
						<td data-label="Lenguaje">
							<span class="admin-cell-title">{{ languageName(exercise.languageSlug) }}</span>
							<span v-if="exercise.frameworkSlug || exercise.conceptSlug" class="admin-cell-sub">
								{{ [exercise.frameworkSlug && (frameworkNames.get(exercise.frameworkSlug) ?? exercise.frameworkSlug), exercise.conceptSlug].filter(Boolean).join(" · ") }}
							</span>
						</td>
						<td data-label="Categoría">{{ categoryName(exercise.category) }}</td>
						<td data-label="Tipo"><span class="admin-tag">{{ TYPE_LABELS[exercise.type] }}</span></td>
						<td data-label="Dificultad" class="is-numeric">
							<span class="admin-difficulty" :style="{ '--level': exercise.difficulty }">
								<span class="admin-difficulty-bar" aria-hidden="true"></span>
								{{ exercise.difficulty }}<span class="admin-muted">/10</span>
							</span>
						</td>
						<td data-label="Creado">
							<time :datetime="exercise.createdAt" :title="longDate(exercise.createdAt)">{{ shortDate(exercise.createdAt) }}</time>
						</td>
						<td class="is-actions">
							<div class="admin-row-actions">
								<button type="button" class="admin-button admin-button--small" @click="openEdit(exercise)">
									<AdminIcon name="edit" />
									Editar<span class="sr-only"> «{{ exercise.title }}»</span>
								</button>
								<button type="button" class="admin-button admin-button--small admin-button--danger" @click="openDelete(exercise)">
									<AdminIcon name="trash" />
									Eliminar<span class="sr-only"> «{{ exercise.title }}»</span>
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<AdminPager
			v-if="total > 0 && status !== 'error'"
			noun="Ejercicios"
			:offset="query.offset"
			:limit="query.limit"
			:total="total"
			:count="exercises.length"
			:disabled="status === 'loading'"
			@offset="setOffset"
			@limit="setLimit"
		/>

		<AdminDialog
			:open="formOpen"
			size="wide"
			:title="editingId ? `Editar «${editingTitle}»` : 'Nuevo ejercicio'"
			:busy="formBusy"
			@close="closeForm"
		>
			<AdminExerciseForm
				v-if="formOpen"
				:key="editingId ?? 'new'"
				:exercise-id="editingId"
				:catalog="catalog"
				@saved="onSaved"
				@cancel="closeForm"
				@busy="formBusy = $event"
			/>
		</AdminDialog>

		<AdminDialog :open="deleteOpen" title="¿Eliminar este ejercicio?" size="confirm" alert :busy="deleteBusy" @close="closeDelete">
			<div class="admin-confirm">
				<p>
					Vas a eliminar <strong>«{{ deleting?.title }}»</strong>, con sus pistas y el progreso de quienes lo resolvieron.
					No se puede deshacer.
				</p>
				<div v-if="deleteError" class="admin-form-error" role="alert">
					<AdminIcon name="alert" />
					<p>{{ deleteError }}</p>
				</div>
				<div class="admin-form-actions">
					<button type="button" class="admin-button admin-button--ghost" :disabled="deleteBusy" data-autofocus @click="closeDelete">
						Cancelar
					</button>
					<button type="button" class="admin-button admin-button--danger-solid" :disabled="deleteBusy" @click="confirmDelete">
						<AdminIcon :name="deleteBusy ? 'spinner' : 'trash'" />
						{{ deleteBusy ? "Eliminando…" : "Eliminar ejercicio" }}
					</button>
				</div>
			</div>
		</AdminDialog>
	</section>
</template>
