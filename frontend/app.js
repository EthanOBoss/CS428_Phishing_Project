const API_URL = 'http://localhost:3000/api';

// DOM Elements
const reportList = document.getElementById('reportList');
const allReportsBtn = document.getElementById('allReports');
const unreviewedBtn = document.getElementById('unreviewedReports');
const clientFilter = document.getElementById('clientFilter');

// Load reports on page load
document.addEventListener('DOMContentLoaded', () => {
    loadClients();
    loadReports();
});

// Event Listeners
allReportsBtn.addEventListener('click', () => {
    setActiveButton(allReportsBtn);
    loadReports();
});

unreviewedBtn.addEventListener('click', () => {
    setActiveButton(unreviewedBtn);
    loadUnreviewedReports();
});

clientFilter.addEventListener('change', (e) => {
    const clientId = e.target.value;
    if (clientId) {
        loadReportsByClient(clientId);
    } else {
        loadReports();
    }
});

// Functions
function setActiveButton(activeBtn) {
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

async function loadClients() {
    try {
        const response = await fetch(`${API_URL}/clients`);
        const clients = await response.json();
        
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.ClientID;
            option.textContent = client.ClientName;
            clientFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

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

async function markAsReviewed(reportId, button) {
    try {
        const response = await fetch(`${API_URL}/reports/${reportId}/review`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            button.disabled = true;
            button.textContent = 'Reviewed';
            
            // Update status badge
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

function displayReports(reports) {
    if (reports.length === 0) {
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

function showLoading() {
    reportList.innerHTML = '<p class="loading">Loading reports...</p>';
}