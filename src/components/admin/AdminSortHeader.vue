<script setup lang="ts">
import { computed } from "vue";
import AdminIcon from "./AdminIcon.vue";
import type { AdminOrder } from "@/types/api";

/**
 * Sortable column header: a button inside the <th>, with `aria-sort` on the active column.
 * A click on the active column flips the order; on another column it sorts by it.
 */
const props = defineProps<{
	label: string;
	column: string;
	sort: string;
	order: AdminOrder;
	numeric?: boolean;
}>();

const emit = defineEmits<{ sort: [column: string] }>();

const active = computed(() => props.sort === props.column);
const ariaSort = computed(() => (active.value ? (props.order === "asc" ? "ascending" : "descending") : undefined));
const icon = computed(() => (!active.value ? "sort" : props.order === "asc" ? "sort-asc" : "sort-desc"));
</script>

<template>
	<th scope="col" :aria-sort="ariaSort" :class="{ 'is-numeric': numeric }">
		<button type="button" class="admin-sort" :class="{ 'is-active': active }" @click="emit('sort', column)">
			{{ label }}
			<AdminIcon :name="icon" />
		</button>
	</th>
</template>
