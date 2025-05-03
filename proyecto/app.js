document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Inicializar la aplicación
    init();
    
    function init() {
        setupNavigation();
        setupTransactionForm();
        loadTransactions();
        setupCashCountForm();
        setupIncomeStatement();
    }
    
    function setupNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                const sectionId = this.getAttribute('data-section');
                document.getElementById(sectionId).classList.add('active');
                
                if (sectionId === 'journal') loadJournal();
                else if (sectionId === 'ledger') loadLedger();
                else if (sectionId === 'trial-balance') loadTrialBalance();
                else if (sectionId === 'cash-count') updateCashCountResult();
            });
        });
    }
    
    function setupTransactionForm() {
        const form = document.getElementById('transaction-form');
        const cancelEditBtn = document.getElementById('cancel-edit');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('transaction-id').value;
            const date = document.getElementById('transaction-date').value;
            const concept = document.getElementById('transaction-concept').value;
            const debitAmount = parseFloat(document.getElementById('debit-amount').value) || 0;
            const creditAmount = parseFloat(document.getElementById('credit-amount').value) || 0;
            
            // Validaciones
            if (!date || !concept) {
                alert('Complete los campos requeridos');
                return;
            }
            
            if (debitAmount === 0 && creditAmount === 0) {
                alert('Ingrese al menos un monto en Debe o Haber');
                return;
            }
            
            if (debitAmount > 0 && creditAmount > 0) {
                alert('Solo puede ingresar monto en Debe o Haber, no en ambos');
                return;
            }
            
            if (id) {
                // Editar transacción existente
                const index = transactions.findIndex(t => t.id === id);
                if (index !== -1) {
                    transactions[index] = { 
                        id, 
                        date, 
                        concept, 
                        type: debitAmount > 0 ? 'debit' : 'credit',
                        amount: debitAmount > 0 ? debitAmount : creditAmount
                    };
                }
            } else {
                // Agregar nueva transacción
                const newTransaction = {
                    id: generateId(),
                    date,
                    concept,
                    type: debitAmount > 0 ? 'debit' : 'credit',
                    amount: debitAmount > 0 ? debitAmount : creditAmount
                };
                transactions.push(newTransaction);
            }
            
            localStorage.setItem('transactions', JSON.stringify(transactions));
            loadTransactions();
            form.reset();
            document.getElementById('transaction-id').value = '';
            cancelEditBtn.style.display = 'none';
        });
        
        cancelEditBtn.addEventListener('click', function() {
            document.getElementById('transaction-form').reset();
            document.getElementById('transaction-id').value = '';
            this.style.display = 'none';
        });
    }
    
    function loadTransactions() {
        const tbody = document.querySelector('#transactions-table tbody');
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay transacciones registradas</td></tr>`;
            return;
        }

        transactions.forEach(transaction => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${transaction.id.substring(0, 8)}</td>
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.concept}</td>
                <td>${transaction.type === 'debit' ? formatCurrency(transaction.amount) : ''}</td>
                <td>${transaction.type === 'credit' ? formatCurrency(transaction.amount) : ''}</td>
                <td class="action-buttons">
                    <button class="btn btn-success edit-btn" data-id="${transaction.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger delete-btn" data-id="${transaction.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Reasignar eventos a los botones de editar y eliminar
        const editButtons = document.querySelectorAll('.edit-btn');
        const deleteButtons = document.querySelectorAll('.delete-btn');

        editButtons.forEach(button => {
            button.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                editTransaction(id);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                deleteTransaction(id);
            });
        });
    }
    
    function editTransaction(id) {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;

        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-concept').value = transaction.concept;

        if (transaction.type === 'debit') {
            document.getElementById('debit-amount').value = transaction.amount;
            document.getElementById('credit-amount').value = '';
        } else {
            document.getElementById('credit-amount').value = transaction.amount;
            document.getElementById('debit-amount').value = '';
        }

        document.getElementById('cancel-edit').style.display = 'inline-block';
    }
    
    function deleteTransaction(id) {
        if (confirm('¿Estás seguro de eliminar esta transacción?')) {
            transactions = transactions.filter(t => t.id !== id);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            loadTransactions();

            // Actualizar otras secciones si están activas
            if (document.getElementById('journal').classList.contains('active')) loadJournal();
            else if (document.getElementById('ledger').classList.contains('active')) loadLedger();
            else if (document.getElementById('trial-balance').classList.contains('active')) loadTrialBalance();
        }
    }
    
    function loadJournal() {
        const tbody = document.querySelector('#journal-table tbody');
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No hay transacciones registradas</td></tr>`;
            return;
        }

        transactions.forEach(transaction => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.concept}</td>
                <td>${transaction.type === 'debit' ? formatCurrency(transaction.amount) : ''}</td> <!-- Cambiado a Debe -->
                <td>${transaction.type === 'credit' ? formatCurrency(transaction.amount) : ''}</td> <!-- Cambiado a Haber -->
            `;

            tbody.appendChild(row);
        });
    }
    
    function loadLedger() {
        const ledgerContainer = document.getElementById('ledger-container');
        ledgerContainer.innerHTML = '';

        if (transactions.length === 0) {
            ledgerContainer.innerHTML = `<p style="text-align: center;">No hay transacciones registradas</p>`;
            return;
        }

        // Agrupar transacciones por concepto
        const accounts = {};
        transactions.forEach(transaction => {
            if (!accounts[transaction.concept]) {
                accounts[transaction.concept] = { debit: [], credit: [] };
            }

            if (transaction.type === 'debit') {
                accounts[transaction.concept].debit.push({
                    date: transaction.date,
                    amount: transaction.amount
                });
            } else {
                accounts[transaction.concept].credit.push({
                    date: transaction.date,
                    amount: transaction.amount
                });
            }
        });

        // Crear cuentas en T
        Object.keys(accounts).forEach(concept => {
            const account = accounts[concept];
            const accountDiv = document.createElement('div');
            accountDiv.classList.add('ledger-account');

            accountDiv.innerHTML = `
                <h3>${concept}</h3>
                <div class="ledger-t">
                    <div class="debit">
                        <h4>Debe</h4>
                        <ul>
                            ${account.debit.map(entry => `<li>${formatDate(entry.date)} - ${formatCurrency(entry.amount)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="credit">
                        <h4>Haber</h4>
                        <ul>
                            ${account.credit.map(entry => `<li>${formatDate(entry.date)} - ${formatCurrency(entry.amount)}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="total">
                    <p><strong>Total Débito:</strong> ${formatCurrency(account.debit.reduce((sum, entry) => sum + entry.amount, 0))}</p>
                    <p><strong>Total Crédito:</strong> ${formatCurrency(account.credit.reduce((sum, entry) => sum + entry.amount, 0))}</p>
                </div>
            `;

            ledgerContainer.appendChild(accountDiv);
        });
    }
    
    function loadTrialBalance() {
        const tbody = document.querySelector('#trial-balance-table tbody');
        tbody.innerHTML = '';
        
        const concepts = {};
        
        // Calcular saldos por concepto
        transactions.forEach(transaction => {
            if (!concepts[transaction.concept]) {
                concepts[transaction.concept] = 0;
            }
            
            if (transaction.type === 'debit') {
                concepts[transaction.concept] += transaction.amount;
            } else {
                concepts[transaction.concept] -= transaction.amount;
            }
        });
        
        let totalDebit = 0;
        let totalCredit = 0;
        
        // Mostrar en tabla
        Object.keys(concepts).forEach(concept => {
            const balance = concepts[concept];
            
            if (balance !== 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${concept}</td>
                    <td>${balance > 0 ? formatCurrency(balance) : ''}</td>
                    <td>${balance < 0 ? formatCurrency(Math.abs(balance)) : ''}</td>
                `;
                tbody.appendChild(row);
                
                if (balance > 0) totalDebit += balance;
                if (balance < 0) totalCredit += Math.abs(balance);
            }
        });
        
        document.getElementById('total-debit').textContent = formatCurrency(totalDebit);
        document.getElementById('total-credit').textContent = formatCurrency(totalCredit);
    }
    
    function setupCashCountForm() {
        const form = document.getElementById('cash-count-form');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const date = document.getElementById('cash-count-date').value;
            const amount = parseFloat(document.getElementById('cash-count-amount').value);
            
            localStorage.setItem('lastCashCount', JSON.stringify({ date, amount }));
            updateCashCountResult();
            form.reset();
        });
        
        document.getElementById('cash-count-date').valueAsDate = new Date();
    }
    
    function updateCashCountResult() {
        const resultDiv = document.getElementById('cash-count-result-content');
        const lastCashCount = JSON.parse(localStorage.getItem('lastCashCount'));
        
        if (!lastCashCount) {
            resultDiv.innerHTML = '<p>No se ha realizado ningún arqueo de caja</p>';
            return;
        }
        
        // Calcular saldo en libros (sumar todos los débitos menos créditos)
        let bookBalance = 0;
        transactions.forEach(transaction => {
            if (transaction.type === 'debit') {
                bookBalance += transaction.amount;
            } else {
                bookBalance -= transaction.amount;
            }
        });
        
        const difference = lastCashCount.amount - bookBalance;
        
        resultDiv.innerHTML = `
            <p><strong>Fecha del arqueo:</strong> ${formatDate(lastCashCount.date)}</p>
            <p><strong>Efectivo contado:</strong> ${formatCurrency(lastCashCount.amount)}</p>
            <p><strong>Saldo en libros:</strong> ${formatCurrency(bookBalance)}</p>
            <p class="${difference === 0 ? 'success' : 'danger'}">
                <strong>Diferencia:</strong> ${formatCurrency(Math.abs(difference))} 
                ${difference === 0 ? '(Correcto)' : difference > 0 ? '(Sobrante)' : '(Faltante)'}
            </p>
        `;
    }
    
    function setupIncomeStatement() {
        const periodSelect = document.getElementById('income-statement-period');
        const customPeriodDiv = document.getElementById('custom-period');
        const generateBtn = document.getElementById('generate-income-statement');
        
        periodSelect.addEventListener('change', function() {
            customPeriodDiv.style.display = this.value === 'custom' ? 'block' : 'none';
        });
        
        generateBtn.addEventListener('click', generateIncomeStatement);
    }
    
    function generateIncomeStatement() {
        const period = document.getElementById('income-statement-period').value;
        let startDate, endDate;
        
        const today = new Date();
        
        switch (period) {
            case 'month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'quarter':
                const quarter = Math.floor(today.getMonth() / 3);
                startDate = new Date(today.getFullYear(), quarter * 3, 1);
                endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case 'year':
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
                break;
            case 'custom':
                const startInput = document.getElementById('start-date').value;
                const endInput = document.getElementById('end-date').value;
                
                if (!startInput || !endInput) {
                    alert('Por favor seleccione ambas fechas para el periodo personalizado');
                    return;
                }
                
                startDate = new Date(startInput);
                endDate = new Date(endInput);
                break;
        }
        
        // Filtrar transacciones por periodo
        const periodTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate >= startDate && transDate <= endDate;
        });
        
        // Calcular valores
        let income = 0;
        let expenses = 0;
        
        periodTransactions.forEach(transaction => {
            if (transaction.type === 'credit') {
                income += transaction.amount;
            } else {
                expenses += transaction.amount;
            }
        });
        
        const netIncome = income - expenses;
        
        // Actualizar la vista
        document.getElementById('statement-period').textContent = 
            `Del ${formatDate(startDate)} al ${formatDate(endDate)}`;
        
        document.getElementById('income-amount').textContent = formatCurrency(income);
        document.getElementById('expenses-amount').textContent = formatCurrency(expenses);
        document.getElementById('net-income').textContent = formatCurrency(netIncome);
        
        // Mostrar desglose de transacciones
        const breakdownTableBody = document.querySelector('#transaction-breakdown-table tbody');
        breakdownTableBody.innerHTML = '';
        
        if (periodTransactions.length === 0) {
            breakdownTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No hay transacciones en este periodo</td></tr>`;
            return;
        }
        
        periodTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.concept}</td>
                <td>${transaction.type === 'debit' ? formatCurrency(transaction.amount) : ''}</td>
                <td>${transaction.type === 'credit' ? formatCurrency(transaction.amount) : ''}</td>
            `;
            breakdownTableBody.appendChild(row);
        });
    }
    
    // Funciones de utilidad
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', { 
            style: 'currency', 
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(amount);
    }
});