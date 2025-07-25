/**
 * Incident Overview Management Extension for QHSE Dashboard
 * Provides comprehensive incident listing, filtering, and management
 */

// Extend QHSEDashboard with Incident Overview functionality
(function() {
    'use strict';
    
    // Add to initialization
    const originalInit = QHSEDashboard.prototype.init;
    QHSEDashboard.prototype.init = function() {
        originalInit.call(this);
        this.setupIncidentOverview();
    };
    
    // Incident Overview Management
    QHSEDashboard.prototype.setupIncidentOverview = function() {
        console.log('📋 Setting up Incident Overview...');
        
        // Setup event listeners after DOM is ready
        setTimeout(() => {
            this.initializeIncidentOverview();
        }, 200);
    };

    QHSEDashboard.prototype.initializeIncidentOverview = function() {
        console.log('🔄 Initializing Incident Overview...');
        
        // Setup button event listeners
        const refreshBtn = document.getElementById('refreshIncidentsBtn');
        const exportBtn = document.getElementById('exportIncidentsBtn');
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshIncidentsList());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportIncidents());
        }
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearIncidentFilters());
        }
        
        // Setup filter event listeners
        const filters = ['incidentTypeFilter', 'severityFilter', 'statusFilter', 'dateFromFilter', 'dateToFilter'];
        filters.forEach(filterId => {
            const filterElement = document.getElementById(filterId);
            if (filterElement) {
                filterElement.addEventListener('change', () => this.applyIncidentFilters());
            }
        });
        
        // Setup search
        const searchInput = document.getElementById('searchIncidents');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.applyIncidentFilters();
                }, 300);
            });
        }
        
        // Initialize pagination
        this.currentIncidentsPage = 1;
        this.incidentsPerPage = 10;
        this.filteredIncidents = [];
        
        // Setup section visibility observer
        this.setupIncidentOverviewVisibilityObserver();
    };
    
    QHSEDashboard.prototype.setupIncidentOverviewVisibilityObserver = function() {
        // Check when incident overview section becomes visible
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.id === 'incident-overview-section' && 
                    !mutation.target.classList.contains('hidden')) {
                    // Section became visible, load incidents
                    setTimeout(() => this.refreshIncidentsList(), 100);
                }
            });
        });
        
        const section = document.getElementById('incident-overview-section');
        if (section) {
            observer.observe(section, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        }
        
        // Also check on navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-section="incident-overview"]') || 
                e.target.closest('[data-section="incident-overview"]')) {
                setTimeout(() => this.refreshIncidentsList(), 200);
            }
        });
    };

    QHSEDashboard.prototype.refreshIncidentsList = function() {
        console.log('🔄 Refreshing incidents list...');
        
        // Check if we're on the incident overview section
        const section = document.getElementById('incident-overview-section');
        if (!section || section.classList.contains('hidden')) {
            return;
        }
        
        // Show loading
        this.showIncidentsLoading(true);
        
        // Reload incidents from storage
        this.incidents = this.loadIncidentsFromStorage();
        
        // Update summary statistics
        this.updateIncidentsSummary();
        
        // Apply current filters
        this.applyIncidentFilters();
        
        console.log(`✅ Loaded ${this.incidents.length} incidents`);
    };

    QHSEDashboard.prototype.updateIncidentsSummary = function() {
        const accidents = this.incidents.filter(inc => inc.type === 'accident').length;
        const nearMiss = this.incidents.filter(inc => inc.type === 'near_miss').length;
        const pending = this.incidents.filter(inc => !inc.status || inc.status !== 'abgeschlossen').length;
        
        // This month
        const now = new Date();
        const thisMonth = this.incidents.filter(inc => {
            const incDate = new Date(inc.incidentDateTime);
            return incDate.getMonth() === now.getMonth() && incDate.getFullYear() === now.getFullYear();
        }).length;
        
        // Update UI
        const totalAccidentsEl = document.getElementById('totalAccidents');
        const totalNearMissEl = document.getElementById('totalNearMiss');
        const pendingIncidentsEl = document.getElementById('pendingIncidents');
        const thisMonthIncidentsEl = document.getElementById('thisMonthIncidents');
        
        if (totalAccidentsEl) totalAccidentsEl.textContent = accidents;
        if (totalNearMissEl) totalNearMissEl.textContent = nearMiss;
        if (pendingIncidentsEl) pendingIncidentsEl.textContent = pending;
        if (thisMonthIncidentsEl) thisMonthIncidentsEl.textContent = thisMonth;
    };

    QHSEDashboard.prototype.applyIncidentFilters = function() {
        console.log('🔍 Applying incident filters...');
        
        let filtered = [...this.incidents];
        
        // Type filter
        const typeFilter = document.getElementById('incidentTypeFilter');
        if (typeFilter && typeFilter.value) {
            filtered = filtered.filter(inc => inc.type === typeFilter.value);
        }
        
        // Severity filter
        const severityFilter = document.getElementById('severityFilter');
        if (severityFilter && severityFilter.value) {
            filtered = filtered.filter(inc => inc.severity === severityFilter.value);
        }
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter && statusFilter.value) {
            filtered = filtered.filter(inc => inc.status === statusFilter.value);
        }
        
        // Date range filter
        const dateFromFilter = document.getElementById('dateFromFilter');
        const dateToFilter = document.getElementById('dateToFilter');
        
        if (dateFromFilter && dateFromFilter.value) {
            const fromDate = new Date(dateFromFilter.value);
            filtered = filtered.filter(inc => new Date(inc.incidentDateTime) >= fromDate);
        }
        
        if (dateToFilter && dateToFilter.value) {
            const toDate = new Date(dateToFilter.value);
            toDate.setHours(23, 59, 59); // End of day
            filtered = filtered.filter(inc => new Date(inc.incidentDateTime) <= toDate);
        }
        
        // Search filter
        const searchInput = document.getElementById('searchIncidents');
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.toLowerCase().trim();
            filtered = filtered.filter(inc => 
                (inc.incidentDescription && inc.incidentDescription.toLowerCase().includes(searchTerm)) ||
                (inc.incidentLocation && inc.incidentLocation.toLowerCase().includes(searchTerm)) ||
                (inc.reporterName && inc.reporterName.toLowerCase().includes(searchTerm)) ||
                (inc.affectedPersonName && inc.affectedPersonName.toLowerCase().includes(searchTerm))
            );
        }
        
        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.incidentDateTime) - new Date(a.incidentDateTime));
        
        this.filteredIncidents = filtered;
        this.currentIncidentsPage = 1;
        
        this.renderIncidentsList();
    };

    QHSEDashboard.prototype.renderIncidentsList = function() {
        console.log(`📋 Rendering ${this.filteredIncidents.length} filtered incidents...`);
        
        const incidentsList = document.getElementById('incidentsList');
        const noIncidentsMessage = document.getElementById('noIncidentsMessage');
        
        if (!incidentsList) return;
        
        // Hide loading
        this.showIncidentsLoading(false);
        
        // Check if no incidents
        if (this.filteredIncidents.length === 0) {
            incidentsList.style.display = 'none';
            if (noIncidentsMessage) noIncidentsMessage.style.display = 'block';
            return;
        }
        
        // Show incidents list
        incidentsList.style.display = 'block';
        if (noIncidentsMessage) noIncidentsMessage.style.display = 'none';
        
        // Calculate pagination
        const startIndex = (this.currentIncidentsPage - 1) * this.incidentsPerPage;
        const endIndex = Math.min(startIndex + this.incidentsPerPage, this.filteredIncidents.length);
        const pageIncidents = this.filteredIncidents.slice(startIndex, endIndex);
        
        // Render incidents
        incidentsList.innerHTML = pageIncidents.map(incident => this.renderIncidentCard(incident)).join('');
        
        // Add event listeners to incident cards
        this.setupIncidentCardListeners();
    };

    QHSEDashboard.prototype.renderIncidentCard = function(incident) {
        const typeLabel = incident.type === 'accident' ? 'Unfall' : 'Beinahe-Unfall';
        const severityClass = incident.severity || 'niedrig';
        const statusClass = incident.status || 'offen';
        const statusLabel = {
            'offen': 'Offen',
            'in_bearbeitung': 'In Bearbeitung', 
            'abgeschlossen': 'Abgeschlossen'
        }[statusClass] || 'Offen';
        
        const incidentDate = new Date(incident.incidentDateTime);
        const formattedDate = incidentDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const description = incident.incidentDescription || 'Keine Beschreibung verfügbar';
        const shortDesc = description.length > 150 ? description.substring(0, 150) + '...' : description;
        
        return `
            <div class="incident-card" data-incident-id="${incident.id}" data-incident-type="${incident.type}">
                <div class="incident-header">
                    <div>
                        <span class="incident-type-badge ${incident.type}">
                            <i class="fas fa-${incident.type === 'accident' ? 'ambulance' : 'shield-alt'}"></i>
                            ${typeLabel}
                        </span>
                    </div>
                    <div class="incident-id">#${incident.id}</div>
                </div>
                
                <div class="incident-meta">
                    <div class="incident-date">
                        <i class="fas fa-clock"></i>
                        ${formattedDate}
                    </div>
                    <div class="incident-badges">
                        <span class="incident-severity ${severityClass}">${incident.severity || 'Niedrig'}</span>
                        <span class="incident-status ${statusClass}">${statusLabel}</span>
                    </div>
                </div>
                
                <div class="incident-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${incident.incidentLocation || 'Kein Ort angegeben'}
                </div>
                
                <div class="incident-description">
                    ${shortDesc}
                </div>
                
                <div class="incident-footer">
                    <div class="incident-reporter">
                        Gemeldet von: ${incident.reporterName || 'Unbekannt'}
                    </div>
                    <div class="incident-actions">
                        <button class="incident-action-btn view" onclick="qhseDashboard.viewIncidentDetails('${incident.id}')">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        ${incident.type === 'accident' ? `
                            <button class="incident-action-btn dguv" onclick="qhseDashboard.exportIncidentToDGUV('${incident.id}')">
                                <i class="fas fa-file-pdf"></i> DGUV
                            </button>
                        ` : ''}
                        <button class="incident-action-btn delete" onclick="qhseDashboard.deleteIncident('${incident.id}')">
                            <i class="fas fa-trash"></i> Löschen
                        </button>
                    </div>
                </div>
                
                <div class="incident-details">
                    <h4>Weitere Details:</h4>
                    <p><strong>Vollständige Beschreibung:</strong><br>${description}</p>
                    ${incident.immediateMeasures ? `<p><strong>Sofortmaßnahmen:</strong><br>${incident.immediateMeasures}</p>` : ''}
                    ${incident.preventiveMeasures ? `<p><strong>Präventionsmaßnahmen:</strong><br>${incident.preventiveMeasures}</p>` : ''}
                    ${incident.affectedPersonName ? `<p><strong>Betroffene Person:</strong> ${incident.affectedPersonName}</p>` : ''}
                    ${incident.witnesses ? `<p><strong>Zeugen:</strong> ${incident.witnesses}</p>` : ''}
                    
                    ${incident.files && incident.files.length > 0 ? `
                        <div class="incident-files">
                            <h5>Angehängte Dateien:</h5>
                            ${incident.files.map(file => `
                                <div class="incident-file">
                                    <i class="fas fa-file"></i>
                                    ${file.name} (${this.formatFileSize(file.size)})
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    };

    QHSEDashboard.prototype.setupIncidentCardListeners = function() {
        // Add click listeners to expand incident cards
        document.querySelectorAll('.incident-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't expand if clicking on action buttons
                if (e.target.closest('.incident-actions')) return;
                
                card.classList.toggle('expanded');
            });
        });
    };

    QHSEDashboard.prototype.showIncidentsLoading = function(show) {
        const loading = document.getElementById('incidentsLoading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    };

    QHSEDashboard.prototype.clearIncidentFilters = function() {
        // Clear all filter inputs
        const filters = ['incidentTypeFilter', 'severityFilter', 'statusFilter', 'dateFromFilter', 'dateToFilter', 'searchIncidents'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.value = '';
            }
        });
        
        // Reapply filters (which will now show all incidents)
        this.applyIncidentFilters();
        
        console.log('🧹 Incident filters cleared');
    };

    QHSEDashboard.prototype.viewIncidentDetails = function(incidentId) {
        console.log('👁️ Viewing incident details:', incidentId);
        
        const incident = this.incidents.find(inc => inc.id === incidentId);
        if (!incident) {
            alert('Vorfall nicht gefunden!');
            return;
        }
        
        // Expand the card and scroll to it
        const card = document.querySelector(`[data-incident-id="${incidentId}"]`);
        if (card) {
            if (!card.classList.contains('expanded')) {
                card.classList.add('expanded');
            }
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    QHSEDashboard.prototype.deleteIncident = function(incidentId) {
        console.log('🗑️ Deleting incident:', incidentId);
        
        if (!confirm('Sind Sie sicher, dass Sie diesen Vorfall löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            return;
        }
        
        // Remove from incidents array
        this.incidents = this.incidents.filter(inc => inc.id !== incidentId);
        
        // Save to storage
        this.saveIncidentsToStorage();
        
        // Refresh the list
        this.refreshIncidentsList();
        
        console.log('✅ Incident deleted successfully');
    };

    QHSEDashboard.prototype.exportIncidents = function() {
        console.log('📤 Exporting incidents...');
        
        if (this.filteredIncidents.length === 0) {
            alert('Keine Vorfälle zum Exportieren gefunden!');
            return;
        }
        
        // Create CSV content
        const csvContent = this.generateIncidentsCSV(this.filteredIncidents);
        
        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `QHSE_Vorfälle_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Incidents exported successfully');
    };

    QHSEDashboard.prototype.generateIncidentsCSV = function(incidents) {
        const headers = [
            'ID', 'Typ', 'Datum', 'Ort', 'Schweregrad', 'Status', 
            'Beschreibung', 'Melder', 'Betroffene Person', 'Sofortmaßnahmen'
        ];
        
        const csvRows = [headers.join(';')];
        
        incidents.forEach(incident => {
            const row = [
                incident.id || '',
                incident.type === 'accident' ? 'Unfall' : 'Beinahe-Unfall',
                new Date(incident.incidentDateTime).toLocaleDateString('de-DE'),
                incident.incidentLocation || '',
                incident.severity || '',
                incident.status || '',
                (incident.incidentDescription || '').replace(/;/g, ',').replace(/\n/g, ' '),
                incident.reporterName || '',
                incident.affectedPersonName || '',
                (incident.immediateMeasures || '').replace(/;/g, ',').replace(/\n/g, ' ')
            ];
            csvRows.push(row.join(';'));
        });
        
        return csvRows.join('\n');
    };

    QHSEDashboard.prototype.formatFileSize = function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

})();

console.log('✅ Incident Overview Module loaded');