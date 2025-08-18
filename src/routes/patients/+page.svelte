<script lang="ts">
	import { onMount } from 'svelte';

	interface Patient {
		id: string;
		firstName: string;
		lastName: string;
		dateOfBirth: string;
		gender: string;
		address: string;
		phone: string;
		email: string;
		emergencyContactName: string;
		emergencyContactPhone: string;
		emergencyContactRelation: string;
		registeredBranch: number;
		branchName: string;
		isActive: boolean;
		createdAt: string;
		updatedAt: string;
	}

	interface Branch {
		id: number;
		name: string;
		location: string;
		address: string;
		phone: string;
		email: string;
		operatingHours: string;
		isActive: boolean;
		createdAt: string;
	}

	let patients = $state<Patient[]>([]);
	let branches = $state<Branch[]>([]);
	let loading = $state(true);
	let showAddForm = $state(false);
	let searchTerm = $state('');
	let selectedBranch = $state('');

	// Form state
	let formData = $state({
		firstName: '',
		lastName: '',
		dateOfBirth: '',
		gender: '',
		address: '',
		phone: '',
		email: '',
		emergencyContactName: '',
		emergencyContactPhone: '',
		emergencyContactRelation: '',
		registeredBranch: 0
	});

	let formErrors = $state<Record<string, string>>({});
	let submitting = $state(false);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			loading = true;
			const [patientsRes, branchesRes] = await Promise.all([
				fetch('/api/patients'),
				fetch('/api/branches')
			]);

			if (patientsRes.ok) {
				patients = await patientsRes.json();
			}
			if (branchesRes.ok) {
				branches = await branchesRes.json();
			}
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function validateForm() {
		formErrors = {};
		
		if (!formData.firstName.trim()) formErrors.firstName = 'First name is required';
		if (!formData.lastName.trim()) formErrors.lastName = 'Last name is required';
		if (!formData.dateOfBirth) formErrors.dateOfBirth = 'Date of birth is required';
		if (!formData.gender) formErrors.gender = 'Gender is required';
		if (!formData.address.trim()) formErrors.address = 'Address is required';
		if (!formData.phone.trim()) formErrors.phone = 'Phone number is required';
		if (!formData.registeredBranch) formErrors.registeredBranch = 'Branch selection is required';

		// Phone validation
		if (formData.phone && !/^[\d+\-\s()]+$/.test(formData.phone)) {
			formErrors.phone = 'Invalid phone number format';
		}

		// Email validation
		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			formErrors.email = 'Invalid email format';
		}

		return Object.keys(formErrors).length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!validateForm()) return;

		try {
			submitting = true;
			const response = await fetch('/api/patients', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				const newPatient = await response.json();
				patients = [newPatient, ...patients];
				resetForm();
				showAddForm = false;
			} else {
				const error = await response.json();
				console.error('Error creating patient:', error);
			}
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			submitting = false;
		}
	}

	function resetForm() {
		formData = {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			gender: '',
			address: '',
			phone: '',
			email: '',
			emergencyContactName: '',
			emergencyContactPhone: '',
			emergencyContactRelation: '',
			registeredBranch: 0
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

	function calculateAge(dateOfBirth: string) {
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		
		return age;
	}

	// Filtered patients based on search and branch
	let filteredPatients = $derived(patients.filter(patient => {
		const matchesSearch = !searchTerm || 
			patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			patient.phone.includes(searchTerm);
		
		const matchesBranch = !selectedBranch || patient.registeredBranch.toString() === selectedBranch;
		
		return matchesSearch && matchesBranch;
	}));
</script>

<div class="p-6 space-y-6">
	<!-- Page Header -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 flex items-center">
					<i class="fas fa-user-injured text-blue-600 mr-3"></i>
					Patient Management
				</h1>
				<p class="text-gray-600 mt-1">Manage patient records and registrations</p>
			</div>
			<button
				onclick={() => showAddForm = true}
				class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
			>
				<i class="fas fa-plus"></i>
				<span>Add Patient</span>
			</button>
		</div>
	</div>

	<!-- Search and Filters -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Search Patients</label>
				<div class="relative">
					<i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
					<input
						type="text"
						bind:value={searchTerm}
						placeholder="Search by name, ID, or phone..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
				</div>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Filter by Branch</label>
				<select
					bind:value={selectedBranch}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				>
					<option value="">All Branches</option>
					{#each branches as branch}
						<option value={branch.id.toString()}>{branch.name} - {branch.location}</option>
					{/each}
				</select>
			</div>
			<div class="flex items-end">
				<div class="text-sm text-gray-600">
					<i class="fas fa-users mr-1"></i>
					{filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
				</div>
			</div>
		</div>
	</div>

	<!-- Patients Table -->
	<div class="bg-white rounded-xl shadow-lg overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#if loading}
						{#each Array(5) as _}
							<tr class="animate-pulse">
								<td class="px-6 py-4">
									<div class="flex items-center space-x-4">
										<div class="w-10 h-10 bg-gray-200 rounded-full"></div>
										<div class="space-y-2">
											<div class="h-4 bg-gray-200 rounded w-32"></div>
											<div class="h-3 bg-gray-200 rounded w-20"></div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="space-y-2">
										<div class="h-3 bg-gray-200 rounded w-28"></div>
										<div class="h-3 bg-gray-200 rounded w-24"></div>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="h-3 bg-gray-200 rounded w-20"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-3 bg-gray-200 rounded w-8"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-3 bg-gray-200 rounded w-12"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-3 bg-gray-200 rounded w-16"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-6 bg-gray-200 rounded w-16"></div>
								</td>
							</tr>
						{/each}
					{:else if filteredPatients.length === 0}
						<tr>
							<td colspan="7" class="px-6 py-12 text-center">
								<div class="text-center">
									<i class="fas fa-user-slash text-gray-400 text-4xl mb-4"></i>
									<h3 class="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
									<p class="text-gray-500 mb-4">
										{searchTerm || selectedBranch ? 'Try adjusting your search criteria' : 'Get started by adding your first patient'}
									</p>
									{#if !searchTerm && !selectedBranch}
										<button
											onclick={() => showAddForm = true}
											class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
										>
											<i class="fas fa-plus"></i>
											<span>Add First Patient</span>
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{:else}
						{#each filteredPatients as patient}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<div class="flex items-center space-x-4">
										<div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
											{patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
										</div>
										<div>
											<div class="font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
											<div class="text-sm text-gray-500">ID: {patient.id}</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-gray-900">{patient.phone}</div>
									{#if patient.email}
										<div class="text-sm text-gray-500">{patient.email}</div>
									{/if}
								</td>
								<td class="px-6 py-4 text-sm text-gray-900">{patient.branchName}</td>
								<td class="px-6 py-4 text-sm text-gray-900">{calculateAge(patient.dateOfBirth)}</td>
								<td class="px-6 py-4 text-sm text-gray-900 capitalize">{patient.gender}</td>
								<td class="px-6 py-4 text-sm text-gray-500">{formatDate(patient.createdAt)}</td>
								<td class="px-6 py-4">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {patient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
										<i class="fas {patient.isActive ? 'fa-check-circle' : 'fa-times-circle'} mr-1"></i>
										{patient.isActive ? 'Active' : 'Inactive'}
									</span>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Add Patient Modal -->
{#if showAddForm}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-gray-200">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900 flex items-center">
						<i class="fas fa-user-plus text-blue-600 mr-2"></i>
						Add New Patient
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
				<!-- Personal Information -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
							<input
								type="text"
								bind:value={formData.firstName}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {formErrors.firstName ? 'border-red-500' : ''}"
								placeholder="Enter first name"
							>
							{#if formErrors.firstName}
								<p class="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
							{/if}
						</div>
						
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
							<input
								type="text"
								bind:value={formData.lastName}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {formErrors.lastName ? 'border-red-500' : ''}"
								placeholder="Enter last name"
							>
							{#if formErrors.lastName}
								<p class="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
							{/if}
						</div>
						
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
							<input
								type="date"
								bind:value={formData.dateOfBirth}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {formErrors.dateOfBirth ? 'border-red-500' : ''}"
							>
							{#if formErrors.dateOfBirth}
								<p class="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
							{/if}
						</div>
						
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
							<select
								bind:value={formData.gender}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {formErrors.gender ? 'border-red-500' : ''}"
							>
								<option value="">Select gender</option>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
							</select>
							{#if formErrors.gender}
								<p class="mt-1 text-sm text-red-600">{formErrors.gender}</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Contact Information -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
							<textarea
								bind:value={formData.address}
								rows="3"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {formErrors.address ? 'border-red-500' : ''}"
								placeholder="Enter full address"
							></textarea>
							{#if formErrors.address}
								<p class="mt-1 text-sm text-red-600">{formErrors.address}</p>
							{/if}
						</div>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
								<input
									type="tel"
									bind:value={formData.phone}
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {formErrors.phone ? 'border-red-500' : ''}"
									placeholder="Enter phone number"
								>
								{#if formErrors.phone}
									<p class="mt-1 text-sm text-red-600">{formErrors.phone}</p>
								{/if}
							</div>
							
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
								<input
									type="email"
									bind:value={formData.email}
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {formErrors.email ? 'border-red-500' : ''}"
									placeholder="Enter email address"
								>
								{#if formErrors.email}
									<p class="mt-1 text-sm text-red-600">{formErrors.email}</p>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Emergency Contact -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
							<input
								type="text"
								bind:value={formData.emergencyContactName}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Full name"
							>
						</div>
						
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
							<input
								type="tel"
								bind:value={formData.emergencyContactPhone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Phone number"
							>
						</div>
						
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
							<input
								type="text"
								bind:value={formData.emergencyContactRelation}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="e.g., Spouse, Parent"
							>
						</div>
					</div>
				</div>

				<!-- Branch Selection -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-4">Branch Assignment</h3>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Registered Branch *</label>
						<select
  								bind:value={formData.registeredBranch}
  								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  								class:border-red-500={formErrors.registeredBranch}
								aria-invalid={!!formErrors.registeredBranch}>
  								<option value={0}>Select a branch</option>
  								{#each branches as branch}
  							  	<option value={branch.id}>{branch.name} - {branch.location}</option>
  								{/each}
						</select>
						{#if formErrors.registeredBranch}
							<p class="mt-1 text-sm text-red-600">{formErrors.registeredBranch}</p>
						{/if}
					</div>
				</div>

				<!-- Form Actions -->
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
						class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2 transition-colors"
					>
						{#if submitting}
							<i class="fas fa-spinner fa-spin"></i>
							<span>Adding Patient...</span>
						{:else}
							<i class="fas fa-plus"></i>
							<span>Add Patient</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}