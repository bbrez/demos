<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import '../app.css';
	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		const isBackNavigation = navigation.delta && navigation.delta < 0;

		document.documentElement.dataset.viewTransitionDirection = isBackNavigation
			? 'back'
			: 'forward';

		console.log('onNavigate', navigation);
		console.log('onNavigate', navigation.delta);

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

{@render children()}
