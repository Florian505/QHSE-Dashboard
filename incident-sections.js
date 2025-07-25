/**
 * Incident Sections Management - Separate Areas for Accidents and Near-Miss
 * Provides dedicated sections for managing accidents and near-miss incidents
 */

(function() {
    'use strict';
    
    // Extend QHSEDashboard with incident sections functionality
    const originalInit = QHSEDashboard.prototype.init;
    QHSEDashboard.prototype.init = function() {
        originalInit.call(this);
        this.setupIncidentSections();
    };
    
    // Initialize incident sections
    QHSEDashboard.prototype.setupIncidentSections = function() {
        console.log('📋 Setting up Incident Sections...');
        
        // Setup after DOM is ready
        setTimeout(() => {
            this.initializeIncidentSections();
        }, 200);
    };

    QHSEDashboard.prototype.initializeIncidentSections = function() {
        console.log('🔄 Initializing Incident Sections...');
        
        // Setup section visibility observers
        this.setupSectionVisibilityObservers();
        
        // Initialize both sections
        this.initializeAccidentSection();
        this.initializeNearMissSection();
    };

    // Setup visibility observers for sections
    QHSEDashboard.prototype.setupSectionVisibilityObservers = function() {
        // Watch for navigation changes
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-section="accident"]') || 
                e.target.closest('[data-section="accident"]')) {
                setTimeout(() => this.refreshAccidentSection(), 200);
            }
            
            if (e.target.matches('[data-section="near-miss"]') || 
                e.target.closest('[data-section="near-miss"]')) {
                setTimeout(() => this.refreshNearMissSection(), 200);
            }
        });
    };

    // ===== ACCIDENT SECTION =====
    
    QHSEDashboard.prototype.initializeAccidentSection = function() {
        // Setup filter event listeners
        const accidentFilters = ['searchAccidents', 'accidentSeverityFilter', 'accidentStatusFilter'];
        accidentFilters.forEach(filterId => {
            const filterElement = document.getElementById(filterId);
            if (filterElement) {
                if (filterId === 'searchAccidents') {
                    let searchTimeout;
                    filterElement.addEventListener('input', (e) => {
                        clearTimeout(searchTimeout);
                        searchTimeout = setTimeout(() => {
                            this.applyAccidentFilters();
                        }, 300);
                    });
                } else {
                    filterElement.addEventListener('change', () => this.applyAccidentFilters());
                }
            }
        });
        
        // Setup action buttons
        const clearAccidentFiltersBtn = document.getElementById('clearAccidentFilters');
        if (clearAccidentFiltersBtn) {
            clearAccidentFiltersBtn.addEventListener('click', () => this.clearAccidentFilters());
        }
        
        const exportAccidentsBtn = document.getElementById('exportAccidents');
        if (exportAccidentsBtn) {
            exportAccidentsBtn.addEventListener('click', () => this.exportAccidents());
        }
        
        // Initialize filtered accidents array
        this.filteredAccidents = [];
    };

    QHSEDashboard.prototype.refreshAccidentSection = function() {
        console.log('🚑 Refreshing accident section...');
        
        const section = document.getElementById('accident-section');
        if (!section || section.classList.contains('hidden')) {
            return;
        }
        
        // Load incidents
        this.incidents = this.loadIncidentsFromStorage();
        
        // Update statistics
        this.updateAccidentStatistics();
        
        // Apply filters and render
        this.applyAccidentFilters();
    };

    QHSEDashboard.prototype.updateAccidentStatistics = function() {
        const accidents = this.incidents.filter(inc => inc.type === 'accident');
        const pendingAccidents = accidents.filter(inc => !inc.status || inc.status !== 'abgeschlossen');
        
        const accidentCountEl = document.getElementById('accidentCount');
        const accidentPendingEl = document.getElementById('accidentPending');
        
        if (accidentCountEl) accidentCountEl.textContent = accidents.length;
        if (accidentPendingEl) accidentPendingEl.textContent = pendingAccidents.length;
    };

    QHSEDashboard.prototype.applyAccidentFilters = function() {
        const accidents = this.incidents.filter(inc => inc.type === 'accident');
        let filtered = [...accidents];
        
        // Severity filter
        const severityFilter = document.getElementById('accidentSeverityFilter');
        if (severityFilter && severityFilter.value) {
            filtered = filtered.filter(inc => inc.severity === severityFilter.value);
        }
        
        // Status filter
        const statusFilter = document.getElementById('accidentStatusFilter');
        if (statusFilter && statusFilter.value) {
            filtered = filtered.filter(inc => inc.status === statusFilter.value);
        }
        
        // Search filter
        const searchInput = document.getElementById('searchAccidents');
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
        
        this.filteredAccidents = filtered;
        this.renderAccidentsList();
    };

    QHSEDashboard.prototype.renderAccidentsList = function() {
        const accidentsList = document.getElementById('accidentsList');
        const noAccidentsMessage = document.getElementById('noAccidentsMessage');
        const accidentsLoading = document.getElementById('accidentsLoading');
        
        if (!accidentsList) return;
        
        // Hide loading
        if (accidentsLoading) accidentsLoading.style.display = 'none';
        
        // Check if no accidents
        if (this.filteredAccidents.length === 0) {
            accidentsList.style.display = 'none';
            if (noAccidentsMessage) noAccidentsMessage.style.display = 'block';
            return;
        }
        
        // Show accidents list
        accidentsList.style.display = 'block';
        if (noAccidentsMessage) noAccidentsMessage.style.display = 'none';
        
        // Render accidents (limit to 10 for performance)
        const displayAccidents = this.filteredAccidents.slice(0, 10);
        accidentsList.innerHTML = displayAccidents.map(incident => this.renderCompactIncidentCard(incident, 'accident')).join('');
        
        // Add event listeners
        this.setupCompactCardListeners('accident');
    };

    QHSEDashboard.prototype.clearAccidentFilters = function() {
        const filters = ['searchAccidents', 'accidentSeverityFilter', 'accidentStatusFilter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) element.value = '';
        });
        this.applyAccidentFilters();
    };

    QHSEDashboard.prototype.exportAccidents = function() {
        if (this.filteredAccidents.length === 0) {
            alert('Keine Unfälle zum Exportieren gefunden!');
            return;
        }
        
        const csvContent = this.generateIncidentsCSV(this.filteredAccidents);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `QHSE_Unfälle_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ===== NEAR-MISS SECTION =====
    
    QHSEDashboard.prototype.initializeNearMissSection = function() {
        // Setup filter event listeners
        const nearMissFilters = ['searchNearMiss', 'nearMissSeverityFilter', 'nearMissStatusFilter'];
        nearMissFilters.forEach(filterId => {
            const filterElement = document.getElementById(filterId);
            if (filterElement) {
                if (filterId === 'searchNearMiss') {
                    let searchTimeout;
                    filterElement.addEventListener('input', (e) => {
                        clearTimeout(searchTimeout);
                        searchTimeout = setTimeout(() => {
                            this.applyNearMissFilters();
                        }, 300);
                    });
                } else {
                    filterElement.addEventListener('change', () => this.applyNearMissFilters());
                }
            }
        });
        
        // Setup action buttons
        const clearNearMissFiltersBtn = document.getElementById('clearNearMissFilters');
        if (clearNearMissFiltersBtn) {
            clearNearMissFiltersBtn.addEventListener('click', () => this.clearNearMissFilters());
        }
        
        const exportNearMissBtn = document.getElementById('exportNearMiss');
        if (exportNearMissBtn) {
            exportNearMissBtn.addEventListener('click', () => this.exportNearMiss());
        }
        
        // Initialize filtered near-miss array
        this.filteredNearMiss = [];
    };

    QHSEDashboard.prototype.refreshNearMissSection = function() {
        console.log('🛡️ Refreshing near-miss section...');
        
        const section = document.getElementById('near-miss-section');
        if (!section || section.classList.contains('hidden')) {
            return;
        }
        
        // Load incidents
        this.incidents = this.loadIncidentsFromStorage();
        
        // Update statistics
        this.updateNearMissStatistics();
        
        // Apply filters and render
        this.applyNearMissFilters();
    };

    QHSEDashboard.prototype.updateNearMissStatistics = function() {
        const nearMisses = this.incidents.filter(inc => inc.type === 'near_miss');
        const pendingNearMisses = nearMisses.filter(inc => !inc.status || inc.status !== 'abgeschlossen');
        
        const nearMissCountEl = document.getElementById('nearMissCount');
        const nearMissPendingEl = document.getElementById('nearMissPending');
        
        if (nearMissCountEl) nearMissCountEl.textContent = nearMisses.length;
        if (nearMissPendingEl) nearMissPendingEl.textContent = pendingNearMisses.length;
    };

    QHSEDashboard.prototype.applyNearMissFilters = function() {
        const nearMisses = this.incidents.filter(inc => inc.type === 'near_miss');
        let filtered = [...nearMisses];
        
        // Severity filter
        const severityFilter = document.getElementById('nearMissSeverityFilter');
        if (severityFilter && severityFilter.value) {
            filtered = filtered.filter(inc => inc.severity === severityFilter.value);
        }
        
        // Status filter
        const statusFilter = document.getElementById('nearMissStatusFilter');
        if (statusFilter && statusFilter.value) {
            filtered = filtered.filter(inc => inc.status === statusFilter.value);
        }
        
        // Search filter
        const searchInput = document.getElementById('searchNearMiss');
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
        
        this.filteredNearMiss = filtered;
        this.renderNearMissList();
    };

    QHSEDashboard.prototype.renderNearMissList = function() {
        const nearMissList = document.getElementById('nearMissList');
        const noNearMissMessage = document.getElementById('noNearMissMessage');
        const nearMissLoading = document.getElementById('nearMissLoading');
        
        if (!nearMissList) return;
        
        // Hide loading
        if (nearMissLoading) nearMissLoading.style.display = 'none';
        
        // Check if no near-misses
        if (this.filteredNearMiss.length === 0) {
            nearMissList.style.display = 'none';
            if (noNearMissMessage) noNearMissMessage.style.display = 'block';
            return;
        }
        
        // Show near-miss list
        nearMissList.style.display = 'block';
        if (noNearMissMessage) noNearMissMessage.style.display = 'none';
        
        // Render near-misses (limit to 10 for performance)
        const displayNearMisses = this.filteredNearMiss.slice(0, 10);
        nearMissList.innerHTML = displayNearMisses.map(incident => this.renderCompactIncidentCard(incident, 'near-miss')).join('');
        
        // Add event listeners
        this.setupCompactCardListeners('near-miss');
    };

    QHSEDashboard.prototype.clearNearMissFilters = function() {
        const filters = ['searchNearMiss', 'nearMissSeverityFilter', 'nearMissStatusFilter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) element.value = '';
        });
        this.applyNearMissFilters();
    };

    QHSEDashboard.prototype.exportNearMiss = function() {
        if (this.filteredNearMiss.length === 0) {
            alert('Keine Beinahe-Unfälle zum Exportieren gefunden!');
            return;
        }
        
        const csvContent = this.generateIncidentsCSV(this.filteredNearMiss);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `QHSE_Beinahe-Unfälle_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ===== SHARED FUNCTIONALITY =====
    
    QHSEDashboard.prototype.renderCompactIncidentCard = function(incident, sectionType) {
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
        const shortDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;
        
        return `
            <div class="incident-card compact" data-incident-id="${incident.id}" data-incident-type="${incident.type}">
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
                        <button class="incident-action-btn delete" onclick="qhseDashboard.deleteSectionIncident('${incident.id}', '${sectionType}')">
                            <i class="fas fa-trash"></i> Löschen
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    QHSEDashboard.prototype.setupCompactCardListeners = function(sectionType) {
        // Add click listeners to expand incident cards
        document.querySelectorAll('.incident-card.compact').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't expand if clicking on action buttons
                if (e.target.closest('.incident-actions')) return;
                
                card.classList.toggle('expanded');
            });
        });
    };

    QHSEDashboard.prototype.deleteSectionIncident = function(incidentId, sectionType) {
        if (!confirm('Sind Sie sicher, dass Sie diesen Vorfall löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            return;
        }
        
        // Remove from incidents array
        this.incidents = this.incidents.filter(inc => inc.id !== incidentId);
        
        // Save to storage
        this.saveIncidentsToStorage();
        
        // Refresh the appropriate section
        if (sectionType === 'accident') {
            this.refreshAccidentSection();
        } else if (sectionType === 'near-miss') {
            this.refreshNearMissSection();
        }
        
        console.log('✅ Incident deleted from section:', sectionType);
    };

    // Override navigation to handle section-specific incident loading
    const originalLoadIncidentsFromStorage = QHSEDashboard.prototype.loadIncidentsFromStorage;
    QHSEDashboard.prototype.loadIncidentsFromStorage = function() {
        const incidents = originalLoadIncidentsFromStorage.call(this);
        return incidents || [];
    };

})();

console.log('✅ Incident Sections Module loaded');