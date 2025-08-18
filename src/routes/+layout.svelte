<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	let { children, data } = $props();
	let isSidebarOpen = $state(false);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function closeSidebar() {
		isSidebarOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeSidebar();
		}
	}

	// Navigation items
	const navigation = [
		{ name: 'Dashboard', href: '/', icon: 'fas fa-tachometer-alt' },
		{ name: 'Patients', href: '/patients', icon: 'fas fa-user-injured' },
		{ name: 'Appointments', href: '/appointments', icon: 'fas fa-calendar-check' },
		{ name: 'Treatments', href: '/treatments', icon: 'fas fa-stethoscope' },
		{ name: 'Billing', href: '/billing', icon: 'fas fa-file-invoice-dollar' },
		{ name: 'Reports', href: '/reports', icon: 'fas fa-chart-bar' },
		{ name: 'Staff', href: '/staff', icon: 'fas fa-user-md' }
	];

	let currentPath = $derived(data?.url?.pathname || '/');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
	<!-- Header -->
	<header class="bg-white shadow-lg border-b-4 border-blue-500">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo and Brand -->
				<div class="flex items-center space-x-4">
					<button 
						class="lg:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
						onclick={toggleSidebar}
						aria-label="Toggle navigation menu"
					>
						<i class="fas fa-bars text-xl"></i>
					</button>
					<div class="flex items-center space-x-3">
						<div class="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
							<i class="fas fa-heartbeat text-white text-2xl"></i>
						</div>
						<div>
							<h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
								MedSync
							</h1>
							<p class="text-xs text-gray-500 font-medium">Clinic Management System</p>
						</div>
					</div>
				</div>

				<!-- User Menu -->
				<div class="flex items-center space-x-4">
					<div class="hidden sm:flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
						<i class="fas fa-map-marker-alt text-blue-600"></i>
						<span class="text-sm font-medium text-blue-800">Colombo Branch</span>
					</div>
					<div class="flex items-center space-x-2">
						<div class="bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-full">
							<i class="fas fa-user text-white"></i>
						</div>
						<div class="hidden sm:block">
							<p class="text-sm font-medium text-gray-900">Kalana Liyanage</p>
							<p class="text-xs text-gray-500">Administrator</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<div class="flex">
		<!-- Sidebar -->
		<aside class="{isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:shadow-none border-r border-gray-200">
			<div class="flex flex-col h-full pt-20 lg:pt-6">
				<!-- Close button for mobile -->
				<div class="lg:hidden flex justify-end p-4">
					<button 
						class="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
						onclick={closeSidebar}
						aria-label="Close navigation menu"
					>
						<i class="fas fa-times text-xl"></i>
					</button>
				</div>

				<!-- Navigation -->
				<nav class="flex-1 px-4 pb-4 space-y-2">
					{#each navigation as item}
						<a
							href={item.href}
							class="{currentPath === item.href 
								? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg' 
								: 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:text-blue-700'
							} flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
							onclick={closeSidebar}
						>
							<i class="{item.icon} mr-3 text-lg"></i>
							{item.name}
						</a>
					{/each}
				</nav>

				<!-- Branch Info -->
				<div class="p-4 border-t border-gray-200">
					<div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3">
						<div class="flex items-center space-x-2 mb-2">
							<i class="fas fa-hospital text-blue-600"></i>
							<span class="font-semibold text-gray-800">Branch Status</span>
						</div>
						<div class="text-sm space-y-1">
							<div class="flex justify-between">
								<span class="text-gray-600">Online:</span>
								<span class="text-green-600 font-medium flex items-center">
									<i class="fas fa-circle text-xs mr-1"></i>
									Active
								</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Hours:</span>
								<span class="text-blue-600 font-medium">8AM - 8PM</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</aside>

		<!-- Overlay for mobile -->
		{#if isSidebarOpen}
			<div 
				class="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
				onclick={closeSidebar}
				onkeydown={handleKeydown}
				role="button"
				tabindex="0"
				aria-label="Close sidebar overlay"
			></div>
		{/if}

		<!-- Main Content -->
		<main class="flex-1 lg:ml-0">
			<div class="min-h-screen">
				{@render children?.()}
			</div>
		</main>
	</div>

	<!-- Footer -->
	<footer class="bg-white border-t border-gray-200 mt-auto">
		<div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
				<div class="flex items-center space-x-4">
					<div class="flex items-center space-x-2">
						<div class="bg-gradient-to-r from-blue-600 to-green-600 p-1 rounded">
							<i class="fas fa-heartbeat text-white text-sm"></i>
						</div>
						<span class="text-sm font-medium text-gray-900">MedSync CATMS</span>
					</div>
					<span class="text-sm text-gray-500">© 2025 Group 5. All rights reserved.</span>
				</div>
				<div class="flex items-center space-x-6">
					<div class="flex items-center space-x-4 text-sm text-gray-600">
						<span class="flex items-center">
							<i class="fas fa-map-marker-alt mr-1 text-blue-600"></i>
							Colombo | Kandy | Galle
						</span>
						<span class="flex items-center">
							<i class="fas fa-phone mr-1 text-green-600"></i>
							+94 71 7524 388
						</span>
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>
