<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, useId } from "vue";
import AdminDialog from "./AdminDialog.vue";
import AdminIcon from "./AdminIcon.vue";
import AdminPager from "./AdminPager.vue";
import AdminSortHeader from "./AdminSortHeader.vue";
import { AdminRequestError, adminRequest, longDate, numberFormat, queryString, shortDate } from "./admin-api";
import { USER_ROLES, assignableRoles } from "@/lib/admin-rules";
import { DISPLAY_NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/auth-rules";
import type {
	AdminCreateUserRequest,
	AdminDeleteResponse,
	AdminOrder,
	AdminUpdateUserRequest,
	AdminUserDTO,
	AdminUserListResponse,
	AdminUserResponse,
	AdminUserSort,
	UserRole,
} from "@/types/api";

/**
 * Users of the admin panel (C8): search by name, role filter, sortable columns, pagination and
 * create / edit / delete in modals. Talks to `/api/admin/users` (the server enforces every rule;
 * `manageable` and `assignableRoles` only hide what would be refused). The list state lives in
 * the URL (`?q=&role=&sort=&order=&limit=&offset=`), so a reload or a shared link keeps it.
 */
const props = defineProps<{
	actorRole: UserRole;
	actorId: string;
	/** Login page with `?next=` back here, for an expired session. */
	loginHref: string;
}>();

const ROLE_LABELS: Record<UserRole, string> = { user: "Usuario", admin: "Admin", superadmin: "Superadmin" };
const SORTS: readonly AdminUserSort[] = ["created_at", "display_name", "level", "coins", "role"];
const SORT_LABELS: Record<AdminUserSort, string> = {
	created_at: "fecha de alta",
	display_name: "nombre",
	level: "nivel",
	coins: "monedas",
	role: "rol",
};
const LIMITS = [10, 20, 50, 100];

const roles = assignableRoles(props.actorRole);
const canChooseRole = roles.length > 1;

// ------------------------------------------------------------------ list state

const query = reactive({
	q: "",
	role: "" as UserRole | "",
	sort: "created_at" as AdminUserSort,
	order: "desc" as AdminOrder,
	limit: 20,
	offset: 0,
});
const searchText = ref("");
const users = ref<AdminUserDTO[]>([]);
const total = ref(0);
const status = ref<"loading" | "ready" | "error">("loading");
const loadError = ref<AdminRequestError | null>(null);
const announcement = ref("");
const summary = ref<HTMLElement | null>(null);
let requestId = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const hasFilters = computed(() => query.q !== "" || query.role !== "");
const firstLoad = computed(() => status.value === "loading" && users.value.length === 0);

function readUrl() {
	const p = new URLSearchParams(window.location.search);
	query.q = p.get("q")?.trim() ?? "";
	const role = p.get("role");
	query.role = (USER_ROLES as readonly string[]).includes(role ?? "") ? (role as UserRole) : "";
	const sort = p.get("sort");
	query.sort = (SORTS as readonly string[]).includes(sort ?? "") ? (sort as AdminUserSort) : "created_at";
	query.order = p.get("order") === "asc" ? "asc" : "desc";
	const limit = Number(p.get("limit"));
	query.limit = LIMITS.includes(limit) ? limit : 20;
	const offset = Number(p.get("offset"));
	query.offset = Number.isInteger(offset) && offset > 0 ? offset : 0;
	searchText.value = query.q;
}

function writeUrl() {
	const search = queryString({
		q: query.q,
		role: query.role,
		sort: query.sort === "created_at" ? "" : query.sort,
		order: query.order === "desc" ? "" : query.order,
		limit: query.limit === 20 ? "" : query.limit,
		offset: query.offset || "",
	});
	history.replaceState(history.state, "", `${window.location.pathname}${search}`);
}

async function load(announce = true) {
	const id = ++requestId;
	status.value = "loading";
	writeUrl();
	try {
		const data = await adminRequest<AdminUserListResponse>(
			"GET",
			`/api/admin/users${queryString({ ...query, role: query.role || undefined })}`,
		);
		if (id !== requestId) return;
		// The page ran out of rows (e.g. after a delete): step back to the last page with rows
		if (data.users.length === 0 && data.total > 0 && query.offset > 0) {
			query.offset = Math.max(0, Math.floor((data.total - 1) / query.limit) * query.limit);
			return load(announce);
		}
		users.value = data.users;
		total.value = data.total;
		status.value = "ready";
		loadError.value = null;
		if (announce) announcement.value = data.total === 1 ? "1 usuario." : `${numberFormat.format(data.total)} usuarios.`;
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
	if (q === query.q) return;
	query.q = q;
	query.offset = 0;
	load();
}

function setRole(role: string) {
	query.role = role as UserRole | "";
	query.offset = 0;
	load();
}

function setSort(column: string) {
	if (query.sort === column) query.order = query.order === "asc" ? "desc" : "asc";
	else {
		query.sort = column as AdminUserSort;
		// Text columns start A-Z; numbers and dates, highest first
		query.order = column === "display_name" || column === "role" ? "asc" : "desc";
	}
	query.offset = 0;
	load();
}

function setSortOrder(value: string) {
	const [sort, order] = value.split(":");
	query.sort = sort as AdminUserSort;
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
	query.q = "";
	query.role = "";
	query.offset = 0;
	load();
}

onMounted(() => {
	readUrl();
	load(false);
});

onBeforeUnmount(() => clearTimeout(searchTimer));

const caption = computed(
	() => `Usuarios, ordenados por ${SORT_LABELS[query.sort]} (${query.order === "asc" ? "ascendente" : "descendente"})`,
);

// ------------------------------------------------------------------ create / edit

const formId = useId();
const formOpen = ref(false);
const editing = ref<AdminUserDTO | null>(null);
const saving = ref(false);
const form = reactive({ email: "", displayName: "", password: "", role: "user" as Exclude<UserRole, "superadmin"> });
const fieldErrors = reactive<Record<string, string>>({});
const formError = ref("");
const FORM_FIELDS = ["email", "displayName", "password", "role"];

function resetErrors() {
	for (const key of Object.keys(fieldErrors)) delete fieldErrors[key];
	formError.value = "";
}

function openCreate() {
	editing.value = null;
	Object.assign(form, { email: "", displayName: "", password: "", role: "user" });
	resetErrors();
	formOpen.value = true;
}

function openEdit(user: AdminUserDTO) {
	editing.value = user;
	Object.assign(form, {
		email: user.email,
		displayName: user.displayName ?? "",
		password: "",
		role: user.role === "superadmin" ? "admin" : user.role,
	});
	resetErrors();
	formOpen.value = true;
}

function closeForm() {
	if (!saving.value) formOpen.value = false;
}

function validate(): boolean {
	resetErrors();
	const email = form.email.trim();
	if (!email) fieldErrors.email = "Escribe el correo electrónico.";
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Escribe un correo válido, como nombre@ejemplo.com.";
	if (!editing.value && !form.password) fieldErrors.password = "Escribe una contraseña para la cuenta nueva.";
	else if (form.password && form.password.length < PASSWORD_MIN_LENGTH) {
		fieldErrors.password = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
	}
	return Object.keys(fieldErrors).length === 0;
}

async function focusFirstError() {
	await nextTick();
	const first = FORM_FIELDS.find((field) => fieldErrors[field]);
	if (first) document.getElementById(`${formId}-${first}`)?.focus();
	else document.getElementById(`${formId}-error`)?.focus();
}

async function submitForm() {
	if (saving.value) return;
	if (!validate()) return focusFirstError();
	saving.value = true;
	try {
		const email = form.email.trim();
		const displayName = form.displayName.trim();
		if (editing.value) {
			const before = editing.value;
			const patch: AdminUpdateUserRequest = {};
			if (email !== before.email) patch.email = email;
			if (displayName !== (before.displayName ?? "")) patch.displayName = displayName;
			if (form.password) patch.password = form.password;
			if (canChooseRole && form.role !== before.role) patch.role = form.role;
			if (Object.keys(patch).length === 0) {
				formOpen.value = false;
				announcement.value = "No había cambios que guardar.";
				return;
			}
			const { user } = await adminRequest<AdminUserResponse>("PATCH", `/api/admin/users/${encodeURIComponent(before.id)}`, patch);
			users.value = users.value.map((row) => (row.id === user.id ? user : row));
			formOpen.value = false;
			announcement.value = `Cambios guardados en ${user.displayName || user.email}.`;
		} else {
			const body: AdminCreateUserRequest = { email, password: form.password, role: canChooseRole ? form.role : "user" };
			if (displayName) body.displayName = displayName;
			const { user } = await adminRequest<AdminUserResponse>("POST", "/api/admin/users", body);
			formOpen.value = false;
			await load(false);
			announcement.value = `Usuario creado: ${user.displayName || user.email}.`;
		}
	} catch (error) {
		const failure = error instanceof AdminRequestError ? error : new AdminRequestError(0, undefined, "Error inesperado.");
		if (failure.field && FORM_FIELDS.includes(failure.field)) fieldErrors[failure.field] = failure.message;
		else formError.value = failure.message;
		focusFirstError();
	} finally {
		saving.value = false;
	}
}

// ------------------------------------------------------------------ delete

const deleting = ref<AdminUserDTO | null>(null);
const deleteOpen = ref(false);
const deleteBusy = ref(false);
const deleteError = ref("");

function openDelete(user: AdminUserDTO) {
	deleting.value = user;
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
		await adminRequest<AdminDeleteResponse>("DELETE", `/api/admin/users/${encodeURIComponent(target.id)}`);
		deleteOpen.value = false;
		await load(false);
		announcement.value = `Usuario eliminado: ${target.displayName || target.email}.`;
		await nextTick();
		summary.value?.focus();
	} catch (error) {
		deleteError.value = error instanceof AdminRequestError ? error.message : "Error inesperado.";
	} finally {
		deleteBusy.value = false;
	}
}

const displayName = (user: AdminUserDTO) => user.displayName?.trim() || "Sin nombre";
const roleIcon = (role: UserRole) => (role === "superadmin" ? "crown" : role === "admin" ? "shield" : "user");
</script>

<template>
	<section class="admin-list" aria-labelledby="admin-users-heading">
		<div class="admin-toolbar">
			<form role="search" class="admin-search" @submit.prevent="applySearch">
				<label for="admin-users-q" class="sr-only">Buscar por nombre</label>
				<AdminIcon name="search" />
				<input
					id="admin-users-q"
					v-model="searchText"
					type="search"
					class="admin-input"
					placeholder="Buscar por nombre"
					autocomplete="off"
					@input="onSearchInput"
				/>
			</form>
			<div class="admin-filter">
				<label for="admin-users-role">Rol</label>
				<select id="admin-users-role" class="admin-select" :value="query.role" @change="setRole(($event.target as HTMLSelectElement).value)">
					<option value="">Todos</option>
					<option v-for="role in USER_ROLES" :key="role" :value="role">{{ ROLE_LABELS[role] }}</option>
				</select>
			</div>
			<button v-if="roles.length > 0" type="button" class="admin-button admin-button--primary admin-toolbar-action" @click="openCreate">
				<AdminIcon name="plus" />
				Nuevo usuario
			</button>
		</div>

		<div class="admin-summary-row">
			<h2 id="admin-users-heading" ref="summary" class="admin-summary" tabindex="-1">
				<template v-if="status === 'ready' || users.length > 0">
					{{ total === 1 ? "1 usuario" : `${numberFormat.format(total)} usuarios` }}
					<span v-if="hasFilters" class="admin-summary-note">con los filtros actuales</span>
				</template>
				<template v-else>Usuarios</template>
			</h2>
			<button v-if="hasFilters" type="button" class="admin-button admin-button--ghost admin-button--small" @click="clearFilters">
				<AdminIcon name="filter-off" />
				Quitar filtros
			</button>
			<!-- Cards (narrow screens) have no column headers: sorting moves to a select -->
			<div class="admin-sort-mobile">
				<label for="admin-users-sort">Ordenar por</label>
				<select id="admin-users-sort" class="admin-select admin-select--small" :value="`${query.sort}:${query.order}`" @change="setSortOrder(($event.target as HTMLSelectElement).value)">
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
				<p class="admin-state-title">No se pudo cargar la lista de usuarios.</p>
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
			<p>Cargando usuarios…</p>
		</div>

		<div v-else-if="status === 'ready' && users.length === 0" class="admin-state">
			<AdminIcon name="search" />
			<div>
				<p class="admin-state-title">{{ hasFilters ? "Ningún usuario coincide con la búsqueda." : "Todavía no hay usuarios." }}</p>
				<p v-if="hasFilters">Prueba con otro nombre o quita los filtros.</p>
			</div>
		</div>

		<div v-else class="admin-table-wrap" :class="{ 'is-loading': status === 'loading' }" :aria-busy="status === 'loading'">
			<table class="admin-table admin-table--users">
				<caption class="sr-only">{{ caption }}</caption>
				<thead>
					<tr>
						<AdminSortHeader label="Nombre" column="display_name" :sort="query.sort" :order="query.order" @sort="setSort" />
						<AdminSortHeader label="Rol" column="role" :sort="query.sort" :order="query.order" @sort="setSort" />
						<AdminSortHeader label="Nivel" column="level" :sort="query.sort" :order="query.order" numeric @sort="setSort" />
						<AdminSortHeader label="Monedas" column="coins" :sort="query.sort" :order="query.order" numeric @sort="setSort" />
						<AdminSortHeader label="Alta" column="created_at" :sort="query.sort" :order="query.order" @sort="setSort" />
						<th scope="col">Último acceso</th>
						<th scope="col" class="is-actions"><span class="sr-only">Acciones</span></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="user in users" :key="user.id">
						<th scope="row" class="admin-cell-main">
							<span class="admin-cell-title" :class="{ 'is-empty': !user.displayName }">
								{{ displayName(user) }}
								<span v-if="user.id === actorId" class="admin-you">Tú</span>
							</span>
							<span class="admin-cell-sub">{{ user.email }}</span>
						</th>
						<td data-label="Rol">
							<span class="admin-role" :class="`admin-role--${user.role}`">
								<AdminIcon :name="roleIcon(user.role)" />
								{{ ROLE_LABELS[user.role] }}
							</span>
						</td>
						<td data-label="Nivel" class="is-numeric">{{ numberFormat.format(user.level) }}</td>
						<td data-label="Monedas" class="is-numeric">{{ numberFormat.format(user.coins) }}</td>
						<td data-label="Alta">
							<time :datetime="user.createdAt" :title="longDate(user.createdAt)">{{ shortDate(user.createdAt) }}</time>
						</td>
						<td data-label="Último acceso">
							<time v-if="user.lastSignInAt" :datetime="user.lastSignInAt" :title="longDate(user.lastSignInAt)">
								{{ shortDate(user.lastSignInAt) }}
							</time>
							<span v-else class="admin-muted">Nunca</span>
						</td>
						<td class="is-actions">
							<div v-if="user.manageable" class="admin-row-actions">
								<button type="button" class="admin-button admin-button--small" @click="openEdit(user)">
									<AdminIcon name="edit" />
									Editar<span class="sr-only"> a {{ displayName(user) }}</span>
								</button>
								<button type="button" class="admin-button admin-button--small admin-button--danger" @click="openDelete(user)">
									<AdminIcon name="trash" />
									Eliminar<span class="sr-only"> a {{ displayName(user) }}</span>
								</button>
							</div>
							<span v-else class="admin-muted admin-readonly">Solo lectura</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<AdminPager
			v-if="total > 0 && status !== 'error'"
			noun="Usuarios"
			:offset="query.offset"
			:limit="query.limit"
			:total="total"
			:count="users.length"
			:disabled="status === 'loading'"
			@offset="setOffset"
			@limit="setLimit"
		/>

		<AdminDialog :open="formOpen" :title="editing ? `Editar a ${displayName(editing)}` : 'Nuevo usuario'" :busy="saving" @close="closeForm">
			<form class="admin-form" novalidate @submit.prevent="submitForm">
				<div v-if="formError" :id="`${formId}-error`" class="admin-form-error" role="alert" tabindex="-1">
					<AdminIcon name="alert" />
					<p>{{ formError }}</p>
				</div>

				<div class="admin-field" :class="{ 'is-invalid': fieldErrors.email }">
					<label :for="`${formId}-email`">Correo electrónico</label>
					<input
						:id="`${formId}-email`"
						v-model="form.email"
						type="email"
						class="admin-input"
						autocomplete="off"
						spellcheck="false"
						required
						data-autofocus
						:aria-invalid="fieldErrors.email ? 'true' : undefined"
						:aria-describedby="fieldErrors.email ? `${formId}-email-error` : undefined"
					/>
					<p v-if="fieldErrors.email" :id="`${formId}-email-error`" class="admin-field-error">
						<AdminIcon name="alert" />{{ fieldErrors.email }}
					</p>
				</div>

				<div class="admin-field" :class="{ 'is-invalid': fieldErrors.displayName }">
					<label :for="`${formId}-displayName`">Nombre visible <span class="admin-optional">(opcional)</span></label>
					<input
						:id="`${formId}-displayName`"
						v-model="form.displayName"
						type="text"
						class="admin-input"
						autocomplete="off"
						:maxlength="DISPLAY_NAME_MAX_LENGTH"
						:aria-invalid="fieldErrors.displayName ? 'true' : undefined"
						:aria-describedby="`${formId}-displayName-hint${fieldErrors.displayName ? ` ${formId}-displayName-error` : ''}`"
					/>
					<p :id="`${formId}-displayName-hint`" class="admin-field-hint">
						{{ editing ? "Déjalo vacío para quitar el nombre." : "Es el nombre que verá en la cabecera." }}
					</p>
					<p v-if="fieldErrors.displayName" :id="`${formId}-displayName-error`" class="admin-field-error">
						<AdminIcon name="alert" />{{ fieldErrors.displayName }}
					</p>
				</div>

				<div class="admin-field" :class="{ 'is-invalid': fieldErrors.password }">
					<label :for="`${formId}-password`">
						{{ editing ? "Contraseña nueva" : "Contraseña" }}
						<span v-if="editing" class="admin-optional">(opcional)</span>
					</label>
					<input
						:id="`${formId}-password`"
						v-model="form.password"
						type="password"
						class="admin-input"
						autocomplete="new-password"
						:required="!editing"
						:maxlength="PASSWORD_MAX_LENGTH"
						:aria-invalid="fieldErrors.password ? 'true' : undefined"
						:aria-describedby="`${formId}-password-hint${fieldErrors.password ? ` ${formId}-password-error` : ''}`"
					/>
					<p :id="`${formId}-password-hint`" class="admin-field-hint">
						Mínimo {{ PASSWORD_MIN_LENGTH }} caracteres.
						{{ editing ? "Déjala vacía para mantener la actual." : "Compártela con la persona por un canal seguro." }}
					</p>
					<p v-if="fieldErrors.password" :id="`${formId}-password-error`" class="admin-field-error">
						<AdminIcon name="alert" />{{ fieldErrors.password }}
					</p>
				</div>

				<fieldset v-if="canChooseRole" class="admin-field admin-choice" :class="{ 'is-invalid': fieldErrors.role }">
					<legend>Rol</legend>
					<div class="admin-choice-options">
						<label v-for="role in roles" :key="role" class="admin-choice-option">
							<input v-model="form.role" type="radio" :name="`${formId}-role`" :value="role" :id="role === roles[0] ? `${formId}-role` : undefined" />
							<span class="admin-role" :class="`admin-role--${role}`">
								<AdminIcon :name="roleIcon(role)" />
								{{ ROLE_LABELS[role] }}
							</span>
							<span class="admin-choice-hint">
								{{ role === "admin" ? "Gestiona usuarios y ejercicios." : "Solo aprende y resuelve ejercicios." }}
							</span>
						</label>
					</div>
					<p v-if="fieldErrors.role" class="admin-field-error"><AdminIcon name="alert" />{{ fieldErrors.role }}</p>
				</fieldset>

				<div class="admin-form-actions">
					<button type="button" class="admin-button admin-button--ghost" :disabled="saving" @click="closeForm">Cancelar</button>
					<button type="submit" class="admin-button admin-button--primary" :disabled="saving">
						<AdminIcon v-if="saving" name="spinner" />
						{{ saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear usuario" }}
					</button>
				</div>
			</form>
		</AdminDialog>

		<AdminDialog :open="deleteOpen" title="¿Eliminar este usuario?" size="confirm" alert :busy="deleteBusy" @close="closeDelete">
			<div class="admin-confirm">
				<p>
					Vas a eliminar a <strong>{{ deleting ? displayName(deleting) : "" }}</strong>&nbsp;<span class="admin-muted">({{ deleting?.email }})</span>, con su progreso, monedas y preferencias.
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
						{{ deleteBusy ? "Eliminando…" : "Eliminar usuario" }}
					</button>
				</div>
			</div>
		</AdminDialog>
	</section>
</template>
