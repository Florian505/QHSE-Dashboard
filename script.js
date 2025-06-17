// QHSE Management System JavaScript

class QHSEDashboard {
    constructor() {
        this.currentUserId = 'root-admin';
        this.currentSection = 'dashboard';
        this.documents = this.loadDocumentsFromStorage();
        this.users = this.loadUsersFromStorage();
        this.areas = this.loadAreasFromStorage();
        this.departments = this.loadDepartmentsFromStorage();
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
        this.updateUIForUser();
        this.renderDocumentsInSections();
        this.renderUsersList();
        this.renderAreasList();
        this.renderDepartmentsList();
        this.renderDynamicAreas();
        this.populateUserDropdown();
        this.populateDepartmentDropdowns();
        this.populateDocumentCategories();
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
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'nutzerverwaltung', 'bereichsverwaltung', 'abteilungsverwaltung'],
                canManageUsers: true,
                canManageAreas: true,
                canManageDepartments: true
            },
            admin: {
                name: 'Administrator',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'nutzerverwaltung', 'bereichsverwaltung', 'abteilungsverwaltung'],
                canManageUsers: true,
                canManageAreas: true,
                canManageDepartments: true
            },
            geschaeftsfuehrung: {
                name: 'Geschäftsführung',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente'],
                hierarchyLevel: 1,
                canSupervise: ['betriebsleiter', 'qhse']
            },
            betriebsleiter: {
                name: 'Betriebsleiter',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits'],
                hierarchyLevel: 2,
                canSupervise: ['abteilungsleiter'],
                mustHaveSupervisor: ['geschaeftsfuehrung']
            },
            abteilungsleiter: {
                name: 'Abteilungsleiter',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen'],
                hierarchyLevel: 3,
                canSupervise: ['mitarbeiter'],
                mustHaveSupervisor: ['betriebsleiter']
            },
            qhse: {
                name: 'QHSE-Mitarbeiter',
                allowedSections: ['dashboard', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente'],
                hierarchyLevel: 2,
                isStaffPosition: true,
                mustHaveSupervisor: ['geschaeftsfuehrung']
            },
            mitarbeiter: {
                name: 'Mitarbeiter',
                allowedSections: ['dashboard', 'arbeitsanweisungen'],
                hierarchyLevel: 4,
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
                    dashboard: 'Dashboard',
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
                    abteilungsverwaltung: 'Abteilungsverwaltung'
                };
                
                pageTitle.textContent = sectionTitles[targetSection] || 'Dashboard';
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
        const requiredRoles = ['admin', 'geschaeftsfuehrung', 'betriebsleiter', 'qhse', 'abteilungsleiter', 'mitarbeiter'];
        
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

    // Setup Editable Company Name
    setupEditableCompanyName() {
        const companyNameElement = document.getElementById('companyName');
        const editCompanyBtn = document.getElementById('editCompanyBtn');
        if (!companyNameElement) return;
        
        // Load saved company name from localStorage
        const savedCompanyName = localStorage.getItem('qhse_company_name');
        if (savedCompanyName) {
            companyNameElement.textContent = savedCompanyName;
        }
        
        function startEditing() {
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

    // Initialize dashboard with sample data
    initializeSampleData() {
        // Update KPIs every 30 seconds
        setInterval(() => {
            this.updateKPIs();
        }, 30000);

        // Setup notifications
        this.setupNotifications();
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