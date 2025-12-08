const API_URL = 'http://localhost:3000/api';

// DOM Elements
const reportList = document.getElementById('reportList');
const filterRadios = document.querySelectorAll('input[name="filter"]');
const clientFilterForm = document.getElementById('clientFilter');
const clientRadioContainer = document.getElementById('clientRadioContainer');

// Load reports and clients on page load
document.addEventListener('DOMContentLoaded', () => {
    loadClients().then(() => applyFilters());
});

// ---- FILTER FUNCTIONS ----
function getSelectedFilter() {
    const f = document.querySelector('input[name="filter"]:checked');
    return f ? f.value : 'all';
}

function getSelectedClient() {
    const c = document.querySelector('input[name="clientFilterRadio"]:checked');
    return c ? c.value : 'noFilter'; // your default "All Clients"
}

async function applyFilters() {
    const filter = getSelectedFilter();      // 'all' or 'unreviewed'
    const clientId = getSelectedClient();    // 'noFilter' or actual ClientID

    if (clientId === "noFilter") {
        if (filter === 'all') {
            return loadReports();
        } else {
            return loadUnreviewedReports();
        }
    }

    // Specific client selected
    if (filter === 'all') {
        return loadReportsByClient(clientId);
    }

    // filter === 'unreviewed' AND client selected
    showLoading();
    try {
        const tryUrl = `${API_URL}/reports/client/${clientId}/unreviewed`;
        let resp = await fetch(tryUrl);

        if (resp.ok) {
            const reports = await resp.json();
            displayReports(reports);
            return;
        }

        // Fallback: fetch client reports and filter client-side
        resp = await fetch(`${API_URL}/reports/client/${clientId}`);
        if (!resp.ok) throw new Error('Failed to load client reports');
        const reports = await resp.json();
        const unreviewed = reports.filter(r => !r.Reviewed);
        displayReports(unreviewed);
    } catch (error) {
        console.error('Error applying combined filters:', error);
        reportList.innerHTML = '<p>Error loading reports</p>';
    }
}

// ---- EVENT LISTENERS ----
filterRadios.forEach(radio => {
    radio.addEventListener('change', () => applyFilters());
});

clientFilterForm.addEventListener('change', (e) => {
    if (e.target.name === "clientFilterRadio") {
        applyFilters();
    }
});

// ---- CLIENT LOADING ----
async function loadClients() {
    try {
        const response = await fetch(`${API_URL}/clients`);
        const clients = await response.json();
        
        clientRadioContainer.innerHTML = ""; // clear existing

        clients.forEach(client => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="radio" name="clientFilterRadio" value="${client.ClientID}">
                ${client.ClientName}
            `;
            clientRadioContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// ---- REPORT LOADERS ----
async function loadReports() {
    showLoading();
    try {
        const response = await fetch(`${API_URL}/reports`);
        const reports = await response.json();
        displayReports(reports);
    } catch (error) {
        console.error('Error loading reports:', error);
        reportList.innerHTML = '<p>Error loading reports</p>';
    }
}

async function loadUnreviewedReports() {
    showLoading();
    try {
        const response = await fetch(`${API_URL}/reports/unreviewed`);
        const reports = await response.json();
        displayReports(reports);
    } catch (error) {
        console.error('Error loading reports:', error);
        reportList.innerHTML = '<p>Error loading reports</p>';
    }
}

async function loadReportsByClient(clientId) {
    showLoading();
    try {
        const response = await fetch(`${API_URL}/reports/client/${clientId}`);
        const reports = await response.json();
        displayReports(reports);
    } catch (error) {
        console.error('Error loading reports:', error);
        reportList.innerHTML = '<p>Error loading reports</p>';
    }
}

// ---- MARK REVIEWED ----
async function markAsReviewed(reportId, button) {
    try {
        const response = await fetch(`${API_URL}/reports/${reportId}/review`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            button.disabled = true;
            button.textContent = 'Reviewed';
            
            const card = button.closest('.report-card');
            const statusBadge = card.querySelector('.status');
            statusBadge.textContent = 'Reviewed';
            statusBadge.classList.remove('unreviewed');
            statusBadge.classList.add('reviewed');
        }
    } catch (error) {
        console.error('Error marking report as reviewed:', error);
        alert('Failed to update report');
    }
}

// ---- DISPLAY ----
function displayReports(reports) {
    if (!reports.length) {
        reportList.innerHTML = '<p class="loading">No reports found</p>';
        return;
    }

    reportList.innerHTML = reports.map(report => `
        <div class="report-card">
            <div class="report-header">
                <span class="report-id">Report #${report.ReportID}</span>
                <span class="status ${report.Reviewed ? 'reviewed' : 'unreviewed'}">
                    ${report.Reviewed ? 'Reviewed' : 'Unreviewed'}
                </span>
            </div>
            <div class="report-content">
                <p><strong>Date:</strong> ${new Date(report.DateReported).toLocaleString()}</p>
                <p><strong>Sender:</strong> ${report.EmailSender || 'N/A'}</p>
                <p><strong>Content:</strong> ${report.EmailContents}</p>
                ${report.EmployeeMessage ? `<p><strong>Employee Note:</strong> ${report.EmployeeMessage}</p>` : ''}
            </div>
            <div class="report-actions">
                <button 
                    class="btn-review" 
                    onclick="markAsReviewed(${report.ReportID}, this)"
                    ${report.Reviewed ? 'disabled' : ''}
                >
                    ${report.Reviewed ? 'Reviewed' : 'Mark as Reviewed'}
                </button>
            </div>
        </div>
    `).join('');
}

// ---- LOADING UI ----
function showLoading() {
    reportList.innerHTML = '<p class="loading">Loading reports...</p>';
}
