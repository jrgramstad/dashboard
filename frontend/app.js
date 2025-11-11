// ============================================
// AJ Property Status Dashboard - Main Application
// ============================================

// Initialize Supabase Client
const supabase = window.supabase.createClient(
    config.supabase.url,
    config.supabase.anonKey
);

// Global state
let allProperties = [];
let propertyStatuses = [];
let autoRefreshInterval = null;

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard initializing...');
    await loadDashboard();
    startAutoRefresh();
});

// ============================================
// Main Dashboard Functions
// ============================================

async function loadDashboard() {
    showLoading(true);
    try {
        await fetchProperties();
        await fetchPropertyStatuses();
        renderDashboard();
        updateLastUpdatedTime();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Failed to load dashboard data. Please refresh the page.');
    } finally {
        showLoading(false);
    }
}

async function refreshDashboard() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.classList.add('loading');
    await loadDashboard();
    refreshBtn.classList.remove('loading');
}

function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const statusGrid = document.getElementById('statusGrid');

    if (show) {
        loadingIndicator.style.display = 'block';
        statusGrid.style.display = 'none';
    } else {
        loadingIndicator.style.display = 'none';
        statusGrid.style.display = 'grid';
    }
}

// ============================================
// Data Fetching
// ============================================

async function fetchProperties() {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('active', true)
        .order('sort_order');

    if (error) {
        console.error('Error fetching properties:', error);
        throw error;
    }

    allProperties = data || [];
    console.log(`Loaded ${allProperties.length} active properties`);
}

async function fetchPropertyStatuses() {
    const { data, error } = await supabase
        .from('property_status')
        .select(`
            *,
            properties (id, name, active, sort_order)
        `)
        .order('status_date', { ascending: false });

    if (error) {
        console.error('Error fetching property statuses:', error);
        throw error;
    }

    propertyStatuses = data || [];
    console.log(`Loaded ${propertyStatuses.length} property statuses`);
}

// ============================================
// Dashboard Rendering
// ============================================

function renderDashboard() {
    const statusGrid = document.getElementById('statusGrid');
    statusGrid.innerHTML = '';

    // Group properties by status
    const statusGroups = groupPropertiesByStatus();

    // Separate regular statuses from bottom statuses
    const regularStatuses = [];
    const bottomStatuses = [];

    Object.keys(STATUS_CONFIG).forEach(statusKey => {
        const statusConfig = STATUS_CONFIG[statusKey];

        if (statusConfig.showAtBottom) {
            bottomStatuses.push(statusKey);
        } else {
            regularStatuses.push(statusKey);
        }
    });

    // Render regular status cards first
    regularStatuses.forEach(statusKey => {
        const statusConfig = STATUS_CONFIG[statusKey];
        const properties = statusGroups[statusKey] || [];
        const card = createStatusCard(statusKey, statusConfig, properties);
        statusGrid.appendChild(card);
    });

    // Render bottom status cards last (like RENTED)
    bottomStatuses.forEach(statusKey => {
        const statusConfig = STATUS_CONFIG[statusKey];
        const properties = statusGroups[statusKey] || [];
        const card = createStatusCard(statusKey, statusConfig, properties);
        statusGrid.appendChild(card);
    });
}

function groupPropertiesByStatus() {
    const groups = {};

    // Create a map of property_id to latest status
    const latestStatusMap = new Map();

    propertyStatuses.forEach(status => {
        if (!status.properties || !status.properties.active) {
            return;
        }

        const propId = status.property_id;
        if (!latestStatusMap.has(propId)) {
            latestStatusMap.set(propId, status);
        }
    });

    // Group by status
    latestStatusMap.forEach(status => {
        const statusKey = status.status;
        if (!groups[statusKey]) {
            groups[statusKey] = [];
        }
        groups[statusKey].push(status);
    });

    // Sort properties within each group
    Object.keys(groups).forEach(statusKey => {
        groups[statusKey] = sortPropertiesByStatus(groups[statusKey], statusKey);
    });

    return groups;
}

function sortPropertiesByStatus(properties, statusKey) {
    const statusConfig = STATUS_CONFIG[statusKey];

    return properties.sort((a, b) => {
        // Sort by priority for IN_LINE_WIP
        if (statusConfig.showPriority) {
            return (a.priority || 999) - (b.priority || 999);
        }

        // Sort by days (oldest first) for statuses with showDays
        if (statusConfig.showDays) {
            const daysA = calculateDaysInStatus(a.status_date);
            const daysB = calculateDaysInStatus(b.status_date);
            return daysB - daysA;
        }

        // Sort by target date for future events
        if (statusConfig.showTarget && a.target_date && b.target_date) {
            return new Date(a.target_date) - new Date(b.target_date);
        }

        // Default: sort by property name
        return a.properties.name.localeCompare(b.properties.name);
    });
}

// ============================================
// Status Card Creation
// ============================================

function createStatusCard(statusKey, statusConfig, properties) {
    const card = document.createElement('div');
    card.className = 'status-card';
    card.setAttribute('data-status', statusKey);

    // Add collapsed class if configured
    if (statusConfig.collapsed) {
        card.classList.add('collapsed');
    }

    // Header
    const header = document.createElement('div');
    header.className = `status-card-header status-${statusKey}`;

    // Add collapse arrow for collapsible cards
    const arrowIcon = statusConfig.collapsed ? '<span class="collapse-arrow">▼</span>' : '';

    header.innerHTML = `
        <span class="status-card-title">${arrowIcon}${statusConfig.name}</span>
        <span class="status-count">${properties.length}</span>
    `;

    // Add click handler for collapsible cards
    if (statusConfig.collapsed) {
        header.style.cursor = 'pointer';
        header.onclick = () => toggleCardCollapse(card);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'status-card-body';

    if (properties.length === 0) {
        body.innerHTML = '<div class="empty-status">No properties in this status</div>';
    } else {
        const list = document.createElement('ul');
        list.className = 'property-list';

        properties.forEach(property => {
            const item = createPropertyListItem(property, statusConfig);
            list.appendChild(item);
        });

        body.appendChild(list);
    }

    card.appendChild(header);
    card.appendChild(body);

    return card;
}

function createPropertyListItem(property, statusConfig) {
    const item = document.createElement('li');
    item.className = 'property-item';

    const name = document.createElement('a');
    name.className = 'property-name';
    name.href = '#';
    name.textContent = property.properties.name;
    name.onclick = (e) => {
        e.preventDefault();
        openUpdateModal(property);
    };

    const details = document.createElement('div');
    details.className = 'property-details';
    details.innerHTML = getPropertyDetails(property, statusConfig);

    item.appendChild(name);
    item.appendChild(details);

    return item;
}

function getPropertyDetails(property, statusConfig) {
    const parts = [];

    // Show days in status
    if (statusConfig.showDays) {
        const days = calculateDaysInStatus(property.status_date);
        parts.push(`<strong>${days}</strong> day${days !== 1 ? 's' : ''}`);
    }

    // Show amount (for LISTED, LATE_RENT)
    if (statusConfig.showAmount && property.amount) {
        parts.push(`<strong>${formatCurrency(property.amount)}</strong>`);
    }

    // Show target date (for COMING_SOON, MOVE_OUT, MOVE_IN, EXPIRING)
    if (statusConfig.showTarget && property.target_date) {
        parts.push(`Target: <strong>${formatDate(property.target_date)}</strong>`);
    }

    // Show filing/status date (for EVICTION)
    if (statusConfig.showDate && property.status_date) {
        parts.push(`Filed: <strong>${formatDate(property.status_date)}</strong>`);
    }

    // Show priority (for IN_LINE_WIP)
    if (statusConfig.showPriority && property.priority) {
        parts.push(`Priority: <strong>#${property.priority}</strong>`);
    }

    // Show assigned to (for WIP)
    if (property.assigned_to) {
        parts.push(`Assigned: <strong>${property.assigned_to}</strong>`);
    }

    // Show notes if available (truncated)
    if (property.notes) {
        const truncated = property.notes.length > 50
            ? property.notes.substring(0, 50) + '...'
            : property.notes;
        parts.push(`<em>${truncated}</em>`);
    }

    return parts.length > 0 ? parts.join(' • ') : '—';
}

// ============================================
// Collapsible Card Functions
// ============================================

function toggleCardCollapse(card) {
    card.classList.toggle('collapsed');

    // Rotate arrow icon
    const arrow = card.querySelector('.collapse-arrow');
    if (arrow) {
        if (card.classList.contains('collapsed')) {
            arrow.textContent = '▼';
        } else {
            arrow.textContent = '▲';
        }
    }
}

// ============================================
// Update Modal Functions
// ============================================

function openUpdateModal(property) {
    const modal = document.getElementById('updateModal');

    // Populate modal fields
    document.getElementById('modalPropertyId').value = property.property_id;
    document.getElementById('modalPropertyName').value = property.properties.name;
    document.getElementById('modalCurrentStatus').value = STATUS_CONFIG[property.status]?.name || property.status;

    // Reset form
    document.getElementById('updateForm').reset();
    document.getElementById('modalPropertyId').value = property.property_id;
    document.getElementById('modalPropertyName').value = property.properties.name;
    document.getElementById('modalCurrentStatus').value = STATUS_CONFIG[property.status]?.name || property.status;

    // Pre-fill existing values
    document.getElementById('modalNewStatus').value = property.status;
    document.getElementById('modalAmount').value = property.amount || '';
    document.getElementById('modalTargetDate').value = property.target_date || '';
    document.getElementById('modalPriority').value = property.priority || '';
    document.getElementById('modalAssignedTo').value = property.assigned_to || '';
    document.getElementById('modalNotes').value = property.notes || '';

    // Show relevant fields based on current status
    handleStatusChange();

    // Show modal
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('updateModal');
    modal.classList.remove('active');
    document.getElementById('updateForm').reset();
}

function handleStatusChange() {
    const newStatus = document.getElementById('modalNewStatus').value;

    // Hide all optional fields first
    document.getElementById('amountGroup').style.display = 'none';
    document.getElementById('targetDateGroup').style.display = 'none';
    document.getElementById('priorityGroup').style.display = 'none';
    document.getElementById('assignedToGroup').style.display = 'none';

    if (!newStatus || !STATUS_CONFIG[newStatus]) {
        return;
    }

    const config = STATUS_CONFIG[newStatus];

    // Show relevant fields based on status
    if (config.showAmount) {
        document.getElementById('amountGroup').style.display = 'block';
    }

    if (config.showTarget) {
        document.getElementById('targetDateGroup').style.display = 'block';
    }

    if (config.showPriority) {
        document.getElementById('priorityGroup').style.display = 'block';
    }

    if (config.fields && config.fields.includes('assigned_to')) {
        document.getElementById('assignedToGroup').style.display = 'block';
    }
}

async function handleStatusUpdate(event) {
    event.preventDefault();

    const propertyId = parseInt(document.getElementById('modalPropertyId').value);
    const newStatus = document.getElementById('modalNewStatus').value;
    const updatedBy = document.getElementById('modalUpdatedBy').value;
    const amount = document.getElementById('modalAmount').value || null;
    const targetDate = document.getElementById('modalTargetDate').value || null;
    const priority = document.getElementById('modalPriority').value || null;
    const assignedTo = document.getElementById('modalAssignedTo').value || null;
    const notes = document.getElementById('modalNotes').value || null;

    // Get current status for history
    const currentProperty = propertyStatuses.find(p => p.property_id === propertyId);
    const oldStatus = currentProperty ? currentProperty.status : null;

    try {
        // Check if property already has a status record
        const { data: existingStatus } = await supabase
            .from('property_status')
            .select('*')
            .eq('property_id', propertyId)
            .single();

        let result;

        if (existingStatus) {
            // Update existing status
            result = await supabase
                .from('property_status')
                .update({
                    status: newStatus,
                    status_date: new Date().toISOString(),
                    amount: amount ? parseFloat(amount) : null,
                    target_date: targetDate,
                    priority: priority ? parseInt(priority) : null,
                    assigned_to: assignedTo,
                    notes: notes,
                    updated_at: new Date().toISOString(),
                    updated_by: updatedBy
                })
                .eq('property_id', propertyId);
        } else {
            // Insert new status
            result = await supabase
                .from('property_status')
                .insert({
                    property_id: propertyId,
                    status: newStatus,
                    amount: amount ? parseFloat(amount) : null,
                    target_date: targetDate,
                    priority: priority ? parseInt(priority) : null,
                    assigned_to: assignedTo,
                    notes: notes,
                    updated_by: updatedBy
                });
        }

        if (result.error) {
            throw result.error;
        }

        // Insert into status history
        await supabase
            .from('status_history')
            .insert({
                property_id: propertyId,
                old_status: oldStatus,
                new_status: newStatus,
                changed_by: updatedBy,
                notes: notes
            });

        // Close modal and refresh dashboard
        closeModal();
        await refreshDashboard();

    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status. Please try again.');
    }
}

// ============================================
// Utility Functions
// ============================================

function calculateDaysInStatus(statusDate) {
    if (!statusDate) return 0;

    const now = new Date();
    const statusDateTime = new Date(statusDate);
    const diffTime = Math.abs(now - statusDateTime);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

function formatDate(dateString) {
    if (!dateString) return '—';

    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
}

function formatCurrency(amount) {
    if (!amount) return '$0.00';

    return '$' + parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });

    document.getElementById('lastUpdated').textContent =
        `Last Updated: ${dateString} ${timeString}`;
}

// ============================================
// Auto-refresh
// ============================================

function startAutoRefresh() {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }

    // Set up new interval (60 seconds)
    autoRefreshInterval = setInterval(() => {
        console.log('Auto-refreshing dashboard...');
        refreshDashboard();
    }, AUTO_REFRESH_INTERVAL);

    console.log('Auto-refresh enabled (60 seconds)');
}

// Stop auto-refresh when page is hidden (optional optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
    } else {
        startAutoRefresh();
        refreshDashboard();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('updateModal');
    if (event.target === modal) {
        closeModal();
    }
};

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const modal = document.getElementById('updateModal');
        if (modal.classList.contains('active')) {
            closeModal();
        }
    }
});

console.log('Dashboard app.js loaded successfully');
