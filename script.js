let records = JSON.parse(localStorage.getItem('records')) || [];
let editIndex = -1;

const recordForm = document.getElementById('recordForm');
const recordsTableBody = document.querySelector('#recordsTable tbody');
const balanceSpan = document.getElementById('balance');
const expenseChartCanvas = document.getElementById('expenseChart');
let expenseChart;

// Save records to LocalStorage
function saveRecords() {
    localStorage.setItem('records', JSON.stringify(records));
}

// Add / Update record
recordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;

    const record = { name, type, category, amount, date };

    if (editIndex >= 0) {
        records[editIndex] = record;
        editIndex = -1;
    } else {
        records.push(record);
    }

    saveRecords();
    recordForm.reset();
    displayRecords();
});

// Display records
function displayRecords(filtered = null) {
    const displayList = filtered || records;
    recordsTableBody.innerHTML = '';

    displayList.forEach((r, index) => {
        const row = recordsTableBody.insertRow();
        row.insertCell(0).innerText = r.name;
        row.insertCell(1).innerText = r.type;
        row.insertCell(2).innerText = r.category;
        row.insertCell(3).innerText = r.amount;
        row.insertCell(4).innerText = r.date;
        row.insertCell(5).innerHTML = `
            <button onclick="editRecord(${index})" style="background:orange;">Edit</button>
            <button onclick="deleteRecord(${index})" style="background:red;">Delete</button>
        `;
    });

    updateBalance();
    updateChart();
}

// Delete record
function deleteRecord(index) {
    if (confirm('Are you sure you want to delete this record?')) {
        records.splice(index, 1);
        saveRecords();
        displayRecords();
    }
}

// Edit record
function editRecord(index) {
    const r = records[index];
    document.getElementById('name').value = r.name;
    document.getElementById('type').value = r.type;
    document.getElementById('category').value = r.category;
    document.getElementById('amount').value = r.amount;
    document.getElementById('date').value = r.date;
    editIndex = index;
}

// Update balance
function updateBalance() {
    let balance = 0;
    records.forEach(r => {
        balance += (r.type === 'Income') ? r.amount : -r.amount;
    });
    balanceSpan.innerText = balance.toFixed(2);
}

// Update category chart
function updateChart() {
    const categoryTotals = {};
    records.forEach(r => {
        if (r.type === 'Expense') {
            categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.amount;
        }
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(expenseChartCanvas, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                label: 'Expenses by Category',
                data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Apply filters
function applyFilters() {
    const cat = document.getElementById('filterCategory').value.trim();
    const date = document.getElementById('filterDate').value;

    const filtered = records.filter(r => {
        return (!cat || r.category === cat) && (!date || r.date === date);
    });

    displayRecords(filtered);
}

// Clear filters
function clearFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterDate').value = '';
    displayRecords();
}

// Initial display
displayRecords();