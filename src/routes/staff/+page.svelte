<script lang="ts">
	import { onMount } from 'svelte';

	interface Staff {
		id: number;
		userId: string;
		firstName: string;
		lastName: string;
		specialty: string;
		licenseNumber: string;
		phone: string;
		email: string;
		branchId: number;
		branchName: string;
		isActive: boolean;
		createdAt: string;
	}

	interface Branch {
		id: number;
		name: string;
		location: string;
	}

	let staff = $state<Staff[]>([]);
	let branches = $state<Branch[]>([]);
	let loading = $state(true);
	let showAddForm = $state(false);
	let searchTerm = $state('');
	let specialtyFilter = $state('');
	let branchFilter = $state('');

	// Form state
	let formData = $state({
		firstName: '',
		lastName: '',
		specialty: '',
		licenseNumber: '',
		phone: '',
		email: '',
		branchId: 0
	});

	let formErrors = $state<Record<string, string>>({});
	let submitting = $state(false);

	// Staff specialties
	const specialties = [
		'General Medicine',
		'Cardiology',
		'Pediatrics',
		'Orthopedics',
		'Dermatology',
		'Gynecology',
		'Neurology',
		'Psychiatry',
		'Radiology',
		'Anesthesiology',
		'Surgery',
		'Emergency Medicine',
		'Nursing',
		'Administration'
	];

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			loading = true;
			
			// Load branches
			const branchesRes = await fetch('/api/branches');
			if (branchesRes.ok) {
				branches = await branchesRes.json();
			}

			// Mock staff data since API endpoint may not exist
			staff = [
				{
					id: 1,
					userId: 'user1',
					firstName: 'Dr. John',
					lastName: 'Smith',
					specialty: 'Cardiology',
					licenseNumber: 'MD12345',
					phone: '+94 71 1234567',
					email: 'john.smith@medsync.com',
					branchId: 1,
					branchName: 'Colombo Main',
					isActive: true,
					createdAt: '2024-01-15T10:30:00Z'
				},
				{
					id: 2,
					userId: 'user2',
					firstName: 'Dr. Sarah',
					lastName: 'Johnson',
					specialty: 'Pediatrics',
					licenseNumber: 'MD67890',
					phone: '+94 71 2345678',
					email: 'sarah.johnson@medsync.com',
					branchId: 1,
					branchName: 'Colombo Main',
					isActive: true,
					createdAt: '2024-02-01T09:15:00Z'
				},
				{
					id: 3,
					userId: 'user3',
					firstName: 'Nurse Mary',
					lastName: 'Williams',
					specialty: 'Nursing',
					licenseNumber: 'RN11111',
					phone: '+94 71 3456789',
					email: 'mary.williams@medsync.com',
					branchId: 2,
					branchName: 'Kandy Branch',
					isActive: true,
					createdAt: '2024-01-20T14:45:00Z'
				}
			];

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
		if (!formData.specialty) formErrors.specialty = 'Specialty is required';
		if (!formData.phone.trim()) formErrors.phone = 'Phone number is required';
		if (!formData.email.trim()) formErrors.email = 'Email is required';
		if (!formData.branchId) formErrors.branchId = 'Branch selection is required';

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
			
			// Mock creating staff member
			const newStaff: Staff = {
				id: staff.length + 1,
				userId: `user${staff.length + 1}`,
				...formData,
				branchName: branches.find(b => b.id === formData.branchId)?.name || '',
				isActive: true,
				createdAt: new Date().toISOString()
			};

			staff = [newStaff, ...staff];
			resetForm();
			showAddForm = false;

		} catch (error) {
			console.error('Error creating staff member:', error);
		} finally {
			submitting = false;
		}
	}

	function resetForm() {
		formData = {
			firstName: '',
			lastName: '',
			specialty: '',
			licenseNumber: '',
			phone: '',
			email: '',
			branchId: 0
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

	// Filtered staff
	let filteredStaff = $derived(staff.filter(member => {
		const matchesSearch = !searchTerm || 
			member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesSpecialty = !specialtyFilter || member.specialty === specialtyFilter;
		const matchesBranch = !branchFilter || member.branchId.toString() === branchFilter;
		
		return matchesSearch && matchesSpecialty && matchesBranch;
	}));

	// Get unique specialties from staff
	let usedSpecialties = $derived([...new Set(staff.map(s => s.specialty))].sort());
</script>

<div class="p-6 space-y-6">
	<!-- Page Header -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 flex items-center">
					<i class="fas fa-user-md text-teal-600 mr-3"></i>
					Staff Management
				</h1>
				<p class="text-gray-600 mt-1">Manage medical staff and team members</p>
			</div>
			<button
				onclick={() => showAddForm = true}
				class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
			>
				<i class="fas fa-plus"></i>
				<span>Add Staff Member</span>
			</button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Total Staff</p>
					<p class="text-3xl font-bold text-gray-900">{staff.length}</p>
					<p class="text-green-600 text-sm mt-1">
						<i class="fas fa-users"></i> Active members
					</p>
				</div>
				<div class="bg-teal-100 p-3 rounded-full">
					<i class="fas fa-user-md text-teal-600 text-xl"></i>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Doctors</p>
					<p class="text-3xl font-bold text-gray-900">{staff.filter(s => s.specialty !== 'Nursing' && s.specialty !== 'Administration').length}</p>
					<p class="text-blue-600 text-sm mt-1">
						<i class="fas fa-stethoscope"></i> Medical doctors
					</p>
				</div>
				<div class="bg-blue-100 p-3 rounded-full">
					<i class="fas fa-user-doctor text-blue-600 text-xl"></i>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Nurses</p>
					<p class="text-3xl font-bold text-gray-900">{staff.filter(s => s.specialty === 'Nursing').length}</p>
					<p class="text-green-600 text-sm mt-1">
						<i class="fas fa-heart"></i> Nursing staff
					</p>
				</div>
				<div class="bg-green-100 p-3 rounded-full">
					<i class="fas fa-user-nurse text-green-600 text-xl"></i>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Specialties</p>
					<p class="text-3xl font-bold text-gray-900">{usedSpecialties.length}</p>
					<p class="text-purple-600 text-sm mt-1">
						<i class="fas fa-graduation-cap"></i> Different areas
					</p>
				</div>
				<div class="bg-purple-100 p-3 rounded-full">
					<i class="fas fa-brain text-purple-600 text-xl"></i>
				</div>
			</div>
		</div>
	</div>

	<!-- Search and Filters -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Search Staff</label>
				<div class="relative">
					<i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
					<input
						type="text"
						bind:value={searchTerm}
						placeholder="Search by name, email, or license..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
					>
				</div>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Filter by Specialty</label>
				<select
					bind:value={specialtyFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
				>
					<option value="">All Specialties</option>
					{#each usedSpecialties as specialty}
						<option value={specialty}>{specialty}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Filter by Branch</label>
				<select
					bind:value={branchFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
					{filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''} found
				</div>
			</div>
		</div>
	</div>

	<!-- Staff Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#if loading}
			{#each Array(6) as _}
				<div class="bg-white rounded-xl shadow-lg p-6 animate-pulse">
					<div class="space-y-4">
						<div class="flex items-center space-x-4">
							<div class="w-16 h-16 bg-gray-200 rounded-full"></div>
							<div class="space-y-2">
								<div class="h-4 bg-gray-200 rounded w-32"></div>
								<div class="h-3 bg-gray-200 rounded w-24"></div>
							</div>
						</div>
						<div class="space-y-2">
							<div class="h-3 bg-gray-200 rounded w-full"></div>
							<div class="h-3 bg-gray-200 rounded w-3/4"></div>
						</div>
					</div>
				</div>
			{/each}
		{:else if filteredStaff.length === 0}
			<div class="col-span-full">
				<div class="text-center py-12">
					<i class="fas fa-user-slash text-gray-400 text-4xl mb-4"></i>
					<h3 class="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
					<p class="text-gray-500 mb-4">
						{searchTerm || specialtyFilter || branchFilter ? 'Try adjusting your search criteria' : 'Get started by adding your first staff member'}
					</p>
					{#if !searchTerm && !specialtyFilter && !branchFilter}
						<button
							onclick={() => showAddForm = true}
							class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
						>
							<i class="fas fa-plus"></i>
							<span>Add First Staff Member</span>
						</button>
					{/if}
				</div>
			</div>
		{:else}
			{#each filteredStaff as member}
				<div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
					<div class="space-y-4">
						<!-- Header -->
						<div class="flex items-center space-x-4">
							<div class="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
								{member.firstName.charAt(0)}{member.lastName.charAt(0)}
							</div>
							<div class="flex-1">
								<h3 class="text-lg font-semibold text-gray-900">{member.firstName} {member.lastName}</h3>
								<p class="text-sm text-teal-600 font-medium">{member.specialty}</p>
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} mt-1">
									<i class="fas {member.isActive ? 'fa-check-circle' : 'fa-times-circle'} mr-1"></i>
									{member.isActive ? 'Active' : 'Inactive'}
								</span>
							</div>
						</div>

						<!-- Contact Info -->
						<div class="space-y-2 text-sm">
							<div class="flex items-center space-x-2 text-gray-600">
								<i class="fas fa-id-badge w-4"></i>
								<span>{member.licenseNumber}</span>
							</div>
							<div class="flex items-center space-x-2 text-gray-600">
								<i class="fas fa-envelope w-4"></i>
								<span class="truncate">{member.email}</span>
							</div>
							<div class="flex items-center space-x-2 text-gray-600">
								<i class="fas fa-phone w-4"></i>
								<span>{member.phone}</span>
							</div>
							<div class="flex items-center space-x-2 text-gray-600">
								<i class="fas fa-hospital w-4"></i>
								<span>{member.branchName}</span>
							</div>
						</div>

						<!-- Footer -->
						<div class="flex justify-between items-center pt-4 border-t border-gray-200">
							<div class="text-xs text-gray-500">
								Joined {formatDate(member.createdAt)}
							</div>
							<div class="flex items-center space-x-2">
								<button class="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors">
									<i class="fas fa-edit"></i>
								</button>
								<button class="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors">
									<i class="fas fa-eye"></i>
								</button>
								<button class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
									<i class="fas fa-user-times"></i>
								</button>
							</div>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<!-- Add Staff Modal -->
{#if showAddForm}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-gray-200">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900 flex items-center">
						<i class="fas fa-user-plus text-teal-600 mr-2"></i>
						Add New Staff Member
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
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 {formErrors.firstName ? 'border-red-500' : ''}"
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
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 {formErrors.lastName ? 'border-red-500' : ''}"
								placeholder="Enter last name"
							>
							{#if formErrors.lastName}
								<p class="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Professional Information -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
							<select
								bind:value={formData.specialty}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 {formErrors.specialty ? 'border-red-500' : ''}"
							>
								<option value="">Select specialty</option>
								{#each specialties as specialty}
									<option value={specialty}>{specialty}</option>
								{/each}
							</select>
							{#if formErrors.specialty}
								<p class="mt-1 text-sm text-red-600">{formErrors.specialty}</p>
							{/if}
						</div>
						
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">License Number</label>
							<input
								type="text"
								bind:value={formData.licenseNumber}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
								placeholder="e.g., MD12345"
							>
						</div>
					</div>
				</div>

				<!-- Contact Information -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
							<input
								type="tel"
								bind:value={formData.phone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 {formErrors.phone ? 'border-red-500' : ''}"
								placeholder="Enter phone number"
							>
							{#if formErrors.phone}
								<p class="mt-1 text-sm text-red-600">{formErrors.phone}</p>
							{/if}
						</div>
						
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
							<input
								type="email"
								bind:value={formData.email}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 {formErrors.email ? 'border-red-500' : ''}"
								placeholder="Enter email address"
							>
							{#if formErrors.email}
								<p class="mt-1 text-sm text-red-600">{formErrors.email}</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Branch Assignment -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-4">Branch Assignment</h3>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Assigned Branch *</label>
						<select
							bind:value={formData.branchId}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 {formErrors.branchId ? 'border-red-500' : ''}"
						>
							<option value={0}>Select a branch</option>
							{#each branches as branch}
								<option value={branch.id}>{branch.name} - {branch.location}</option>
							{/each}
						</select>
						{#if formErrors.branchId}
							<p class="mt-1 text-sm text-red-600">{formErrors.branchId}</p>
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
						class="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg flex items-center space-x-2 transition-colors"
					>
						{#if submitting}
							<i class="fas fa-spinner fa-spin"></i>
							<span>Adding Staff...</span>
						{:else}
							<i class="fas fa-plus"></i>
							<span>Add Staff Member</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}