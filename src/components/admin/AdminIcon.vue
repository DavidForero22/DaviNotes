<script setup lang="ts">
/**
 * Stroke icons of the admin panel: one 24px grid, 2px stroke, round caps (same drawing as the
 * account menu icons). Always decorative: the control next to it carries the accessible name.
 */
export type AdminIconName =
	| "search"
	| "plus"
	| "edit"
	| "trash"
	| "close"
	| "chevron-left"
	| "chevron-right"
	| "sort"
	| "sort-asc"
	| "sort-desc"
	| "alert"
	| "check"
	| "shield"
	| "crown"
	| "user"
	| "refresh"
	| "arrow-up"
	| "arrow-down"
	| "filter-off"
	| "spinner";

defineProps<{ name: AdminIconName }>();

const paths: Record<AdminIconName, string[]> = {
	search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M20 20l-4-4"],
	plus: ["M12 5v14", "M5 12h14"],
	edit: ["M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z", "M13.5 6.5l4 4"],
	trash: ["M4 7h16", "M10 11v6", "M14 11v6", "M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12", "M9 7V4h6v3"],
	close: ["M6 6l12 12", "M18 6L6 18"],
	"chevron-left": ["M15 6l-6 6 6 6"],
	"chevron-right": ["M9 6l6 6-6 6"],
	sort: ["M8 9l4-4 4 4", "M8 15l4 4 4-4"],
	"sort-asc": ["M8 14l4-4 4 4"],
	"sort-desc": ["M8 10l4 4 4-4"],
	alert: ["M12 3l9.5 17h-19L12 3z", "M12 10v4", "M12 17.2v.1"],
	check: ["M5 12.5l4.5 4.5L19 7.5"],
	shield: ["M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6L12 3z", "M9 12l2 2 4-4"],
	crown: ["M4 8l4 4 4-7 4 7 4-4-1.5 10h-13L4 8z"],
	user: ["M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M5 19.5c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5"],
	refresh: ["M20 11a8 8 0 0 0-14.8-4", "M4 4v4h4", "M4 13a8 8 0 0 0 14.8 4", "M20 20v-4h-4"],
	"arrow-up": ["M12 19V5", "M6 11l6-6 6 6"],
	"arrow-down": ["M12 5v14", "M6 13l6 6 6-6"],
	"filter-off": ["M4 5h16l-6 7.5V19l-4-2v-4.5L4 5z", "M3 3l18 18"],
	spinner: ["M12 3a9 9 0 1 0 9 9"],
};
</script>

<template>
	<svg class="admin-icon" :class="`admin-icon--${name}`" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path v-for="(d, i) in paths[name]" :key="i" :d="d" />
	</svg>
</template>
