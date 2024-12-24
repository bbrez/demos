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

<header class="w-full bg-neutral-200 py-1">
	<nav class="container mx-auto">
		<a href="/">Home</a>
	</nav>
</header>
<main>
	{@render children()}
</main>

<style>
	header {
		view-transition-name: header;
	}
</style>
