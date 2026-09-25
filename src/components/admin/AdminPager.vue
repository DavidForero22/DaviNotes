<script setup lang="ts">
import { computed, useId } from "vue";
import AdminIcon from "./AdminIcon.vue";
import { numberFormat, rangeText } from "./admin-api";

/** Pagination of an admin list: range text, page size and previous/next. */
const props = defineProps<{
	offset: number;
	limit: number;
	total: number;
	/** Rows on the current page. */
	count: number;
	disabled?: boolean;
	/** "usuarios", "ejercicios": label of the page size select. */
	noun: string;
}>();

const emit = defineEmits<{ offset: [value: number]; limit: [value: number] }>();

const page = computed(() => Math.floor(props.offset / props.limit) + 1);
const pages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)));
const sizeId = useId();
</script>

<template>
	<nav class="admin-pager" aria-label="Paginación">
		<p class="admin-pager-range">{{ rangeText(offset, count, total) }}</p>
		<div class="admin-pager-size">
			<label :for="sizeId">{{ noun }} por página</label>
			<select
				:id="sizeId"
				class="admin-select admin-select--small"
				:value="limit"
				:disabled="disabled"
				@change="emit('limit', Number(($event.target as HTMLSelectElement).value))"
			>
				<option v-for="size in [10, 20, 50, 100]" :key="size" :value="size">{{ size }}</option>
			</select>
		</div>
		<div class="admin-pager-steps">
			<button
				type="button"
				class="admin-button admin-button--ghost"
				:disabled="disabled || offset === 0"
				@click="emit('offset', Math.max(0, offset - limit))"
			>
				<AdminIcon name="chevron-left" />
				Anterior
			</button>
			<span class="admin-pager-page">Página {{ numberFormat.format(page) }} de {{ numberFormat.format(pages) }}</span>
			<button
				type="button"
				class="admin-button admin-button--ghost"
				:disabled="disabled || offset + limit >= total"
				@click="emit('offset', offset + limit)"
			>
				Siguiente
				<AdminIcon name="chevron-right" />
			</button>
		</div>
	</nav>
</template>
