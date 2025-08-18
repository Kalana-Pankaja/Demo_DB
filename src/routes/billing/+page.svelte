<script lang="ts">
	import { onMount } from 'svelte';

	interface Invoice {
		id: number;
		patientId: string;
		patientName: string;
		appointmentId: number;
		invoiceNumber: string;
		totalAmount: string;
		insuranceCovered: string;
		patientResponsible: string;
		paidAmount: string;
		outstandingBalance: string;
		status: string;
		createdAt: string;
		updatedAt: string;
	}

	interface Payment {
		id: number;
		invoiceId: number;
		amount: string;
		paymentMethod: string;
		paymentDate: string;
		transactionReference: string;
		notes: string;
	}

	let invoices = $state<Invoice[]>([]);
	let payments = $state<Payment[]>([]);
	let loading = $state(true);
	let showPaymentForm = $state(false);
	let selectedInvoice = $state<Invoice | null>(null);
	let searchTerm = $state('');
	let statusFilter = $state('');
	let dateFilter = $state('');

	// Payment form state
	let paymentData = $state({
		amount: '',
		paymentMethod: 'cash',
		transactionReference: '',
		notes: ''
	});

	let paymentErrors = $state<Record<string, string>>({});
	let submitting = $state(false);

	// Stats
	let stats = $state({
		totalInvoices: 0,
		totalRevenue: 0,
		pendingAmount: 0,
		overdueInvoices: 0
	});

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			loading = true;
			
			// Mock data since API endpoints may not exist yet
			invoices = [
				{
					id: 1,
					patientId: 'COL001',
					patientName: 'John Doe',
					appointmentId: 1,
					invoiceNumber: 'INV-2025-001',
					totalAmount: '15000.00',
					insuranceCovered: '10000.00',
					patientResponsible: '5000.00',
					paidAmount: '3000.00',
					outstandingBalance: '2000.00',
					status: 'partially_paid',
					createdAt: '2025-01-15T10:30:00Z',
					updatedAt: '2025-01-16T14:20:00Z'
				},
				{
					id: 2,
					patientId: 'COL002',
					patientName: 'Jane Smith',
					appointmentId: 2,
					invoiceNumber: 'INV-2025-002',
					totalAmount: '8500.00',
					insuranceCovered: '0.00',
					patientResponsible: '8500.00',
					paidAmount: '8500.00',
					outstandingBalance: '0.00',
					status: 'paid',
					createdAt: '2025-01-16T09:15:00Z',
					updatedAt: '2025-01-16T11:45:00Z'
				}
			];

			payments = [];
			
			// Calculate stats
			updateStats();

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function updateStats() {
		stats.totalInvoices = invoices.length;
		stats.totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.paidAmount), 0);
		stats.pendingAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.outstandingBalance), 0);
		stats.overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
	}

	function openPaymentForm(invoice: Invoice) {
		selectedInvoice = invoice;
		paymentData.amount = invoice.outstandingBalance;
		showPaymentForm = true;
	}

	function validatePayment() {
		paymentErrors = {};
		
		if (!paymentData.amount.trim()) paymentErrors.amount = 'Payment amount is required';
		if (!paymentData.paymentMethod) paymentErrors.paymentMethod = 'Payment method is required';

		// Amount validation
		const amount = parseFloat(paymentData.amount);
		if (isNaN(amount) || amount <= 0) {
			paymentErrors.amount = 'Payment amount must be a positive number';
		} else if (selectedInvoice && amount > parseFloat(selectedInvoice.outstandingBalance)) {
			paymentErrors.amount = 'Payment amount cannot exceed outstanding balance';
		}

		return Object.keys(paymentErrors).length === 0;
	}

	async function handlePaymentSubmit(event: Event) {
		event.preventDefault();
		if (!validatePayment() || !selectedInvoice) return;

		try {
			submitting = true;
			
			// Mock payment processing
			const newPayment: Payment = {
				id: payments.length + 1,
				invoiceId: selectedInvoice.id,
				amount: paymentData.amount,
				paymentMethod: paymentData.paymentMethod,
				paymentDate: new Date().toISOString(),
				transactionReference: paymentData.transactionReference,
				notes: paymentData.notes
			};

			payments = [newPayment, ...payments];

			// Update invoice
			const updatedInvoices = invoices.map(inv => {
				if (inv.id === selectedInvoice!.id) {
					const newPaidAmount = parseFloat(inv.paidAmount) + parseFloat(paymentData.amount);
					const newOutstanding = parseFloat(inv.patientResponsible) - newPaidAmount;
					
					return {
						...inv,
						paidAmount: newPaidAmount.toFixed(2),
						outstandingBalance: Math.max(0, newOutstanding).toFixed(2),
						status: newOutstanding <= 0 ? 'paid' : 'partially_paid',
						updatedAt: new Date().toISOString()
					};
				}
				return inv;
			});

			invoices = updatedInvoices;
			updateStats();
			resetPaymentForm();
			showPaymentForm = false;

		} catch (error) {
			console.error('Error processing payment:', error);
		} finally {
			submitting = false;
		}
	}

	function resetPaymentForm() {
		paymentData = {
			amount: '',
			paymentMethod: 'cash',
			transactionReference: '',
			notes: ''
		};
		paymentErrors = {};
		selectedInvoice = null;
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatCurrency(amount: string) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'LKR',
			minimumFractionDigits: 2
		}).format(parseFloat(amount));
	}

	// Filtered invoices
	let filteredInvoices = $derived(invoices.filter(invoice => {
		const matchesSearch = !searchTerm || 
			invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			invoice.patientId.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesStatus = !statusFilter || invoice.status === statusFilter;
		const matchesDate = !dateFilter || invoice.createdAt.startsWith(dateFilter);
		
		return matchesSearch && matchesStatus && matchesDate;
	}));
</script>

<div class="p-6 space-y-6">
	<!-- Page Header -->
	<div class="bg-white rounded-xl shadow-lg p-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 flex items-center">
					<i class="fas fa-file-invoice-dollar text-orange-600 mr-3"></i>
					Billing & Payments
				</h1>
				<p class="text-gray-600 mt-1">Manage invoices and process payments</p>
			</div>
			<div class="flex items-center space-x-4">
				<button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
					<i class="fas fa-plus"></i>
					<span>New Invoice</span>
				</button>
				<button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
					<i class="fas fa-download"></i>
					<span>Export</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Total Invoices</p>
					<p class="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
				</div>
				<div class="bg-blue-100 p-3 rounded-full">
					<i class="fas fa-file-invoice text-blue-600 text-xl"></i>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Total Revenue</p>
					<p class="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue.toString())}</p>
				</div>
				<div class="bg-green-100 p-3 rounded-full">
					<i class="fas fa-dollar-sign text-green-600 text-xl"></i>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Pending Amount</p>
					<p class="text-3xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount.toString())}</p>
				</div>
				<div class="bg-orange-100 p-3 rounded-full">
					<i class="fas fa-clock text-orange-600 text-xl"></i>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Overdue</p>
					<p class="text-3xl font-bold text-gray-900">{stats.overdueInvoices}</p>
				</div>
				<div class="bg-red-100 p-3 rounded-full">
					<i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
				</div>
			</div>
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
						placeholder="Search by patient, invoice #..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
					>
				</div>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
				<select
					bind:value={statusFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
				>
					<option value="">All Status</option>
					<option value="pending">Pending</option>
					<option value="partially_paid">Partially Paid</option>
					<option value="paid">Paid</option>
					<option value="overdue">Overdue</option>
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
				<input
					type="date"
					bind:value={dateFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
				>
			</div>
			<div class="flex items-end">
				<div class="text-sm text-gray-600">
					<i class="fas fa-file-invoice mr-1"></i>
					{filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
				</div>
			</div>
		</div>
	</div>

	<!-- Invoices Table -->
	<div class="bg-white rounded-xl shadow-lg overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#if loading}
						{#each Array(5) as _}
							<tr class="animate-pulse">
								<td class="px-6 py-4">
									<div class="h-4 bg-gray-200 rounded w-24"></div>
								</td>
								<td class="px-6 py-4">
									<div class="space-y-2">
										<div class="h-4 bg-gray-200 rounded w-32"></div>
										<div class="h-3 bg-gray-200 rounded w-20"></div>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="h-4 bg-gray-200 rounded w-20"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-4 bg-gray-200 rounded w-20"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-4 bg-gray-200 rounded w-20"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-6 bg-gray-200 rounded w-16"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-4 bg-gray-200 rounded w-16"></div>
								</td>
								<td class="px-6 py-4">
									<div class="h-8 bg-gray-200 rounded w-20"></div>
								</td>
							</tr>
						{/each}
					{:else if filteredInvoices.length === 0}
						<tr>
							<td colspan="8" class="px-6 py-12 text-center">
								<div class="text-center">
									<i class="fas fa-file-invoice text-gray-400 text-4xl mb-4"></i>
									<h3 class="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
									<p class="text-gray-500">
										{searchTerm || statusFilter || dateFilter ? 'Try adjusting your search criteria' : 'Start by creating your first invoice'}
									</p>
								</div>
							</td>
						</tr>
					{:else}
						{#each filteredInvoices as invoice}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<div class="font-medium text-gray-900">{invoice.invoiceNumber}</div>
									<div class="text-sm text-gray-500">Apt #{invoice.appointmentId}</div>
								</td>
								<td class="px-6 py-4">
									<div class="font-medium text-gray-900">{invoice.patientName}</div>
									<div class="text-sm text-gray-500">ID: {invoice.patientId}</div>
								</td>
								<td class="px-6 py-4 font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</td>
								<td class="px-6 py-4 font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</td>
								<td class="px-6 py-4 font-medium text-orange-600">{formatCurrency(invoice.outstandingBalance)}</td>
								<td class="px-6 py-4">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
										invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
										invoice.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
										invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
										'bg-gray-100 text-gray-800'
									}">
										<i class="fas {
											invoice.status === 'paid' ? 'fa-check-circle' :
											invoice.status === 'partially_paid' ? 'fa-clock' :
											invoice.status === 'overdue' ? 'fa-exclamation-triangle' :
											'fa-clock'
										} mr-1"></i>
										{invoice.status.replace('_', ' ')}
									</span>
								</td>
								<td class="px-6 py-4 text-sm text-gray-500">{formatDate(invoice.createdAt)}</td>
								<td class="px-6 py-4">
									<div class="flex items-center space-x-2">
										{#if parseFloat(invoice.outstandingBalance) > 0}
											<button
												onclick={() => openPaymentForm(invoice)}
												class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
											>
												Pay
											</button>
										{/if}
										<button class="text-blue-600 hover:text-blue-700 p-1 rounded">
											<i class="fas fa-eye"></i>
										</button>
										<button class="text-gray-600 hover:text-gray-700 p-1 rounded">
											<i class="fas fa-download"></i>
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

<!-- Payment Modal -->
{#if showPaymentForm && selectedInvoice}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-xl shadow-xl max-w-md w-full">
			<div class="p-6 border-b border-gray-200">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900 flex items-center">
						<i class="fas fa-credit-card text-green-600 mr-2"></i>
						Process Payment
					</h2>
					<button
						onclick={() => { showPaymentForm = false; resetPaymentForm(); }}
						class="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<i class="fas fa-times text-xl"></i>
					</button>
				</div>
			</div>
			
			<div class="p-6">
				<!-- Invoice Info -->
				<div class="bg-gray-50 rounded-lg p-4 mb-6">
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span class="text-gray-600">Invoice:</span>
							<span class="font-medium">{selectedInvoice.invoiceNumber}</span>
						</div>
						<div>
							<span class="text-gray-600">Patient:</span>
							<span class="font-medium">{selectedInvoice.patientName}</span>
						</div>
						<div>
							<span class="text-gray-600">Outstanding:</span>
							<span class="font-medium text-orange-600">{formatCurrency(selectedInvoice.outstandingBalance)}</span>
						</div>
						<div>
							<span class="text-gray-600">Total:</span>
							<span class="font-medium">{formatCurrency(selectedInvoice.totalAmount)}</span>
						</div>
					</div>
				</div>

				<form onsubmit={handlePaymentSubmit} class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Payment Amount (LKR) *</label>
						<input
							type="number"
							bind:value={paymentData.amount}
							min="0"
							max={selectedInvoice.outstandingBalance}
							step="0.01"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 {paymentErrors.amount ? 'border-red-500' : ''}"
						>
						{#if paymentErrors.amount}
							<p class="mt-1 text-sm text-red-600">{paymentErrors.amount}</p>
						{/if}
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
						<select
							bind:value={paymentData.paymentMethod}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
						>
							<option value="cash">Cash</option>
							<option value="card">Credit/Debit Card</option>
							<option value="bank_transfer">Bank Transfer</option>
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Transaction Reference</label>
						<input
							type="text"
							bind:value={paymentData.transactionReference}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
							placeholder="Reference number (optional)"
						>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
						<textarea
							bind:value={paymentData.notes}
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
							placeholder="Additional notes..."
						></textarea>
					</div>

					<div class="flex items-center justify-end space-x-4 pt-4">
						<button
							type="button"
							onclick={() => { showPaymentForm = false; resetPaymentForm(); }}
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
								<span>Processing...</span>
							{:else}
								<i class="fas fa-check"></i>
								<span>Process Payment</span>
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}