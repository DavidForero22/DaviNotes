<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from "vue";
import AdminIcon from "./AdminIcon.vue";

/**
 * Modal of the admin panel on the native <dialog> (`showModal`): the browser keeps the focus
 * inside, makes the page inert and closes it with Escape. On open the focus goes to the first
 * field (`[autofocus]`) or, failing that, the title; on close it goes back to the control that
 * opened it. While `busy`, Escape and the close button do nothing (a request is running).
 */
const props = withDefaults(
	defineProps<{
		open: boolean;
		title: string;
		/** `form` for the create/edit forms, `confirm` for the small delete confirmation. */
		size?: "form" | "wide" | "confirm";
		busy?: boolean;
		/** Role `alertdialog` for destructive confirmations. */
		alert?: boolean;
	}>(),
	{ size: "form", busy: false, alert: false },
);

const emit = defineEmits<{ close: [] }>();

const dialog = ref<HTMLDialogElement | null>(null);
const titleId = useId();
let opener: HTMLElement | null = null;

watch(
	() => props.open,
	async (open) => {
		const el = dialog.value;
		if (!el) return;
		if (open && !el.open) {
			opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			el.showModal();
			await nextTick();
			const first = el.querySelector<HTMLElement>("[autofocus], [data-autofocus]");
			(first ?? el.querySelector<HTMLElement>(".admin-dialog-title"))?.focus();
		} else if (!open && el.open) {
			el.close();
		}
	},
	{ flush: "post" },
);

function onClose() {
	// Fired by el.close() or by the browser: give the focus back and sync the parent state
	const target = opener;
	opener = null;
	if (target && document.contains(target)) target.focus();
	if (props.open) emit("close");
}

function onCancel(event: Event) {
	event.preventDefault();
	if (!props.busy) emit("close");
}

/** A click on the backdrop (the <dialog> itself, outside the panel) closes it. */
function onPointerDown(event: MouseEvent) {
	if (event.target === dialog.value && !props.busy) emit("close");
}

onBeforeUnmount(() => {
	if (dialog.value?.open) dialog.value.close();
});
</script>

<template>
	<dialog
		ref="dialog"
		class="admin-dialog"
		:class="`admin-dialog--${size}`"
		:role="alert ? 'alertdialog' : undefined"
		:aria-labelledby="titleId"
		:aria-busy="busy || undefined"
		@close="onClose"
		@cancel="onCancel"
		@mousedown="onPointerDown"
	>
		<div class="admin-dialog-panel">
			<header class="admin-dialog-head">
				<h2 :id="titleId" class="admin-dialog-title" tabindex="-1">{{ title }}</h2>
				<button type="button" class="admin-icon-button" :disabled="busy" @click="emit('close')">
					<AdminIcon name="close" />
					<span class="sr-only">Cerrar</span>
				</button>
			</header>
			<slot />
		</div>
	</dialog>
</template>
