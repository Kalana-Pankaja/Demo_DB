<script lang="ts">
	import { onMount } from 'svelte';

	interface Appointment {
		id: number;
		patientId: string;
		patientName: string;
		doctorId: number;
		doctorName: string;
		branchId: number;
		branchName: string;
		appointmentDate: string;
		appointmentTime: string;
		status: string;
		appointmentType: string;
		notes: string;
		createdAt: string;
	}

	interface Patient {
		id: string;
		firstName: string;
		lastName: string;
		phone: string;
		registeredBranch: number;
	}

	interface Doctor {
		id: number;
		firstName: string;
		lastName: string;
		specialty: string;
		branchId: number;
	}

	interface Branch {
		id: number;
		name: string;
		location: string;
	}

	let appointments = $state<Appointment[]>([]);
	let patients = $state<Patient[]>([]);
	let doctors = $state<Doctor[]>([]);
	let branches = $state<Branch[]>([]);
	let loading = $state(true);
	let showAddForm = $state(false);
	let searchTerm = $state('');
	let statusFilter = $state('');
	let dateFilter = $state('');

	// Form state
	let formData = $state({
		patientId: '',
		doctorId: 0,
		branchId: 0,
		appointmentDate: '',
		appointmentTime: '',
		appointmentType: 'regular',
		notes: ''
	});

	let formErrors = $state<Record<string, string>>({});
	let submitting = $state(false);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			loading = true;
			const [appointmentsRes, patientsRes, branchesRes] = await Promise.all([
				fetch('/api/appointments'),
				fetch('/api/patients'),
				fetch('/api/branches')
			]);

			// For now, create mock data since API endpoints may not exist
			appointments = [];
			if (patientsRes.ok) patients = await patientsRes.json();
			if (branchesRes.ok) branches = await branchesRes.json();
			
			// Mock doctors data
			doctors = [
				{ id: 1, firstName: 'Dr. John', lastName: 'Smith', specialty: 'Cardiology', branchId: 1 },
				{ id: 2, firstName: 'Dr. Sarah', lastName: 'Johnson', specialty: 'Pediatrics', branchId: 1 },
				{ id: 3, firstName: 'Dr. Michael', lastName: 'Brown', specialty: 'Orthopedics', branchId: 2 }
			];

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function validateForm() {
		formErrors = {};
		
		if (!formData.patientId) formErrors.patientId = 'Patient selection is required';
		if (!formData.doctorId) formErrors.doctorId = 'Doctor selection is required';
		if (!formData.branchId) formErrors.branchId = 'Branch selection is required';
		if (!formData.appointmentDate) formErrors.appointmentDate = 'Appointment date is required';
		if (!formData.appointmentTime) formErrors.appointmentTime = 'Appointment time is required';

		return Object.keys(formErrors).length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!validateForm()) return;

		try {
			submitting = true;
			// TODO: Implement API call when endpoint is ready
			console.log('Creating appointment:', formData);
			
			// Mock success for now
			const newAppointment: Appointment = {
				id: appointments.length + 1,
				...formData,
				patientName: patients.find(p => p.id === formData.patientId)?.firstName + ' ' + patients.find(p => p.id === formData.patientId)?.lastName || '',
				doctorName: doctors.find(d => d.id === formData.doctorId)?.firstName + ' ' + doctors.find(d => d.id === formData.doctorId)?.lastName || '',
				branchName: branches.find(b => b.id === formData.branchId)?.name || '',
				status: 'scheduled',
				createdAt: new Date().toISOString()
			};
			
			appointments = [newAppointment, ...appointments];
			resetForm();
			showAddForm = false;

		} catch (error) {
			console.error('Error creating appointment:', error);
		} finally {
			submitting = false;
		}
	}

	function resetForm() {
		formData = {
			patientId: '',
			doctorId: 0,
			branchId: 0,
			appointmentDate: '',
			appointmentTime: '',
			appointmentType: 'regular',
			notes: ''
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

	function formatTime(timeString: string) {
		return new Date('1970-01-01T' + timeString).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Filtered appointments
	let filteredAppointments = $derived(appointments.filter(appointment => {
		const matchesSearch = !searchTerm || 
			appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			appointment.patientId.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesStatus = !statusFilter || appointment.status === statusFilter;
		const matchesDate = !dateFilter || appointment.appointmentDate === dateFilter;
		
		return matchesSearch && matchesStatus && matchesDate;
	}));
</script>

<div class="p-6 space-y-6">
	<!-- Page Header -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 flex items-center">
					<i class="fas fa-calendar-check text-green-600 mr-3"></i>
					Appointment Management
				</h1>
				<p class="text-gray-600 mt-1">Schedule and manage patient appointments</p>
			</div>
			<button
				onclick={() => showAddForm = true}
				class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
			>
				<i class="fas fa-plus"></i>
				<span>Book Appointment</span>
			</button>
		</div>
	</div>

	<!-- Search and Filters -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
				<div class="relative">
					<i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
					<input
						type="text"
						bind:value={searchTerm}
						placeholder="Search by patient or doctor..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
					>
				</div>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
				<select
					bind:value={statusFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
				>
					<option value="">All Status</option>
					<option value="scheduled">Scheduled</option>
					<option value="completed">Completed</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
				<input
					type="date"
					bind:value={dateFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
				>
			</div>
			<div class="flex items-end">
				<div class="text-sm text-gray-600">
					<i class="fas fa-calendar-alt mr-1"></i>
					{filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
				</div>
			</div>
		</div>
	</div>

	<!-- Appointments Table -->
	<div class="bg-white rounded-xl shadow-lg overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
										<div class="h-4 bg-gray-200 rounded w-28"></div>
										<div class="h-3 bg-gray-200 rounded w-24"></div>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="h-3 bg-gray-200 rounded w-20"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-3 bg-gray-200 rounded w-16"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-3 bg-gray-200 rounded w-20"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-6 bg-gray-200 rounded w-16"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-8 bg-gray-200 rounded w-20"></div>
								</td>
							</tr>
						{/each}
					{:else if filteredAppointments.length === 0}
						<tr>
							<td colspan="7" class="px-6 py-12 text-center">
								<div class="text-center">
									<i class="fas fa-calendar-times text-gray-400 text-4xl mb-4"></i>
									<h3 class="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
									<p class="text-gray-500 mb-4">
										{searchTerm || statusFilter || dateFilter ? 'Try adjusting your search criteria' : 'Get started by booking your first appointment'}
									</p>
									{#if !searchTerm && !statusFilter && !dateFilter}
										<button
											onclick={() => showAddForm = true}
											class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
										>
											<i class="fas fa-plus"></i>
											<span>Book First Appointment</span>
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{:else}
						{#each filteredAppointments as appointment}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<div class="flex items-center space-x-4">
										<div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
											{appointment.patientName.split(' ').map(n => n.charAt(0)).join('')}
										</div>
										<div>
											<div class="font-medium text-gray-900">{appointment.patientName}</div>
											<div class="text-sm text-gray-500">ID: {appointment.patientId}</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="font-medium text-gray-900">{appointment.doctorName}</div>
									<div class="text-sm text-gray-500">{doctors.find(d => d.id === appointment.doctorId)?.specialty}</div>
								</td>
								<td class="px-6 py-4">
									<div class="font-medium text-gray-900">{formatDate(appointment.appointmentDate)}</div>
									<div class="text-sm text-gray-500">{formatTime(appointment.appointmentTime)}</div>
								</td>
								<td class="px-6 py-4 text-sm text-gray-900 capitalize">{appointment.appointmentType}</td>
								<td class="px-6 py-4 text-sm text-gray-900">{appointment.branchName}</td>
								<td class="px-6 py-4">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
										appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
										appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
										'bg-red-100 text-red-800'
									}">
										<i class="fas {
											appointment.status === 'scheduled' ? 'fa-clock' :
											appointment.status === 'completed' ? 'fa-check-circle' :
											'fa-times-circle'
										} mr-1"></i>
										{appointment.status}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center space-x-2">
										<button class="text-blue-600 hover:text-blue-700 p-1 rounded">
											<i class="fas fa-edit"></i>
										</button>
										<button class="text-red-600 hover:text-red-700 p-1 rounded">
											<i class="fas fa-trash"></i>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Book Appointment Modal -->
{#if showAddForm}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-gray-200">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900 flex items-center">
						<i class="fas fa-calendar-plus text-green-600 mr-2"></i>
						Book New Appointment
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
						<label class="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
						<select
							bind:value={formData.patientId}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 {formErrors.patientId ? 'border-red-500' : ''}"
						>
							<option value="">Select a patient</option>
							{#each patients as patient}
								<option value={patient.id}>{patient.firstName} {patient.lastName} ({patient.id})</option>
							{/each}
						</select>
						{#if formErrors.patientId}
							<p class="mt-1 text-sm text-red-600">{formErrors.patientId}</p>
						{/if}
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Doctor *</label>
						<select
							bind:value={formData.doctorId}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 {formErrors.doctorId ? 'border-red-500' : ''}"
						>
							<option value={0}>Select a doctor</option>
							{#each doctors as doctor}
								<option value={doctor.id}>{doctor.firstName} {doctor.lastName} - {doctor.specialty}</option>
							{/each}
						</select>
						{#if formErrors.doctorId}
							<p class="mt-1 text-sm text-red-600">{formErrors.doctorId}</p>
						{/if}
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
						<select
							bind:value={formData.branchId}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 {formErrors.branchId ? 'border-red-500' : ''}"
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
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
						<select
							bind:value={formData.appointmentType}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
						>
							<option value="regular">Regular</option>
							<option value="emergency">Emergency</option>
							<option value="walk-in">Walk-in</option>
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
						<input
							type="date"
							bind:value={formData.appointmentDate}
							min={new Date().toISOString().split('T')[0]}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 {formErrors.appointmentDate ? 'border-red-500' : ''}"
						>
						{#if formErrors.appointmentDate}
							<p class="mt-1 text-sm text-red-600">{formErrors.appointmentDate}</p>
						{/if}
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Time *</label>
						<input
							type="time"
							bind:value={formData.appointmentTime}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 {formErrors.appointmentTime ? 'border-red-500' : ''}"
						>
						{#if formErrors.appointmentTime}
							<p class="mt-1 text-sm text-red-600">{formErrors.appointmentTime}</p>
						{/if}
					</div>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
					<textarea
						bind:value={formData.notes}
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
						placeholder="Additional notes or special requirements..."
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
						class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg flex items-center space-x-2 transition-colors"
					>
						{#if submitting}
							<i class="fas fa-spinner fa-spin"></i>
							<span>Booking...</span>
						{:else}
							<i class="fas fa-calendar-check"></i>
							<span>Book Appointment</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}