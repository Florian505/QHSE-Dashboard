// QHSE Management System JavaScript

class QHSEDashboard {
    constructor() {
        this.currentUserId = 'root-admin';
        this.currentSection = 'dashboard';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.documents = this.loadDocumentsFromStorage();
        this.users = this.loadUsersFromStorage();
        this.areas = this.loadAreasFromStorage();
        this.departments = this.loadDepartmentsFromStorage();
        this.timeEntries = this.loadTimeEntriesFromStorage();
        this.machines = this.loadMachinesFromStorage();
        this.maintenanceTasks = this.loadMaintenanceTasksFromStorage();
        this.issues = this.loadIssuesFromStorage();
        this.initializeRootAdmin();
        this.initializeDefaultAreas();
        this.initializeDefaultDepartments();
        this.init();
    }

    init() {
        this.setupUserManagement();
        this.setupAreaManagement();
        this.setupDepartmentManagement();
        this.setupUserSelection();
        this.setupNavigation();
        this.setupFileUpload();
        this.setupSearchFunctionality();
        this.setupModals();
        this.setupUserProfile();
        this.setupFormTabs();
        this.setupEditableCompanyName();
        this.setupSettings();
        this.setupTimeTracking();
        this.setupMaintenanceManagement();
        this.loadCustomLabels();
        this.updateUIForUser();
        this.renderDocumentsInSections();
        this.renderUsersList();
        this.renderAreasList();
        this.renderDepartmentsList();
        this.renderDynamicAreas();
        this.populateUserDropdown();
        this.populateDepartmentDropdowns();
        this.populateDocumentCategories();
        
        // Setup UI components after DOM is ready
        setTimeout(() => {
            this.setupExpandableInfo();
            this.setupCustomerFeedback();
            this.setupQHSENotesAreas();
        }, 100);
    }

    // User Selection Management
    setupUserSelection() {
        const userSelect = document.getElementById('userSelect');
        const userRole = document.getElementById('userRole');
        const userName = document.getElementById('userName');

        // Role definitions
        this.roleDefinitions = {
            'root-admin': {
                name: 'Root Administrator',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'nutzerverwaltung', 'bereichsverwaltung', 'abteilungsverwaltung', 'zeiterfassung', 'zeitauswertung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'einstellungen'],
                canManageUsers: true,
                canManageAreas: true,
                canManageDepartments: true,
                canViewAllTimeEntries: true
            },
            admin: {
                name: 'Administrator',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'nutzerverwaltung', 'bereichsverwaltung', 'abteilungsverwaltung', 'zeiterfassung', 'zeitauswertung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung'],
                canManageUsers: true,
                canManageAreas: true,
                canManageDepartments: true,
                canViewAllTimeEntries: true
            },
            geschaeftsfuehrung: {
                name: 'Geschäftsführung',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung'],
                hierarchyLevel: 1,
                canSupervise: ['betriebsleiter', 'qhse']
            },
            betriebsleiter: {
                name: 'Betriebsleiter',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung'],
                hierarchyLevel: 2,
                canSupervise: ['abteilungsleiter'],
                mustHaveSupervisor: ['geschaeftsfuehrung']
            },
            abteilungsleiter: {
                name: 'Abteilungsleiter',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen'],
                hierarchyLevel: 3,
                canSupervise: ['mitarbeiter'],
                mustHaveSupervisor: ['betriebsleiter']
            },
            qhse: {
                name: 'QHSE-Mitarbeiter',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'zeiterfassung'],
                hierarchyLevel: 2,
                isStaffPosition: true,
                mustHaveSupervisor: ['geschaeftsfuehrung']
            },
            mitarbeiter: {
                name: 'Mitarbeiter',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'zeiterfassung'],
                hierarchyLevel: 4,
                mustHaveSupervisor: ['abteilungsleiter']
            },
            techniker: {
                name: 'Techniker',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung'],
                hierarchyLevel: 4,
                canManageMachines: true,
                canReportIssues: true,
                mustHaveSupervisor: ['abteilungsleiter']
            }
        };

        userSelect.addEventListener('change', (e) => {
            this.currentUserId = e.target.value;
            this.updateUIForUser();
        });

        // Initialize with default user
        this.updateUIForUser();
    }

    updateUIForUser() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;
        
        const roleDefinition = this.roleDefinitions[currentUser.role];
        const userRole = document.getElementById('userRole');
        const userName = document.getElementById('userName');
        
        userRole.textContent = roleDefinition ? roleDefinition.name : currentUser.role;
        userName.textContent = currentUser.displayName;
        
        // Update body data attribute for CSS styling
        document.body.setAttribute('data-role', currentUser.role);
        
        // Show/hide menu items based on user's role
        this.updateMenuVisibility();
        
        // Update document visibility for putzkraft
        this.updateDocumentVisibility();
        
        // Update document categories based on user's role
        this.populateDocumentCategories();
        
        // Update QHSE notes visibility
        this.updateQHSENotesVisibility();
        
        // Update user dropdown selection
        const userSelect = document.getElementById('userSelect');
        if (userSelect) {
            userSelect.value = this.currentUserId;
        }
    }

    updateMenuVisibility() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;
        
        const menuItems = document.querySelectorAll('.menu-item');
        const roleDefinition = this.roleDefinitions[currentUser.role];
        const allowedSections = roleDefinition ? roleDefinition.allowedSections || [] : [];
        
        // Add dynamic areas to allowed sections
        const dynamicAreaIds = this.areas.filter(area => 
            area.allowedRoles && area.allowedRoles.includes(currentUser.role)
        ).map(area => area.id);
        
        const allAllowedSections = [...allowedSections, ...dynamicAreaIds];
        
        menuItems.forEach(item => {
            const section = item.getAttribute('data-section');
            if (allAllowedSections.includes(section)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    updateDocumentVisibility() {
        const documentItems = document.querySelectorAll('.document-item');
        
        if (this.currentRole === 'putzkraft') {
            documentItems.forEach(item => {
                if (!item.classList.contains('putzkraft-only')) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                }
            });
        } else {
            documentItems.forEach(item => {
                item.style.display = 'flex';
            });
        }
    }

    // Navigation Management
    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        const sections = document.querySelectorAll('.content-section');
        const pageTitle = document.getElementById('pageTitle');

        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetSection = item.getAttribute('data-section');
                
                // Check if user has access to this section
                const currentUser = this.getCurrentUser();
                if (!currentUser) {
                    this.showAccessDenied();
                    return;
                }
                
                const roleDefinition = this.roleDefinitions[currentUser.role];
                const allowedSections = roleDefinition ? roleDefinition.allowedSections : [];
                
                // Add dynamic areas to allowed sections
                const dynamicAreaIds = this.areas.filter(area => 
                    area.allowedRoles.includes(currentUser.role)
                ).map(area => area.id);
                
                const allAllowedSections = [...allowedSections, ...dynamicAreaIds];
                
                if (!allAllowedSections.includes(targetSection)) {
                    this.showAccessDenied();
                    return;
                }

                // Update active menu item
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');

                // Show target section
                sections.forEach(section => section.classList.remove('active'));
                const targetSectionElement = document.getElementById(targetSection + '-section');
                if (targetSectionElement) {
                    targetSectionElement.classList.add('active');
                }

                // Update page title
                const sectionTitles = {
                    dashboard: localStorage.getItem('qhse_dashboard_name') || 'Dashboard',
                    arbeitsschutz: 'Arbeitsschutz',
                    qualitaet: 'Qualitätsmanagement',
                    umwelt: 'Umweltmanagement',
                    datenschutz: 'Datenschutz',
                    gesundheit: 'Gesundheitsmanagement',
                    arbeitsanweisungen: 'Arbeitsanweisungen',
                    verfahrensanweisungen: 'Verfahrensanweisungen',
                    audits: 'Auditauswertungen',
                    kundenzufriedenheit: 'Kundenzufriedenheit',
                    dokumente: 'Dokumentenverwaltung',
                    nutzerverwaltung: 'Nutzerverwaltung',
                    bereichsverwaltung: 'Bereichsverwaltung',
                    abteilungsverwaltung: 'Abteilungsverwaltung',
                    zeiterfassung: 'Zeiterfassung',
                    zeitauswertung: 'Zeitauswertung',
                    maschinen: 'Maschinenmanagement',
                    wartungsplanung: 'Wartungsplanung',
                    stoerungen: 'Störungsmeldungen',
                    'instandhaltung-auswertung': 'Instandhaltungs-Auswertung',
                    einstellungen: 'System-Einstellungen'
                };
                
                pageTitle.textContent = sectionTitles[targetSection] || (localStorage.getItem('qhse_dashboard_name') || 'Dashboard');
                this.currentSection = targetSection;
            });
        });
    }

    showAccessDenied() {
        alert('Zugriff verweigert. Sie haben keine Berechtigung für diesen Bereich.');
    }

    // File Upload Management
    setupFileUpload() {
        const uploadZone = document.querySelector('.upload-zone');
        const fileInput = document.getElementById('fileUpload');
        const uploadBtn = document.getElementById('uploadBtn');
        const categorySelect = document.getElementById('documentCategory');

        // Click to upload
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#3b82f6';
            uploadZone.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.style.borderColor = '#cbd5e1';
            uploadZone.style.backgroundColor = 'transparent';
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#cbd5e1';
            uploadZone.style.backgroundColor = 'transparent';
            
            const files = e.dataTransfer.files;
            this.handleFileSelection(files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        // Upload button
        uploadBtn.addEventListener('click', () => {
            this.uploadFiles();
        });
    }

    handleFileSelection(files) {
        if (files.length > 0) {
            const fileNames = Array.from(files).map(file => file.name).join(', ');
            document.querySelector('.upload-zone p').textContent = `Ausgewählte Dateien: ${fileNames}`;
        }
    }

    uploadFiles() {
        const fileInput = document.getElementById('fileUpload');
        const categorySelect = document.getElementById('documentCategory');
        
        if (fileInput.files.length === 0) {
            alert('Bitte wählen Sie Dateien zum Hochladen aus.');
            return;
        }
        
        if (!categorySelect.value) {
            alert('Bitte wählen Sie eine Kategorie aus.');
            return;
        }

        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.textContent = 'Wird hochgeladen...';
        uploadBtn.disabled = true;

        // Process each file
        Array.from(fileInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const currentUser = this.getCurrentUser();
                const existingDoc = this.documents.find(doc => doc.name === file.name && doc.category === categorySelect.value);
                
                if (existingDoc) {
                    // Create new revision
                    const newRevision = {
                        version: (existingDoc.revisions?.length || 0) + 1,
                        uploadDate: new Date().toISOString(),
                        uploadedBy: currentUser.displayName,
                        content: e.target.result,
                        size: file.size,
                        changes: 'Dokument aktualisiert'
                    };
                    
                    if (!existingDoc.revisions) existingDoc.revisions = [];
                    existingDoc.revisions.push(newRevision);
                    existingDoc.currentRevision = newRevision.version;
                    existingDoc.uploadDate = new Date().toISOString();
                    existingDoc.uploadedBy = currentUser.displayName;
                    existingDoc.content = e.target.result;
                    existingDoc.size = file.size;
                } else {
                    // Create new document
                    const document = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        category: categorySelect.value,
                        uploadDate: new Date().toISOString(),
                        size: file.size,
                        type: file.type,
                        content: e.target.result,
                        uploadedBy: currentUser.displayName,
                        currentRevision: 1,
                        revisions: [{
                            version: 1,
                            uploadDate: new Date().toISOString(),
                            uploadedBy: currentUser.displayName,
                            content: e.target.result,
                            size: file.size,
                            changes: 'Initialer Upload'
                        }]
                    };
                    
                    this.documents.push(document);
                }
                
                this.saveDocumentsToStorage();
            };
            reader.readAsDataURL(file);
        });

        setTimeout(() => {
            alert('Dateien erfolgreich hochgeladen!');
            uploadBtn.textContent = 'Hochladen';
            uploadBtn.disabled = false;
            
            // Reset form
            fileInput.value = '';
            categorySelect.value = '';
            document.querySelector('.upload-zone p').textContent = 'Dateien hier ablegen oder klicken zum Hochladen';
            
            // Re-render documents in sections
            this.renderDocumentsInSections();
        }, 1000);
    }

    // Search Functionality
    setupSearchFunctionality() {
        const searchInput = document.querySelector('.search-box input');
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.performSearch(searchTerm);
        });
    }

    performSearch(searchTerm) {
        if (searchTerm.length < 2) return;

        // Simple search implementation
        const searchableElements = document.querySelectorAll('.document-item span, .kpi-content h3, .audit-type');
        
        searchableElements.forEach(element => {
            const parent = element.closest('.document-item, .kpi-card, .audit-item');
            if (element.textContent.toLowerCase().includes(searchTerm)) {
                parent.style.display = '';
                element.style.backgroundColor = '#fef3c7';
            } else {
                parent.style.display = 'none';
                element.style.backgroundColor = '';
            }
        });

        // Clear search
        if (searchTerm === '') {
            searchableElements.forEach(element => {
                const parent = element.closest('.document-item, .kpi-card, .audit-item');
                parent.style.display = '';
                element.style.backgroundColor = '';
            });
        }
    }

    // Notification Management
    setupNotifications() {
        const notifications = [
            { type: 'audit', message: 'OHSAS 18001 Audit in 2 Wochen geplant', priority: 'high' },
            { type: 'training', message: '5 Mitarbeiter benötigen Sicherheitsschulung', priority: 'medium' },
            { type: 'document', message: 'Neue Arbeitsanweisung verfügbar', priority: 'low' }
        ];

        // Update notification badge
        const badge = document.querySelector('.notification-badge');
        badge.textContent = notifications.length;

        // Handle notification clicks
        const notificationBtn = document.querySelector('.notification-btn');
        notificationBtn.addEventListener('click', () => {
            this.showNotifications(notifications);
        });
    }

    showNotifications(notifications) {
        const notificationHtml = notifications.map(notification => `
            <div class="notification-item ${notification.priority}">
                <strong>${notification.type.toUpperCase()}:</strong> ${notification.message}
            </div>
        `).join('');

        // Create modal or popup for notifications
        alert('Benachrichtigungen:\n' + notifications.map(n => `${n.type}: ${n.message}`).join('\n'));
    }

    // KPI Updates (simulated real-time data)
    updateKPIs() {
        const kpiUpdates = {
            safety: Math.random() * 2 + 97, // 97-99%
            quality: Math.random() * 1 + 98.5, // 98.5-99.5%
            environment: Math.floor(Math.random() * 5 + 10), // 10-15 tons
            health: Math.random() * 1 + 1.5 // 1.5-2.5 days
        };

        // Update KPI values
        document.querySelector('.kpi-card.safety .kpi-value').textContent = kpiUpdates.safety.toFixed(1) + '%';
        document.querySelector('.kpi-card.quality .kpi-value').textContent = kpiUpdates.quality.toFixed(1) + '%';
        document.querySelector('.kpi-card.environment .kpi-value').textContent = kpiUpdates.environment;
        document.querySelector('.kpi-card.health .kpi-value').textContent = kpiUpdates.health.toFixed(1);
    }

    // Generate Reports
    generateReport(type) {
        const reports = {
            safety: 'Arbeitsschutz-Bericht_' + new Date().toISOString().split('T')[0] + '.pdf',
            quality: 'Qualitäts-Bericht_' + new Date().toISOString().split('T')[0] + '.pdf',
            environment: 'Umwelt-Bericht_' + new Date().toISOString().split('T')[0] + '.pdf',
            audit: 'Audit-Bericht_' + new Date().toISOString().split('T')[0] + '.pdf'
        };

        // Simulate report generation
        alert(`Bericht wird generiert: ${reports[type]}`);
        
        // In a real application, this would trigger a download
        setTimeout(() => {
            alert(`Bericht "${reports[type]}" wurde erfolgreich erstellt und steht zum Download bereit.`);
        }, 1500);
    }

    // Document Management
    loadDocumentsFromStorage() {
        const stored = localStorage.getItem('qhse_documents');
        return stored ? JSON.parse(stored) : [];
    }

    saveDocumentsToStorage() {
        localStorage.setItem('qhse_documents', JSON.stringify(this.documents));
    }

    renderDocumentsInSections() {
        // Get all area categories (both default and custom)
        const categories = this.areas.map(area => area.id);
        
        categories.forEach(category => {
            this.renderDocumentsForCategory(category);
        });
        
        // Update Arbeitsanweisungen and Verfahrensanweisungen sections
        this.updateWorkInstructions();
    }

    renderDocumentsForCategory(category) {
        const section = document.getElementById(category + '-section');
        if (!section) return;

        const categoryDocs = this.documents.filter(doc => doc.category === category);
        
        if (categoryDocs.length === 0) return;

        // Find or create document list container
        let documentContainer = section.querySelector('.uploaded-documents');
        if (!documentContainer) {
            documentContainer = document.createElement('div');
            documentContainer.className = 'uploaded-documents';
            documentContainer.innerHTML = '<h3>Hochgeladene Dokumente</h3><div class="document-list"></div>';
            section.querySelector('.section-content').appendChild(documentContainer);
        }

        const documentList = documentContainer.querySelector('.document-list');
        documentList.innerHTML = '';

        categoryDocs.forEach(doc => {
            const docElement = this.createDocumentElement(doc);
            documentList.appendChild(docElement);
        });
    }

    createDocumentElement(doc) {
        const docElement = document.createElement('div');
        docElement.className = 'document-item uploaded-doc';
        
        const fileIcon = this.getFileIcon(doc.type);
        const formattedDate = new Date(doc.uploadDate).toLocaleDateString('de-DE');
        const formattedSize = this.formatFileSize(doc.size);
        
        docElement.innerHTML = `
            <i class="${fileIcon}"></i>
            <div class="document-info">
                <span class="document-name">${doc.name}</span>
                <div class="document-meta">
                    <span class="upload-date">Hochgeladen: ${formattedDate}</span>
                    <span class="file-size">${formattedSize}</span>
                    <span class="uploaded-by">von ${doc.uploadedBy}</span>
                    <span class="revision-badge">Rev. ${doc.currentRevision || 1}</span>
                </div>
            </div>
            <div class="document-actions">
                <button class="preview-btn" onclick="dashboard.previewDocument('${doc.id}')">
                    <i class="fas fa-eye"></i> Anzeigen
                </button>
                <button class="download-btn" onclick="dashboard.downloadDocument('${doc.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="delete-btn" onclick="dashboard.deleteDocument('${doc.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return docElement;
    }

    getFileIcon(mimeType) {
        if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'fas fa-file-word';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel';
        if (mimeType.includes('image')) return 'fas fa-file-image';
        return 'fas fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    downloadDocument(docId) {
        const doc = this.documents.find(d => d.id == docId);
        if (!doc) return;

        const link = document.createElement('a');
        link.href = doc.content;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    deleteDocument(docId) {
        if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
            this.documents = this.documents.filter(d => d.id != docId);
            this.saveDocumentsToStorage();
            this.renderDocumentsInSections();
        }
    }

    updateWorkInstructions() {
        // Add uploaded documents to work instructions sections
        const workInstructionDocs = this.documents.filter(doc => 
            doc.category === 'arbeitsschutz' || doc.category === 'qualitaet'
        );
        
        if (workInstructionDocs.length > 0) {
            const arbeitsanweisungenSection = document.getElementById('arbeitsanweisungen-section');
            const verfahrensanweisungenSection = document.getElementById('verfahrensanweisungen-section');
            
            [arbeitsanweisungenSection, verfahrensanweisungenSection].forEach(section => {
                if (!section) return;
                
                let uploadedContainer = section.querySelector('.uploaded-work-instructions');
                if (!uploadedContainer && workInstructionDocs.length > 0) {
                    uploadedContainer = document.createElement('div');
                    uploadedContainer.className = 'uploaded-work-instructions';
                    uploadedContainer.innerHTML = '<h3>Neue Arbeitsanweisungen</h3><div class="document-list"></div>';
                    section.querySelector('.section-content').appendChild(uploadedContainer);
                }
                
                if (uploadedContainer) {
                    const documentList = uploadedContainer.querySelector('.document-list');
                    documentList.innerHTML = '';
                    
                    workInstructionDocs.forEach(doc => {
                        const docElement = this.createDocumentElement(doc);
                        documentList.appendChild(docElement);
                    });
                }
            });
        }
    }

    // Modal Management
    setupModals() {
        // Document modal
        const documentModal = document.getElementById('documentModal');
        const closeModal = document.getElementById('closeModal');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        
        [closeModal, modalCloseBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                documentModal.style.display = 'none';
            });
        });
        
        // Profile modal
        const profileModal = document.getElementById('profileModal');
        const closeProfileModal = document.getElementById('closeProfileModal');
        const cancelProfileBtn = document.getElementById('cancelProfileBtn');
        
        [closeProfileModal, cancelProfileBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                profileModal.style.display = 'none';
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === documentModal) {
                documentModal.style.display = 'none';
            }
            if (e.target === profileModal) {
                profileModal.style.display = 'none';
            }
        });
    }

    previewDocument(docId) {
        const doc = this.documents.find(d => d.id == docId);
        if (!doc) return;

        // Populate modal with document details
        document.getElementById('modalDocumentTitle').textContent = doc.name;
        document.getElementById('modalFileName').textContent = doc.name;
        document.getElementById('modalCategory').textContent = this.getCategoryDisplayName(doc.category);
        document.getElementById('modalUploadedBy').textContent = doc.uploadedBy;
        document.getElementById('modalUploadDate').textContent = this.formatDateTime(doc.uploadDate);
        document.getElementById('modalFileSize').textContent = this.formatFileSize(doc.size);
        document.getElementById('modalRevision').textContent = `Version ${doc.currentRevision || 1}`;
        
        // Setup preview content
        this.setupDocumentPreview(doc);
        
        // Setup revision history
        this.setupRevisionHistory(doc);
        
        // Setup download button
        document.getElementById('modalDownloadBtn').onclick = () => this.downloadDocument(docId);
        
        // Show modal
        document.getElementById('documentModal').style.display = 'block';
    }

    setupDocumentPreview(doc) {
        const previewContent = document.getElementById('documentPreviewContent');
        
        if (doc.type.includes('image')) {
            previewContent.innerHTML = `<img src="${doc.content}" alt="${doc.name}" style="max-width: 100%; height: auto;">`;
        } else if (doc.type.includes('pdf')) {
            previewContent.innerHTML = `
                <iframe src="${doc.content}" width="100%" height="400px"></iframe>
                <p style="margin-top: 1rem; font-size: 0.875rem; color: #64748b;">
                    PDF-Vorschau. Falls das Dokument nicht angezeigt wird, verwenden Sie den Download-Button.
                </p>
            `;
        } else {
            previewContent.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-file" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Vorschau für diesen Dateityp nicht verfügbar.</p>
                    <p>Verwenden Sie den Download-Button zum Öffnen der Datei.</p>
                </div>
            `;
        }
    }

    setupRevisionHistory(doc) {
        const historyContainer = document.getElementById('revisionHistory');
        
        if (!doc.revisions || doc.revisions.length === 0) {
            historyContainer.innerHTML = '<p style="color: #64748b;">Keine Revisionshistorie verfügbar.</p>';
            return;
        }
        
        const revisionsHtml = doc.revisions.map(revision => `
            <div class="revision-item">
                <button class="revision-download-btn" onclick="dashboard.downloadRevision('${doc.id}', ${revision.version})">
                    <i class="fas fa-download"></i> Download
                </button>
                <div class="revision-header">
                    <span class="revision-version">Version ${revision.version}</span>
                    <span class="revision-date">${this.formatDateTime(revision.uploadDate)}</span>
                </div>
                <div class="revision-details">
                    <p><strong>Hochgeladen von:</strong> ${revision.uploadedBy}</p>
                    <p><strong>Änderungen:</strong> ${revision.changes}</p>
                    <p><strong>Dateigröße:</strong> ${this.formatFileSize(revision.size)}</p>
                </div>
            </div>
        `).reverse().join('');
        
        historyContainer.innerHTML = revisionsHtml;
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            'arbeitsschutz': 'Arbeitsschutz',
            'qualitaet': 'Qualität',
            'umwelt': 'Umwelt',
            'datenschutz': 'Datenschutz',
            'gesundheit': 'Gesundheit'
        };
        
        // Check if it's a custom area
        const area = this.areas.find(a => a.id === category);
        if (area) {
            return area.name;
        }
        
        return categoryNames[category] || category;
    }

    formatDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    downloadRevision(docId, revisionVersion) {
        const doc = this.documents.find(d => d.id == docId);
        if (!doc || !doc.revisions) return;
        
        const revision = doc.revisions.find(r => r.version == revisionVersion);
        if (!revision) return;
        
        const link = document.createElement('a');
        link.href = revision.content;
        link.download = `${doc.name.split('.')[0]}_v${revisionVersion}.${doc.name.split('.').pop()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // User Management
    initializeRootAdmin() {
        const existingRootAdmin = this.users.find(user => user.id === 'root-admin');
        if (!existingRootAdmin) {
            const rootAdmin = {
                id: 'root-admin',
                displayName: 'System Administrator',
                email: 'admin@hoffmann-voss.de',
                phone: '+49 2162 12345-000',
                department: 'IT/System',
                role: 'root-admin',
                isActive: true,
                canBeDeleted: false,
                createdAt: new Date().toISOString()
            };
            this.users.push(rootAdmin);
            this.saveUsersToStorage();
        }
        
        // Ensure we have default users for demonstration
        this.initializeDefaultUsers();
    }

    initializeDefaultUsers() {
        const requiredRoles = ['admin', 'geschaeftsfuehrung', 'betriebsleiter', 'qhse', 'abteilungsleiter', 'mitarbeiter', 'techniker'];
        
        requiredRoles.forEach(role => {
            const existingUser = this.users.find(user => user.role === role && user.isActive);
            if (!existingUser) {
                this.createDefaultUserForRole(role);
            }
        });
    }

    loadUsersFromStorage() {
        const stored = localStorage.getItem('qhse_users');
        return stored ? JSON.parse(stored) : [];
    }

    saveUsersToStorage() {
        localStorage.setItem('qhse_users', JSON.stringify(this.users));
    }

    setupUserManagement() {
        const addUserBtn = document.getElementById('addUserBtn');
        const saveUserBtn = document.getElementById('saveUserBtn');
        const cancelUserBtn = document.getElementById('cancelUserBtn');
        const closeUserModal = document.getElementById('closeUserModal');
        
        addUserBtn.addEventListener('click', () => {
            this.openUserEditor();
        });
        
        saveUserBtn.addEventListener('click', () => {
            this.saveUser();
        });
        
        [cancelUserBtn, closeUserModal].forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('userManagementModal').style.display = 'none';
            });
        });
    }

    renderUsersList() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;
        
        usersList.innerHTML = '';
        
        this.users.filter(user => user.isActive).forEach(user => {
            const userElement = this.createUserElement(user);
            usersList.appendChild(userElement);
        });
        
        // Update dropdown after rendering list
        this.populateUserDropdown();
    }

    createUserElement(user) {
        const userDiv = document.createElement('div');
        userDiv.className = `user-item ${user.role}`;
        
        const initials = user.displayName.split(' ').map(name => name[0]).join('').toUpperCase();
        
        const roleName = this.roleDefinitions[user.role]?.name || user.role;
        const departmentInfo = this.getDepartmentInfo(user.department);
        
        userDiv.innerHTML = `
            <div class="user-avatar">${initials}</div>
            <div class="user-info">
                <div class="user-name">${user.displayName}</div>
                <div class="user-role">
                    <span class="role-badge ${user.role}">${roleName}</span>
                </div>
                <div class="user-details">
                    <div>📧 ${user.email}</div>
                    <div>📱 ${user.phone || 'Nicht angegeben'}</div>
                    <div>🏢 ${departmentInfo}</div>
                </div>
            </div>
            <div class="user-item-actions">
                <button class="edit-user-btn" onclick="dashboard.editUser('${user.id}')">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
                ${user.canBeDeleted !== false ? `
                    <button class="delete-user-btn" onclick="dashboard.deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                ` : `
                    <button class="delete-user-btn" disabled title="Root-Admin kann nicht gelöscht werden">
                        <i class="fas fa-shield-alt"></i> Geschützt
                    </button>
                `}
            </div>
        `;
        
        return userDiv;
    }

    getDepartmentInfo(departmentId) {
        if (!departmentId) return 'Keine Abteilung';
        
        const department = this.departments.find(d => d.id === departmentId);
        if (department) {
            return `${department.name} (${department.code})`;
        }
        
        // Fallback for old department names (string instead of ID)
        return departmentId;
    }

    openUserEditor(userId = null) {
        const modal = document.getElementById('userManagementModal');
        const titleElement = document.getElementById('userModalTitle');
        const adminOption = document.getElementById('adminOption');
        
        // Show/hide admin option based on current user role
        if (this.currentRole === 'root-admin') {
            adminOption.style.display = 'block';
        } else {
            adminOption.style.display = 'none';
        }
        
        if (userId) {
            // Edit mode
            const user = this.users.find(u => u.id === userId);
            titleElement.textContent = 'Nutzer bearbeiten';
            
            // Basic tab
            document.getElementById('newUserName').value = user.displayName;
            document.getElementById('newUserEmail').value = user.email;
            document.getElementById('newUserPhone').value = user.phone || '';
            document.getElementById('newUserDepartment').value = user.department || '';
            document.getElementById('newUserRole').value = user.role;
            
            // Personal tab
            document.getElementById('newUserBirthdate').value = user.birthdate || '';
            document.getElementById('newUserAddress').value = user.address || '';
            document.getElementById('newUserMobile').value = user.mobile || '';
            document.getElementById('newUserEmergencyContact').value = user.emergencyContact || '';
            
            // Hierarchy tab
            document.getElementById('newUserSupervisor').value = user.supervisor || '';
            document.getElementById('newUserPosition').value = user.position || '';
            document.getElementById('newUserStartDate').value = user.startDate || '';
            
            // Notes tab
            document.getElementById('newUserNotes').value = user.notes || '';
            
            document.getElementById('editUserId').value = user.id;
        } else {
            // Add mode
            titleElement.textContent = 'Neuen Nutzer hinzufügen';
            document.getElementById('userForm').reset();
            document.getElementById('editUserId').value = '';
        }
        
        modal.style.display = 'block';
    }

    saveUser() {
        const form = document.getElementById('userForm');
        const formData = new FormData(form);
        const userId = document.getElementById('editUserId').value;
        
        const userData = {
            displayName: formData.get('userName'),
            email: formData.get('userEmail'),
            phone: formData.get('userPhone'),
            department: formData.get('userDepartment'),
            role: formData.get('userRole'),
            // Personal tab fields
            birthdate: document.getElementById('newUserBirthdate').value,
            address: document.getElementById('newUserAddress').value,
            mobile: document.getElementById('newUserMobile').value,
            emergencyContact: document.getElementById('newUserEmergencyContact').value,
            // Hierarchy tab fields
            supervisor: document.getElementById('newUserSupervisor').value,
            position: document.getElementById('newUserPosition').value,
            startDate: document.getElementById('newUserStartDate').value,
            // Notes tab fields
            notes: document.getElementById('newUserNotes').value
        };
        
        if (userId) {
            // Update existing user
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                this.users[userIndex] = { ...this.users[userIndex], ...userData };
            }
        } else {
            // Create new user
            const newUser = {
                id: Date.now().toString(),
                ...userData,
                isActive: true,
                canBeDeleted: true,
                createdAt: new Date().toISOString()
            };
            this.users.push(newUser);
        }
        
        this.saveUsersToStorage();
        this.renderUsersList();
        this.populateUserDropdown();
        document.getElementById('userManagementModal').style.display = 'none';
        
        alert(userId ? 'Nutzer erfolgreich aktualisiert!' : 'Nutzer erfolgreich hinzugefügt!');
    }

    editUser(userId) {
        this.openUserEditor(userId);
    }

    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user || user.canBeDeleted === false) {
            alert('Dieser Nutzer kann nicht gelöscht werden.');
            return;
        }
        
        if (confirm(`Möchten Sie den Nutzer "${user.displayName}" wirklich löschen?`)) {
            user.isActive = false;
            this.saveUsersToStorage();
            this.renderUsersList();
            this.populateUserDropdown();
            
            // If current user was deleted, switch to root-admin
            if (this.currentUserId === userId) {
                this.currentUserId = 'root-admin';
                this.updateUIForUser();
            }
            
            alert('Nutzer erfolgreich gelöscht!');
        }
    }

    // User Profile Management
    setupUserProfile() {
        const editProfileBtn = document.getElementById('editProfileBtn');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        
        editProfileBtn.addEventListener('click', () => {
            this.openProfileEditor();
        });
        
        saveProfileBtn.addEventListener('click', () => {
            this.saveUserProfile();
        });
    }

    getCurrentUser() {
        // Find user by ID
        let user = this.users.find(user => user.id === this.currentUserId && user.isActive);
        if (!user) {
            // Fallback to root-admin if current user not found
            user = this.users.find(user => user.id === 'root-admin');
            if (user) {
                this.currentUserId = 'root-admin';
            }
        }
        return user;
    }

    createDefaultUserForRole(role) {
        const defaultUsers = {
            'root-admin': {
                id: 'root-admin',
                displayName: 'System Administrator',
                email: 'admin@hoffmann-voss.de',
                phone: '+49 2162 12345-000',
                department: 'administration',
                role: 'root-admin',
                isActive: true,
                canBeDeleted: false
            },
            'admin': {
                id: 'admin-default',
                displayName: 'Administrator',
                email: 'admin@hoffmann-voss.de',
                phone: '+49 2162 12345-001',
                department: 'administration',
                role: 'admin',
                isActive: true,
                canBeDeleted: true
            },
            'geschaeftsfuehrung': {
                id: 'gf-default',
                displayName: 'Dr. Michael Hoffmann',
                email: 'm.hoffmann@hoffmann-voss.de',
                phone: '+49 2162 12345-100',
                department: 'geschaeftsfuehrung',
                role: 'geschaeftsfuehrung',
                isActive: true,
                canBeDeleted: true
            },
            'betriebsleiter': {
                id: 'bl-default',
                displayName: 'Peter Müller',
                email: 'p.mueller@hoffmann-voss.de',
                phone: '+49 2162 12345-150',
                department: 'betriebsleitung',
                role: 'betriebsleiter',
                isActive: true,
                canBeDeleted: true
            },
            'qhse': {
                id: 'qhse-default',
                displayName: 'Sarah Weber',
                email: 's.weber@hoffmann-voss.de',
                phone: '+49 2162 12345-200',
                department: 'qhse',
                role: 'qhse',
                isActive: true,
                canBeDeleted: true
            },
            'abteilungsleiter': {
                id: 'al-default',
                displayName: 'Thomas Schmidt',
                email: 't.schmidt@hoffmann-voss.de',
                phone: '+49 2162 12345-300',
                department: 'produktion',
                role: 'abteilungsleiter',
                isActive: true,
                canBeDeleted: true
            },
            'mitarbeiter': {
                id: 'ma-default',
                displayName: 'Maria Santos',
                email: 'm.santos@hoffmann-voss.de',
                phone: '+49 2162 12345-400',
                department: 'facility',
                role: 'mitarbeiter',
                isActive: true,
                canBeDeleted: true
            },
            'techniker': {
                id: 'tech-default',
                displayName: 'Klaus Fischer',
                email: 'k.fischer@hoffmann-voss.de',
                phone: '+49 2162 12345-350',
                department: 'instandhaltung',
                role: 'techniker',
                isActive: true,
                canBeDeleted: true
            }
        };

        const defaultUser = defaultUsers[role];
        if (defaultUser) {
            // Add creation timestamp
            defaultUser.createdAt = new Date().toISOString();
            this.users.push(defaultUser);
            this.saveUsersToStorage();
            return defaultUser;
        }
        
        // Fallback to root-admin if role not found
        return this.users.find(user => user.id === 'root-admin');
    }

    openProfileEditor() {
        const currentUser = this.getCurrentUser();
        
        document.getElementById('editUserName').value = currentUser.displayName;
        document.getElementById('editUserEmail').value = currentUser.email || '';
        document.getElementById('editUserPhone').value = currentUser.phone || '';
        document.getElementById('editUserDepartment').value = currentUser.department || '';
        
        document.getElementById('profileModal').style.display = 'block';
    }

    saveUserProfile() {
        const currentUser = this.getCurrentUser();
        const userIndex = this.users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            this.users[userIndex].displayName = document.getElementById('editUserName').value;
            this.users[userIndex].email = document.getElementById('editUserEmail').value;
            this.users[userIndex].phone = document.getElementById('editUserPhone').value;
            this.users[userIndex].department = document.getElementById('editUserDepartment').value;
            
            this.saveUsersToStorage();
            
            // Update UI
            this.updateUIForUser();
            this.renderUsersList();
            this.populateUserDropdown();
        }
        
        // Close modal
        document.getElementById('profileModal').style.display = 'none';
        
        alert('Profil erfolgreich gespeichert!');
    }

    populateUserDropdown() {
        const userSelect = document.getElementById('userSelect');
        if (!userSelect) return;
        
        // Clear existing options
        userSelect.innerHTML = '';
        
        // Add all active users
        const activeUsers = this.users.filter(user => user.isActive);
        activeUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            const roleName = this.roleDefinitions[user.role]?.name || user.role;
            option.textContent = `${user.displayName} (${roleName})`;
            userSelect.appendChild(option);
        });
        
        // Set current selection
        userSelect.value = this.currentUserId;
    }

    // Setup Form Tabs
    setupFormTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                btn.classList.add('active');
                document.getElementById(targetTab + '-tab').classList.add('active');
            });
        });
    }

    // Setup Editable Company Name (only for root-admin)
    setupEditableCompanyName() {
        const companyNameElement = document.getElementById('companyName');
        const editCompanyBtn = document.getElementById('editCompanyBtn');
        if (!companyNameElement) return;
        
        // Load saved company name from localStorage
        const savedCompanyName = localStorage.getItem('qhse_company_name');
        if (savedCompanyName) {
            companyNameElement.textContent = savedCompanyName;
        }
        
        // Only allow editing for root-admin
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'root-admin') {
            if (editCompanyBtn) {
                editCompanyBtn.style.display = 'none';
            }
            return;
        }
        
        function startEditing() {
            // Double check permissions
            const user = dashboard.getCurrentUser();
            if (!user || user.role !== 'root-admin') {
                alert('Nur der System Administrator kann den Firmennamen ändern.');
                return;
            }
            
            const currentName = companyNameElement.textContent;
            
            // Create input element
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.className = 'company-name-input';
            
            // Replace h2 with input temporarily
            companyNameElement.style.display = 'none';
            if (editCompanyBtn) editCompanyBtn.style.display = 'none';
            companyNameElement.parentNode.insertBefore(input, companyNameElement);
            input.focus();
            input.select();
            
            // Save on blur or enter
            function saveCompanyName() {
                const newName = input.value.trim();
                if (newName && newName !== currentName) {
                    companyNameElement.textContent = newName;
                    localStorage.setItem('qhse_company_name', newName);
                    // Update settings input as well
                    const settingsInput = document.getElementById('settingsCompanyName');
                    if (settingsInput) {
                        settingsInput.value = newName;
                    }
                }
                input.remove();
                companyNameElement.style.display = '';
                if (editCompanyBtn) editCompanyBtn.style.display = '';
            }
            
            input.addEventListener('blur', saveCompanyName);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveCompanyName();
                }
                if (e.key === 'Escape') {
                    input.remove();
                    companyNameElement.style.display = '';
                    if (editCompanyBtn) editCompanyBtn.style.display = '';
                }
            });
        }
        
        // Add click listeners to both the name and the edit button
        companyNameElement.addEventListener('click', startEditing);
        if (editCompanyBtn) {
            editCompanyBtn.addEventListener('click', startEditing);
        }
    }

    // Setup Settings Management
    setupSettings() {
        // Company Name Settings
        const saveCompanyNameBtn = document.getElementById('saveCompanyNameBtn');
        const resetCompanyNameBtn = document.getElementById('resetCompanyNameBtn');
        const settingsCompanyName = document.getElementById('settingsCompanyName');
        
        // Dashboard Name Settings
        const saveDashboardNameBtn = document.getElementById('saveDashboardNameBtn');
        const resetDashboardNameBtn = document.getElementById('resetDashboardNameBtn');
        const settingsDashboardName = document.getElementById('settingsDashboardName');
        
        // Initialize Company Name Settings
        if (saveCompanyNameBtn && resetCompanyNameBtn && settingsCompanyName) {
            // Load current company name
            const savedCompanyName = localStorage.getItem('qhse_company_name') || 'Hoffmann & Voss';
            settingsCompanyName.value = savedCompanyName;
            
            // Save company name
            saveCompanyNameBtn.addEventListener('click', () => {
                const currentUser = this.getCurrentUser();
                if (!currentUser || currentUser.role !== 'root-admin') {
                    alert('Nur der System Administrator kann Einstellungen ändern.');
                    return;
                }
                
                const newName = settingsCompanyName.value.trim();
                if (newName) {
                    localStorage.setItem('qhse_company_name', newName);
                    
                    // Update sidebar company name
                    const companyNameElement = document.getElementById('companyName');
                    if (companyNameElement) {
                        companyNameElement.textContent = newName;
                    }
                    
                    alert('Firmenname erfolgreich gespeichert!');
                } else {
                    alert('Bitte geben Sie einen gültigen Firmennamen ein.');
                }
            });
            
            // Reset company name
            resetCompanyNameBtn.addEventListener('click', () => {
                const currentUser = this.getCurrentUser();
                if (!currentUser || currentUser.role !== 'root-admin') {
                    alert('Nur der System Administrator kann Einstellungen ändern.');
                    return;
                }
                
                if (confirm('Möchten Sie den Firmennamen auf "Hoffmann & Voss" zurücksetzen?')) {
                    const defaultName = 'Hoffmann & Voss';
                    localStorage.setItem('qhse_company_name', defaultName);
                    settingsCompanyName.value = defaultName;
                    
                    // Update sidebar company name
                    const companyNameElement = document.getElementById('companyName');
                    if (companyNameElement) {
                        companyNameElement.textContent = defaultName;
                    }
                    
                    alert('Firmenname wurde zurückgesetzt!');
                }
            });
        }
        
        // Initialize Dashboard Name Settings
        if (saveDashboardNameBtn && resetDashboardNameBtn && settingsDashboardName) {
            // Load current dashboard name
            const savedDashboardName = localStorage.getItem('qhse_dashboard_name') || 'Dashboard';
            settingsDashboardName.value = savedDashboardName;
            
            // Save dashboard name
            saveDashboardNameBtn.addEventListener('click', () => {
                const currentUser = this.getCurrentUser();
                if (!currentUser || currentUser.role !== 'root-admin') {
                    alert('Nur der System Administrator kann Einstellungen ändern.');
                    return;
                }
                
                const newName = settingsDashboardName.value.trim();
                if (newName) {
                    localStorage.setItem('qhse_dashboard_name', newName);
                    
                    // Update sidebar dashboard name
                    const dashboardMenuItem = document.querySelector('[data-section="dashboard"] span');
                    if (dashboardMenuItem) {
                        dashboardMenuItem.textContent = newName;
                    }
                    
                    // Update page title if currently on dashboard
                    if (this.currentSection === 'dashboard') {
                        const pageTitle = document.getElementById('pageTitle');
                        if (pageTitle) {
                            pageTitle.textContent = newName;
                        }
                    }
                    
                    alert('Dashboard-Bezeichnung erfolgreich gespeichert!');
                } else {
                    alert('Bitte geben Sie eine gültige Dashboard-Bezeichnung ein.');
                }
            });
            
            // Reset dashboard name
            resetDashboardNameBtn.addEventListener('click', () => {
                const currentUser = this.getCurrentUser();
                if (!currentUser || currentUser.role !== 'root-admin') {
                    alert('Nur der System Administrator kann Einstellungen ändern.');
                    return;
                }
                
                if (confirm('Möchten Sie die Dashboard-Bezeichnung auf "Dashboard" zurücksetzen?')) {
                    const defaultName = 'Dashboard';
                    localStorage.setItem('qhse_dashboard_name', defaultName);
                    settingsDashboardName.value = defaultName;
                    
                    // Update sidebar dashboard name
                    const dashboardMenuItem = document.querySelector('[data-section="dashboard"] span');
                    if (dashboardMenuItem) {
                        dashboardMenuItem.textContent = defaultName;
                    }
                    
                    // Update page title if currently on dashboard
                    if (this.currentSection === 'dashboard') {
                        const pageTitle = document.getElementById('pageTitle');
                        if (pageTitle) {
                            pageTitle.textContent = defaultName;
                        }
                    }
                    
                    alert('Dashboard-Bezeichnung wurde zurückgesetzt!');
                }
            });
        }
    }

    // Load custom labels on startup
    loadCustomLabels() {
        // Load custom dashboard name
        const savedDashboardName = localStorage.getItem('qhse_dashboard_name');
        if (savedDashboardName) {
            const dashboardMenuItem = document.querySelector('[data-section="dashboard"] span');
            if (dashboardMenuItem) {
                dashboardMenuItem.textContent = savedDashboardName;
            }
        }
    }

    // Areas Management
    loadAreasFromStorage() {
        const stored = localStorage.getItem('qhse_areas');
        return stored ? JSON.parse(stored) : [];
    }

    saveAreasToStorage() {
        localStorage.setItem('qhse_areas', JSON.stringify(this.areas));
    }

    initializeDefaultAreas() {
        if (this.areas.length === 0) {
            const defaultAreas = [
                {
                    id: 'arbeitsschutz',
                    name: 'Arbeitsschutz',
                    icon: 'fas fa-hard-hat',
                    allowedRoles: ['geschaeftsfuehrung', 'betriebsleiter', 'abteilungsleiter', 'qhse', 'mitarbeiter', 'admin', 'root-admin'],
                    isDefault: true
                },
                {
                    id: 'qualitaet',
                    name: 'Qualität',
                    icon: 'fas fa-medal',
                    allowedRoles: ['geschaeftsfuehrung', 'betriebsleiter', 'abteilungsleiter', 'qhse', 'admin', 'root-admin'],
                    isDefault: true
                },
                {
                    id: 'umwelt',
                    name: 'Umwelt',
                    icon: 'fas fa-leaf',
                    allowedRoles: ['geschaeftsfuehrung', 'betriebsleiter', 'abteilungsleiter', 'qhse', 'admin', 'root-admin'],
                    isDefault: true
                },
                {
                    id: 'datenschutz',
                    name: 'Datenschutz',
                    icon: 'fas fa-shield-alt',
                    allowedRoles: ['geschaeftsfuehrung', 'qhse', 'admin', 'root-admin'],
                    isDefault: true
                },
                {
                    id: 'gesundheit',
                    name: 'Gesundheit',
                    icon: 'fas fa-heartbeat',
                    allowedRoles: ['geschaeftsfuehrung', 'betriebsleiter', 'abteilungsleiter', 'qhse', 'mitarbeiter', 'admin', 'root-admin'],
                    isDefault: true
                }
            ];
            this.areas = defaultAreas;
            this.saveAreasToStorage();
        }
    }

    setupAreaManagement() {
        const addAreaBtn = document.getElementById('addAreaBtn');
        const saveAreaBtn = document.getElementById('saveAreaBtn');
        const cancelAreaBtn = document.getElementById('cancelAreaBtn');
        const closeAreaModal = document.getElementById('closeAreaModal');
        
        if (addAreaBtn) {
            addAreaBtn.addEventListener('click', () => {
                this.openAreaEditor();
            });
        }
        
        if (saveAreaBtn) {
            saveAreaBtn.addEventListener('click', () => {
                this.saveArea();
            });
        }
        
        [cancelAreaBtn, closeAreaModal].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    document.getElementById('areaManagementModal').style.display = 'none';
                });
            }
        });
    }

    renderAreasList() {
        const areasList = document.getElementById('areasList');
        if (!areasList) return;
        
        areasList.innerHTML = '';
        
        this.areas.forEach(area => {
            const areaElement = this.createAreaElement(area);
            areasList.appendChild(areaElement);
        });
    }

    createAreaElement(area) {
        const areaDiv = document.createElement('div');
        areaDiv.className = 'area-item';
        
        const roleChips = area.allowedRoles.map(role => 
            `<span class="role-chip">${this.roleDefinitions[role]?.name || role}</span>`
        ).join('');
        
        areaDiv.innerHTML = `
            <div class="area-icon">
                <i class="${area.icon}"></i>
            </div>
            <div class="area-info">
                <div class="area-name">${area.name}</div>
                <div class="area-roles">${roleChips}</div>
            </div>
            <div class="area-item-actions">
                <button class="edit-area-btn" onclick="dashboard.editArea('${area.id}')">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
                ${!area.isDefault ? `
                    <button class="delete-area-btn" onclick="dashboard.deleteArea('${area.id}')">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                ` : `
                    <button class="delete-area-btn" disabled title="Standard-Bereich kann nicht gelöscht werden">
                        <i class="fas fa-shield-alt"></i> Geschützt
                    </button>
                `}
            </div>
        `;
        
        return areaDiv;
    }

    openAreaEditor(areaId = null) {
        const modal = document.getElementById('areaManagementModal');
        const titleElement = document.getElementById('areaModalTitle');
        
        if (areaId) {
            const area = this.areas.find(a => a.id === areaId);
            titleElement.textContent = 'Bereich bearbeiten';
            document.getElementById('newAreaName').value = area.name;
            document.getElementById('newAreaIcon').value = area.icon;
            
            // Set checkboxes
            const checkboxes = document.querySelectorAll('input[name="areaRoles"]');
            checkboxes.forEach(cb => {
                cb.checked = area.allowedRoles.includes(cb.value);
            });
            
            document.getElementById('editAreaId').value = area.id;
        } else {
            titleElement.textContent = 'Neuen Bereich hinzufügen';
            document.getElementById('areaForm').reset();
            document.getElementById('editAreaId').value = '';
        }
        
        modal.style.display = 'block';
    }

    saveArea() {
        const form = document.getElementById('areaForm');
        const formData = new FormData(form);
        const areaId = document.getElementById('editAreaId').value;
        
        const selectedRoles = Array.from(document.querySelectorAll('input[name="areaRoles"]:checked'))
            .map(cb => cb.value);
        
        const areaData = {
            name: formData.get('areaName'),
            icon: formData.get('areaIcon'),
            allowedRoles: selectedRoles
        };
        
        if (areaId) {
            const areaIndex = this.areas.findIndex(a => a.id === areaId);
            if (areaIndex !== -1) {
                this.areas[areaIndex] = { ...this.areas[areaIndex], ...areaData };
            }
        } else {
            const newArea = {
                id: 'area_' + Date.now(),
                ...areaData,
                isDefault: false
            };
            this.areas.push(newArea);
        }
        
        this.saveAreasToStorage();
        this.renderAreasList();
        this.renderDynamicAreas();
        this.updateMenuVisibility();
        this.populateDocumentCategories();
        document.getElementById('areaManagementModal').style.display = 'none';
        
        alert(areaId ? 'Bereich erfolgreich aktualisiert!' : 'Bereich erfolgreich hinzugefügt!');
    }

    editArea(areaId) {
        this.openAreaEditor(areaId);
    }

    deleteArea(areaId) {
        const area = this.areas.find(a => a.id === areaId);
        if (!area || area.isDefault) {
            alert('Dieser Bereich kann nicht gelöscht werden.');
            return;
        }
        
        if (confirm(`Möchten Sie den Bereich "${area.name}" wirklich löschen?`)) {
            this.areas = this.areas.filter(a => a.id !== areaId);
            this.saveAreasToStorage();
            this.renderAreasList();
            this.renderDynamicAreas();
            this.updateMenuVisibility();
            this.populateDocumentCategories();
            alert('Bereich erfolgreich gelöscht!');
        }
    }

    renderDynamicAreas() {
        const menuItems = document.querySelector('.menu-items');
        
        // Remove existing dynamic areas
        const existingDynamicAreas = menuItems.querySelectorAll('.dynamic-area');
        existingDynamicAreas.forEach(item => item.remove());
        
        // Add current dynamic areas after dashboard
        const dashboardItem = menuItems.querySelector('[data-section="dashboard"]');
        this.areas.forEach(area => {
            const menuItem = document.createElement('li');
            menuItem.className = 'menu-item dynamic-area';
            menuItem.setAttribute('data-section', area.id);
            menuItem.innerHTML = `
                <i class="${area.icon}"></i>
                <span>${area.name}</span>
            `;
            
            // Add event listener for navigation
            menuItem.addEventListener('click', () => {
                this.handleAreaNavigation(area.id);
            });
            
            dashboardItem.parentNode.insertBefore(menuItem, dashboardItem.nextSibling);
        });
    }

    // Departments Management
    loadDepartmentsFromStorage() {
        const stored = localStorage.getItem('qhse_departments');
        return stored ? JSON.parse(stored) : [];
    }

    saveDepartmentsToStorage() {
        localStorage.setItem('qhse_departments', JSON.stringify(this.departments));
    }

    initializeDefaultDepartments() {
        if (this.departments.length === 0) {
            const defaultDepartments = [
                {
                    id: 'geschaeftsfuehrung',
                    name: 'Geschäftsführung',
                    code: 'GF',
                    description: 'Geschäftsführung und strategische Leitung',
                    type: 'management',
                    hierarchyLevel: 1
                },
                {
                    id: 'betriebsleitung',
                    name: 'Betriebsleitung',
                    code: 'BL',
                    description: 'Operative Leitung der Produktionsbereiche',
                    type: 'management',
                    hierarchyLevel: 2
                },
                {
                    id: 'qhse',
                    name: 'QHSE Management',
                    code: 'QHSE',
                    description: 'Qualität, Gesundheit, Sicherheit, Umwelt',
                    type: 'quality',
                    hierarchyLevel: 2,
                    isStaffPosition: true
                },
                {
                    id: 'produktion',
                    name: 'Produktion',
                    code: 'PROD',
                    description: 'Kunststoffproduktion und Fertigung',
                    type: 'production',
                    hierarchyLevel: 3
                },
                {
                    id: 'vertrieb',
                    name: 'Vertrieb',
                    code: 'VERT',
                    description: 'Verkauf und Kundenbetreuung',
                    type: 'administration',
                    hierarchyLevel: 3
                },
                {
                    id: 'personal',
                    name: 'Personalabteilung',
                    code: 'HR',
                    description: 'Personalwesen und -entwicklung',
                    type: 'administration',
                    hierarchyLevel: 3
                },
                {
                    id: 'labor',
                    name: 'Labor',
                    code: 'LAB',
                    description: 'Qualitätsprüfung und Materialanalyse',
                    type: 'quality',
                    hierarchyLevel: 3
                },
                {
                    id: 'administration',
                    name: 'Administration',
                    code: 'ADM',
                    description: 'IT und allgemeine Verwaltung',
                    type: 'administration',
                    hierarchyLevel: 3
                },
                {
                    id: 'facility',
                    name: 'Facility Management',
                    code: 'FM',
                    description: 'Gebäude- und Anlagenbetreuung',
                    type: 'support',
                    hierarchyLevel: 4
                },
                {
                    id: 'instandhaltung',
                    name: 'Instandhaltung',
                    code: 'IH',
                    description: 'Wartung und Instandhaltung von Maschinen und Anlagen',
                    type: 'technical',
                    hierarchyLevel: 3
                }
            ];
            this.departments = defaultDepartments;
            this.saveDepartmentsToStorage();
        }
    }

    setupDepartmentManagement() {
        const addDepartmentBtn = document.getElementById('addDepartmentBtn');
        const saveDepartmentBtn = document.getElementById('saveDepartmentBtn');
        const cancelDepartmentBtn = document.getElementById('cancelDepartmentBtn');
        const closeDepartmentModal = document.getElementById('closeDepartmentModal');
        
        if (addDepartmentBtn) {
            addDepartmentBtn.addEventListener('click', () => {
                this.openDepartmentEditor();
            });
        }
        
        if (saveDepartmentBtn) {
            saveDepartmentBtn.addEventListener('click', () => {
                this.saveDepartment();
            });
        }
        
        [cancelDepartmentBtn, closeDepartmentModal].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    document.getElementById('departmentManagementModal').style.display = 'none';
                });
            }
        });
    }

    renderDepartmentsList() {
        const departmentsList = document.getElementById('departmentsList');
        if (!departmentsList) return;
        
        departmentsList.innerHTML = '';
        
        this.departments.forEach(department => {
            const departmentElement = this.createDepartmentElement(department);
            departmentsList.appendChild(departmentElement);
        });
    }

    createDepartmentElement(department) {
        const departmentDiv = document.createElement('div');
        departmentDiv.className = 'department-item';
        
        const typeNames = {
            production: 'Produktion',
            administration: 'Verwaltung',
            support: 'Support/Service',
            management: 'Management',
            quality: 'Qualität/QHSE'
        };
        
        departmentDiv.innerHTML = `
            <div class="department-icon">
                <i class="fas fa-building"></i>
            </div>
            <div class="department-info">
                <div class="department-name">${department.name} (${department.code})</div>
                <div class="department-details">
                    <span class="department-chip">${typeNames[department.type]}</span>
                    <span class="department-chip">Level ${department.hierarchyLevel}</span>
                    ${department.isStaffPosition ? '<span class="department-chip">Stabsstelle</span>' : ''}
                </div>
                <div class="department-description">${department.description}</div>
            </div>
            <div class="department-item-actions">
                <button class="edit-department-btn" onclick="dashboard.editDepartment('${department.id}')">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
                <button class="delete-department-btn" onclick="dashboard.deleteDepartment('${department.id}')">
                    <i class="fas fa-trash"></i> Löschen
                </button>
            </div>
        `;
        
        return departmentDiv;
    }

    openDepartmentEditor(departmentId = null) {
        const modal = document.getElementById('departmentManagementModal');
        const titleElement = document.getElementById('departmentModalTitle');
        
        if (departmentId) {
            const department = this.departments.find(d => d.id === departmentId);
            titleElement.textContent = 'Abteilung bearbeiten';
            document.getElementById('newDepartmentName').value = department.name;
            document.getElementById('newDepartmentCode').value = department.code;
            document.getElementById('newDepartmentDescription').value = department.description;
            document.getElementById('newDepartmentType').value = department.type;
            document.getElementById('editDepartmentId').value = department.id;
        } else {
            titleElement.textContent = 'Neue Abteilung hinzufügen';
            document.getElementById('departmentForm').reset();
            document.getElementById('editDepartmentId').value = '';
        }
        
        modal.style.display = 'block';
    }

    saveDepartment() {
        const form = document.getElementById('departmentForm');
        const formData = new FormData(form);
        const departmentId = document.getElementById('editDepartmentId').value;
        
        const departmentData = {
            name: formData.get('departmentName'),
            code: formData.get('departmentCode'),
            description: formData.get('departmentDescription'),
            type: formData.get('departmentType')
        };
        
        if (departmentId) {
            const departmentIndex = this.departments.findIndex(d => d.id === departmentId);
            if (departmentIndex !== -1) {
                this.departments[departmentIndex] = { ...this.departments[departmentIndex], ...departmentData };
            }
        } else {
            const newDepartment = {
                id: 'dept_' + Date.now(),
                ...departmentData,
                hierarchyLevel: 3 // Default level for new departments
            };
            this.departments.push(newDepartment);
        }
        
        this.saveDepartmentsToStorage();
        this.renderDepartmentsList();
        this.populateDepartmentDropdowns();
        document.getElementById('departmentManagementModal').style.display = 'none';
        
        alert(departmentId ? 'Abteilung erfolgreich aktualisiert!' : 'Abteilung erfolgreich hinzugefügt!');
    }

    editDepartment(departmentId) {
        this.openDepartmentEditor(departmentId);
    }

    deleteDepartment(departmentId) {
        const department = this.departments.find(d => d.id === departmentId);
        if (!department) return;
        
        if (confirm(`Möchten Sie die Abteilung "${department.name}" wirklich löschen?`)) {
            this.departments = this.departments.filter(d => d.id !== departmentId);
            this.saveDepartmentsToStorage();
            this.renderDepartmentsList();
            this.populateDepartmentDropdowns();
            alert('Abteilung erfolgreich gelöscht!');
        }
    }

    populateDepartmentDropdowns() {
        const departmentSelect = document.getElementById('newUserDepartment');
        if (!departmentSelect) return;
        
        departmentSelect.innerHTML = '<option value="">Abteilung wählen</option>';
        
        this.departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department.id;
            option.textContent = `${department.name} (${department.code})`;
            departmentSelect.appendChild(option);
        });
    }

    populateDocumentCategories() {
        const categorySelect = document.getElementById('documentCategory');
        if (!categorySelect) return;
        
        categorySelect.innerHTML = '<option value="">Kategorie wählen</option>';
        
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;
        
        // Add only areas that the current user has access to
        this.areas.filter(area => 
            area.allowedRoles && area.allowedRoles.includes(currentUser.role)
        ).forEach(area => {
            const option = document.createElement('option');
            option.value = area.id;
            option.textContent = area.name;
            categorySelect.appendChild(option);
        });
    }

    handleAreaNavigation(areaId) {
        const area = this.areas.find(a => a.id === areaId);
        if (!area) return;
        
        // Check if user has access to this area
        const currentUser = this.getCurrentUser();
        if (!currentUser || !area.allowedRoles.includes(currentUser.role)) {
            this.showAccessDenied();
            return;
        }
        
        // Create or show area section
        let areaSection = document.getElementById(areaId + '-section');
        if (!areaSection) {
            areaSection = document.createElement('section');
            areaSection.id = areaId + '-section';
            areaSection.className = 'content-section';
            areaSection.innerHTML = `
                <div class="section-content">
                    <h2>${area.name}</h2>
                    <p>Dokumente und Informationen zum Bereich ${area.name}</p>
                </div>
            `;
            document.querySelector('.content-body').appendChild(areaSection);
        }
        
        // Handle section switching (same as existing navigation)
        const sections = document.querySelectorAll('.content-section');
        const menuItems = document.querySelectorAll('.menu-item');
        
        sections.forEach(section => section.classList.remove('active'));
        menuItems.forEach(item => item.classList.remove('active'));
        
        areaSection.classList.add('active');
        document.querySelector(`[data-section="${areaId}"]`).classList.add('active');
        
        document.getElementById('pageTitle').textContent = area.name;
        this.currentSection = areaId;
    }

    // Time Tracking Management
    loadTimeEntriesFromStorage() {
        const stored = localStorage.getItem('qhse_time_entries');
        return stored ? JSON.parse(stored) : [];
    }

    saveTimeEntriesToStorage() {
        localStorage.setItem('qhse_time_entries', JSON.stringify(this.timeEntries));
    }

    setupTimeTracking() {
        this.setupTimeForm();
        this.setupTimeModal();
        this.setupMonthNavigation();
        this.initializeTimeView();
    }

    setupTimeForm() {
        const timeForm = document.getElementById('timeTrackingForm');
        const clearFormBtn = document.getElementById('clearFormBtn');
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        const breakTimeInput = document.getElementById('breakTime');
        const workHoursInput = document.getElementById('workHours');
        const workDateInput = document.getElementById('workDate');

        if (!timeForm) return;

        // Set default date to today
        if (workDateInput) {
            workDateInput.value = new Date().toISOString().split('T')[0];
        }

        // Auto-calculate work hours
        const calculateWorkHours = () => {
            if (startTimeInput.value && endTimeInput.value) {
                const start = new Date(`1970-01-01T${startTimeInput.value}`);
                const end = new Date(`1970-01-01T${endTimeInput.value}`);
                const breakMinutes = parseInt(breakTimeInput.value) || 0;
                
                const diffMs = end - start;
                const diffMinutes = Math.floor(diffMs / 60000) - breakMinutes;
                
                if (diffMinutes > 0) {
                    const hours = Math.floor(diffMinutes / 60);
                    const minutes = diffMinutes % 60;
                    workHoursInput.value = `${hours}:${minutes.toString().padStart(2, '0')} h`;
                } else {
                    workHoursInput.value = '0:00 h';
                }
            }
        };

        startTimeInput.addEventListener('change', calculateWorkHours);
        endTimeInput.addEventListener('change', calculateWorkHours);
        breakTimeInput.addEventListener('input', calculateWorkHours);

        // Form submission
        timeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTimeEntry();
        });

        // Clear form
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => {
                timeForm.reset();
                workDateInput.value = new Date().toISOString().split('T')[0];
                workHoursInput.value = '';
            });
        }
    }

    saveTimeEntry() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const workDate = document.getElementById('workDate').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const breakTime = parseInt(document.getElementById('breakTime').value) || 0;
        const workDescription = document.getElementById('workDescription').value;

        if (!workDate || !startTime || !endTime) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        // Check if entry for this date already exists
        const existingEntry = this.timeEntries.find(entry => 
            entry.userId === currentUser.id && 
            entry.date === workDate
        );

        if (existingEntry) {
            if (!confirm('Für dieses Datum existiert bereits ein Eintrag. Möchten Sie ihn überschreiben?')) {
                return;
            }
            // Remove existing entry
            this.timeEntries = this.timeEntries.filter(entry => 
                !(entry.userId === currentUser.id && entry.date === workDate)
            );
        }

        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        const workMinutes = Math.floor((end - start) / 60000) - breakTime;

        const timeEntry = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.displayName,
            date: workDate,
            startTime: startTime,
            endTime: endTime,
            breakTime: breakTime,
            workMinutes: workMinutes,
            description: workDescription,
            createdAt: new Date().toISOString(),
            isEditable: true
        };

        this.timeEntries.push(timeEntry);
        this.saveTimeEntriesToStorage();
        this.refreshTimeView();
        
        // Clear form
        document.getElementById('timeTrackingForm').reset();
        document.getElementById('workDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('workHours').value = '';

        alert('Zeiteintrag erfolgreich gespeichert!');
    }

    setupTimeModal() {
        const modal = document.getElementById('timeEntryModal');
        const closeBtn = document.getElementById('closeTimeEntryModal');
        const cancelBtn = document.getElementById('cancelTimeEntryBtn');
        const saveBtn = document.getElementById('saveTimeEntryBtn');
        const deleteBtn = document.getElementById('deleteTimeEntryBtn');

        if (!modal) return;

        [closeBtn, cancelBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }
        });

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveEditedTimeEntry();
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteTimeEntry();
            });
        }

        // Auto-calculate work hours in modal
        const editStartTime = document.getElementById('editStartTime');
        const editEndTime = document.getElementById('editEndTime');
        const editBreakTime = document.getElementById('editBreakTime');
        const editWorkHours = document.getElementById('editWorkHours');

        const calculateEditWorkHours = () => {
            if (editStartTime.value && editEndTime.value) {
                const start = new Date(`1970-01-01T${editStartTime.value}`);
                const end = new Date(`1970-01-01T${editEndTime.value}`);
                const breakMinutes = parseInt(editBreakTime.value) || 0;
                
                const diffMs = end - start;
                const diffMinutes = Math.floor(diffMs / 60000) - breakMinutes;
                
                if (diffMinutes > 0) {
                    const hours = Math.floor(diffMinutes / 60);
                    const minutes = diffMinutes % 60;
                    editWorkHours.value = `${hours}:${minutes.toString().padStart(2, '0')} h`;
                } else {
                    editWorkHours.value = '0:00 h';
                }
            }
        };

        if (editStartTime) editStartTime.addEventListener('change', calculateEditWorkHours);
        if (editEndTime) editEndTime.addEventListener('change', calculateEditWorkHours);
        if (editBreakTime) editBreakTime.addEventListener('input', calculateEditWorkHours);
    }

    setupMonthNavigation() {
        const prevBtn = document.getElementById('prevMonthBtn');
        const nextBtn = document.getElementById('nextMonthBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
                this.updateMonthDisplay();
                this.refreshTimeView();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.updateMonthDisplay();
                this.refreshTimeView();
            });
        }
    }

    initializeTimeView() {
        this.updateMonthDisplay();
        this.refreshTimeView();
        this.setupEvaluationControls();
    }

    updateMonthDisplay() {
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        
        const currentMonthElement = document.getElementById('currentMonth');
        if (currentMonthElement) {
            currentMonthElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }
    }

    refreshTimeView() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        // Get entries for current user and month
        const userEntries = this.timeEntries.filter(entry => 
            entry.userId === currentUser.id &&
            new Date(entry.date).getMonth() === this.currentMonth &&
            new Date(entry.date).getFullYear() === this.currentYear
        );

        this.updateMonthlyStats(userEntries);
        this.renderTimeEntries(userEntries);
    }

    updateMonthlyStats(entries) {
        const totalMinutes = entries.reduce((sum, entry) => sum + entry.workMinutes, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        
        const workingDays = entries.length;
        const averageMinutes = workingDays > 0 ? totalMinutes / workingDays : 0;
        const avgHours = Math.floor(averageMinutes / 60);
        const avgMins = Math.floor(averageMinutes % 60);

        // Assuming 8 hours per day as standard
        const expectedMinutes = workingDays * 8 * 60;
        const overtimeMinutes = totalMinutes - expectedMinutes;
        const overtimeHours = Math.floor(Math.abs(overtimeMinutes) / 60);
        const overtimeMins = Math.abs(overtimeMinutes) % 60;

        document.getElementById('monthlyHours').textContent = `${totalHours}:${remainingMinutes.toString().padStart(2, '0')}`;
        document.getElementById('workingDays').textContent = workingDays;
        document.getElementById('averageHours').textContent = `${avgHours}:${avgMins.toString().padStart(2, '0')}`;
        
        const overtimeSign = overtimeMinutes >= 0 ? '+' : '-';
        document.getElementById('overtime').textContent = `${overtimeSign}${overtimeHours}:${overtimeMins.toString().padStart(2, '0')}`;
    }

    renderTimeEntries(entries) {
        const container = document.getElementById('timeEntriesList');
        if (!container) return;

        if (entries.length === 0) {
            container.innerHTML = '<p class="no-entries">Keine Zeiteinträge für diesen Monat.</p>';
            return;
        }

        // Sort by date
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        const entriesHtml = entries.map(entry => {
            const date = new Date(entry.date);
            const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('de-DE');
            const hours = Math.floor(entry.workMinutes / 60);
            const minutes = entry.workMinutes % 60;

            return `
                <div class="time-entry-item" onclick="dashboard.editTimeEntry('${entry.id}')">
                    <div class="entry-date">
                        <div class="day-name">${dayName}</div>
                        <div class="date">${dateStr}</div>
                    </div>
                    <div class="entry-times">
                        <div class="time-range">${entry.startTime} - ${entry.endTime}</div>
                        <div class="work-time">${hours}:${minutes.toString().padStart(2, '0')} h</div>
                    </div>
                    <div class="entry-description">${entry.description || 'Keine Beschreibung'}</div>
                    <div class="entry-actions">
                        <i class="fas fa-edit"></i>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = entriesHtml;
    }

    editTimeEntry(entryId) {
        const entry = this.timeEntries.find(e => e.id === entryId);
        if (!entry) return;

        const currentUser = this.getCurrentUser();
        if (!currentUser || entry.userId !== currentUser.id) {
            alert('Sie können nur Ihre eigenen Zeiteinträge bearbeiten.');
            return;
        }

        // Populate modal
        document.getElementById('editWorkDate').value = entry.date;
        document.getElementById('editStartTime').value = entry.startTime;
        document.getElementById('editEndTime').value = entry.endTime;
        document.getElementById('editBreakTime').value = entry.breakTime;
        document.getElementById('editWorkDescription').value = entry.description || '';
        document.getElementById('editTimeEntryId').value = entry.id;

        // Calculate work hours
        const hours = Math.floor(entry.workMinutes / 60);
        const minutes = entry.workMinutes % 60;
        document.getElementById('editWorkHours').value = `${hours}:${minutes.toString().padStart(2, '0')} h`;

        // Show modal
        document.getElementById('timeEntryModal').style.display = 'block';
    }

    saveEditedTimeEntry() {
        const entryId = document.getElementById('editTimeEntryId').value;
        const entry = this.timeEntries.find(e => e.id === entryId);
        if (!entry) return;

        const workDate = document.getElementById('editWorkDate').value;
        const startTime = document.getElementById('editStartTime').value;
        const endTime = document.getElementById('editEndTime').value;
        const breakTime = parseInt(document.getElementById('editBreakTime').value) || 0;
        const workDescription = document.getElementById('editWorkDescription').value;

        if (!workDate || !startTime || !endTime) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        const workMinutes = Math.floor((end - start) / 60000) - breakTime;

        // Update entry
        entry.date = workDate;
        entry.startTime = startTime;
        entry.endTime = endTime;
        entry.breakTime = breakTime;
        entry.workMinutes = workMinutes;
        entry.description = workDescription;

        this.saveTimeEntriesToStorage();
        this.refreshTimeView();
        document.getElementById('timeEntryModal').style.display = 'none';
        
        alert('Zeiteintrag erfolgreich aktualisiert!');
    }

    deleteTimeEntry() {
        const entryId = document.getElementById('editTimeEntryId').value;
        
        if (confirm('Möchten Sie diesen Zeiteintrag wirklich löschen?')) {
            this.timeEntries = this.timeEntries.filter(e => e.id !== entryId);
            this.saveTimeEntriesToStorage();
            this.refreshTimeView();
            document.getElementById('timeEntryModal').style.display = 'none';
            
            alert('Zeiteintrag wurde gelöscht!');
        }
    }

    setupEvaluationControls() {
        if (!this.hasPermission('canViewAllTimeEntries')) return;

        // Populate employee dropdown
        const evalEmployeeSelect = document.getElementById('evalEmployee');
        if (evalEmployeeSelect) {
            evalEmployeeSelect.innerHTML = '<option value="">Alle Mitarbeiter</option>';
            this.users.filter(user => user.isActive).forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.displayName;
                evalEmployeeSelect.appendChild(option);
            });
        }

        // Populate department dropdown
        const evalDepartmentSelect = document.getElementById('evalDepartment');
        if (evalDepartmentSelect) {
            evalDepartmentSelect.innerHTML = '<option value="">Alle Abteilungen</option>';
            this.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                evalDepartmentSelect.appendChild(option);
            });
        }

        // Set current month
        const evalMonthInput = document.getElementById('evalMonth');
        if (evalMonthInput) {
            const currentDate = new Date();
            const monthStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
            evalMonthInput.value = monthStr;
        }

        // Setup generate report button
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.generateTimeReport();
            });
        }
    }

    generateTimeReport() {
        const employeeId = document.getElementById('evalEmployee').value;
        const monthInput = document.getElementById('evalMonth').value;
        const departmentId = document.getElementById('evalDepartment').value;

        if (!monthInput) {
            alert('Bitte wählen Sie einen Monat aus.');
            return;
        }

        const [year, month] = monthInput.split('-');
        const reportMonth = parseInt(month) - 1; // JavaScript months are 0-based
        const reportYear = parseInt(year);

        let filteredEntries = this.timeEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === reportMonth && entryDate.getFullYear() === reportYear;
        });

        if (employeeId) {
            filteredEntries = filteredEntries.filter(entry => entry.userId === employeeId);
        }

        if (departmentId) {
            const departmentUsers = this.users.filter(user => user.department === departmentId);
            const departmentUserIds = departmentUsers.map(user => user.id);
            filteredEntries = filteredEntries.filter(entry => departmentUserIds.includes(entry.userId));
        }

        this.renderEvaluationResults(filteredEntries, reportMonth, reportYear);
    }

    renderEvaluationResults(entries, month, year) {
        const resultsContainer = document.getElementById('evaluationResults');
        if (!resultsContainer) return;

        if (entries.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">Keine Daten für den ausgewählten Zeitraum gefunden.</p>';
            return;
        }

        // Group by user
        const userGroups = {};
        entries.forEach(entry => {
            if (!userGroups[entry.userId]) {
                userGroups[entry.userId] = {
                    userName: entry.userName,
                    entries: [],
                    totalMinutes: 0
                };
            }
            userGroups[entry.userId].entries.push(entry);
            userGroups[entry.userId].totalMinutes += entry.workMinutes;
        });

        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];

        let resultsHtml = `
            <div class="report-header">
                <h3>Zeiterfassungsauswertung für ${monthNames[month]} ${year}</h3>
                <div class="report-summary">
                    <div class="summary-item">
                        <span class="label">Mitarbeiter:</span>
                        <span class="value">${Object.keys(userGroups).length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Gesamt-Einträge:</span>
                        <span class="value">${entries.length}</span>
                    </div>
                </div>
            </div>
            <div class="evaluation-table">
                <table>
                    <thead>
                        <tr>
                            <th>Mitarbeiter</th>
                            <th>Arbeitstage</th>
                            <th>Gesamtstunden</th>
                            <th>Ø Stunden/Tag</th>
                            <th>Über-/Unterstunden</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        Object.values(userGroups).forEach(group => {
            const totalHours = Math.floor(group.totalMinutes / 60);
            const totalMins = group.totalMinutes % 60;
            const workingDays = group.entries.length;
            const avgMinutes = workingDays > 0 ? group.totalMinutes / workingDays : 0;
            const avgHours = Math.floor(avgMinutes / 60);
            const avgMins = Math.floor(avgMinutes % 60);
            
            const expectedMinutes = workingDays * 8 * 60; // 8 hours per day
            const overtimeMinutes = group.totalMinutes - expectedMinutes;
            const overtimeHours = Math.floor(Math.abs(overtimeMinutes) / 60);
            const overtimeMins = Math.abs(overtimeMinutes) % 60;
            const overtimeSign = overtimeMinutes >= 0 ? '+' : '-';

            resultsHtml += `
                <tr>
                    <td>${group.userName}</td>
                    <td>${workingDays}</td>
                    <td>${totalHours}:${totalMins.toString().padStart(2, '0')}</td>
                    <td>${avgHours}:${avgMins.toString().padStart(2, '0')}</td>
                    <td class="${overtimeMinutes >= 0 ? 'overtime-positive' : 'overtime-negative'}">
                        ${overtimeSign}${overtimeHours}:${overtimeMins.toString().padStart(2, '0')}
                    </td>
                </tr>
            `;
        });

        resultsHtml += `
                    </tbody>
                </table>
            </div>
        `;

        resultsContainer.innerHTML = resultsHtml;
    }

    hasPermission(permission) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;
        
        const roleDefinition = this.roleDefinitions[currentUser.role];
        return roleDefinition && roleDefinition[permission] === true;
    }

    // Maintenance Management Methods
    loadMachinesFromStorage() {
        const stored = localStorage.getItem('qhse_machines');
        return stored ? JSON.parse(stored) : [];
    }

    saveMachinesToStorage() {
        localStorage.setItem('qhse_machines', JSON.stringify(this.machines));
    }

    loadMaintenanceTasksFromStorage() {
        const stored = localStorage.getItem('qhse_maintenance_tasks');
        return stored ? JSON.parse(stored) : [];
    }

    saveMaintenanceTasksToStorage() {
        localStorage.setItem('qhse_maintenance_tasks', JSON.stringify(this.maintenanceTasks));
    }

    loadIssuesFromStorage() {
        const stored = localStorage.getItem('qhse_issues');
        return stored ? JSON.parse(stored) : [];
    }

    saveIssuesToStorage() {
        localStorage.setItem('qhse_issues', JSON.stringify(this.issues));
    }

    setupMaintenanceManagement() {
        this.setupMachineManagement();
        this.setupMaintenancePlanning();
        this.setupIssueReporting();
        this.setupMaintenanceAnalysis();
        this.updateMaintenanceStats();
    }

    setupMachineManagement() {
        const addMachineBtn = document.getElementById('addMachineBtn');
        if (addMachineBtn) {
            addMachineBtn.addEventListener('click', () => this.showAddMachineModal());
        }
        this.renderMachinesList();
        this.updateMachineStats();
    }

    showAddMachineModal() {
        // Remove existing modals to prevent duplicate IDs
        const existingModal = document.getElementById('addMachineModal');
        if (existingModal) existingModal.remove();
        
        const modalHtml = `
            <div id="addMachineModal" class="modal active">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h2>Neue Maschine hinzufügen</h2>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="addMachineForm">
                            <div class="form-grid">
                                <div class="form-column">
                                    <h3>Grunddaten</h3>
                                    <div class="form-group">
                                        <label for="machineName">Maschinenname: *</label>
                                        <input type="text" id="machineName" required placeholder="z.B. Spritzgussmaschine A1">
                                    </div>
                                    <div class="form-group">
                                        <label for="machineType">Maschinentyp: *</label>
                                        <select id="machineType" required>
                                            <option value="">Typ auswählen</option>
                                            <option value="Spritzgussmaschine">Spritzgussmaschine</option>
                                            <option value="Extruder">Extruder</option>
                                            <option value="Blasformmaschine">Blasformmaschine</option>
                                            <option value="Thermoformmaschine">Thermoformmaschine</option>
                                            <option value="Mischanlage">Mischanlage</option>
                                            <option value="Schredder">Schredder</option>
                                            <option value="Granulator">Granulator</option>
                                            <option value="Kompressor">Kompressor</option>
                                            <option value="Kühlanlage">Kühlanlage</option>
                                            <option value="Andere">Andere</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="machineManufacturer">Hersteller:</label>
                                        <input type="text" id="machineManufacturer" placeholder="z.B. Arburg, Engel, Battenfeld">
                                    </div>
                                    <div class="form-group">
                                        <label for="machineModel">Modell:</label>
                                        <input type="text" id="machineModel" placeholder="Modellbezeichnung">
                                    </div>
                                    <div class="form-group">
                                        <label for="machineSerialNumber">Seriennummer:</label>
                                        <input type="text" id="machineSerialNumber" placeholder="Seriennummer">
                                    </div>
                                    <div class="form-group">
                                        <label for="machineYearBuilt">Baujahr:</label>
                                        <input type="number" id="machineYearBuilt" min="1990" max="${new Date().getFullYear()}" placeholder="z.B. 2020">
                                    </div>
                                </div>
                                
                                <div class="form-column">
                                    <h3>Standort & Organisation</h3>
                                    <div class="form-group">
                                        <label for="machineDepartment">Abteilung: *</label>
                                        <select id="machineDepartment" required>
                                            <option value="">Abteilung auswählen</option>
                                            ${this.departments && this.departments.length > 0 ? this.departments.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('') : '<option value="default">Keine Abteilungen verfügbar</option>'}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="machineLocation">Standort: *</label>
                                        <input type="text" id="machineLocation" required placeholder="z.B. Halle 1, Bereich A">
                                    </div>
                                    <div class="form-group">
                                        <label for="machineResponsible">Verantwortlicher:</label>
                                        <input type="text" id="machineResponsible" placeholder="Name des Verantwortlichen">
                                    </div>
                                    <div class="form-group">
                                        <label for="machineStatus">Aktueller Status: *</label>
                                        <select id="machineStatus" required>
                                            <option value="running">In Betrieb</option>
                                            <option value="maintenance">Wartung</option>
                                            <option value="issue">Störung</option>
                                            <option value="offline">Außer Betrieb</option>
                                        </select>
                                    </div>
                                    
                                    <h3>Technische Daten</h3>
                                    <div class="form-group">
                                        <label for="machinePower">Leistung (kW):</label>
                                        <input type="number" id="machinePower" step="0.1" placeholder="z.B. 15.5">
                                    </div>
                                    <div class="form-group">
                                        <label for="machineWeight">Gewicht (kg):</label>
                                        <input type="number" id="machineWeight" placeholder="z.B. 2500">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-full-width">
                                <h3>Wartung & Service</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="machineLastMaintenance">Letzte Wartung:</label>
                                        <input type="date" id="machineLastMaintenance">
                                    </div>
                                    <div class="form-group">
                                        <label for="machineNextMaintenance">Nächste Wartung:</label>
                                        <input type="date" id="machineNextMaintenance">
                                    </div>
                                    <div class="form-group">
                                        <label for="machineMaintenanceInterval">Wartungsintervall (Tage):</label>
                                        <input type="number" id="machineMaintenanceInterval" placeholder="z.B. 90" value="90">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="machineNotes">Bemerkungen:</label>
                                    <textarea id="machineNotes" rows="3" placeholder="Zusätzliche Informationen zur Maschine..."></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button onclick="dashboard.addMachine()" class="btn-primary">
                            <i class="fas fa-save"></i> Maschine speichern
                        </button>
                        <button onclick="this.closest('.modal').remove()" class="btn-secondary">
                            <i class="fas fa-times"></i> Abbrechen
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    addMachine() {
        console.log('addMachine() aufgerufen');
        
        // Validierung der Pflichtfelder
        const requiredFields = ['machineName', 'machineType', 'machineLocation', 'machineDepartment', 'machineStatus'];
        const missingFields = requiredFields.filter(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field ? field.value.trim() : '';
            console.log(`Field ${fieldId}: Element gefunden=${!!field}, Wert='${value}'`);
            return !field || !value;
        });

        console.log('Fehlende Felder:', missingFields);
        console.log('Verfügbare Abteilungen:', this.departments);

        if (missingFields.length > 0) {
            alert(`Bitte füllen Sie alle Pflichtfelder (*) aus.\nFehlende Felder: ${missingFields.join(', ')}`);
            return;
        }

        try {
            const machine = {
                id: Date.now().toString(),
                // Grunddaten
                name: document.getElementById('machineName').value.trim(),
                type: document.getElementById('machineType').value,
                manufacturer: document.getElementById('machineManufacturer')?.value.trim() || '',
                model: document.getElementById('machineModel')?.value.trim() || '',
                serialNumber: document.getElementById('machineSerialNumber')?.value.trim() || '',
                yearBuilt: document.getElementById('machineYearBuilt')?.value || null,
                
                // Standort & Organisation
                location: document.getElementById('machineLocation').value.trim(),
                department: document.getElementById('machineDepartment').value,
                responsible: document.getElementById('machineResponsible')?.value.trim() || '',
                status: document.getElementById('machineStatus').value,
                
                // Technische Daten
                power: document.getElementById('machinePower')?.value || null,
                weight: document.getElementById('machineWeight')?.value || null,
                
                // Wartung & Service
                lastMaintenance: document.getElementById('machineLastMaintenance')?.value || null,
                nextMaintenance: document.getElementById('machineNextMaintenance')?.value || null,
                maintenanceInterval: document.getElementById('machineMaintenanceInterval')?.value || 90,
                notes: document.getElementById('machineNotes')?.value.trim() || '',
                
                // Metadaten
                createdAt: new Date().toISOString(),
                createdBy: this.currentUserId || 'unknown',
                updatedAt: new Date().toISOString(),
                updatedBy: this.currentUserId || 'unknown'
            };

            console.log('Erstelle Maschine:', machine);

            // Initialize machines array if it doesn't exist
            if (!Array.isArray(this.machines)) {
                this.machines = [];
                console.log('Machines Array initialisiert');
            }

            this.machines.push(machine);
            console.log('Maschine zu Array hinzugefügt. Anzahl Maschinen:', this.machines.length);
            
            this.saveMachinesToStorage();
            console.log('Maschinen in LocalStorage gespeichert');
            
            this.renderMachinesList();
            this.updateMachineStats();
            
            // Try to update analysis dropdown if it exists
            try {
                this.populateAnalysisMachineDropdown();
            } catch (e) {
                console.log('Warnung: Analysis Dropdown konnte nicht aktualisiert werden:', e.message);
            }
            
            // Close modal
            const modal = document.getElementById('addMachineModal');
            if (modal) {
                modal.remove();
            }
            
            alert('Maschine erfolgreich hinzugefügt!');
            
        } catch (error) {
            console.error('Fehler beim Erstellen der Maschine:', error);
            alert('Fehler beim Erstellen der Maschine: ' + error.message);
        }
    }

    renderMachinesList() {
        const container = document.getElementById('machinesList');
        if (!container) return;

        if (this.machines.length === 0) {
            container.innerHTML = '<p class="no-data">Keine Maschinen registriert</p>';
            return;
        }

        const machinesHtml = this.machines.map(machine => {
            const department = this.departments.find(d => d.id === machine.department);
            const statusClass = {
                'running': 'status-success',
                'maintenance': 'status-warning',
                'issue': 'status-danger',
                'offline': 'status-inactive'
            }[machine.status] || 'status-inactive';

            const statusText = {
                'running': 'In Betrieb',
                'maintenance': 'Wartung',
                'issue': 'Störung',
                'offline': 'Außer Betrieb'
            }[machine.status] || machine.status;

            // Wartungsinfo
            const nextMaintenance = machine.nextMaintenance ? 
                new Date(machine.nextMaintenance).toLocaleDateString('de-DE') : 'Nicht geplant';
            const isMaintenanceDue = machine.nextMaintenance && 
                new Date(machine.nextMaintenance) <= new Date();

            return `
                <div class="machine-card">
                    <div class="machine-header">
                        <div class="machine-title">
                            <h4>${machine.name}</h4>
                            <span class="machine-type">${machine.type}</span>
                        </div>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    
                    <div class="machine-details">
                        <div class="detail-grid">
                            <div class="detail-section">
                                <h5>Grunddaten</h5>
                                ${machine.manufacturer ? `<p><strong>Hersteller:</strong> ${machine.manufacturer}</p>` : ''}
                                ${machine.model ? `<p><strong>Modell:</strong> ${machine.model}</p>` : ''}
                                ${machine.serialNumber ? `<p><strong>S/N:</strong> ${machine.serialNumber}</p>` : ''}
                                ${machine.yearBuilt ? `<p><strong>Baujahr:</strong> ${machine.yearBuilt}</p>` : ''}
                            </div>
                            
                            <div class="detail-section">
                                <h5>Standort</h5>
                                <p><strong>Standort:</strong> ${machine.location}</p>
                                <p><strong>Abteilung:</strong> ${department ? department.name : 'Unbekannt'}</p>
                                ${machine.responsible ? `<p><strong>Verantwortlich:</strong> ${machine.responsible}</p>` : ''}
                            </div>
                            
                            <div class="detail-section">
                                <h5>Technische Daten</h5>
                                ${machine.power ? `<p><strong>Leistung:</strong> ${machine.power} kW</p>` : ''}
                                ${machine.weight ? `<p><strong>Gewicht:</strong> ${machine.weight} kg</p>` : ''}
                            </div>
                            
                            <div class="detail-section">
                                <h5>Wartung</h5>
                                <p class="${isMaintenanceDue ? 'maintenance-due' : ''}">
                                    <strong>Nächste Wartung:</strong> ${nextMaintenance}
                                    ${isMaintenanceDue ? ' <i class="fas fa-exclamation-triangle" title="Wartung überfällig"></i>' : ''}
                                </p>
                                <p><strong>Intervall:</strong> ${machine.maintenanceInterval || 90} Tage</p>
                            </div>
                        </div>
                        
                        ${machine.notes ? `
                            <div class="machine-notes">
                                <h5>Bemerkungen</h5>
                                <p>${machine.notes}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="machine-actions">
                        <button onclick="dashboard.viewMachineDetails('${machine.id}')" class="btn-info">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        <button onclick="dashboard.editMachine('${machine.id}')" class="btn-secondary">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                        <button onclick="dashboard.deleteMachine('${machine.id}')" class="btn-danger">
                            <i class="fas fa-trash"></i> Löschen
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = machinesHtml;
    }

    deleteMachine(machineId) {
        const machine = this.machines.find(m => m.id === machineId);
        if (!machine) return;

        if (confirm(`Möchten Sie die Maschine "${machine.name}" wirklich löschen?\n\nDadurch werden auch alle zugehörigen Störungsmeldungen entfernt.`)) {
            // Remove machine
            this.machines = this.machines.filter(m => m.id !== machineId);
            
            // Remove related issues
            this.issues = this.issues.filter(i => i.machineId !== machineId);
            
            // Save changes
            this.saveMachinesToStorage();
            this.saveIssuesToStorage();
            
            // Update UI
            this.renderMachinesList();
            this.updateMachineStats();
            this.populateAnalysisMachineDropdown();
            
            alert('Maschine erfolgreich gelöscht!');
        }
    }

    viewMachineDetails(machineId) {
        const machine = this.machines.find(m => m.id === machineId);
        if (!machine) return;

        const department = this.departments.find(d => d.id === machine.department);
        const relatedIssues = this.issues.filter(i => i.machineId === machineId);
        
        const modalHtml = `
            <div id="machineDetailsModal" class="modal active">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-cogs"></i> Maschinendetails: ${machine.name}</h2>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="machine-details-grid">
                            <div class="details-section">
                                <h3>Grunddaten</h3>
                                <div class="detail-item">
                                    <strong>Name:</strong> ${machine.name}
                                </div>
                                <div class="detail-item">
                                    <strong>Typ:</strong> ${machine.type}
                                </div>
                                ${machine.manufacturer ? `<div class="detail-item"><strong>Hersteller:</strong> ${machine.manufacturer}</div>` : ''}
                                ${machine.model ? `<div class="detail-item"><strong>Modell:</strong> ${machine.model}</div>` : ''}
                                ${machine.serialNumber ? `<div class="detail-item"><strong>Seriennummer:</strong> ${machine.serialNumber}</div>` : ''}
                                ${machine.yearBuilt ? `<div class="detail-item"><strong>Baujahr:</strong> ${machine.yearBuilt}</div>` : ''}
                            </div>

                            <div class="details-section">
                                <h3>Standort & Organisation</h3>
                                <div class="detail-item">
                                    <strong>Standort:</strong> ${machine.location}
                                </div>
                                <div class="detail-item">
                                    <strong>Abteilung:</strong> ${department ? department.name : 'Unbekannt'}
                                </div>
                                ${machine.responsible ? `<div class="detail-item"><strong>Verantwortlicher:</strong> ${machine.responsible}</div>` : ''}
                                <div class="detail-item">
                                    <strong>Status:</strong> 
                                    <span class="status-badge ${machine.status === 'running' ? 'status-success' : machine.status === 'maintenance' ? 'status-warning' : machine.status === 'issue' ? 'status-danger' : 'status-inactive'}">
                                        ${machine.status === 'running' ? 'In Betrieb' : machine.status === 'maintenance' ? 'Wartung' : machine.status === 'issue' ? 'Störung' : 'Außer Betrieb'}
                                    </span>
                                </div>
                            </div>

                            ${machine.power || machine.weight ? `
                                <div class="details-section">
                                    <h3>Technische Daten</h3>
                                    ${machine.power ? `<div class="detail-item"><strong>Leistung:</strong> ${machine.power} kW</div>` : ''}
                                    ${machine.weight ? `<div class="detail-item"><strong>Gewicht:</strong> ${machine.weight} kg</div>` : ''}
                                </div>
                            ` : ''}

                            <div class="details-section">
                                <h3>Wartung & Service</h3>
                                ${machine.lastMaintenance ? `<div class="detail-item"><strong>Letzte Wartung:</strong> ${new Date(machine.lastMaintenance).toLocaleDateString('de-DE')}</div>` : ''}
                                ${machine.nextMaintenance ? `<div class="detail-item"><strong>Nächste Wartung:</strong> ${new Date(machine.nextMaintenance).toLocaleDateString('de-DE')}</div>` : ''}
                                <div class="detail-item">
                                    <strong>Wartungsintervall:</strong> ${machine.maintenanceInterval || 90} Tage
                                </div>
                            </div>

                            <div class="details-section">
                                <h3>Störungshistorie</h3>
                                ${relatedIssues.length > 0 ? `
                                    <div class="issues-summary">
                                        <p><strong>Gesamte Störungen:</strong> ${relatedIssues.length}</p>
                                        <p><strong>Offene Störungen:</strong> ${relatedIssues.filter(i => i.status === 'open').length}</p>
                                        <p><strong>Behobene Störungen:</strong> ${relatedIssues.filter(i => i.status === 'resolved').length}</p>
                                    </div>
                                ` : '<p>Keine Störungen gemeldet</p>'}
                            </div>

                            ${machine.notes ? `
                                <div class="details-section full-width">
                                    <h3>Bemerkungen</h3>
                                    <div class="notes-content">
                                        ${machine.notes}
                                    </div>
                                </div>
                            ` : ''}

                            <div class="details-section full-width">
                                <h3>Metadaten</h3>
                                <div class="detail-item">
                                    <strong>Erstellt am:</strong> ${new Date(machine.createdAt).toLocaleDateString('de-DE')} um ${new Date(machine.createdAt).toLocaleTimeString('de-DE')}
                                </div>
                                <div class="detail-item">
                                    <strong>Erstellt von:</strong> ${machine.createdBy}
                                </div>
                                ${machine.updatedAt ? `
                                    <div class="detail-item">
                                        <strong>Zuletzt geändert:</strong> ${new Date(machine.updatedAt).toLocaleDateString('de-DE')} um ${new Date(machine.updatedAt).toLocaleTimeString('de-DE')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="dashboard.editMachine('${machine.id}')" class="btn-secondary">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                        <button onclick="this.closest('.modal').remove()" class="btn-primary">
                            <i class="fas fa-times"></i> Schließen
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    updateMachineStats() {
        const totalMachines = this.machines.length;
        const runningMachines = this.machines.filter(m => m.status === 'running').length;
        const maintenanceMachines = this.machines.filter(m => m.status === 'maintenance').length;
        const issueMachines = this.machines.filter(m => m.status === 'issue').length;

        const totalEl = document.getElementById('totalMachines');
        const runningEl = document.getElementById('runningMachines');
        const maintenanceEl = document.getElementById('maintenanceMachines');
        const issueEl = document.getElementById('issueMachines');

        if (totalEl) totalEl.textContent = totalMachines;
        if (runningEl) runningEl.textContent = runningMachines;
        if (maintenanceEl) maintenanceEl.textContent = maintenanceMachines;
        if (issueEl) issueEl.textContent = issueMachines;
    }

    setupMaintenancePlanning() {
        this.renderMaintenanceCalendar();
        this.updateMaintenanceOverview();
    }

    renderMaintenanceCalendar() {
        const calendar = document.getElementById('maintenanceCalendar');
        if (!calendar) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let calendarHtml = '<div class="calendar-weekheader">';
        const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        weekdays.forEach(day => {
            calendarHtml += `<div class="weekday">${day}</div>`;
        });
        calendarHtml += '</div><div class="calendar-days">';

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.toDateString() === today.toDateString();
            
            const dayClass = [
                'calendar-day',
                isCurrentMonth ? 'current-month' : 'other-month',
                isToday ? 'today' : ''
            ].filter(Boolean).join(' ');

            calendarHtml += `
                <div class="${dayClass}" data-date="${currentDate.toISOString().split('T')[0]}">
                    <span class="day-number">${currentDate.getDate()}</span>
                </div>
            `;
        }

        calendarHtml += '</div>';
        calendar.innerHTML = calendarHtml;
    }

    updateMaintenanceOverview() {
        const overdueEl = document.getElementById('overdueCount');
        const weekEl = document.getElementById('weekCount');
        const monthEl = document.getElementById('monthCount');

        if (overdueEl) overdueEl.textContent = '0';
        if (weekEl) weekEl.textContent = '0';
        if (monthEl) monthEl.textContent = '0';
    }

    setupIssueReporting() {
        const reportIssueBtn = document.getElementById('reportIssueBtn');
        if (reportIssueBtn) {
            reportIssueBtn.addEventListener('click', () => this.showReportIssueModal());
        }

        // Setup filter listeners
        const statusFilter = document.getElementById('issueStatusFilter');
        const priorityFilter = document.getElementById('issuePriorityFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.renderIssuesList());
        }
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => this.renderIssuesList());
        }

        this.renderIssuesList();
        this.updateIssueStats();
    }

    showReportIssueModal() {
        console.log('showReportIssueModal() aufgerufen');
        console.log('Verfügbare Maschinen:', this.machines);
        
        // Remove existing modals to prevent duplicate IDs
        const existingModal = document.getElementById('reportIssueModal');
        if (existingModal) existingModal.remove();
        
        // Check if machines exist
        const machineOptions = this.machines && this.machines.length > 0 
            ? this.machines.map(machine => `<option value="${machine.id}">${machine.name} (${machine.type || 'Unbekannt'})</option>`).join('')
            : '<option value="no-machine">Keine Maschinen verfügbar - Bitte erst Maschinen anlegen</option>';

        const modalHtml = `
            <div id="reportIssueModal" class="modal active">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-exclamation-triangle"></i> Störung melden</h2>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        ${this.machines && this.machines.length === 0 ? `
                            <div class="alert alert-warning" style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                                <h4 style="color: #d97706; margin-bottom: 0.5rem;"><i class="fas fa-exclamation-triangle"></i> Keine Maschinen verfügbar</h4>
                                <p style="color: #92400e; margin-bottom: 0;">Sie müssen zuerst Maschinen im Bereich "Maschinen" anlegen, bevor Sie Störungen melden können.</p>
                            </div>
                        ` : ''}
                        
                        <form id="reportIssueForm">
                            <div class="form-grid">
                                <div class="form-column">
                                    <h3>Grundinformationen</h3>
                                    <div class="form-group">
                                        <label for="issueMachine">Betroffene Maschine: *</label>
                                        <select id="issueMachine" required ${this.machines && this.machines.length === 0 ? 'disabled' : ''}>
                                            <option value="">Maschine auswählen</option>
                                            ${machineOptions}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="issuePriority">Priorität: *</label>
                                        <select id="issuePriority" required>
                                            <option value="">Priorität auswählen</option>
                                            <option value="low">🟢 Niedrig - Kann bei nächster Wartung behoben werden</option>
                                            <option value="medium">🟡 Mittel - Sollte innerhalb von 24h behoben werden</option>
                                            <option value="high">🟠 Hoch - Erfordert schnelle Bearbeitung</option>
                                            <option value="critical">🔴 Kritisch - Sofortige Aufmerksamkeit erforderlich</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="issueTitle">Kurzer Titel der Störung: *</label>
                                        <input type="text" id="issueTitle" required placeholder="z.B. Hydraulikpumpe läuft unregelmäßig">
                                        <small>Beschreiben Sie das Problem in wenigen Worten</small>
                                    </div>
                                </div>
                                
                                <div class="form-column">
                                    <h3>Details & Dokumentation</h3>
                                    <div class="form-group">
                                        <label for="issueDescription">Detaillierte Beschreibung: *</label>
                                        <textarea id="issueDescription" rows="6" required placeholder="Beschreiben Sie die Störung ausführlich:
- Was ist passiert?
- Wann ist es aufgetreten?
- Unter welchen Umständen?
- Welche Auswirkungen hat es?"></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="issuePhoto">Foto der Störung (optional):</label>
                                        <input type="file" id="issuePhoto" accept="image/*">
                                        <small>Unterstützte Formate: JPG, PNG, GIF (max. 10MB)</small>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button onclick="dashboard.reportIssue()" class="btn-primary" ${this.machines && this.machines.length === 0 ? 'disabled' : ''}>
                            <i class="fas fa-paper-plane"></i> Störung melden
                        </button>
                        <button onclick="this.closest('.modal').remove()" class="btn-secondary">
                            <i class="fas fa-times"></i> Abbrechen
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    reportIssue() {
        console.log('reportIssue() aufgerufen');
        
        try {
            // Validierung der Pflichtfelder
            const machineId = document.getElementById('issueMachine')?.value;
            const priority = document.getElementById('issuePriority')?.value;
            const title = document.getElementById('issueTitle')?.value?.trim();
            const description = document.getElementById('issueDescription')?.value?.trim();

            console.log('Formular-Daten:', { machineId, priority, title, description });

            // Check if machines are available
            if (!this.machines || this.machines.length === 0) {
                alert('Es sind keine Maschinen verfügbar. Bitte legen Sie zuerst Maschinen im Bereich "Maschinen" an.');
                return;
            }

            if (!machineId || machineId === 'no-machine') {
                alert('Bitte wählen Sie eine gültige Maschine aus.');
                return;
            }

            if (!priority) {
                alert('Bitte wählen Sie eine Priorität aus.');
                return;
            }

            if (!title) {
                alert('Bitte geben Sie einen Titel für die Störung ein.');
                return;
            }

            if (!description) {
                alert('Bitte geben Sie eine Beschreibung der Störung ein.');
                return;
            }

            // Handle photo upload if present
            const photoInput = document.getElementById('issuePhoto');
            
            if (photoInput && photoInput.files.length > 0) {
                const file = photoInput.files[0];
                
                // Check file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    alert('Das Foto ist zu groß. Maximale Dateigröße: 10MB');
                    return;
                }
                
                // Check file type
                if (!file.type.startsWith('image/')) {
                    alert('Bitte wählen Sie eine gültige Bilddatei aus.');
                    return;
                }
                
                console.log('Lade Foto:', file.name, file.size, 'bytes');
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log('Foto geladen, erstelle Störung mit Foto');
                    this.createIssueWithPhoto(machineId, priority, title, description, e.target.result);
                };
                reader.onerror = (e) => {
                    console.error('Fehler beim Laden des Fotos:', e);
                    alert('Fehler beim Laden des Fotos. Störung wird ohne Foto erstellt.');
                    this.createIssueWithPhoto(machineId, priority, title, description, null);
                };
                reader.readAsDataURL(file);
            } else {
                console.log('Erstelle Störung ohne Foto');
                this.createIssueWithPhoto(machineId, priority, title, description, null);
            }
            
        } catch (error) {
            console.error('Fehler in reportIssue():', error);
            alert('Fehler beim Melden der Störung: ' + error.message);
        }
    }

    createIssueWithPhoto(machineId, priority, title, description, photoData) {
        try {
            console.log('createIssueWithPhoto() aufgerufen mit:', { machineId, priority, title, description, hasPhoto: !!photoData });
            
            const issue = {
                id: Date.now().toString(),
                machineId: machineId,
                priority: priority,
                title: title,
                description: description,
                photo: photoData,
                status: 'open',
                reportedAt: new Date().toISOString(),
                reportedBy: this.currentUserId || 'unknown',
                updatedAt: new Date().toISOString(),
                updatedBy: this.currentUserId || 'unknown'
            };

            console.log('Erstelle Issue:', issue);

            // Initialize issues array if it doesn't exist
            if (!Array.isArray(this.issues)) {
                this.issues = [];
                console.log('Issues Array initialisiert');
            }

            this.issues.push(issue);
            console.log('Issue zu Array hinzugefügt. Anzahl Issues:', this.issues.length);
            
            this.saveIssuesToStorage();
            console.log('Issues in LocalStorage gespeichert');
            
            this.renderIssuesList();
            this.updateIssueStats();
            
            // Close modal
            const modal = document.getElementById('reportIssueModal');
            if (modal) {
                modal.remove();
            }
            
            alert('Störung erfolgreich gemeldet!');
            
        } catch (error) {
            console.error('Fehler beim Erstellen der Störung:', error);
            alert('Fehler beim Erstellen der Störung: ' + error.message);
        }
    }

    renderIssuesList() {
        const container = document.getElementById('issuesList');
        if (!container) return;

        if (this.issues.length === 0) {
            container.innerHTML = '<p class="no-data">Keine Störungen gemeldet</p>';
            return;
        }

        // Apply filters
        const statusFilter = document.getElementById('issueStatusFilter')?.value || '';
        const priorityFilter = document.getElementById('issuePriorityFilter')?.value || '';

        let filteredIssues = this.issues;
        if (statusFilter) {
            filteredIssues = filteredIssues.filter(issue => issue.status === statusFilter);
        }
        if (priorityFilter) {
            filteredIssues = filteredIssues.filter(issue => issue.priority === priorityFilter);
        }

        // Sort by priority and date (critical first, then by date)
        filteredIssues.sort((a, b) => {
            const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.reportedAt) - new Date(a.reportedAt);
        });

        const issuesHtml = filteredIssues.map(issue => {
            const machine = this.machines.find(m => m.id === issue.machineId);
            const reporter = this.users.find(u => u.id === issue.reportedBy);
            
            const priorityClass = {
                'low': 'priority-low',
                'medium': 'priority-medium',
                'high': 'priority-high',
                'critical': 'priority-critical'
            }[issue.priority] || 'priority-medium';

            const statusClass = {
                'open': 'status-danger',
                'in-progress': 'status-warning',
                'resolved': 'status-success'
            }[issue.status] || 'status-danger';

            const priorityText = {
                'low': 'Niedrig',
                'medium': 'Mittel',
                'high': 'Hoch',
                'critical': 'Kritisch'
            }[issue.priority] || issue.priority;

            const statusText = {
                'open': 'Offen',
                'in-progress': 'In Bearbeitung',
                'resolved': 'Behoben'
            }[issue.status] || issue.status;

            // Calculate duration
            const reportedDate = new Date(issue.reportedAt);
            const now = new Date();
            const diffDays = Math.floor((now - reportedDate) / (1000 * 60 * 60 * 24));
            const durationText = diffDays === 0 ? 'Heute' : 
                                diffDays === 1 ? 'Gestern' : 
                                `vor ${diffDays} Tagen`;

            return `
                <div class="issue-card">
                    <div class="issue-header">
                        <div class="issue-title-section">
                            <h4>${issue.title}</h4>
                            <span class="issue-duration">${durationText}</span>
                        </div>
                        <div class="issue-badges">
                            <span class="priority-badge ${priorityClass}">${priorityText}</span>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    
                    <div class="issue-content">
                        <div class="issue-details">
                            <div class="detail-row">
                                <span class="detail-label">Maschine:</span>
                                <span class="detail-value">${machine ? `${machine.name} (${machine.type})` : 'Unbekannt'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Standort:</span>
                                <span class="detail-value">${machine ? machine.location : 'Unbekannt'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Gemeldet von:</span>
                                <span class="detail-value">${reporter ? reporter.displayName : issue.reportedBy}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Gemeldet am:</span>
                                <span class="detail-value">${reportedDate.toLocaleDateString('de-DE')} um ${reportedDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        
                        ${issue.photo ? `
                            <div class="issue-photo">
                                <img src="${issue.photo}" alt="Störungsfoto" onclick="dashboard.showImageModal('${issue.photo}', '${issue.title}')">
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="issue-description">
                        <h5>Beschreibung:</h5>
                        <p>${issue.description}</p>
                    </div>
                    
                    <div class="issue-actions">
                        <button onclick="dashboard.viewIssueDetails('${issue.id}')" class="btn-info">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        ${issue.status === 'open' ? `
                            <button onclick="dashboard.updateIssueStatus('${issue.id}', 'in-progress')" class="btn-warning">
                                <i class="fas fa-wrench"></i> In Bearbeitung
                            </button>
                        ` : ''}
                        ${issue.status === 'in-progress' ? `
                            <button onclick="dashboard.updateIssueStatus('${issue.id}', 'resolved')" class="btn-success">
                                <i class="fas fa-check"></i> Behoben
                            </button>
                        ` : ''}
                        ${issue.status === 'resolved' ? `
                            <button onclick="dashboard.updateIssueStatus('${issue.id}', 'open')" class="btn-secondary">
                                <i class="fas fa-undo"></i> Wieder öffnen
                            </button>
                        ` : ''}
                        <button onclick="dashboard.deleteIssue('${issue.id}')" class="btn-danger">
                            <i class="fas fa-trash"></i> Löschen
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = issuesHtml;
    }

    updateIssueStatus(issueId, newStatus) {
        const issue = this.issues.find(i => i.id === issueId);
        if (issue) {
            issue.status = newStatus;
            issue.updatedAt = new Date().toISOString();
            issue.updatedBy = this.currentUserId;
            
            this.saveIssuesToStorage();
            this.renderIssuesList();
            this.updateIssueStats();
            alert('Störungsstatus aktualisiert!');
        }
    }

    updateIssueStats() {
        const openIssues = this.issues.filter(i => i.status === 'open').length;
        const progressIssues = this.issues.filter(i => i.status === 'in-progress').length;
        const resolvedIssues = this.issues.filter(i => i.status === 'resolved').length;

        const openEl = document.getElementById('openIssues');
        const progressEl = document.getElementById('progressIssues');
        const resolvedEl = document.getElementById('resolvedIssues');

        if (openEl) openEl.textContent = openIssues;
        if (progressEl) progressEl.textContent = progressIssues;
        if (resolvedEl) resolvedEl.textContent = resolvedIssues;
    }

    deleteIssue(issueId) {
        const issue = this.issues.find(i => i.id === issueId);
        if (!issue) return;

        if (confirm(`Möchten Sie die Störung "${issue.title}" wirklich löschen?`)) {
            this.issues = this.issues.filter(i => i.id !== issueId);
            this.saveIssuesToStorage();
            this.renderIssuesList();
            this.updateIssueStats();
            alert('Störung erfolgreich gelöscht!');
        }
    }

    viewIssueDetails(issueId) {
        const issue = this.issues.find(i => i.id === issueId);
        if (!issue) return;

        const machine = this.machines.find(m => m.id === issue.machineId);
        const reporter = this.users.find(u => u.id === issue.reportedBy);
        const updater = issue.updatedBy ? this.users.find(u => u.id === issue.updatedBy) : null;

        const statusText = {
            'open': 'Offen',
            'in-progress': 'In Bearbeitung',
            'resolved': 'Behoben'
        }[issue.status] || issue.status;

        const priorityText = {
            'low': 'Niedrig',
            'medium': 'Mittel',
            'high': 'Hoch',
            'critical': 'Kritisch'
        }[issue.priority] || issue.priority;

        const modalHtml = `
            <div id="issueDetailsModal" class="modal active">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-exclamation-triangle"></i> Störungsdetails: ${issue.title}</h2>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="issue-details-grid">
                            <div class="details-section">
                                <h3>Grundinformationen</h3>
                                <div class="detail-item">
                                    <strong>Titel:</strong> ${issue.title}
                                </div>
                                <div class="detail-item">
                                    <strong>Status:</strong> 
                                    <span class="status-badge ${issue.status === 'open' ? 'status-danger' : issue.status === 'in-progress' ? 'status-warning' : 'status-success'}">
                                        ${statusText}
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <strong>Priorität:</strong> 
                                    <span class="priority-badge priority-${issue.priority}">${priorityText}</span>
                                </div>
                            </div>

                            <div class="details-section">
                                <h3>Maschineninformationen</h3>
                                <div class="detail-item">
                                    <strong>Maschine:</strong> ${machine ? machine.name : 'Unbekannt'}
                                </div>
                                ${machine ? `
                                    <div class="detail-item">
                                        <strong>Typ:</strong> ${machine.type}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Standort:</strong> ${machine.location}
                                    </div>
                                ` : ''}
                            </div>

                            <div class="details-section">
                                <h3>Zeitinformationen</h3>
                                <div class="detail-item">
                                    <strong>Gemeldet am:</strong> ${new Date(issue.reportedAt).toLocaleDateString('de-DE')} um ${new Date(issue.reportedAt).toLocaleTimeString('de-DE')}
                                </div>
                                <div class="detail-item">
                                    <strong>Gemeldet von:</strong> ${reporter ? reporter.displayName : issue.reportedBy}
                                </div>
                                ${issue.updatedAt && issue.updatedAt !== issue.reportedAt ? `
                                    <div class="detail-item">
                                        <strong>Zuletzt geändert:</strong> ${new Date(issue.updatedAt).toLocaleDateString('de-DE')} um ${new Date(issue.updatedAt).toLocaleTimeString('de-DE')}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Geändert von:</strong> ${updater ? updater.displayName : issue.updatedBy}
                                    </div>
                                ` : ''}
                            </div>

                            <div class="details-section full-width">
                                <h3>Beschreibung</h3>
                                <div class="description-content">
                                    ${issue.description}
                                </div>
                            </div>

                            ${issue.photo ? `
                                <div class="details-section full-width">
                                    <h3>Foto</h3>
                                    <div class="issue-photo-large">
                                        <img src="${issue.photo}" alt="Störungsfoto" onclick="dashboard.showImageModal('${issue.photo}', '${issue.title}')">
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        ${issue.status === 'open' ? `
                            <button onclick="dashboard.updateIssueStatus('${issue.id}', 'in-progress'); this.closest('.modal').remove();" class="btn-warning">
                                <i class="fas fa-wrench"></i> In Bearbeitung setzen
                            </button>
                        ` : ''}
                        ${issue.status === 'in-progress' ? `
                            <button onclick="dashboard.updateIssueStatus('${issue.id}', 'resolved'); this.closest('.modal').remove();" class="btn-success">
                                <i class="fas fa-check"></i> Als behoben markieren
                            </button>
                        ` : ''}
                        <button onclick="this.closest('.modal').remove()" class="btn-primary">
                            <i class="fas fa-times"></i> Schließen
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    showImageModal(imageSrc, title) {
        const modalHtml = `
            <div id="imageModal" class="modal active">
                <div class="modal-content image-modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-image"></i> ${title}</h2>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="image-container">
                            <img src="${imageSrc}" alt="${title}" style="max-width: 100%; height: auto;">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="this.closest('.modal').remove()" class="btn-primary">
                            <i class="fas fa-times"></i> Schließen
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    setupMaintenanceAnalysis() {
        const generateAnalysisBtn = document.getElementById('generateAnalysisBtn');
        if (generateAnalysisBtn) {
            generateAnalysisBtn.addEventListener('click', () => this.generateMaintenanceAnalysis());
        }
        this.populateAnalysisMachineDropdown();
    }

    populateAnalysisMachineDropdown() {
        const machineSelect = document.getElementById('analysisMachine');
        if (!machineSelect) return;

        // Clear existing options except "Alle Maschinen"
        machineSelect.innerHTML = '<option value="">Alle Maschinen</option>';

        // Add all registered machines
        this.machines.forEach(machine => {
            const option = document.createElement('option');
            option.value = machine.id;
            option.textContent = `${machine.name} (${machine.type})`;
            machineSelect.appendChild(option);
        });
    }

    generateMaintenanceAnalysis() {
        const machineId = document.getElementById('analysisMachine').value;
        const timeframe = document.getElementById('analysisTimeframe').value;

        // Filter data based on selection
        let selectedMachines = machineId ? [this.machines.find(m => m.id === machineId)] : this.machines;
        let filteredIssues = this.issues;
        
        if (machineId) {
            filteredIssues = this.issues.filter(issue => issue.machineId === machineId);
        }

        // Calculate time range
        const now = new Date();
        let startDate;
        switch (timeframe) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        }

        // Filter issues by date
        filteredIssues = filteredIssues.filter(issue => 
            new Date(issue.reportedAt) >= startDate
        );

        // Calculate KPIs
        this.calculateAndDisplayKPIs(selectedMachines, filteredIssues, startDate, now);
        
        alert('Analyse erfolgreich erstellt!');
    }

    calculateAndDisplayKPIs(machines, issues, startDate, endDate) {
        const totalMachines = machines.length;
        const totalIssues = issues.length;
        const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
        
        // Calculate MTBF (Mean Time Between Failures) in hours
        // Simplified calculation: assume 24/7 operation for demo
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const totalOperatingHours = totalMachines * daysDiff * 24;
        const mtbf = totalIssues > 0 ? Math.round(totalOperatingHours / totalIssues) : 0;

        // Calculate MTTR (Mean Time To Repair) in hours
        // Simplified: assume 4-48 hours repair time based on priority
        let totalRepairTime = 0;
        resolvedIssues.forEach(issue => {
            const repairTime = {
                'low': 4,
                'medium': 8,
                'high': 16,
                'critical': 2
            }[issue.priority] || 8;
            totalRepairTime += repairTime;
        });
        const mttr = resolvedIssues > 0 ? Math.round(totalRepairTime / resolvedIssues) : 0;

        // Calculate Availability (simplified)
        const downtime = totalRepairTime;
        const availability = totalOperatingHours > 0 ? 
            Math.round(((totalOperatingHours - downtime) / totalOperatingHours) * 100) : 100;

        // Calculate estimated costs (simplified)
        const costs = totalIssues * 1500 + resolvedIssues * 500; // Simplified cost calculation

        // Update KPI display
        const mtbfEl = document.getElementById('mtbfValue');
        const mttrEl = document.getElementById('mttrValue');
        const availabilityEl = document.getElementById('availabilityValue');
        const costsEl = document.getElementById('costsValue');

        if (mtbfEl) mtbfEl.textContent = mtbf;
        if (mttrEl) mttrEl.textContent = mttr;
        if (availabilityEl) availabilityEl.textContent = availability;
        if (costsEl) costsEl.textContent = costs.toLocaleString('de-DE');

        // Update chart placeholders with some data info
        const issueChart = document.getElementById('issueFrequencyChart');
        const trendChart = document.getElementById('maintenanceTrendChart');

        if (issueChart) {
            issueChart.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h4>Störungsstatistik</h4>
                    <p><strong>Gesamte Störungen:</strong> ${totalIssues}</p>
                    <p><strong>Behobene Störungen:</strong> ${resolvedIssues}</p>
                    <p><strong>Offene Störungen:</strong> ${totalIssues - resolvedIssues}</p>
                    <small>Detaillierte Diagramme werden in einer zukünftigen Version verfügbar sein</small>
                </div>
            `;
        }

        if (trendChart) {
            trendChart.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h4>Wartungstrend</h4>
                    <p><strong>Analysezeitraum:</strong> ${daysDiff} Tage</p>
                    <p><strong>Durchschnittliche MTBF:</strong> ${mtbf} Stunden</p>
                    <p><strong>Durchschnittliche MTTR:</strong> ${mttr} Stunden</p>
                    <small>Detaillierte Diagramme werden in einer zukünftigen Version verfügbar sein</small>
                </div>
            `;
        }
    }

    updateMaintenanceStats() {
        this.updateMachineStats();
        this.updateIssueStats();
        this.updateMaintenanceOverview();
        this.populateAnalysisMachineDropdown();
    }

    // Initialize dashboard with sample data
    initializeSampleData() {
        // Update KPIs every 30 seconds
        setInterval(() => {
            this.updateKPIs();
        }, 30000);

        // Setup notifications
        this.setupNotifications();
    }

    // Setup expandable info sections (like Arbeitsschutz)
    setupExpandableInfo() {
        // Arbeitsschutz expandable section
        const expandBtn = document.getElementById('expandSafetyInfoBtn');
        const safetySection = document.getElementById('safetyInfoSection');
        const editBtn = document.getElementById('editSafetyInfoBtn');
        const saveBtn = document.getElementById('saveSafetyInfoBtn');
        const cancelBtn = document.getElementById('cancelSafetyInfoBtn');
        const display = document.getElementById('safetyInfoDisplay');
        const editor = document.getElementById('safetyInfoEditor');
        const textarea = document.getElementById('safetyInfoText');

        if (expandBtn && safetySection) {
            expandBtn.addEventListener('click', () => {
                const isVisible = safetySection.style.display !== 'none';
                if (isVisible) {
                    safetySection.style.display = 'none';
                    expandBtn.classList.remove('rotated');
                    expandBtn.closest('.kpi-card').classList.remove('expanded');
                } else {
                    safetySection.style.display = 'block';
                    expandBtn.classList.add('rotated');
                    expandBtn.closest('.kpi-card').classList.add('expanded');
                    this.loadSafetyInfo();
                }
            });
        }

        if (editBtn && display && editor) {
            editBtn.addEventListener('click', () => {
                display.style.display = 'none';
                editor.style.display = 'block';
                textarea.focus();
            });
        }

        if (saveBtn && display && editor && textarea) {
            saveBtn.addEventListener('click', () => {
                const content = textarea.value.trim();
                this.saveSafetyInfo(content);
                this.displaySafetyInfo(content);
                editor.style.display = 'none';
                display.style.display = 'block';
            });
        }

        if (cancelBtn && display && editor) {
            cancelBtn.addEventListener('click', () => {
                editor.style.display = 'none';
                display.style.display = 'block';
                this.loadSafetyInfo();
            });
        }
    }

    loadSafetyInfo() {
        const saved = localStorage.getItem('qhse_safety_info');
        const textarea = document.getElementById('safetyInfoText');
        if (textarea && saved) {
            textarea.value = saved;
        }
        this.displaySafetyInfo(saved);
    }

    displaySafetyInfo(content) {
        const display = document.getElementById('safetyInfoDisplay');
        if (display) {
            if (content && content.trim()) {
                display.innerHTML = `<div style="white-space: pre-wrap; color: #374151;">${content.trim()}</div>`;
            } else {
                display.innerHTML = '<p>Klicken Sie auf "Bearbeiten", um weitere Informationen zum Arbeitsschutz hinzuzufügen.</p>';
            }
        }
    }

    saveSafetyInfo(content) {
        localStorage.setItem('qhse_safety_info', content);
    }

    // Setup customer feedback section
    setupCustomerFeedback() {
        const editBtn = document.getElementById('editCustomerFeedbackBtn');
        const saveBtn = document.getElementById('saveCustomerFeedbackBtn');
        const cancelBtn = document.getElementById('cancelCustomerFeedbackBtn');
        const display = document.getElementById('customerFeedbackDisplay');
        const editor = document.getElementById('customerFeedbackEditor');
        const textarea = document.getElementById('customerFeedbackText');

        // Load existing feedback on startup
        this.loadCustomerFeedback();

        if (editBtn && display && editor) {
            editBtn.addEventListener('click', () => {
                display.style.display = 'none';
                editor.style.display = 'block';
                textarea.focus();
            });
        }

        if (saveBtn && display && editor && textarea) {
            saveBtn.addEventListener('click', () => {
                const content = textarea.value.trim();
                this.saveCustomerFeedback(content);
                this.displayCustomerFeedback(content);
                editor.style.display = 'none';
                display.style.display = 'block';
            });
        }

        if (cancelBtn && display && editor) {
            cancelBtn.addEventListener('click', () => {
                editor.style.display = 'none';
                display.style.display = 'block';
                this.loadCustomerFeedback();
            });
        }
    }

    loadCustomerFeedback() {
        const saved = localStorage.getItem('qhse_customer_feedback');
        const textarea = document.getElementById('customerFeedbackText');
        if (textarea && saved) {
            textarea.value = saved;
        }
        this.displayCustomerFeedback(saved);
    }

    displayCustomerFeedback(content) {
        const display = document.getElementById('customerFeedbackDisplay');
        if (display) {
            if (content && content.trim()) {
                display.innerHTML = `<div style="white-space: pre-wrap; color: #374151;">${content.trim()}</div>`;
            } else {
                display.innerHTML = '<p>Klicken Sie auf "Bearbeiten", um Kundenfeedback und Bemerkungen hinzuzufügen.</p>';
            }
        }
    }

    saveCustomerFeedback(content) {
        localStorage.setItem('qhse_customer_feedback', content);
    }

    // Setup QHSE notes areas for all categories
    setupQHSENotesAreas() {
        const categories = ['arbeitsschutz', 'qualitaet', 'umwelt', 'datenschutz', 'gesundheit', 'arbeitsanweisungen', 'verfahrensanweisungen'];
        
        categories.forEach(category => {
            this.setupQHSENotesArea(category);
        });
    }

    setupQHSENotesArea(category) {
        const editBtn = document.getElementById(`edit${category.charAt(0).toUpperCase() + category.slice(1)}NotesBtn`);
        const saveBtn = document.getElementById(`save${category.charAt(0).toUpperCase() + category.slice(1)}NotesBtn`);
        const cancelBtn = document.getElementById(`cancel${category.charAt(0).toUpperCase() + category.slice(1)}NotesBtn`);
        const shareBtn = document.getElementById(`share${category.charAt(0).toUpperCase() + category.slice(1)}NotesBtn`);
        const display = document.getElementById(`${category}NotesDisplay`);
        const editor = document.getElementById(`${category}NotesEditor`);
        const textarea = document.getElementById(`${category}NotesText`);

        // Load existing notes on startup
        this.loadQHSENotes(category);

        if (editBtn && display && editor && textarea) {
            editBtn.addEventListener('click', () => {
                console.log(`Edit ${category} notes clicked`);
                display.style.display = 'none';
                editor.style.display = 'block';
                textarea.focus();
            });
        }

        if (saveBtn && display && editor && textarea) {
            saveBtn.addEventListener('click', () => {
                console.log(`Save ${category} notes clicked`);
                const content = textarea.value.trim();
                this.saveQHSENotes(category, content);
                this.displayQHSENotes(category, content);
                editor.style.display = 'none';
                display.style.display = 'block';
            });
        }

        if (cancelBtn && display && editor) {
            cancelBtn.addEventListener('click', () => {
                console.log(`Cancel ${category} notes clicked`);
                editor.style.display = 'none';
                display.style.display = 'block';
                this.loadQHSENotes(category);
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                console.log(`Share ${category} notes clicked`);
                this.openShareModal(category);
            });
        }
    }

    loadQHSENotes(category) {
        const saved = localStorage.getItem(`qhse_notes_${category}`);
        const textarea = document.getElementById(`${category}NotesText`);
        if (textarea && saved) {
            textarea.value = saved;
        }
        this.displayQHSENotes(category, saved);
    }

    displayQHSENotes(category, content) {
        const display = document.getElementById(`${category}NotesDisplay`);
        if (display) {
            if (content && content.trim()) {
                display.innerHTML = `<div style="white-space: pre-wrap; color: #374151;">${content.trim()}</div>`;
            } else {
                const categoryNames = {
                    'arbeitsschutz': 'Arbeitsschutz',
                    'qualitaet': 'Qualitäts',
                    'umwelt': 'Umwelt',
                    'datenschutz': 'Datenschutz',
                    'gesundheit': 'Gesundheits',
                    'arbeitsanweisungen': 'Arbeitsanweisungen',
                    'verfahrensanweisungen': 'Verfahrensanweisungen'
                };
                const categoryName = categoryNames[category] || category;
                display.innerHTML = `<p>Klicken Sie auf "Bearbeiten", um QHSE-spezifische Informationen für den ${categoryName}-Bereich hinzuzufügen.</p>`;
            }
        }
    }

    saveQHSENotes(category, content) {
        localStorage.setItem(`qhse_notes_${category}`, content);
        console.log(`Saved notes for ${category}:`, content);
    }

    updateQHSENotesVisibility() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const categories = ['arbeitsschutz', 'qualitaet', 'umwelt', 'datenschutz', 'gesundheit', 'arbeitsanweisungen', 'verfahrensanweisungen'];
        const isQHSERole = ['qhse', 'admin', 'root-admin'].includes(currentUser.role);

        categories.forEach(category => {
            const section = document.querySelector(`.qhse-notes-section[data-category="${category}"]`);
            if (!section) return;

            if (isQHSERole) {
                // QHSE can see and edit all notes
                section.style.display = 'block';
                this.showQHSEEditView(category);
            } else {
                // Check if user has read access to this category
                const sharedUsers = this.getSharedUsers(category);
                if (sharedUsers.includes(currentUser.id)) {
                    section.style.display = 'block';
                    this.showReadOnlyView(category);
                } else {
                    section.style.display = 'none';
                }
            }
        });
    }

    showQHSEEditView(category) {
        const section = document.querySelector(`#${category}NotesDisplay`).closest('.qhse-notes-section');
        if (section) {
            // Show edit and share buttons
            const editBtn = section.querySelector(`#edit${category.charAt(0).toUpperCase() + category.slice(1)}NotesBtn`);
            const shareBtn = section.querySelector(`#share${category.charAt(0).toUpperCase() + category.slice(1)}NotesBtn`);
            
            if (editBtn) editBtn.style.display = 'inline-block';
            if (shareBtn) shareBtn.style.display = 'inline-block';
            
            // Remove read-only view if present
            const readOnlyView = section.querySelector('.read-only-view');
            if (readOnlyView) readOnlyView.remove();
        }
    }

    showReadOnlyView(category) {
        const notesContent = document.querySelector(`#${category}NotesDisplay`).closest('.notes-content');
        if (!notesContent) return;

        const section = notesContent.closest('.qhse-notes-section');
        
        // Hide edit and share buttons
        const editBtn = section.querySelector(`#edit${category.charAt(0).toUpperCase() + category.slice(1)}NotesBtn`);
        const shareBtn = section.querySelector(`#share${category.charAt(0).toUpperCase() + category.slice(1)}NotesBtn`);
        
        if (editBtn) editBtn.style.display = 'none';
        if (shareBtn) shareBtn.style.display = 'none';
        
        // Show read-only indicator
        const existingReadOnly = notesContent.querySelector('.read-only-view');
        if (!existingReadOnly) {
            const content = localStorage.getItem(`qhse_notes_${category}`) || '';
            const readOnlyHtml = `
                <div class="read-only-view">
                    <div class="read-only-header">
                        Nur-Lese-Zugriff (von QHSE freigegeben)
                    </div>
                    <div class="read-only-content">${content || 'Keine Notizen vorhanden'}</div>
                </div>
            `;
            notesContent.insertAdjacentHTML('beforeend', readOnlyHtml);
        }
    }

    openShareModal(category) {
        const existingModal = document.querySelector('.share-modal');
        if (existingModal) existingModal.remove();

        const categoryNames = {
            'arbeitsschutz': 'Arbeitsschutz',
            'qualitaet': 'Qualität',
            'umwelt': 'Umwelt',
            'datenschutz': 'Datenschutz',
            'gesundheit': 'Gesundheit',
            'arbeitsanweisungen': 'Arbeitsanweisungen',
            'verfahrensanweisungen': 'Verfahrensanweisungen'
        };

        const modalHtml = `
            <div class="share-modal">
                <div class="share-modal-content">
                    <div class="share-modal-header">
                        <h3>Freigabe: ${categoryNames[category]} Notizen</h3>
                        <button class="close-modal-btn" onclick="this.closest('.share-modal').remove()">&times;</button>
                    </div>
                    
                    <div class="user-selection">
                        <h4>Mitarbeiter auswählen:</h4>
                        <div class="users-grid" id="usersGrid">
                            ${this.renderUserCheckboxes(category)}
                        </div>
                    </div>
                    
                    <div class="current-shares">
                        <h4>Aktuell freigegebene Mitarbeiter:</h4>
                        <div id="currentShares">
                            ${this.renderCurrentShares(category)}
                        </div>
                    </div>
                    
                    <div class="share-modal-actions">
                        <button onclick="dashboard.saveSharing('${category}')" class="btn-primary">
                            <i class="fas fa-save"></i> Freigaben speichern
                        </button>
                        <button onclick="this.closest('.share-modal').remove()" class="btn-secondary">
                            <i class="fas fa-times"></i> Abbrechen
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    renderUserCheckboxes(category) {
        const allUsers = this.users.filter(user => user.id !== 'root-admin' && !['qhse', 'admin', 'root-admin'].includes(user.role));
        const sharedUsers = this.getSharedUsers(category);

        return allUsers.map(user => `
            <div class="user-checkbox">
                <input type="checkbox" id="user_${user.id}" value="${user.id}" ${sharedUsers.includes(user.id) ? 'checked' : ''}>
                <label for="user_${user.id}">${user.displayName}</label>
            </div>
        `).join('');
    }

    renderCurrentShares(category) {
        const sharedUsers = this.getSharedUsers(category);
        
        if (sharedUsers.length === 0) {
            return '<p style="color: #9ca3af; font-style: italic;">Noch keine Freigaben erstellt</p>';
        }

        return `
            <div class="shared-users-list">
                ${sharedUsers.map(userId => {
                    const user = this.users.find(u => u.id === userId);
                    return user ? `
                        <div class="shared-user-tag">
                            ${user.displayName}
                            <button class="remove-share-btn" onclick="dashboard.removeShare('${category}', '${userId}')" title="Freigabe entfernen">
                                &times;
                            </button>
                        </div>
                    ` : '';
                }).join('')}
            </div>
        `;
    }

    saveSharing(category) {
        const checkboxes = document.querySelectorAll('#usersGrid input[type="checkbox"]:checked');
        const selectedUsers = Array.from(checkboxes).map(cb => cb.value);
        
        this.setSharedUsers(category, selectedUsers);
        
        // Update display
        const currentSharesDiv = document.getElementById('currentShares');
        if (currentSharesDiv) {
            currentSharesDiv.innerHTML = this.renderCurrentShares(category);
        }

        // Update main UI
        this.updateQHSENotesVisibility();
        this.updateSharingInfo(category);
        
        alert('Freigaben erfolgreich gespeichert!');
        document.querySelector('.share-modal').remove();
    }

    removeShare(category, userId) {
        const sharedUsers = this.getSharedUsers(category);
        const updatedUsers = sharedUsers.filter(id => id !== userId);
        this.setSharedUsers(category, updatedUsers);
        
        // Update modal if open
        const currentSharesDiv = document.getElementById('currentShares');
        if (currentSharesDiv) {
            currentSharesDiv.innerHTML = this.renderCurrentShares(category);
        }
        
        // Update main UI
        this.updateQHSENotesVisibility();
        this.updateSharingInfo(category);
    }

    getSharedUsers(category) {
        const sharing = localStorage.getItem(`qhse_sharing_${category}`);
        return sharing ? JSON.parse(sharing) : [];
    }

    setSharedUsers(category, userIds) {
        localStorage.setItem(`qhse_sharing_${category}`, JSON.stringify(userIds));
    }

    updateSharingInfo(category) {
        const sharedUsers = this.getSharedUsers(category);
        const notesContent = document.querySelector(`#${category}NotesDisplay`).closest('.notes-content');
        
        if (!notesContent) return;

        // Remove existing sharing info
        const existingInfo = notesContent.querySelector('.sharing-info');
        if (existingInfo) existingInfo.remove();

        // Add sharing info if there are shared users
        if (sharedUsers.length > 0) {
            const userNames = sharedUsers.map(userId => {
                const user = this.users.find(u => u.id === userId);
                return user ? user.displayName : 'Unbekannter Nutzer';
            });

            const sharingInfoHtml = `
                <div class="sharing-info">
                    <h4>Freigegeben für:</h4>
                    <div class="shared-users-list">
                        ${userNames.map(name => `<span class="shared-user-tag">${name}</span>`).join('')}
                    </div>
                </div>
            `;

            notesContent.insertAdjacentHTML('beforeend', sharingInfoHtml);
        }
    }
}

// Global dashboard instance for onclick handlers
let dashboard;

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new QHSEDashboard();
    dashboard.initializeSampleData();
});

// Additional utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('de-DE');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export functionality for reports
function exportToCSV(data, filename) {
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Print functionality
function printSection(sectionId) {
    const section = document.getElementById(sectionId);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>QHSE Bericht - Hoffmann & Voss GmbH</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .no-print { display: none; }
                    @media print {
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <h1>Hoffmann & Voss GmbH - QHSE Management System</h1>
                <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
                <hr>
                ${section.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}