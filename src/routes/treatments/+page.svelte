<script lang="ts">
	import { onMount } from 'svelte';

	interface Treatment {
		id: number;
		serviceCode: string;
		name: string;
		description: string;
		price: string;
		category: string;
		isActive: boolean;
		createdAt: string;
		updatedAt: string;
	}

	let treatments = $state<Treatment[]>([]);
	let loading = $state(true);
	let showAddForm = $state(false);
	let searchTerm = $state('');
	let categoryFilter = $state('');

	// Form state
	let formData = $state({
		serviceCode: '',
		name: '',
		description: '',
		price: '',
		category: ''
	});

	let formErrors = $state<Record<string, string>>({});
	let submitting = $state(false);

	// Treatment categories
	const categories = [
		'General Consultation',
		'Cardiology',
		'Pediatrics',
		'Orthopedics',
		'Dermatology',
		'Gynecology',
		'Neurology',
		'Psychiatry',
		'Radiology',
		'Laboratory',
		'Surgery',
		'Emergency'
	];

	onMount(async () => {
		await loadTreatments();
	});

	async function loadTreatments() {
		try {
			loading = true;
			const response = await fetch('/api/treatments');
			if (response.ok) {
				treatments = await response.json();
			}
		} catch (error) {
			console.error('Error loading treatments:', error);
		} finally {
			loading = false;
		}
	}

	function validateForm() {
		formErrors = {};
		
		if (!formData.serviceCode.trim()) formErrors.serviceCode = 'Service code is required';
		if (!formData.name.trim()) formErrors.name = 'Treatment name is required';
		if (!formData.price.trim()) formErrors.price = 'Price is required';
		if (!formData.category) formErrors.category = 'Category is required';

		// Price validation
		if (formData.price && isNaN(parseFloat(formData.price))) {
			formErrors.price = 'Price must be a valid number';
		}

		// Service code format validation
		if (formData.serviceCode && !/^[A-Z0-9]+$/.test(formData.serviceCode)) {
			formErrors.serviceCode = 'Service code must contain only uppercase letters and numbers';
		}

		return Object.keys(formErrors).length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!validateForm()) return;

		try {
			submitting = true;
			const response = await fetch('/api/treatments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					...formData,
					price: parseFloat(formData.price)
				})
			});

			if (response.ok) {
				const newTreatment = await response.json();
				treatments = [newTreatment, ...treatments];
				resetForm();
				showAddForm = false;
			} else {
				const error = await response.json();
				console.error('Error creating treatment:', error);
			}
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			submitting = false;
		}
	}

	function resetForm() {
		formData = {
			serviceCode: '',
			name: '',
			description: '',
			price: '',
			category: ''
		};
		formErrors = {};
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatPrice(price: string) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'LKR',
			minimumFractionDigits: 2
		}).format(parseFloat(price));
	}

	// Filtered treatments
	let filteredTreatments = $derived(treatments.filter(treatment => {
		const matchesSearch = !searchTerm || 
			treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			treatment.serviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
			treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesCategory = !categoryFilter || treatment.category === categoryFilter;
		
		return matchesSearch && matchesCategory;
	}));

	// Get unique categories from treatments
	let usedCategories = $derived([...new Set(treatments.map(t => t.category))].sort());
</script>

<div class="p-6 space-y-6">
	<!-- Page Header -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 flex items-center">
					<i class="fas fa-stethoscope text-purple-600 mr-3"></i>
					Treatment Management
				</h1>
				<p class="text-gray-600 mt-1">Manage treatment catalog and pricing</p>
			</div>
			<button
				onclick={() => showAddForm = true}
				class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
			>
				<i class="fas fa-plus"></i>
				<span>Add Treatment</span>
			</button>
		</div>
	</div>

	<!-- Search and Filters -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Search Treatments</label>
				<div class="relative">
					<i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
					<input
						type="text"
						bind:value={searchTerm}
						placeholder="Search by name, code, or description..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
					>
				</div>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
				<select
					bind:value={categoryFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
				>
					<option value="">All Categories</option>
					{#each usedCategories as category}
						<option value={category}>{category}</option>
					{/each}
				</select>
			</div>
			<div class="flex items-end">
				<div class="text-sm text-gray-600">
					<i class="fas fa-list mr-1"></i>
					{filteredTreatments.length} treatment{filteredTreatments.length !== 1 ? 's' : ''} found
				</div>
			</div>
		</div>
	</div>

	<!-- Treatments Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#if loading}
			{#each Array(6) as _}
				<div class="bg-white rounded-xl shadow-lg p-6 animate-pulse">
					<div class="space-y-4">
						<div class="flex justify-between items-start">
							<div class="space-y-2">
								<div class="h-4 bg-gray-200 rounded w-24"></div>
								<div class="h-6 bg-gray-200 rounded w-32"></div>
							</div>
							<div class="h-6 bg-gray-200 rounded w-16"></div>
						</div>
						<div class="h-12 bg-gray-200 rounded"></div>
						<div class="flex justify-between items-center">
							<div class="h-8 bg-gray-200 rounded w-20"></div>
							<div class="h-8 bg-gray-200 rounded w-16"></div>
						</div>
					</div>
				</div>
			{/each}
		{:else if filteredTreatments.length === 0}
			<div class="col-span-full">
				<div class="text-center py-12">
					<i class="fas fa-prescription-bottle-alt text-gray-400 text-4xl mb-4"></i>
					<h3 class="text-lg font-medium text-gray-900 mb-2">No treatments found</h3>
					<p class="text-gray-500 mb-4">
						{searchTerm || categoryFilter ? 'Try adjusting your search criteria' : 'Get started by adding your first treatment'}
					</p>
					{#if !searchTerm && !categoryFilter}
						<button
							onclick={() => showAddForm = true}
							class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
						>
							<i class="fas fa-plus"></i>
							<span>Add First Treatment</span>
						</button>
					{/if}
				</div>
			</div>
		{:else}
			{#each filteredTreatments as treatment}
				<div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
					<div class="space-y-4">
						<!-- Header -->
						<div class="flex justify-between items-start">
							<div>
								<p class="text-sm font-medium text-purple-600">{treatment.serviceCode}</p>
								<h3 class="text-lg font-semibold text-gray-900 mt-1">{treatment.name}</h3>
							</div>
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {treatment.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
								<i class="fas {treatment.isActive ? 'fa-check-circle' : 'fa-times-circle'} mr-1"></i>
								{treatment.isActive ? 'Active' : 'Inactive'}
							</span>
						</div>

						<!-- Category -->
						<div class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700">
							<i class="fas fa-tag mr-2"></i>
							{treatment.category}
						</div>

						<!-- Description -->
						{#if treatment.description}
							<p class="text-gray-600 text-sm line-clamp-3">{treatment.description}</p>
						{/if}

						<!-- Footer -->
						<div class="flex justify-between items-center pt-4 border-t border-gray-200">
							<div class="text-2xl font-bold text-gray-900">
								{formatPrice(treatment.price)}
							</div>
							<div class="flex items-center space-x-2">
								<button class="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors">
									<i class="fas fa-edit"></i>
								</button>
								<button class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
									<i class="fas fa-trash"></i>
								</button>
							</div>
						</div>

						<!-- Last updated -->
						<p class="text-xs text-gray-500">
							Updated {formatDate(treatment.updatedAt)}
						</p>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<!-- Add Treatment Modal -->
{#if showAddForm}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-gray-200">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900 flex items-center">
						<i class="fas fa-plus text-purple-600 mr-2"></i>
						Add New Treatment
					</h2>
					<button
						onclick={() => { showAddForm = false; resetForm(); }}
						class="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<i class="fas fa-times text-xl"></i>
					</button>
				</div>
			</div>
			
			<form onsubmit={handleSubmit} class="p-6 space-y-6">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Service Code *</label>
						<input
							type="text"
							bind:value={formData.serviceCode}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 {formErrors.serviceCode ? 'border-red-500' : ''}"
							placeholder="e.g., CONS001"
							style="text-transform: uppercase;"
						>
						{#if formErrors.serviceCode}
							<p class="mt-1 text-sm text-red-600">{formErrors.serviceCode}</p>
						{/if}
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Price (LKR) *</label>
						<input
							type="number"
							bind:value={formData.price}
							min="0"
							step="0.01"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 {formErrors.price ? 'border-red-500' : ''}"
							placeholder="0.00"
						>
						{#if formErrors.price}
							<p class="mt-1 text-sm text-red-600">{formErrors.price}</p>
						{/if}
					</div>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Treatment Name *</label>
					<input
						type="text"
						bind:value={formData.name}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 {formErrors.name ? 'border-red-500' : ''}"
						placeholder="Enter treatment name"
					>
					{#if formErrors.name}
						<p class="mt-1 text-sm text-red-600">{formErrors.name}</p>
					{/if}
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
					<select
						bind:value={formData.category}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 {formErrors.category ? 'border-red-500' : ''}"
					>
						<option value="">Select a category</option>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
					{#if formErrors.category}
						<p class="mt-1 text-sm text-red-600">{formErrors.category}</p>
					{/if}
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
					<textarea
						bind:value={formData.description}
						rows="4"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
						placeholder="Enter treatment description..."
					></textarea>
				</div>

				<div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
					<button
						type="button"
						onclick={() => { showAddForm = false; resetForm(); }}
						class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={submitting}
						class="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg flex items-center space-x-2 transition-colors"
					>
						{#if submitting}
							<i class="fas fa-spinner fa-spin"></i>
							<span>Adding Treatment...</span>
						{:else}
							<i class="fas fa-plus"></i>
							<span>Add Treatment</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}