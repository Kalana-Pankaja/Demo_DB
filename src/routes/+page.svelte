<script lang="ts">
	import { onMount } from 'svelte';

	interface Patient {
		id: string;
		firstName: string;
		lastName: string;
		dateOfBirth: string;
		gender: string;
		phone: string;
		email: string;
		registeredBranch: number;
		branchName: string;
		createdAt: string;
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

	let stats = $state({
		totalPatients: 0,
		todayAppointments: 0,
		activeTreatments: 0,
		pendingBills: 0
	});

	let recentPatients = $state<Patient[]>([]);
	let branches = $state<Branch[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			// Fetch dashboard data
			const [patientsRes, branchesRes, treatmentsRes] = await Promise.all([
				fetch('/api/patients'),
				fetch('/api/branches'),
				fetch('/api/treatments')
			]);

			const patients: Patient[] = await patientsRes.json();
			branches = await branchesRes.json();
			const treatments: Treatment[] = await treatmentsRes.json();

			// Update stats
			stats.totalPatients = patients.length;
			stats.activeTreatments = treatments.filter((t: Treatment) => t.isActive).length;
			
			// Get recent patients (last 5)
			recentPatients = patients
				.sort((a: Patient, b: Patient) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 5);

		} catch (error) {
			console.error('Error loading dashboard data:', error);
		} finally {
			loading = false;
		}
	});

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="p-6 space-y-6">
	<!-- Page Header -->
	<div class="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-6 text-white">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold mb-2">Welcome to MedSync CATMS</h1>
				<p class="text-blue-100 text-lg">Comprehensive Clinic Appointment and Treatment Management System</p>
				<div class="flex items-center mt-4 space-x-4">
					<div class="flex items-center space-x-2">
						<i class="fas fa-calendar text-white"></i>
						<span class="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
					</div>
					<div class="flex items-center space-x-2">
						<i class="fas fa-clock text-white"></i>
						<span class="text-sm">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
					</div>
				</div>
			</div>
			<div class="hidden lg:block">
				<div class="bg-white bg-opacity-20 rounded-full p-4">
					<i class="fas fa-heartbeat text-white text-4xl"></i>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<!-- Total Patients -->
		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Total Patients</p>
					<p class="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalPatients.toLocaleString()}</p>
					<p class="text-green-600 text-sm mt-1">
						<i class="fas fa-arrow-up"></i> Active records
					</p>
				</div>
				<div class="bg-blue-100 p-3 rounded-full">
					<i class="fas fa-user-injured text-blue-600 text-xl"></i>
				</div>
			</div>
		</div>

		<!-- Today's Appointments -->
		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Today's Appointments</p>
					<p class="text-3xl font-bold text-gray-900">{loading ? '...' : stats.todayAppointments}</p>
					<p class="text-blue-600 text-sm mt-1">
						<i class="fas fa-calendar-check"></i> Scheduled
					</p>
				</div>
				<div class="bg-green-100 p-3 rounded-full">
					<i class="fas fa-calendar-check text-green-600 text-xl"></i>
				</div>
			</div>
		</div>

		<!-- Active Treatments -->
		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Active Treatments</p>
					<p class="text-3xl font-bold text-gray-900">{loading ? '...' : stats.activeTreatments}</p>
					<p class="text-purple-600 text-sm mt-1">
						<i class="fas fa-stethoscope"></i> Available
					</p>
				</div>
				<div class="bg-purple-100 p-3 rounded-full">
					<i class="fas fa-stethoscope text-purple-600 text-xl"></i>
				</div>
			</div>
		</div>

		<!-- Pending Bills -->
		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Pending Bills</p>
					<p class="text-3xl font-bold text-gray-900">{loading ? '...' : stats.pendingBills}</p>
					<p class="text-orange-600 text-sm mt-1">
						<i class="fas fa-exclamation-triangle"></i> Awaiting payment
					</p>
				</div>
				<div class="bg-orange-100 p-3 rounded-full">
					<i class="fas fa-file-invoice-dollar text-orange-600 text-xl"></i>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Recent Patients -->
		<div class="lg:col-span-2 bg-white rounded-xl shadow-lg">
			<div class="p-6 border-b border-gray-200">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold text-gray-900 flex items-center">
						<i class="fas fa-user-friends text-blue-600 mr-2"></i>
						Recent Patients
					</h3>
					<a href="/patients" class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
						View All
						<i class="fas fa-arrow-right ml-1"></i>
					</a>
				</div>
			</div>
			<div class="p-6">
				{#if loading}
					<div class="space-y-4">
						{#each Array(3) as _}
							<div class="flex items-center space-x-4 animate-pulse">
								<div class="w-10 h-10 bg-gray-200 rounded-full"></div>
								<div class="flex-1 space-y-2">
									<div class="h-4 bg-gray-200 rounded w-3/4"></div>
									<div class="h-3 bg-gray-200 rounded w-1/2"></div>
								</div>
							</div>
						{/each}
					</div>
				{:else if recentPatients.length === 0}
					<div class="text-center py-8">
						<i class="fas fa-user-slash text-gray-400 text-3xl mb-4"></i>
						<p class="text-gray-500">No patients registered yet</p>
						<a href="/patients" class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
							Register first patient
						</a>
					</div>
				{:else}
					<div class="space-y-4">
						{#each recentPatients as patient}
							<div class="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
								<div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
									{patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
								</div>
								<div class="flex-1">
									<h4 class="font-medium text-gray-900">{patient.firstName} {patient.lastName}</h4>
									<div class="flex items-center space-x-4 text-sm text-gray-500">
										<span class="flex items-center">
											<i class="fas fa-id-card mr-1"></i>
											{patient.id}
										</span>
										<span class="flex items-center">
											<i class="fas fa-hospital mr-1"></i>
											{patient.branchName}
										</span>
										<span class="flex items-center">
											<i class="fas fa-calendar mr-1"></i>
											{formatDate(patient.createdAt)}
										</span>
									</div>
								</div>
								<div class="text-right">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
										<i class="fas fa-check-circle mr-1"></i>
										Active
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Branch Status & Quick Actions -->
		<div class="space-y-6">
			<!-- Branch Status -->
			<div class="bg-white rounded-xl shadow-lg">
				<div class="p-6 border-b border-gray-200">
					<h3 class="text-lg font-semibold text-gray-900 flex items-center">
						<i class="fas fa-hospital text-green-600 mr-2"></i>
						Branch Status
					</h3>
				</div>
				<div class="p-6">
					{#if loading}
						<div class="space-y-4">
							{#each Array(3) as _}
								<div class="animate-pulse">
									<div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
									<div class="h-3 bg-gray-200 rounded w-1/2"></div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="space-y-4">
							{#each branches as branch}
								<div class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
									<div>
										<h4 class="font-medium text-gray-900">{branch.name}</h4>
										<p class="text-sm text-gray-500">{branch.location}</p>
									</div>
									<div class="text-right">
										<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
											<i class="fas fa-circle text-xs mr-1"></i>
											Online
										</span>
										<p class="text-xs text-gray-500 mt-1">{branch.operatingHours}</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="bg-white rounded-xl shadow-lg">
				<div class="p-6 border-b border-gray-200">
					<h3 class="text-lg font-semibold text-gray-900 flex items-center">
						<i class="fas fa-bolt text-yellow-600 mr-2"></i>
						Quick Actions
					</h3>
				</div>
				<div class="p-6 space-y-3">
					<a href="/patients" class="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors group">
						<div class="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
							<i class="fas fa-user-plus text-blue-600"></i>
						</div>
						<div class="ml-3">
							<p class="font-medium text-gray-900">Register Patient</p>
							<p class="text-sm text-gray-500">Add new patient to system</p>
						</div>
					</a>

					<a href="/appointments" class="flex items-center p-3 rounded-lg hover:bg-green-50 transition-colors group">
						<div class="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
							<i class="fas fa-calendar-plus text-green-600"></i>
						</div>
						<div class="ml-3">
							<p class="font-medium text-gray-900">Book Appointment</p>
							<p class="text-sm text-gray-500">Schedule patient visit</p>
						</div>
					</a>

					<a href="/treatments" class="flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors group">
						<div class="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
							<i class="fas fa-prescription-bottle-alt text-purple-600"></i>
						</div>
						<div class="ml-3">
							<p class="font-medium text-gray-900">Manage Treatments</p>
							<p class="text-sm text-gray-500">View treatment catalog</p>
						</div>
					</a>

					<a href="/billing" class="flex items-center p-3 rounded-lg hover:bg-orange-50 transition-colors group">
						<div class="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
							<i class="fas fa-receipt text-orange-600"></i>
						</div>
						<div class="ml-3">
							<p class="font-medium text-gray-900">Process Billing</p>
							<p class="text-sm text-gray-500">Handle payments</p>
						</div>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
