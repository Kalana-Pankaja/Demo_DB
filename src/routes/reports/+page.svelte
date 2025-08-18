<script lang="ts">
	import { onMount } from 'svelte';

	interface ReportData {
		totalPatients: number;
		totalAppointments: number;
		totalRevenue: number;
		averageAppointmentValue: number;
		appointmentsByMonth: { month: string; count: number }[];
		revenueByMonth: { month: string; amount: number }[];
		treatmentStats: { category: string; count: number; revenue: number }[];
		branchStats: { branch: string; patients: number; revenue: number }[];
	}

	let reportData = $state<ReportData>({
		totalPatients: 0,
		totalAppointments: 0,
		totalRevenue: 0,
		averageAppointmentValue: 0,
		appointmentsByMonth: [],
		revenueByMonth: [],
		treatmentStats: [],
		branchStats: []
	});

	let loading = $state(true);
	let selectedPeriod = $state('last_30_days');
	let selectedReport = $state('overview');

	const reportTypes = [
		{ id: 'overview', name: 'Overview', icon: 'fas fa-chart-line' },
		{ id: 'financial', name: 'Financial Reports', icon: 'fas fa-dollar-sign' },
		{ id: 'patient', name: 'Patient Analytics', icon: 'fas fa-users' },
		{ id: 'treatment', name: 'Treatment Analysis', icon: 'fas fa-stethoscope' },
		{ id: 'branch', name: 'Branch Performance', icon: 'fas fa-hospital' }
	];

	const periods = [
		{ id: 'last_7_days', name: 'Last 7 Days' },
		{ id: 'last_30_days', name: 'Last 30 Days' },
		{ id: 'last_90_days', name: 'Last 90 Days' },
		{ id: 'this_month', name: 'This Month' },
		{ id: 'last_month', name: 'Last Month' },
		{ id: 'this_year', name: 'This Year' }
	];

	onMount(async () => {
		await loadReportData();
	});

	async function loadReportData() {
		try {
			loading = true;
			
			// Mock data for demonstration
			reportData = {
				totalPatients: 1248,
				totalAppointments: 3892,
				totalRevenue: 2847690,
				averageAppointmentValue: 8650,
				appointmentsByMonth: [
					{ month: 'Jan', count: 324 },
					{ month: 'Feb', count: 298 },
					{ month: 'Mar', count: 412 },
					{ month: 'Apr', count: 387 },
					{ month: 'May', count: 456 },
					{ month: 'Jun', count: 523 }
				],
				revenueByMonth: [
					{ month: 'Jan', amount: 245800 },
					{ month: 'Feb', amount: 198760 },
					{ month: 'Mar', amount: 312450 },
					{ month: 'Apr', amount: 287900 },
					{ month: 'May', amount: 367890 },
					{ month: 'Jun', amount: 423570 }
				],
				treatmentStats: [
					{ category: 'General Consultation', count: 1456, revenue: 876400 },
					{ category: 'Cardiology', count: 298, revenue: 594750 },
					{ category: 'Pediatrics', count: 523, revenue: 392250 },
					{ category: 'Orthopedics', count: 234, revenue: 468900 },
					{ category: 'Laboratory', count: 789, revenue: 157800 }
				],
				branchStats: [
					{ branch: 'Colombo', patients: 678, revenue: 1598760 },
					{ branch: 'Kandy', patients: 345, revenue: 789450 },
					{ branch: 'Galle', patients: 225, revenue: 459480 }
				]
			};

		} catch (error) {
			console.error('Error loading report data:', error);
		} finally {
			loading = false;
		}
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'LKR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function formatNumber(num: number) {
		return new Intl.NumberFormat('en-US').format(num);
	}

	function exportReport() {
		// Mock export functionality
		console.log('Exporting report...');
	}

	$effect(() => {
		// Reload data when period changes
		if (selectedPeriod) {
			loadReportData();
		}
	});
</script>

<div class="p-6 space-y-6">
	<!-- Page Header -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 flex items-center">
					<i class="fas fa-chart-bar text-indigo-600 mr-3"></i>
					Reports & Analytics
				</h1>
				<p class="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
			</div>
			<div class="flex items-center space-x-4">
				<select
					bind:value={selectedPeriod}
					class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
				>
					{#each periods as period}
						<option value={period.id}>{period.name}</option>
					{/each}
				</select>
				<button
					onclick={exportReport}
					class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
				>
					<i class="fas fa-download"></i>
					<span>Export</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Report Type Selector -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="flex flex-wrap gap-2">
			{#each reportTypes as report}
				<button
					onclick={() => selectedReport = report.id}
					class="flex items-center px-4 py-2 rounded-lg transition-colors {
						selectedReport === report.id 
							? 'bg-indigo-600 text-white shadow-lg' 
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}"
				>
					<i class="{report.icon} mr-2"></i>
					{report.name}
				</button>
			{/each}
		</div>
	</div>

	{#if selectedReport === 'overview'}
		<!-- Overview Report -->
		<div class="space-y-6">
			<!-- Key Metrics -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-gray-600 text-sm font-medium">Total Patients</p>
							<p class="text-3xl font-bold text-gray-900">{formatNumber(reportData.totalPatients)}</p>
							<p class="text-green-600 text-sm mt-1">
								<i class="fas fa-arrow-up"></i> +12% from last period
							</p>
						</div>
						<div class="bg-blue-100 p-3 rounded-full">
							<i class="fas fa-users text-blue-600 text-xl"></i>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-gray-600 text-sm font-medium">Total Appointments</p>
							<p class="text-3xl font-bold text-gray-900">{formatNumber(reportData.totalAppointments)}</p>
							<p class="text-green-600 text-sm mt-1">
								<i class="fas fa-arrow-up"></i> +8% from last period
							</p>
						</div>
						<div class="bg-green-100 p-3 rounded-full">
							<i class="fas fa-calendar-check text-green-600 text-xl"></i>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-gray-600 text-sm font-medium">Total Revenue</p>
							<p class="text-3xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue)}</p>
							<p class="text-green-600 text-sm mt-1">
								<i class="fas fa-arrow-up"></i> +15% from last period
							</p>
						</div>
						<div class="bg-purple-100 p-3 rounded-full">
							<i class="fas fa-dollar-sign text-purple-600 text-xl"></i>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-gray-600 text-sm font-medium">Avg. Appointment Value</p>
							<p class="text-3xl font-bold text-gray-900">{formatCurrency(reportData.averageAppointmentValue)}</p>
							<p class="text-green-600 text-sm mt-1">
								<i class="fas fa-arrow-up"></i> +3% from last period
							</p>
						</div>
						<div class="bg-orange-100 p-3 rounded-full">
							<i class="fas fa-chart-line text-orange-600 text-xl"></i>
						</div>
					</div>
				</div>
			</div>

			<!-- Charts Row -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Appointments Trend -->
				<div class="bg-white rounded-xl shadow-lg p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<i class="fas fa-chart-line text-blue-600 mr-2"></i>
						Appointments Trend
					</h3>
					<div class="space-y-4">
						{#each reportData.appointmentsByMonth as month}
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-700">{month.month}</span>
								<div class="flex items-center space-x-2">
									<div class="w-32 bg-gray-200 rounded-full h-2">
										<div 
											class="bg-blue-600 h-2 rounded-full" 
											style="width: {(month.count / Math.max(...reportData.appointmentsByMonth.map(m => m.count))) * 100}%"
										></div>
									</div>
									<span class="text-sm font-semibold text-gray-900 w-12 text-right">{month.count}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Revenue Trend -->
				<div class="bg-white rounded-xl shadow-lg p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<i class="fas fa-chart-area text-green-600 mr-2"></i>
						Revenue Trend
					</h3>
					<div class="space-y-4">
						{#each reportData.revenueByMonth as month}
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-700">{month.month}</span>
								<div class="flex items-center space-x-2">
									<div class="w-32 bg-gray-200 rounded-full h-2">
										<div 
											class="bg-green-600 h-2 rounded-full" 
											style="width: {(month.amount / Math.max(...reportData.revenueByMonth.map(m => m.amount))) * 100}%"
										></div>
									</div>
									<span class="text-sm font-semibold text-gray-900 w-20 text-right">{formatCurrency(month.amount)}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

	{:else if selectedReport === 'treatment'}
		<!-- Treatment Analysis -->
		<div class="bg-white rounded-xl shadow-lg p-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
				<i class="fas fa-stethoscope text-purple-600 mr-2"></i>
				Treatment Category Performance
			</h3>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each reportData.treatmentStats as treatment}
							<tr>
								<td class="px-6 py-4 font-medium text-gray-900">{treatment.category}</td>
								<td class="px-6 py-4 text-gray-900">{formatNumber(treatment.count)}</td>
								<td class="px-6 py-4 text-gray-900">{formatCurrency(treatment.revenue)}</td>
								<td class="px-6 py-4 text-gray-900">{formatCurrency(treatment.revenue / treatment.count)}</td>
								<td class="px-6 py-4">
									<div class="w-full bg-gray-200 rounded-full h-2">
										<div 
											class="bg-purple-600 h-2 rounded-full" 
											style="width: {(treatment.revenue / Math.max(...reportData.treatmentStats.map(t => t.revenue))) * 100}%"
										></div>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

	{:else if selectedReport === 'branch'}
		<!-- Branch Performance -->
		<div class="bg-white rounded-xl shadow-lg p-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
				<i class="fas fa-hospital text-indigo-600 mr-2"></i>
				Branch Performance Comparison
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				{#each reportData.branchStats as branch}
					<div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
						<div class="text-center">
							<h4 class="text-xl font-bold text-gray-900 mb-2">{branch.branch}</h4>
							<div class="space-y-3">
								<div>
									<p class="text-sm text-gray-600">Patients</p>
									<p class="text-2xl font-bold text-indigo-600">{formatNumber(branch.patients)}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600">Revenue</p>
									<p class="text-2xl font-bold text-purple-600">{formatCurrency(branch.revenue)}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600">Avg. per Patient</p>
									<p class="text-lg font-semibold text-gray-900">{formatCurrency(branch.revenue / branch.patients)}</p>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

	{:else}
		<!-- Other Reports Placeholder -->
		<div class="bg-white rounded-xl shadow-lg p-12 text-center">
			<i class="fas fa-chart-pie text-gray-400 text-6xl mb-4"></i>
			<h3 class="text-xl font-semibold text-gray-900 mb-2">{reportTypes.find(r => r.id === selectedReport)?.name} Report</h3>
			<p class="text-gray-600 mb-6">This report section is coming soon. Advanced analytics and detailed insights will be available here.</p>
			<button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
				Request Custom Report
			</button>
		</div>
	{/if}
</div>