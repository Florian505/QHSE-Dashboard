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
        this.safetyAnnouncements = this.loadSafetyAnnouncementsFromStorage();
        this.safetyPdfs = this.loadSafetyPdfsFromStorage();
        this.auditContent = this.loadAuditContentFromStorage();
        this.auditCertifications = this.loadAuditCertificationsFromStorage();
        this.dashboardKpis = this.loadDashboardKpisFromStorage();
        this.customKpis = this.loadCustomKpisFromStorage();
        this.hazardousSubstances = this.loadHazardousSubstancesFromStorage();
        this.trainings = this.loadTrainingsFromStorage();
        this.trainingAssignments = this.loadTrainingAssignmentsFromStorage();
        this.certificates = this.loadCertificatesFromStorage();
        this.suppliers = this.loadSuppliersFromStorage();
        this.supplierEvaluations = this.loadSupplierEvaluationsFromStorage();
        this.supplierDocuments = this.loadSupplierDocumentsFromStorage();
        this.supplierAudits = this.loadSupplierAuditsFromStorage();
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
        // Ensure permission dropdown is populated after settings are configured
        this.populatePermissionUserDropdown();
        this.setupTimeTracking();
        this.setupMaintenanceManagement();
        this.setupSafetyCorner();
        this.setupAuditManagement();
        this.setupAuditCertificationsManagement();
        this.setupDashboardAudits();
        this.setupDashboardKpiManagement();
        this.setupHazardousSubstances();
        this.setupTrainingManagement();
        this.setupSupplierManagement();
        this.setupVacationManagement();
        this.setupUserProfiles();
        this.loadCustomLabels();
        
        // Make dashboard globally available for onclick handlers
        window.qhseDashboard = this;
        
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
            
            // Ensure machine management is properly initialized
            this.ensureMachineManagementWorks();
            
            // Ensure safety corner is properly rendered
            this.renderSafetyAnnouncements();
            this.renderSafetyPdfs();
            
            // Ensure audit content is properly rendered
            this.renderAuditContent();
            this.renderAuditCertifications();
            this.renderDashboardAudits();
            
            // Update dashboard KPIs
            this.updateDashboardKpiDisplay();
            this.renderCustomKpisOnDashboard();
            
            // Initialize supplier management after DOM is ready
            this.initializeSupplierSection();
            
            // Add debug functions to window for testing
            window.debugQHSE = {
                grantGefahrstoffeToUser: (userId) => {
                    this.updateUserModulePermission(userId, 'gefahrstoffe', true);
                },
                checkUserAccess: (userId) => {
                    const user = this.users.find(u => u.id === userId);
                    const moduleSettings = this.loadModuleSettingsFromStorage();
                    console.log('User:', user);
                    console.log('Module Settings:', moduleSettings);
                    console.log('Has Access:', this.userHasGefahrstoffeAccess(user, moduleSettings));
                },
                listUsers: () => {
                    console.table(this.users.map(u => ({
                        id: u.id,
                        name: u.displayName || u.name,
                        role: u.role,
                        gefahrstoffePermission: u.permissions?.gefahrstoffe
                    })));
                }
            };
        }, 500);
    }

    // User Profile Management
    setupUserProfiles() {
        // Setup profile modal handlers
        this.setupProfileModal();
        this.setupProfilePictureUpload();
        this.setupQualificationsManagement();
        this.setupResponsibilitiesManagement();
        this.setupActivityLog();
        this.setupPublicProfileSearch();
    }

    setupProfileModal() {
        const profileModal = document.getElementById('userProfileModal');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const profileDropdown = document.querySelector('.user-profile-dropdown');
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showCurrentUserProfile();
            });
        }

        // Setup profile dropdown if it exists
        if (profileDropdown) {
            const viewProfileBtn = profileDropdown.querySelector('.view-profile-btn');
            const editProfileDropdownBtn = profileDropdown.querySelector('.edit-profile-btn');
            
            if (viewProfileBtn) {
                viewProfileBtn.addEventListener('click', () => {
                    this.showCurrentUserProfile(false); // View mode
                });
            }
            
            if (editProfileDropdownBtn) {
                editProfileDropdownBtn.addEventListener('click', () => {
                    this.showCurrentUserProfile(true); // Edit mode
                });
            }
        }
    }

    showCurrentUserProfile(editMode = false) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            alert('Benutzer nicht gefunden.');
            return;
        }

        this.renderUserProfileModal(currentUser, editMode);
    }

    renderUserProfileModal(user, editMode = false) {
        // Check if modal exists, if not create it
        let modal = document.getElementById('userProfileModal');
        if (!modal) {
            this.createProfileModal();
            modal = document.getElementById('userProfileModal');
        }

        const modalContent = modal.querySelector('.modal-content');
        const userName = user.displayName || user.name || 'Unbekannter Benutzer';
        const userRole = this.getRoleDisplayName(user.role);

        modalContent.innerHTML = `
            <div class="modal-header">
                <h2><i class="fas fa-user"></i> ${editMode ? 'Profil bearbeiten' : 'Mein Profil'}</h2>
                <span class="close" onclick="document.getElementById('userProfileModal').style.display='none'">&times;</span>
            </div>
            <div class="profile-content">
                ${this.renderProfileTabs(user, editMode)}
            </div>
            <div class="modal-footer">
                ${editMode ? 
                    '<button onclick="window.qhseDashboard.saveUserProfile()" class="btn-primary">Speichern</button>' +
                    '<button onclick="document.getElementById(\'userProfileModal\').style.display=\'none\'" class="btn-secondary">Abbrechen</button>'
                    : 
                    '<button onclick="window.qhseDashboard.renderUserProfileModal(window.qhseDashboard.getCurrentUser(), true)" class="btn-primary">Bearbeiten</button>' +
                    '<button onclick="document.getElementById(\'userProfileModal\').style.display=\'none\'" class="btn-secondary">Schließen</button>'
                }
            </div>
        `;

        modal.style.display = 'block';
        this.setupProfileTabs();
    }

    createProfileModal() {
        const modal = document.createElement('div');
        modal.id = 'userProfileModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content profile-modal">
                <!-- Content will be populated by renderUserProfileModal -->
            </div>
        `;
        document.body.appendChild(modal);
    }

    renderProfileTabs(user, editMode) {
        const tabs = [
            { id: 'personal', label: 'Persönliche Daten', icon: 'fas fa-user' },
            { id: 'roles', label: 'Rollen & Berechtigungen', icon: 'fas fa-key' },
            { id: 'qualifications', label: 'Qualifikationen', icon: 'fas fa-certificate' },
            { id: 'responsibilities', label: 'Verantwortlichkeiten', icon: 'fas fa-tasks' },
            { id: 'activity', label: 'Aktivitäten', icon: 'fas fa-history' },
            { id: 'settings', label: 'Sichtbarkeit', icon: 'fas fa-eye' }
        ];

        return `
            <div class="profile-tabs">
                <div class="tab-header">
                    ${tabs.map(tab => `
                        <button class="tab-btn ${tab.id === 'personal' ? 'active' : ''}" 
                                data-tab="${tab.id}">
                            <i class="${tab.icon}"></i> ${tab.label}
                        </button>
                    `).join('')}
                </div>
                <div class="tab-content">
                    ${tabs.map(tab => `
                        <div class="tab-pane ${tab.id === 'personal' ? 'active' : ''}" id="tab-${tab.id}">
                            ${this.renderProfileTabContent(tab.id, user, editMode)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderProfileTabContent(tabId, user, editMode) {
        switch (tabId) {
            case 'personal':
                return this.renderPersonalInfoTab(user, editMode);
            case 'roles':
                return this.renderRolesTab(user, editMode);
            case 'qualifications':
                return this.renderQualificationsTab(user, editMode);
            case 'responsibilities':
                return this.renderResponsibilitiesTab(user, editMode);
            case 'activity':
                return this.renderActivityTab(user, editMode);
            case 'settings':
                return this.renderVisibilityTab(user, editMode);
            default:
                return '<p>Tab-Inhalt wird geladen...</p>';
        }
    }

    renderPersonalInfoTab(user, editMode) {
        const departments = this.departments || [];
        const currentDept = departments.find(d => d.id === user.department);
        
        return `
            <div class="tab-content-header">
                <h3><i class="fas fa-user"></i> Persönliche Daten</h3>
                <button class="btn-primary tab-edit-btn" onclick="window.qhseDashboard.openPersonalDataEditor('${user.id}')">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
            </div>
            
            <div class="profile-info-display">
                <div class="info-grid">
                    <div class="info-group">
                        <label>Vollständiger Name</label>
                        <div class="info-value">${user.displayName || 'Nicht angegeben'}</div>
                    </div>
                    <div class="info-group">
                        <label>Benutzername</label>
                        <div class="info-value">${user.id}</div>
                    </div>
                    <div class="info-group">
                        <label>E-Mail</label>
                        <div class="info-value">${user.email || 'Nicht angegeben'}</div>
                    </div>
                    <div class="info-group">
                        <label>Telefon</label>
                        <div class="info-value">${user.phone || 'Nicht angegeben'}</div>
                    </div>
                    <div class="info-group">
                        <label>Mobil</label>
                        <div class="info-value">${user.mobile || 'Nicht angegeben'}</div>
                    </div>
                    <div class="info-group">
                        <label>Geburtsdatum</label>
                        <div class="info-value">${user.birthdate ? new Date(user.birthdate).toLocaleDateString('de-DE') : 'Nicht angegeben'}</div>
                    </div>
                    <div class="info-group">
                        <label>Abteilung</label>
                        <div class="info-value">${currentDept ? currentDept.name : user.department || 'Nicht angegeben'}</div>
                    </div>
                    <div class="info-group">
                        <label>Position/Jobtitel</label>
                        <div class="info-value">${user.position || 'Nicht angegeben'}</div>
                    </div>
                    <div class="info-group">
                        <label>Adresse</label>
                        <div class="info-value">${user.address ? user.address.replace(/\n/g, '<br>') : 'Nicht angegeben'}</div>
                    </div>
                    <div class="info-group">
                        <label>Notfallkontakt</label>
                        <div class="info-value">${user.emergencyContact || 'Nicht angegeben'}</div>
                    </div>
                    <div class="info-group">
                        <label>Eintrittsdatum</label>
                        <div class="info-value">${user.startDate ? new Date(user.startDate).toLocaleDateString('de-DE') : 'Nicht angegeben'}</div>
                    </div>
                    <div class="info-group">
                        <label>Notizen</label>
                        <div class="info-value">${user.notes || 'Keine Notizen'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Detailed editor functions for each profile section
    openPersonalDataEditor(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const departments = this.departments || [];
        
        const modal = this.createSubModal('personalDataEditor', 'Persönliche Daten bearbeiten');
        modal.querySelector('.modal-body').innerHTML = `
            <div class="editor-form">
                <div class="form-grid">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Vollständiger Name *</label>
                            <input type="text" id="edit_displayName" value="${user.displayName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Benutzername</label>
                            <input type="text" value="${user.id}" disabled>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>E-Mail</label>
                            <input type="email" id="edit_email" value="${user.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>Telefon</label>
                            <input type="tel" id="edit_phone" value="${user.phone || ''}" placeholder="+49 xxx xxxx-xxx">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Mobil</label>
                            <input type="tel" id="edit_mobile" value="${user.mobile || ''}" placeholder="+49 xxx xxxxxxx">
                        </div>
                        <div class="form-group">
                            <label>Geburtsdatum</label>
                            <input type="date" id="edit_birthdate" value="${user.birthdate || ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Abteilung</label>
                            <select id="edit_department">
                                <option value="">Bitte wählen...</option>
                                ${departments.map(dept => `
                                    <option value="${dept.id}" ${dept.id === user.department ? 'selected' : ''}>
                                        ${dept.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Position/Jobtitel</label>
                            <input type="text" id="edit_position" value="${user.position || ''}" placeholder="z.B. Senior Entwickler">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Eintrittsdatum</label>
                            <input type="date" id="edit_startDate" value="${user.startDate || ''}">
                        </div>
                        <div class="form-group">
                            <label>Notfallkontakt</label>
                            <input type="text" id="edit_emergencyContact" value="${user.emergencyContact || ''}" 
                                   placeholder="Name und Telefonnummer">
                        </div>
                    </div>
                    <div class="form-group full-width">
                        <label>Adresse</label>
                        <textarea id="edit_address" rows="3" placeholder="Straße, Hausnummer
PLZ Ort">${user.address || ''}</textarea>
                    </div>
                    <div class="form-group full-width">
                        <label>Notizen</label>
                        <textarea id="edit_notes" rows="3" placeholder="Zusätzliche Informationen...">${user.notes || ''}</textarea>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('.modal-footer').innerHTML = `
            <button onclick="window.qhseDashboard.savePersonalData('${userId}')" class="btn-primary">
                <i class="fas fa-save"></i> Speichern
            </button>
            <button onclick="window.qhseDashboard.closeSubModal('personalDataEditor')" class="btn-secondary">
                Abbrechen
            </button>
        `;

        modal.style.display = 'block';
    }

    savePersonalData(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        // Get form values
        user.displayName = document.getElementById('edit_displayName').value;
        user.email = document.getElementById('edit_email').value;
        user.phone = document.getElementById('edit_phone').value;
        user.mobile = document.getElementById('edit_mobile').value;
        user.birthdate = document.getElementById('edit_birthdate').value;
        user.department = document.getElementById('edit_department').value;
        user.position = document.getElementById('edit_position').value;
        user.startDate = document.getElementById('edit_startDate').value;
        user.emergencyContact = document.getElementById('edit_emergencyContact').value;
        user.address = document.getElementById('edit_address').value;
        user.notes = document.getElementById('edit_notes').value;

        // Save to storage
        this.saveUsersToStorage();

        // Update UI
        this.updateUIForUser();
        this.populateUserDropdown();

        // Close modal
        this.closeSubModal('personalDataEditor');

        // Refresh profile modal if open
        const profileModal = document.getElementById('userProfileModal');
        if (profileModal && profileModal.style.display === 'block') {
            this.showCurrentUserProfile();
        }

        alert('Persönliche Daten erfolgreich gespeichert!');
    }

    createSubModal(id, title) {
        // Remove existing modal if any
        const existing = document.getElementById(id);
        if (existing) {
            existing.remove();
        }

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal sub-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> ${title}</h2>
                    <span class="close" onclick="window.qhseDashboard.closeSubModal('${id}')">&times;</span>
                </div>
                <div class="modal-body">
                    <!-- Content will be populated -->
                </div>
                <div class="modal-footer">
                    <!-- Buttons will be populated -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    closeSubModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    }

    // Roles Editor
    openRolesEditor(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const currentUser = this.getCurrentUser();
        const canEditRoles = currentUser && (currentUser.role === 'root-admin' || currentUser.role === 'admin');
        
        const modal = this.createSubModal('rolesEditor', 'Rollen & Berechtigungen verwalten');
        modal.querySelector('.modal-body').innerHTML = `
            <div class="roles-editor">
                <div class="current-role-section">
                    <h4><i class="fas fa-user-tag"></i> Aktuelle Systemrolle</h4>
                    <div class="role-display">
                        <div class="role-info">
                            <h5>${this.getRoleDisplayName(user.role)}</h5>
                            <p><strong>Systemrolle:</strong> <code>${user.role}</code></p>
                            <p><strong>Status:</strong> <span class="status-badge ${user.isActive ? 'valid' : 'inactive'}">${user.isActive ? 'Aktiv' : 'Inaktiv'}</span></p>
                        </div>
                        ${canEditRoles ? `
                            <div class="role-actions">
                                <button onclick="window.qhseDashboard.showRoleChangeForm()" class="btn-primary">
                                    <i class="fas fa-exchange-alt"></i> Rolle ändern
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${canEditRoles ? `
                    <div id="roleChangeForm" style="display: none;">
                        <h4>Rolle ändern</h4>
                        <div class="form-group">
                            <label>Neue Rolle wählen:</label>
                            <select id="newUserRole">
                                ${Object.entries(this.roleDefinitions).map(([roleKey, roleDef]) => `
                                    <option value="${roleKey}" ${roleKey === user.role ? 'selected' : ''}>${roleDef.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-actions">
                            <button onclick="window.qhseDashboard.saveRoleChange('${userId}')" class="btn-primary">
                                <i class="fas fa-save"></i> Rolle speichern
                            </button>
                            <button onclick="window.qhseDashboard.hideRoleChangeForm()" class="btn-secondary">
                                Abbrechen
                            </button>
                        </div>
                    </div>
                ` : ''}

                <div class="permissions-section">
                    <h4><i class="fas fa-key"></i> Berechtigungen</h4>
                    <div class="permissions-display">
                        ${this.renderUserPermissions(user)}
                    </div>
                </div>

                <div class="special-permissions-section">
                    <h4><i class="fas fa-star"></i> Spezielle Modulberechtigungen</h4>
                    <div class="special-permissions-display">
                        ${this.renderSpecialPermissions(user, canEditRoles)}
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('.modal-footer').innerHTML = `
            <button onclick="window.qhseDashboard.closeSubModal('rolesEditor')" class="btn-secondary">
                Schließen
            </button>
        `;

        modal.style.display = 'block';
    }

    renderUserPermissions(user) {
        const roleDefinition = this.roleDefinitions[user.role];
        const allowedSections = roleDefinition ? roleDefinition.allowedSections || [] : [];
        
        return `
            <div class="permissions-grid">
                ${allowedSections.map(section => `
                    <div class="permission-item granted">
                        <i class="fas fa-check-circle"></i>
                        <span>${this.getSectionDisplayName(section)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSpecialPermissions(user, canEdit) {
        const permissions = user.permissions || {};
        const modules = ['gefahrstoffe', 'zeitauswertung', 'maschinen-verwaltung'];
        
        return `
            <div class="special-permissions-list">
                ${modules.map(module => {
                    const hasAccess = permissions[module] !== false; // Default true unless explicitly denied
                    return `
                        <div class="special-permission-item">
                            <div class="permission-info">
                                <h5>${this.getModuleDisplayName(module)}</h5>
                                <span class="permission-status ${hasAccess ? 'granted' : 'denied'}">
                                    <i class="fas ${hasAccess ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                    ${hasAccess ? 'Erlaubt' : 'Verweigert'}
                                </span>
                            </div>
                            ${canEdit ? `
                                <div class="permission-actions">
                                    <button onclick="window.qhseDashboard.toggleModulePermission('${user.id}', '${module}')" 
                                            class="btn-small ${hasAccess ? 'btn-danger' : 'btn-success'}">
                                        ${hasAccess ? 'Entziehen' : 'Gewähren'}
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    showRoleChangeForm() {
        document.getElementById('roleChangeForm').style.display = 'block';
    }

    hideRoleChangeForm() {
        document.getElementById('roleChangeForm').style.display = 'none';
    }

    saveRoleChange(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const newRole = document.getElementById('newUserRole').value;
        if (!newRole || newRole === user.role) {
            alert('Keine Änderung vorgenommen.');
            return;
        }

        if (confirm(`Möchten Sie die Rolle von "${this.getRoleDisplayName(user.role)}" zu "${this.getRoleDisplayName(newRole)}" ändern?`)) {
            user.role = newRole;
            this.saveUsersToStorage();
            
            // Refresh the editor
            this.openRolesEditor(userId);
            
            // Update main UI if it's the current user
            if (userId === this.currentUserId) {
                this.updateUIForUser();
            }
            
            alert('Rolle erfolgreich geändert!');
        }
    }

    toggleModulePermission(userId, module) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (!user.permissions) {
            user.permissions = {};
        }

        const currentAccess = user.permissions[module] !== false;
        user.permissions[module] = !currentAccess;
        
        this.saveUsersToStorage();
        
        // Refresh the editor
        this.openRolesEditor(userId);
        
        const action = currentAccess ? 'entzogen' : 'gewährt';
        alert(`Berechtigung für ${this.getModuleDisplayName(module)} wurde ${action}.`);
    }

    getModuleDisplayName(module) {
        const moduleNames = {
            'gefahrstoffe': 'Gefahrstoffverzeichnis',
            'zeitauswertung': 'Zeitauswertung',
            'maschinen-verwaltung': 'Maschinenmanagement'
        };
        return moduleNames[module] || module;
    }

    // Responsibilities Editor
    openResponsibilitiesEditor(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        const modal = this.createSubModal('responsibilitiesEditor', 'Verantwortlichkeiten verwalten');
        modal.querySelector('.modal-body').innerHTML = `
            <div class="responsibilities-editor">
                <div class="resp-summary">
                    <h4><i class="fas fa-tasks"></i> Verantwortlichkeiten Übersicht</h4>
                    <div class="resp-stats">
                        <div class="resp-stat">
                            <span class="stat-number">${this.getMachineResponsibilitiesCount(user)}</span>
                            <span class="stat-label">Maschinen</span>
                        </div>
                        <div class="resp-stat">
                            <span class="stat-number">${this.getSubstanceResponsibilitiesCount(user)}</span>
                            <span class="stat-label">Gefahrstoffe</span>
                        </div>
                        <div class="resp-stat">
                            <span class="stat-number">${this.getAuditResponsibilitiesCount(user)}</span>
                            <span class="stat-label">Prüfungen</span>
                        </div>
                        <div class="resp-stat">
                            <span class="stat-number">${this.getStaffResponsibilitiesCount(user)}</span>
                            <span class="stat-label">Mitarbeiter</span>
                        </div>
                    </div>
                </div>

                <div class="resp-categories">
                    <div class="resp-category-editor">
                        <h4><i class="fas fa-cogs"></i> Maschinen & Anlagen</h4>
                        <div class="resp-content">
                            ${this.renderMachineResponsibilitiesEditor(user)}
                        </div>
                    </div>
                    
                    <div class="resp-category-editor">
                        <h4><i class="fas fa-flask"></i> Gefahrstoffe</h4>
                        <div class="resp-content">
                            ${this.renderSubstanceResponsibilitiesEditor(user)}
                        </div>
                    </div>
                    
                    <div class="resp-category-editor">
                        <h4><i class="fas fa-clipboard-check"></i> Prüfungen & Audits</h4>
                        <div class="resp-content">
                            ${this.renderAuditResponsibilitiesEditor(user)}
                        </div>
                    </div>
                    
                    <div class="resp-category-editor">
                        <h4><i class="fas fa-users"></i> Mitarbeiterverantwortung</h4>
                        <div class="resp-content">
                            ${this.renderStaffResponsibilitiesEditor(user)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('.modal-footer').innerHTML = `
            <button onclick="window.qhseDashboard.closeSubModal('responsibilitiesEditor')" class="btn-secondary">
                Schließen
            </button>
        `;

        modal.style.display = 'block';
    }

    getMachineResponsibilitiesCount(user) {
        // Count machines assigned to this user
        const machines = this.machines || [];
        return machines.filter(machine => machine.responsiblePerson === user.id).length;
    }

    getSubstanceResponsibilitiesCount(user) {
        // Count hazardous substances assigned to this user
        const substances = this.hazardousSubstances || [];
        return substances.filter(substance => substance.responsiblePerson === user.id).length;
    }

    getAuditResponsibilitiesCount(user) {
        // Count audits assigned to this user (simplified)
        return user.assignedAudits ? user.assignedAudits.length : 0;
    }

    getStaffResponsibilitiesCount(user) {
        // Count staff under this user's supervision
        const subordinates = this.users.filter(u => u.supervisor === user.id);
        return subordinates.length;
    }

    renderMachineResponsibilitiesEditor(user) {
        const machines = this.machines || [];
        const userMachines = machines.filter(machine => machine.responsiblePerson === user.id);
        
        return `
            <div class="responsibility-section">
                ${userMachines.length === 0 ? 
                    '<p class="no-data">Keine Maschinenverantwortlichkeiten zugewiesen.</p>' :
                    `<div class="responsibility-list">
                        ${userMachines.map(machine => `
                            <div class="responsibility-item">
                                <div class="item-info">
                                    <h5>${machine.name}</h5>
                                    <p>Seriennummer: ${machine.serialNumber || 'Nicht angegeben'}</p>
                                    <span class="status-badge ${machine.status}">${machine.status || 'Unbekannt'}</span>
                                </div>
                                <div class="item-actions">
                                    <button onclick="window.qhseDashboard.viewMachineDetails('${machine.id}')" class="btn-small btn-secondary">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>`
                }
            </div>
        `;
    }

    renderSubstanceResponsibilitiesEditor(user) {
        const substances = this.hazardousSubstances || [];
        const userSubstances = substances.filter(substance => substance.responsiblePerson === user.id);
        
        return `
            <div class="responsibility-section">
                ${userSubstances.length === 0 ? 
                    '<p class="no-data">Keine Gefahrstoff-Verantwortlichkeiten zugewiesen.</p>' :
                    `<div class="responsibility-list">
                        ${userSubstances.map(substance => `
                            <div class="responsibility-item">
                                <div class="item-info">
                                    <h5>${substance.name}</h5>
                                    <p>CAS-Nr.: ${substance.casNumber || 'Nicht angegeben'}</p>
                                    <span class="hazard-class">${substance.hazardClass || 'Unbekannt'}</span>
                                </div>
                                <div class="item-actions">
                                    <button onclick="window.qhseDashboard.viewSubstanceDetails('${substance.id}')" class="btn-small btn-secondary">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>`
                }
            </div>
        `;
    }

    renderAuditResponsibilitiesEditor(user) {
        const assignedAudits = user.assignedAudits || [];
        
        return `
            <div class="responsibility-section">
                ${assignedAudits.length === 0 ? 
                    '<p class="no-data">Keine Audit-Verantwortlichkeiten zugewiesen.</p>' :
                    `<div class="responsibility-list">
                        ${assignedAudits.map(audit => `
                            <div class="responsibility-item">
                                <div class="item-info">
                                    <h5>${audit.title}</h5>
                                    <p>Fällig: ${audit.dueDate ? new Date(audit.dueDate).toLocaleDateString('de-DE') : 'Nicht angegeben'}</p>
                                    <span class="status-badge ${audit.status}">${audit.status || 'Offen'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>`
                }
                <div class="add-responsibility">
                    <button onclick="window.qhseDashboard.showAddAuditForm('${user.id}')" class="btn-primary btn-sm">
                        <i class="fas fa-plus"></i> Prüfung zuweisen
                    </button>
                </div>
            </div>
        `;
    }

    renderStaffResponsibilitiesEditor(user) {
        const subordinates = this.users.filter(u => u.supervisor === user.id);
        
        return `
            <div class="responsibility-section">
                ${subordinates.length === 0 ? 
                    '<p class="no-data">Keine Mitarbeiter unter Ihrer Aufsicht.</p>' :
                    `<div class="responsibility-list">
                        ${subordinates.map(subordinate => `
                            <div class="responsibility-item">
                                <div class="item-info">
                                    <h5>${subordinate.displayName}</h5>
                                    <p>Rolle: ${this.getRoleDisplayName(subordinate.role)}</p>
                                    <p>Abteilung: ${subordinate.department || 'Nicht angegeben'}</p>
                                </div>
                                <div class="item-actions">
                                    <button onclick="window.qhseDashboard.viewEmployeeProfile('${subordinate.id}')" class="btn-small btn-secondary">
                                        <i class="fas fa-user"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>`
                }
            </div>
        `;
    }

    // Activity Editor
    openActivityEditor(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        const activities = this.getUserActivities(userId);
        
        const modal = this.createSubModal('activityEditor', 'Aktivitätsverlauf verwalten');
        modal.querySelector('.modal-body').innerHTML = `
            <div class="activity-editor">
                <div class="activity-summary">
                    <h4><i class="fas fa-chart-bar"></i> Aktivitäts-Statistiken</h4>
                    <div class="activity-stats">
                        <div class="stat-card">
                            <h5>${activities.length}</h5>
                            <p>Gesamt-Aktivitäten</p>
                        </div>
                        <div class="stat-card">
                            <h5>${activities.filter(a => a.timestamp > Date.now() - 7*24*60*60*1000).length}</h5>
                            <p>Diese Woche</p>
                        </div>
                        <div class="stat-card">
                            <h5>${activities.filter(a => a.timestamp > Date.now() - 30*24*60*60*1000).length}</h5>
                            <p>Letzten 30 Tage</p>
                        </div>
                    </div>
                </div>

                <div class="activity-management">
                    <div class="activity-controls">
                        <h4><i class="fas fa-filter"></i> Filter & Einstellungen</h4>
                        <div class="control-row">
                            <select id="activityTypeFilter">
                                <option value="all">Alle Aktivitäten</option>
                                <option value="documents">Dokumente</option>
                                <option value="audits">Prüfungen</option>
                                <option value="machines">Maschinen</option>
                                <option value="substances">Gefahrstoffe</option>
                                <option value="profile">Profil-Änderungen</option>
                            </select>
                            <button onclick="window.qhseDashboard.filterActivities()" class="btn-secondary">
                                <i class="fas fa-search"></i> Filtern
                            </button>
                        </div>
                    </div>

                    <div class="activity-settings">
                        <h4><i class="fas fa-cog"></i> Aktivitäts-Einstellungen</h4>
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="trackDocumentActivity" ${user.activitySettings?.trackDocuments !== false ? 'checked' : ''}>
                                Dokument-Aktivitäten verfolgen
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="trackProfileActivity" ${user.activitySettings?.trackProfile !== false ? 'checked' : ''}>
                                Profil-Änderungen verfolgen
                            </label>
                        </div>
                        <div class="setting-actions">
                            <button onclick="window.qhseDashboard.saveActivitySettings('${userId}')" class="btn-primary">
                                <i class="fas fa-save"></i> Einstellungen speichern
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('.modal-footer').innerHTML = `
            <button onclick="window.qhseDashboard.closeSubModal('activityEditor')" class="btn-secondary">
                Schließen
            </button>
        `;

        modal.style.display = 'block';
    }

    saveActivitySettings(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (!user.activitySettings) {
            user.activitySettings = {};
        }

        user.activitySettings.trackDocuments = document.getElementById('trackDocumentActivity').checked;
        user.activitySettings.trackProfile = document.getElementById('trackProfileActivity').checked;

        this.saveUsersToStorage();
        alert('Aktivitäts-Einstellungen gespeichert!');
    }

    // Visibility Editor
    openVisibilityEditor(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        const visibility = user.profileVisibility || {
            name: true,
            department: true,
            position: true,
            phone: false,
            email: false,
            responsibilities: true,
            qualifications: true
        };
        
        const modal = this.createSubModal('visibilityEditor', 'Profilsichtbarkeit verwalten');
        modal.querySelector('.modal-body').innerHTML = `
            <div class="visibility-editor">
                <div class="visibility-preview">
                    <h4><i class="fas fa-eye"></i> Sichtbarkeits-Vorschau</h4>
                    <p class="section-description">So sehen andere Benutzer Ihr Profil</p>
                    
                    <div class="preview-profile">
                        <div class="preview-header">
                            <h5>${user.displayName}</h5>
                            <p class="preview-role">${this.getRoleDisplayName(user.role)}</p>
                        </div>
                        <div class="preview-fields" id="visibilityPreview">
                            ${this.renderVisibilityPreview(user, visibility)}
                        </div>
                    </div>
                </div>

                <div class="visibility-controls">
                    <h4><i class="fas fa-sliders-h"></i> Sichtbarkeits-Einstellungen</h4>
                    <div class="visibility-options">
                        ${Object.entries(visibility).map(([field, visible]) => `
                            <div class="visibility-option">
                                <label class="toggle-label">
                                    <input type="checkbox" id="visibility_${field}" ${visible ? 'checked' : ''} 
                                           onchange="window.qhseDashboard.updateVisibilityPreview()">
                                    <span class="toggle-switch"></span>
                                    <div class="option-info">
                                        <h5>${this.getFieldDisplayName(field)}</h5>
                                        <p class="field-description">${this.getFieldDescription(field)}</p>
                                    </div>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="gdpr-notice">
                    <i class="fas fa-balance-scale"></i>
                    <p><strong>DSGVO-Hinweis:</strong> Sie können Ihre Sichtbarkeitseinstellungen jederzeit ändern.</p>
                </div>
            </div>
        `;

        modal.querySelector('.modal-footer').innerHTML = `
            <button onclick="window.qhseDashboard.saveVisibilitySettings('${userId}')" class="btn-primary">
                <i class="fas fa-save"></i> Einstellungen speichern
            </button>
            <button onclick="window.qhseDashboard.closeSubModal('visibilityEditor')" class="btn-secondary">
                Schließen
            </button>
        `;

        modal.style.display = 'block';
    }

    renderVisibilityPreview(user, visibility) {
        return `
            ${visibility.name ? `<div class="preview-field"><strong>Name:</strong> ${user.displayName}</div>` : ''}
            ${visibility.department ? `<div class="preview-field"><strong>Abteilung:</strong> ${user.department || 'Nicht angegeben'}</div>` : ''}
            ${visibility.position ? `<div class="preview-field"><strong>Position:</strong> ${user.position || 'Nicht angegeben'}</div>` : ''}
            ${visibility.phone ? `<div class="preview-field"><strong>Telefon:</strong> ${user.phone || 'Nicht angegeben'}</div>` : ''}
            ${visibility.email ? `<div class="preview-field"><strong>E-Mail:</strong> ${user.email || 'Nicht angegeben'}</div>` : ''}
            ${visibility.responsibilities ? `<div class="preview-field"><strong>Verantwortlichkeiten:</strong> Sichtbar</div>` : ''}
            ${visibility.qualifications ? `<div class="preview-field"><strong>Qualifikationen:</strong> Sichtbar</div>` : ''}
        `;
    }

    updateVisibilityPreview() {
        const visibilityInputs = document.querySelectorAll('[id^="visibility_"]');
        const newVisibility = {};
        
        visibilityInputs.forEach(input => {
            const field = input.id.replace('visibility_', '');
            newVisibility[field] = input.checked;
        });

        const currentUser = this.getCurrentUser();
        const previewContainer = document.getElementById('visibilityPreview');
        if (previewContainer) {
            previewContainer.innerHTML = this.renderVisibilityPreview(currentUser, newVisibility);
        }
    }

    saveVisibilitySettings(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const visibilityInputs = document.querySelectorAll('[id^="visibility_"]');
        const newVisibility = {};
        
        visibilityInputs.forEach(input => {
            const field = input.id.replace('visibility_', '');
            newVisibility[field] = input.checked;
        });

        user.profileVisibility = newVisibility;
        this.saveUsersToStorage();
        
        alert('Sichtbarkeits-Einstellungen erfolgreich gespeichert!');
        this.closeSubModal('visibilityEditor');
    }

    // Helper methods for profile functionality
    getUserActivities(userId) {
        // Simple placeholder for now - in a real system this would come from a database
        const activities = [
            {
                id: '1',
                type: 'profile',
                title: 'Profil aktualisiert',
                description: 'Persönliche Daten wurden geändert',
                timestamp: Date.now() - 2*24*60*60*1000,
                details: 'Telefonnummer aktualisiert'
            },
            {
                id: '2',
                type: 'documents',
                title: 'Dokument hochgeladen',
                description: 'Neues Sicherheitsdokument hinzugefügt',
                timestamp: Date.now() - 5*24*60*60*1000,
                details: 'Arbeitsschutz-Richtlinie.pdf'
            },
            {
                id: '3',
                type: 'qualifications',
                title: 'Qualifikation hinzugefügt',
                description: 'Neue Schulung abgeschlossen',
                timestamp: Date.now() - 10*24*60*60*1000,
                details: 'Brandschutz-Schulung'
            }
        ];
        return activities;
    }

    getActivityIcon(type) {
        const icons = {
            'profile': 'fas fa-user',
            'documents': 'fas fa-file',
            'audits': 'fas fa-clipboard-check',
            'machines': 'fas fa-cogs',
            'substances': 'fas fa-flask',
            'qualifications': 'fas fa-certificate',
            'system': 'fas fa-computer'
        };
        return icons[type] || 'fas fa-info-circle';
    }

    getFieldDisplayName(field) {
        const fieldNames = {
            'name': 'Name',
            'department': 'Abteilung',
            'position': 'Position',
            'phone': 'Telefon',
            'email': 'E-Mail',
            'responsibilities': 'Verantwortlichkeiten',
            'qualifications': 'Qualifikationen'
        };
        return fieldNames[field] || field;
    }

    getFieldDescription(field) {
        const descriptions = {
            'name': 'Ihr vollständiger Name wird anderen Benutzern angezeigt',
            'department': 'Ihre Abteilungszugehörigkeit ist für andere sichtbar',
            'position': 'Ihre Berufsbezeichnung wird in der Benutzerliste angezeigt',
            'phone': 'Ihre Telefonnummer kann von anderen Benutzern eingesehen werden',
            'email': 'Ihre E-Mail-Adresse ist für andere Benutzer sichtbar',
            'responsibilities': 'Ihre Verantwortlichkeiten werden in Ihrem Profil angezeigt',
            'qualifications': 'Ihre Qualifikationen sind für andere Benutzer einsehbar'
        };
        return descriptions[field] || 'Beschreibung nicht verfügbar';
    }

    getSectionDisplayName(section) {
        const sectionNames = {
            'dashboard': 'Dashboard',
            'arbeitsschutz': 'Arbeitsschutz',
            'qualitaet': 'Qualität',
            'umwelt': 'Umwelt',
            'datenschutz': 'Datenschutz',
            'gesundheit': 'Gesundheit',
            'audits': 'Audits',
            'kundenzufriedenheit': 'Kundenzufriedenheit',
            'dokumente': 'Dokumentenverwaltung',
            'nutzerverwaltung': 'Nutzerverwaltung',
            'einstellungen': 'Einstellungen',
            'zeiterfassung': 'Zeiterfassung',
            'maschinen': 'Maschinenmanagement',
            'gefahrstoffe': 'Gefahrstoffverzeichnis'
        };
        return sectionNames[section] || section;
    }

    renderMachineResponsibilities(user) {
        const machines = this.machines || [];
        const userMachines = machines.filter(machine => machine.responsiblePerson === user.id);
        
        if (userMachines.length === 0) {
            return '<p class="no-data">Keine Maschinenverantwortlichkeiten zugewiesen.</p>';
        }

        return `
            <div class="responsibility-list">
                ${userMachines.slice(0, 3).map(machine => `
                    <div class="responsibility-item-compact">
                        <span class="item-name">${machine.name}</span>
                        <span class="item-status status-badge ${machine.status}">${machine.status || 'Unbekannt'}</span>
                    </div>
                `).join('')}
                ${userMachines.length > 3 ? `<p class="more-items">und ${userMachines.length - 3} weitere...</p>` : ''}
            </div>
        `;
    }

    renderHazardousSubstanceResponsibilities(user) {
        const substances = this.hazardousSubstances || [];
        const userSubstances = substances.filter(substance => substance.responsiblePerson === user.id);
        
        if (userSubstances.length === 0) {
            return '<p class="no-data">Keine Gefahrstoff-Verantwortlichkeiten zugewiesen.</p>';
        }

        return `
            <div class="responsibility-list">
                ${userSubstances.slice(0, 3).map(substance => `
                    <div class="responsibility-item-compact">
                        <span class="item-name">${substance.name}</span>
                        <span class="item-hazard">${substance.hazardClass || 'Unbekannt'}</span>
                    </div>
                `).join('')}
                ${userSubstances.length > 3 ? `<p class="more-items">und ${userSubstances.length - 3} weitere...</p>` : ''}
            </div>
        `;
    }

    renderAuditResponsibilities(user) {
        const assignedAudits = user.assignedAudits || [];
        
        if (assignedAudits.length === 0) {
            return '<p class="no-data">Keine Audit-Verantwortlichkeiten zugewiesen.</p>';
        }

        return `
            <div class="responsibility-list">
                ${assignedAudits.slice(0, 3).map(audit => `
                    <div class="responsibility-item-compact">
                        <span class="item-name">${audit.title}</span>
                        <span class="item-status status-badge ${audit.status}">${audit.status || 'Offen'}</span>
                    </div>
                `).join('')}
                ${assignedAudits.length > 3 ? `<p class="more-items">und ${assignedAudits.length - 3} weitere...</p>` : ''}
            </div>
        `;
    }

    renderStaffResponsibilities(user) {
        const subordinates = this.users.filter(u => u.supervisor === user.id);
        
        if (subordinates.length === 0) {
            return '<p class="no-data">Keine Mitarbeiter unter Ihrer Aufsicht.</p>';
        }

        return `
            <div class="responsibility-list">
                ${subordinates.slice(0, 3).map(subordinate => `
                    <div class="responsibility-item-compact">
                        <span class="item-name">${subordinate.displayName}</span>
                        <span class="item-role">${this.getRoleDisplayName(subordinate.role)}</span>
                    </div>
                `).join('')}
                ${subordinates.length > 3 ? `<p class="more-items">und ${subordinates.length - 3} weitere...</p>` : ''}
            </div>
        `;
    }

    renderRolesTab(user, editMode) {
        const roleDefinition = this.roleDefinitions[user.role];
        const allowedSections = roleDefinition ? roleDefinition.allowedSections || [] : [];
        
        return `
            <div class="tab-content-header">
                <h3><i class="fas fa-key"></i> Rollen & Berechtigungen</h3>
                <button class="btn-primary tab-edit-btn" onclick="window.qhseDashboard.openRolesEditor('${user.id}')">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
            </div>
            
            <div class="roles-display">
                <div class="current-role">
                    <div class="role-card">
                        <h4><i class="fas fa-user-tag"></i> Aktuelle Systemrolle</h4>
                        <div class="role-info">
                            <h5>${this.getRoleDisplayName(user.role)}</h5>
                            <p><strong>Systemrolle:</strong> <code>${user.role}</code></p>
                            <p><strong>Aktiv seit:</strong> ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}</p>
                            <p><strong>Status:</strong> <span class="status-badge ${user.isActive ? 'valid' : 'inactive'}">${user.isActive ? 'Aktiv' : 'Inaktiv'}</span></p>
                        </div>
                    </div>
                </div>
                
                <div class="permissions-overview">
                    <h4><i class="fas fa-key"></i> Standard-Berechtigungen</h4>
                    <div class="permissions-grid">
                        ${allowedSections.map(section => `
                            <div class="permission-item granted">
                                <i class="fas fa-check-circle"></i>
                                <span>${this.getSectionDisplayName(section)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${user.permissions ? `
                    <div class="special-permissions">
                        <h4><i class="fas fa-star"></i> Spezielle Modulberechtigungen</h4>
                        <div class="permissions-grid">
                            ${Object.entries(user.permissions).map(([module, hasAccess]) => `
                                <div class="permission-item ${hasAccess ? 'granted' : 'denied'}">
                                    <i class="fas ${hasAccess ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                    <span>${module}: ${hasAccess ? 'Erlaubt' : 'Verweigert'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderQualificationsTab(user, editMode) {
        const qualifications = user.qualifications || [];
        
        return `
            <div class="tab-content-header">
                <h3><i class="fas fa-certificate"></i> Qualifikationen & Schulungen</h3>
                <button class="btn-primary tab-edit-btn" onclick="window.qhseDashboard.openQualificationsEditor('${user.id}')">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
            </div>
            
            <div class="qualifications-display">
                ${qualifications.length === 0 ? 
                    '<p class="no-data">Keine Qualifikationen erfasst.</p>' :
                    `<div class="qualifications-list">
                        ${qualifications.map((qual, index) => {
                            const isExpired = qual.expiryDate && new Date(qual.expiryDate) < new Date();
                            const daysUntilExpiry = qual.expiryDate ? Math.ceil((new Date(qual.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                            const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                            
                            return `
                                <div class="qualification-item ${isExpired ? 'expired' : isExpiringSoon ? 'expiring-soon' : ''}">
                                    <div class="qual-header">
                                        <h5>${qual.title}</h5>
                                        <div class="qual-status">
                                            ${isExpired ? '<span class="status-badge expired">Abgelaufen</span>' : 
                                              isExpiringSoon ? '<span class="status-badge expiring">Läuft bald ab</span>' : 
                                              '<span class="status-badge valid">Gültig</span>'}
                                        </div>
                                    </div>
                                    <div class="qual-details">
                                        <div class="qual-info">
                                            <p><strong>Erhalten am:</strong> ${qual.date ? new Date(qual.date).toLocaleDateString('de-DE') : 'Nicht angegeben'}</p>
                                            ${qual.expiryDate ? `<p><strong>Gültig bis:</strong> ${new Date(qual.expiryDate).toLocaleDateString('de-DE')}</p>` : ''}
                                            ${qual.institution ? `<p><strong>Institution:</strong> ${qual.institution}</p>` : ''}
                                            ${qual.description ? `<p><strong>Beschreibung:</strong> ${qual.description}</p>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>`
                }
            </div>
        `;
    }

    openQualificationsEditor(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const qualifications = user.qualifications || [];
        
        const modal = this.createSubModal('qualificationsEditor', 'Qualifikationen & Schulungen verwalten');
        modal.querySelector('.modal-body').innerHTML = `
            <div class="qualifications-editor">
                <div class="editor-header">
                    <h4>Vorhandene Qualifikationen</h4>
                    <button onclick="window.qhseDashboard.showAddQualificationForm()" class="btn-primary">
                        <i class="fas fa-plus"></i> Neue Qualifikation hinzufügen
                    </button>
                </div>
                
                <div class="qualifications-list" id="editQualificationsList">
                    ${qualifications.map((qual, index) => `
                        <div class="qualification-edit-item" data-index="${index}">
                            <div class="qual-content">
                                <h5>${qual.title}</h5>
                                <div class="qual-meta">
                                    <span>Erhalten: ${qual.date ? new Date(qual.date).toLocaleDateString('de-DE') : 'Unbekannt'}</span>
                                    ${qual.expiryDate ? `<span>Gültig bis: ${new Date(qual.expiryDate).toLocaleDateString('de-DE')}</span>` : ''}
                                    ${qual.institution ? `<span>Institution: ${qual.institution}</span>` : ''}
                                </div>
                            </div>
                            <div class="qual-actions">
                                <button onclick="window.qhseDashboard.editQualification(${index})" class="btn-small btn-secondary">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="window.qhseDashboard.deleteQualification(${index})" class="btn-small btn-danger">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div id="qualificationForm" style="display: none;">
                    <h4 id="qualFormTitle">Neue Qualifikation</h4>
                    <div class="form-grid">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Titel/Bezeichnung *</label>
                                <input type="text" id="qual_title" required placeholder="z.B. Gabelstaplerführerschein">
                            </div>
                            <div class="form-group">
                                <label>Institution/Anbieter</label>
                                <input type="text" id="qual_institution" placeholder="z.B. TÜV Nord">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Datum erhalten</label>
                                <input type="date" id="qual_date">
                            </div>
                            <div class="form-group">
                                <label>Gültig bis (optional)</label>
                                <input type="date" id="qual_expiry">
                            </div>
                        </div>
                        <div class="form-group full-width">
                            <label>Beschreibung/Notizen</label>
                            <textarea id="qual_description" rows="3" placeholder="Zusätzliche Informationen zur Qualifikation..."></textarea>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button onclick="window.qhseDashboard.saveQualification('${userId}')" class="btn-primary">
                            <i class="fas fa-save"></i> Speichern
                        </button>
                        <button onclick="window.qhseDashboard.cancelQualificationForm()" class="btn-secondary">
                            Abbrechen
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('.modal-footer').innerHTML = `
            <button onclick="window.qhseDashboard.closeSubModal('qualificationsEditor')" class="btn-secondary">
                Schließen
            </button>
        `;

        modal.style.display = 'block';
    }

    showAddQualificationForm() {
        document.getElementById('qualFormTitle').textContent = 'Neue Qualifikation hinzufügen';
        document.getElementById('qualificationForm').style.display = 'block';
        document.getElementById('qual_title').value = '';
        document.getElementById('qual_institution').value = '';
        document.getElementById('qual_date').value = '';
        document.getElementById('qual_expiry').value = '';
        document.getElementById('qual_description').value = '';
        
        // Store that we're adding a new qualification
        window.currentQualificationIndex = -1;
    }

    editQualification(index) {
        const currentUser = this.getCurrentUser();
        const qualification = currentUser.qualifications[index];
        
        document.getElementById('qualFormTitle').textContent = 'Qualifikation bearbeiten';
        document.getElementById('qualificationForm').style.display = 'block';
        document.getElementById('qual_title').value = qualification.title || '';
        document.getElementById('qual_institution').value = qualification.institution || '';
        document.getElementById('qual_date').value = qualification.date || '';
        document.getElementById('qual_expiry').value = qualification.expiryDate || '';
        document.getElementById('qual_description').value = qualification.description || '';
        
        // Store the index we're editing
        window.currentQualificationIndex = index;
    }

    saveQualification(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const title = document.getElementById('qual_title').value.trim();
        if (!title) {
            alert('Bitte geben Sie einen Titel für die Qualifikation ein.');
            return;
        }

        const qualification = {
            title: title,
            institution: document.getElementById('qual_institution').value.trim(),
            date: document.getElementById('qual_date').value,
            expiryDate: document.getElementById('qual_expiry').value,
            description: document.getElementById('qual_description').value.trim(),
            addedAt: new Date().toISOString()
        };

        if (!user.qualifications) {
            user.qualifications = [];
        }

        if (window.currentQualificationIndex === -1) {
            // Adding new qualification
            user.qualifications.push(qualification);
        } else {
            // Editing existing qualification
            user.qualifications[window.currentQualificationIndex] = qualification;
        }

        this.saveUsersToStorage();
        this.cancelQualificationForm();
        
        // Refresh the qualifications list
        this.openQualificationsEditor(userId);
        
        alert('Qualifikation erfolgreich gespeichert!');
    }

    deleteQualification(index) {
        if (!confirm('Möchten Sie diese Qualifikation wirklich löschen?')) return;
        
        const currentUser = this.getCurrentUser();
        currentUser.qualifications.splice(index, 1);
        
        this.saveUsersToStorage();
        
        // Refresh the qualifications list
        this.openQualificationsEditor(currentUser.id);
    }

    cancelQualificationForm() {
        document.getElementById('qualificationForm').style.display = 'none';
        window.currentQualificationIndex = null;
    }

    renderResponsibilitiesTab(user, editMode) {
        return `
            <div class="tab-content-header">
                <h3><i class="fas fa-tasks"></i> Verantwortlichkeiten</h3>
                <button class="btn-primary tab-edit-btn" onclick="window.qhseDashboard.openResponsibilitiesEditor('${user.id}')">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
            </div>
            
            <div class="responsibilities-display">
                <div class="responsibility-categories">
                    <div class="resp-category">
                        <div class="resp-header">
                            <h4><i class="fas fa-cogs"></i> Maschinen & Anlagen</h4>
                            <span class="resp-count">${this.getMachineResponsibilitiesCount(user)} Maschinen</span>
                        </div>
                        <div class="resp-content">
                            ${this.renderMachineResponsibilities(user)}
                        </div>
                    </div>
                    
                    <div class="resp-category">
                        <div class="resp-header">
                            <h4><i class="fas fa-flask"></i> Gefahrstoffe</h4>
                            <span class="resp-count">${this.getSubstanceResponsibilitiesCount(user)} Stoffe</span>
                        </div>
                        <div class="resp-content">
                            ${this.renderHazardousSubstanceResponsibilities(user)}
                        </div>
                    </div>
                    
                    <div class="resp-category">
                        <div class="resp-header">
                            <h4><i class="fas fa-clipboard-check"></i> Prüfungen & Audits</h4>
                            <span class="resp-count">${this.getAuditResponsibilitiesCount(user)} Prüfungen</span>
                        </div>
                        <div class="resp-content">
                            ${this.renderAuditResponsibilities(user)}
                        </div>
                    </div>
                    
                    <div class="resp-category">
                        <div class="resp-header">
                            <h4><i class="fas fa-users"></i> Mitarbeiterverantwortung</h4>
                            <span class="resp-count">${this.getStaffResponsibilitiesCount(user)} Mitarbeiter</span>
                        </div>
                        <div class="resp-content">
                            ${this.renderStaffResponsibilities(user)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderActivityTab(user, editMode) {
        const activities = this.getUserActivities(user.id);
        
        return `
            <div class="tab-content-header">
                <h3><i class="fas fa-history"></i> Aktivitätsverlauf</h3>
                <button class="btn-primary tab-edit-btn" onclick="window.qhseDashboard.openActivityEditor('${user.id}')">
                    <i class="fas fa-edit"></i> Verwalten
                </button>
            </div>
            
            <div class="activity-display">
                <div class="activity-stats">
                    <div class="stat-card">
                        <h4>${activities.length}</h4>
                        <p>Gesamt-Aktivitäten</p>
                    </div>
                    <div class="stat-card">
                        <h4>${activities.filter(a => a.timestamp > Date.now() - 7*24*60*60*1000).length}</h4>
                        <p>Diese Woche</p>
                    </div>
                    <div class="stat-card">
                        <h4>${activities.filter(a => a.timestamp > Date.now() - 30*24*60*60*1000).length}</h4>
                        <p>Letzten 30 Tage</p>
                    </div>
                </div>
                
                <div class="activity-filters">
                    <select id="activityFilter" onchange="window.qhseDashboard.filterActivities(this.value)">
                        <option value="all">Alle Aktivitäten</option>
                        <option value="documents">Dokumente</option>
                        <option value="audits">Prüfungen</option>
                        <option value="machines">Maschinen</option>
                        <option value="substances">Gefahrstoffe</option>
                        <option value="profile">Profil-Änderungen</option>
                    </select>
                </div>
                
                ${activities.length === 0 ? 
                    '<p class="no-data">Keine Aktivitäten erfasst.</p>' :
                    `<div class="activity-timeline" id="activityTimeline">
                        ${activities.slice(0, 20).map(activity => `
                            <div class="activity-item" data-type="${activity.type}">
                                <div class="activity-icon">
                                    <i class="${this.getActivityIcon(activity.type)}"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-header">
                                        <span class="activity-title">${activity.title}</span>
                                        <span class="activity-date">${new Date(activity.timestamp).toLocaleString('de-DE')}</span>
                                    </div>
                                    <p class="activity-description">${activity.description}</p>
                                    ${activity.details ? `<div class="activity-details">${activity.details}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>`
                }
                
                ${activities.length > 20 ? `
                    <div class="activity-pagination">
                        <button onclick="window.qhseDashboard.loadMoreActivities('${user.id}')" class="btn-secondary">
                            Weitere Aktivitäten laden (${activities.length - 20} verbleibend)
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderVisibilityTab(user, editMode) {
        const visibility = user.profileVisibility || {
            name: true,
            department: true,
            position: true,
            phone: false,
            email: false,
            responsibilities: true,
            qualifications: true
        };
        
        return `
            <div class="tab-content-header">
                <h3><i class="fas fa-eye"></i> Profilsichtbarkeit</h3>
                <button class="btn-primary tab-edit-btn" onclick="window.qhseDashboard.openVisibilityEditor('${user.id}')">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
            </div>
            
            <div class="visibility-display">
                <div class="visibility-preview">
                    <h4>Aktuelle Sichtbarkeitseinstellungen</h4>
                    <p class="section-description">Diese Einstellungen bestimmen, welche Informationen andere Benutzer in Ihrem öffentlichen Profil sehen können.</p>
                    
                    <div class="visibility-grid">
                        ${Object.entries(visibility).map(([field, visible]) => `
                            <div class="visibility-item ${visible ? 'visible' : 'hidden'}">
                                <div class="visibility-icon">
                                    <i class="fas ${visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                                </div>
                                <div class="visibility-content">
                                    <h5>${this.getFieldDisplayName(field)}</h5>
                                    <p class="visibility-status ${visible ? 'visible' : 'hidden'}">
                                        ${visible ? 'Für andere Benutzer sichtbar' : 'Vor anderen Benutzern verborgen'}
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="privacy-note">
                    <i class="fas fa-info-circle"></i>
                    <p><strong>Hinweis:</strong> Administratoren können immer alle Profilinformationen einsehen. Diese Einstellungen gelten nur für andere Benutzer und die öffentliche Profilansicht.</p>
                </div>
            </div>
        `;
    }

    // Helper methods for user profiles
    setupProfileTabs() {
        setTimeout(() => {
            const modal = document.getElementById('userProfileModal');
            if (!modal) return;
            
            const tabBtns = modal.querySelectorAll('.tab-btn');
            const tabPanes = modal.querySelectorAll('.tab-pane');
            
            console.log(`Setting up ${tabBtns.length} profile tabs`);
            
            tabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetTab = btn.dataset.tab;
                    
                    console.log(`Switching to tab: ${targetTab}`);
                    
                    // Remove active class from all tabs and panes
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabPanes.forEach(p => p.classList.remove('active'));
                    
                    // Add active class to clicked tab and corresponding pane
                    btn.classList.add('active');
                    const targetPane = modal.querySelector(`#tab-${targetTab}`);
                    if (targetPane) {
                        targetPane.classList.add('active');
                    } else {
                        console.error(`Tab pane not found: tab-${targetTab}`);
                    }
                });
            });
        }, 200);
    }

    saveUserProfile() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            alert('Benutzer nicht gefunden.');
            return;
        }

        // Collect personal info
        const updatedUser = {
            ...currentUser,
            displayName: document.getElementById('profile_displayName').value,
            email: document.getElementById('profile_email').value,
            phone: document.getElementById('profile_phone').value,
            mobile: document.getElementById('profile_mobile').value,
            birthdate: document.getElementById('profile_birthdate').value,
            department: document.getElementById('profile_department').value,
            position: document.getElementById('profile_position').value,
            startDate: document.getElementById('profile_startDate').value,
            emergencyContact: document.getElementById('profile_emergencyContact').value,
            address: document.getElementById('profile_address').value,
            notes: document.getElementById('profile_notes').value
        };

        // Collect visibility settings
        const visibilityFields = ['name', 'department', 'position', 'phone', 'email', 'responsibilities', 'qualifications'];
        updatedUser.profileVisibility = {};
        visibilityFields.forEach(field => {
            const checkbox = document.getElementById(`visibility_${field}`);
            if (checkbox) {
                updatedUser.profileVisibility[field] = checkbox.checked;
            }
        });

        // Update user in array
        const userIndex = this.users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = updatedUser;
            this.saveUsersToStorage();
            
            // Update current user if it's the same user
            if (this.currentUserId === currentUser.id) {
                this.updateUIForUser();
            }
            
            alert('Profil erfolgreich gespeichert!');
            document.getElementById('userProfileModal').style.display = 'none';
        } else {
            alert('Fehler beim Speichern des Profils.');
        }
    }

    getSectionDisplayName(section) {
        const sectionNames = {
            'dashboard': 'Dashboard',
            'sicherheitsecke': 'Sicherheitsecke',
            'arbeitsanweisungen': 'Arbeitsanweisungen',
            'verfahrensanweisungen': 'Verfahrensanweisungen',
            'audits': 'Auditauswertungen',
            'kundenzufriedenheit': 'Kundenzufriedenheit',
            'dokumente': 'Dokumente verwalten',
            'nutzerverwaltung': 'Nutzerverwaltung',
            'bereichsverwaltung': 'Bereichsverwaltung',
            'abteilungsverwaltung': 'Abteilungsverwaltung',
            'zeiterfassung': 'Zeiterfassung',
            'zeitauswertung': 'Zeitauswertung',
            'maschinen': 'Maschinen',
            'wartungsplanung': 'Wartungsplanung',
            'stoerungen': 'Störungen',
            'instandhaltung-auswertung': 'Instandhaltung Auswertung',
            'gefahrstoffe': 'Gefahrstoffe',
            'einstellungen': 'Einstellungen'
        };
        return sectionNames[section] || section;
    }

    getFieldDisplayName(field) {
        const fieldNames = {
            'name': 'Name',
            'department': 'Abteilung',
            'position': 'Position',
            'phone': 'Telefon',
            'email': 'E-Mail',
            'responsibilities': 'Verantwortlichkeiten',
            'qualifications': 'Qualifikationen'
        };
        return fieldNames[field] || field;
    }

    getFieldDescription(field) {
        const descriptions = {
            'name': 'Ihr vollständiger Name',
            'department': 'Ihre Abteilungszugehörigkeit',
            'position': 'Ihr Jobtitel/Position',
            'phone': 'Ihre Telefonnummer',
            'email': 'Ihre E-Mail-Adresse',
            'responsibilities': 'Ihre Verantwortlichkeiten für Maschinen, Gefahrstoffe etc.',
            'qualifications': 'Ihre Qualifikationen und Schulungen'
        };
        return descriptions[field] || '';
    }

    renderMachineResponsibilities(user) {
        const machines = this.machines || [];
        const userMachines = machines.filter(m => m.responsibleUser === user.id);
        
        if (userMachines.length === 0) {
            return '<p class="no-data">Keine Maschinenverantwortlichkeiten</p>';
        }
        
        return `
            <div class="responsibility-list">
                ${userMachines.map(machine => `
                    <div class="responsibility-item">
                        <i class="fas fa-cog"></i>
                        <span class="item-name">${machine.name}</span>
                        <span class="item-status status-${machine.status}">${machine.status}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderHazardousSubstanceResponsibilities(user) {
        const substances = this.hazardousSubstances || [];
        const userSubstances = substances.filter(s => s.responsibleUser === user.id);
        
        if (userSubstances.length === 0) {
            return '<p class="no-data">Keine Gefahrstoffverantwortlichkeiten</p>';
        }
        
        return `
            <div class="responsibility-list">
                ${userSubstances.map(substance => `
                    <div class="responsibility-item">
                        <i class="fas fa-flask"></i>
                        <span class="item-name">${substance.name}</span>
                        <span class="item-info">${substance.classification}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderAuditResponsibilities(user) {
        // This would integrate with audit system when available
        return '<p class="no-data">Prüfungsverantwortlichkeiten werden geladen...</p>';
    }

    renderStaffResponsibilities(user) {
        const subordinates = this.users.filter(u => u.supervisor === user.id);
        
        if (subordinates.length === 0) {
            return '<p class="no-data">Keine Mitarbeiterverantwortung</p>';
        }
        
        return `
            <div class="responsibility-list">
                ${subordinates.map(subordinate => `
                    <div class="responsibility-item">
                        <i class="fas fa-user"></i>
                        <span class="item-name">${subordinate.displayName}</span>
                        <span class="item-info">${subordinate.role}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getUserActivities(userId) {
        // This would be expanded to collect activities from various system modules
        const activities = [];
        
        // Example activities - this would be replaced with real activity tracking
        const now = new Date();
        
        activities.push({
            type: 'profile',
            title: 'Profil aktualisiert',
            description: 'Persönliche Daten wurden bearbeitet',
            timestamp: now.toISOString(),
            details: null
        });
        
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getActivityIcon(type) {
        const icons = {
            'profile': 'fas fa-user-edit',
            'document': 'fas fa-file',
            'audit': 'fas fa-clipboard-check',
            'machine': 'fas fa-cog',
            'substance': 'fas fa-flask',
            'login': 'fas fa-sign-in-alt',
            'logout': 'fas fa-sign-out-alt'
        };
        return icons[type] || 'fas fa-circle';
    }

    // Qualification management methods
    addQualification() {
        document.getElementById('qualificationForm').style.display = 'block';
    }

    saveQualification() {
        const title = document.getElementById('qual_title').value;
        const institution = document.getElementById('qual_institution').value;
        const date = document.getElementById('qual_date').value;
        const expiry = document.getElementById('qual_expiry').value;
        const description = document.getElementById('qual_description').value;
        
        if (!title) {
            alert('Bitte geben Sie einen Titel ein.');
            return;
        }
        
        const currentUser = this.getCurrentUser();
        if (!currentUser.qualifications) {
            currentUser.qualifications = [];
        }
        
        currentUser.qualifications.push({
            title,
            institution,
            date,
            expiryDate: expiry,
            description,
            addedAt: new Date().toISOString()
        });
        
        const userIndex = this.users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = currentUser;
            this.saveUsersToStorage();
            this.renderUserProfileModal(currentUser, true);
        }
    }

    cancelQualification() {
        document.getElementById('qualificationForm').style.display = 'none';
        // Clear form
        document.getElementById('qual_title').value = '';
        document.getElementById('qual_institution').value = '';
        document.getElementById('qual_date').value = '';
        document.getElementById('qual_expiry').value = '';
        document.getElementById('qual_description').value = '';
    }

    removeQualification(index) {
        if (!confirm('Möchten Sie diese Qualifikation wirklich entfernen?')) {
            return;
        }
        
        const currentUser = this.getCurrentUser();
        if (currentUser.qualifications && currentUser.qualifications[index]) {
            currentUser.qualifications.splice(index, 1);
            
            const userIndex = this.users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex] = currentUser;
                this.saveUsersToStorage();
                this.renderUserProfileModal(currentUser, true);
            }
        }
    }

    // Additional Profile Setup Methods
    setupProfilePictureUpload() {
        // Profile picture upload functionality would be implemented here
        // This is a placeholder for future implementation
    }

    setupQualificationsManagement() {
        // Additional qualification management setup would be implemented here
        // This is a placeholder for future implementation
    }

    setupResponsibilitiesManagement() {
        // Additional responsibility management setup would be implemented here
        // This is a placeholder for future implementation
    }

    setupActivityLog() {
        // Activity logging setup would be implemented here
        // This is a placeholder for future implementation
    }

    setupPublicProfileSearch() {
        // Public profile search functionality would be implemented here
        // This is a placeholder for future implementation
    }

    loadMoreActivities(userId) {
        // Load more activities functionality would be implemented here
        alert('Weitere Aktivitäten laden - Feature wird implementiert...');
    }

    // User Selection Management
    setupUserSelection() {
        const userSelect = document.getElementById('userSelect');
        const userRole = document.getElementById('userRole');
        const userName = document.getElementById('userName');

        if (!userSelect || !userRole || !userName) {
            console.error('User selection elements not found in DOM');
            return;
        }

        // Role definitions
        this.roleDefinitions = {
            'root-admin': {
                name: 'Root Administrator',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'nutzerverwaltung', 'bereichsverwaltung', 'abteilungsverwaltung', 'zeiterfassung', 'zeitauswertung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'gefahrstoffe', 'schulungen', 'lieferanten', 'urlaubsplanung', 'einstellungen', 'mein-profil'],
                canManageUsers: true,
                canManageAreas: true,
                canManageDepartments: true,
                canViewAllTimeEntries: true
            },
            admin: {
                name: 'Administrator',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'nutzerverwaltung', 'bereichsverwaltung', 'abteilungsverwaltung', 'zeiterfassung', 'zeitauswertung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'gefahrstoffe', 'schulungen', 'lieferanten', 'urlaubsplanung', 'mein-profil'],
                canManageUsers: true,
                canManageAreas: true,
                canManageDepartments: true,
                canViewAllTimeEntries: true
            },
            geschaeftsfuehrung: {
                name: 'Geschäftsführung',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'gefahrstoffe', 'schulungen', 'lieferanten', 'urlaubsplanung', 'mein-profil'],
                hierarchyLevel: 1,
                canSupervise: ['betriebsleiter', 'qhse']
            },
            betriebsleiter: {
                name: 'Betriebsleiter',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'gefahrstoffe', 'schulungen', 'lieferanten', 'urlaubsplanung', 'mein-profil'],
                hierarchyLevel: 2,
                canSupervise: ['abteilungsleiter'],
                mustHaveSupervisor: ['geschaeftsfuehrung']
            },
            abteilungsleiter: {
                name: 'Abteilungsleiter',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'gefahrstoffe', 'schulungen', 'lieferanten', 'urlaubsplanung', 'mein-profil'],
                hierarchyLevel: 3,
                canSupervise: ['mitarbeiter'],
                mustHaveSupervisor: ['betriebsleiter']
            },
            qhse: {
                name: 'QHSE-Mitarbeiter',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'zeiterfassung', 'gefahrstoffe', 'schulungen', 'lieferanten', 'urlaubsplanung', 'mein-profil'],
                hierarchyLevel: 2,
                isStaffPosition: true,
                mustHaveSupervisor: ['geschaeftsfuehrung']
            },
            mitarbeiter: {
                name: 'Mitarbeiter',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'audits', 'zeiterfassung', 'gefahrstoffe', 'schulungen', 'urlaubsplanung', 'mein-profil'],
                hierarchyLevel: 4,
                mustHaveSupervisor: ['abteilungsleiter']
            },
            techniker: {
                name: 'Techniker',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'audits', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'gefahrstoffe', 'schulungen', 'urlaubsplanung', 'mein-profil'],
                hierarchyLevel: 4,
                canManageMachines: true,
                canReportIssues: true,
                mustHaveSupervisor: ['abteilungsleiter']
            }
        };

        userSelect.addEventListener('change', (e) => {
            const newUserId = e.target.value;
            if (newUserId && this.users.find(u => u.id === newUserId && u.isActive)) {
                this.currentUserId = newUserId;
                this.updateUIForUser();
            } else {
                console.error('Invalid user ID selected:', newUserId);
                // Reset to previous value
                userSelect.value = this.currentUserId;
            }
        });

        // Initialize with default user
        this.updateUIForUser();
    }

    updateUIForUser() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            console.error('No current user found');
            return;
        }
        
        const roleDefinition = this.roleDefinitions[currentUser.role];
        const userRole = document.getElementById('userRole');
        const userName = document.getElementById('userName');
        
        if (userRole) {
            userRole.textContent = roleDefinition ? roleDefinition.name : currentUser.role;
        }
        if (userName) {
            userName.textContent = currentUser.displayName || currentUser.name || 'Unbekannter Benutzer';
        }
        
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
        
        // Update safety corner content
        this.renderSafetyAnnouncements();
        this.renderSafetyPdfs();
        this.renderExistingAnnouncements();
        
        // Update audit content to show/hide delete buttons based on user role
        this.renderAuditContent();
        
        // Update dashboard KPIs and visibility
        this.updateElementVisibilityByRole();
        
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
        
        // Get module settings
        const moduleSettings = this.loadModuleSettingsFromStorage();
        
        menuItems.forEach(item => {
            const section = item.getAttribute('data-section');
            let hasAccess = false;
            
            // Check access based on section type
            if (section === 'gefahrstoffe') {
                // Special handling for Gefahrstoffe module
                hasAccess = this.userHasGefahrstoffeAccess(currentUser, moduleSettings);
            } else {
                // Standard access check for other sections
                hasAccess = this.userHasAccessToSection(currentUser, section, allAllowedSections);
            }
            
            if (hasAccess) {
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
                
                // Check access permissions with special handling for Gefahrstoffe
                let hasAccess = false;
                if (targetSection === 'gefahrstoffe') {
                    const moduleSettings = this.loadModuleSettingsFromStorage();
                    hasAccess = this.userHasGefahrstoffeAccess(currentUser, moduleSettings);
                } else {
                    hasAccess = this.userHasAccessToSection(currentUser, targetSection, allAllowedSections);
                }
                
                if (!hasAccess) {
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
                    gefahrstoffe: 'Gefahrstoffverzeichnis',
                    schulungen: 'Schulungsmanagement',
                    lieferanten: 'Lieferantenbewertung',
                    urlaubsplanung: 'Urlaubsplanung & Abwesenheitsmanagement',
                    einstellungen: 'System-Einstellungen'
                };
                
                pageTitle.textContent = sectionTitles[targetSection] || (localStorage.getItem('qhse_dashboard_name') || 'Dashboard');
                this.currentSection = targetSection;
                
                // Section-specific initialization
                this.handleSectionChange(targetSection);
                
                // Section-specific initialization
                if (targetSection === 'einstellungen') {
                    this.populatePermissionUserDropdown();
                } else if (targetSection === 'mein-profil') {
                    // Show profile modal when navigating to profile section
                    setTimeout(() => this.showCurrentUserProfile(false), 100);
                } else if (targetSection === 'lieferanten') {
                    // Initialize supplier management when section is accessed
                    setTimeout(() => this.renderSupplierDashboard(), 100);
                }
            });
        });
    }

    handleSectionChange(targetSection) {
        console.log('🔄 Section changed to:', targetSection);
        
        // Section-specific initialization
        switch(targetSection) {
            case 'urlaubsplanung':
                console.log('🏖️ Initializing vacation planning section...');
                // Force re-setup vacation management to ensure everything works
                setTimeout(() => {
                    // Reset initialization flag to force re-setup
                    this.vacationManagementInitialized = false;
                    this.setupVacationManagement();
                }, 100);
                break;
            case 'maschinen':
                // Ensure machine management works
                setTimeout(() => this.ensureMachineManagementWorks(), 100);
                break;
            // Add more cases as needed
        }
    }

    showAccessDenied() {
        alert('Zugriff verweigert. Sie haben keine Berechtigung für diesen Bereich.');
    }

    userHasAccessToSection(user, targetSection, baseSections) {
        // Check if user has access through role-based permissions
        if (baseSections.includes(targetSection)) {
            return true;
        }
        
        // Check for user-specific permissions
        if (user.permissions) {
            switch (targetSection) {
                case 'gefahrstoffe':
                    // For gefahrstoffe, use the new access logic (access denied when false)
                    return user.permissions.gefahrstoffe !== false;
                // Add more specific permission checks here for future modules
                default:
                    return false;
            }
        }
        
        return false;
    }
    
    userHasGefahrstoffeAccess(user, moduleSettings) {
        const userName = user.displayName || user.name || user.id;
        
        // First check if module is globally enabled
        if (!moduleSettings || moduleSettings.gefahrstoffe !== true) {
            console.log(`Gefahrstoffe module is globally disabled for user ${userName}`);
            return false;
        }
        
        // Admin users always have access
        if (user.role === 'admin' || user.role === 'root-admin') {
            return true;
        }
        
        // Check if user has been explicitly denied access
        if (user.permissions && user.permissions.gefahrstoffe === false) {
            console.log(`User ${userName} has been explicitly denied Gefahrstoffe access`);
            return false;
        }
        
        // DEFAULT: All users have access unless explicitly denied
        return true;
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
        const searchIcon = document.querySelector('.search-box i');
        
        if (!searchInput) return;

        // Add ID for better access
        searchInput.id = 'globalSearchInput';
        
        // Search on input with debouncing
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const searchTerm = e.target.value.trim();
            
            searchTimeout = setTimeout(() => {
                this.performSearch(searchTerm);
            }, 300);
        });

        // Search on Enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = e.target.value.trim();
                this.performSearch(searchTerm);
            }
        });

        // Clear search on Escape
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                this.clearSearch();
            }
        });

        // Visual feedback
        searchInput.addEventListener('focus', () => {
            searchInput.parentNode.classList.add('search-active');
        });

        searchInput.addEventListener('blur', () => {
            searchInput.parentNode.classList.remove('search-active');
        });
    }

    performSearch(searchTerm) {
        // Clear previous search results
        this.clearSearch();

        if (!searchTerm || searchTerm.length < 2) {
            this.hideSearchResults();
            return;
        }

        console.log('Searching for:', searchTerm);
        
        const results = this.searchAllContent(searchTerm.toLowerCase());
        this.displaySearchResults(results, searchTerm);
    }

    searchAllContent(searchTerm) {
        const results = [];

        // Search in documents
        this.documents.forEach(doc => {
            if (doc.name.toLowerCase().includes(searchTerm) || 
                doc.category.toLowerCase().includes(searchTerm) ||
                (doc.description && doc.description.toLowerCase().includes(searchTerm))) {
                results.push({
                    type: 'document',
                    title: doc.name,
                    category: this.getCategoryDisplayName(doc.category),
                    content: doc.description || 'Dokument',
                    section: doc.category,
                    id: doc.id
                });
            }
        });

        // Search in KPIs (static and custom)
        const kpiSearchData = [
            { title: 'Arbeitsschutz', value: this.dashboardKpis?.safety?.value || '98.5', label: this.dashboardKpis?.safety?.label || 'Compliance Rate', section: 'dashboard' },
            { title: 'Qualität', value: this.dashboardKpis?.quality?.value || '99.2', label: this.dashboardKpis?.quality?.label || 'Qualitätsrate', section: 'dashboard' },
            { title: 'Umwelt', value: this.dashboardKpis?.environment?.value || '12', label: this.dashboardKpis?.environment?.label || 'CO₂ Einsparung', section: 'dashboard' },
            { title: 'Gesundheit', value: this.dashboardKpis?.health?.value || '2.1', label: this.dashboardKpis?.health?.label || 'Krankentage', section: 'dashboard' }
        ];

        // Add custom KPIs
        this.customKpis?.forEach(kpi => {
            kpiSearchData.push({
                title: kpi.title,
                value: kpi.value,
                label: kpi.label,
                section: 'dashboard'
            });
        });

        kpiSearchData.forEach(kpi => {
            if (kpi.title.toLowerCase().includes(searchTerm) ||
                kpi.label.toLowerCase().includes(searchTerm) ||
                kpi.value.toString().includes(searchTerm)) {
                results.push({
                    type: 'kpi',
                    title: kpi.title,
                    category: 'KPI',
                    content: `${kpi.value} - ${kpi.label}`,
                    section: kpi.section
                });
            }
        });

        // Search in audit certifications
        this.auditCertifications?.certifications?.forEach(cert => {
            if ((cert.name && cert.name.toLowerCase().includes(searchTerm)) ||
                (cert.validity && cert.validity.toLowerCase().includes(searchTerm))) {
                results.push({
                    type: 'certification',
                    title: cert.name || 'Unbekannte Zertifizierung',
                    category: 'TÜV Zertifizierung',
                    content: cert.validity || 'Unbekannte Gültigkeit',
                    section: 'audits'
                });
            }
        });

        // Search in internal audits
        this.auditCertifications?.internalAudits?.forEach(audit => {
            if ((audit.title && audit.title.toLowerCase().includes(searchTerm)) ||
                (audit.type && audit.type.toLowerCase().includes(searchTerm)) ||
                (audit.status && audit.status.toLowerCase().includes(searchTerm))) {
                results.push({
                    type: 'audit',
                    title: audit.title || 'Unbekanntes Audit',
                    category: 'Internes Audit',
                    content: `${audit.type || 'Unbekannter Typ'} - ${audit.status || 'Unbekannter Status'}`,
                    section: 'audits'
                });
            }
        });

        // Search in external audits
        this.auditCertifications?.externalAudits?.forEach(audit => {
            if ((audit.title && audit.title.toLowerCase().includes(searchTerm)) ||
                (audit.type && audit.type.toLowerCase().includes(searchTerm)) ||
                (audit.auditor && audit.auditor.toLowerCase().includes(searchTerm)) ||
                (audit.status && audit.status.toLowerCase().includes(searchTerm))) {
                results.push({
                    type: 'audit',
                    title: audit.title || 'Unbekanntes externes Audit',
                    category: 'Externes Audit',
                    content: `${audit.type || 'Unbekannter Typ'} - ${audit.auditor || 'Unbekannter Auditor'} - ${audit.status || 'Unbekannter Status'}`,
                    section: 'audits'
                });
            }
        });

        // Search in users (for admins)
        const currentUser = this.getCurrentUser();
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'root-admin')) {
            this.users.forEach(user => {
                if ((user.displayName && user.displayName.toLowerCase().includes(searchTerm)) ||
                    (user.email && user.email.toLowerCase().includes(searchTerm)) ||
                    (user.department && user.department.toLowerCase().includes(searchTerm)) ||
                    (user.phone && user.phone.toLowerCase().includes(searchTerm)) ||
                    (user.position && user.position.toLowerCase().includes(searchTerm))) {
                    results.push({
                        type: 'user',
                        title: user.displayName || 'Unbekannter Benutzer',
                        category: 'Benutzer',
                        content: `${user.email || 'Keine E-Mail'} - ${user.department || 'Keine Abteilung'}`,
                        section: 'nutzerverwaltung',
                        id: user.id,
                        userData: user
                    });
                }
            });
        }

        // Search in safety announcements
        this.safetyAnnouncements?.forEach(announcement => {
            if (announcement.content && announcement.content.toLowerCase().includes(searchTerm)) {
                results.push({
                    type: 'announcement',
                    title: 'Sicherheitsmitteilung',
                    category: 'Sicherheitsecke',
                    content: announcement.content.substring(0, 100) + '...',
                    section: 'sicherheitsecke'
                });
            }
        });

        // Search in machines (if user has access)
        if (this.machines) {
            this.machines.forEach(machine => {
                if ((machine.name && machine.name.toLowerCase().includes(searchTerm)) ||
                    (machine.type && machine.type.toLowerCase().includes(searchTerm)) ||
                    (machine.manufacturer && machine.manufacturer.toLowerCase().includes(searchTerm))) {
                    results.push({
                        type: 'machine',
                        title: machine.name || 'Unbekannte Maschine',
                        category: 'Maschine',
                        content: `${machine.type || 'Unbekannter Typ'} - ${machine.manufacturer || 'Unbekannter Hersteller'}`,
                        section: 'maschinen'
                    });
                }
            });
        }

        // Search in hazardous substances (if user has access)
        if (this.hazardousSubstances && currentUser) {
            const moduleSettings = this.loadModuleSettingsFromStorage();
            if (this.userHasGefahrstoffeAccess(currentUser, moduleSettings)) {
            this.hazardousSubstances.forEach(substance => {
                if ((substance.name && substance.name.toLowerCase().includes(searchTerm)) ||
                    (substance.casNumber && substance.casNumber.toLowerCase().includes(searchTerm)) ||
                    (substance.supplier && substance.supplier.toLowerCase().includes(searchTerm)) ||
                    (substance.purpose && substance.purpose.toLowerCase().includes(searchTerm)) ||
                    (substance.storageLocation && substance.storageLocation.toLowerCase().includes(searchTerm))) {
                    results.push({
                        type: 'substance',
                        title: substance.name || 'Unbekannter Gefahrstoff',
                        category: 'Gefahrstoff',
                        content: `${substance.casNumber ? 'CAS: ' + substance.casNumber + ' - ' : ''}${substance.supplier || 'Unbekannter Hersteller'}`,
                        section: 'gefahrstoffe',
                        id: substance.id
                    });
                }
            });
            }
        }

        return results;
    }

    displaySearchResults(results, searchTerm) {
        // Remove existing search results
        this.hideSearchResults();

        if (results.length === 0) {
            this.showNoResults(searchTerm);
            return;
        }

        // Create search results container
        const searchResults = document.createElement('div');
        searchResults.id = 'searchResults';
        searchResults.className = 'search-results';
        
        const resultsHtml = `
            <div class="search-results-header">
                <h3>Suchergebnisse für "${searchTerm}" (${results.length})</h3>
                <button id="closeSearchResults" class="close-search-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-results-list">
                ${results.map(result => `
                    <div class="search-result-item" data-section="${result.section}" data-type="${result.type}" data-id="${result.id || ''}">
                        <div class="result-icon">
                            <i class="${this.getResultIcon(result.type)}"></i>
                        </div>
                        <div class="result-content">
                            <h4>${this.highlightText(result.title, searchTerm)}</h4>
                            <span class="result-category">${result.category}</span>
                            <p>${this.highlightText(result.content, searchTerm)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        searchResults.innerHTML = resultsHtml;

        // Insert after main content
        const contentBody = document.querySelector('.content-body');
        contentBody.appendChild(searchResults);

        // Add event listeners
        document.getElementById('closeSearchResults').addEventListener('click', () => {
            this.hideSearchResults();
        });

        // Add click handlers for results
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                const type = item.getAttribute('data-type');
                const id = item.getAttribute('data-id');
                
                this.navigateToSearchResult(section, type, id);
                this.hideSearchResults();
            });
        });

        // Show results
        searchResults.style.display = 'block';
    }

    getResultIcon(type) {
        const icons = {
            document: 'fas fa-file-alt',
            kpi: 'fas fa-chart-line',
            certification: 'fas fa-certificate',
            audit: 'fas fa-search',
            user: 'fas fa-user',
            announcement: 'fas fa-bullhorn',
            machine: 'fas fa-cogs',
            substance: 'fas fa-flask'
        };
        return icons[type] || 'fas fa-file';
    }

    highlightText(text, searchTerm) {
        if (!text || !searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    navigateToSearchResult(section, type, id) {
        // Special handling for user profiles
        if (type === 'user' && id) {
            this.showUserProfile(id);
            return;
        }
        
        // Special handling for substance details
        if (type === 'substance' && id) {
            this.showSection(section);
            setTimeout(() => {
                this.viewSubstanceDetails(id);
            }, 500);
            return;
        }
        
        // Navigate to the appropriate section
        this.showSection(section);
        
        // Additional navigation logic for specific types
        setTimeout(() => {
            if (type === 'document' && id) {
                // Scroll to document
                const docElement = document.querySelector(`[data-doc-id="${id}"]`);
                if (docElement) {
                    docElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    docElement.style.background = '#fef3c7';
                    setTimeout(() => {
                        docElement.style.background = '';
                    }, 2000);
                }
            }
        }, 500);
    }

    showNoResults(searchTerm) {
        const searchResults = document.createElement('div');
        searchResults.id = 'searchResults';
        searchResults.className = 'search-results no-results';
        
        searchResults.innerHTML = `
            <div class="search-results-header">
                <h3>Keine Ergebnisse für "${searchTerm}"</h3>
                <button id="closeSearchResults" class="close-search-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="no-results-content">
                <i class="fas fa-search" style="font-size: 3rem; color: #64748b; margin-bottom: 1rem;"></i>
                <p>Keine passenden Inhalte gefunden.</p>
                <p>Versuchen Sie es mit anderen Suchbegriffen.</p>
            </div>
        `;

        const contentBody = document.querySelector('.content-body');
        contentBody.appendChild(searchResults);

        document.getElementById('closeSearchResults').addEventListener('click', () => {
            this.hideSearchResults();
        });
    }

    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.remove();
        }
    }

    showUserProfile(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            alert('Benutzer nicht gefunden.');
            return;
        }

        // Create user profile modal
        const profileModal = document.createElement('div');
        profileModal.id = 'userProfileViewModal';
        profileModal.className = 'modal';
        profileModal.style.display = 'block';

        const departmentName = this.getDepartmentName(user.department);
        const roleName = this.getRoleName(user.role);
        
        profileModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-user"></i> Benutzerprofil: ${user.displayName || 'Unbekannter Benutzer'}</h2>
                    <span class="close" id="closeUserProfileModal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="user-profile-tabs">
                        <div class="tab-buttons">
                            <button class="tab-btn active" data-tab="basic">Grunddaten</button>
                            <button class="tab-btn" data-tab="contact">Kontakt</button>
                            <button class="tab-btn" data-tab="work">Arbeitsplatz</button>
                            <button class="tab-btn" data-tab="personal">Persönlich</button>
                        </div>
                        
                        <div class="tab-content active" data-tab="basic">
                            <div class="profile-info-grid">
                                <div class="info-item">
                                    <label>Name:</label>
                                    <span>${user.displayName || 'Nicht angegeben'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Rolle:</label>
                                    <span class="role-badge role-${user.role}">${roleName}</span>
                                </div>
                                <div class="info-item">
                                    <label>Abteilung:</label>
                                    <span>${departmentName || 'Nicht zugeordnet'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Status:</label>
                                    <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                                        <i class="fas ${user.isActive ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                        ${user.isActive ? 'Aktiv' : 'Inaktiv'}
                                    </span>
                                </div>
                                <div class="info-item">
                                    <label>Erstellt am:</label>
                                    <span>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : 'Nicht bekannt'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" data-tab="contact">
                            <div class="profile-info-grid">
                                <div class="info-item">
                                    <label>E-Mail:</label>
                                    <span>${user.email ? `<a href="mailto:${user.email}">${user.email}</a>` : 'Nicht angegeben'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Telefon:</label>
                                    <span>${user.phone ? `<a href="tel:${user.phone}">${user.phone}</a>` : 'Nicht angegeben'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Mobil:</label>
                                    <span>${user.mobile ? `<a href="tel:${user.mobile}">${user.mobile}</a>` : 'Nicht angegeben'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Adresse:</label>
                                    <span>${user.address || 'Nicht angegeben'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Notfallkontakt:</label>
                                    <span>${user.emergencyContact || 'Nicht angegeben'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" data-tab="work">
                            <div class="profile-info-grid">
                                <div class="info-item">
                                    <label>Position:</label>
                                    <span>${user.position || 'Nicht angegeben'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Vorgesetzter:</label>
                                    <span>${user.supervisor || 'Nicht angegeben'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Einstellungsdatum:</label>
                                    <span>${user.startDate ? new Date(user.startDate).toLocaleDateString('de-DE') : 'Nicht angegeben'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Berechtigung:</label>
                                    <span>${user.canBeDeleted ? 'Standard-Benutzer' : 'System-Benutzer'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" data-tab="personal">
                            <div class="profile-info-grid">
                                <div class="info-item">
                                    <label>Geburtsdatum:</label>
                                    <span>${user.birthdate ? new Date(user.birthdate).toLocaleDateString('de-DE') : 'Nicht angegeben'}</span>
                                </div>
                                <div class="info-item full-width">
                                    <label>Anmerkungen:</label>
                                    <span>${user.notes || 'Keine Anmerkungen'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="closeUserProfileModalBtn" class="btn-secondary">Schließen</button>
                </div>
            </div>
        `;

        document.body.appendChild(profileModal);

        // Setup tab switching
        const tabButtons = profileModal.querySelectorAll('.tab-btn');
        const tabContents = profileModal.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Update active tab button
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => {
                    content.classList.toggle('active', content.getAttribute('data-tab') === targetTab);
                });
            });
        });

        // Setup close handlers
        const closeBtn = document.getElementById('closeUserProfileModal');
        const closeFooterBtn = document.getElementById('closeUserProfileModalBtn');
        
        const closeModal = () => {
            profileModal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        closeFooterBtn.addEventListener('click', closeModal);

        // Close on outside click
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                closeModal();
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    getDepartmentName(departmentId) {
        const department = this.departments.find(d => d.id === departmentId);
        return department ? department.name : departmentId;
    }

    getRoleName(roleId) {
        const roleNames = {
            'root-admin': 'Root Administrator',
            'admin': 'Administrator',
            'geschaeftsfuehrung': 'Geschäftsführung',
            'betriebsleiter': 'Betriebsleiter',
            'abteilungsleiter': 'Abteilungsleiter',
            'qhse': 'QHSE-Beauftragter',
            'mitarbeiter': 'Mitarbeiter',
            'techniker': 'Techniker'
        };
        return roleNames[roleId] || roleId;
    }

    clearSearch() {
        // Clear highlights and reset visibility
        const highlightedElements = document.querySelectorAll('mark');
        highlightedElements.forEach(el => {
            el.outerHTML = el.innerHTML;
        });

        // Reset any hidden elements
        const hiddenElements = document.querySelectorAll('[style*="display: none"]');
        hiddenElements.forEach(el => {
            if (el.style.display === 'none') {
                el.style.display = '';
            }
        });

        // Hide search results
        this.hideSearchResults();
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
        console.log('Initializing root admin and default users...');
        console.log('Current users count:', this.users.length);
        
        const existingRootAdmin = this.users.find(user => user.id === 'root-admin');
        if (!existingRootAdmin) {
            console.log('Creating root admin user...');
            this.createDefaultUserForRole('root-admin');
        } else {
            console.log('Root admin already exists:', existingRootAdmin.displayName);
        }
        
        // Ensure we have default users for demonstration
        this.initializeDefaultUsers();
        
        // Final verification
        console.log('After initialization, total users:', this.users.length);
        this.users.forEach(user => {
            console.log('User initialized:', user.id, user.displayName, user.isActive);
        });
    }

    initializeDefaultUsers() {
        const requiredRoles = ['admin', 'geschaeftsfuehrung', 'betriebsleiter', 'qhse', 'abteilungsleiter', 'mitarbeiter', 'techniker'];
        
        console.log('Checking required roles:', requiredRoles);
        
        requiredRoles.forEach(role => {
            const existingUser = this.users.find(user => user.role === role && user.isActive);
            if (!existingUser) {
                console.log('Creating default user for role:', role);
                this.createDefaultUserForRole(role);
            } else {
                console.log('User already exists for role:', role, existingUser.displayName);
            }
        });
        
        // Save users after all are created
        this.saveUsersToStorage();
        console.log('Default users initialization complete');
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

        // New profile overview and reports buttons
        const userProfilesOverviewBtn = document.getElementById('userProfilesOverviewBtn');
        const userReportsBtn = document.getElementById('userReportsBtn');

        if (userProfilesOverviewBtn) {
            console.log('👥 DEBUGGING: Setting up user profiles overview button listener');
            userProfilesOverviewBtn.addEventListener('click', () => {
                console.log('👥 DEBUGGING: User profiles overview button clicked!');
                this.showUserProfilesOverview();
            });
        } else {
            console.error('👥 DEBUGGING: userProfilesOverviewBtn not found in DOM!');
        }

        if (userReportsBtn) {
            console.log('📊 DEBUGGING: Setting up user reports button listener');
            userReportsBtn.addEventListener('click', () => {
                console.log('📊 DEBUGGING: User reports button clicked!');
                this.showUserReports();
            });
        } else {
            console.error('📊 DEBUGGING: userReportsBtn not found in DOM!');
        }
    }

    showUserProfilesOverview() {
        console.log('👥 DEBUGGING: Opening user profiles overview modal...');
        console.log('👥 DEBUGGING: Users data:', this.users);
        console.log('👥 DEBUGGING: Departments data:', this.departments);
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2><i class="fas fa-users"></i> Mitarbeiter-Profile Übersicht</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="profile-overview-controls">
                        <div class="control-group">
                            <div class="form-group">
                                <label for="profileViewType">Ansicht:</label>
                                <select id="profileViewType">
                                    <option value="cards">Karten-Ansicht</option>
                                    <option value="table">Tabellen-Ansicht</option>
                                    <option value="detailed">Detaillierte Ansicht</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="profileDepartmentFilter">Abteilung:</label>
                                <select id="profileDepartmentFilter">
                                    <option value="">Alle Abteilungen</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="profileRoleFilter">Rolle:</label>
                                <select id="profileRoleFilter">
                                    <option value="">Alle Rollen</option>
                                    <option value="root-admin">System Administrator</option>
                                    <option value="admin">Administrator</option>
                                    <option value="geschaeftsfuehrung">Geschäftsführung</option>
                                    <option value="betriebsleiter">Betriebsleiter</option>
                                    <option value="abteilungsleiter">Abteilungsleiter</option>
                                    <option value="qhse">QHSE-Manager</option>
                                    <option value="mitarbeiter">Mitarbeiter</option>
                                    <option value="techniker">Techniker</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="profileStatusFilter">Status:</label>
                                <select id="profileStatusFilter">
                                    <option value="">Alle Status</option>
                                    <option value="active">Aktiv</option>
                                    <option value="inactive">Inaktiv</option>
                                </select>
                            </div>
                        </div>
                        <div class="profile-actions">
                            <button id="refreshProfilesBtn" class="btn-primary">
                                <i class="fas fa-sync"></i> Aktualisieren
                            </button>
                            <button id="exportProfilesBtn" class="btn-secondary">
                                <i class="fas fa-download"></i> Exportieren
                            </button>
                            <button id="printProfilesBtn" class="btn-secondary">
                                <i class="fas fa-print"></i> Drucken
                            </button>
                        </div>
                    </div>
                    <div class="profile-overview-content" id="profileOverviewContent">
                        <!-- Profile content will be populated here -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('👥 DEBUGGING: Modal added to DOM');
        
        this.populateProfileDepartmentFilter();
        console.log('👥 DEBUGGING: Department filter populated');
        
        // Event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const refreshBtn = modal.querySelector('#refreshProfilesBtn');
        const exportBtn = modal.querySelector('#exportProfilesBtn');
        const printBtn = modal.querySelector('#printProfilesBtn');
        
        const viewTypeSelect = modal.querySelector('#profileViewType');
        const departmentFilter = modal.querySelector('#profileDepartmentFilter');
        const roleFilter = modal.querySelector('#profileRoleFilter');
        const statusFilter = modal.querySelector('#profileStatusFilter');
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        refreshBtn.addEventListener('click', () => {
            console.log('👥 DEBUGGING: Refresh profiles clicked');
            this.renderProfileOverview();
        });
        
        exportBtn.addEventListener('click', () => {
            console.log('👥 DEBUGGING: Export profiles clicked');
            this.exportUserProfiles();
        });
        
        printBtn.addEventListener('click', () => {
            console.log('👥 DEBUGGING: Print profiles clicked');
            this.printUserProfiles();
        });
        
        // Filter change listeners
        [viewTypeSelect, departmentFilter, roleFilter, statusFilter].forEach(select => {
            select.addEventListener('change', () => {
                console.log('👥 DEBUGGING: Filter changed');
                this.renderProfileOverview();
            });
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Show the modal
        modal.style.display = 'block';
        console.log('👥 DEBUGGING: Modal display set to block');
        
        // Initial render
        this.renderProfileOverview();
    }

    populateProfileDepartmentFilter() {
        const departmentSelect = document.getElementById('profileDepartmentFilter');
        if (departmentSelect) {
            departmentSelect.innerHTML = '<option value="">Alle Abteilungen</option>';
            this.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });
        }
    }

    renderProfileOverview() {
        console.log('👥 DEBUGGING: Rendering profile overview...');
        
        const content = document.getElementById('profileOverviewContent');
        const viewType = document.getElementById('profileViewType').value;
        const departmentFilter = document.getElementById('profileDepartmentFilter').value;
        const roleFilter = document.getElementById('profileRoleFilter').value;
        const statusFilter = document.getElementById('profileStatusFilter').value;
        
        // Filter users
        let filteredUsers = this.users.filter(user => {
            if (departmentFilter && user.department !== departmentFilter) return false;
            if (roleFilter && user.role !== roleFilter) return false;
            if (statusFilter === 'active' && !user.isActive) return false;
            if (statusFilter === 'inactive' && user.isActive) return false;
            return true;
        });
        
        console.log('👥 DEBUGGING: Filtered users:', filteredUsers.length);
        
        if (filteredUsers.length === 0) {
            content.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-users"></i>
                    <h3>Keine Mitarbeiter gefunden</h3>
                    <p>Keine Mitarbeiter entsprechen den ausgewählten Filterkriterien.</p>
                </div>
            `;
            return;
        }
        
        if (viewType === 'cards') {
            this.renderProfileCards(content, filteredUsers);
        } else if (viewType === 'table') {
            this.renderProfileTable(content, filteredUsers);
        } else if (viewType === 'detailed') {
            this.renderDetailedProfiles(content, filteredUsers);
        }
    }

    renderProfileCards(container, users) {
        container.innerHTML = `
            <div class="profile-cards-grid">
                ${users.map(user => this.generateProfileCard(user)).join('')}
            </div>
        `;
        
        // Add click listeners for individual profile actions
        users.forEach(user => {
            const viewBtn = container.querySelector(`#viewProfile_${user.id}`);
            const editBtn = container.querySelector(`#editProfile_${user.id}`);
            
            if (viewBtn) {
                viewBtn.addEventListener('click', () => this.showDetailedUserProfile(user.id));
            }
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editUser(user.id));
            }
        });
    }

    generateProfileCard(user) {
        const department = this.departments.find(d => d.id === user.department);
        const departmentName = department ? department.name : 'Unbekannt';
        const roleDisplayName = this.getRoleDisplayName(user.role);
        const initials = this.getUserInitials(user.displayName || user.name);
        const statusBadge = user.isActive ? 
            '<span class="status-badge active">Aktiv</span>' : 
            '<span class="status-badge inactive">Inaktiv</span>';
        
        return `
            <div class="profile-card ${user.role}">
                <div class="profile-card-header">
                    <div class="profile-avatar large">${initials}</div>
                    <div class="profile-basic-info">
                        <h3>${user.displayName || user.name}</h3>
                        <div class="role-badge ${user.role}">${roleDisplayName}</div>
                        ${statusBadge}
                    </div>
                </div>
                <div class="profile-card-body">
                    <div class="profile-detail">
                        <i class="fas fa-envelope"></i>
                        <span>${user.email || 'Nicht angegeben'}</span>
                    </div>
                    <div class="profile-detail">
                        <i class="fas fa-phone"></i>
                        <span>${user.phone || 'Nicht angegeben'}</span>
                    </div>
                    <div class="profile-detail">
                        <i class="fas fa-building"></i>
                        <span>${departmentName}</span>
                    </div>
                    <div class="profile-detail">
                        <i class="fas fa-briefcase"></i>
                        <span>${user.position || 'Nicht angegeben'}</span>
                    </div>
                    <div class="profile-detail">
                        <i class="fas fa-calendar"></i>
                        <span>Seit ${user.startDate || 'Unbekannt'}</span>
                    </div>
                </div>
                <div class="profile-card-actions">
                    <button id="viewProfile_${user.id}" class="btn-small btn-primary">
                        <i class="fas fa-eye"></i> Ansehen
                    </button>
                    <button id="editProfile_${user.id}" class="btn-small btn-secondary">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                </div>
            </div>
        `;
    }

    renderProfileTable(container, users) {
        container.innerHTML = `
            <div class="profile-table-container">
                <table class="profile-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Rolle</th>
                            <th>Abteilung</th>
                            <th>E-Mail</th>
                            <th>Telefon</th>
                            <th>Status</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => this.generateProfileTableRow(user)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Add click listeners for table actions
        users.forEach(user => {
            const viewBtn = container.querySelector(`#viewTableProfile_${user.id}`);
            const editBtn = container.querySelector(`#editTableProfile_${user.id}`);
            
            if (viewBtn) {
                viewBtn.addEventListener('click', () => this.showDetailedUserProfile(user.id));
            }
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editUser(user.id));
            }
        });
    }

    generateProfileTableRow(user) {
        const department = this.departments.find(d => d.id === user.department);
        const departmentName = department ? department.name : 'Unbekannt';
        const roleDisplayName = this.getRoleDisplayName(user.role);
        const statusBadge = user.isActive ? 
            '<span class="status-badge active">Aktiv</span>' : 
            '<span class="status-badge inactive">Inaktiv</span>';
        
        return `
            <tr class="profile-row ${user.role}">
                <td>
                    <div class="profile-name-cell">
                        <div class="profile-avatar small">${this.getUserInitials(user.displayName || user.name)}</div>
                        <span>${user.displayName || user.name}</span>
                    </div>
                </td>
                <td><span class="role-badge ${user.role}">${roleDisplayName}</span></td>
                <td>${departmentName}</td>
                <td>${user.email || 'Nicht angegeben'}</td>
                <td>${user.phone || 'Nicht angegeben'}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="table-actions">
                        <button id="viewTableProfile_${user.id}" class="btn-icon" title="Profil ansehen">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button id="editTableProfile_${user.id}" class="btn-icon" title="Profil bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderDetailedProfiles(container, users) {
        container.innerHTML = `
            <div class="detailed-profiles-container">
                ${users.map(user => this.generateDetailedProfile(user)).join('')}
            </div>
        `;
        
        // Add click listeners for detailed profile actions
        users.forEach(user => {
            const editBtn = container.querySelector(`#editDetailedProfile_${user.id}`);
            const expandBtn = container.querySelector(`#expandProfile_${user.id}`);
            
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editUser(user.id));
            }
            if (expandBtn) {
                expandBtn.addEventListener('click', () => this.showDetailedUserProfile(user.id));
            }
        });
    }

    generateDetailedProfile(user) {
        const department = this.departments.find(d => d.id === user.department);
        const departmentName = department ? department.name : 'Unbekannt';
        const roleDisplayName = this.getRoleDisplayName(user.role);
        const initials = this.getUserInitials(user.displayName || user.name);
        const statusBadge = user.isActive ? 
            '<span class="status-badge active">Aktiv</span>' : 
            '<span class="status-badge inactive">Inaktiv</span>';
        
        // Calculate some profile statistics
        const qualifications = user.qualifications || [];
        const activeQualifications = qualifications.filter(q => !q.expiryDate || new Date(q.expiryDate) > new Date());
        const expiredQualifications = qualifications.filter(q => q.expiryDate && new Date(q.expiryDate) <= new Date());
        
        return `
            <div class="detailed-profile-card ${user.role}">
                <div class="detailed-profile-header">
                    <div class="profile-avatar large">${initials}</div>
                    <div class="profile-header-info">
                        <h2>${user.displayName || user.name}</h2>
                        <div class="profile-meta">
                            <div class="role-badge ${user.role}">${roleDisplayName}</div>
                            ${statusBadge}
                            <span class="profile-id">ID: ${user.id}</span>
                        </div>
                        <div class="profile-actions-header">
                            <button id="editDetailedProfile_${user.id}" class="btn-primary">
                                <i class="fas fa-edit"></i> Bearbeiten
                            </button>
                            <button id="expandProfile_${user.id}" class="btn-secondary">
                                <i class="fas fa-expand"></i> Vollansicht
                            </button>
                        </div>
                    </div>
                </div>
                <div class="detailed-profile-body">
                    <div class="profile-section">
                        <h4><i class="fas fa-user"></i> Grunddaten</h4>
                        <div class="profile-info-grid">
                            <div class="info-item">
                                <label>E-Mail:</label>
                                <span>${user.email || 'Nicht angegeben'}</span>
                            </div>
                            <div class="info-item">
                                <label>Telefon:</label>
                                <span>${user.phone || 'Nicht angegeben'}</span>
                            </div>
                            <div class="info-item">
                                <label>Abteilung:</label>
                                <span>${departmentName}</span>
                            </div>
                            <div class="info-item">
                                <label>Position:</label>
                                <span>${user.position || 'Nicht angegeben'}</span>
                            </div>
                            <div class="info-item">
                                <label>Startdatum:</label>
                                <span>${user.startDate || 'Unbekannt'}</span>
                            </div>
                            <div class="info-item">
                                <label>Erstellt:</label>
                                <span>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h4><i class="fas fa-certificate"></i> Qualifikationen</h4>
                        <div class="qualification-summary">
                            <div class="qualification-stat">
                                <span class="stat-number">${qualifications.length}</span>
                                <span class="stat-label">Gesamt</span>
                            </div>
                            <div class="qualification-stat">
                                <span class="stat-number active">${activeQualifications.length}</span>
                                <span class="stat-label">Aktiv</span>
                            </div>
                            <div class="qualification-stat">
                                <span class="stat-number expired">${expiredQualifications.length}</span>
                                <span class="stat-label">Abgelaufen</span>
                            </div>
                        </div>
                        ${qualifications.length > 0 ? `
                            <div class="qualification-list">
                                ${qualifications.slice(0, 3).map(q => `
                                    <div class="qualification-item ${q.expiryDate && new Date(q.expiryDate) <= new Date() ? 'expired' : 'active'}">
                                        <span class="qualification-name">${q.name}</span>
                                        <span class="qualification-expiry">${q.expiryDate ? new Date(q.expiryDate).toLocaleDateString('de-DE') : 'Unbegrenzt'}</span>
                                    </div>
                                `).join('')}
                                ${qualifications.length > 3 ? `<div class="more-qualifications">... und ${qualifications.length - 3} weitere</div>` : ''}
                            </div>
                        ` : '<p class="no-data">Keine Qualifikationen erfasst</p>'}
                    </div>
                    
                    <div class="profile-section">
                        <h4><i class="fas fa-shield-alt"></i> Berechtigungen</h4>
                        <div class="permissions-summary">
                            ${this.generatePermissionsSummary(user)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generatePermissionsSummary(user) {
        const roleDefinitions = this.roleDefinitions || {};
        const userRole = roleDefinitions[user.role];
        
        if (!userRole) {
            return '<p class="no-data">Keine Berechtigungen definiert</p>';
        }
        
        const allowedSections = userRole.allowedSections || [];
        const permissions = userRole.permissions || {};
        
        return `
            <div class="permissions-grid">
                <div class="permission-item">
                    <span class="permission-label">Bereiche:</span>
                    <span class="permission-value">${allowedSections.length} Bereiche</span>
                </div>
                <div class="permission-item">
                    <span class="permission-label">Verwaltung:</span>
                    <span class="permission-value">${permissions.canManageUsers ? 'Ja' : 'Nein'}</span>
                </div>
                <div class="permission-item">
                    <span class="permission-label">Dokumente:</span>
                    <span class="permission-value">${permissions.canUploadDocuments ? 'Ja' : 'Nein'}</span>
                </div>
                <div class="permission-item">
                    <span class="permission-label">Berichte:</span>
                    <span class="permission-value">${permissions.canAccessReports ? 'Ja' : 'Nein'}</span>
                </div>
            </div>
        `;
    }

    getUserInitials(name) {
        if (!name) return '??';
        return name.split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'root-admin': 'System Administrator',
            'admin': 'Administrator',
            'geschaeftsfuehrung': 'Geschäftsführung',
            'betriebsleiter': 'Betriebsleiter',
            'abteilungsleiter': 'Abteilungsleiter',
            'qhse': 'QHSE-Manager',
            'mitarbeiter': 'Mitarbeiter',
            'techniker': 'Techniker'
        };
        return roleNames[role] || role;
    }

    showDetailedUserProfile(userId) {
        console.log('👥 DEBUGGING: Showing detailed profile for user:', userId);
        // This will open the existing detailed profile modal that was already implemented
        this.showCurrentUserProfile(false, userId);
    }

    exportUserProfiles() {
        console.log('📊 DEBUGGING: Exporting user profiles...');
        
        const viewType = document.getElementById('profileViewType').value;
        const departmentFilter = document.getElementById('profileDepartmentFilter').value;
        const roleFilter = document.getElementById('profileRoleFilter').value;
        const statusFilter = document.getElementById('profileStatusFilter').value;
        
        // Filter users
        let filteredUsers = this.users.filter(user => {
            if (departmentFilter && user.department !== departmentFilter) return false;
            if (roleFilter && user.role !== roleFilter) return false;
            if (statusFilter === 'active' && !user.isActive) return false;
            if (statusFilter === 'inactive' && user.isActive) return false;
            return true;
        });
        
        // Generate CSV data
        const headers = ['Name', 'Rolle', 'Abteilung', 'E-Mail', 'Telefon', 'Position', 'Status', 'Startdatum'];
        const csvData = filteredUsers.map(user => {
            const department = this.departments.find(d => d.id === user.department);
            return [
                user.displayName || user.name,
                this.getRoleDisplayName(user.role),
                department ? department.name : 'Unbekannt',
                user.email || '',
                user.phone || '',
                user.position || '',
                user.isActive ? 'Aktiv' : 'Inaktiv',
                user.startDate || ''
            ];
        });
        
        // Create CSV content
        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `mitarbeiter_profile_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        console.log('📊 DEBUGGING: CSV export completed');
    }

    printUserProfiles() {
        console.log('🖨️ DEBUGGING: Printing user profiles...');
        
        const printWindow = window.open('', '_blank');
        const profileContent = document.getElementById('profileOverviewContent').innerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mitarbeiter-Profile - ${new Date().toLocaleDateString('de-DE')}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .profile-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                    .profile-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; page-break-inside: avoid; }
                    .profile-card-header { margin-bottom: 10px; }
                    .profile-avatar { width: 40px; height: 40px; border-radius: 50%; background: #007bff; color: white; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px; }
                    .role-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; background: #f8f9fa; border: 1px solid #dee2e6; }
                    .status-badge.active { background: #d4edda; color: #155724; }
                    .status-badge.inactive { background: #f8d7da; color: #721c24; }
                    .profile-detail { margin: 5px 0; }
                    .profile-detail i { width: 20px; }
                    @media print { .btn-small { display: none; } }
                </style>
            </head>
            <body>
                <h1>Mitarbeiter-Profile Übersicht</h1>
                <p>Erstellt am: ${new Date().toLocaleString('de-DE')}</p>
                ${profileContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        
        console.log('🖨️ DEBUGGING: Print dialog opened');
    }

    showUserReports() {
        console.log('📊 DEBUGGING: Opening user reports modal...');
        console.log('📊 DEBUGGING: Users data:', this.users);
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-line"></i> Mitarbeiter-Berichte</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="report-controls">
                        <div class="control-group">
                            <div class="form-group">
                                <label for="userReportType">Berichtstyp:</label>
                                <select id="userReportType">
                                    <option value="overview">Mitarbeiter-Übersicht</option>
                                    <option value="departments">Abteilungs-Aufschlüsselung</option>
                                    <option value="roles">Rollen-Verteilung</option>
                                    <option value="qualifications">Qualifikations-Status</option>
                                    <option value="activity">Aktivitäts-Report</option>
                                    <option value="complete">Vollständiger Bericht</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="userReportDepartment">Abteilung:</label>
                                <select id="userReportDepartment">
                                    <option value="">Alle Abteilungen</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="userReportFormat">Format:</label>
                                <select id="userReportFormat">
                                    <option value="pdf">PDF</option>
                                    <option value="csv">CSV</option>
                                    <option value="excel">Excel</option>
                                </select>
                            </div>
                        </div>
                        <div class="report-actions">
                            <button id="generateUserReportBtn" class="btn-primary">
                                <i class="fas fa-file-download"></i> Bericht erstellen
                            </button>
                            <button id="previewUserReportBtn" class="btn-secondary">
                                <i class="fas fa-eye"></i> Vorschau
                            </button>
                        </div>
                    </div>
                    <div class="report-preview" id="userReportPreview" style="display: none;">
                        <h3>Bericht Vorschau</h3>
                        <div id="userReportContent"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('📊 DEBUGGING: Modal added to DOM');
        
        this.populateUserReportDepartmentDropdown();
        console.log('📊 DEBUGGING: Department dropdown populated');
        
        // Event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const generateBtn = modal.querySelector('#generateUserReportBtn');
        const previewBtn = modal.querySelector('#previewUserReportBtn');
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        generateBtn.addEventListener('click', () => {
            console.log('📊 DEBUGGING: Generate user report button clicked');
            this.generateUserReport();
        });
        
        previewBtn.addEventListener('click', () => {
            console.log('📊 DEBUGGING: Preview user report button clicked');
            this.previewUserReport();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Show the modal
        modal.style.display = 'block';
        console.log('📊 DEBUGGING: Modal display set to block');
    }

    populateUserReportDepartmentDropdown() {
        const departmentSelect = document.getElementById('userReportDepartment');
        if (departmentSelect) {
            departmentSelect.innerHTML = '<option value="">Alle Abteilungen</option>';
            this.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });
        }
    }

    generateUserReport() {
        console.log('📊 DEBUGGING: Generating user report...');
        
        const reportType = document.getElementById('userReportType').value;
        const department = document.getElementById('userReportDepartment').value;
        const format = document.getElementById('userReportFormat').value;
        
        console.log('📊 DEBUGGING: Report parameters:', { reportType, department, format });
        
        if (!reportType) {
            alert('Bitte wählen Sie einen Berichtstyp aus.');
            return;
        }
        
        if (!format) {
            alert('Bitte wählen Sie ein Format aus.');
            return;
        }
        
        const reportData = this.prepareUserReportData(reportType, department);
        
        console.log('📊 DEBUGGING: Report data prepared for generation:', reportData);
        
        if (reportData.users.length === 0) {
            alert('Keine Daten für den ausgewählten Berichtstyp gefunden.');
            return;
        }
        
        console.log('📊 DEBUGGING: Starting export with format:', format);
        
        if (format === 'pdf') {
            console.log('📊 DEBUGGING: Calling PDF export');
            this.exportUserReportAsPDF(reportData, reportType);
        } else if (format === 'csv') {
            console.log('📊 DEBUGGING: Calling CSV export');
            this.exportUserReportAsCSV(reportData, reportType);
        } else if (format === 'excel') {
            console.log('📊 DEBUGGING: Calling Excel export');
            this.exportUserReportAsExcel(reportData, reportType);
        } else {
            console.error('📊 DEBUGGING: Unknown format:', format);
        }
    }

    previewUserReport() {
        console.log('📊 DEBUGGING: Previewing user report...');
        
        const reportType = document.getElementById('userReportType').value;
        const department = document.getElementById('userReportDepartment').value;
        
        console.log('📊 DEBUGGING: Preview parameters:', { reportType, department });
        
        const reportData = this.prepareUserReportData(reportType, department);
        const preview = document.getElementById('userReportPreview');
        const content = document.getElementById('userReportContent');
        
        if (reportData.users.length === 0) {
            content.innerHTML = '<p class="no-data">Keine Daten für den ausgewählten Berichtstyp gefunden.</p>';
            preview.style.display = 'block';
            return;
        }
        
        content.innerHTML = this.generateUserReportHTML(reportData, reportType);
        preview.style.display = 'block';
        
        console.log('📊 DEBUGGING: Preview generated successfully');
    }

    prepareUserReportData(reportType, department) {
        console.log('📊 DEBUGGING: Preparing user report data...');
        
        let filteredUsers = this.users.filter(user => {
            if (department && user.department !== department) return false;
            return true;
        });
        
        console.log('📊 DEBUGGING: Users after department filter:', filteredUsers.length);
        
        const reportData = {
            users: filteredUsers,
            type: reportType,
            department: department,
            generatedAt: new Date().toISOString(),
            stats: this.calculateUserStats(filteredUsers)
        };
        
        // Add specific data based on report type
        if (reportType === 'departments') {
            reportData.departmentBreakdown = this.generateDepartmentBreakdown(filteredUsers);
        } else if (reportType === 'roles') {
            reportData.roleDistribution = this.generateRoleDistribution(filteredUsers);
        } else if (reportType === 'qualifications') {
            reportData.qualificationStats = this.generateQualificationStats(filteredUsers);
        }
        
        console.log('📊 DEBUGGING: Final report data:', reportData);
        
        return reportData;
    }

    calculateUserStats(users) {
        const stats = {
            total: users.length,
            active: users.filter(u => u.isActive).length,
            inactive: users.filter(u => !u.isActive).length,
            byRole: {},
            byDepartment: {},
            totalQualifications: 0,
            expiredQualifications: 0
        };
        
        users.forEach(user => {
            // Role stats
            stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
            
            // Department stats
            if (user.department) {
                stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1;
            }
            
            // Qualification stats
            const qualifications = user.qualifications || [];
            stats.totalQualifications += qualifications.length;
            stats.expiredQualifications += qualifications.filter(q => 
                q.expiryDate && new Date(q.expiryDate) <= new Date()
            ).length;
        });
        
        return stats;
    }

    generateDepartmentBreakdown(users) {
        const breakdown = {};
        
        this.departments.forEach(dept => {
            const deptUsers = users.filter(u => u.department === dept.id);
            breakdown[dept.id] = {
                name: dept.name,
                total: deptUsers.length,
                active: deptUsers.filter(u => u.isActive).length,
                roles: {}
            };
            
            deptUsers.forEach(user => {
                breakdown[dept.id].roles[user.role] = (breakdown[dept.id].roles[user.role] || 0) + 1;
            });
        });
        
        return breakdown;
    }

    generateRoleDistribution(users) {
        const distribution = {};
        
        users.forEach(user => {
            if (!distribution[user.role]) {
                distribution[user.role] = {
                    name: this.getRoleDisplayName(user.role),
                    count: 0,
                    users: []
                };
            }
            distribution[user.role].count++;
            distribution[user.role].users.push({
                name: user.displayName || user.name,
                department: user.department,
                active: user.isActive
            });
        });
        
        return distribution;
    }

    generateQualificationStats(users) {
        const stats = {
            total: 0,
            active: 0,
            expired: 0,
            expiringSoon: 0,
            byType: {},
            userStats: []
        };
        
        users.forEach(user => {
            const qualifications = user.qualifications || [];
            const userStat = {
                name: user.displayName || user.name,
                department: user.department,
                total: qualifications.length,
                active: 0,
                expired: 0,
                expiringSoon: 0
            };
            
            qualifications.forEach(q => {
                stats.total++;
                
                if (q.expiryDate) {
                    const expiryDate = new Date(q.expiryDate);
                    const now = new Date();
                    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    
                    if (expiryDate <= now) {
                        stats.expired++;
                        userStat.expired++;
                    } else if (expiryDate <= in30Days) {
                        stats.expiringSoon++;
                        userStat.expiringSoon++;
                    } else {
                        stats.active++;
                        userStat.active++;
                    }
                } else {
                    stats.active++;
                    userStat.active++;
                }
                
                // By type stats
                const type = q.type || 'Unbekannt';
                stats.byType[type] = (stats.byType[type] || 0) + 1;
            });
            
            stats.userStats.push(userStat);
        });
        
        return stats;
    }

    generateUserReportHTML(reportData, reportType) {
        let html = `
            <div class="report-summary">
                <h4>Zusammenfassung</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">${reportData.stats.total}</span>
                        <span class="stat-label">Gesamt</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${reportData.stats.active}</span>
                        <span class="stat-label">Aktiv</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${reportData.stats.inactive}</span>
                        <span class="stat-label">Inaktiv</span>
                    </div>
                </div>
            </div>
        `;
        
        if (reportType === 'overview' || reportType === 'complete') {
            html += this.generateUserListHTML(reportData.users);
        }
        
        if (reportType === 'departments' || reportType === 'complete') {
            html += this.generateDepartmentReportHTML(reportData.departmentBreakdown);
        }
        
        if (reportType === 'roles' || reportType === 'complete') {
            html += this.generateRoleReportHTML(reportData.roleDistribution);
        }
        
        if (reportType === 'qualifications' || reportType === 'complete') {
            html += this.generateQualificationReportHTML(reportData.qualificationStats);
        }
        
        return html;
    }

    generateUserListHTML(users) {
        return `
            <div class="report-section">
                <h4>Mitarbeiterliste</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Rolle</th>
                            <th>Abteilung</th>
                            <th>E-Mail</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => {
                            const dept = this.departments.find(d => d.id === user.department);
                            return `
                                <tr>
                                    <td>${user.displayName || user.name}</td>
                                    <td>${this.getRoleDisplayName(user.role)}</td>
                                    <td>${dept ? dept.name : 'Unbekannt'}</td>
                                    <td>${user.email || 'Nicht angegeben'}</td>
                                    <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Aktiv' : 'Inaktiv'}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    generateDepartmentReportHTML(breakdown) {
        return `
            <div class="report-section">
                <h4>Abteilungs-Aufschlüsselung</h4>
                ${Object.values(breakdown).map(dept => `
                    <div class="department-breakdown">
                        <h5>${dept.name}</h5>
                        <div class="dept-stats">
                            <span>Gesamt: ${dept.total}</span>
                            <span>Aktiv: ${dept.active}</span>
                        </div>
                        <div class="role-breakdown">
                            ${Object.entries(dept.roles).map(([role, count]) => `
                                <span class="role-stat">${this.getRoleDisplayName(role)}: ${count}</span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateRoleReportHTML(distribution) {
        return `
            <div class="report-section">
                <h4>Rollen-Verteilung</h4>
                ${Object.values(distribution).map(role => `
                    <div class="role-distribution">
                        <h5>${role.name} (${role.count})</h5>
                        <ul class="user-list">
                            ${role.users.map(user => `
                                <li>${user.name} - ${user.department} ${user.active ? '' : '(Inaktiv)'}</li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateQualificationReportHTML(stats) {
        return `
            <div class="report-section">
                <h4>Qualifikations-Status</h4>
                <div class="qualification-overview">
                    <div class="qual-stats">
                        <span>Gesamt: ${stats.total}</span>
                        <span>Aktiv: ${stats.active}</span>
                        <span>Abgelaufen: ${stats.expired}</span>
                        <span>Läuft bald ab: ${stats.expiringSoon}</span>
                    </div>
                </div>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Mitarbeiter</th>
                            <th>Abteilung</th>
                            <th>Gesamt</th>
                            <th>Aktiv</th>
                            <th>Abgelaufen</th>
                            <th>Läuft bald ab</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.userStats.map(user => {
                            const dept = this.departments.find(d => d.id === user.department);
                            return `
                                <tr>
                                    <td>${user.name}</td>
                                    <td>${dept ? dept.name : 'Unbekannt'}</td>
                                    <td>${user.total}</td>
                                    <td>${user.active}</td>
                                    <td>${user.expired}</td>
                                    <td>${user.expiringSoon}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    exportUserReportAsPDF(reportData, reportType) {
        console.log('📊 DEBUGGING: Exporting user report as PDF...');
        
        const printWindow = window.open('', '_blank');
        const reportHTML = this.generateUserReportHTML(reportData, reportType);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mitarbeiter-Bericht - ${reportType}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .report-summary { margin-bottom: 30px; }
                    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin: 10px 0; }
                    .stat-item { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
                    .stat-number { display: block; font-size: 24px; font-weight: bold; color: #007bff; }
                    .stat-label { font-size: 12px; color: #666; }
                    .report-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    .report-table th, .report-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .report-table th { background-color: #f8f9fa; }
                    .status-badge.active { background: #d4edda; color: #155724; padding: 2px 6px; border-radius: 3px; }
                    .status-badge.inactive { background: #f8d7da; color: #721c24; padding: 2px 6px; border-radius: 3px; }
                    .department-breakdown, .role-distribution { margin: 15px 0; padding: 10px; border-left: 4px solid #007bff; }
                    .dept-stats, .qual-stats { margin: 5px 0; }
                    .dept-stats span, .qual-stats span { margin-right: 15px; font-weight: bold; }
                    .role-breakdown { margin-top: 10px; }
                    .role-stat { display: inline-block; margin-right: 15px; padding: 2px 6px; background: #f8f9fa; border-radius: 3px; }
                    .user-list { margin: 10px 0; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>Mitarbeiter-Bericht: ${this.getReportTypeDisplayName(reportType)}</h1>
                <p>Erstellt am: ${new Date().toLocaleString('de-DE')}</p>
                <p>Firma: ${document.getElementById('companyName').textContent}</p>
                ${reportHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        
        console.log('📊 DEBUGGING: PDF export window opened');
    }

    exportUserReportAsCSV(reportData, reportType) {
        console.log('📊 DEBUGGING: Exporting user report as CSV...');
        
        const headers = ['Name', 'Rolle', 'Abteilung', 'E-Mail', 'Telefon', 'Position', 'Status', 'Startdatum'];
        const csvData = reportData.users.map(user => {
            const department = this.departments.find(d => d.id === user.department);
            return [
                user.displayName || user.name,
                this.getRoleDisplayName(user.role),
                department ? department.name : 'Unbekannt',
                user.email || '',
                user.phone || '',
                user.position || '',
                user.isActive ? 'Aktiv' : 'Inaktiv',
                user.startDate || ''
            ];
        });
        
        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `mitarbeiter_bericht_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        console.log('📊 DEBUGGING: CSV export completed');
    }

    exportUserReportAsExcel(reportData, reportType) {
        console.log('📊 DEBUGGING: Exporting user report as Excel...');
        // For now, export as CSV with .xlsx extension for Excel compatibility
        this.exportUserReportAsCSV(reportData, reportType);
    }

    getReportTypeDisplayName(reportType) {
        const reportNames = {
            'overview': 'Mitarbeiter-Übersicht',
            'departments': 'Abteilungs-Aufschlüsselung',
            'roles': 'Rollen-Verteilung',
            'qualifications': 'Qualifikations-Status',
            'activity': 'Aktivitäts-Report',
            'complete': 'Vollständiger Bericht'
        };
        return reportNames[reportType] || reportType;
    }

    // ========================================
    // TRAINING MANAGEMENT SYSTEM
    // ========================================

    loadTrainingsFromStorage() {
        try {
            const stored = localStorage.getItem('qhse_trainings');
            const trainings = stored ? JSON.parse(stored) : [];
            
            // Initialize with default trainings if empty
            if (trainings.length === 0) {
                return this.initializeDefaultTrainings();
            }
            
            return trainings;
        } catch (error) {
            console.error('🎓 ERROR: Failed to load trainings from storage:', error);
            return this.initializeDefaultTrainings();
        }
    }

    loadTrainingAssignmentsFromStorage() {
        try {
            const stored = localStorage.getItem('qhse_training_assignments');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('🎓 ERROR: Failed to load training assignments from storage:', error);
            return [];
        }
    }

    loadCertificatesFromStorage() {
        try {
            const stored = localStorage.getItem('qhse_certificates');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('🎓 ERROR: Failed to load certificates from storage:', error);
            return [];
        }
    }

    saveTrainingsToStorage() {
        try {
            localStorage.setItem('qhse_trainings', JSON.stringify(this.trainings));
            console.log('🎓 SUCCESS: Trainings saved to storage');
        } catch (error) {
            console.error('🎓 ERROR: Failed to save trainings to storage:', error);
        }
    }

    saveTrainingAssignmentsToStorage() {
        try {
            localStorage.setItem('qhse_training_assignments', JSON.stringify(this.trainingAssignments));
            console.log('🎓 SUCCESS: Training assignments saved to storage');
        } catch (error) {
            console.error('🎓 ERROR: Failed to save training assignments to storage:', error);
        }
    }

    saveCertificatesToStorage() {
        try {
            localStorage.setItem('qhse_certificates', JSON.stringify(this.certificates));
            console.log('🎓 SUCCESS: Certificates saved to storage');
        } catch (error) {
            console.error('🎓 ERROR: Failed to save certificates to storage:', error);
        }
    }

    initializeDefaultTrainings() {
        const defaultTrainings = [
            {
                id: 'training-001',
                title: 'Allgemeine Arbeitssicherheit',
                description: 'Grundlegende Unterweisung in Arbeitssicherheit für alle Mitarbeiter',
                category: 'safety',
                type: 'mandatory',
                duration: 120, // minutes
                validityPeriod: 12, // months
                isRecurring: true,
                content: {
                    materials: [],
                    videos: [],
                    documents: [],
                    testQuestions: []
                },
                targetRoles: ['mitarbeiter', 'techniker', 'abteilungsleiter', 'betriebsleiter'],
                targetDepartments: [],
                createdAt: new Date().toISOString(),
                createdBy: 'root-admin',
                isActive: true,
                completionCriteria: {
                    requiresTest: false,
                    passingScore: 80,
                    requiresSignature: true
                }
            },
            {
                id: 'training-002',
                title: 'Gefahrstoffunterweisung',
                description: 'Unterweisung im Umgang mit Gefahrstoffen nach GefStoffV',
                category: 'safety',
                type: 'mandatory',
                duration: 90,
                validityPeriod: 12,
                isRecurring: true,
                content: {
                    materials: [],
                    videos: [],
                    documents: [],
                    testQuestions: []
                },
                targetRoles: ['techniker', 'abteilungsleiter', 'betriebsleiter'],
                targetDepartments: ['produktion', 'instandhaltung'],
                createdAt: new Date().toISOString(),
                createdBy: 'root-admin',
                isActive: true,
                completionCriteria: {
                    requiresTest: true,
                    passingScore: 80,
                    requiresSignature: true
                }
            },
            {
                id: 'training-003',
                title: 'Qualitätsmanagement ISO 9001',
                description: 'Schulung zu den Grundlagen des Qualitätsmanagements',
                category: 'quality',
                type: 'optional',
                duration: 180,
                validityPeriod: 24,
                isRecurring: true,
                content: {
                    materials: [],
                    videos: [],
                    documents: [],
                    testQuestions: []
                },
                targetRoles: ['abteilungsleiter', 'betriebsleiter', 'qhse'],
                targetDepartments: [],
                createdAt: new Date().toISOString(),
                createdBy: 'root-admin',
                isActive: true,
                completionCriteria: {
                    requiresTest: true,
                    passingScore: 85,
                    requiresSignature: false
                }
            },
            {
                id: 'training-004',
                title: 'Datenschutz DSGVO',
                description: 'Schulung zu Datenschutzbestimmungen und DSGVO-Compliance',
                category: 'data-protection',
                type: 'mandatory',
                duration: 60,
                validityPeriod: 12,
                isRecurring: true,
                content: {
                    materials: [],
                    videos: [],
                    documents: [],
                    testQuestions: []
                },
                targetRoles: ['mitarbeiter', 'techniker', 'abteilungsleiter', 'betriebsleiter', 'qhse', 'admin'],
                targetDepartments: [],
                createdAt: new Date().toISOString(),
                createdBy: 'root-admin',
                isActive: true,
                completionCriteria: {
                    requiresTest: true,
                    passingScore: 80,
                    requiresSignature: true
                }
            }
        ];

        this.trainings = defaultTrainings;
        this.saveTrainingsToStorage();
        return defaultTrainings;
    }

    setupTrainingManagement() {
        console.log('🎓 DEBUGGING: Setting up training management...');
        
        // Setup training navigation and event listeners
        this.setupTrainingEventListeners();
        this.setupTrainingTabs();
        this.updateTrainingStatistics();
        
        console.log('🎓 DEBUGGING: Training management setup completed');
    }

    setupTrainingEventListeners() {
        console.log('🎓 DEBUGGING: Setting up training event listeners...');
        
        // Main action buttons
        const addTrainingBtn = document.getElementById('addTrainingBtn');
        const trainingReportsBtn = document.getElementById('trainingReportsBtn');
        const trainingCalendarBtn = document.getElementById('trainingCalendarBtn');
        
        // Quick action buttons
        const myTrainingsBtn = document.getElementById('myTrainingsBtn');
        const assignTrainingsBtn = document.getElementById('assignTrainingsBtn');
        const certificatesBtn = document.getElementById('certificatesBtn');
        
        // Control buttons
        const bulkAssignBtn = document.getElementById('bulkAssignBtn');
        const exportTrainingsBtn = document.getElementById('exportTrainingsBtn');
        const newAssignmentBtn = document.getElementById('newAssignmentBtn');
        const uploadCertificateBtn = document.getElementById('uploadCertificateBtn');
        
        // Main action handlers
        if (addTrainingBtn) {
            addTrainingBtn.addEventListener('click', () => {
                console.log('🎓 DEBUGGING: Add training button clicked');
                this.openTrainingModal();
            });
        }
        
        if (trainingReportsBtn) {
            trainingReportsBtn.addEventListener('click', () => {
                console.log('🎓 DEBUGGING: Training reports button clicked');
                this.openTrainingReports();
            });
        }
        
        if (trainingCalendarBtn) {
            trainingCalendarBtn.addEventListener('click', () => {
                console.log('🎓 DEBUGGING: Training calendar button clicked');
                this.openTrainingCalendar();
            });
        }
        
        // Quick action handlers
        if (myTrainingsBtn) {
            myTrainingsBtn.addEventListener('click', () => {
                console.log('🎓 DEBUGGING: My trainings button clicked');
                this.switchTrainingTab('my-trainings');
            });
        }
        
        if (assignTrainingsBtn) {
            assignTrainingsBtn.addEventListener('click', () => {
                console.log('🎓 DEBUGGING: Assign trainings button clicked');
                this.switchTrainingTab('assignments');
            });
        }
        
        if (certificatesBtn) {
            certificatesBtn.addEventListener('click', () => {
                console.log('🎓 DEBUGGING: Certificates button clicked');
                this.switchTrainingTab('certificates');
            });
        }
        
        // Control button handlers
        if (bulkAssignBtn) {
            bulkAssignBtn.addEventListener('click', () => {
                console.log('🎓 DEBUGGING: Bulk assign button clicked');
                this.openBulkAssignmentModal();
            });
        }
        
        if (exportTrainingsBtn) {
            exportTrainingsBtn.addEventListener('click', () => {
                console.log('🎓 DEBUGGING: Export trainings button clicked');
                this.exportTrainingData();
            });
        }
        
        if (newAssignmentBtn) {
            newAssignmentBtn.addEventListener('click', () => {
                console.log('🎓 DEBUGGING: New assignment button clicked');
                this.openAssignmentModal();
            });
        }
        
        if (uploadCertificateBtn) {
            uploadCertificateBtn.addEventListener('click', () => {
                console.log('🎓 DEBUGGING: Upload certificate button clicked');
                this.openCertificateUploadModal();
            });
        }
        
        // Filter event listeners
        this.setupTrainingFilters();
        
        console.log('🎓 DEBUGGING: Training event listeners setup completed');
    }

    setupTrainingTabs() {
        console.log('🎓 DEBUGGING: Setting up training tabs...');
        
        const tabButtons = document.querySelectorAll('.training-tab-btn');
        const tabPanels = document.querySelectorAll('.training-tab-panel');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                console.log('🎓 DEBUGGING: Tab clicked:', tabId);
                
                this.switchTrainingTab(tabId);
            });
        });
        
        // Initialize with overview tab
        this.switchTrainingTab('overview');
        
        console.log('🎓 DEBUGGING: Training tabs setup completed');
    }

    switchTrainingTab(tabId) {
        console.log('🎓 DEBUGGING: Switching to tab:', tabId);
        
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.training-tab-btn');
        const tabPanels = document.querySelectorAll('.training-tab-panel');
        
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update tab panels
        tabPanels.forEach(panel => {
            if (panel.id === `training-${tabId}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // Load content for the active tab
        this.loadTrainingTabContent(tabId);
    }

    loadTrainingTabContent(tabId) {
        console.log('🎓 DEBUGGING: Loading content for tab:', tabId);
        
        switch (tabId) {
            case 'overview':
                this.renderTrainingOverview();
                break;
            case 'my-trainings':
                this.renderMyTrainings();
                break;
            case 'all-trainings':
                this.renderAllTrainings();
                break;
            case 'assignments':
                this.renderTrainingAssignments();
                break;
            case 'certificates':
                this.renderCertificates();
                break;
            default:
                console.log('🎓 DEBUGGING: Unknown tab:', tabId);
        }
    }

    setupTrainingFilters() {
        const statusFilter = document.getElementById('trainingStatusFilter');
        const categoryFilter = document.getElementById('trainingCategoryFilter');
        const searchInput = document.getElementById('trainingSearch');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                console.log('🎓 DEBUGGING: Status filter changed:', statusFilter.value);
                this.renderTrainingOverview();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                console.log('🎓 DEBUGGING: Category filter changed:', categoryFilter.value);
                this.renderTrainingOverview();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                console.log('🎓 DEBUGGING: Search input changed:', searchInput.value);
                this.renderTrainingOverview();
            });
        }
    }

    updateTrainingStatistics() {
        console.log('🎓 DEBUGGING: Updating training statistics...');
        
        const currentUser = this.getCurrentUser();
        const userAssignments = this.getUserTrainingAssignments(currentUser.id);
        
        // Calculate statistics
        const totalCount = this.trainings.length;
        const completedCount = userAssignments.filter(a => a.status === 'completed').length;
        const pendingCount = userAssignments.filter(a => a.status === 'assigned' || a.status === 'in-progress').length;
        const overdueCount = userAssignments.filter(a => a.status === 'overdue').length;
        
        // Update UI elements
        const totalElement = document.getElementById('totalTrainingsCount');
        const completedElement = document.getElementById('completedTrainingsCount');
        const pendingElement = document.getElementById('pendingTrainingsCount');
        const overdueElement = document.getElementById('overdueTrainingsCount');
        
        if (totalElement) totalElement.textContent = totalCount;
        if (completedElement) completedElement.textContent = completedCount;
        if (pendingElement) pendingElement.textContent = pendingCount;
        if (overdueElement) overdueElement.textContent = overdueCount;
        
        console.log('🎓 DEBUGGING: Statistics updated:', {
            total: totalCount,
            completed: completedCount,
            pending: pendingCount,
            overdue: overdueCount
        });
    }

    getUserTrainingAssignments(userId) {
        return this.trainingAssignments.filter(assignment => assignment.userId === userId);
    }

    renderTrainingOverview() {
        console.log('🎓 DEBUGGING: Rendering training overview...');
        
        const container = document.getElementById('trainingOverviewList');
        if (!container) {
            console.error('🎓 ERROR: Training overview container not found');
            return;
        }
        
        // Get filter values
        const statusFilter = document.getElementById('trainingStatusFilter')?.value || '';
        const categoryFilter = document.getElementById('trainingCategoryFilter')?.value || '';
        const searchQuery = document.getElementById('trainingSearch')?.value?.toLowerCase() || '';
        
        // Filter trainings
        let filteredTrainings = this.trainings.filter(training => {
            if (categoryFilter && training.category !== categoryFilter) return false;
            if (searchQuery && !training.title.toLowerCase().includes(searchQuery)) return false;
            return true;
        });
        
        console.log('🎓 DEBUGGING: Filtered trainings:', filteredTrainings.length);
        
        if (filteredTrainings.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-graduation-cap"></i>
                    <h3>Keine Schulungen gefunden</h3>
                    <p>Keine Schulungen entsprechen den ausgewählten Filterkriterien.</p>
                </div>
            `;
            return;
        }
        
        // Render training items
        container.innerHTML = filteredTrainings.map(training => this.generateTrainingCard(training)).join('');
        
        // Add event listeners for training actions
        this.setupTrainingCardListeners(filteredTrainings);
        
        console.log('🎓 DEBUGGING: Training overview rendered');
    }

    generateTrainingCard(training) {
        const categoryIcon = this.getTrainingCategoryIcon(training.category);
        const statusBadge = this.getTrainingStatusBadge(training);
        const durationText = this.formatDuration(training.duration);
        
        return `
            <div class="training-card" data-training-id="${training.id}">
                <div class="training-card-header">
                    <div class="training-icon">
                        <i class="fas ${categoryIcon}"></i>
                    </div>
                    <div class="training-info">
                        <h4>${training.title}</h4>
                        <p class="training-description">${training.description}</p>
                        <div class="training-meta">
                            <span class="training-duration">
                                <i class="fas fa-clock"></i> ${durationText}
                            </span>
                            <span class="training-category">
                                <i class="fas fa-tag"></i> ${this.getTrainingCategoryDisplayName(training.category)}
                            </span>
                        </div>
                    </div>
                    <div class="training-status">
                        ${statusBadge}
                    </div>
                </div>
                <div class="training-card-actions">
                    <button class="btn-small btn-primary view-training" data-training-id="${training.id}">
                        <i class="fas fa-eye"></i> Ansehen
                    </button>
                    <button class="btn-small btn-secondary assign-training" data-training-id="${training.id}">
                        <i class="fas fa-user-plus"></i> Zuweisen
                    </button>
                    <button class="btn-small btn-secondary edit-training" data-training-id="${training.id}">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                </div>
            </div>
        `;
    }

    getTrainingCategoryIcon(category) {
        const icons = {
            'safety': 'fa-shield-alt',
            'quality': 'fa-star',
            'environment': 'fa-leaf',
            'health': 'fa-heartbeat',
            'data-protection': 'fa-shield-alt',
            'compliance': 'fa-gavel',
            'technical': 'fa-cogs'
        };
        return icons[category] || 'fa-graduation-cap';
    }

    getTrainingCategoryDisplayName(category) {
        const names = {
            'safety': 'Arbeitssicherheit',
            'quality': 'Qualitätsmanagement',
            'environment': 'Umweltschutz',
            'health': 'Gesundheitsschutz',
            'data-protection': 'Datenschutz',
            'compliance': 'Compliance',
            'technical': 'Technische Schulung'
        };
        return names[category] || category;
    }

    getTrainingStatusBadge(training) {
        const currentUser = this.getCurrentUser();
        const assignment = this.trainingAssignments.find(a => 
            a.trainingId === training.id && a.userId === currentUser.id
        );
        
        if (!assignment) {
            return '<span class="status-badge not-assigned">Nicht zugewiesen</span>';
        }
        
        switch (assignment.status) {
            case 'completed':
                return '<span class="status-badge completed">Abgeschlossen</span>';
            case 'in-progress':
                return '<span class="status-badge in-progress">In Bearbeitung</span>';
            case 'overdue':
                return '<span class="status-badge overdue">Überfällig</span>';
            case 'assigned':
                return '<span class="status-badge assigned">Zugewiesen</span>';
            default:
                return '<span class="status-badge unknown">Unbekannt</span>';
        }
    }

    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} Min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
                return `${hours} Std`;
            } else {
                return `${hours}:${remainingMinutes.toString().padStart(2, '0')} Std`;
            }
        }
    }

    setupTrainingCardListeners(trainings) {
        trainings.forEach(training => {
            const viewBtn = document.querySelector(`.view-training[data-training-id="${training.id}"]`);
            const assignBtn = document.querySelector(`.assign-training[data-training-id="${training.id}"]`);
            const editBtn = document.querySelector(`.edit-training[data-training-id="${training.id}"]`);
            
            if (viewBtn) {
                viewBtn.addEventListener('click', () => this.viewTrainingDetails(training.id));
            }
            if (assignBtn) {
                assignBtn.addEventListener('click', () => this.openTrainingAssignmentModal(training.id));
            }
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editTraining(training.id));
            }
        });
    }

    renderMyTrainings() {
        console.log('🎓 DEBUGGING: Rendering my trainings...');
        
        const container = document.getElementById('myTrainingsList');
        if (!container) {
            console.error('🎓 ERROR: My trainings container not found');
            return;
        }
        
        const currentUser = this.getCurrentUser();
        const userAssignments = this.getUserTrainingAssignments(currentUser.id);
        
        if (userAssignments.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-user-graduate"></i>
                    <h3>Keine Schulungen zugewiesen</h3>
                    <p>Ihnen wurden noch keine Schulungen zugewiesen.</p>
                </div>
            `;
            return;
        }
        
        // Update progress bar
        this.updateMyTrainingProgress(userAssignments);
        
        // Render training assignments
        const trainingItems = userAssignments.map(assignment => {
            const training = this.trainings.find(t => t.id === assignment.trainingId);
            return training ? this.generateMyTrainingCard(training, assignment) : '';
        }).filter(item => item);
        
        container.innerHTML = trainingItems.join('');
        
        console.log('🎓 DEBUGGING: My trainings rendered');
    }

    updateMyTrainingProgress(assignments) {
        const completedCount = assignments.filter(a => a.status === 'completed').length;
        const totalCount = assignments.length;
        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        const progressElement = document.getElementById('myTrainingProgress');
        const progressBarElement = document.getElementById('myTrainingProgressBar');
        
        if (progressElement) {
            progressElement.textContent = `${percentage}% abgeschlossen (${completedCount} von ${totalCount})`;
        }
        
        if (progressBarElement) {
            progressBarElement.style.width = `${percentage}%`;
        }
    }

    generateMyTrainingCard(training, assignment) {
        const statusClass = assignment.status;
        const durationText = this.formatDuration(training.duration);
        const dueDate = assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('de-DE') : 'Keine Frist';
        const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
        
        return `
            <div class="my-training-card ${statusClass} ${isOverdue ? 'overdue' : ''}">
                <div class="training-progress-indicator">
                    <div class="progress-circle ${statusClass}">
                        ${assignment.status === 'completed' ? '<i class="fas fa-check"></i>' : 
                          assignment.status === 'in-progress' ? '<i class="fas fa-play"></i>' : 
                          '<i class="fas fa-clock"></i>'}
                    </div>
                </div>
                <div class="my-training-info">
                    <h4>${training.title}</h4>
                    <p>${training.description}</p>
                    <div class="training-details">
                        <span><i class="fas fa-clock"></i> ${durationText}</span>
                        <span><i class="fas fa-calendar"></i> Frist: ${dueDate}</span>
                        <span class="training-status ${statusClass}">
                            ${this.getTrainingStatusDisplayName(assignment.status)}
                        </span>
                    </div>
                </div>
                <div class="my-training-actions">
                    ${assignment.status === 'completed' ? 
                        `<button class="btn-small btn-success view-certificate" data-assignment-id="${assignment.id}">
                            <i class="fas fa-certificate"></i> Zertifikat
                        </button>` :
                        `<button class="btn-small btn-primary start-training" data-training-id="${training.id}">
                            <i class="fas fa-play"></i> ${assignment.status === 'in-progress' ? 'Fortsetzen' : 'Starten'}
                        </button>`
                    }
                    <button class="btn-small btn-secondary view-details" data-training-id="${training.id}">
                        <i class="fas fa-info"></i> Details
                    </button>
                </div>
            </div>
        `;
    }

    getTrainingStatusDisplayName(status) {
        const names = {
            'completed': 'Abgeschlossen',
            'in-progress': 'In Bearbeitung',
            'assigned': 'Zugewiesen',
            'overdue': 'Überfällig',
            'not-started': 'Nicht begonnen'
        };
        return names[status] || status;
    }

    renderAllTrainings() {
        console.log('🎓 DEBUGGING: Rendering all trainings...');
        const container = document.getElementById('allTrainingsList');
        if (!container) return;
        
        if (this.trainings.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-graduation-cap"></i>
                    <h3>Keine Schulungen vorhanden</h3>
                    <p>Es wurden noch keine Schulungen erstellt.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.trainings.map(training => this.generateDetailedTrainingCard(training)).join('');
        this.setupDetailedTrainingCardListeners();
    }

    generateDetailedTrainingCard(training) {
        const assignmentCount = this.trainingAssignments.filter(a => a.trainingId === training.id).length;
        const completedCount = this.trainingAssignments.filter(a => a.trainingId === training.id && a.status === 'completed').length;
        const completionRate = assignmentCount > 0 ? ((completedCount / assignmentCount) * 100).toFixed(1) : 0;
        
        return `
            <div class="detailed-training-card" data-training-id="${training.id}">
                <div class="training-card-header">
                    <div class="training-main-info">
                        <h4>${training.title}</h4>
                        <p>${training.description}</p>
                        <div class="training-meta-extended">
                            <span><i class="fas fa-tag"></i> ${this.getTrainingCategoryDisplayName(training.category)}</span>
                            <span><i class="fas fa-clock"></i> ${this.formatDuration(training.duration)}</span>
                            <span><i class="fas fa-users"></i> ${assignmentCount} Zuweisungen</span>
                            <span><i class="fas fa-percentage"></i> ${completionRate}% Abschluss</span>
                            <span><i class="fas fa-calendar"></i> Erstellt: ${new Date(training.createdAt).toLocaleDateString('de-DE')}</span>
                        </div>
                    </div>
                    <div class="training-actions-extended">
                        <button class="btn-small btn-primary view-detailed-training" data-training-id="${training.id}">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        <button class="btn-small btn-secondary assign-detailed-training" data-training-id="${training.id}">
                            <i class="fas fa-user-plus"></i> Zuweisen
                        </button>
                        <button class="btn-small btn-secondary edit-detailed-training" data-training-id="${training.id}">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                        <button class="btn-small btn-danger delete-training" data-training-id="${training.id}">
                            <i class="fas fa-trash"></i> Löschen
                        </button>
                    </div>
                </div>
                <div class="training-progress-bar">
                    <div class="progress-fill" style="width: ${completionRate}%"></div>
                </div>
            </div>
        `;
    }

    setupDetailedTrainingCardListeners() {
        document.querySelectorAll('.view-detailed-training').forEach(btn => {
            btn.addEventListener('click', () => {
                this.viewTrainingDetails(btn.dataset.trainingId);
            });
        });
        
        document.querySelectorAll('.assign-detailed-training').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openTrainingAssignmentModal(btn.dataset.trainingId);
            });
        });
        
        document.querySelectorAll('.edit-detailed-training').forEach(btn => {
            btn.addEventListener('click', () => {
                this.editTraining(btn.dataset.trainingId);
            });
        });
        
        document.querySelectorAll('.delete-training').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteTraining(btn.dataset.trainingId);
            });
        });
    }

    deleteTraining(trainingId) {
        const training = this.trainings.find(t => t.id === trainingId);
        if (!training) {
            alert('Schulung nicht gefunden!');
            return;
        }

        if (!confirm(`Sind Sie sicher, dass Sie die Schulung "${training.title}" löschen möchten? Alle zugehörigen Zuweisungen werden ebenfalls gelöscht.`)) {
            return;
        }
        
        // Remove training
        this.trainings = this.trainings.filter(t => t.id !== trainingId);
        
        // Remove related assignments
        this.trainingAssignments = this.trainingAssignments.filter(a => a.trainingId !== trainingId);
        
        // Save changes
        this.saveTrainingsToStorage();
        this.saveTrainingAssignmentsToStorage();
        
        // Update UI
        this.updateTrainingStatistics();
        this.renderAllTrainings();
        this.renderTrainingOverview();
        
        alert('Schulung wurde erfolgreich gelöscht.');
    }

    renderTrainingAssignments() {
        console.log('🎓 DEBUGGING: Rendering training assignments...');
        const container = document.getElementById('assignmentsList');
        if (!container) return;
        
        const assignments = this.trainingAssignments.map(assignment => {
            const training = this.trainings.find(t => t.id === assignment.trainingId);
            const user = this.users.find(u => u.id === assignment.userId);
            return { ...assignment, training, user };
        }).filter(a => a.training && a.user);
        
        if (assignments.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-users"></i>
                    <h3>Keine Zuweisungen vorhanden</h3>
                    <p>Es wurden noch keine Schulungen zugewiesen.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = assignments.map(assignment => this.generateAssignmentCard(assignment)).join('');
        this.setupAssignmentCardListeners();
    }

    generateAssignmentCard(assignment) {
        const statusClass = assignment.status.replace('-', '_');
        const deadlineText = assignment.deadline ? new Date(assignment.deadline).toLocaleDateString('de-DE') : 'Keine Frist';
        const priorityText = assignment.priority || 'normal';
        const priorityIcon = this.getPriorityIcon(priorityText);
        
        return `
            <div class="assignment-card ${statusClass}" data-assignment-id="${assignment.id}">
                <div class="assignment-header">
                    <div class="assignment-info">
                        <h4>${assignment.training.title}</h4>
                        <p><strong>Benutzer:</strong> ${assignment.user.displayName || assignment.user.name || assignment.user.id}</p>
                        <p><strong>Abteilung:</strong> ${this.departments.find(d => d.id === assignment.user.department)?.name || 'Unbekannt'}</p>
                        <p><strong>Rolle:</strong> ${this.roleDefinitions[assignment.user.role]?.name || assignment.user.role}</p>
                        ${assignment.notes ? `<p><strong>Notizen:</strong> ${assignment.notes}</p>` : ''}
                    </div>
                    <div class="assignment-status">
                        <span class="status-badge ${assignment.status}">
                            ${this.getAssignmentStatusText(assignment.status)}
                        </span>
                        <div class="assignment-priority ${priorityText}">
                            <i class="${priorityIcon}"></i> ${priorityText.charAt(0).toUpperCase() + priorityText.slice(1)}
                        </div>
                    </div>
                </div>
                <div class="assignment-details">
                    <div class="assignment-meta">
                        <span><i class="fas fa-calendar"></i> Frist: ${deadlineText}</span>
                        <span><i class="fas fa-clock"></i> Zugewiesen: ${new Date(assignment.assignedAt).toLocaleDateString('de-DE')}</span>
                        ${assignment.startedAt ? `<span><i class="fas fa-play"></i> Gestartet: ${new Date(assignment.startedAt).toLocaleDateString('de-DE')}</span>` : ''}
                        <span><i class="fas fa-chart-line"></i> Fortschritt: ${assignment.progress || 0}%</span>
                    </div>
                    <div class="assignment-progress-bar">
                        <div class="progress-fill" style="width: ${assignment.progress || 0}%"></div>
                    </div>
                    <div class="assignment-actions">
                        <button class="btn-small btn-primary view-assignment-progress" data-assignment-id="${assignment.id}">
                            <i class="fas fa-chart-line"></i> Fortschritt
                        </button>
                        <button class="btn-small btn-secondary edit-assignment" data-assignment-id="${assignment.id}">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                        ${assignment.status === 'assigned' || assignment.status === 'in-progress' ? `
                            <button class="btn-small btn-success complete-assignment" data-assignment-id="${assignment.id}">
                                <i class="fas fa-check"></i> Abschließen
                            </button>
                        ` : ''}
                        <button class="btn-small btn-danger remove-assignment" data-assignment-id="${assignment.id}">
                            <i class="fas fa-times"></i> Entfernen
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getPriorityIcon(priority) {
        const icons = {
            'normal': 'fas fa-minus',
            'high': 'fas fa-exclamation',
            'urgent': 'fas fa-exclamation-triangle'
        };
        return icons[priority] || 'fas fa-minus';
    }

    setupAssignmentCardListeners() {
        document.querySelectorAll('.view-assignment-progress').forEach(btn => {
            btn.addEventListener('click', () => {
                this.viewAssignmentProgress(btn.dataset.assignmentId);
            });
        });
        
        document.querySelectorAll('.edit-assignment').forEach(btn => {
            btn.addEventListener('click', () => {
                this.editAssignment(btn.dataset.assignmentId);
            });
        });
        
        document.querySelectorAll('.complete-assignment').forEach(btn => {
            btn.addEventListener('click', () => {
                this.completeAssignment(btn.dataset.assignmentId);
            });
        });
        
        document.querySelectorAll('.remove-assignment').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeAssignment(btn.dataset.assignmentId);
            });
        });
    }

    viewAssignmentProgress(assignmentId) {
        const assignment = this.trainingAssignments.find(a => a.id === assignmentId);
        if (!assignment) {
            alert('Zuweisung nicht gefunden!');
            return;
        }

        const training = this.trainings.find(t => t.id === assignment.trainingId);
        const user = this.users.find(u => u.id === assignment.userId);

        const modal = this.createAssignmentProgressModal(assignment, training, user);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createAssignmentProgressModal(assignment, training, user) {
        const modal = document.createElement('div');
        modal.className = 'modal assignment-progress-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-line"></i> Fortschritt: ${training.title}</h2>
                    <span class="close progress-modal-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="progress-details">
                        <div class="progress-info">
                            <h3>Benutzerinformationen</h3>
                            <p><strong>Name:</strong> ${user.displayName || user.name || user.id}</p>
                            <p><strong>Rolle:</strong> ${this.roleDefinitions[user.role]?.name || user.role}</p>
                            <p><strong>Abteilung:</strong> ${this.departments.find(d => d.id === user.department)?.name || 'Unbekannt'}</p>
                        </div>
                        <div class="progress-status">
                            <h3>Status</h3>
                            <p><strong>Aktueller Status:</strong> ${this.getAssignmentStatusText(assignment.status)}</p>
                            <p><strong>Fortschritt:</strong> ${assignment.progress || 0}%</p>
                            <p><strong>Zugewiesen am:</strong> ${new Date(assignment.assignedAt).toLocaleDateString('de-DE')}</p>
                            ${assignment.startedAt ? `<p><strong>Gestartet am:</strong> ${new Date(assignment.startedAt).toLocaleDateString('de-DE')}</p>` : ''}
                            ${assignment.deadline ? `<p><strong>Frist:</strong> ${new Date(assignment.deadline).toLocaleDateString('de-DE')}</p>` : ''}
                        </div>
                        <div class="progress-update">
                            <h3>Fortschritt aktualisieren</h3>
                            <div class="form-group">
                                <label for="updateProgress">Fortschritt (%):</label>
                                <input type="number" id="updateProgress" min="0" max="100" value="${assignment.progress || 0}">
                            </div>
                            <div class="form-group">
                                <label for="updateStatus">Status:</label>
                                <select id="updateStatus">
                                    <option value="assigned" ${assignment.status === 'assigned' ? 'selected' : ''}>Zugewiesen</option>
                                    <option value="in-progress" ${assignment.status === 'in-progress' ? 'selected' : ''}>In Bearbeitung</option>
                                    <option value="completed" ${assignment.status === 'completed' ? 'selected' : ''}>Abgeschlossen</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button class="btn-primary" id="saveProgress">
                                    <i class="fas fa-save"></i> Speichern
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.progress-modal-close');
        closeBtn.addEventListener('click', () => modal.remove());

        const saveBtn = modal.querySelector('#saveProgress');
        saveBtn.addEventListener('click', () => {
            this.updateAssignmentProgress(assignment.id, modal);
        });

        return modal;
    }

    updateAssignmentProgress(assignmentId, modal) {
        const progress = parseInt(modal.querySelector('#updateProgress').value);
        const status = modal.querySelector('#updateStatus').value;

        const assignmentIndex = this.trainingAssignments.findIndex(a => a.id === assignmentId);
        if (assignmentIndex === -1) {
            alert('Zuweisung nicht gefunden!');
            return;
        }

        this.trainingAssignments[assignmentIndex].progress = progress;
        this.trainingAssignments[assignmentIndex].status = status;
        
        if (status === 'completed' && progress < 100) {
            this.trainingAssignments[assignmentIndex].progress = 100;
        }

        this.saveTrainingAssignmentsToStorage();
        this.renderTrainingAssignments();
        this.updateTrainingStatistics();

        alert('Fortschritt wurde aktualisiert!');
        modal.remove();
    }

    editAssignment(assignmentId) {
        const assignment = this.trainingAssignments.find(a => a.id === assignmentId);
        if (!assignment) {
            alert('Zuweisung nicht gefunden!');
            return;
        }

        // For now, open the progress modal which allows editing
        this.viewAssignmentProgress(assignmentId);
    }

    completeAssignment(assignmentId) {
        const assignmentIndex = this.trainingAssignments.findIndex(a => a.id === assignmentId);
        if (assignmentIndex === -1) {
            alert('Zuweisung nicht gefunden!');
            return;
        }

        if (confirm('Soll diese Zuweisung als abgeschlossen markiert werden?')) {
            this.trainingAssignments[assignmentIndex].status = 'completed';
            this.trainingAssignments[assignmentIndex].progress = 100;
            this.trainingAssignments[assignmentIndex].completedAt = new Date().toISOString();

            this.saveTrainingAssignmentsToStorage();
            this.renderTrainingAssignments();
            this.updateTrainingStatistics();

            alert('Zuweisung wurde als abgeschlossen markiert!');
        }
    }

    removeAssignment(assignmentId) {
        if (!confirm('Sind Sie sicher, dass Sie diese Zuweisung entfernen möchten?')) {
            return;
        }
        
        this.trainingAssignments = this.trainingAssignments.filter(a => a.id !== assignmentId);
        this.saveTrainingAssignmentsToStorage();
        this.renderTrainingAssignments();
        this.updateTrainingStatistics();
        
        alert('Zuweisung wurde entfernt.');
    }

    renderCertificates() {
        console.log('🎓 DEBUGGING: Rendering certificates...');
        const container = document.getElementById('certificatesList');
        if (!container) return;
        
        // Filter certificates based on search and status
        const searchQuery = document.getElementById('certificateSearch')?.value?.toLowerCase() || '';
        const statusFilter = document.getElementById('certificateStatusFilter')?.value || '';
        
        let filteredCertificates = this.certificates.filter(certificate => {
            // Search filter
            if (searchQuery && !certificate.title.toLowerCase().includes(searchQuery)) return false;
            
            // Status filter
            if (statusFilter) {
                const expiryDate = certificate.expiryDate ? new Date(certificate.expiryDate) : null;
                const isExpired = expiryDate && expiryDate < new Date();
                const isExpiring = expiryDate && expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                
                if (statusFilter === 'valid' && (isExpired || isExpiring)) return false;
                if (statusFilter === 'expiring' && (!isExpiring || isExpired)) return false;
                if (statusFilter === 'expired' && !isExpired) return false;
            }
            
            return true;
        });
        
        if (filteredCertificates.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-certificate"></i>
                    <h3>Keine Zertifikate gefunden</h3>
                    <p>Keine Zertifikate entsprechen den ausgewählten Kriterien.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredCertificates.map(certificate => this.generateCertificateCard(certificate)).join('');
        this.setupCertificateCardListeners();
    }

    generateCertificateCard(certificate) {
        const expiryDate = certificate.expiryDate ? new Date(certificate.expiryDate) : null;
        const isExpired = expiryDate && expiryDate < new Date();
        const isExpiring = expiryDate && expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        let statusClass = 'valid';
        let statusText = 'Gültig';
        
        if (isExpired) {
            statusClass = 'expired';
            statusText = 'Abgelaufen';
        } else if (isExpiring) {
            statusClass = 'expiring';
            statusText = 'Läuft ab';
        }
        
        return `
            <div class="certificate-card ${statusClass}" data-certificate-id="${certificate.id}">
                <div class="certificate-header">
                    <div class="certificate-info">
                        <h4>${certificate.title}</h4>
                        <p><strong>Inhaber:</strong> ${certificate.holderName}</p>
                        <p><strong>Aussteller:</strong> ${certificate.issuer}</p>
                        ${certificate.notes ? `<p><strong>Notizen:</strong> ${certificate.notes}</p>` : ''}
                    </div>
                    <div class="certificate-status">
                        <span class="certificate-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <div class="certificate-details">
                    <div class="certificate-meta">
                        <span><i class="fas fa-calendar"></i> Ausgestellt: ${new Date(certificate.issueDate).toLocaleDateString('de-DE')}</span>
                        ${expiryDate ? `<span><i class="fas fa-calendar-times"></i> Gültig bis: ${expiryDate.toLocaleDateString('de-DE')}</span>` : ''}
                        ${certificate.fileName ? `<span><i class="fas fa-file"></i> Datei: ${certificate.fileName}</span>` : ''}
                    </div>
                    <div class="certificate-actions">
                        ${certificate.fileData ? `
                            <button class="btn-small btn-primary view-certificate" data-certificate-id="${certificate.id}">
                                <i class="fas fa-eye"></i> Anzeigen
                            </button>
                            <button class="btn-small btn-secondary download-certificate" data-certificate-id="${certificate.id}">
                                <i class="fas fa-download"></i> Download
                            </button>
                            <button class="btn-small btn-secondary print-certificate" data-certificate-id="${certificate.id}">
                                <i class="fas fa-print"></i> Drucken
                            </button>
                        ` : ''}
                        <button class="btn-small btn-danger delete-certificate" data-certificate-id="${certificate.id}">
                            <i class="fas fa-trash"></i> Löschen
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupCertificateCardListeners() {
        // View certificate
        document.querySelectorAll('.view-certificate').forEach(btn => {
            btn.addEventListener('click', () => {
                this.viewCertificate(btn.dataset.certificateId);
            });
        });

        // Download certificate
        document.querySelectorAll('.download-certificate').forEach(btn => {
            btn.addEventListener('click', () => {
                this.downloadCertificate(btn.dataset.certificateId);
            });
        });

        // Print certificate
        document.querySelectorAll('.print-certificate').forEach(btn => {
            btn.addEventListener('click', () => {
                this.printCertificate(btn.dataset.certificateId);
            });
        });

        // Delete certificate
        document.querySelectorAll('.delete-certificate').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteCertificate(btn.dataset.certificateId);
            });
        });

        // Setup certificate filters
        const searchInput = document.getElementById('certificateSearch');
        const statusFilter = document.getElementById('certificateStatusFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderCertificates();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.renderCertificates();
            });
        }
    }

    viewCertificate(certificateId) {
        const certificate = this.certificates.find(c => c.id === certificateId);
        if (!certificate || !certificate.fileData) {
            alert('Zertifikatsdatei nicht gefunden!');
            return;
        }

        const modal = this.createCertificateViewModal(certificate);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createCertificateViewModal(certificate) {
        const modal = document.createElement('div');
        modal.className = 'modal certificate-view-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-certificate"></i> ${certificate.title}</h2>
                    <span class="close certificate-view-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="certificate-viewer">
                        <div class="certificate-info-panel">
                            <h3>Zertifikatsinformationen</h3>
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>Titel:</label>
                                    <span>${certificate.title}</span>
                                </div>
                                <div class="info-item">
                                    <label>Inhaber:</label>
                                    <span>${certificate.holderName}</span>
                                </div>
                                <div class="info-item">
                                    <label>Aussteller:</label>
                                    <span>${certificate.issuer}</span>
                                </div>
                                <div class="info-item">
                                    <label>Ausstellungsdatum:</label>
                                    <span>${new Date(certificate.issueDate).toLocaleDateString('de-DE')}</span>
                                </div>
                                ${certificate.expiryDate ? `
                                    <div class="info-item">
                                        <label>Ablaufdatum:</label>
                                        <span>${new Date(certificate.expiryDate).toLocaleDateString('de-DE')}</span>
                                    </div>
                                ` : ''}
                                ${certificate.notes ? `
                                    <div class="info-item full-width">
                                        <label>Notizen:</label>
                                        <span>${certificate.notes}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="certificate-preview">
                            ${this.generateCertificatePreview(certificate)}
                        </div>
                    </div>
                    <div class="certificate-view-actions">
                        <button class="btn-primary download-cert-modal" data-certificate-id="${certificate.id}">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="btn-secondary print-cert-modal" data-certificate-id="${certificate.id}">
                            <i class="fas fa-print"></i> Drucken
                        </button>
                        <button class="btn-secondary close-cert-view">
                            <i class="fas fa-times"></i> Schließen
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.certificate-view-close');
        const closeViewBtn = modal.querySelector('.close-cert-view');
        [closeBtn, closeViewBtn].forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        const downloadBtn = modal.querySelector('.download-cert-modal');
        downloadBtn.addEventListener('click', () => {
            this.downloadCertificate(certificate.id);
        });

        const printBtn = modal.querySelector('.print-cert-modal');
        printBtn.addEventListener('click', () => {
            this.printCertificate(certificate.id);
        });

        return modal;
    }

    generateCertificatePreview(certificate) {
        if (!certificate.fileData) {
            return '<div class="no-preview">Keine Vorschau verfügbar</div>';
        }

        const fileType = certificate.fileData.split(';')[0].split(':')[1];
        
        if (fileType.startsWith('image/')) {
            return `
                <div class="image-preview">
                    <img src="${certificate.fileData}" alt="${certificate.title}" style="max-width: 100%; max-height: 500px;">
                </div>
            `;
        } else if (fileType === 'application/pdf') {
            return `
                <div class="pdf-preview">
                    <iframe src="${certificate.fileData}" width="100%" height="500px" style="border: none;">
                        <p>PDF-Vorschau nicht verfügbar. <a href="${certificate.fileData}" target="_blank">Hier klicken zum Öffnen</a></p>
                    </iframe>
                </div>
            `;
        } else {
            return `
                <div class="file-preview">
                    <i class="fas fa-file fa-3x"></i>
                    <p>Dateivorschau nicht verfügbar</p>
                    <p>Dateityp: ${fileType}</p>
                </div>
            `;
        }
    }

    downloadCertificate(certificateId) {
        const certificate = this.certificates.find(c => c.id === certificateId);
        if (!certificate || !certificate.fileData) {
            alert('Zertifikatsdatei nicht gefunden!');
            return;
        }

        const link = document.createElement('a');
        link.href = certificate.fileData;
        link.download = certificate.fileName || `${certificate.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    printCertificate(certificateId) {
        const certificate = this.certificates.find(c => c.id === certificateId);
        if (!certificate || !certificate.fileData) {
            alert('Zertifikatsdatei nicht gefunden!');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Zertifikat: ${certificate.title}</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        .certificate-header { margin-bottom: 20px; }
                        .certificate-info { margin-bottom: 10px; }
                        img { max-width: 100%; height: auto; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    <div class="certificate-header">
                        <h1>${certificate.title}</h1>
                        <div class="certificate-info">
                            <p><strong>Inhaber:</strong> ${certificate.holderName}</p>
                            <p><strong>Aussteller:</strong> ${certificate.issuer}</p>
                            <p><strong>Ausstellungsdatum:</strong> ${new Date(certificate.issueDate).toLocaleDateString('de-DE')}</p>
                            ${certificate.expiryDate ? `<p><strong>Ablaufdatum:</strong> ${new Date(certificate.expiryDate).toLocaleDateString('de-DE')}</p>` : ''}
                        </div>
                    </div>
                    ${certificate.fileData.startsWith('data:image/') ? 
                        `<img src="${certificate.fileData}" alt="${certificate.title}">` : 
                        `<iframe src="${certificate.fileData}" width="100%" height="600px"></iframe>`
                    }
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    deleteCertificate(certificateId) {
        const certificate = this.certificates.find(c => c.id === certificateId);
        if (!certificate) {
            alert('Zertifikat nicht gefunden!');
            return;
        }

        if (confirm(`Sind Sie sicher, dass Sie das Zertifikat "${certificate.title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
            this.certificates = this.certificates.filter(c => c.id !== certificateId);
            this.saveCertificatesToStorage();
            this.renderCertificates();
            alert('Zertifikat wurde erfolgreich gelöscht.');
        }
    }

    // ========================================
    // FULL TRAINING FUNCTIONALITY IMPLEMENTATION
    // ========================================

    openTrainingModal() {
        console.log('🎓 DEBUGGING: Opening training creation modal...');
        this.openNewTrainingModal();
    }

    openTrainingReports() {
        console.log('🎓 DEBUGGING: Opening training reports...');
        this.openTrainingReportsModal();
    }

    openTrainingCalendar() {
        console.log('🎓 DEBUGGING: Opening training calendar...');
        this.openTrainingCalendarModal();
    }

    // ========================================
    // TRAINING DETAIL FUNCTIONS
    // ========================================

    viewTrainingDetails(trainingId) {
        const training = this.trainings.find(t => t.id === trainingId);
        if (!training) {
            alert('Schulung nicht gefunden!');
            return;
        }

        const modal = this.createTrainingDetailModal(training);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createTrainingDetailModal(training) {
        const modal = document.createElement('div');
        modal.className = 'modal training-detail-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-graduation-cap"></i> ${training.title}</h2>
                    <span class="close training-detail-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="training-detail-content">
                        <div class="training-info-grid">
                            <div class="training-main-info">
                                <div class="info-section">
                                    <h3>Beschreibung</h3>
                                    <p>${training.description}</p>
                                </div>
                                <div class="info-section">
                                    <h3>Details</h3>
                                    <div class="detail-grid">
                                        <div class="detail-item">
                                            <label>Kategorie:</label>
                                            <span>${this.getTrainingCategoryDisplayName(training.category)}</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>Typ:</label>
                                            <span>${training.type === 'mandatory' ? 'Pflicht' : 'Optional'}</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>Dauer:</label>
                                            <span>${this.formatDuration(training.duration)}</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>Gültigkeit:</label>
                                            <span>${training.validityPeriod} Monate</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>Wiederkehrend:</label>
                                            <span>${training.isRecurring ? 'Ja' : 'Nein'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="info-section">
                                    <h3>Zielgruppe</h3>
                                    <div class="target-info">
                                        <div class="target-roles">
                                            <label>Rollen:</label>
                                            <div class="role-tags">
                                                ${training.targetRoles.map(role => `<span class="role-tag">${this.roleDefinitions[role]?.name || role}</span>`).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="training-actions">
                            <button class="btn-primary start-training" data-training-id="${training.id}">
                                <i class="fas fa-play"></i> Schulung starten
                            </button>
                            <button class="btn-secondary assign-to-users" data-training-id="${training.id}">
                                <i class="fas fa-users"></i> Nutzer zuweisen
                            </button>
                            <button class="btn-secondary view-progress" data-training-id="${training.id}">
                                <i class="fas fa-chart-line"></i> Fortschritt anzeigen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.training-detail-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        const startBtn = modal.querySelector('.start-training');
        startBtn.addEventListener('click', () => {
            this.startTraining(training.id);
            modal.remove();
        });

        const assignBtn = modal.querySelector('.assign-to-users');
        assignBtn.addEventListener('click', () => {
            this.openTrainingAssignmentModal(training.id);
        });

        const progressBtn = modal.querySelector('.view-progress');
        progressBtn.addEventListener('click', () => {
            this.viewTrainingProgress(training.id);
        });

        return modal;
    }

    startTraining(trainingId) {
        const currentUser = this.getCurrentUser();
        let assignment = this.trainingAssignments.find(a => 
            a.trainingId === trainingId && a.userId === currentUser.id
        );

        if (!assignment) {
            // Create new assignment
            assignment = {
                id: `assignment-${Date.now()}`,
                trainingId: trainingId,
                userId: currentUser.id,
                assignedBy: currentUser.id,
                assignedAt: new Date().toISOString(),
                status: 'in-progress',
                progress: 0,
                startedAt: new Date().toISOString()
            };
            this.trainingAssignments.push(assignment);
        } else {
            assignment.status = 'in-progress';
            assignment.startedAt = new Date().toISOString();
        }

        this.saveTrainingAssignmentsToStorage();
        this.updateTrainingStatistics();
        this.renderTrainingOverview();
        
        alert('Schulung wurde gestartet!');
    }

    // ========================================
    // TRAINING ASSIGNMENT FUNCTIONS
    // ========================================

    openTrainingAssignmentModal(trainingId) {
        const training = this.trainings.find(t => t.id === trainingId);
        if (!training) {
            alert('Schulung nicht gefunden!');
            return;
        }

        const modal = this.createTrainingAssignmentModal(training);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createTrainingAssignmentModal(training) {
        const modal = document.createElement('div');
        modal.className = 'modal assignment-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-user-plus"></i> Schulung zuweisen: ${training.title}</h2>
                    <span class="close assignment-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="assignment-form">
                        <div class="form-section">
                            <h3>Benutzer auswählen</h3>
                            <div class="user-selection">
                                <div class="selection-filters">
                                    <select id="assignmentDepartmentSelect">
                                        <option value="">Alle Abteilungen</option>
                                        ${this.departments.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('')}
                                    </select>
                                    <select id="assignmentRoleSelect">
                                        <option value="">Alle Rollen</option>
                                        ${Object.entries(this.roleDefinitions).map(([key, role]) => `<option value="${key}">${role.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="user-list" id="assignmentUserList">
                                    ${this.renderAssignmentUserList()}
                                </div>
                            </div>
                        </div>
                        <div class="form-section">
                            <h3>Zuweisung konfigurieren</h3>
                            <div class="assignment-config">
                                <div class="form-group">
                                    <label for="assignmentDeadline">Frist:</label>
                                    <input type="date" id="assignmentDeadline" min="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label for="assignmentPriority">Priorität:</label>
                                    <select id="assignmentPriority">
                                        <option value="normal">Normal</option>
                                        <option value="high">Hoch</option>
                                        <option value="urgent">Dringend</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="assignmentNotes">Notizen:</label>
                                    <textarea id="assignmentNotes" placeholder="Zusätzliche Informationen zur Zuweisung..."></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button class="btn-primary" id="confirmAssignment">
                                <i class="fas fa-check"></i> Zuweisen
                            </button>
                            <button class="btn-secondary" id="cancelAssignment">
                                <i class="fas fa-times"></i> Abbrechen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.assignment-close');
        const cancelBtn = modal.querySelector('#cancelAssignment');
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        const confirmBtn = modal.querySelector('#confirmAssignment');
        confirmBtn.addEventListener('click', () => {
            this.confirmTrainingAssignment(training.id, modal);
        });

        // Filter event listeners
        const deptSelect = modal.querySelector('#assignmentDepartmentSelect');
        const roleSelect = modal.querySelector('#assignmentRoleSelect');
        [deptSelect, roleSelect].forEach(select => {
            select.addEventListener('change', () => {
                this.updateAssignmentUserList(modal);
            });
        });

        return modal;
    }

    renderAssignmentUserList(departmentFilter = '', roleFilter = '') {
        return this.users.filter(user => {
            if (departmentFilter && user.department !== departmentFilter) return false;
            if (roleFilter && user.role !== roleFilter) return false;
            return true;
        }).map(user => `
            <div class="user-item">
                <label>
                    <input type="checkbox" class="user-checkbox" value="${user.id}">
                    <span class="user-info">
                        <strong>${user.displayName || user.name || user.id}</strong>
                        <small>${this.roleDefinitions[user.role]?.name || user.role} - ${this.departments.find(d => d.id === user.department)?.name || 'Keine Abteilung'}</small>
                    </span>
                </label>
            </div>
        `).join('');
    }

    updateAssignmentUserList(modal) {
        const deptFilter = modal.querySelector('#assignmentDepartmentSelect').value;
        const roleFilter = modal.querySelector('#assignmentRoleSelect').value;
        const userList = modal.querySelector('#assignmentUserList');
        userList.innerHTML = this.renderAssignmentUserList(deptFilter, roleFilter);
    }

    confirmTrainingAssignment(trainingId, modal) {
        const selectedUsers = Array.from(modal.querySelectorAll('.user-checkbox:checked')).map(cb => cb.value);
        const deadline = modal.querySelector('#assignmentDeadline').value;
        const priority = modal.querySelector('#assignmentPriority').value;
        const notes = modal.querySelector('#assignmentNotes').value;

        if (selectedUsers.length === 0) {
            alert('Bitte mindestens einen Benutzer auswählen.');
            return;
        }

        const currentUser = this.getCurrentUser();
        const assignmentDate = new Date().toISOString();

        selectedUsers.forEach(userId => {
            // Check if assignment already exists
            const existingAssignment = this.trainingAssignments.find(a => 
                a.trainingId === trainingId && a.userId === userId
            );

            if (!existingAssignment) {
                const newAssignment = {
                    id: `assignment-${Date.now()}-${userId}`,
                    trainingId: trainingId,
                    userId: userId,
                    assignedBy: currentUser.id,
                    assignedAt: assignmentDate,
                    deadline: deadline || null,
                    priority: priority,
                    notes: notes,
                    status: 'assigned',
                    progress: 0
                };
                this.trainingAssignments.push(newAssignment);
            }
        });

        this.saveTrainingAssignmentsToStorage();
        this.updateTrainingStatistics();
        
        alert(`Schulung wurde an ${selectedUsers.length} Benutzer zugewiesen.`);
        modal.remove();
    }

    editTraining(trainingId) {
        const training = this.trainings.find(t => t.id === trainingId);
        if (!training) {
            alert('Schulung nicht gefunden!');
            return;
        }
        
        // Create edit modal similar to new training modal but pre-filled
        const modal = this.createEditTrainingModal(training);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createEditTrainingModal(training) {
        const modal = this.createNewTrainingModal();
        
        // Change title and button text
        modal.querySelector('.modal-header h2').innerHTML = `<i class="fas fa-edit"></i> Schulung bearbeiten`;
        modal.querySelector('button[type="submit"]').innerHTML = `<i class="fas fa-save"></i> Änderungen speichern`;
        
        // Pre-fill form with existing data
        modal.querySelector('#trainingTitle').value = training.title;
        modal.querySelector('#trainingDescription').value = training.description;
        modal.querySelector('#trainingCategory').value = training.category;
        modal.querySelector('#trainingType').value = training.type;
        modal.querySelector('#trainingDuration').value = training.duration;
        modal.querySelector('#trainingValidity').value = training.validityPeriod;
        modal.querySelector('#trainingRecurring').checked = training.isRecurring;
        modal.querySelector('#requiresTest').checked = training.completionCriteria.requiresTest;
        modal.querySelector('#passingScore').value = training.completionCriteria.passingScore;
        modal.querySelector('#requiresSignature').checked = training.completionCriteria.requiresSignature;
        
        // Select target roles
        training.targetRoles.forEach(role => {
            const checkbox = modal.querySelector(`input[name="targetRoles"][value="${role}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Select target departments
        training.targetDepartments.forEach(dept => {
            const checkbox = modal.querySelector(`input[name="targetDepartments"][value="${dept}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Update form submission handler
        const form = modal.querySelector('#newTrainingForm');
        form.removeEventListener('submit', this.createNewTraining);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTraining(training.id, modal);
        });
        
        return modal;
    }

    updateTraining(trainingId, modal) {
        const trainingIndex = this.trainings.findIndex(t => t.id === trainingId);
        if (trainingIndex === -1) {
            alert('Schulung nicht gefunden!');
            return;
        }
        
        const currentUser = this.getCurrentUser();
        
        // Get form values (same as createNewTraining)
        const title = modal.querySelector('#trainingTitle').value;
        const description = modal.querySelector('#trainingDescription').value;
        const category = modal.querySelector('#trainingCategory').value;
        const type = modal.querySelector('#trainingType').value;
        const duration = parseInt(modal.querySelector('#trainingDuration').value);
        const validity = parseInt(modal.querySelector('#trainingValidity').value) || 12;
        const isRecurring = modal.querySelector('#trainingRecurring').checked;
        const requiresTest = modal.querySelector('#requiresTest').checked;
        const passingScore = parseInt(modal.querySelector('#passingScore').value) || 80;
        const requiresSignature = modal.querySelector('#requiresSignature').checked;
        
        const targetRoles = Array.from(modal.querySelectorAll('input[name="targetRoles"]:checked')).map(cb => cb.value);
        const targetDepartments = Array.from(modal.querySelectorAll('input[name="targetDepartments"]:checked')).map(cb => cb.value);
        
        if (!title || !description || !category || !type || !duration || targetRoles.length === 0) {
            alert('Bitte füllen Sie alle Pflichtfelder aus und wählen Sie mindestens eine Zielrolle.');
            return;
        }
        
        // Update training
        this.trainings[trainingIndex] = {
            ...this.trainings[trainingIndex],
            title: title,
            description: description,
            category: category,
            type: type,
            duration: duration,
            validityPeriod: validity,
            isRecurring: isRecurring,
            targetRoles: targetRoles,
            targetDepartments: targetDepartments,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.id,
            completionCriteria: {
                requiresTest: requiresTest,
                passingScore: passingScore,
                requiresSignature: requiresSignature
            }
        };
        
        this.saveTrainingsToStorage();
        this.updateTrainingStatistics();
        this.renderTrainingOverview();
        
        alert('Schulung wurde erfolgreich aktualisiert!');
        modal.remove();
    }

    openBulkAssignmentModal() {
        const modal = this.createBulkAssignmentModal();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createBulkAssignmentModal() {
        const modal = document.createElement('div');
        modal.className = 'modal bulk-assignment-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-users"></i> Massen-Zuweisung</h2>
                    <span class="close bulk-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="bulk-assignment-form">
                        <div class="form-section">
                            <h3>Schulungen auswählen</h3>
                            <div class="training-selection">
                                ${this.trainings.map(training => `
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="bulkTrainings" value="${training.id}">
                                        ${training.title} (${this.getTrainingCategoryDisplayName(training.category)})
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <div class="form-section">
                            <h3>Benutzer auswählen</h3>
                            <div class="bulk-user-selection">
                                <div class="selection-options">
                                    <label>
                                        <input type="radio" name="selectionType" value="department" checked>
                                        Nach Abteilung
                                    </label>
                                    <label>
                                        <input type="radio" name="selectionType" value="role">
                                        Nach Rolle
                                    </label>
                                    <label>
                                        <input type="radio" name="selectionType" value="individual">
                                        Individuelle Auswahl
                                    </label>
                                </div>
                                <div id="departmentSelection" class="selection-content">
                                    ${this.departments.map(dept => `
                                        <label class="checkbox-item">
                                            <input type="checkbox" name="bulkDepartments" value="${dept.id}">
                                            ${dept.name}
                                        </label>
                                    `).join('')}
                                </div>
                                <div id="roleSelection" class="selection-content hidden">
                                    ${Object.entries(this.roleDefinitions).map(([key, role]) => `
                                        <label class="checkbox-item">
                                            <input type="checkbox" name="bulkRoles" value="${key}">
                                            ${role.name}
                                        </label>
                                    `).join('')}
                                </div>
                                <div id="individualSelection" class="selection-content hidden">
                                    ${this.users.map(user => `
                                        <label class="checkbox-item">
                                            <input type="checkbox" name="bulkUsers" value="${user.id}">
                                            ${user.displayName || user.name || user.id} (${this.roleDefinitions[user.role]?.name || user.role})
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="form-section">
                            <h3>Konfiguration</h3>
                            <div class="bulk-config">
                                <div class="form-group">
                                    <label for="bulkDeadline">Frist:</label>
                                    <input type="date" id="bulkDeadline" min="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label for="bulkPriority">Priorität:</label>
                                    <select id="bulkPriority">
                                        <option value="normal">Normal</option>
                                        <option value="high">Hoch</option>
                                        <option value="urgent">Dringend</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button class="btn-primary" id="confirmBulkAssignment">
                                <i class="fas fa-check"></i> Massen-Zuweisung durchführen
                            </button>
                            <button class="btn-secondary" id="cancelBulkAssignment">
                                <i class="fas fa-times"></i> Abbrechen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.bulk-close');
        const cancelBtn = modal.querySelector('#cancelBulkAssignment');
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        // Selection type toggle
        modal.querySelectorAll('input[name="selectionType"]').forEach(radio => {
            radio.addEventListener('change', () => {
                modal.querySelectorAll('.selection-content').forEach(content => content.classList.add('hidden'));
                if (radio.value === 'department') {
                    modal.querySelector('#departmentSelection').classList.remove('hidden');
                } else if (radio.value === 'role') {
                    modal.querySelector('#roleSelection').classList.remove('hidden');
                } else if (radio.value === 'individual') {
                    modal.querySelector('#individualSelection').classList.remove('hidden');
                }
            });
        });

        const confirmBtn = modal.querySelector('#confirmBulkAssignment');
        confirmBtn.addEventListener('click', () => {
            this.confirmBulkAssignment(modal);
        });

        return modal;
    }

    confirmBulkAssignment(modal) {
        const selectedTrainings = Array.from(modal.querySelectorAll('input[name="bulkTrainings"]:checked')).map(cb => cb.value);
        const selectionType = modal.querySelector('input[name="selectionType"]:checked').value;
        const deadline = modal.querySelector('#bulkDeadline').value;
        const priority = modal.querySelector('#bulkPriority').value;

        if (selectedTrainings.length === 0) {
            alert('Bitte mindestens eine Schulung auswählen.');
            return;
        }

        let targetUsers = [];

        if (selectionType === 'department') {
            const selectedDepartments = Array.from(modal.querySelectorAll('input[name="bulkDepartments"]:checked')).map(cb => cb.value);
            if (selectedDepartments.length === 0) {
                alert('Bitte mindestens eine Abteilung auswählen.');
                return;
            }
            targetUsers = this.users.filter(user => selectedDepartments.includes(user.department));
        } else if (selectionType === 'role') {
            const selectedRoles = Array.from(modal.querySelectorAll('input[name="bulkRoles"]:checked')).map(cb => cb.value);
            if (selectedRoles.length === 0) {
                alert('Bitte mindestens eine Rolle auswählen.');
                return;
            }
            targetUsers = this.users.filter(user => selectedRoles.includes(user.role));
        } else if (selectionType === 'individual') {
            const selectedUserIds = Array.from(modal.querySelectorAll('input[name="bulkUsers"]:checked')).map(cb => cb.value);
            if (selectedUserIds.length === 0) {
                alert('Bitte mindestens einen Benutzer auswählen.');
                return;
            }
            targetUsers = this.users.filter(user => selectedUserIds.includes(user.id));
        }

        const currentUser = this.getCurrentUser();
        const assignmentDate = new Date().toISOString();
        let assignmentCount = 0;

        selectedTrainings.forEach(trainingId => {
            targetUsers.forEach(user => {
                // Check if assignment already exists
                const existingAssignment = this.trainingAssignments.find(a => 
                    a.trainingId === trainingId && a.userId === user.id
                );

                if (!existingAssignment) {
                    const newAssignment = {
                        id: `assignment-${Date.now()}-${trainingId}-${user.id}`,
                        trainingId: trainingId,
                        userId: user.id,
                        assignedBy: currentUser.id,
                        assignedAt: assignmentDate,
                        deadline: deadline || null,
                        priority: priority,
                        status: 'assigned',
                        progress: 0
                    };
                    this.trainingAssignments.push(newAssignment);
                    assignmentCount++;
                }
            });
        });

        this.saveTrainingAssignmentsToStorage();
        this.updateTrainingStatistics();

        alert(`Massen-Zuweisung abgeschlossen: ${assignmentCount} neue Zuweisungen erstellt.`);
        modal.remove();
    }

    exportTrainingData() {
        const data = {
            trainings: this.trainings,
            assignments: this.trainingAssignments,
            certificates: this.certificates,
            exportDate: new Date().toISOString(),
            exportedBy: this.getCurrentUser().id
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `training-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Schulungsdaten wurden erfolgreich exportiert!');
    }

    openAssignmentModal() {
        // This opens the general assignment modal without a specific training
        const modal = this.createGeneralAssignmentModal();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createGeneralAssignmentModal() {
        const modal = document.createElement('div');
        modal.className = 'modal general-assignment-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-plus"></i> Neue Schulungszuweisung</h2>
                    <span class="close general-assignment-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="assignment-wizard">
                        <div class="wizard-step active" id="step1">
                            <h3>1. Schulung auswählen</h3>
                            <div class="training-list-selection">
                                ${this.trainings.map(training => `
                                    <div class="training-option" data-training-id="${training.id}">
                                        <input type="radio" name="selectedTraining" value="${training.id}" id="training-${training.id}">
                                        <label for="training-${training.id}">
                                            <strong>${training.title}</strong>
                                            <p>${training.description}</p>
                                            <small>${this.getTrainingCategoryDisplayName(training.category)} - ${this.formatDuration(training.duration)}</small>
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="wizard-actions">
                                <button class="btn-primary" id="nextToStep2">
                                    Weiter <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="wizard-step" id="step2">
                            <h3>2. Benutzer auswählen</h3>
                            <div class="user-selection-wizard">
                                <div class="selection-filters">
                                    <select id="wizardDepartmentSelect">
                                        <option value="">Alle Abteilungen</option>
                                        ${this.departments.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('')}
                                    </select>
                                    <select id="wizardRoleSelect">
                                        <option value="">Alle Rollen</option>
                                        ${Object.entries(this.roleDefinitions).map(([key, role]) => `<option value="${key}">${role.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="user-list-wizard" id="wizardUserList">
                                    ${this.renderWizardUserList()}
                                </div>
                            </div>
                            <div class="wizard-actions">
                                <button class="btn-secondary" id="backToStep1">
                                    <i class="fas fa-arrow-left"></i> Zurück
                                </button>
                                <button class="btn-primary" id="nextToStep3">
                                    Weiter <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="wizard-step" id="step3">
                            <h3>3. Konfiguration</h3>
                            <div class="wizard-config">
                                <div class="form-group">
                                    <label for="wizardDeadline">Frist:</label>
                                    <input type="date" id="wizardDeadline" min="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label for="wizardPriority">Priorität:</label>
                                    <select id="wizardPriority">
                                        <option value="normal">Normal</option>
                                        <option value="high">Hoch</option>
                                        <option value="urgent">Dringend</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="wizardNotes">Notizen:</label>
                                    <textarea id="wizardNotes" placeholder="Zusätzliche Informationen..."></textarea>
                                </div>
                            </div>
                            <div class="wizard-actions">
                                <button class="btn-secondary" id="backToStep2">
                                    <i class="fas fa-arrow-left"></i> Zurück
                                </button>
                                <button class="btn-primary" id="completeAssignment">
                                    <i class="fas fa-check"></i> Zuweisung abschließen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add wizard navigation listeners
        this.setupWizardNavigation(modal);

        return modal;
    }

    renderWizardUserList(departmentFilter = '', roleFilter = '') {
        return this.users.filter(user => {
            if (departmentFilter && user.department !== departmentFilter) return false;
            if (roleFilter && user.role !== roleFilter) return false;
            return true;
        }).map(user => `
            <div class="wizard-user-item">
                <label>
                    <input type="checkbox" class="wizard-user-checkbox" value="${user.id}">
                    <span class="wizard-user-info">
                        <strong>${user.displayName || user.name || user.id}</strong>
                        <small>${this.roleDefinitions[user.role]?.name || user.role} - ${this.departments.find(d => d.id === user.department)?.name || 'Keine Abteilung'}</small>
                    </span>
                </label>
            </div>
        `).join('');
    }

    setupWizardNavigation(modal) {
        const closeBtn = modal.querySelector('.general-assignment-close');
        closeBtn.addEventListener('click', () => modal.remove());

        // Step navigation
        modal.querySelector('#nextToStep2').addEventListener('click', () => {
            const selectedTraining = modal.querySelector('input[name="selectedTraining"]:checked');
            if (!selectedTraining) {
                alert('Bitte wählen Sie eine Schulung aus.');
                return;
            }
            this.showWizardStep(modal, 2);
        });

        modal.querySelector('#backToStep1').addEventListener('click', () => {
            this.showWizardStep(modal, 1);
        });

        modal.querySelector('#nextToStep3').addEventListener('click', () => {
            const selectedUsers = modal.querySelectorAll('.wizard-user-checkbox:checked');
            if (selectedUsers.length === 0) {
                alert('Bitte wählen Sie mindestens einen Benutzer aus.');
                return;
            }
            this.showWizardStep(modal, 3);
        });

        modal.querySelector('#backToStep2').addEventListener('click', () => {
            this.showWizardStep(modal, 2);
        });

        modal.querySelector('#completeAssignment').addEventListener('click', () => {
            this.completeWizardAssignment(modal);
        });

        // Filter listeners
        const deptSelect = modal.querySelector('#wizardDepartmentSelect');
        const roleSelect = modal.querySelector('#wizardRoleSelect');
        [deptSelect, roleSelect].forEach(select => {
            select.addEventListener('change', () => {
                this.updateWizardUserList(modal);
            });
        });
    }

    showWizardStep(modal, stepNumber) {
        modal.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
        modal.querySelector(`#step${stepNumber}`).classList.add('active');
    }

    updateWizardUserList(modal) {
        const deptFilter = modal.querySelector('#wizardDepartmentSelect').value;
        const roleFilter = modal.querySelector('#wizardRoleSelect').value;
        const userList = modal.querySelector('#wizardUserList');
        userList.innerHTML = this.renderWizardUserList(deptFilter, roleFilter);
    }

    completeWizardAssignment(modal) {
        const selectedTraining = modal.querySelector('input[name="selectedTraining"]:checked').value;
        const selectedUsers = Array.from(modal.querySelectorAll('.wizard-user-checkbox:checked')).map(cb => cb.value);
        const deadline = modal.querySelector('#wizardDeadline').value;
        const priority = modal.querySelector('#wizardPriority').value;
        const notes = modal.querySelector('#wizardNotes').value;

        const currentUser = this.getCurrentUser();
        const assignmentDate = new Date().toISOString();

        selectedUsers.forEach(userId => {
            const existingAssignment = this.trainingAssignments.find(a => 
                a.trainingId === selectedTraining && a.userId === userId
            );

            if (!existingAssignment) {
                const newAssignment = {
                    id: `assignment-${Date.now()}-${userId}`,
                    trainingId: selectedTraining,
                    userId: userId,
                    assignedBy: currentUser.id,
                    assignedAt: assignmentDate,
                    deadline: deadline || null,
                    priority: priority,
                    notes: notes,
                    status: 'assigned',
                    progress: 0
                };
                this.trainingAssignments.push(newAssignment);
            }
        });

        this.saveTrainingAssignmentsToStorage();
        this.updateTrainingStatistics();

        alert(`Schulung wurde an ${selectedUsers.length} Benutzer zugewiesen.`);
        modal.remove();
    }

    openCertificateUploadModal() {
        const modal = this.createCertificateUploadModal();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createCertificateUploadModal() {
        const modal = document.createElement('div');
        modal.className = 'modal certificate-upload-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-upload"></i> Zertifikat hochladen</h2>
                    <span class="close certificate-upload-close">&times;</span>
                </div>
                <div class="modal-body">
                    <form class="certificate-form" id="certificateUploadForm">
                        <div class="form-group">
                            <label for="certificateTitle">Zertifikatstitel *</label>
                            <input type="text" id="certificateTitle" required placeholder="z.B. Arbeitssicherheit Grundausbildung">
                        </div>
                        <div class="form-group">
                            <label for="certificateHolder">Inhaber *</label>
                            <select id="certificateHolder" required>
                                <option value="">Bitte wählen...</option>
                                ${this.users.map(user => `
                                    <option value="${user.id}" ${user.id === this.getCurrentUser().id ? 'selected' : ''}>
                                        ${user.displayName || user.name || user.id}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="certificateIssuer">Aussteller *</label>
                            <input type="text" id="certificateIssuer" required placeholder="z.B. TÜV Nord, IHK, etc.">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="certificateIssueDate">Ausstellungsdatum *</label>
                                <input type="date" id="certificateIssueDate" required>
                            </div>
                            <div class="form-group">
                                <label for="certificateExpiryDate">Ablaufdatum</label>
                                <input type="date" id="certificateExpiryDate">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="certificateFile">Zertifikatsdatei</label>
                            <input type="file" id="certificateFile" accept=".pdf,.jpg,.jpeg,.png">
                            <small>Unterstützte Formate: PDF, JPG, PNG (max. 5MB)</small>
                        </div>
                        <div class="form-group">
                            <label for="certificateNotes">Notizen</label>
                            <textarea id="certificateNotes" placeholder="Zusätzliche Informationen zum Zertifikat..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> Zertifikat speichern
                            </button>
                            <button type="button" class="btn-secondary" id="cancelCertificateUpload">
                                <i class="fas fa-times"></i> Abbrechen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.certificate-upload-close');
        const cancelBtn = modal.querySelector('#cancelCertificateUpload');
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        const form = modal.querySelector('#certificateUploadForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCertificate(modal);
        });

        return modal;
    }

    saveCertificate(modal) {
        const title = modal.querySelector('#certificateTitle').value;
        const holderId = modal.querySelector('#certificateHolder').value;
        const issuer = modal.querySelector('#certificateIssuer').value;
        const issueDate = modal.querySelector('#certificateIssueDate').value;
        const expiryDate = modal.querySelector('#certificateExpiryDate').value;
        const fileInput = modal.querySelector('#certificateFile');
        const notes = modal.querySelector('#certificateNotes').value;

        if (!title || !holderId || !issuer || !issueDate) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        const currentUser = this.getCurrentUser();
        const holderUser = this.users.find(u => u.id === holderId);

        const newCertificate = {
            id: `certificate-${Date.now()}`,
            title: title,
            holderId: holderId,
            holderName: holderUser ? (holderUser.displayName || holderUser.name || holderUser.id) : 'Unbekannt',
            issuer: issuer,
            issueDate: issueDate,
            expiryDate: expiryDate || null,
            notes: notes,
            uploadedBy: currentUser.id,
            uploadedAt: new Date().toISOString(),
            fileName: fileInput.files.length > 0 ? fileInput.files[0].name : null,
            fileSize: fileInput.files.length > 0 ? fileInput.files[0].size : null
        };

        // Handle file upload (in a real app, this would upload to a server)
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                newCertificate.fileData = e.target.result;
                this.certificates.push(newCertificate);
                this.saveCertificatesToStorage();
                alert('Zertifikat wurde erfolgreich hochgeladen!');
                modal.remove();
            };
            reader.readAsDataURL(file);
        } else {
            this.certificates.push(newCertificate);
            this.saveCertificatesToStorage();
            alert('Zertifikat wurde erfolgreich gespeichert!');
            modal.remove();
        }
    }

    viewTrainingProgress(trainingId) {
        const training = this.trainings.find(t => t.id === trainingId);
        if (!training) {
            alert('Schulung nicht gefunden!');
            return;
        }

        const assignments = this.trainingAssignments.filter(a => a.trainingId === trainingId);
        const modal = this.createProgressModal(training, assignments);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createProgressModal(training, assignments) {
        const totalAssignments = assignments.length;
        const completedAssignments = assignments.filter(a => a.status === 'completed').length;
        const inProgressAssignments = assignments.filter(a => a.status === 'in-progress').length;
        const overdueAssignments = assignments.filter(a => a.status === 'overdue').length;
        const completionRate = totalAssignments > 0 ? ((completedAssignments / totalAssignments) * 100).toFixed(1) : 0;

        const modal = document.createElement('div');
        modal.className = 'modal progress-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-line"></i> Fortschritt: ${training.title}</h2>
                    <span class="close progress-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="progress-overview">
                        <div class="progress-stats">
                            <div class="stat-item">
                                <h3>${totalAssignments}</h3>
                                <p>Gesamt Zuweisungen</p>
                            </div>
                            <div class="stat-item">
                                <h3>${completedAssignments}</h3>
                                <p>Abgeschlossen</p>
                            </div>
                            <div class="stat-item">
                                <h3>${inProgressAssignments}</h3>
                                <p>In Bearbeitung</p>
                            </div>
                            <div class="stat-item">
                                <h3>${overdueAssignments}</h3>
                                <p>Überfällig</p>
                            </div>
                        </div>
                        <div class="progress-chart">
                            <h4>Abschlussrate: ${completionRate}%</h4>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${completionRate}%"></div>
                            </div>
                        </div>
                        <div class="assignment-details">
                            <h4>Detaillierte Übersicht</h4>
                            <div class="assignment-list">
                                ${assignments.map(assignment => {
                                    const user = this.users.find(u => u.id === assignment.userId);
                                    const statusClass = assignment.status.replace('-', '_');
                                    return `
                                        <div class="assignment-detail-item ${statusClass}">
                                            <div class="user-info">
                                                <strong>${user ? (user.displayName || user.name || user.id) : 'Unbekannter Benutzer'}</strong>
                                                <small>${user ? (this.roleDefinitions[user.role]?.name || user.role) : ''}</small>
                                            </div>
                                            <div class="assignment-progress">
                                                <span class="status-badge ${assignment.status}">
                                                    ${this.getAssignmentStatusText(assignment.status)}
                                                </span>
                                                <div class="progress-bar-small">
                                                    <div class="progress-fill-small" style="width: ${assignment.progress || 0}%"></div>
                                                </div>
                                                <span class="progress-percent">${assignment.progress || 0}%</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const closeBtn = modal.querySelector('.progress-close');
        closeBtn.addEventListener('click', () => modal.remove());

        return modal;
    }

    // ========================================
    // TRAINING CREATION FUNCTIONS
    // ========================================

    openNewTrainingModal() {
        const modal = this.createNewTrainingModal();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createNewTrainingModal() {
        const modal = document.createElement('div');
        modal.className = 'modal new-training-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-plus"></i> Neue Schulung erstellen</h2>
                    <span class="close new-training-close">&times;</span>
                </div>
                <div class="modal-body">
                    <form class="training-form" id="newTrainingForm">
                        <div class="form-sections">
                            <div class="form-section">
                                <h3>Grundinformationen</h3>
                                <div class="form-grid">
                                    <div class="form-group full-width">
                                        <label for="trainingTitle">Titel *</label>
                                        <input type="text" id="trainingTitle" required placeholder="z.B. Arbeitssicherheit Grundlagen">
                                    </div>
                                    <div class="form-group full-width">
                                        <label for="trainingDescription">Beschreibung *</label>
                                        <textarea id="trainingDescription" required placeholder="Detaillierte Beschreibung der Schulung..."></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="trainingCategory">Kategorie *</label>
                                        <select id="trainingCategory" required>
                                            <option value="">Bitte wählen...</option>
                                            <option value="safety">Arbeitssicherheit</option>
                                            <option value="quality">Qualitätsmanagement</option>
                                            <option value="environment">Umweltschutz</option>
                                            <option value="health">Gesundheitsschutz</option>
                                            <option value="data-protection">Datenschutz</option>
                                            <option value="compliance">Compliance</option>
                                            <option value="technical">Technische Schulung</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="trainingType">Typ *</label>
                                        <select id="trainingType" required>
                                            <option value="mandatory">Pflichtschulung</option>
                                            <option value="optional">Optionale Schulung</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="trainingDuration">Dauer (Minuten) *</label>
                                        <input type="number" id="trainingDuration" required min="15" placeholder="60">
                                    </div>
                                    <div class="form-group">
                                        <label for="trainingValidity">Gültigkeit (Monate)</label>
                                        <input type="number" id="trainingValidity" min="1" max="36" placeholder="12">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="trainingRecurring">
                                        Wiederkehrende Schulung
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h3>Zielgruppe</h3>
                                <div class="target-selection">
                                    <div class="form-group">
                                        <label>Zielrollen:</label>
                                        <div class="checkbox-grid">
                                            ${Object.entries(this.roleDefinitions).map(([key, role]) => `
                                                <label class="checkbox-item">
                                                    <input type="checkbox" name="targetRoles" value="${key}">
                                                    ${role.name}
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Abteilungen (optional):</label>
                                        <div class="checkbox-grid">
                                            ${this.departments.map(dept => `
                                                <label class="checkbox-item">
                                                    <input type="checkbox" name="targetDepartments" value="${dept.id}">
                                                    ${dept.name}
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h3>Abschlusskriterien</h3>
                                <div class="completion-criteria">
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="requiresTest">
                                            Test erforderlich
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label for="passingScore">Mindestpunktzahl (%):</label>
                                        <input type="number" id="passingScore" min="0" max="100" value="80">
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="requiresSignature" checked>
                                            Unterschrift erforderlich
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> Schulung erstellen
                            </button>
                            <button type="button" class="btn-secondary" id="cancelNewTraining">
                                <i class="fas fa-times"></i> Abbrechen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.new-training-close');
        const cancelBtn = modal.querySelector('#cancelNewTraining');
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        const form = modal.querySelector('#newTrainingForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewTraining(modal);
        });

        return modal;
    }

    createNewTraining(modal) {
        const formData = new FormData(modal.querySelector('#newTrainingForm'));
        const currentUser = this.getCurrentUser();
        
        // Get form values
        const title = modal.querySelector('#trainingTitle').value;
        const description = modal.querySelector('#trainingDescription').value;
        const category = modal.querySelector('#trainingCategory').value;
        const type = modal.querySelector('#trainingType').value;
        const duration = parseInt(modal.querySelector('#trainingDuration').value);
        const validity = parseInt(modal.querySelector('#trainingValidity').value) || 12;
        const isRecurring = modal.querySelector('#trainingRecurring').checked;
        const requiresTest = modal.querySelector('#requiresTest').checked;
        const passingScore = parseInt(modal.querySelector('#passingScore').value) || 80;
        const requiresSignature = modal.querySelector('#requiresSignature').checked;
        
        // Get selected roles and departments
        const targetRoles = Array.from(modal.querySelectorAll('input[name="targetRoles"]:checked')).map(cb => cb.value);
        const targetDepartments = Array.from(modal.querySelectorAll('input[name="targetDepartments"]:checked')).map(cb => cb.value);
        
        // Validation
        if (!title || !description || !category || !type || !duration || targetRoles.length === 0) {
            alert('Bitte füllen Sie alle Pflichtfelder aus und wählen Sie mindestens eine Zielrolle.');
            return;
        }
        
        // Create new training
        const newTraining = {
            id: `training-${Date.now()}`,
            title: title,
            description: description,
            category: category,
            type: type,
            duration: duration,
            validityPeriod: validity,
            isRecurring: isRecurring,
            content: {
                materials: [],
                videos: [],
                documents: [],
                testQuestions: []
            },
            targetRoles: targetRoles,
            targetDepartments: targetDepartments,
            createdAt: new Date().toISOString(),
            createdBy: currentUser.id,
            isActive: true,
            completionCriteria: {
                requiresTest: requiresTest,
                passingScore: passingScore,
                requiresSignature: requiresSignature
            }
        };
        
        this.trainings.push(newTraining);
        this.saveTrainingsToStorage();
        this.updateTrainingStatistics();
        this.renderTrainingOverview();
        
        alert('Neue Schulung wurde erfolgreich erstellt!');
        modal.remove();
    }

    // ========================================
    // TRAINING REPORTS AND CALENDAR
    // ========================================

    openTrainingReportsModal() {
        const modal = this.createTrainingReportsModal();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createTrainingReportsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal training-reports-modal';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-bar"></i> Schulungsberichte</h2>
                    <span class="close reports-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="reports-dashboard">
                        <div class="report-tabs">
                            <button class="report-tab-btn active" data-report="overview">Übersicht</button>
                            <button class="report-tab-btn" data-report="completion">Abschlussraten</button>
                            <button class="report-tab-btn" data-report="compliance">Compliance</button>
                            <button class="report-tab-btn" data-report="individual">Individuelle Berichte</button>
                        </div>
                        <div class="report-content">
                            <div id="report-overview" class="report-panel active">
                                ${this.generateOverviewReport()}
                            </div>
                            <div id="report-completion" class="report-panel">
                                ${this.generateCompletionReport()}
                            </div>
                            <div id="report-compliance" class="report-panel">
                                ${this.generateComplianceReport()}
                            </div>
                            <div id="report-individual" class="report-panel">
                                ${this.generateIndividualReport()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.reports-close');
        closeBtn.addEventListener('click', () => modal.remove());

        // Tab switching
        modal.querySelectorAll('.report-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const reportType = btn.getAttribute('data-report');
                this.switchReportTab(modal, reportType);
            });
        });

        return modal;
    }

    switchReportTab(modal, reportType) {
        // Update active tab
        modal.querySelectorAll('.report-tab-btn').forEach(btn => btn.classList.remove('active'));
        modal.querySelector(`[data-report="${reportType}"]`).classList.add('active');

        // Update active panel
        modal.querySelectorAll('.report-panel').forEach(panel => panel.classList.remove('active'));
        modal.querySelector(`#report-${reportType}`).classList.add('active');
    }

    generateOverviewReport() {
        const totalTrainings = this.trainings.length;
        const totalAssignments = this.trainingAssignments.length;
        const completedAssignments = this.trainingAssignments.filter(a => a.status === 'completed').length;
        const overdueAssignments = this.trainingAssignments.filter(a => a.status === 'overdue').length;
        const completionRate = totalAssignments > 0 ? ((completedAssignments / totalAssignments) * 100).toFixed(1) : 0;

        return `
            <div class="overview-stats">
                <div class="stat-grid">
                    <div class="stat-item">
                        <h3>${totalTrainings}</h3>
                        <p>Verfügbare Schulungen</p>
                    </div>
                    <div class="stat-item">
                        <h3>${totalAssignments}</h3>
                        <p>Gesamt Zuweisungen</p>
                    </div>
                    <div class="stat-item">
                        <h3>${completedAssignments}</h3>
                        <p>Abgeschlossen</p>
                    </div>
                    <div class="stat-item">
                        <h3>${overdueAssignments}</h3>
                        <p>Überfällig</p>
                    </div>
                </div>
                <div class="completion-chart">
                    <h4>Abschlussrate: ${completionRate}%</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionRate}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    generateCompletionReport() {
        const categoryStats = {};
        this.trainings.forEach(training => {
            if (!categoryStats[training.category]) {
                categoryStats[training.category] = { total: 0, completed: 0 };
            }
            categoryStats[training.category].total++;
            
            const completedCount = this.trainingAssignments.filter(a => 
                a.trainingId === training.id && a.status === 'completed'
            ).length;
            categoryStats[training.category].completed += completedCount;
        });

        return `
            <div class="completion-stats">
                <h4>Abschlussraten nach Kategorie</h4>
                <div class="category-stats">
                    ${Object.entries(categoryStats).map(([category, stats]) => {
                        const rate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;
                        return `
                            <div class="category-item">
                                <div class="category-info">
                                    <strong>${this.getTrainingCategoryDisplayName(category)}</strong>
                                    <span>${stats.completed}/${stats.total} (${rate}%)</span>
                                </div>
                                <div class="category-bar">
                                    <div class="category-fill" style="width: ${rate}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    generateComplianceReport() {
        const mandatoryTrainings = this.trainings.filter(t => t.type === 'mandatory');
        const complianceData = mandatoryTrainings.map(training => {
            const assignments = this.trainingAssignments.filter(a => a.trainingId === training.id);
            const completed = assignments.filter(a => a.status === 'completed').length;
            const total = assignments.length;
            const compliance = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
            
            return {
                training: training,
                completed: completed,
                total: total,
                compliance: compliance
            };
        });

        return `
            <div class="compliance-report">
                <h4>Compliance-Status (Pflichtschulungen)</h4>
                <div class="compliance-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Schulung</th>
                                <th>Abgeschlossen</th>
                                <th>Gesamt</th>
                                <th>Compliance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${complianceData.map(data => `
                                <tr>
                                    <td>${data.training.title}</td>
                                    <td>${data.completed}</td>
                                    <td>${data.total}</td>
                                    <td>${data.compliance}%</td>
                                    <td>
                                        <span class="compliance-badge ${data.compliance >= 80 ? 'good' : data.compliance >= 60 ? 'warning' : 'critical'}">
                                            ${data.compliance >= 80 ? 'Gut' : data.compliance >= 60 ? 'Warnung' : 'Kritisch'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    generateIndividualReport() {
        return `
            <div class="individual-report">
                <div class="report-filters">
                    <select id="individualReportUser">
                        <option value="">Benutzer wählen...</option>
                        ${this.users.map(user => `
                            <option value="${user.id}">${user.displayName || user.name || user.id}</option>
                        `).join('')}
                    </select>
                    <button class="btn-primary" id="generateIndividualReport">
                        <i class="fas fa-chart-line"></i> Bericht generieren
                    </button>
                </div>
                <div id="individualReportContent">
                    <p>Bitte wählen Sie einen Benutzer aus, um einen individuellen Bericht zu generieren.</p>
                </div>
            </div>
        `;
    }

    openTrainingCalendarModal() {
        const modal = this.createTrainingCalendarModal();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createTrainingCalendarModal() {
        const modal = document.createElement('div');
        modal.className = 'modal training-calendar-modal';
        
        // Initialize calendar state
        this.calendarDate = new Date();
        
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-calendar-alt"></i> Schulungskalender</h2>
                    <span class="close calendar-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="calendar-container">
                        <div class="calendar-controls">
                            <button id="calendarPrevMonth" class="btn-secondary">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <h3 id="calendarCurrentMonth">${this.calendarDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</h3>
                            <button id="calendarNextMonth" class="btn-secondary">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <div class="calendar-view" id="calendarView">
                            ${this.generateCalendarView(this.calendarDate)}
                        </div>
                        <div class="calendar-legend">
                            <div class="legend-item">
                                <span class="legend-color deadline"></span>
                                <span>Frist</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color completed"></span>
                                <span>Abgeschlossen</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color overdue"></span>
                                <span>Überfällig</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.calendar-close');
        closeBtn.addEventListener('click', () => modal.remove());

        // Calendar navigation
        const prevBtn = modal.querySelector('#calendarPrevMonth');
        const nextBtn = modal.querySelector('#calendarNextMonth');
        
        prevBtn.addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
            this.updateCalendarView(modal);
        });
        
        nextBtn.addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
            this.updateCalendarView(modal);
        });

        return modal;
    }

    updateCalendarView(modal) {
        const monthHeader = modal.querySelector('#calendarCurrentMonth');
        const calendarView = modal.querySelector('#calendarView');
        
        monthHeader.textContent = this.calendarDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
        calendarView.innerHTML = this.generateCalendarView(this.calendarDate);
    }

    generateCalendarView(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        let calendarHTML = `
            <div class="calendar-grid">
                <div class="calendar-header">
                    <div class="day-header">Mo</div>
                    <div class="day-header">Di</div>
                    <div class="day-header">Mi</div>
                    <div class="day-header">Do</div>
                    <div class="day-header">Fr</div>
                    <div class="day-header">Sa</div>
                    <div class="day-header">So</div>
                </div>
                <div class="calendar-body">
        `;
        
        // Add empty cells for days before month starts
        const mondayStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
        for (let i = 0; i < mondayStart; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dateString = currentDate.toISOString().split('T')[0];
            const dayEvents = this.getTrainingEventsForDate(dateString);
            
            calendarHTML += `
                <div class="calendar-day" data-date="${dateString}">
                    <div class="day-number">${day}</div>
                    <div class="day-events">
                        ${dayEvents.map(event => `
                            <div class="event ${event.type}" title="${event.title}">
                                ${event.title.substring(0, 20)}${event.title.length > 20 ? '...' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        calendarHTML += '</div></div>';
        return calendarHTML;
    }

    getTrainingEventsForDate(dateString) {
        const events = [];
        
        this.trainingAssignments.forEach(assignment => {
            if (assignment.deadline && assignment.deadline === dateString) {
                const training = this.trainings.find(t => t.id === assignment.trainingId);
                if (training) {
                    events.push({
                        title: training.title,
                        type: assignment.status === 'completed' ? 'completed' : 
                              assignment.status === 'overdue' ? 'overdue' : 'deadline'
                    });
                }
            }
        });
        
        return events;
    }

    getAssignmentStatusText(status) {
        const statusTexts = {
            'assigned': 'Zugewiesen',
            'in-progress': 'In Bearbeitung',
            'completed': 'Abgeschlossen',
            'overdue': 'Überfällig'
        };
        return statusTexts[status] || status;
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
            
            // Permissions tab - checkbox is checked when access is denied
            document.getElementById('newUserGefahrstoffeAccess').checked = user.permissions?.gefahrstoffe === false;
            
            document.getElementById('editUserId').value = user.id;
        } else {
            // Add mode
            titleElement.textContent = 'Neuen Nutzer hinzufügen';
            document.getElementById('userForm').reset();
            document.getElementById('editUserId').value = '';
            // Reset permissions
            document.getElementById('newUserGefahrstoffeAccess').checked = false;
        }
        
        modal.style.display = 'block';
    }

    // Helper function to create complete profile structure for any user
    createCompleteUserProfile(userData) {
        return {
            ...userData,
            // Ensure all profile fields exist
            mobile: userData.mobile || '',
            position: userData.position || '',
            startDate: userData.startDate || '',
            birthdate: userData.birthdate || '',
            address: userData.address || '',
            emergencyContact: userData.emergencyContact || '',
            notes: userData.notes || '',
            qualifications: userData.qualifications || [],
            profileVisibility: userData.profileVisibility || {
                name: true,
                department: true,
                position: true,
                phone: false,
                email: false,
                responsibilities: true,
                qualifications: true
            }
        };
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
            notes: document.getElementById('newUserNotes').value,
            // Permissions tab fields - checked means access is denied
            permissions: {
                gefahrstoffe: document.getElementById('newUserGefahrstoffeAccess').checked ? false : undefined
            }
        };
        
        if (userId) {
            // Update existing user
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                this.users[userIndex] = { ...this.users[userIndex], ...userData };
                // Clean up permissions object if no permissions are set
                if (this.users[userIndex].permissions && 
                    Object.values(this.users[userIndex].permissions).every(val => val === undefined)) {
                    delete this.users[userIndex].permissions;
                }
            }
        } else {
            // Create new user with complete profile
            const newUser = this.createCompleteUserProfile({
                id: Date.now().toString(),
                ...userData,
                isActive: true,
                canBeDeleted: true,
                createdAt: new Date().toISOString()
            });
            // Clean up permissions object if no permissions are set
            if (newUser.permissions && 
                Object.values(newUser.permissions).every(val => val === undefined)) {
                delete newUser.permissions;
            }
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
                mobile: '+49 171 1234567',
                department: 'administration',
                position: 'System Administrator',
                role: 'root-admin',
                isActive: true,
                canBeDeleted: false,
                startDate: '2020-01-01',
                address: 'Musterstraße 1\n12345 Musterstadt',
                emergencyContact: 'Max Admin - +49 171 9876543',
                notes: 'System Administrator mit vollständigen Zugriffsrechten',
                qualifications: [
                    {
                        title: 'IT-Systemadministration',
                        institution: 'TechCert',
                        date: '2020-01-15',
                        expiryDate: '2025-01-15',
                        description: 'Zertifizierung für Systemadministration',
                        addedAt: new Date().toISOString()
                    }
                ],
                profileVisibility: {
                    name: true,
                    department: true,
                    position: true,
                    phone: false,
                    email: false,
                    responsibilities: true,
                    qualifications: true
                }
            },
            'admin': {
                id: 'admin-default',
                displayName: 'Administrator',
                email: 'admin@hoffmann-voss.de',
                phone: '+49 2162 12345-001',
                mobile: '+49 171 1111111',
                department: 'administration',
                position: 'Administrator',
                role: 'admin',
                isActive: true,
                canBeDeleted: true,
                startDate: '2021-01-01',
                address: 'Verwaltungsstraße 1\n12345 Adminstadt',
                emergencyContact: 'Admin Notfall - +49 171 9999999',
                notes: 'Administrator mit erweiterten Rechten',
                qualifications: [],
                profileVisibility: {
                    name: true,
                    department: true,
                    position: true,
                    phone: false,
                    email: false,
                    responsibilities: true,
                    qualifications: true
                }
            },
            'geschaeftsfuehrung': {
                id: 'gf-default',
                displayName: 'Dr. Michael Hoffmann',
                email: 'm.hoffmann@hoffmann-voss.de',
                phone: '+49 2162 12345-100',
                mobile: '+49 171 2222222',
                department: 'geschaeftsfuehrung',
                position: 'Geschäftsführer',
                role: 'geschaeftsfuehrung',
                isActive: true,
                canBeDeleted: true,
                startDate: '2010-01-01',
                address: 'Chefetage 1\n12345 Führungsstadt',
                emergencyContact: 'Eva Hoffmann - +49 171 8888888',
                notes: 'Geschäftsführer und Firmeninhaber',
                qualifications: [
                    {
                        title: 'MBA Business Administration',
                        institution: 'Business School Hamburg',
                        date: '2008-06-30',
                        description: 'Master of Business Administration',
                        addedAt: new Date().toISOString()
                    }
                ],
                profileVisibility: {
                    name: true,
                    department: true,
                    position: true,
                    phone: true,
                    email: true,
                    responsibilities: true,
                    qualifications: true
                }
            },
            'betriebsleiter': {
                id: 'bl-default',
                displayName: 'Peter Müller',
                email: 'p.mueller@hoffmann-voss.de',
                phone: '+49 2162 12345-150',
                mobile: '+49 171 2345678',
                department: 'betriebsleitung',
                position: 'Betriebsleiter',
                role: 'betriebsleiter',
                isActive: true,
                canBeDeleted: true,
                startDate: '2015-03-01',
                birthdate: '1975-08-15',
                address: 'Industriestraße 25\n45678 Industriestadt',
                emergencyContact: 'Anna Müller - +49 171 8765432',
                notes: 'Betriebsleiter mit 8 Jahren Erfahrung',
                qualifications: [
                    {
                        title: 'Betriebsleiter-Qualifikation',
                        institution: 'IHK Düsseldorf',
                        date: '2015-02-20',
                        expiryDate: '2025-02-20',
                        description: 'Qualifikation zum Betriebsleiter nach BetrSichV',
                        addedAt: new Date().toISOString()
                    },
                    {
                        title: 'Arbeitsschutz-Koordinator',
                        institution: 'TÜV Nord',
                        date: '2020-09-15',
                        expiryDate: '2023-09-15',
                        description: 'Koordinator für Arbeitsschutz auf Baustellen',
                        addedAt: new Date().toISOString()
                    }
                ],
                profileVisibility: {
                    name: true,
                    department: true,
                    position: true,
                    phone: true,
                    email: true,
                    responsibilities: true,
                    qualifications: true
                }
            },
            'qhse': {
                id: 'qhse-default',
                displayName: 'Sarah Weber',
                email: 's.weber@hoffmann-voss.de',
                phone: '+49 2162 12345-200',
                mobile: '+49 171 3333333',
                department: 'qhse',
                position: 'QHSE-Managerin',
                role: 'qhse',
                isActive: true,
                canBeDeleted: true,
                startDate: '2017-09-01',
                birthdate: '1982-04-20',
                address: 'Qualitätsstraße 15\n12345 QHSE-Stadt',
                emergencyContact: 'Max Weber - +49 171 7777777',
                notes: 'QHSE-Spezialistin mit umfangreicher Erfahrung',
                qualifications: [
                    {
                        title: 'QHSE-Manager (TÜV)',
                        institution: 'TÜV Rheinland',
                        date: '2017-08-15',
                        expiryDate: '2025-08-15',
                        description: 'Zertifizierter QHSE-Manager',
                        addedAt: new Date().toISOString()
                    },
                    {
                        title: 'Umweltmanagement ISO 14001',
                        institution: 'DQS',
                        date: '2019-03-20',
                        expiryDate: '2026-03-20',
                        description: 'Umweltmanagement-Auditor',
                        addedAt: new Date().toISOString()
                    }
                ],
                profileVisibility: {
                    name: true,
                    department: true,
                    position: true,
                    phone: true,
                    email: true,
                    responsibilities: true,
                    qualifications: true
                }
            },
            'abteilungsleiter': {
                id: 'al-default',
                displayName: 'Thomas Schmidt',
                email: 't.schmidt@hoffmann-voss.de',
                phone: '+49 2162 12345-300',
                mobile: '+49 171 4444444',
                department: 'produktion',
                position: 'Abteilungsleiter Produktion',
                role: 'abteilungsleiter',
                isActive: true,
                canBeDeleted: true,
                startDate: '2016-05-01',
                birthdate: '1978-11-30',
                address: 'Produktionsweg 8\n12345 Fertigungsort',
                emergencyContact: 'Lisa Schmidt - +49 171 6666666',
                notes: 'Abteilungsleiter Produktion mit Personalverantwortung',
                qualifications: [
                    {
                        title: 'Meister Industriemechanik',
                        institution: 'IHK Köln',
                        date: '2014-07-15',
                        description: 'Industriemeister Fachrichtung Metall',
                        addedAt: new Date().toISOString()
                    }
                ],
                profileVisibility: {
                    name: true,
                    department: true,
                    position: true,
                    phone: true,
                    email: false,
                    responsibilities: true,
                    qualifications: true
                }
            },
            'mitarbeiter': {
                id: 'ma-default',
                displayName: 'Maria Santos',
                email: 'm.santos@hoffmann-voss.de',
                phone: '+49 2162 12345-400',
                mobile: '+49 171 3456789',
                department: 'facility',
                position: 'Facility Management',
                role: 'mitarbeiter',
                isActive: true,
                canBeDeleted: true,
                startDate: '2018-06-15',
                birthdate: '1985-12-10',
                address: 'Hauptstraße 45\n67890 Beispielort',
                emergencyContact: 'Carlos Santos - +49 171 7654321',
                notes: 'Zuverlässige Mitarbeiterin im Facility Management',
                qualifications: [
                    {
                        title: 'Grundlehrgang Arbeitsschutz',
                        institution: 'TÜV Süd',
                        date: '2018-07-01',
                        expiryDate: '2024-07-01',
                        description: 'Grundlagen des Arbeitsschutzes für Mitarbeiter',
                        addedAt: new Date().toISOString()
                    }
                ],
                profileVisibility: {
                    name: true,
                    department: true,
                    position: true,
                    phone: false,
                    email: false,
                    responsibilities: false,
                    qualifications: true
                }
            },
            'techniker': {
                id: 'tech-default',
                displayName: 'Klaus Fischer',
                email: 'k.fischer@hoffmann-voss.de',
                phone: '+49 2162 12345-350',
                mobile: '+49 171 5555555',
                department: 'instandhaltung',
                position: 'Instandhaltungstechniker',
                role: 'techniker',
                isActive: true,
                canBeDeleted: true,
                startDate: '2019-02-01',
                birthdate: '1990-07-08',
                address: 'Technikstraße 12\n12345 Wartungsort',
                emergencyContact: 'Sandra Fischer - +49 171 5555444',
                notes: 'Spezialist für Maschinenwartung und Reparaturen',
                qualifications: [
                    {
                        title: 'Elektroniker für Betriebstechnik',
                        institution: 'IHK München',
                        date: '2016-01-30',
                        description: 'Ausbildung zum Elektroniker für Betriebstechnik',
                        addedAt: new Date().toISOString()
                    },
                    {
                        title: 'SPS-Programmierung Siemens',
                        institution: 'Siemens Academy',
                        date: '2020-11-15',
                        expiryDate: '2025-11-15',
                        description: 'Zertifizierung für SPS-Programmierung',
                        addedAt: new Date().toISOString()
                    }
                ],
                profileVisibility: {
                    name: true,
                    department: true,
                    position: true,
                    phone: false,
                    email: false,
                    responsibilities: true,
                    qualifications: true
                }
            }
        };

        const defaultUser = defaultUsers[role];
        if (defaultUser) {
            // Add creation timestamp
            defaultUser.createdAt = new Date().toISOString();
            
            // Ensure critical properties are set
            defaultUser.isActive = true;
            if (!defaultUser.displayName && defaultUser.name) {
                defaultUser.displayName = defaultUser.name;
            }
            
            console.log('Adding default user:', defaultUser.id, defaultUser.displayName);
            this.users.push(defaultUser);
            this.saveUsersToStorage();
            
            console.log('User added successfully. Total users now:', this.users.length);
            return defaultUser;
        } else {
            console.error('No default user template found for role:', role);
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
        if (!userSelect) {
            console.error('userSelect element not found');
            return;
        }
        
        if (!this.users || !Array.isArray(this.users)) {
            console.error('Users array not available, reinitializing...');
            this.initializeRootAdmin();
            return;
        }
        
        try {
            // Clear existing options
            userSelect.innerHTML = '';
            
            // Enhanced debugging
            console.log('Total users in system:', this.users.length);
            this.users.forEach((user, index) => {
                console.log(`User ${index}:`, {
                    id: user.id,
                    displayName: user.displayName,
                    isActive: user.isActive,
                    role: user.role
                });
            });
            
            // Add all users (less restrictive filter)
            const availableUsers = this.users.filter(user => {
                if (!user) return false;
                
                // Ensure required properties exist
                if (!user.id) {
                    console.warn('User missing ID:', user);
                    return false;
                }
                
                if (!user.displayName) {
                    console.warn('User missing displayName:', user.id);
                    // Try to use other name fields as fallback
                    user.displayName = user.name || `User ${user.id}`;
                }
                
                // Set isActive to true if missing
                if (user.isActive === undefined) {
                    console.warn('User missing isActive property, setting to true:', user.id);
                    user.isActive = true;
                }
                
                return user.isActive;
            });
            
            console.log('Available users for dropdown:', availableUsers.length);
            
            if (availableUsers.length === 0) {
                console.error('No valid users found, reinitializing default users...');
                this.initializeRootAdmin();
                // Try again after initialization
                setTimeout(() => this.populateUserDropdown(), 100);
                return;
            }
            
            // Sort users by display name
            availableUsers.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
            
            availableUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                const roleName = this.roleDefinitions[user.role]?.name || user.role;
                option.textContent = `${user.displayName} (${roleName})`;
                userSelect.appendChild(option);
                console.log('Added user to dropdown:', option.textContent);
            });
            
            // Set current selection (only if the user exists in the dropdown)
            const userExists = availableUsers.find(user => user.id === this.currentUserId);
            if (userExists) {
                userSelect.value = this.currentUserId;
                console.log('Current user found in dropdown:', this.currentUserId);
            } else {
                // Fallback to first available user or root-admin
                const fallbackUser = availableUsers.find(user => user.id === 'root-admin') || availableUsers[0];
                if (fallbackUser) {
                    this.currentUserId = fallbackUser.id;
                    userSelect.value = this.currentUserId;
                    console.log('Set fallback user:', fallbackUser.id);
                    // Update UI for new user
                    this.updateUIForUser();
                }
            }
            
            // Save any fixes we made
            this.saveUsersToStorage();
            
        } catch (error) {
            console.error('Error populating user dropdown:', error);
            // Emergency fallback - create a basic root admin if nothing else works
            if (this.users.length === 0) {
                this.users.push({
                    id: 'root-admin',
                    displayName: 'System Administrator',
                    role: 'root-admin',
                    isActive: true,
                    email: 'admin@hoffmann-voss.de',
                    canBeDeleted: false
                });
                this.saveUsersToStorage();
                this.populateUserDropdown(); // Try again
            }
        }
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
        
        // Module Management Settings
        this.setupModuleManagement();
        
        // User Module Permissions Management
        try {
            this.setupUserModulePermissions();
        } catch (error) {
            console.error('Error setting up user module permissions:', error);
        }
    }
    
    setupModuleManagement() {
        const enableGefahrstoffeModule = document.getElementById('enableGefahrstoffeModule');
        const saveModuleSettingsBtn = document.getElementById('saveModuleSettings');
        const resetModuleSettingsBtn = document.getElementById('resetModuleSettings');
        
        if (enableGefahrstoffeModule) {
            // Load current module settings
            const moduleSettings = this.loadModuleSettingsFromStorage();
            enableGefahrstoffeModule.checked = moduleSettings.gefahrstoffe;
            
            // Update module status and user statistics
            this.updateModuleDisplay();
            
            // Event listener for module toggle
            enableGefahrstoffeModule.addEventListener('change', () => {
                const currentUser = this.getCurrentUser();
                if (!currentUser || currentUser.role !== 'root-admin') {
                    alert('Nur der System Administrator kann Module verwalten.');
                    enableGefahrstoffeModule.checked = !enableGefahrstoffeModule.checked; // Revert change
                    return;
                }
                
                this.saveModuleSettings({
                    gefahrstoffe: enableGefahrstoffeModule.checked
                });
                
                // Update navigation visibility
                this.updateMenuVisibility();
                
                // Update module display
                this.updateModuleDisplay();
                
                const status = enableGefahrstoffeModule.checked ? 'aktiviert' : 'deaktiviert';
                alert(`Gefahrstoffverzeichnis wurde ${status}!`);
            });
        }
        
        // Save module settings button
        if (saveModuleSettingsBtn) {
            saveModuleSettingsBtn.addEventListener('click', () => {
                const currentUser = this.getCurrentUser();
                if (!currentUser || currentUser.role !== 'root-admin') {
                    alert('Nur der System Administrator kann Module verwalten.');
                    return;
                }
                
                alert('Module-Einstellungen wurden gespeichert!');
            });
        }
        
        // Reset module settings button
        if (resetModuleSettingsBtn) {
            resetModuleSettingsBtn.addEventListener('click', () => {
                const currentUser = this.getCurrentUser();
                if (!currentUser || currentUser.role !== 'root-admin') {
                    alert('Nur der System Administrator kann Module verwalten.');
                    return;
                }
                
                if (confirm('Möchten Sie alle Module-Einstellungen auf die Standardwerte zurücksetzen?')) {
                    // Reset to default settings
                    this.saveModuleSettings({ gefahrstoffe: true });
                    
                    // Update UI
                    if (enableGefahrstoffeModule) {
                        enableGefahrstoffeModule.checked = true;
                    }
                    this.updateMenuVisibility();
                    this.updateModuleDisplay();
                    
                    alert('Module-Einstellungen wurden zurückgesetzt!');
                }
            });
        }
    }
    
    loadModuleSettingsFromStorage() {
        const stored = localStorage.getItem('qhse_module_settings');
        return stored ? JSON.parse(stored) : { gefahrstoffe: true }; // Default enabled
    }
    
    saveModuleSettings(settings) {
        localStorage.setItem('qhse_module_settings', JSON.stringify(settings));
    }
    
    updateModuleDisplay() {
        const moduleSettings = this.loadModuleSettingsFromStorage();
        
        // Update Gefahrstoffe module status and user count
        const gefahrstoffeModuleStatus = document.getElementById('gefahrstoffeModuleStatus');
        const gefahrstoffeModuleUsers = document.getElementById('gefahrstoffeModuleUsers');
        
        if (gefahrstoffeModuleStatus) {
            gefahrstoffeModuleStatus.textContent = moduleSettings.gefahrstoffe ? 'Aktiv' : 'Inaktiv';
            gefahrstoffeModuleStatus.className = `module-status ${moduleSettings.gefahrstoffe ? 'active' : 'inactive'}`;
        }
        
        if (gefahrstoffeModuleUsers) {
            if (moduleSettings.gefahrstoffe) {
                const usersWithAccess = this.users.filter(user => 
                    this.userHasAccessToSection(user, 'gefahrstoffe', this.roleDefinitions[user.role]?.allowedSections || [])
                ).length;
                gefahrstoffeModuleUsers.textContent = `${usersWithAccess} Benutzer haben Zugriff`;
            } else {
                gefahrstoffeModuleUsers.textContent = 'Modul ist deaktiviert';
            }
        }
    }
    
    setupUserModulePermissions() {
        const permissionModuleFilter = document.getElementById('permissionModuleFilter');
        const permissionRoleFilter = document.getElementById('permissionRoleFilter');
        const permissionUserFilter = document.getElementById('permissionUserFilter');
        const selectAllUsersBtn = document.getElementById('selectAllUsersBtn');
        const deselectAllUsersBtn = document.getElementById('deselectAllUsersBtn');
        const saveUserPermissionsBtn = document.getElementById('saveUserPermissionsBtn');
        const resetUserPermissionsBtn = document.getElementById('resetUserPermissionsBtn');
        
        // Only setup if elements exist (they might not be present in all sections)
        if (!permissionModuleFilter || !permissionRoleFilter || !permissionUserFilter) {
            console.log('User module permission elements not found, skipping setup');
            return;
        }
        
        if (permissionModuleFilter && permissionRoleFilter && permissionUserFilter) {
            // Populate user dropdown
            this.populatePermissionUserDropdown();
            
            // Initial render with debug
            console.log('Initial render of user permissions list');
            this.renderUserPermissionsList();
            
            // Event listeners for filters
            permissionModuleFilter.addEventListener('change', () => {
                this.renderUserPermissionsList();
            });
            
            permissionRoleFilter.addEventListener('change', () => {
                this.renderUserPermissionsList();
            });
            
            permissionUserFilter.addEventListener('change', () => {
                this.renderUserPermissionsList();
            });
            
            // Bulk action event listeners
            if (selectAllUsersBtn) {
                selectAllUsersBtn.addEventListener('click', () => {
                    this.selectAllUserPermissions(true);
                });
            }
            
            if (deselectAllUsersBtn) {
                deselectAllUsersBtn.addEventListener('click', () => {
                    this.selectAllUserPermissions(false);
                });
            }
            
            
            // Save and reset event listeners
            if (saveUserPermissionsBtn) {
                saveUserPermissionsBtn.addEventListener('click', () => {
                    this.saveAllUserPermissions();
                });
            }
            
            if (resetUserPermissionsBtn) {
                resetUserPermissionsBtn.addEventListener('click', () => {
                    this.resetUserPermissions();
                });
            }
        }
    }
    
    populatePermissionUserDropdown() {
        const userSelect = document.getElementById('permissionUserFilter');
        if (!userSelect) {
            console.error('permissionUserFilter dropdown not found');
            return;
        }
        
        console.log('Total users in system:', this.users.length);
        console.log('All users:', this.users.map(u => `${u.displayName || u.name || 'Unknown'} (${u.role})`));
        
        // Clear existing options except the first one
        userSelect.innerHTML = '<option value="">Alle Benutzer anzeigen</option>';
        
        // Filter out admin users but include all others
        const nonAdminUsers = this.users.filter(user => {
            const isAdmin = user.role === 'admin' || user.role === 'root-admin';
            console.log(`User ${user.displayName || user.name}: isAdmin=${isAdmin}, include=${!isAdmin}`);
            return !isAdmin;
        });
        
        console.log(`Filtered to ${nonAdminUsers.length} non-admin users:`, nonAdminUsers.map(u => u.displayName || u.name));
        
        // Sort users by name
        nonAdminUsers.sort((a, b) => (a.name || a.displayName || 'Unknown').localeCompare(b.name || b.displayName || 'Unknown'));
        
        nonAdminUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            const userName = user.displayName || user.name || 'Unbekannter Benutzer';
            const roleName = this.getRoleDisplayName(user.role);
            option.textContent = `${userName} (${roleName})`;
            userSelect.appendChild(option);
            console.log(`Added user option: ${option.textContent}`);
        });
        
        console.log(`Populated user dropdown with ${nonAdminUsers.length} users`);
        console.log('Dropdown HTML:', userSelect.innerHTML);
    }
    
    renderUserPermissionsList() {
        const container = document.getElementById('userPermissionsList');
        const moduleFilter = document.getElementById('permissionModuleFilter')?.value || 'gefahrstoffe';
        const roleFilter = document.getElementById('permissionRoleFilter')?.value || '';
        const userFilter = document.getElementById('permissionUserFilter')?.value || '';
        
        if (!container) return;
        
        // Start with all users
        let filteredUsers = [...this.users];
        
        // Exclude admin users from permission management (they have full access)
        filteredUsers = filteredUsers.filter(user => user.role !== 'admin' && user.role !== 'root-admin');
        
        // Filter by specific user if selected
        if (userFilter) {
            filteredUsers = filteredUsers.filter(user => user.id === userFilter);
        }
        // Otherwise filter by role if specified
        else if (roleFilter) {
            filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
        }
        
        console.log(`Filtering users: userFilter='${userFilter}', roleFilter='${roleFilter}', found ${filteredUsers.length} users`);
        
        if (filteredUsers.length === 0) {
            container.innerHTML = `
                <div class="no-users-message">
                    <i class="fas fa-users"></i>
                    <p>Keine Benutzer gefunden für die ausgewählten Filter.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredUsers.map(user => {
            const hasPermission = this.getUserModulePermission(user, moduleFilter);
            const hasRoleBasedAccess = this.hasRoleBasedModuleAccess(user, moduleFilter);
            const statusBadge = this.getUserPermissionStatusBadge(user, moduleFilter, hasPermission, hasRoleBasedAccess);
            const initials = this.getUserInitials(user);
            
            return `
                <div class="user-permission-item" data-user-id="${user.id}">
                    <div class="user-permission-info">
                        <div class="user-permission-avatar">${initials}</div>
                        <div class="user-permission-details">
                            <div class="user-permission-name">${user.name}</div>
                            <div class="user-permission-role">
                                <i class="fas fa-user"></i>
                                ${this.getRoleDisplayName(user.role)}
                            </div>
                        </div>
                    </div>
                    <div class="user-permission-status">
                        ${statusBadge}
                    </div>
                    <div class="user-permission-toggle">
                        <input type="checkbox" 
                               class="permission-checkbox" 
                               data-user-id="${user.id}" 
                               data-module="${moduleFilter}"
                               ${hasPermission ? 'checked' : ''}>
                        <label>${hasPermission ? 'Zugriff verweigern' : 'Zugriff erlauben'}</label>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to checkboxes
        container.querySelectorAll('.permission-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const userId = e.target.dataset.userId;
                const module = e.target.dataset.module;
                const checked = e.target.checked;
                
                console.log(`Permission change: User ${userId}, Module ${module}, Checked: ${checked}`);
                
                this.updateUserModulePermission(userId, module, checked);
                
                // Don't re-render immediately to avoid event listener conflicts
                // Instead, update only the status badge for this specific user
                this.updateUserPermissionStatusInUI(userId, module);
                
                // Update module display to reflect overall changes
                this.updateModuleDisplay();
            });
        });
    }
    
    getUserModulePermission(user, module) {
        // Now returns true if user has explicit denial (checkbox should be checked to deny)
        return user.permissions && user.permissions[module] === false;
    }
    
    hasRoleBasedModuleAccess(user, module) {
        const roleDefinition = this.roleDefinitions[user.role];
        return roleDefinition && roleDefinition.allowedSections && roleDefinition.allowedSections.includes(module);
    }
    
    getUserPermissionStatusBadge(user, module, hasPermission, hasRoleBasedAccess) {
        if (!hasRoleBasedAccess) {
            return '<span class="permission-status-badge denied">Rolle nicht berechtigt</span>';
        }
        
        if (hasPermission) {
            return '<span class="permission-status-badge denied">Zugriff verweigert</span>';
        } else {
            return '<span class="permission-status-badge granted">Zugriff erlaubt</span>';
        }
    }
    
    getUserInitials(user) {
        return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    
    getRoleDisplayName(role) {
        const roleNames = {
            'geschaeftsfuehrung': 'Geschäftsführung',
            'betriebsleiter': 'Betriebsleiter',
            'abteilungsleiter': 'Abteilungsleiter',
            'qhse': 'QHSE',
            'mitarbeiter': 'Mitarbeiter',
            'techniker': 'Techniker',
            'admin': 'Administrator',
            'root-admin': 'System Administrator'
        };
        return roleNames[role] || role;
    }
    
    updateUserModulePermission(userId, module, isDenied) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            if (!user.permissions) {
                user.permissions = {};
            }
            // Store denial flag: false means access is denied, undefined means access is allowed (default)
            if (isDenied) {
                user.permissions[module] = false;
            } else {
                delete user.permissions[module];
                // Clean up empty permissions object
                if (Object.keys(user.permissions).length === 0) {
                    delete user.permissions;
                }
            }
            
            const userName = user.displayName || user.name || userId;
            console.log(`Updated permissions for user ${userName}:`, user.permissions);
            
            this.saveUsersToStorage();
            
            console.log('User permissions saved to localStorage');
            
            // Update menu visibility for all users in case current user was affected
            this.updateMenuVisibility();
            
            // Show feedback to user
            const status = hasPermission ? 'gewährt' : 'entzogen';
            alert(`Berechtigung für ${userName} wurde ${status} und gespeichert.`);
        } else {
            console.error(`User with ID ${userId} not found`);
        }
    }
    
    updateUserPermissionStatusInUI(userId, module) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        const userItem = document.querySelector(`[data-user-id="${userId}"]`);
        if (!userItem) return;
        
        const hasPermission = this.getUserModulePermission(user, module);
        const hasRoleBasedAccess = this.hasRoleBasedModuleAccess(user, module);
        const statusBadge = this.getUserPermissionStatusBadge(user, module, hasPermission, hasRoleBasedAccess);
        
        // Update status badge
        const statusContainer = userItem.querySelector('.user-permission-status');
        if (statusContainer) {
            statusContainer.innerHTML = statusBadge;
        }
        
        // Update checkbox label
        const label = userItem.querySelector('.user-permission-toggle label');
        if (label) {
            label.textContent = hasPermission ? 'Zugriff verweigern' : 'Zugriff erlauben';
        }
        
        console.log(`Updated UI for user ${user.name}: hasPermission=${hasPermission}`);
    }
    
    selectAllUserPermissions(select) {
        const checkboxes = document.querySelectorAll('.permission-checkbox');
        console.log(`Bulk operation: ${select ? 'Select' : 'Deselect'} all - found ${checkboxes.length} checkboxes`);
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = select;
            const userId = checkbox.dataset.userId;
            const module = checkbox.dataset.module;
            this.updateUserModulePermission(userId, module, select);
            this.updateUserPermissionStatusInUI(userId, module);
        });
        
        // Update module display to reflect changes
        this.updateModuleDisplay();
    }
    
    applyBulkUserPermissions() {
        const selectedCheckboxes = document.querySelectorAll('.permission-checkbox:checked');
        const unselectedCheckboxes = document.querySelectorAll('.permission-checkbox:not(:checked)');
        
        let changesCount = 0;
        
        console.log(`Applying bulk permissions: ${selectedCheckboxes.length} selected, ${unselectedCheckboxes.length} unselected`);
        
        selectedCheckboxes.forEach(checkbox => {
            const userId = checkbox.dataset.userId;
            const module = checkbox.dataset.module;
            const user = this.users.find(u => u.id === userId);
            if (user && (!user.permissions || user.permissions[module] !== false)) {
                this.updateUserModulePermission(userId, module, true); // true = deny access
                this.updateUserPermissionStatusInUI(userId, module);
                changesCount++;
            }
        });
        
        unselectedCheckboxes.forEach(checkbox => {
            const userId = checkbox.dataset.userId;
            const module = checkbox.dataset.module;
            const user = this.users.find(u => u.id === userId);
            if (user && user.permissions && user.permissions[module] === false) {
                this.updateUserModulePermission(userId, module, false); // false = allow access
                this.updateUserPermissionStatusInUI(userId, module);
                changesCount++;
            }
        });
        
        if (changesCount > 0) {
            alert(`${changesCount} Benutzerberechtigungen wurden aktualisiert.`);
            this.updateModuleDisplay();
        } else {
            alert('Keine Änderungen vorgenommen.');
        }
    }
    
    saveAllUserPermissions() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'root-admin') {
            alert('Nur der System Administrator kann Benutzerberechtigungen verwalten.');
            return;
        }
        
        this.saveUsersToStorage();
        alert('Alle Benutzerberechtigungen wurden gespeichert!');
    }
    
    resetUserPermissions() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'root-admin') {
            alert('Nur der System Administrator kann Benutzerberechtigungen verwalten.');
            return;
        }
        
        if (confirm('Möchten Sie alle benutzerdefinierten Modulberechtigungen zurücksetzen? Benutzer haben dann nur noch Zugriff basierend auf ihren Rollen.')) {
            this.users.forEach(user => {
                if (user.permissions) {
                    delete user.permissions.gefahrstoffe;
                    if (Object.keys(user.permissions).length === 0) {
                        delete user.permissions;
                    }
                }
            });
            
            this.saveUsersToStorage();
            this.renderUserPermissionsList();
            this.updateModuleDisplay();
            
            alert('Alle Modulberechtigungen wurden zurückgesetzt!');
        }
    }
    
    // Debug helper method
    debugUserPermissions() {
        console.log('=== USER PERMISSIONS DEBUG ===');
        const moduleSettings = this.loadModuleSettingsFromStorage();
        console.log('Module Settings:', moduleSettings);
        console.log('---');
        
        this.users.forEach(user => {
            console.log(`User: ${user.name} (${user.id})`);
            console.log(`Role: ${user.role}`);
            console.log(`Custom Permissions:`, user.permissions || 'None');
            console.log(`Gefahrstoffe Access (OLD):`, this.userHasAccessToSection(user, 'gefahrstoffe', this.roleDefinitions[user.role]?.allowedSections || []));
            console.log(`Gefahrstoffe Access (NEW):`, this.userHasGefahrstoffeAccess(user, moduleSettings));
            console.log('---');
        });
        console.log('=== END DEBUG ===');
    }
    
    // Test user permissions for current user
    testCurrentUserPermissions() {
        const currentUser = this.getCurrentUser();
        const moduleSettings = this.loadModuleSettingsFromStorage();
        
        console.log('=== CURRENT USER TEST ===');
        console.log(`Current User: ${currentUser.name} (${currentUser.role})`);
        console.log(`Module Settings:`, moduleSettings);
        console.log(`User Permissions:`, currentUser.permissions);
        console.log(`Has Gefahrstoffe Access:`, this.userHasGefahrstoffeAccess(currentUser, moduleSettings));
        
        // Test menu visibility
        const gefahrstoffeMenuItem = document.querySelector('[data-section="gefahrstoffe"]');
        console.log(`Gefahrstoffe Menu Visible:`, gefahrstoffeMenuItem && !gefahrstoffeMenuItem.classList.contains('hidden'));
        console.log('=== END TEST ===');
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

    // Safety Corner Management
    loadSafetyAnnouncementsFromStorage() {
        const stored = localStorage.getItem('qhse_safety_announcements');
        return stored ? JSON.parse(stored) : [];
    }

    saveSafetyAnnouncementsToStorage() {
        localStorage.setItem('qhse_safety_announcements', JSON.stringify(this.safetyAnnouncements));
    }

    loadSafetyPdfsFromStorage() {
        const stored = localStorage.getItem('qhse_safety_pdfs');
        const pdfs = stored ? JSON.parse(stored) : [];
        console.log('Loaded safety PDFs from storage:', pdfs.length, 'PDFs');
        return pdfs;
    }

    saveSafetyPdfsToStorage() {
        localStorage.setItem('qhse_safety_pdfs', JSON.stringify(this.safetyPdfs));
    }

    setupSafetyCorner() {
        console.log('Setting up Safety Corner...');
        this.setupSafetyAnnouncementManagement();
        this.setupSafetyPdfManagement();
        this.setupPdfViewer();
        
        // Initial render
        console.log('Initial safety corner render...');
        this.renderSafetyAnnouncements();
        this.renderSafetyPdfs();
        
        console.log('Safety Corner setup complete');
    }

    setupSafetyAnnouncementManagement() {
        // Settings page management
        const saveAnnouncementBtn = document.getElementById('saveSafetyAnnouncementBtn');
        const clearFormBtn = document.getElementById('clearAnnouncementFormBtn');
        const selectAllBtn = document.getElementById('selectAllUsersBtn');
        const deselectAllBtn = document.getElementById('deselectAllUsersBtn');

        if (saveAnnouncementBtn) {
            saveAnnouncementBtn.addEventListener('click', () => this.saveSafetyAnnouncement());
        }
        
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => this.clearAnnouncementForm());
        }

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAllUsers());
        }

        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => this.deselectAllUsers());
        }

        const debugBtn = document.getElementById('debugSafetySystemBtn');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => this.debugSafetySystem());
        }

        const testPdfBtn = document.getElementById('addTestPdfBtn');
        if (testPdfBtn) {
            testPdfBtn.addEventListener('click', () => this.addTestPdf());
        }

        // Ensure users are loaded before populating the grid
        setTimeout(() => {
            this.populateUserSelectionGrid();
            this.renderExistingAnnouncements();
        }, 200);
    }

    setupSafetyPdfManagement() {
        const uploadBtn = document.getElementById('uploadSafetyPdfBtn');
        const fileInput = document.getElementById('safetyPdfUpload');

        console.log('Setting up PDF management - Upload button:', !!uploadBtn, 'File input:', !!fileInput);

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                console.log('PDF upload button clicked');
                if (fileInput) {
                    fileInput.click();
                } else {
                    console.error('File input not found!');
                }
            });
        } else {
            console.warn('Upload button not found - this is normal for non-admin users');
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('File input changed');
                this.handleSafetyPdfUpload(e);
            });
        } else {
            console.warn('File input not found - this is normal for non-admin users');
        }
    }

    setupPdfViewer() {
        const modal = document.getElementById('pdfViewerModal');
        const closeBtn = document.getElementById('closePdfViewer');
        const downloadBtn = document.getElementById('pdfDownloadBtn');
        const printBtn = document.getElementById('pdfPrintBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePdfViewer());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closePdfViewer();
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadCurrentPdf());
        }

        if (printBtn) {
            printBtn.addEventListener('click', () => this.printCurrentPdf());
        }
    }

    populateUserSelectionGrid() {
        const container = document.getElementById('announcementUserSelection');
        if (!container) return;

        container.innerHTML = '';
        
        this.users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-checkbox-item';
            userDiv.innerHTML = `
                <label>
                    <input type="checkbox" name="selectedUsers" value="${user.id}" checked>
                    <span class="user-label">${user.displayName} (${user.role})</span>
                </label>
            `;
            container.appendChild(userDiv);
        });
    }

    selectAllUsers() {
        const checkboxes = document.querySelectorAll('#announcementUserSelection input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = true);
    }

    deselectAllUsers() {
        const checkboxes = document.querySelectorAll('#announcementUserSelection input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    }

    renderExistingAnnouncements() {
        const container = document.getElementById('existingAnnouncementsList');
        if (!container) return;

        const activeAnnouncements = this.safetyAnnouncements.filter(a => a.active);

        if (activeAnnouncements.length === 0) {
            container.innerHTML = '<p class="no-announcements">Keine aktiven Mitteilungen vorhanden.</p>';
            return;
        }

        container.innerHTML = activeAnnouncements.map(announcement => {
            const author = this.users.find(u => u.id === announcement.createdBy);
            const createdDate = new Date(announcement.createdAt).toLocaleDateString('de-DE');
            const previewText = announcement.text.length > 100 ? 
                announcement.text.substring(0, 100) + '...' : announcement.text;

            return `
                <div class="announcement-item" data-announcement-id="${announcement.id}">
                    <div class="announcement-header">
                        <div class="announcement-meta">
                            <span>Erstellt von: ${author ? author.displayName : 'Unbekannt'}</span> • 
                            <span>${createdDate}</span>
                        </div>
                        <div class="announcement-actions">
                            <button class="btn-secondary btn-sm" onclick="dashboard.editAnnouncement('${announcement.id}')">
                                <i class="fas fa-edit"></i> Bearbeiten
                            </button>
                            <button class="btn-danger btn-sm" onclick="dashboard.deleteAnnouncement('${announcement.id}')">
                                <i class="fas fa-trash"></i> Löschen
                            </button>
                        </div>
                    </div>
                    <div class="announcement-visibility">
                        <i class="fas fa-users"></i>
                        <span class="user-count-badge">${announcement.visibleToUsers.length} Mitarbeiter</span>
                    </div>
                    <div class="announcement-text-preview" id="preview-${announcement.id}">
                        ${announcement.text.replace(/\n/g, '<br>')}
                    </div>
                    ${announcement.text.length > 100 ? 
                        `<button class="expand-btn" onclick="dashboard.toggleAnnouncementPreview('${announcement.id}')">
                            Vollständig anzeigen
                        </button>` : ''
                    }
                </div>
            `;
        }).join('');
    }

    clearAnnouncementForm() {
        const textArea = document.getElementById('safetyAnnouncementText');
        if (textArea) textArea.value = '';
        
        // Reset all checkboxes to checked (default state)
        const checkboxes = document.querySelectorAll('#announcementUserSelection input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = true);
        
        // Reset editing state
        this.editingAnnouncementId = null;
        
        // Reset button text
        const saveBtn = document.getElementById('saveSafetyAnnouncementBtn');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Mitteilung hinzufügen';
        }
    }

    saveSafetyAnnouncement() {
        const textArea = document.getElementById('safetyAnnouncementText');
        const text = textArea ? textArea.value.trim() : '';
        
        if (!text) {
            alert('Bitte geben Sie eine Mitteilung ein.');
            return;
        }

        const selectedUsers = Array.from(document.querySelectorAll('#announcementUserSelection input[type="checkbox"]:checked'))
            .map(cb => cb.value);

        if (selectedUsers.length === 0) {
            alert('Bitte wählen Sie mindestens einen Mitarbeiter aus.');
            return;
        }

        if (this.editingAnnouncementId) {
            // Update existing announcement
            this.safetyAnnouncements = this.safetyAnnouncements.map(a => 
                a.id === this.editingAnnouncementId ? {
                    ...a,
                    text: text,
                    visibleToUsers: selectedUsers,
                    updatedAt: new Date().toISOString(),
                    updatedBy: this.currentUserId
                } : a
            );
            
            this.editingAnnouncementId = null;
            
            // Reset button text
            const saveBtn = document.getElementById('saveSafetyAnnouncementBtn');
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Mitteilung hinzufügen';
            }
            
            alert('Mitteilung wurde erfolgreich aktualisiert.');
        } else {
            // Create new announcement
            const newAnnouncement = {
                id: Date.now().toString(),
                text: text,
                visibleToUsers: selectedUsers,
                createdBy: this.currentUserId,
                createdAt: new Date().toISOString(),
                active: true
            };

            this.safetyAnnouncements.push(newAnnouncement);
            alert('Mitteilung wurde erfolgreich hinzugefügt.');
        }

        this.saveSafetyAnnouncementsToStorage();
        this.renderSafetyAnnouncements();
        this.renderExistingAnnouncements();
        
        // Clear form after successful save
        this.clearAnnouncementForm();
    }

    editAnnouncement(announcementId) {
        const announcement = this.safetyAnnouncements.find(a => a.id === announcementId);
        if (!announcement) {
            alert('Mitteilung nicht gefunden.');
            return;
        }

        const textArea = document.getElementById('safetyAnnouncementText');
        if (textArea) {
            textArea.value = announcement.text;
        }

        // Set checkboxes based on announcement visibility
        setTimeout(() => {
            const checkboxes = document.querySelectorAll('#announcementUserSelection input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = announcement.visibleToUsers.includes(cb.value);
            });
        }, 100);

        // Store editing ID for update instead of create
        this.editingAnnouncementId = announcementId;
        
        // Change button text to indicate editing mode
        const saveBtn = document.getElementById('saveSafetyAnnouncementBtn');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Mitteilung aktualisieren';
        }

        alert('Mitteilung wurde in das Formular geladen. Nehmen Sie Ihre Änderungen vor und klicken Sie auf "Mitteilung aktualisieren".');
    }

    deleteAnnouncement(announcementId) {
        const announcement = this.safetyAnnouncements.find(a => a.id === announcementId);
        if (!announcement) {
            alert('Mitteilung nicht gefunden.');
            return;
        }

        if (!confirm(`Möchten Sie diese Mitteilung wirklich löschen?\n\n"${announcement.text.substring(0, 100)}..."`)) {
            return;
        }

        // Mark as inactive instead of deleting
        this.safetyAnnouncements = this.safetyAnnouncements.map(a => 
            a.id === announcementId ? { ...a, active: false } : a
        );

        this.saveSafetyAnnouncementsToStorage();
        this.renderSafetyAnnouncements();
        this.renderExistingAnnouncements();
        
        alert('Mitteilung wurde erfolgreich gelöscht.');
    }

    toggleAnnouncementPreview(announcementId) {
        const preview = document.getElementById(`preview-${announcementId}`);
        const button = preview?.nextElementSibling;
        
        if (preview && button) {
            if (preview.classList.contains('expanded')) {
                preview.classList.remove('expanded');
                button.textContent = 'Vollständig anzeigen';
            } else {
                preview.classList.add('expanded');
                button.textContent = 'Weniger anzeigen';
            }
        }
    }

    renderSafetyAnnouncements() {
        const currentUser = this.getCurrentUser();
        const displayDiv = document.getElementById('safetyAnnouncementsDisplay');
        
        if (!displayDiv || !currentUser) return;

        const visibleAnnouncements = this.safetyAnnouncements.filter(a => {
            const isActive = a.active === true;
            const isVisibleToUser = a.visibleToUsers && a.visibleToUsers.includes(currentUser.id);
            
            return isActive && isVisibleToUser;
        });

        if (visibleAnnouncements.length > 0) {
            displayDiv.innerHTML = visibleAnnouncements.map(announcement => {
                const author = this.users.find(u => u.id === announcement.createdBy);
                const createdDate = new Date(announcement.createdAt).toLocaleDateString('de-DE');
                const updatedDate = announcement.updatedAt ? 
                    new Date(announcement.updatedAt).toLocaleDateString('de-DE') : null;
                
                return `
                    <div class="announcement-text">
                        ${announcement.text.replace(/\n/g, '<br>')}
                        <div class="announcement-meta" style="margin-top: 0.75rem; font-size: 0.875rem; color: #6b7280;">
                            <span>Von: ${author ? author.displayName : 'Unbekannt'}</span> • 
                            <span>Erstellt: ${createdDate}</span>
                            ${updatedDate ? ` • <span>Aktualisiert: ${updatedDate}</span>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            displayDiv.innerHTML = '<p class="no-announcements">Derzeit keine wichtigen Mitteilungen vorhanden.</p>';
        }
    }

    handleSafetyPdfUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Bitte wählen Sie nur PDF-Dateien aus.');
            return;
        }

        // Show loading indicator
        const uploadBtn = document.getElementById('uploadSafetyPdfBtn');
        const originalText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Hochladen...';
        uploadBtn.disabled = true;

        const reader = new FileReader();
        reader.onload = (e) => {
            const pdfDoc = {
                id: Date.now().toString(),
                name: file.name,
                size: file.size,
                type: file.type,
                content: e.target.result,
                uploadedBy: this.currentUserId,
                uploadDate: new Date().toISOString()
            };

            this.safetyPdfs.push(pdfDoc);
            this.saveSafetyPdfsToStorage();
            this.renderSafetyPdfs();

            // Reset button
            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;

            alert(`PDF "${file.name}" wurde erfolgreich hochgeladen.`);
        };

        reader.onerror = () => {
            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;
            alert('Fehler beim Hochladen der PDF-Datei.');
        };

        reader.readAsDataURL(file);

        // Reset file input
        event.target.value = '';
    }

    renderSafetyPdfs() {
        const container = document.getElementById('safetyPdfList');
        if (!container) {
            console.log('PDF Container not found!');
            return;
        }

        console.log('Rendering PDFs:', this.safetyPdfs.length, 'PDFs found');

        if (this.safetyPdfs.length === 0) {
            container.innerHTML = '<p class="no-documents">Keine Sicherheitsdokumente vorhanden.</p>';
            return;
        }

        const currentUser = this.getCurrentUser();
        const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'root-admin');

        console.log('Current user for PDF rendering:', currentUser?.displayName, 'isAdmin:', isAdmin);

        const htmlContent = this.safetyPdfs.map(pdf => {
            const uploadDate = new Date(pdf.uploadDate).toLocaleDateString('de-DE');
            const fileSize = this.formatFileSize(pdf.size);
            const uploader = this.users.find(u => u.id === pdf.uploadedBy);
            
            return `
                <div class="safety-pdf-item" data-pdf-id="${pdf.id}">
                    <div class="pdf-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="pdf-info">
                        <h4 class="pdf-title">${pdf.name}</h4>
                        <div class="pdf-meta">
                            <span><i class="fas fa-calendar"></i> ${uploadDate}</span>
                            <span><i class="fas fa-file-archive"></i> ${fileSize}</span>
                            <span><i class="fas fa-user"></i> ${uploader ? uploader.displayName : 'Unbekannt'}</span>
                        </div>
                    </div>
                    <div class="pdf-actions">
                        <button class="btn-primary btn-sm view-pdf-btn" onclick="dashboard.viewSafetyPdf('${pdf.id}')" title="PDF anzeigen">
                            <i class="fas fa-eye"></i> Anzeigen
                        </button>
                        <button class="btn-secondary btn-sm download-pdf-btn" onclick="dashboard.downloadSafetyPdf('${pdf.id}')" title="PDF herunterladen">
                            <i class="fas fa-download"></i> Download
                        </button>
                        ${isAdmin ? 
                            `<button class="btn-danger btn-sm delete-pdf-btn" onclick="dashboard.deleteSafetyPdf('${pdf.id}')" title="PDF löschen">
                                <i class="fas fa-trash"></i> Löschen
                            </button>` : ''
                        }
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = htmlContent;
        console.log('PDFs rendered successfully, HTML length:', htmlContent.length);
    }

    viewSafetyPdf(pdfId) {
        console.log('viewSafetyPdf called with ID:', pdfId);
        const pdf = this.safetyPdfs.find(p => p.id === pdfId);
        if (!pdf) {
            console.error('PDF not found with ID:', pdfId);
            alert('PDF nicht gefunden.');
            return;
        }

        console.log('Found PDF:', pdf.name);

        const modal = document.getElementById('pdfViewerModal');
        const title = document.getElementById('pdfViewerTitle');
        const fileName = document.getElementById('pdfFileName');
        const fileSize = document.getElementById('pdfFileSize');
        const iframe = document.getElementById('pdfFrame');

        console.log('Modal elements:', {
            modal: !!modal,
            title: !!title,
            fileName: !!fileName,
            fileSize: !!fileSize,
            iframe: !!iframe
        });

        if (title) title.textContent = pdf.name;
        if (fileName) fileName.textContent = pdf.name;
        if (fileSize) fileSize.textContent = this.formatFileSize(pdf.size);
        
        if (iframe) {
            console.log('Setting iframe src to:', pdf.content.substring(0, 50) + '...');
            
            // Try iframe first
            iframe.src = pdf.content;
            
            // Add load event listener to debug iframe loading
            iframe.onload = () => {
                console.log('PDF iframe loaded successfully');
            };
            
            iframe.onerror = (error) => {
                console.error('PDF iframe load error:', error);
                console.log('Iframe failed, trying alternative method...');
                
                // Alternative: Open in new window if iframe fails
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head>
                                <title>${pdf.name}</title>
                                <style>
                                    body { margin: 0; padding: 0; }
                                    iframe { width: 100vw; height: 100vh; border: none; }
                                </style>
                            </head>
                            <body>
                                <iframe src="${pdf.content}"></iframe>
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                    
                    // Close the modal since we opened in new window
                    this.closePdfViewer();
                } else {
                    alert('PDF konnte nicht geöffnet werden. Bitte verwenden Sie den Download-Button.');
                }
            };
            
            // Fallback: If iframe doesn't load after 3 seconds, show alternative
            setTimeout(() => {
                if (iframe.src === pdf.content && !iframe.contentDocument?.body?.innerHTML) {
                    console.log('Iframe loading timeout, showing alternative options');
                    
                    // Replace iframe content with alternative display
                    const pdfContent = document.getElementById('pdfContent');
                    if (pdfContent) {
                        pdfContent.innerHTML = `
                            <div style="padding: 2rem; text-align: center;">
                                <h3>PDF-Vorschau nicht verfügbar</h3>
                                <p>Die PDF-Datei "${pdf.name}" kann nicht im Browser angezeigt werden.</p>
                                <div style="margin-top: 1rem;">
                                    <button onclick="window.open('${pdf.content}')" class="btn-primary">
                                        <i class="fas fa-external-link-alt"></i> In neuem Fenster öffnen
                                    </button>
                                    <button onclick="dashboard.downloadSafetyPdf('${pdf.id}')" class="btn-secondary">
                                        <i class="fas fa-download"></i> Herunterladen
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                }
            }, 3000);
        }

        this.currentPdf = pdf;
        
        if (modal) {
            console.log('Showing modal');
            modal.classList.add('active');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Modal not found!');
            alert('PDF-Viewer konnte nicht geöffnet werden.');
        }
    }

    closePdfViewer() {
        console.log('Closing PDF viewer');
        const modal = document.getElementById('pdfViewerModal');
        const iframe = document.getElementById('pdfFrame');
        const pdfContent = document.getElementById('pdfContent');
        
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        // Reset content to original iframe
        if (pdfContent) {
            pdfContent.innerHTML = '<iframe id="pdfFrame" style="width: 100%; height: 70vh; border: none;"></iframe>';
        }
        
        // Clear any event listeners
        const newIframe = document.getElementById('pdfFrame');
        if (newIframe) {
            newIframe.src = '';
        }
        
        this.currentPdf = null;
    }

    downloadSafetyPdf(pdfId) {
        const pdf = this.safetyPdfs.find(p => p.id === pdfId);
        if (!pdf) return;

        const link = document.createElement('a');
        link.href = pdf.content;
        link.download = pdf.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadCurrentPdf() {
        if (this.currentPdf) {
            this.downloadSafetyPdf(this.currentPdf.id);
        }
    }

    printCurrentPdf() {
        if (this.currentPdf) {
            const iframe = document.getElementById('pdfFrame');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.print();
            }
        }
    }

    deleteSafetyPdf(pdfId) {
        const pdf = this.safetyPdfs.find(p => p.id === pdfId);
        if (!pdf) {
            alert('PDF nicht gefunden.');
            return;
        }

        if (!confirm(`Möchten Sie das PDF-Dokument "${pdf.name}" wirklich löschen?`)) {
            return;
        }

        this.safetyPdfs = this.safetyPdfs.filter(p => p.id !== pdfId);
        this.saveSafetyPdfsToStorage();
        this.renderSafetyPdfs();
        
        alert(`PDF "${pdf.name}" wurde erfolgreich gelöscht.`);
    }

    debugSafetySystem() {
        const currentUser = this.getCurrentUser();
        
        console.log('=== SAFETY SYSTEM DEBUG ===');
        console.log('Current User:', currentUser);
        console.log('All Users:', this.users);
        console.log('Safety Announcements:', this.safetyAnnouncements);
        
        const activeAnnouncement = this.safetyAnnouncements.find(a => a.active);
        console.log('Active Announcement:', activeAnnouncement);
        
        if (activeAnnouncement) {
            console.log('Visible to users:', activeAnnouncement.visibleToUsers);
            console.log('Current user in visible list:', activeAnnouncement.visibleToUsers.includes(currentUser.id));
        }
        
        // Show checkboxes state
        const checkboxes = document.querySelectorAll('#announcementUserSelection input[type="checkbox"]');
        console.log('Checkbox states:');
        checkboxes.forEach(cb => {
            console.log(`- User ${cb.value}: ${cb.checked ? 'checked' : 'unchecked'}`);
        });
        
        // Create detailed alert
        let debugInfo = `Sicherheitssystem Debug:\n\n`;
        debugInfo += `Aktueller Benutzer: ${currentUser.displayName} (ID: ${currentUser.id})\n`;
        debugInfo += `Rolle: ${currentUser.role}\n`;
        debugInfo += `Anzahl Benutzer: ${this.users.length}\n`;
        debugInfo += `Anzahl Mitteilungen: ${this.safetyAnnouncements.length}\n`;
        debugInfo += `Anzahl PDFs: ${this.safetyPdfs.length}\n`;
        
        if (activeAnnouncement) {
            debugInfo += `\nAktive Mitteilung gefunden:\n`;
            debugInfo += `- Text: ${activeAnnouncement.text.substring(0, 50)}...\n`;
            debugInfo += `- Sichtbar für: ${activeAnnouncement.visibleToUsers.length} Benutzer\n`;
            debugInfo += `- Benutzer-IDs: ${activeAnnouncement.visibleToUsers.join(', ')}\n`;
            debugInfo += `- Aktueller Benutzer sichtbar: ${activeAnnouncement.visibleToUsers.includes(currentUser.id) ? 'JA' : 'NEIN'}\n`;
        } else {
            debugInfo += `\nKeine aktive Mitteilung gefunden.\n`;
        }

        if (this.safetyPdfs.length > 0) {
            debugInfo += `\nPDF Dokumente:\n`;
            this.safetyPdfs.forEach((pdf, index) => {
                debugInfo += `${index + 1}. ${pdf.name} (${this.formatFileSize(pdf.size)})\n`;
            });
        } else {
            debugInfo += `\nKeine PDF Dokumente vorhanden.\n`;
        }

        debugInfo += `\nContainer-Status:\n`;
        const pdfContainer = document.getElementById('safetyPdfList');
        debugInfo += `- PDF Container gefunden: ${pdfContainer ? 'JA' : 'NEIN'}\n`;
        if (pdfContainer) {
            debugInfo += `- Container HTML: ${pdfContainer.innerHTML.length > 0 ? 'Enthält Content' : 'Leer'}\n`;
        }
        
        alert(debugInfo);
    }

    addTestPdf() {
        // Create a very simple PDF for testing (this is a valid minimal PDF)
        const testPdfContent = "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVGl0bGUgKFRlc3QgU2ljaGVyaGVpdHNkb2t1bWVudCkKL0NyZWF0b3IgKFFIU0UgU3lzdGVtKQovUHJvZHVjZXIgKFFIU0UgU3lzdGVtKQovQ3JlYXRpb25EYXRlIChEOjIwMjQwMTAxMTIwMDAwKQo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMyAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KPj4KPj4KL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggMTAwCj4+CnN0cmVhbQpCVApxCjcyIDcyMCBUZAovRjEgMTggVGYKKFNpY2hlcmhlaXRzZG9rdW1lbnQpIFRqCjAgLTMwIFRECi9GMSAxMiBUZgooRGllcyBpc3QgZWluIFRlc3QtUERGIGZ1ZXIgZGllIFNpY2hlcmhlaXRzZWNrZS4pIFRqCkVUClEKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDE1NyAwMDAwMCBuIAowMDAwMDAwMjE0IDAwMDAwIG4gCjAwMDAwMDAyOTggMDAwMDAgbiAKMDAwMDAwMDQ4OSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMiAwIFIKL0luZm8gMSAwIFIKPj4Kc3RhcnR4cmVmCjY0MAolJUVPRg==";
        
        const testPdf = {
            id: Date.now().toString(),
            name: 'Test-Sicherheitsdokument.pdf',
            size: 640, // approximate size of the PDF
            type: 'application/pdf',
            content: testPdfContent,
            uploadedBy: this.currentUserId,
            uploadDate: new Date().toISOString()
        };

        console.log('Adding test PDF:', testPdf.name);
        this.safetyPdfs.push(testPdf);
        this.saveSafetyPdfsToStorage();
        this.renderSafetyPdfs();
        
        alert('Test-PDF wurde hinzugefügt.');
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
        console.log('showAddMachineModal() aufgerufen');
        
        // Ensure departments are loaded
        if (!this.departments || this.departments.length === 0) {
            console.log('Keine Abteilungen gefunden - initialisiere Standardabteilungen');
            this.initializeDefaultDepartments();
        }
        
        // Remove existing modals to prevent duplicate IDs
        const existingModal = document.getElementById('addMachineModal');
        if (existingModal) existingModal.remove();
        
        console.log('Erstelle Modal mit', this.departments.length, 'Abteilungen');
        
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
                                            ${this.departments && this.departments.length > 0 ? 
                                                this.departments.map(dept => `<option value="${dept.id}">${dept.name} (${dept.code || dept.id})</option>`).join('') : 
                                                `<option value="produktion">Produktion (PROD)</option>
                                                 <option value="instandhaltung">Instandhaltung (IH)</option>
                                                 <option value="qhse">QHSE Management (QHSE)</option>`
                                            }
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
                                
                                <div class="form-group">
                                    <label for="machineDocuments">Dokumente (optional):</label>
                                    <div class="file-upload-area">
                                        <input type="file" id="machineDocuments" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" style="display: none;">
                                        <div class="upload-zone" onclick="document.getElementById('machineDocuments').click()" style="border: 2px dashed #d1d5db; padding: 20px; text-align: center; cursor: pointer; border-radius: 6px; margin-top: 8px;">
                                            <i class="fas fa-cloud-upload-alt" style="font-size: 24px; color: #9ca3af; margin-bottom: 8px;"></i>
                                            <p style="margin: 0; color: #6b7280;">Dokumente hier ablegen oder klicken zum Auswählen</p>
                                            <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">PDF, DOC, JPG, PNG, XLS erlaubt</p>
                                        </div>
                                        <div id="selectedFiles" style="margin-top: 8px;"></div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button onclick="window.dashboard.addMachine()" class="btn-primary">
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
        
        console.log('Modal erstellt und angezeigt');
        
        // Focus first field for better UX  
        setTimeout(() => {
            const firstField = document.getElementById('machineName');
            if (firstField) firstField.focus();
        }, 100);
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

    ensureMachineManagementWorks() {
        console.log('Ensuring machine management works...');
        
        // 1. Ensure departments exist
        if (this.departments.length === 0) {
            console.log('No departments found, initializing...');
            this.initializeDefaultDepartments();
        }
        
        // 2. Check if button exists and has event listener
        const addMachineBtn = document.getElementById('addMachineBtn');
        if (addMachineBtn) {
            console.log('Machine button found');
            
            // Remove existing listeners and add fresh one
            const newBtn = addMachineBtn.cloneNode(true);
            addMachineBtn.parentNode.replaceChild(newBtn, addMachineBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Machine button clicked!');
                this.showAddMachineModal();
            });
            
            console.log('Machine button event listener attached');
        } else {
            console.log('Machine button not found!');
        }
        
        // 3. Ensure machines array exists
        if (!Array.isArray(this.machines)) {
            this.machines = [];
            console.log('Machines array initialized');
        }
        
        // 4. Update UI
        this.renderMachinesList();
        this.updateMachineStats();
        
        console.log('Machine management verification complete');
    }

    // Audit Content Management System
    setupAuditManagement() {
        // Setup audit content management in settings
        this.setupAuditContentManagement();
    }

    setupAuditContentManagement() {
        const saveBtn = document.getElementById('saveAuditContentBtn');
        const clearBtn = document.getElementById('clearAuditContentBtn');
        const textInput = document.getElementById('auditFreeTextInput');
        const docUpload = document.getElementById('auditDocumentUpload');
        const imgUpload = document.getElementById('auditImageUpload');
        const docUploadArea = document.getElementById('auditDocumentUploadArea');
        const imgUploadArea = document.getElementById('auditImageUploadArea');

        if (!saveBtn || !clearBtn || !textInput || !docUpload || !imgUpload) {
            console.log('Audit management elements not found');
            return;
        }

        // Load existing content
        this.loadAuditContentToSettings();

        // Save button handler
        saveBtn.addEventListener('click', () => {
            this.saveAuditContent();
        });

        // Clear button handler
        clearBtn.addEventListener('click', () => {
            if (confirm('Möchten Sie wirklich alle Audit-Inhalte löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                this.clearAuditContent();
            }
        });

        // Document upload handler
        docUpload.addEventListener('change', (e) => {
            this.handleAuditFileUpload(e.target.files, 'documents');
        });

        // Image upload handler
        imgUpload.addEventListener('change', (e) => {
            this.handleAuditFileUpload(e.target.files, 'images');
        });

        // Drag and drop for documents
        this.setupDragAndDrop(docUploadArea, docUpload, 'documents');
        this.setupDragAndDrop(imgUploadArea, imgUpload, 'images');
    }

    setupDragAndDrop(area, input, type) {
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('drag-over');
        });

        area.addEventListener('dragleave', () => {
            area.classList.remove('drag-over');
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            this.handleAuditFileUpload(files, type);
        });

        area.addEventListener('click', () => {
            input.click();
        });
    }

    handleAuditFileUpload(files, type) {
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    uploadDate: new Date().toISOString()
                };

                if (type === 'documents') {
                    if (!this.auditContent.documents) this.auditContent.documents = [];
                    this.auditContent.documents.push(fileData);
                } else if (type === 'images') {
                    if (!this.auditContent.images) this.auditContent.images = [];
                    this.auditContent.images.push(fileData);
                }

                this.saveAuditContentToStorage();
                this.loadAuditContentToSettings();
                this.renderAuditContent();
                
                alert(`${file.name} wurde erfolgreich hochgeladen.`);
            };
            reader.readAsDataURL(file);
        });
    }

    loadAuditContentFromStorage() {
        const stored = localStorage.getItem('qhse_audit_content');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Fehler beim Laden der Audit-Inhalte:', e);
            }
        }
        return {
            freeText: '',
            documents: [],
            images: []
        };
    }

    saveAuditContentToStorage() {
        try {
            localStorage.setItem('qhse_audit_content', JSON.stringify(this.auditContent));
        } catch (e) {
            console.error('Fehler beim Speichern der Audit-Inhalte:', e);
            alert('Fehler beim Speichern. Möglicherweise ist der Speicher voll.');
        }
    }

    loadAuditContentToSettings() {
        const textInput = document.getElementById('auditFreeTextInput');
        if (textInput && this.auditContent && this.auditContent.freeText) {
            textInput.value = this.auditContent.freeText;
        }
    }

    saveAuditContent() {
        const textInput = document.getElementById('auditFreeTextInput');
        if (textInput) {
            this.auditContent.freeText = textInput.value;
        }

        this.saveAuditContentToStorage();
        this.renderAuditContent();
        
        alert('Audit-Inhalte wurden erfolgreich gespeichert.');
    }

    clearAuditContent() {
        this.auditContent = {
            freeText: '',
            documents: [],
            images: []
        };
        
        this.saveAuditContentToStorage();
        this.loadAuditContentToSettings();
        this.renderAuditContent();
        
        alert('Alle Audit-Inhalte wurden gelöscht.');
    }

    renderAuditContent() {
        console.log('Rendering audit content:', this.auditContent);
        this.renderAuditFreeText();
        this.renderAuditDocuments();
        this.renderAuditImages();
    }

    renderAuditFreeText() {
        const display = document.getElementById('auditFreeTextDisplay');
        if (!display) return;

        if (this.auditContent && this.auditContent.freeText && this.auditContent.freeText.trim()) {
            const formattedText = this.auditContent.freeText.replace(/\n/g, '<br>');
            display.innerHTML = `<div class="audit-text-content">${formattedText}</div>`;
            display.style.display = 'block';
        } else {
            display.style.display = 'none';
        }
    }

    renderAuditDocuments() {
        const container = document.getElementById('auditDocumentsList');
        if (!container) return;

        if (!this.auditContent || !this.auditContent.documents || this.auditContent.documents.length === 0) {
            container.innerHTML = '<p class="no-content">Keine Dokumente vorhanden.</p>';
            return;
        }

        const currentUser = this.getCurrentUser();
        const isRootAdmin = currentUser && currentUser.role === 'root-admin';

        const documentsHtml = this.auditContent.documents.map(doc => `
            <div class="document-item">
                <div class="document-info">
                    <i class="fas fa-file-alt"></i>
                    <div class="document-details">
                        <h4>${doc.name}</h4>
                        <p>Größe: ${this.formatFileSize(doc.size)} | Hochgeladen: ${new Date(doc.uploadDate).toLocaleDateString('de-DE')}</p>
                    </div>
                </div>
                <div class="document-actions">
                    <button onclick="dashboard.viewAuditDocument('${doc.id}')" class="btn-primary btn-sm">
                        <i class="fas fa-eye"></i> Anzeigen
                    </button>
                    ${isRootAdmin ? `<button onclick="dashboard.deleteAuditFile('${doc.id}', 'documents')" class="btn-danger btn-sm">
                        <i class="fas fa-trash"></i> Löschen
                    </button>` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = documentsHtml;
    }

    renderAuditImages() {
        const container = document.getElementById('auditImagesList');
        if (!container) return;

        if (!this.auditContent || !this.auditContent.images || this.auditContent.images.length === 0) {
            container.innerHTML = '<p class="no-content">Keine Bilder vorhanden.</p>';
            return;
        }

        const currentUser = this.getCurrentUser();
        const isRootAdmin = currentUser && currentUser.role === 'root-admin';

        const imagesHtml = this.auditContent.images.map(img => `
            <div class="image-item">
                <div class="image-preview">
                    <img src="${img.data}" alt="${img.name}" onclick="dashboard.viewAuditImage('${img.id}')">
                </div>
                <div class="image-info">
                    <h4>${img.name}</h4>
                    <p>Größe: ${this.formatFileSize(img.size)}</p>
                    <div class="image-actions">
                        <button onclick="dashboard.viewAuditImage('${img.id}')" class="btn-primary btn-sm">
                            <i class="fas fa-eye"></i> Anzeigen
                        </button>
                        ${isRootAdmin ? `<button onclick="dashboard.deleteAuditFile('${img.id}', 'images')" class="btn-danger btn-sm">
                            <i class="fas fa-trash"></i> Löschen
                        </button>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = imagesHtml;
    }

    viewAuditDocument(docId) {
        console.log('Attempting to view document:', docId);
        if (!this.auditContent || !this.auditContent.documents) {
            console.error('No audit content or documents available');
            alert('Keine Dokumente verfügbar.');
            return;
        }
        const doc = this.auditContent.documents.find(d => d.id === docId);
        if (!doc) {
            console.error('Document not found:', docId);
            alert('Dokument nicht gefunden.');
            return;
        }

        console.log('Document found:', doc.name, 'Type:', doc.type);

        if (doc.type === 'application/pdf') {
            console.log('Opening PDF document');
            this.showPdfModal(doc.data, doc.name);
        } else {
            console.log('Opening non-PDF document in new window');
            // For other document types, try to open in new window
            const newWindow = window.open();
            newWindow.document.write(`
                <html>
                    <head><title>${doc.name}</title></head>
                    <body style="margin:0; padding:20px; font-family:Arial;">
                        <h2>${doc.name}</h2>
                        <p>Dokument-Typ: ${doc.type}</p>
                        <p>Größe: ${this.formatFileSize(doc.size)}</p>
                        <a href="${doc.data}" download="${doc.name}" class="btn">Download</a>
                        <br><br>
                        ${doc.type.startsWith('image/') ? `<img src="${doc.data}" style="max-width:100%;">` : '<p>Dieses Dokument kann nicht direkt angezeigt werden. Bitte laden Sie es herunter.</p>'}
                    </body>
                </html>
            `);
        }
    }

    viewAuditImage(imgId) {
        if (!this.auditContent || !this.auditContent.images) return;
        const img = this.auditContent.images.find(i => i.id === imgId);
        if (!img) return;

        // Create image modal
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="image-modal-close">&times;</span>
                <img src="${img.data}" alt="${img.name}">
                <div class="image-modal-info">
                    <h3>${img.name}</h3>
                    <p>Größe: ${this.formatFileSize(img.size)} | Hochgeladen: ${new Date(img.uploadDate).toLocaleDateString('de-DE')}</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        const closeBtn = modal.querySelector('.image-modal-close');
        closeBtn.onclick = () => document.body.removeChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) document.body.removeChild(modal);
        };
    }

    deleteAuditFile(fileId, type) {
        // Check if user is root-admin
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'root-admin') {
            alert('Sie haben keine Berechtigung zum Löschen von Dateien. Nur der System-Administrator kann Dateien löschen.');
            return;
        }

        if (!confirm('Möchten Sie diese Datei wirklich löschen?')) return;

        if (type === 'documents') {
            this.auditContent.documents = this.auditContent.documents.filter(d => d.id !== fileId);
        } else if (type === 'images') {
            this.auditContent.images = this.auditContent.images.filter(i => i.id !== fileId);
        }

        this.saveAuditContentToStorage();
        this.renderAuditContent();
        this.loadAuditContentToSettings();
        
        alert('Datei wurde erfolgreich gelöscht.');
    }

    showPdfModal(pdfData, fileName) {
        console.log('Attempting to show PDF modal for:', fileName);
        // Reuse existing PDF modal functionality
        const modal = document.getElementById('pdfViewerModal');
        if (!modal) {
            console.error('PDF Viewer Modal not found');
            alert('PDF-Viewer nicht verfügbar. Das Dokument wird in einem neuen Fenster geöffnet.');
            window.open(pdfData, '_blank');
            return;
        }

        const iframe = document.getElementById('pdfFrame');
        const title = document.getElementById('pdfViewerTitle');
        
        console.log('Modal found:', modal);
        console.log('Iframe found:', iframe);
        console.log('Title found:', title);
        
        if (title) title.textContent = fileName;
        if (iframe) {
            iframe.src = pdfData;
            console.log('PDF data set to iframe:', pdfData.substring(0, 50) + '...');
        } else {
            console.error('PDF iframe not found');
            alert('PDF-Anzeige nicht verfügbar. Das Dokument wird in einem neuen Fenster geöffnet.');
            window.open(pdfData, '_blank');
            return;
        }
        
        modal.style.display = 'block';
        console.log('Modal should now be visible');
        
        // Setup close functionality
        const closeBtn = document.getElementById('closePdfViewer');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                if (iframe) iframe.src = '';
            };
        }
        
        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                if (iframe) iframe.src = '';
            }
        };
        
        // Setup download functionality
        const downloadBtn = document.getElementById('pdfDownloadBtn');
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = pdfData;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
        }
        
        // Setup print functionality
        const printBtn = document.getElementById('pdfPrintBtn');
        if (printBtn) {
            printBtn.onclick = () => {
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.print();
                } else {
                    // Fallback: open in new window and print
                    const printWindow = window.open(pdfData);
                    printWindow.onload = () => {
                        printWindow.print();
                    };
                }
            };
        }
        
        // Update PDF info
        const fileNameSpan = document.getElementById('pdfFileName');
        const fileSizeSpan = document.getElementById('pdfFileSize');
        if (fileNameSpan) fileNameSpan.textContent = fileName;
        if (fileSizeSpan) {
            // Calculate file size from base64 data
            const sizeInBytes = Math.round((pdfData.length - 'data:application/pdf;base64,'.length) * 3/4);
            fileSizeSpan.textContent = this.formatFileSize(sizeInBytes);
        }
    }

    // Audit Certifications Management System
    setupAuditCertificationsManagement() {
        const addCertBtn = document.getElementById('addCertificationBtn');
        const addInternalAuditBtn = document.getElementById('addInternalAuditBtn');
        const addExternalAuditBtn = document.getElementById('addExternalAuditBtn');
        const saveBtn = document.getElementById('saveAuditCertificationsBtn');
        const resetBtn = document.getElementById('resetAuditCertificationsBtn');

        if (!addCertBtn || !addInternalAuditBtn || !addExternalAuditBtn || !saveBtn || !resetBtn) {
            console.log('Audit certifications management elements not found');
            return;
        }

        // Load existing data
        this.loadAuditCertificationsToSettings();
        this.setupAuditResultsModal();

        // Add certification handler
        addCertBtn.addEventListener('click', () => {
            this.addCertification();
        });

        // Add internal audit handler
        addInternalAuditBtn.addEventListener('click', () => {
            this.addInternalAudit();
        });

        // Debug button for testing
        const debugBtn = document.createElement('button');
        debugBtn.textContent = 'Debug Form';
        debugBtn.className = 'btn-info btn-sm';
        debugBtn.onclick = () => this.debugAuditForms();
        addInternalAuditBtn.parentNode.appendChild(debugBtn);

        // Add external audit handler
        addExternalAuditBtn.addEventListener('click', () => {
            this.addExternalAudit();
        });

        // Save handler
        saveBtn.addEventListener('click', () => {
            this.saveAuditCertifications();
        });

        // Reset handler
        resetBtn.addEventListener('click', () => {
            if (confirm('Möchten Sie wirklich alle Zertifizierungen auf die Standardwerte zurücksetzen?')) {
                this.resetAuditCertifications();
            }
        });
    }

    setupDashboardAudits() {
        const editBtn = document.getElementById('editDashboardAuditsBtn');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                // Navigate to settings page for audit management
                this.showSection('einstellungen');
                
                // Scroll to audit certifications section
                setTimeout(() => {
                    const auditSettings = document.querySelector('.audit-certifications-management');
                    if (auditSettings) {
                        auditSettings.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 300);
            });
        }
    }

    showSection(sectionId) {
        // Find the menu item for this section
        const menuItem = document.querySelector(`.menu-item[data-section="${sectionId}"]`);
        if (menuItem) {
            // Trigger the click event to use existing navigation logic
            menuItem.click();
        }
    }

    renderDashboardAudits() {
        this.renderDashboardCertifications();
        this.renderDashboardInternalAudits();
        this.renderDashboardExternalAudits();
    }

    renderDashboardCertifications() {
        const container = document.getElementById('dashboardCertificationsList');
        if (!container) return;

        if (!this.auditCertifications.certifications || this.auditCertifications.certifications.length === 0) {
            container.innerHTML = '<p class="no-content">Keine TÜV-Zertifizierungen vorhanden.</p>';
            return;
        }

        const certsHtml = this.auditCertifications.certifications.map(cert => `
            <div class="cert-item">
                <span class="cert-name">${cert.name}</span>
                <span class="cert-validity">${cert.validity}</span>
            </div>
        `).join('');

        container.innerHTML = certsHtml;
    }

    renderDashboardInternalAudits() {
        const container = document.getElementById('dashboardInternalAuditsList');
        if (!container) return;

        if (!this.auditCertifications.internalAudits || this.auditCertifications.internalAudits.length === 0) {
            container.innerHTML = '<p class="no-content">Keine internen Audits vorhanden.</p>';
            return;
        }

        // Show only the 3 most recent audits
        const recentAudits = this.auditCertifications.internalAudits
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        const auditsHtml = recentAudits.map(audit => {
            const statusClass = audit.status === 'abgeschlossen' ? 'passed' : 
                               audit.status === 'durchgeführt' ? 'in-progress' : 'pending';
            const statusText = audit.status === 'abgeschlossen' ? 'Abgeschlossen' :
                              audit.status === 'durchgeführt' ? 'Durchgeführt' : 'Geplant';
            
            return `
                <div class="audit-item ${statusClass}">
                    <span class="audit-type">${audit.title}</span>
                    <span class="audit-date">${new Date(audit.date).toLocaleDateString('de-DE')}</span>
                    <span class="audit-result">${statusText}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = auditsHtml;
    }

    renderDashboardExternalAudits() {
        const container = document.getElementById('dashboardExternalAuditsList');
        if (!container) return;

        if (!this.auditCertifications.externalAudits || this.auditCertifications.externalAudits.length === 0) {
            container.innerHTML = '<p class="no-content">Keine externen Audits vorhanden.</p>';
            return;
        }

        // Show only the 3 most recent audits
        const recentAudits = this.auditCertifications.externalAudits
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        const auditsHtml = recentAudits.map(audit => {
            const statusClass = audit.status === 'abgeschlossen' ? 'passed' : 
                               audit.status === 'durchgeführt' ? 'in-progress' : 'pending';
            const statusText = audit.status === 'abgeschlossen' ? 'Abgeschlossen' :
                              audit.status === 'durchgeführt' ? 'Durchgeführt' : 'Geplant';
            
            return `
                <div class="audit-item ${statusClass}">
                    <span class="audit-type">${audit.title}</span>
                    <span class="audit-date">${new Date(audit.date).toLocaleDateString('de-DE')}</span>
                    <span class="audit-result">${statusText}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = auditsHtml;
    }

    setupDashboardKpiManagement() {
        const saveBtn = document.getElementById('saveDashboardKpisBtn');
        const resetBtn = document.getElementById('resetDashboardKpisBtn');
        const previewBtn = document.getElementById('previewDashboardBtn');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveDashboardKpis();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Möchten Sie wirklich alle Dashboard-Inhalte auf die Standardwerte zurücksetzen?')) {
                    this.resetDashboardKpis();
                }
            });
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.showSection('dashboard');
            });
        }

        // Setup edit KPI button in dashboard
        const editKpiBtn = document.getElementById('editKpiBtn');
        if (editKpiBtn) {
            editKpiBtn.addEventListener('click', () => {
                this.showSection('einstellungen');
                
                // Scroll to dashboard KPI management section
                setTimeout(() => {
                    const settingsCards = document.querySelectorAll('.settings-card h3');
                    for (const h3 of settingsCards) {
                        if (h3.textContent.includes('Dashboard Inhalte verwalten')) {
                            h3.closest('.settings-card').scrollIntoView({ behavior: 'smooth' });
                            break;
                        }
                    }
                }, 300);
            });
        }

        // Setup custom KPI management
        const addCustomKpiBtn = document.getElementById('addCustomKpiBtn');
        if (addCustomKpiBtn) {
            addCustomKpiBtn.addEventListener('click', () => {
                this.addCustomKpi();
            });
        }

        // Load current values into form
        this.loadDashboardKpisToForm();
        this.renderExistingCustomKpis();
    }

    loadDashboardKpisFromStorage() {
        try {
            const stored = localStorage.getItem('qhse_dashboard_kpis');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Fehler beim Laden der Dashboard-KPIs:', e);
        }

        // Default KPI values
        return {
            safety: { value: '98.5', unit: '%', label: 'Compliance Rate' },
            quality: { value: '99.2', unit: '%', label: 'Qualitätsrate' },
            environment: { value: '12', unit: 't', label: 'CO₂ Einsparung' },
            health: { value: '2.1', unit: 'Tage', label: 'Krankentage (Ø)' },
            customerSatisfaction: { value: '4.7', max: '5', label: 'von 5 Sternen' }
        };
    }

    saveDashboardKpisToStorage() {
        try {
            localStorage.setItem('qhse_dashboard_kpis', JSON.stringify(this.dashboardKpis));
        } catch (e) {
            console.error('Fehler beim Speichern der Dashboard-KPIs:', e);
            alert('Fehler beim Speichern. Möglicherweise ist der Speicher voll.');
        }
    }

    loadDashboardKpisToForm() {
        // Safety KPI
        this.setInputValue('safetyKpiValue', this.dashboardKpis.safety.value);
        this.setInputValue('safetyKpiUnit', this.dashboardKpis.safety.unit);
        this.setInputValue('safetyKpiLabel', this.dashboardKpis.safety.label);

        // Quality KPI
        this.setInputValue('qualityKpiValue', this.dashboardKpis.quality.value);
        this.setInputValue('qualityKpiUnit', this.dashboardKpis.quality.unit);
        this.setInputValue('qualityKpiLabel', this.dashboardKpis.quality.label);

        // Environment KPI
        this.setInputValue('environmentKpiValue', this.dashboardKpis.environment.value);
        this.setInputValue('environmentKpiUnit', this.dashboardKpis.environment.unit);
        this.setInputValue('environmentKpiLabel', this.dashboardKpis.environment.label);

        // Health KPI
        this.setInputValue('healthKpiValue', this.dashboardKpis.health.value);
        this.setInputValue('healthKpiUnit', this.dashboardKpis.health.unit);
        this.setInputValue('healthKpiLabel', this.dashboardKpis.health.label);

        // Customer Satisfaction
        this.setInputValue('customerSatisfactionValue', this.dashboardKpis.customerSatisfaction.value);
        this.setInputValue('customerSatisfactionMax', this.dashboardKpis.customerSatisfaction.max);
        this.setInputValue('customerSatisfactionLabel', this.dashboardKpis.customerSatisfaction.label);
    }

    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            element.value = value;
        }
    }

    saveDashboardKpis() {
        // Get values from form
        this.dashboardKpis.safety.value = this.getInputValue('safetyKpiValue') || '98.5';
        this.dashboardKpis.safety.unit = this.getInputValue('safetyKpiUnit') || '%';
        this.dashboardKpis.safety.label = this.getInputValue('safetyKpiLabel') || 'Compliance Rate';

        this.dashboardKpis.quality.value = this.getInputValue('qualityKpiValue') || '99.2';
        this.dashboardKpis.quality.unit = this.getInputValue('qualityKpiUnit') || '%';
        this.dashboardKpis.quality.label = this.getInputValue('qualityKpiLabel') || 'Qualitätsrate';

        this.dashboardKpis.environment.value = this.getInputValue('environmentKpiValue') || '12';
        this.dashboardKpis.environment.unit = this.getInputValue('environmentKpiUnit') || 't';
        this.dashboardKpis.environment.label = this.getInputValue('environmentKpiLabel') || 'CO₂ Einsparung';

        this.dashboardKpis.health.value = this.getInputValue('healthKpiValue') || '2.1';
        this.dashboardKpis.health.unit = this.getInputValue('healthKpiUnit') || 'Tage';
        this.dashboardKpis.health.label = this.getInputValue('healthKpiLabel') || 'Krankentage (Ø)';

        this.dashboardKpis.customerSatisfaction.value = this.getInputValue('customerSatisfactionValue') || '4.7';
        this.dashboardKpis.customerSatisfaction.max = this.getInputValue('customerSatisfactionMax') || '5';
        this.dashboardKpis.customerSatisfaction.label = this.getInputValue('customerSatisfactionLabel') || 'von 5 Sternen';

        // Save to storage
        this.saveDashboardKpisToStorage();

        // Update dashboard display
        this.updateDashboardKpiDisplay();

        alert('Dashboard-Inhalte wurden erfolgreich gespeichert!');
    }

    getInputValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    }

    resetDashboardKpis() {
        // Reset to default values
        this.dashboardKpis = {
            safety: { value: '98.5', unit: '%', label: 'Compliance Rate' },
            quality: { value: '99.2', unit: '%', label: 'Qualitätsrate' },
            environment: { value: '12', unit: 't', label: 'CO₂ Einsparung' },
            health: { value: '2.1', unit: 'Tage', label: 'Krankentage (Ø)' },
            customerSatisfaction: { value: '4.7', max: '5', label: 'von 5 Sternen' }
        };

        this.saveDashboardKpisToStorage();
        this.loadDashboardKpisToForm();
        this.updateDashboardKpiDisplay();

        alert('Dashboard-Inhalte wurden auf Standardwerte zurückgesetzt!');
    }

    updateDashboardKpiDisplay() {
        // Update Safety KPI
        const safetyValue = document.querySelector('.kpi-card.safety .kpi-value');
        const safetyLabel = document.querySelector('.kpi-card.safety p');
        if (safetyValue) safetyValue.textContent = `${this.dashboardKpis.safety.value}${this.dashboardKpis.safety.unit}`;
        if (safetyLabel) safetyLabel.textContent = this.dashboardKpis.safety.label;

        // Update Quality KPI
        const qualityValue = document.querySelector('.kpi-card.quality .kpi-value');
        const qualityLabel = document.querySelector('.kpi-card.quality p');
        if (qualityValue) qualityValue.textContent = `${this.dashboardKpis.quality.value}${this.dashboardKpis.quality.unit}`;
        if (qualityLabel) qualityLabel.textContent = this.dashboardKpis.quality.label;

        // Update Environment KPI
        const environmentValue = document.querySelector('.kpi-card.environment .kpi-value');
        const environmentLabel = document.querySelector('.kpi-card.environment p');
        if (environmentValue) environmentValue.textContent = `${this.dashboardKpis.environment.value}`;
        if (environmentLabel) environmentLabel.textContent = `${this.dashboardKpis.environment.label} (${this.dashboardKpis.environment.unit})`;

        // Update Health KPI
        const healthValue = document.querySelector('.kpi-card.health .kpi-value');
        const healthLabel = document.querySelector('.kpi-card.health p');
        if (healthValue) healthValue.textContent = this.dashboardKpis.health.value;
        if (healthLabel) healthLabel.textContent = `${this.dashboardKpis.health.label} (${this.dashboardKpis.health.unit})`;

        // Update Customer Satisfaction
        const satisfactionValue = document.querySelector('.score');
        const satisfactionLabel = document.querySelector('.widget.customer-satisfaction p');
        if (satisfactionValue) satisfactionValue.textContent = this.dashboardKpis.customerSatisfaction.value;
        if (satisfactionLabel) satisfactionLabel.textContent = this.dashboardKpis.customerSatisfaction.label;
    }

    updateElementVisibilityByRole() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        // Find all elements with data-roles attribute
        const elementsWithRoles = document.querySelectorAll('[data-roles]');
        
        elementsWithRoles.forEach(element => {
            const allowedRoles = element.getAttribute('data-roles').split(',').map(role => role.trim());
            
            if (allowedRoles.includes(currentUser.role)) {
                element.style.display = '';
                element.classList.remove('hidden');
            } else {
                element.style.display = 'none';
                element.classList.add('hidden');
            }
        });
    }

    loadCustomKpisFromStorage() {
        try {
            const stored = localStorage.getItem('qhse_custom_kpis');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Fehler beim Laden der benutzerdefinierten KPIs:', e);
        }
        return [];
    }

    saveCustomKpisToStorage() {
        try {
            localStorage.setItem('qhse_custom_kpis', JSON.stringify(this.customKpis));
        } catch (e) {
            console.error('Fehler beim Speichern der benutzerdefinierten KPIs:', e);
            alert('Fehler beim Speichern. Möglicherweise ist der Speicher voll.');
        }
    }

    addCustomKpi() {
        const titleInput = document.getElementById('customKpiTitle');
        const valueInput = document.getElementById('customKpiValue');
        const unitInput = document.getElementById('customKpiUnit');
        const labelInput = document.getElementById('customKpiLabel');
        const iconSelect = document.getElementById('customKpiIcon');
        const colorSelect = document.getElementById('customKpiColor');

        // Validate required fields
        if (!titleInput.value.trim()) {
            alert('Bitte geben Sie einen Titel für das KPI ein.');
            titleInput.focus();
            return;
        }

        if (!valueInput.value.trim()) {
            alert('Bitte geben Sie einen Wert für das KPI ein.');
            valueInput.focus();
            return;
        }

        if (!iconSelect.value) {
            alert('Bitte wählen Sie ein Icon für das KPI aus.');
            iconSelect.focus();
            return;
        }

        if (!colorSelect.value) {
            alert('Bitte wählen Sie eine Farbe für das KPI aus.');
            colorSelect.focus();
            return;
        }

        // Create new custom KPI
        const newKpi = {
            id: Date.now(),
            title: titleInput.value.trim(),
            value: valueInput.value.trim(),
            unit: unitInput.value.trim() || '',
            label: labelInput.value.trim() || '',
            icon: iconSelect.value,
            color: colorSelect.value,
            createdAt: new Date().toISOString()
        };

        // Add to custom KPIs array
        this.customKpis.push(newKpi);
        
        // Save to storage
        this.saveCustomKpisToStorage();

        // Clear form
        titleInput.value = '';
        valueInput.value = '';
        unitInput.value = '';
        labelInput.value = '';
        iconSelect.value = '';
        colorSelect.value = '';

        // Update UI
        this.renderExistingCustomKpis();
        this.renderCustomKpisOnDashboard();

        alert('Benutzerdefiniertes KPI wurde erfolgreich hinzugefügt!');
    }

    renderExistingCustomKpis() {
        const container = document.getElementById('existingCustomKpis');
        if (!container) return;

        if (this.customKpis.length === 0) {
            container.innerHTML = '<p class="no-content">Keine benutzerdefinierten KPIs vorhanden.</p>';
            return;
        }

        const kpisHtml = this.customKpis.map(kpi => `
            <div class="custom-kpi-item" data-id="${kpi.id}">
                <div class="kpi-preview">
                    <div class="kpi-icon-preview kpi-color-${kpi.color}">
                        <i class="${kpi.icon}"></i>
                    </div>
                    <div class="kpi-info">
                        <h5>${kpi.title}</h5>
                        <div class="kpi-value-preview">${kpi.value}${kpi.unit}</div>
                        <p>${kpi.label}</p>
                    </div>
                </div>
                <div class="kpi-actions">
                    <button onclick="dashboard.editCustomKpi(${kpi.id})" class="btn-secondary btn-sm">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button onclick="dashboard.deleteCustomKpi(${kpi.id})" class="btn-danger btn-sm">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = kpisHtml;
    }

    editCustomKpi(kpiId) {
        const kpi = this.customKpis.find(k => k.id === kpiId);
        if (!kpi) return;

        // Fill form with existing values
        document.getElementById('customKpiTitle').value = kpi.title;
        document.getElementById('customKpiValue').value = kpi.value;
        document.getElementById('customKpiUnit').value = kpi.unit;
        document.getElementById('customKpiLabel').value = kpi.label;
        document.getElementById('customKpiIcon').value = kpi.icon;
        document.getElementById('customKpiColor').value = kpi.color;

        // Change button text and function
        const addBtn = document.getElementById('addCustomKpiBtn');
        addBtn.innerHTML = '<i class="fas fa-save"></i> KPI aktualisieren';
        addBtn.onclick = () => this.updateCustomKpi(kpiId);
    }

    updateCustomKpi(kpiId) {
        const kpiIndex = this.customKpis.findIndex(k => k.id === kpiId);
        if (kpiIndex === -1) return;

        const titleInput = document.getElementById('customKpiTitle');
        const valueInput = document.getElementById('customKpiValue');
        const unitInput = document.getElementById('customKpiUnit');
        const labelInput = document.getElementById('customKpiLabel');
        const iconSelect = document.getElementById('customKpiIcon');
        const colorSelect = document.getElementById('customKpiColor');

        // Validate required fields
        if (!titleInput.value.trim() || !valueInput.value.trim() || !iconSelect.value || !colorSelect.value) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        // Update KPI
        this.customKpis[kpiIndex] = {
            ...this.customKpis[kpiIndex],
            title: titleInput.value.trim(),
            value: valueInput.value.trim(),
            unit: unitInput.value.trim() || '',
            label: labelInput.value.trim() || '',
            icon: iconSelect.value,
            color: colorSelect.value,
            updatedAt: new Date().toISOString()
        };

        // Save to storage
        this.saveCustomKpisToStorage();

        // Reset form and button
        this.resetCustomKpiForm();

        // Update UI
        this.renderExistingCustomKpis();
        this.renderCustomKpisOnDashboard();

        alert('Benutzerdefiniertes KPI wurde erfolgreich aktualisiert!');
    }

    deleteCustomKpi(kpiId) {
        const kpi = this.customKpis.find(k => k.id === kpiId);
        if (!kpi) return;

        if (confirm(`Möchten Sie das KPI "${kpi.title}" wirklich löschen?`)) {
            // Remove from array
            this.customKpis = this.customKpis.filter(k => k.id !== kpiId);
            
            // Save to storage
            this.saveCustomKpisToStorage();

            // Update UI
            this.renderExistingCustomKpis();
            this.renderCustomKpisOnDashboard();

            alert('Benutzerdefiniertes KPI wurde erfolgreich gelöscht!');
        }
    }

    resetCustomKpiForm() {
        document.getElementById('customKpiTitle').value = '';
        document.getElementById('customKpiValue').value = '';
        document.getElementById('customKpiUnit').value = '';
        document.getElementById('customKpiLabel').value = '';
        document.getElementById('customKpiIcon').value = '';
        document.getElementById('customKpiColor').value = '';

        const addBtn = document.getElementById('addCustomKpiBtn');
        addBtn.innerHTML = '<i class="fas fa-plus"></i> KPI hinzufügen';
        addBtn.onclick = () => this.addCustomKpi();
    }

    renderCustomKpisOnDashboard() {
        const kpiCardsContainer = document.querySelector('.kpi-cards');
        if (!kpiCardsContainer) return;

        // Remove existing custom KPI cards
        const existingCustomCards = kpiCardsContainer.querySelectorAll('.kpi-card.custom');
        existingCustomCards.forEach(card => card.remove());

        // Add new custom KPI cards
        this.customKpis.forEach(kpi => {
            const kpiCard = document.createElement('div');
            kpiCard.className = `kpi-card custom kpi-color-${kpi.color}`;
            kpiCard.innerHTML = `
                <div class="kpi-icon">
                    <i class="${kpi.icon}"></i>
                </div>
                <div class="kpi-content">
                    <h3>${kpi.title}</h3>
                    <div class="kpi-value">${kpi.value}${kpi.unit}</div>
                    <p>${kpi.label}</p>
                </div>
            `;
            
            kpiCardsContainer.appendChild(kpiCard);
        });
    }

    setupAuditResultsModal() {
        const modal = document.getElementById('auditResultsModal');
        const closeBtn = document.getElementById('closeAuditResults');
        const saveBtn = document.getElementById('saveAuditResultsBtn');
        const cancelBtn = document.getElementById('cancelAuditResultsBtn');

        if (!modal || !closeBtn || !saveBtn || !cancelBtn) {
            console.log('Audit results modal elements not found');
            return;
        }

        // Close handlers
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            this.currentEditingAudit = null;
        };
        
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
            this.currentEditingAudit = null;
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                this.currentEditingAudit = null;
            }
        };

        // Save handler
        saveBtn.onclick = () => this.saveAuditResults();

        console.log('Audit results modal setup complete');
    }

    loadAuditCertificationsFromStorage() {
        const stored = localStorage.getItem('qhse_audit_certifications');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Fehler beim Laden der Audit-Zertifizierungen:', e);
            }
        }
        return {
            certifications: [
                { id: 1, name: 'ISO 9001:2015', validity: 'Gültig bis 12/2025' },
                { id: 2, name: 'ISO 14001:2015', validity: 'Gültig bis 03/2026' },
                { id: 3, name: 'OHSAS 18001', validity: 'Erneuerung 04/2024' }
            ],
            internalAudits: [
                { id: 1, type: 'Qualitätsaudit', title: 'Qualitätsaudit Q2 2024', date: '2024-06-15', status: 'abgeschlossen', 
                  results: { findings: 'Verbesserungen in der Dokumentation erforderlich', actions: 'Überarbeitung der Arbeitsanweisungen', score: 'Gut', notes: 'Nächstes Audit in 6 Monaten' } },
                { id: 2, type: 'Umweltaudit', title: 'Umweltaudit Q3 2024', date: '2024-08-20', status: 'geplant' }
            ],
            externalAudits: [
                { id: 1, type: 'ISO 9001 Zertifizierung', title: 'ISO 9001 Zertifizierung Überwachungsaudit', auditor: 'TÜV Rheinland', date: '2024-05-10', status: 'bestanden',
                  results: { findings: 'Alle Anforderungen erfüllt', actions: 'Kontinuierliche Verbesserung empfohlen', score: 'Bestanden', notes: 'Zertifikat gültig bis 2027' } },
                { id: 2, type: 'ISO 14001 Zertifizierung', title: 'ISO 14001 Zertifizierung Rezertifizierung', auditor: 'TÜV Nord', date: '2024-09-15', status: 'geplant' }
            ]
        };
    }

    saveAuditCertificationsToStorage() {
        try {
            localStorage.setItem('qhse_audit_certifications', JSON.stringify(this.auditCertifications));
        } catch (e) {
            console.error('Fehler beim Speichern der Audit-Zertifizierungen:', e);
            alert('Fehler beim Speichern. Möglicherweise ist der Speicher voll.');
        }
    }

    loadAuditCertificationsToSettings() {
        this.renderExistingCertifications();
        this.renderExistingInternalAudits();
        this.renderExistingExternalAudits();
    }

    addCertification() {
        const nameInput = document.getElementById('certificationName');
        const validityInput = document.getElementById('certificationValidity');

        if (!nameInput.value.trim() || !validityInput.value.trim()) {
            alert('Bitte füllen Sie alle Felder aus.');
            return;
        }

        const newCert = {
            id: Date.now(),
            name: nameInput.value.trim(),
            validity: validityInput.value.trim()
        };

        this.auditCertifications.certifications.push(newCert);
        
        nameInput.value = '';
        validityInput.value = '';
        
        this.renderExistingCertifications();
        this.renderAuditCertifications();
        this.renderDashboardAudits();
    }

    addInternalAudit() {
        // First ensure we're in the right section
        const settingsSection = document.getElementById('einstellungen-section');
        if (!settingsSection || settingsSection.style.display === 'none') {
            alert('Fehler: Bitte navigieren Sie erst zu Einstellungen → Audit-Zertifizierungen verwalten');
            return;
        }

        // Wait a moment for elements to be ready
        setTimeout(() => {
            const typeSelect = document.getElementById('internalAuditType');
            const titleInput = document.getElementById('internalAuditTitle');
            const dateInput = document.getElementById('internalAuditDate');
            const statusSelect = document.getElementById('internalAuditStatus');

            console.log('Adding internal audit - Field values:', {
                type: typeSelect?.value,
                title: titleInput?.value,
                titleTrimmed: titleInput?.value?.trim(),
                date: dateInput?.value,
                status: statusSelect?.value
            });

            console.log('Form elements found:', {
                typeSelect: !!typeSelect,
                titleInput: !!titleInput,
                dateInput: !!dateInput,
                statusSelect: !!statusSelect
            });

            // Check if elements exist
            if (!typeSelect || !titleInput || !dateInput || !statusSelect) {
                console.error('Missing form elements - detailed check:', {
                    typeSelectExists: !!typeSelect,
                    titleInputExists: !!titleInput, 
                    dateInputExists: !!dateInput,
                    statusSelectExists: !!statusSelect,
                    settingsVisible: settingsSection.style.display !== 'none'
                });
                alert('Fehler: Formularfelder nicht gefunden. Bitte stellen Sie sicher, dass Sie in den Einstellungen sind.');
                return;
            }

            // Validate required fields with better error messages
            if (!typeSelect.value || typeSelect.value.trim() === '') {
                alert('Bitte wählen Sie einen Audit-Typ aus der Dropdown-Liste aus.');
                typeSelect.focus();
                return;
            }

            const titleValue = titleInput.value ? titleInput.value.trim() : '';
            if (!titleValue || titleValue === '') {
                alert('Bitte geben Sie einen Titel/Bezeichnung für das Audit ein (z.B. "2024 Q2").');
                titleInput.focus();
                return;
            }

            if (!dateInput.value || dateInput.value.trim() === '') {
                alert('Bitte wählen Sie ein Datum für das Audit aus.');
                dateInput.focus();
                return;
            }

            this.performAddInternalAudit(typeSelect, titleInput, dateInput, statusSelect);
        }, 100);
    }

    performAddInternalAudit(typeSelect, titleInput, dateInput, statusSelect) {
        const fullTitle = `${typeSelect.value} ${titleInput.value.trim()}`;

        const newAudit = {
            id: Date.now(),
            type: typeSelect.value,
            title: fullTitle,
            date: dateInput.value,
            status: statusSelect.value || 'geplant'
        };

        console.log('Creating new internal audit:', newAudit);

        if (!this.auditCertifications.internalAudits) {
            this.auditCertifications.internalAudits = [];
        }

        this.auditCertifications.internalAudits.push(newAudit);
        this.saveAuditCertificationsToStorage();
        
        // Clear form
        typeSelect.value = '';
        titleInput.value = '';
        dateInput.value = '';
        statusSelect.value = 'geplant';
        
        this.renderExistingInternalAudits();
        this.renderAuditCertifications();
        this.renderDashboardAudits();
        
        alert('Internes Audit wurde erfolgreich hinzugefügt.');
    }

    addExternalAudit() {
        // First ensure we're in the right section
        const settingsSection = document.getElementById('einstellungen-section');
        if (!settingsSection || settingsSection.style.display === 'none') {
            alert('Fehler: Bitte navigieren Sie erst zu Einstellungen → Audit-Zertifizierungen verwalten');
            return;
        }

        // Wait a moment for elements to be ready
        setTimeout(() => {
            const typeSelect = document.getElementById('externalAuditType');
            const titleInput = document.getElementById('externalAuditTitle');
            const auditorInput = document.getElementById('externalAuditor');
            const dateInput = document.getElementById('externalAuditDate');
            const statusSelect = document.getElementById('externalAuditStatus');

            console.log('Adding external audit - Field values:', {
                type: typeSelect?.value,
                title: titleInput?.value,
                auditor: auditorInput?.value,
                date: dateInput?.value,
                status: statusSelect?.value
            });

            // Check if elements exist
            if (!typeSelect || !titleInput || !auditorInput || !dateInput || !statusSelect) {
                console.error('Missing form elements:', { typeSelect, titleInput, auditorInput, dateInput, statusSelect });
                alert('Fehler: Formularfelder nicht gefunden. Bitte stellen Sie sicher, dass Sie in den Einstellungen sind.');
                return;
            }

            // Validate required fields with better error messages
            if (!typeSelect.value || typeSelect.value.trim() === '') {
                alert('Bitte wählen Sie einen externen Audit-Typ aus der Dropdown-Liste aus.');
                typeSelect.focus();
                return;
            }

            const titleValue = titleInput.value ? titleInput.value.trim() : '';
            if (!titleValue || titleValue === '') {
                alert('Bitte geben Sie einen Titel/Bezeichnung für das externe Audit ein.');
                titleInput.focus();
                return;
            }

            const auditorValue = auditorInput.value ? auditorInput.value.trim() : '';
            if (!auditorValue || auditorValue === '') {
                alert('Bitte geben Sie den Namen des externen Auditors/der Zertifizierungsstelle ein.');
                auditorInput.focus();
                return;
            }

            if (!dateInput.value || dateInput.value.trim() === '') {
                alert('Bitte wählen Sie ein Datum für das externe Audit aus.');
                dateInput.focus();
                return;
            }

            this.performAddExternalAudit(typeSelect, titleInput, auditorInput, dateInput, statusSelect);
        }, 100);
    }

    performAddExternalAudit(typeSelect, titleInput, auditorInput, dateInput, statusSelect) {
        const fullTitle = `${typeSelect.value} ${titleInput.value.trim()}`;

        const newAudit = {
            id: Date.now(),
            type: typeSelect.value,
            title: fullTitle,
            auditor: auditorInput.value.trim(),
            date: dateInput.value,
            status: statusSelect.value || 'geplant'
        };

        console.log('Creating new external audit:', newAudit);

        if (!this.auditCertifications.externalAudits) {
            this.auditCertifications.externalAudits = [];
        }
        this.auditCertifications.externalAudits.push(newAudit);
        this.saveAuditCertificationsToStorage();
        
        // Clear form
        typeSelect.value = '';
        titleInput.value = '';
        auditorInput.value = '';
        dateInput.value = '';
        statusSelect.value = 'geplant';
        
        this.renderExistingExternalAudits();
        this.renderAuditCertifications();
        this.renderDashboardAudits();
        
        alert('Externes Audit wurde erfolgreich hinzugefügt.');
    }

    renderExistingCertifications() {
        const container = document.getElementById('existingCertifications');
        if (!container) return;

        if (!this.auditCertifications.certifications || this.auditCertifications.certifications.length === 0) {
            container.innerHTML = '<p class="no-content">Keine Zertifizierungen vorhanden.</p>';
            return;
        }

        const certsHtml = this.auditCertifications.certifications.map(cert => `
            <div class="certification-item" data-id="${cert.id}">
                <div class="certification-info">
                    <strong>${cert.name}</strong> - ${cert.validity}
                </div>
                <div class="certification-actions">
                    <button onclick="dashboard.editCertification(${cert.id})" class="btn-secondary btn-sm">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button onclick="dashboard.deleteCertification(${cert.id})" class="btn-danger btn-sm">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = certsHtml;
    }

    renderExistingInternalAudits() {
        const container = document.getElementById('existingInternalAudits');
        if (!container) return;

        if (!this.auditCertifications.internalAudits || this.auditCertifications.internalAudits.length === 0) {
            container.innerHTML = '<p class="no-content">Keine internen Audits vorhanden.</p>';
            return;
        }

        const auditsHtml = this.auditCertifications.internalAudits.map(audit => `
            <div class="audit-item" data-id="${audit.id}">
                <div class="audit-info">
                    <strong>${audit.title}</strong><br>
                    <small>Datum: ${new Date(audit.date).toLocaleDateString('de-DE')} | Status: ${audit.status}</small>
                </div>
                <div class="audit-actions">
                    <button onclick="dashboard.editAuditResults(${audit.id}, 'internal')" class="btn-secondary btn-sm">
                        <i class="fas fa-clipboard-list"></i> Ergebnisse
                    </button>
                    <button onclick="dashboard.editInternalAudit(${audit.id})" class="btn-secondary btn-sm">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button onclick="dashboard.deleteInternalAudit(${audit.id})" class="btn-danger btn-sm">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = auditsHtml;
    }

    renderAuditCertifications() {
        this.renderCertificationsList();
        this.renderInternalAuditsList();
        this.renderExternalAuditsList();
    }

    renderCertificationsList() {
        const container = document.getElementById('certificationsList');
        if (!container) return;

        if (!this.auditCertifications.certifications || this.auditCertifications.certifications.length === 0) {
            container.innerHTML = '<div class="cert-item">Keine Zertifizierungen vorhanden.</div>';
            return;
        }

        const certsHtml = this.auditCertifications.certifications.map(cert => 
            `<div class="cert-item">${cert.name} - ${cert.validity}</div>`
        ).join('');

        container.innerHTML = certsHtml;
    }

    renderInternalAuditsList() {
        const container = document.getElementById('internalAuditsList');
        if (!container) return;

        if (!this.auditCertifications.internalAudits || this.auditCertifications.internalAudits.length === 0) {
            container.innerHTML = '<div class="audit-item">Keine internen Audits vorhanden.</div>';
            return;
        }

        const auditsHtml = this.auditCertifications.internalAudits.map(audit => `
            <div class="audit-item" onclick="dashboard.viewAuditDetails(${audit.id}, 'internal')">
                <span class="audit-type">${audit.title}</span>
                <span class="audit-date">${new Date(audit.date).toLocaleDateString('de-DE')}</span>
                <span class="audit-result audit-${audit.status}">${audit.status}</span>
                ${audit.results ? '<i class="fas fa-file-alt audit-has-results" title="Ergebnisse verfügbar"></i>' : ''}
            </div>
        `).join('');

        container.innerHTML = auditsHtml;
    }

    renderExternalAuditsList() {
        const container = document.getElementById('externalAuditsList');
        if (!container) return;

        if (!this.auditCertifications.externalAudits || this.auditCertifications.externalAudits.length === 0) {
            container.innerHTML = '<div class="audit-item">Keine externen Audits vorhanden.</div>';
            return;
        }

        const auditsHtml = this.auditCertifications.externalAudits.map(audit => `
            <div class="audit-item" onclick="dashboard.viewAuditDetails(${audit.id}, 'external')">
                <span class="audit-type">${audit.title} (${audit.auditor})</span>
                <span class="audit-date">${new Date(audit.date).toLocaleDateString('de-DE')}</span>
                <span class="audit-result audit-${audit.status}">${audit.status}</span>
                ${audit.results ? '<i class="fas fa-file-alt audit-has-results" title="Ergebnisse verfügbar"></i>' : ''}
            </div>
        `).join('');

        container.innerHTML = auditsHtml;
    }

    renderExistingExternalAudits() {
        const container = document.getElementById('existingExternalAudits');
        if (!container) return;

        if (!this.auditCertifications.externalAudits || this.auditCertifications.externalAudits.length === 0) {
            container.innerHTML = '<p class="no-content">Keine externen Audits vorhanden.</p>';
            return;
        }

        const auditsHtml = this.auditCertifications.externalAudits.map(audit => `
            <div class="audit-item" data-id="${audit.id}">
                <div class="audit-info">
                    <strong>${audit.title}</strong> (${audit.auditor})<br>
                    <small>Datum: ${new Date(audit.date).toLocaleDateString('de-DE')} | Status: ${audit.status}</small>
                </div>
                <div class="audit-actions">
                    <button onclick="dashboard.editAuditResults(${audit.id}, 'external')" class="btn-secondary btn-sm">
                        <i class="fas fa-clipboard-list"></i> Ergebnisse
                    </button>
                    <button onclick="dashboard.editExternalAudit(${audit.id})" class="btn-secondary btn-sm">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button onclick="dashboard.deleteExternalAudit(${audit.id})" class="btn-danger btn-sm">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = auditsHtml;
    }

    editCertification(certId) {
        const cert = this.auditCertifications.certifications.find(c => c.id === certId);
        if (!cert) return;

        const newName = prompt('Zertifizierung bearbeiten:', cert.name);
        if (newName === null) return;

        const newValidity = prompt('Gültigkeit bearbeiten:', cert.validity);
        if (newValidity === null) return;

        cert.name = newName.trim();
        cert.validity = newValidity.trim();

        this.renderExistingCertifications();
        this.renderAuditCertifications();
        this.renderDashboardAudits();
    }

    editInternalAudit(auditId) {
        const audit = this.auditCertifications.internalAudits.find(a => a.id === auditId);
        if (!audit) return;

        const newTitle = prompt('Audit-Titel bearbeiten:', audit.title);
        if (newTitle === null) return;

        const newDate = prompt('Datum bearbeiten (YYYY-MM-DD):', audit.date);
        if (newDate === null) return;

        const newStatus = prompt('Status bearbeiten (geplant/durchgeführt/abgeschlossen):', audit.status);
        if (newStatus === null) return;

        audit.title = newTitle.trim();
        audit.date = newDate;
        audit.status = newStatus;

        this.renderExistingInternalAudits();
        this.renderAuditCertifications();
    }

    deleteCertification(certId) {
        if (!confirm('Möchten Sie diese Zertifizierung wirklich löschen?')) return;

        this.auditCertifications.certifications = this.auditCertifications.certifications.filter(c => c.id !== certId);
        this.renderExistingCertifications();
        this.renderAuditCertifications();
        this.renderDashboardAudits();
    }

    deleteInternalAudit(auditId) {
        if (!confirm('Möchten Sie dieses interne Audit wirklich löschen?')) return;

        this.auditCertifications.internalAudits = this.auditCertifications.internalAudits.filter(a => a.id !== auditId);
        this.renderExistingInternalAudits();
        this.renderAuditCertifications();
    }

    saveAuditCertifications() {
        this.saveAuditCertificationsToStorage();
        alert('Audit-Zertifizierungen wurden erfolgreich gespeichert.');
    }

    resetAuditCertifications() {
        this.auditCertifications = {
            certifications: [
                { id: 1, name: 'ISO 9001:2015', validity: 'Gültig bis 12/2025' },
                { id: 2, name: 'ISO 14001:2015', validity: 'Gültig bis 03/2026' },
                { id: 3, name: 'OHSAS 18001', validity: 'Erneuerung 04/2024' }
            ],
            internalAudits: [
                { id: 1, type: 'Qualitätsaudit', title: 'Qualitätsaudit Q2 2024', date: '2024-06-15', status: 'abgeschlossen', 
                  results: { findings: 'Verbesserungen in der Dokumentation erforderlich', actions: 'Überarbeitung der Arbeitsanweisungen', score: 'Gut', notes: 'Nächstes Audit in 6 Monaten' } },
                { id: 2, type: 'Umweltaudit', title: 'Umweltaudit Q3 2024', date: '2024-08-20', status: 'geplant' }
            ],
            externalAudits: [
                { id: 1, type: 'ISO 9001 Zertifizierung', title: 'ISO 9001 Zertifizierung Überwachungsaudit', auditor: 'TÜV Rheinland', date: '2024-05-10', status: 'bestanden',
                  results: { findings: 'Alle Anforderungen erfüllt', actions: 'Kontinuierliche Verbesserung empfohlen', score: 'Bestanden', notes: 'Zertifikat gültig bis 2027' } },
                { id: 2, type: 'ISO 14001 Zertifizierung', title: 'ISO 14001 Zertifizierung Rezertifizierung', auditor: 'TÜV Nord', date: '2024-09-15', status: 'geplant' }
            ]
        };
        
        this.saveAuditCertificationsToStorage();
        this.loadAuditCertificationsToSettings();
        this.renderAuditCertifications();
        
        alert('Audit-Zertifizierungen wurden auf Standardwerte zurückgesetzt.');
    }

    // Audit Results Management
    editAuditResults(auditId, type) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'root-admin') {
            alert('Sie haben keine Berechtigung zum Bearbeiten von Audit-Ergebnissen. Nur der System-Administrator kann Ergebnisse bearbeiten.');
            return;
        }

        const audits = type === 'internal' ? this.auditCertifications.internalAudits : this.auditCertifications.externalAudits;
        const audit = audits.find(a => a.id === auditId);
        if (!audit) return;

        this.currentEditingAudit = { audit, type };
        this.showAuditResultsModal(audit);
    }

    showAuditResultsModal(audit) {
        console.log('Opening audit results modal for:', audit.title);
        
        const modal = document.getElementById('auditResultsModal');
        const title = document.getElementById('auditResultsTitle');
        const findingsInput = document.getElementById('auditResultsFindings');
        const actionsInput = document.getElementById('auditResultsActions');
        const scoreInput = document.getElementById('auditResultsScore');
        const notesInput = document.getElementById('auditResultsNotes');

        console.log('Modal elements:', { modal, title, findingsInput, actionsInput, scoreInput, notesInput });

        if (!modal) {
            console.error('Modal not found!');
            alert('Fehler: Modal konnte nicht gefunden werden.');
            return;
        }

        if (!title) {
            console.error('Title element not found!');
            return;
        }

        title.textContent = `Audit Ergebnisse - ${audit.title}`;

        // Load existing results if available
        if (audit.results) {
            console.log('Loading existing results:', audit.results);
            if (findingsInput) findingsInput.value = audit.results.findings || '';
            if (actionsInput) actionsInput.value = audit.results.actions || '';
            if (scoreInput) scoreInput.value = audit.results.score || '';
            if (notesInput) notesInput.value = audit.results.notes || '';
        } else {
            console.log('No existing results, clearing fields');
            if (findingsInput) findingsInput.value = '';
            if (actionsInput) actionsInput.value = '';
            if (scoreInput) scoreInput.value = '';
            if (notesInput) notesInput.value = '';
        }

        modal.style.display = 'block';
        console.log('Modal should now be visible');

        // Focus on first input field
        if (findingsInput) {
            setTimeout(() => findingsInput.focus(), 100);
        }
    }

    saveAuditResults() {
        if (!this.currentEditingAudit) return;

        const findingsInput = document.getElementById('auditResultsFindings');
        const actionsInput = document.getElementById('auditResultsActions');
        const scoreInput = document.getElementById('auditResultsScore');
        const notesInput = document.getElementById('auditResultsNotes');

        const results = {
            findings: findingsInput?.value || '',
            actions: actionsInput?.value || '',
            score: scoreInput?.value || '',
            notes: notesInput?.value || ''
        };

        this.currentEditingAudit.audit.results = results;
        this.saveAuditCertificationsToStorage();
        
        // Re-render displays
        this.renderAuditCertifications();
        if (this.currentEditingAudit.type === 'internal') {
            this.renderExistingInternalAudits();
        } else {
            this.renderExistingExternalAudits();
        }

        // Close modal
        document.getElementById('auditResultsModal').style.display = 'none';
        this.currentEditingAudit = null;

        alert('Audit-Ergebnisse wurden erfolgreich gespeichert.');
    }

    viewAuditDetails(auditId, type) {
        const audits = type === 'internal' ? this.auditCertifications.internalAudits : this.auditCertifications.externalAudits;
        const audit = audits.find(a => a.id === auditId);
        if (!audit || !audit.results) {
            alert('Keine Ergebnisse für dieses Audit verfügbar.');
            return;
        }

        let details = `Audit: ${audit.title}\n`;
        details += `Datum: ${new Date(audit.date).toLocaleDateString('de-DE')}\n`;
        details += `Status: ${audit.status}\n\n`;
        
        if (audit.results.findings) details += `Befunde: ${audit.results.findings}\n\n`;
        if (audit.results.actions) details += `Maßnahmen: ${audit.results.actions}\n\n`;
        if (audit.results.score) details += `Bewertung: ${audit.results.score}\n\n`;
        if (audit.results.notes) details += `Notizen: ${audit.results.notes}`;

        alert(details);
    }

    editExternalAudit(auditId) {
        const audit = this.auditCertifications.externalAudits.find(a => a.id === auditId);
        if (!audit) return;

        const newTitle = prompt('Audit-Titel bearbeiten:', audit.title);
        if (newTitle === null) return;

        const newAuditor = prompt('Auditor bearbeiten:', audit.auditor);
        if (newAuditor === null) return;

        const newDate = prompt('Datum bearbeiten (YYYY-MM-DD):', audit.date);
        if (newDate === null) return;

        const newStatus = prompt('Status bearbeiten (geplant/durchgeführt/bestanden/nachbesserung):', audit.status);
        if (newStatus === null) return;

        audit.title = newTitle.trim();
        audit.auditor = newAuditor.trim();
        audit.date = newDate;
        audit.status = newStatus;

        this.renderExistingExternalAudits();
        this.renderAuditCertifications();
    }

    deleteExternalAudit(auditId) {
        if (!confirm('Möchten Sie dieses externe Audit wirklich löschen?')) return;

        this.auditCertifications.externalAudits = this.auditCertifications.externalAudits.filter(a => a.id !== auditId);
        this.renderExistingExternalAudits();
        this.renderAuditCertifications();
    }

    debugAuditForms() {
        console.log('=== AUDIT FORMS DEBUG ===');
        
        // Check all form fields
        const fields = [
            'internalAuditType',
            'internalAuditTitle', 
            'internalAuditDate',
            'internalAuditStatus',
            'externalAuditType',
            'externalAuditTitle',
            'externalAuditor',
            'externalAuditDate',
            'externalAuditStatus'
        ];

        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            console.log(`${fieldId}:`, {
                exists: !!element,
                element: element,
                value: element?.value,
                type: element?.type,
                tagName: element?.tagName
            });
        });

        // List all inputs in the settings section
        const settingsSection = document.getElementById('einstellungen-section');
        if (settingsSection) {
            const allInputs = settingsSection.querySelectorAll('input, select, textarea');
            console.log('All inputs in settings section:', Array.from(allInputs).map(input => ({
                id: input.id,
                name: input.name,
                type: input.type,
                tagName: input.tagName,
                value: input.value
            })));
        }

        alert('Debug-Informationen wurden in die Konsole ausgegeben. Öffnen Sie die Entwicklertools (F12).');
    }

    // ====================================================================
    // HAZARDOUS SUBSTANCES MODULE METHODS
    // ====================================================================

    loadHazardousSubstancesFromStorage() {
        try {
            const stored = localStorage.getItem('qhse_hazardous_substances');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading hazardous substances:', error);
            return [];
        }
    }

    saveHazardousSubstancesToStorage() {
        try {
            const dataToSave = JSON.stringify(this.hazardousSubstances);
            const sizeInMB = (new Blob([dataToSave]).size / 1024 / 1024).toFixed(2);
            
            console.log(`Attempting to save ${sizeInMB}MB of hazardous substances data`);
            
            localStorage.setItem('qhse_hazardous_substances', dataToSave);
            console.log('Hazardous substances saved successfully');
        } catch (error) {
            console.error('Error saving hazardous substances:', error);
            
            if (error.name === 'QuotaExceededError') {
                alert(`Speicher-Limit erreicht! Die Daten sind zu groß für den lokalen Speicher.\n\nTipps:\n• Verwenden Sie kleinere PDF-Dateien (max. 5MB)\n• Entfernen Sie nicht benötigte Dokumente\n• Komprimieren Sie PDFs vor dem Upload`);
                
                // Try to show storage usage
                this.showStorageUsage();
            } else {
                alert('Fehler beim Speichern der Gefahrstoff-Daten: ' + error.message);
            }
            
            throw error; // Re-throw to handle in calling code
        }
    }
    
    showStorageUsage() {
        try {
            let totalSize = 0;
            let details = [];
            
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const value = localStorage[key];
                    const size = new Blob([value]).size;
                    totalSize += size;
                    
                    if (key.startsWith('qhse_')) {
                        details.push(`${key}: ${(size / 1024).toFixed(1)} KB`);
                    }
                }
            }
            
            const totalMB = (totalSize / 1024 / 1024).toFixed(2);
            
            console.log('localStorage Usage:');
            console.log(`Total: ${totalMB} MB`);
            details.forEach(detail => console.log(detail));
            
            // Show approximate limits (varies by browser, typically 5-10MB)
            if (totalSize > 8 * 1024 * 1024) { // 8MB warning
                console.warn('Approaching localStorage limit!');
            }
            
            // Optional: Show storage manager button in console
            if (totalSize > 5 * 1024 * 1024) { // 5MB
                console.log('Run dashboard.showStorageManager() to clean up storage');
            }
        } catch (error) {
            console.error('Error calculating storage usage:', error);
        }
    }
    
    showStorageManager() {
        const modal = window.document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-database"></i> Speicher-Verwaltung</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="storage-info">
                        <h3>Aktuelle Speichernutzung</h3>
                        <div id="storageBreakdown"></div>
                    </div>
                    <div class="storage-actions">
                        <h3>Speicher freigeben</h3>
                        <button id="clearOldDocuments" class="btn-secondary">
                            <i class="fas fa-trash"></i> Alte Dokumente entfernen (>30 Tage)
                        </button>
                        <button id="compressData" class="btn-secondary">
                            <i class="fas fa-compress"></i> Daten komprimieren
                        </button>
                        <button id="exportData" class="btn-primary">
                            <i class="fas fa-download"></i> Daten exportieren & löschen
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        window.document.body.appendChild(modal);
        
        // Populate storage breakdown
        this.updateStorageBreakdown();
        
        // Event listeners
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            window.document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                window.document.body.removeChild(modal);
            }
        });
        
        modal.style.display = 'block';
    }
    
    updateStorageBreakdown() {
        const container = window.document.getElementById('storageBreakdown');
        if (!container) return;
        
        let html = '<div class="storage-items">';
        let totalSize = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('qhse_')) {
                const value = localStorage[key];
                const size = new Blob([value]).size;
                const sizeMB = (size / 1024 / 1024).toFixed(2);
                totalSize += size;
                
                html += `
                    <div class="storage-item">
                        <div class="storage-item-name">${key.replace('qhse_', '')}</div>
                        <div class="storage-item-size">${sizeMB} MB</div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        html += `<div class="storage-total">Gesamt: ${(totalSize / 1024 / 1024).toFixed(2)} MB</div>`;
        
        container.innerHTML = html;
    }

    setupHazardousSubstances() {
        // Setup event listeners
        this.setupSubstanceEventListeners();
        
        // Initialize UI
        this.populateSubstanceDepartmentDropdowns();
        this.renderSubstancesList();
        this.updateSubstanceStatistics();
        
        // Setup form tabs
        this.setupSubstanceFormTabs();
        
        // Setup file uploads
        this.setupSubstanceFileUploads();
    }

    setupSubstanceEventListeners() {
        // Main action buttons
        const addSubstanceBtn = document.getElementById('addSubstanceBtn');
        const substanceReportsBtn = document.getElementById('substanceReportsBtn');
        
        if (addSubstanceBtn) {
            addSubstanceBtn.addEventListener('click', () => this.openSubstanceModal());
        }
        
        if (substanceReportsBtn) {
            console.log('🧪 DEBUGGING: Setting up reports button listener');
            substanceReportsBtn.addEventListener('click', () => {
                console.log('🧪 DEBUGGING: Reports button clicked!');
                this.openSubstanceReports();
            });
        } else {
            console.error('🧪 DEBUGGING: substanceReportsBtn not found in DOM!');
        }

        // Search and filter controls
        const substanceSearch = document.getElementById('substanceSearch');
        const hazardClassFilter = document.getElementById('hazardClassFilter');
        const departmentFilter = document.getElementById('departmentFilter');
        const storageLocationFilter = document.getElementById('storageLocationFilter');
        const clearSearchBtn = document.getElementById('clearSearchBtn');

        if (substanceSearch) {
            substanceSearch.addEventListener('input', () => this.filterSubstances());
        }

        if (hazardClassFilter) {
            hazardClassFilter.addEventListener('change', () => this.filterSubstances());
        }

        if (departmentFilter) {
            departmentFilter.addEventListener('change', () => this.filterSubstances());
        }

        if (storageLocationFilter) {
            storageLocationFilter.addEventListener('change', () => this.filterSubstances());
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => this.clearSubstanceFilters());
        }

        // Modal event listeners
        this.setupSubstanceModalListeners();
    }

    setupSubstanceModalListeners() {
        // Substance Modal
        const substanceModal = document.getElementById('substanceModal');
        const closeSubstanceModal = document.getElementById('closeSubstanceModal');
        const saveSubstanceBtn = document.getElementById('saveSubstanceBtn');
        const cancelSubstanceBtn = document.getElementById('cancelSubstanceBtn');

        if (closeSubstanceModal) {
            closeSubstanceModal.addEventListener('click', () => this.closeSubstanceModal());
        }

        if (saveSubstanceBtn) {
            saveSubstanceBtn.addEventListener('click', () => this.saveSubstance());
        }

        if (cancelSubstanceBtn) {
            cancelSubstanceBtn.addEventListener('click', () => this.closeSubstanceModal());
        }

        // Details Modal
        const substanceDetailsModal = document.getElementById('substanceDetailsModal');
        const closeSubstanceDetailsModal = document.getElementById('closeSubstanceDetailsModal');
        const editSubstanceBtn = document.getElementById('editSubstanceBtn');
        const closeSubstanceDetailsBtn = document.getElementById('closeSubstanceDetailsBtn');

        if (closeSubstanceDetailsModal) {
            closeSubstanceDetailsModal.addEventListener('click', () => this.closeSubstanceDetailsModal());
        }

        if (editSubstanceBtn) {
            editSubstanceBtn.addEventListener('click', () => this.editCurrentSubstance());
        }

        if (closeSubstanceDetailsBtn) {
            closeSubstanceDetailsBtn.addEventListener('click', () => this.closeSubstanceDetailsModal());
        }

        // Close modals on outside click
        if (substanceModal) {
            substanceModal.addEventListener('click', (e) => {
                if (e.target === substanceModal) {
                    this.closeSubstanceModal();
                }
            });
        }

        if (substanceDetailsModal) {
            substanceDetailsModal.addEventListener('click', (e) => {
                if (e.target === substanceDetailsModal) {
                    this.closeSubstanceDetailsModal();
                }
            });
        }

        // Comments functionality
        const addCommentBtn = document.getElementById('addCommentBtn');
        if (addCommentBtn) {
            addCommentBtn.addEventListener('click', () => this.addSubstanceComment());
        }
    }

    setupSubstanceFormTabs() {
        const substanceModal = document.getElementById('substanceModal');
        if (!substanceModal) return;

        const tabButtons = substanceModal.querySelectorAll('.tab-btn');
        const tabContents = substanceModal.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Update active tab button
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => {
                    content.classList.toggle('active', content.getAttribute('data-tab') === targetTab);
                });
            });
        });
    }

    setupSubstanceFileUploads() {
        // SDS File Upload
        const sdsFile = document.getElementById('sdsFile');
        if (sdsFile) {
            sdsFile.addEventListener('change', (e) => this.handleFileUpload(e, 'sds'));
        }

        // Operating Instruction File Upload
        const operatingInstructionFile = document.getElementById('operatingInstructionFile');
        if (operatingInstructionFile) {
            operatingInstructionFile.addEventListener('change', (e) => this.handleFileUpload(e, 'operatingInstruction'));
        }

        // Additional Documents File Upload
        const additionalDocsFile = document.getElementById('additionalDocsFile');
        if (additionalDocsFile) {
            additionalDocsFile.addEventListener('change', (e) => this.handleFileUpload(e, 'additional'));
        }

        // Setup drag and drop for file upload areas
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const uploadAreas = document.querySelectorAll('.file-upload-area');
        
        uploadAreas.forEach(area => {
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('drag-over');
            });

            area.addEventListener('dragleave', () => {
                area.classList.remove('drag-over');
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const uploadType = area.id.includes('sds') ? 'sds' : 
                                     area.id.includes('operatingInstruction') ? 'operatingInstruction' : 'additional';
                    this.handleDroppedFiles(files, uploadType);
                }
            });
        });
    }

    populateSubstanceDepartmentDropdowns() {
        const departmentSelect = document.getElementById('substanceDepartment');
        const departmentFilter = document.getElementById('departmentFilter');
        
        if (departmentSelect) {
            departmentSelect.innerHTML = '<option value="">Abteilung wählen</option>';
            this.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });
        }

        if (departmentFilter) {
            // Keep existing "Alle Abteilungen" option and add departments
            const existingOptions = departmentFilter.innerHTML;
            if (!existingOptions.includes('option')) {
                departmentFilter.innerHTML = '<option value="">Alle Abteilungen</option>';
            }
            
            this.departments.forEach(dept => {
                if (!departmentFilter.querySelector(`option[value="${dept.id}"]`)) {
                    const option = document.createElement('option');
                    option.value = dept.id;
                    option.textContent = dept.name;
                    departmentFilter.appendChild(option);
                }
            });
        }
    }

    renderSubstancesList() {
        const tableBody = document.getElementById('substanceTableBody');
        const noSubstancesMessage = document.getElementById('noSubstancesMessage');
        
        if (!tableBody) return;

        // Apply current filters
        const filteredSubstances = this.getFilteredSubstances();

        if (filteredSubstances.length === 0) {
            tableBody.innerHTML = '';
            if (noSubstancesMessage) {
                noSubstancesMessage.style.display = 'block';
            }
            return;
        }

        if (noSubstancesMessage) {
            noSubstancesMessage.style.display = 'none';
        }

        tableBody.innerHTML = filteredSubstances.map(substance => `
            <tr data-substance-id="${substance.id}">
                <td>
                    <strong>${substance.name || 'Unbekannt'}</strong>
                    ${substance.casNumber ? `<br><small>CAS: ${substance.casNumber}</small>` : ''}
                </td>
                <td>${substance.casNumber || '-'}</td>
                <td>${substance.supplier || '-'}</td>
                <td>${this.getDepartmentName(substance.department) || '-'}</td>
                <td>${substance.storageLocation || '-'}</td>
                <td>
                    <div class="hazard-symbols">
                        ${this.renderHazardSymbols(substance.ghsSymbols)}
                    </div>
                </td>
                <td>${substance.lastUpdated ? new Date(substance.lastUpdated).toLocaleDateString('de-DE') : '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="window.qhseDashboard.viewSubstanceDetails('${substance.id}')" title="Details anzeigen">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="window.qhseDashboard.editSubstance('${substance.id}')" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon danger" onclick="window.qhseDashboard.deleteSubstance('${substance.id}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Update storage locations filter
        this.updateStorageLocationFilter();
    }

    renderHazardSymbols(symbols) {
        if (!symbols || symbols.length === 0) return '-';
        
        const symbolMap = {
            'GHS01': '💥',
            'GHS02': '🔥',
            'GHS03': '⭕',
            'GHS04': '⚗️',
            'GHS05': '🧪',
            'GHS06': '☠️',
            'GHS07': '❗',
            'GHS08': '⚕️',
            'GHS09': '🌍'
        };

        return symbols.map(symbol => 
            `<span class="hazard-symbol" title="${symbol}">${symbolMap[symbol] || symbol}</span>`
        ).join('');
    }

    getFilteredSubstances() {
        let filtered = [...this.hazardousSubstances];

        // Apply search filter
        const searchTerm = document.getElementById('substanceSearch')?.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(substance => 
                (substance.name && substance.name.toLowerCase().includes(searchTerm)) ||
                (substance.casNumber && substance.casNumber.toLowerCase().includes(searchTerm)) ||
                (substance.supplier && substance.supplier.toLowerCase().includes(searchTerm)) ||
                (substance.purpose && substance.purpose.toLowerCase().includes(searchTerm))
            );
        }

        // Apply hazard class filter
        const hazardClass = document.getElementById('hazardClassFilter')?.value;
        if (hazardClass) {
            filtered = filtered.filter(substance => {
                const symbols = substance.ghsSymbols || [];
                switch (hazardClass) {
                    case 'explosive': return symbols.includes('GHS01');
                    case 'flammable': return symbols.includes('GHS02') || symbols.includes('GHS03');
                    case 'toxic': return symbols.includes('GHS06');
                    case 'corrosive': return symbols.includes('GHS05');
                    case 'environmental': return symbols.includes('GHS09');
                    case 'health': return symbols.includes('GHS08') || symbols.includes('GHS07');
                    default: return true;
                }
            });
        }

        // Apply department filter
        const department = document.getElementById('departmentFilter')?.value;
        if (department) {
            filtered = filtered.filter(substance => substance.department === department);
        }

        // Apply storage location filter
        const storageLocation = document.getElementById('storageLocationFilter')?.value;
        if (storageLocation) {
            filtered = filtered.filter(substance => 
                substance.storageLocation && substance.storageLocation.includes(storageLocation)
            );
        }

        return filtered;
    }

    updateStorageLocationFilter() {
        const filter = document.getElementById('storageLocationFilter');
        if (!filter) return;

        // Get unique storage locations
        const locations = [...new Set(this.hazardousSubstances
            .map(s => s.storageLocation)
            .filter(location => location && location.trim())
        )].sort();

        // Keep the "Alle Lagerorte" option
        const currentValue = filter.value;
        filter.innerHTML = '<option value="">Alle Lagerorte</option>';
        
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            filter.appendChild(option);
        });

        // Restore selected value if it still exists
        if (currentValue && locations.includes(currentValue)) {
            filter.value = currentValue;
        }
    }

    updateSubstanceStatistics() {
        const totalSubstances = document.getElementById('totalSubstances');
        const highRiskSubstances = document.getElementById('highRiskSubstances');
        const expiredSDS = document.getElementById('expiredSDS');
        const storageLocations = document.getElementById('storageLocations');

        if (totalSubstances) {
            totalSubstances.textContent = this.hazardousSubstances.length;
        }

        if (highRiskSubstances) {
            const highRisk = this.hazardousSubstances.filter(substance => {
                const symbols = substance.ghsSymbols || [];
                return symbols.includes('GHS06') || symbols.includes('GHS08') || symbols.includes('GHS01');
            }).length;
            highRiskSubstances.textContent = highRisk;
        }

        if (expiredSDS) {
            const threeYearsAgo = new Date();
            threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
            
            const expired = this.hazardousSubstances.filter(substance => {
                if (!substance.sdsUploadDate) return true; // No SDS date = consider expired
                return new Date(substance.sdsUploadDate) < threeYearsAgo;
            }).length;
            expiredSDS.textContent = expired;
        }

        if (storageLocations) {
            const uniqueLocations = new Set(this.hazardousSubstances
                .map(s => s.storageLocation)
                .filter(location => location && location.trim())
            );
            storageLocations.textContent = uniqueLocations.size;
        }
    }

    filterSubstances() {
        this.renderSubstancesList();
    }

    clearSubstanceFilters() {
        document.getElementById('substanceSearch').value = '';
        document.getElementById('hazardClassFilter').value = '';
        document.getElementById('departmentFilter').value = '';
        document.getElementById('storageLocationFilter').value = '';
        this.renderSubstancesList();
    }

    openSubstanceModal(substanceId = null) {
        const modal = document.getElementById('substanceModal');
        const modalTitle = document.getElementById('substanceModalTitle');
        
        if (!modal) return;

        // Reset form
        this.resetSubstanceForm();
        
        if (substanceId) {
            // Edit mode
            const substance = this.hazardousSubstances.find(s => s.id === substanceId);
            if (substance) {
                this.populateSubstanceForm(substance);
                modalTitle.innerHTML = '<i class="fas fa-flask"></i> Gefahrstoff bearbeiten';
                this.currentEditingSubstanceId = substanceId;
            }
        } else {
            // Create mode
            modalTitle.innerHTML = '<i class="fas fa-flask"></i> Neuer Gefahrstoff';
            this.currentEditingSubstanceId = null;
        }

        modal.style.display = 'block';
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('substanceName')?.focus();
        }, 100);
    }

    closeSubstanceModal() {
        const modal = document.getElementById('substanceModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEditingSubstanceId = null;
    }

    resetSubstanceForm() {
        const form = document.getElementById('substanceForm');
        if (form) {
            form.reset();
        }

        // Reset checkboxes
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);

        // Reset uploaded documents display
        const uploadedDocs = document.getElementById('uploadedDocuments');
        if (uploadedDocs) {
            uploadedDocs.innerHTML = '';
        }

        // Reset comments
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            commentsList.innerHTML = '';
        }

        // Reset to first tab
        const firstTabBtn = document.querySelector('.tab-btn[data-tab="basic"]');
        const firstTabContent = document.querySelector('.tab-content[data-tab="basic"]');
        
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        if (firstTabBtn) firstTabBtn.classList.add('active');
        if (firstTabContent) firstTabContent.classList.add('active');
    }

    populateSubstanceForm(substance) {
        // Basic information
        this.setFormValue('substanceName', substance.name);
        this.setFormValue('casNumber', substance.casNumber);
        this.setFormValue('ecNumber', substance.ecNumber);
        this.setFormValue('supplier', substance.supplier);
        this.setFormValue('purpose', substance.purpose);
        this.setFormValue('substanceDepartment', substance.department);

        // Classification
        if (substance.ghsSymbols) {
            substance.ghsSymbols.forEach(symbol => {
                const checkbox = document.querySelector(`input[name="ghsSymbols"][value="${symbol}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        this.setFormValue('signalWord', substance.signalWord);
        this.setFormValue('hPhrases', substance.hPhrases);
        this.setFormValue('pPhrases', substance.pPhrases);
        this.setFormValue('wgkClass', substance.wgkClass);

        // Storage
        this.setFormValue('storageAmount', substance.storageAmount);
        this.setFormValue('storageLocation', substance.storageLocation);
        this.setFormValue('storageClass', substance.storageClass);
        this.setFormValue('storageTemperature', substance.storageTemperature);
        this.setFormValue('ventilationRequired', substance.ventilationRequired);
        this.setFormValue('incompatibilities', substance.incompatibilities);

        // Safety
        if (substance.requiredPPE) {
            substance.requiredPPE.forEach(ppe => {
                const checkbox = document.querySelector(`input[name="ppe"][value="${ppe}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        this.setFormValue('workplaceLimit', substance.workplaceLimit);
        this.setFormValue('usageInstructions', substance.usageInstructions);
        this.setFormValue('emergencyMeasures', substance.emergencyMeasures);
        this.setFormValue('riskAssessmentRequired', substance.riskAssessmentRequired);
        this.setFormValue('substitutionCheck', substance.substitutionCheck);

        // Documents and comments
        this.displayUploadedDocuments(substance.documents);
        this.displaySubstanceComments(substance.comments);
    }

    setFormValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element && value !== undefined && value !== null) {
            element.value = value;
        }
    }

    saveSubstance() {
        const form = document.getElementById('substanceForm');
        if (!form) return;

        // Validate required fields
        const substanceName = document.getElementById('substanceName').value.trim();
        if (!substanceName) {
            alert('Bitte geben Sie einen Namen für den Gefahrstoff ein.');
            return;
        }

        // Collect form data
        const substanceData = this.collectSubstanceFormData();
        
        if (this.currentEditingSubstanceId) {
            // Update existing substance
            const index = this.hazardousSubstances.findIndex(s => s.id === this.currentEditingSubstanceId);
            if (index !== -1) {
                substanceData.id = this.currentEditingSubstanceId;
                substanceData.createdAt = this.hazardousSubstances[index].createdAt;
                substanceData.createdBy = this.hazardousSubstances[index].createdBy;
                substanceData.lastUpdated = new Date().toISOString();
                substanceData.lastUpdatedBy = this.getCurrentUser().id;
                
                this.hazardousSubstances[index] = substanceData;
            }
        } else {
            // Create new substance
            substanceData.id = 'substance_' + Date.now();
            substanceData.createdAt = new Date().toISOString();
            substanceData.createdBy = this.getCurrentUser().id;
            substanceData.lastUpdated = substanceData.createdAt;
            substanceData.lastUpdatedBy = substanceData.createdBy;
            
            this.hazardousSubstances.push(substanceData);
        }

        // Save to storage
        try {
            this.saveHazardousSubstancesToStorage();
            
            // Update UI only if save was successful
            this.renderSubstancesList();
            this.updateSubstanceStatistics();
            
            // Close modal
            this.closeSubstanceModal();
            
            // Show success message
            alert('Gefahrstoff wurde erfolgreich gespeichert.');
        } catch (error) {
            // Handle save failure - don't close modal, let user try again
            console.error('Failed to save substance:', error);
            
            if (error.name === 'QuotaExceededError') {
                // User already got alert from saveHazardousSubstancesToStorage
                // Don't close modal so they can remove documents or try again
                console.log('Save failed due to quota exceeded - keeping modal open');
            } else {
                alert('Fehler beim Speichern des Gefahrstoffs. Bitte versuchen Sie es erneut.');
            }
        }
    }

    collectSubstanceFormData() {
        const data = {};

        // Basic information
        data.name = document.getElementById('substanceName').value.trim();
        data.casNumber = document.getElementById('casNumber').value.trim();
        data.ecNumber = document.getElementById('ecNumber').value.trim();
        data.supplier = document.getElementById('supplier').value.trim();
        data.purpose = document.getElementById('purpose').value.trim();
        data.department = document.getElementById('substanceDepartment').value;

        // Classification
        data.ghsSymbols = Array.from(document.querySelectorAll('input[name="ghsSymbols"]:checked'))
            .map(cb => cb.value);
        data.signalWord = document.getElementById('signalWord').value;
        data.hPhrases = document.getElementById('hPhrases').value.trim();
        data.pPhrases = document.getElementById('pPhrases').value.trim();
        data.wgkClass = document.getElementById('wgkClass').value;

        // Storage
        data.storageAmount = document.getElementById('storageAmount').value.trim();
        data.storageLocation = document.getElementById('storageLocation').value.trim();
        data.storageClass = document.getElementById('storageClass').value;
        data.storageTemperature = document.getElementById('storageTemperature').value.trim();
        data.ventilationRequired = document.getElementById('ventilationRequired').value;
        data.incompatibilities = document.getElementById('incompatibilities').value.trim();

        // Safety
        data.requiredPPE = Array.from(document.querySelectorAll('input[name="ppe"]:checked'))
            .map(cb => cb.value);
        data.workplaceLimit = document.getElementById('workplaceLimit').value.trim();
        data.usageInstructions = document.getElementById('usageInstructions').value.trim();
        data.emergencyMeasures = document.getElementById('emergencyMeasures').value.trim();
        data.riskAssessmentRequired = document.getElementById('riskAssessmentRequired').value;
        data.substitutionCheck = document.getElementById('substitutionCheck').value;

        // Documents (handled separately in file upload methods)
        data.documents = this.currentSubstanceDocuments || [];
        
        // Comments (handled separately)
        data.comments = this.currentSubstanceComments || [];

        return data;
    }

    editSubstance(substanceId) {
        this.openSubstanceModal(substanceId);
    }

    viewSubstanceDetails(substanceId) {
        const substance = this.hazardousSubstances.find(s => s.id === substanceId);
        if (!substance) {
            alert('Gefahrstoff nicht gefunden.');
            return;
        }

        const modal = document.getElementById('substanceDetailsModal');
        const title = document.getElementById('substanceDetailsTitle');
        const content = document.getElementById('substanceDetailsContent');
        
        if (!modal || !content) return;

        // Set title
        title.innerHTML = `<i class="fas fa-flask"></i> ${substance.name || 'Unbekannter Gefahrstoff'}`;
        
        // Generate detailed content
        content.innerHTML = this.generateSubstanceDetailsHTML(substance);
        
        // Setup tab functionality for details modal
        setTimeout(() => {
            this.setupDetailsModalTabs();
        }, 100);
        
        // Store current substance for editing
        this.currentViewingSubstanceId = substanceId;
        
        // Show modal
        modal.style.display = 'block';
    }

    generateSubstanceDetailsHTML(substance) {
        return `
            <div class="substance-details">
                <div class="detail-tabs">
                    <div class="tab-buttons">
                        <button class="tab-btn active" data-tab="overview">Übersicht</button>
                        <button class="tab-btn" data-tab="classification">Klassifizierung</button>
                        <button class="tab-btn" data-tab="storage">Lagerung</button>
                        <button class="tab-btn" data-tab="safety">Sicherheit</button>
                        <button class="tab-btn" data-tab="documents">Dokumente</button>
                    </div>
                    
                    <div class="tab-content active" data-tab="overview">
                        ${this.generateOverviewTab(substance)}
                    </div>
                    
                    <div class="tab-content" data-tab="classification">
                        ${this.generateClassificationTab(substance)}
                    </div>
                    
                    <div class="tab-content" data-tab="storage">
                        ${this.generateStorageTab(substance)}
                    </div>
                    
                    <div class="tab-content" data-tab="safety">
                        ${this.generateSafetyTab(substance)}
                    </div>
                    
                    <div class="tab-content" data-tab="documents">
                        ${this.generateDocumentsTab(substance)}
                    </div>
                </div>
            </div>
        `;
    }

    generateOverviewTab(substance) {
        return `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Name:</label>
                    <span>${substance.name || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>CAS-Nummer:</label>
                    <span>${substance.casNumber || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>EG-Nummer:</label>
                    <span>${substance.ecNumber || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>Hersteller:</label>
                    <span>${substance.supplier || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>Abteilung:</label>
                    <span>${this.getDepartmentName(substance.department) || 'Nicht zugeordnet'}</span>
                </div>
                <div class="detail-item">
                    <label>Verwendungszweck:</label>
                    <span>${substance.purpose || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>Erstellt am:</label>
                    <span>${substance.createdAt ? new Date(substance.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}</span>
                </div>
                <div class="detail-item">
                    <label>Zuletzt aktualisiert:</label>
                    <span>${substance.lastUpdated ? new Date(substance.lastUpdated).toLocaleDateString('de-DE') : 'Unbekannt'}</span>
                </div>
            </div>
        `;
    }

    generateClassificationTab(substance) {
        const ghsSymbolsHTML = substance.ghsSymbols && substance.ghsSymbols.length > 0 
            ? substance.ghsSymbols.map(symbol => 
                `<span class="ghs-symbol">${this.renderHazardSymbols([symbol])}</span>`
              ).join('')
            : 'Keine Gefahrensymbole definiert';

        return `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>GHS-Piktogramme:</label>
                    <div class="ghs-symbols-display">${ghsSymbolsHTML}</div>
                </div>
                <div class="detail-item">
                    <label>Signalwort:</label>
                    <span class="signal-word ${substance.signalWord?.toLowerCase()}">${substance.signalWord || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>H-Sätze:</label>
                    <span>${substance.hPhrases || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>P-Sätze:</label>
                    <span>${substance.pPhrases || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>WGK-Klassifizierung:</label>
                    <span>${substance.wgkClass || 'Nicht angegeben'}</span>
                </div>
            </div>
        `;
    }

    generateStorageTab(substance) {
        return `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Lagermenge:</label>
                    <span>${substance.storageAmount || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>Lagerort:</label>
                    <span>${substance.storageLocation || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>Lagerklasse:</label>
                    <span>${substance.storageClass || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>Lagertemperatur:</label>
                    <span>${substance.storageTemperature || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>Lüftungspflicht:</label>
                    <span>${substance.ventilationRequired || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item full-width">
                    <label>Unverträglichkeiten:</label>
                    <span>${substance.incompatibilities || 'Keine angegeben'}</span>
                </div>
            </div>
        `;
    }

    generateSafetyTab(substance) {
        const ppeHTML = substance.requiredPPE && substance.requiredPPE.length > 0
            ? substance.requiredPPE.map(ppe => {
                const ppeNames = {
                    'gloves': 'Schutzhandschuhe',
                    'goggles': 'Schutzbrille',
                    'respiratory': 'Atemschutz',
                    'coat': 'Laborkittel',
                    'shoes': 'Sicherheitsschuhe'
                };
                return `<span class="ppe-item">${ppeNames[ppe] || ppe}</span>`;
              }).join(', ')
            : 'Keine PSA angegeben';

        return `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Erforderliche PSA:</label>
                    <span>${ppeHTML}</span>
                </div>
                <div class="detail-item">
                    <label>Arbeitsplatzgrenzwert:</label>
                    <span>${substance.workplaceLimit || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>Gefährdungsbeurteilung:</label>
                    <span>${substance.riskAssessmentRequired || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <label>Substitutionsprüfung:</label>
                    <span>${substance.substitutionCheck || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item full-width">
                    <label>Verwendungsanweisungen:</label>
                    <span>${substance.usageInstructions || 'Keine angegeben'}</span>
                </div>
                <div class="detail-item full-width">
                    <label>Notfallmaßnahmen:</label>
                    <span>${substance.emergencyMeasures || 'Keine angegeben'}</span>
                </div>
            </div>
        `;
    }

    generateDocumentsTab(substance) {
        const documents = substance.documents || [];
        
        if (documents.length === 0) {
            return '<p>Keine Dokumente hochgeladen.</p>';
        }

        return `
            <div class="documents-list">
                ${documents.map(doc => `
                    <div class="document-item">
                        <div class="doc-icon">
                            <i class="fas ${this.getDocumentIcon(doc.type)}"></i>
                        </div>
                        <div class="doc-info">
                            <strong>${doc.name}</strong>
                            <div class="doc-meta">
                                <span>Typ: ${this.getDocumentTypeName(doc.type)}</span>
                                <span>Hochgeladen: ${new Date(doc.uploadDate).toLocaleDateString('de-DE')}</span>
                                <span>Von: ${doc.uploadedBy}</span>
                            </div>
                        </div>
                        <div class="doc-actions">
                            ${doc.mimeType === 'application/pdf' ? `
                                <button class="btn-icon" onclick="window.qhseDashboard.viewSubstanceDocument('${doc.id}')" title="PDF anzeigen">
                                    <i class="fas fa-eye"></i>
                                </button>
                            ` : ''}
                            <button class="btn-icon" onclick="window.qhseDashboard.downloadSubstanceDocument('${doc.id}')" title="Herunterladen">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getDocumentIcon(type) {
        const icons = {
            'sds': 'fa-file-pdf',
            'operatingInstruction': 'fa-file-alt',
            'additional': 'fa-file',
            'photo': 'fa-image'
        };
        return icons[type] || 'fa-file';
    }

    getDocumentTypeName(type) {
        const names = {
            'sds': 'Sicherheitsdatenblatt',
            'operatingInstruction': 'Betriebsanweisung',
            'additional': 'Zusätzliches Dokument',
            'photo': 'Foto'
        };
        return names[type] || 'Dokument';
    }

    closeSubstanceDetailsModal() {
        const modal = document.getElementById('substanceDetailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentViewingSubstanceId = null;
    }

    editCurrentSubstance() {
        if (this.currentViewingSubstanceId) {
            this.closeSubstanceDetailsModal();
            this.openSubstanceModal(this.currentViewingSubstanceId);
        }
    }

    deleteSubstance(substanceId) {
        const substance = this.hazardousSubstances.find(s => s.id === substanceId);
        if (!substance) return;

        if (confirm(`Möchten Sie den Gefahrstoff "${substance.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
            // Remove from array
            this.hazardousSubstances = this.hazardousSubstances.filter(s => s.id !== substanceId);
            
            // Save to storage
            this.saveHazardousSubstancesToStorage();
            
            // Update UI
            this.renderSubstancesList();
            this.updateSubstanceStatistics();
            
            alert('Gefahrstoff wurde erfolgreich gelöscht.');
        }
    }

    openSubstanceReports() {
        console.log('🧪 DEBUGGING: Opening substance reports modal...');
        console.log('🧪 DEBUGGING: Substances data:', this.hazardousSubstances);
        console.log('🧪 DEBUGGING: Departments data:', this.departments);
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-bar"></i> Gefahrstoff-Berichte</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="report-controls">
                        <div class="control-group">
                            <div class="form-group">
                                <label for="reportType">Berichtstyp:</label>
                                <select id="reportType">
                                    <option value="inventory">Inventarliste</option>
                                    <option value="sds-expiry">SDB-Ablaufdaten</option>
                                    <option value="high-risk">Hochgefährliche Stoffe</option>
                                    <option value="storage-locations">Lagerorte</option>
                                    <option value="complete">Vollständiger Bericht</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="reportDepartment">Abteilung:</label>
                                <select id="reportDepartment">
                                    <option value="">Alle Abteilungen</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="reportFormat">Format:</label>
                                <select id="reportFormat">
                                    <option value="pdf">PDF</option>
                                    <option value="csv">CSV</option>
                                    <option value="excel">Excel</option>
                                </select>
                            </div>
                        </div>
                        <div class="report-actions">
                            <button id="generateReportBtn" class="btn-primary">
                                <i class="fas fa-file-download"></i> Bericht erstellen
                            </button>
                            <button id="previewReportBtn" class="btn-secondary">
                                <i class="fas fa-eye"></i> Vorschau
                            </button>
                        </div>
                    </div>
                    <div class="report-preview" id="reportPreview" style="display: none;">
                        <h3>Bericht Vorschau</h3>
                        <div id="reportContent"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('🧪 DEBUGGING: Modal added to DOM');
        
        this.populateReportDepartmentDropdown();
        console.log('🧪 DEBUGGING: Department dropdown populated');
        
        // Event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const generateBtn = modal.querySelector('#generateReportBtn');
        const previewBtn = modal.querySelector('#previewReportBtn');
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        generateBtn.addEventListener('click', () => {
            console.log('Generate report button clicked');
            this.generateSubstanceReport();
        });
        
        previewBtn.addEventListener('click', () => {
            console.log('Preview report button clicked');
            this.previewSubstanceReport();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Show the modal
        modal.style.display = 'block';
        console.log('🧪 DEBUGGING: Modal display set to block');
        console.log('🧪 DEBUGGING: Modal element:', modal);
    }
    
    populateReportDepartmentDropdown() {
        const departmentSelect = document.getElementById('reportDepartment');
        if (departmentSelect) {
            departmentSelect.innerHTML = '<option value="">Alle Abteilungen</option>';
            this.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });
        }
    }
    
    generateSubstanceReport() {
        console.log('Generating substance report...');
        
        const reportType = document.getElementById('reportType').value;
        const department = document.getElementById('reportDepartment').value;
        const format = document.getElementById('reportFormat').value;
        
        console.log('Report parameters:', { reportType, department, format });
        
        if (!reportType) {
            alert('Bitte wählen Sie einen Berichtstyp aus.');
            return;
        }
        
        if (!format) {
            alert('Bitte wählen Sie ein Format aus.');
            return;
        }
        
        const reportData = this.prepareSubstanceReportData(reportType, department);
        
        console.log('Report data prepared for generation:', reportData);
        
        if (reportData.substances.length === 0) {
            alert('Keine Daten für den ausgewählten Berichtstyp gefunden.');
            return;
        }
        
        console.log('🧪 DEBUGGING: Starting export with format:', format);
        
        if (format === 'pdf') {
            console.log('🧪 DEBUGGING: Calling PDF export');
            this.exportSubstanceReportAsPDF(reportData, reportType);
        } else if (format === 'csv') {
            console.log('🧪 DEBUGGING: Calling CSV export');
            this.exportSubstanceReportAsCSV(reportData, reportType);
        } else if (format === 'excel') {
            console.log('🧪 DEBUGGING: Calling Excel export');
            this.exportSubstanceReportAsExcel(reportData, reportType);
        } else {
            console.error('🧪 DEBUGGING: Unknown format:', format);
        }
    }
    
    previewSubstanceReport() {
        console.log('Previewing substance report...');
        
        const reportType = document.getElementById('reportType').value;
        const department = document.getElementById('reportDepartment').value;
        
        console.log('Preview parameters:', { reportType, department });
        
        if (!reportType) {
            alert('Bitte wählen Sie einen Berichtstyp aus.');
            return;
        }
        
        const reportData = this.prepareSubstanceReportData(reportType, department);
        const previewDiv = document.getElementById('reportPreview');
        const contentDiv = document.getElementById('reportContent');
        
        console.log('Report data prepared:', reportData);
        
        if (reportData.substances.length === 0) {
            contentDiv.innerHTML = `
                <div class="no-data-message">
                    <h4>Keine Daten gefunden</h4>
                    <p>Für die gewählten Filterkriterien wurden keine Gefahrstoffe gefunden.</p>
                </div>
            `;
        } else {
            let html = this.generateReportHTML(reportData, reportType);
            contentDiv.innerHTML = html;
        }
        
        previewDiv.style.display = 'block';
    }
    
    prepareSubstanceReportData(reportType, departmentFilter) {
        console.log('Preparing report data...', { reportType, departmentFilter });
        console.log('Available substances:', this.hazardousSubstances.length);
        
        let substances = [...this.hazardousSubstances];
        
        // Filter by department if specified
        if (departmentFilter) {
            substances = substances.filter(s => s.department === departmentFilter);
        }
        
        // Filter by report type
        switch (reportType) {
            case 'sds-expiry':
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                substances = substances.filter(s => {
                    const expiryDate = new Date(s.sdsExpiryDate);
                    return expiryDate <= thirtyDaysFromNow;
                });
                break;
            case 'high-risk':
                substances = substances.filter(s => 
                    s.hazardStatements && s.hazardStatements.includes('H350') || // Carcinogenic
                    s.hazardStatements && s.hazardStatements.includes('H340') || // Mutagenic
                    s.hazardStatements && s.hazardStatements.includes('H360')    // Toxic to reproduction
                );
                break;
        }
        
        return {
            substances,
            reportType,
            departmentFilter,
            generatedAt: new Date(),
            totalCount: substances.length
        };
    }
    
    generateReportHTML(reportData, reportType) {
        const { substances, generatedAt, totalCount } = reportData;
        const departmentName = reportData.departmentFilter ? 
            this.departments.find(d => d.id === reportData.departmentFilter)?.name || 'Unbekannt' : 
            'Alle Abteilungen';
        
        let html = `
            <div class="report-header">
                <h4>${this.getReportTitle(reportType)}</h4>
                <p><strong>Abteilung:</strong> ${departmentName}</p>
                <p><strong>Erstellt am:</strong> ${generatedAt.toLocaleString('de-DE')}</p>
                <p><strong>Anzahl Einträge:</strong> ${totalCount}</p>
            </div>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>CAS-Nr.</th>
                        <th>Abteilung</th>
                        <th>Menge</th>
                        <th>Lagerort</th>
                        <th>SDB-Ablauf</th>
                        <th>Gefahrenklasse</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        substances.forEach(substance => {
            const department = this.departments.find(d => d.id === substance.department);
            const expiryDate = substance.sdsExpiryDate ? 
                new Date(substance.sdsExpiryDate).toLocaleDateString('de-DE') : 
                'Nicht angegeben';
            
            html += `
                <tr>
                    <td>${substance.name || 'Nicht angegeben'}</td>
                    <td>${substance.casNumber || 'Nicht angegeben'}</td>
                    <td>${department?.name || substance.department || 'Nicht zugeordnet'}</td>
                    <td>${substance.quantity || substance.storageAmount || 'Nicht angegeben'} ${substance.unit || ''}</td>
                    <td>${substance.storageLocation || 'Nicht angegeben'}</td>
                    <td>${expiryDate}</td>
                    <td>${substance.hazardClass || substance.signalWord || 'Nicht klassifiziert'}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        return html;
    }
    
    getReportTitle(reportType) {
        const titles = {
            'inventory': 'Gefahrstoff-Inventarliste',
            'sds-expiry': 'Sicherheitsdatenblätter mit ablaufenden Fristen',
            'high-risk': 'Hochgefährliche Stoffe (CMR-Stoffe)',
            'storage-locations': 'Lagerorte von Gefahrstoffen',
            'complete': 'Vollständiger Gefahrstoffbericht'
        };
        return titles[reportType] || 'Gefahrstoffbericht';
    }
    
    exportSubstanceReportAsPDF(reportData, reportType) {
        // Create printable version
        const printWindow = window.open('', '_blank');
        const html = this.generateReportHTML(reportData, reportType);
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>${this.getReportTitle(reportType)} - ${new Date().toLocaleDateString('de-DE')}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                        .report-header { margin-bottom: 20px; }
                        .report-header h4 { margin: 0 0 10px 0; font-size: 16px; }
                        .report-header p { margin: 5px 0; }
                        .report-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        .report-table th, .report-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        .report-table th { background-color: #f5f5f5; font-weight: bold; }
                        .report-table tr:nth-child(even) { background-color: #f9f9f9; }
                        @media print {
                            body { margin: 0; }
                            .report-table { font-size: 10px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-header">
                        <h4>Hoffmann & Voss GmbH - QHSE Management</h4>
                    </div>
                    ${html}
                    <div style="margin-top: 30px; font-size: 10px; color: #666;">
                        <p>Erstellt mit QHSE Management System - ${new Date().toLocaleString('de-DE')}</p>
                    </div>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Auto-print
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        alert('PDF-Bericht wird generiert. Ein neues Fenster zum Drucken/Speichern wurde geöffnet.');
    }
    
    exportSubstanceReportAsCSV(reportData, reportType) {
        const { substances } = reportData;
        const headers = ['Name', 'CAS-Nummer', 'Abteilung', 'Menge', 'Einheit', 'Lagerort', 'SDB-Ablaufdatum', 'Gefahrenklasse'];
        
        let csvContent = headers.join(';') + '\n';
        
        substances.forEach(substance => {
            const department = this.departments.find(d => d.id === substance.department);
            const row = [
                substance.name || '',
                substance.casNumber || '',
                department?.name || '',
                substance.quantity || '',
                substance.unit || '',
                substance.storageLocation || '',
                substance.sdsExpiryDate ? new Date(substance.sdsExpiryDate).toLocaleDateString('de-DE') : '',
                substance.hazardClass || ''
            ];
            csvContent += row.map(field => `"${field}"`).join(';') + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${this.getReportTitle(reportType)}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('CSV-Bericht wurde heruntergeladen.');
    }
    
    exportSubstanceReportAsExcel(reportData, reportType) {
        // For now, export as CSV (Excel format would require additional library)
        this.exportSubstanceReportAsCSV(reportData, reportType);
        alert('Excel-Export wird als CSV-Datei bereitgestellt, die in Excel geöffnet werden kann.');
    }

    handleFileUpload(event, type) {
        const files = event.target.files;
        if (files.length > 0) {
            this.processUploadedFiles(files, type);
        }
    }

    handleDroppedFiles(files, type) {
        this.processUploadedFiles(files, type);
    }

    processUploadedFiles(files, type) {
        // Initialize documents array if not exists
        if (!this.currentSubstanceDocuments) {
            this.currentSubstanceDocuments = [];
        }

        Array.from(files).forEach(file => {
            // Check file size (limit to 5MB to prevent localStorage quota issues)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                alert(`Datei "${file.name}" ist zu groß (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 5MB`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // Create document object with actual file data
                    const document = {
                        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        type: type,
                        size: file.size,
                        uploadDate: new Date().toISOString(),
                        uploadedBy: this.getCurrentUser().displayName,
                        mimeType: file.type,
                        fileData: e.target.result // Base64 encoded file data
                    };

                    this.currentSubstanceDocuments.push(document);
                    
                    // Update UI after each file is processed
                    this.displayUploadedDocuments(this.currentSubstanceDocuments);
                    
                    console.log(`File "${file.name}" processed successfully (${(file.size / 1024).toFixed(1)}KB)`);
                } catch (error) {
                    console.error('Error processing file:', error);
                    alert(`Fehler beim Verarbeiten der Datei: ${file.name}`);
                }
            };
            
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                alert(`Fehler beim Lesen der Datei: ${file.name}`);
            };
            
            // Read file as data URL (Base64)
            reader.readAsDataURL(file);
        });
    }

    displayUploadedDocuments(documents) {
        const container = document.getElementById('uploadedDocuments');
        if (!container || !documents) return;

        if (documents.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <h4>Hochgeladene Dokumente</h4>
            <div class="uploaded-files-list">
                ${documents.map(doc => `
                    <div class="uploaded-file-item" data-doc-id="${doc.id}">
                        <div class="file-icon">
                            <i class="fas ${this.getDocumentIcon(doc.type)}"></i>
                        </div>
                        <div class="file-info">
                            <strong>${doc.name}</strong>
                            <div class="file-meta">
                                <span>${this.getDocumentTypeName(doc.type)}</span>
                                <span>${(doc.size / 1024).toFixed(1)} KB</span>
                                <span>${new Date(doc.uploadDate).toLocaleDateString('de-DE')}</span>
                            </div>
                        </div>
                        <div class="file-actions">
                            ${doc.mimeType === 'application/pdf' ? `
                                <button class="btn-icon" onclick="window.qhseDashboard.viewSubstanceDocument('${doc.id}')" title="PDF anzeigen">
                                    <i class="fas fa-eye"></i>
                                </button>
                            ` : ''}
                            <button class="btn-icon" onclick="window.qhseDashboard.downloadSubstanceDocument('${doc.id}')" title="Herunterladen">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn-icon danger" onclick="window.qhseDashboard.removeUploadedDocument('${doc.id}')" title="Entfernen">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    removeUploadedDocument(docId) {
        if (this.currentSubstanceDocuments) {
            this.currentSubstanceDocuments = this.currentSubstanceDocuments.filter(doc => doc.id !== docId);
            this.displayUploadedDocuments(this.currentSubstanceDocuments);
        }
    }
    
    viewSubstanceDocument(docId) {
        const document = this.findSubstanceDocument(docId);
        if (!document) {
            alert('Dokument nicht gefunden.');
            return;
        }
        
        if (document.mimeType !== 'application/pdf') {
            alert('Nur PDF-Dokumente können in der Vorschau angezeigt werden.');
            return;
        }
        
        this.openPdfViewer(document);
    }
    
    downloadSubstanceDocument(docId) {
        const document = this.findSubstanceDocument(docId);
        if (!document) {
            alert('Dokument nicht gefunden.');
            return;
        }
        
        if (!document.fileData) {
            alert('Dateidaten nicht verfügbar.');
            return;
        }
        
        try {
            // Create download link
            const link = window.document.createElement('a');
            link.href = document.fileData;
            link.download = document.name;
            link.style.display = 'none';
            
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            
            console.log('Document downloaded:', document.name);
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Fehler beim Herunterladen der Datei.');
        }
    }
    
    findSubstanceDocument(docId) {
        // First check current substance documents (during editing)
        if (this.currentSubstanceDocuments) {
            const doc = this.currentSubstanceDocuments.find(d => d.id === docId);
            if (doc) return doc;
        }
        
        // Then check all saved substances
        for (const substance of this.hazardousSubstances) {
            if (substance.documents) {
                const doc = substance.documents.find(d => d.id === docId);
                if (doc) return doc;
            }
        }
        
        return null;
    }
    
    openPdfViewer(document) {
        try {
            const modal = window.document.getElementById('pdfViewerModal');
            const title = window.document.getElementById('pdfViewerTitle');
            const fileName = window.document.getElementById('pdfFileName');
            const fileSize = window.document.getElementById('pdfFileSize');
            const pdfFrame = window.document.getElementById('pdfFrame');
            const downloadBtn = window.document.getElementById('pdfDownloadBtn');
            const printBtn = window.document.getElementById('pdfPrintBtn');
            const closeBtn = window.document.getElementById('closePdfViewer');
            
            if (!modal || !pdfFrame) {
                console.error('PDF viewer elements not found');
                alert('PDF-Viewer nicht verfügbar. Bitte laden Sie die Datei herunter.');
                return;
            }
        
        // Set document info
        if (title) title.textContent = document.name;
        if (fileName) fileName.textContent = document.name;
        if (fileSize) fileSize.textContent = `${(document.size / 1024).toFixed(1)} KB`;
        
        // Set PDF source with enhanced error handling
        try {
            console.log('Setting PDF source for document:', document.name);
            console.log('PDF data starts with:', document.fileData ? document.fileData.substring(0, 50) : 'NO DATA');
            
            if (document.fileData && document.fileData.startsWith('data:application/pdf')) {
                // Clear any previous content
                pdfFrame.src = '';
                
                // Set a loading message
                const pdfContent = window.document.getElementById('pdfContent');
                if (pdfContent) {
                    pdfContent.innerHTML = `
                        <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column;">
                            <div style="margin-bottom: 1rem;">
                                <i class="fas fa-spinner fa-spin fa-2x" style="color: #3b82f6;"></i>
                            </div>
                            <p style="color: #64748b;">PDF wird geladen...</p>
                        </div>
                        <iframe id="pdfFrame" style="width: 100%; height: 100%; border: none; display: none;"></iframe>
                    `;
                }
                
                // Get the iframe again since we replaced the content
                const newPdfFrame = window.document.getElementById('pdfFrame');
                
                // Add load handler to show iframe when loaded
                newPdfFrame.onload = () => {
                    console.log('PDF loaded successfully');
                    newPdfFrame.style.display = 'block';
                    // Hide loading message
                    const loadingDiv = pdfContent.querySelector('div');
                    if (loadingDiv) loadingDiv.style.display = 'none';
                };
                
                // Add error handler for PDF loading
                newPdfFrame.onerror = () => {
                    console.error('Error loading PDF in iframe');
                    this.showPdfErrorMessage(pdfContent, document);
                };
                
                // Set the PDF source
                setTimeout(() => {
                    newPdfFrame.src = document.fileData;
                }, 100);
                
                // Add timeout fallback
                setTimeout(() => {
                    if (newPdfFrame.style.display === 'none') {
                        console.warn('PDF may not have loaded properly after timeout');
                        this.showPdfErrorMessage(pdfContent, document);
                    }
                }, 5000);
                
            } else {
                console.error('Invalid PDF data format:', document.fileData ? 'Data exists but wrong format' : 'No data');
                this.showPdfErrorMessage(window.document.getElementById('pdfContent'), document);
            }
        } catch (error) {
            console.error('Error setting PDF source:', error);
            this.showPdfErrorMessage(window.document.getElementById('pdfContent'), document);
        }
        
        // Setup download button
        if (downloadBtn) {
            downloadBtn.onclick = () => this.downloadSubstanceDocument(document.id);
        }
        
        // Setup print button
        if (printBtn) {
            printBtn.onclick = () => {
                try {
                    // Try to print iframe content (may fail due to security restrictions)
                    if (pdfFrame.contentWindow) {
                        pdfFrame.contentWindow.print();
                    } else {
                        // Fallback: open PDF in new window for printing
                        this.printPdfInNewWindow(document);
                    }
                } catch (error) {
                    console.log('Cannot print iframe directly due to security restrictions, opening in new window');
                    // Fallback: open PDF in new window for printing
                    this.printPdfInNewWindow(document);
                }
            };
        }
        
        // Setup close button
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                pdfFrame.src = ''; // Clear PDF to free memory
            };
        }
        
            // Show modal
            modal.style.display = 'block';
            
            // Close on background click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    if (pdfFrame) pdfFrame.src = '';
                }
            };
            
        } catch (error) {
            console.error('Error in PDF viewer:', error);
            alert('Fehler beim Öffnen des PDF-Viewers. Bitte laden Sie die Datei herunter.');
        }
    }
    
    showPdfErrorMessage(container, document) {
        if (!container) return;
        
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column; padding: 2rem; text-align: center;">
                <div style="margin-bottom: 2rem;">
                    <i class="fas fa-exclamation-triangle fa-3x" style="color: #f59e0b;"></i>
                </div>
                <h3 style="margin-bottom: 1rem; color: #374151;">PDF kann nicht angezeigt werden</h3>
                <p style="color: #64748b; margin-bottom: 2rem; max-width: 400px;">
                    Das PDF-Dokument "${document.name}" kann nicht direkt im Browser angezeigt werden. 
                    Dies kann aufgrund von Sicherheitseinstellungen oder dem PDF-Format auftreten.
                </p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                    <button onclick="window.qhseDashboard.downloadSubstanceDocument('${document.id}')" 
                            style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-download"></i> Herunterladen
                    </button>
                    <button onclick="window.qhseDashboard.openPdfInNewTab('${document.id}')" 
                            style="padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-external-link-alt"></i> Neuer Tab
                    </button>
                </div>
            </div>
        `;
    }
    
    openPdfInNewTab(docId) {
        const document = this.findSubstanceDocument(docId);
        if (!document || !document.fileData) {
            alert('Dokument nicht verfügbar.');
            return;
        }
        
        try {
            // Open PDF in new tab/window
            const newWindow = window.open();
            newWindow.document.write(`
                <html>
                    <head>
                        <title>${document.name}</title>
                        <style>
                            body { margin: 0; padding: 0; background: #f3f4f6; }
                            iframe { width: 100%; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${document.fileData}" title="${document.name}"></iframe>
                    </body>
                </html>
            `);
            newWindow.document.close();
        } catch (error) {
            console.error('Error opening PDF in new tab:', error);
            alert('Fehler beim Öffnen in neuem Tab. Bitte laden Sie die Datei herunter.');
        }
    }
    
    printPdfInNewWindow(document) {
        try {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${document.name}</title>
                        <style>
                            body { margin: 0; padding: 0; }
                            iframe { width: 100%; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${document.fileData}" onload="window.print(); window.close();"></iframe>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } catch (error) {
            console.error('Error opening print window:', error);
            alert('Drucken nicht möglich. Bitte laden Sie die Datei herunter und drucken Sie sie manuell.');
        }
    }
    
    showPdfErrorMessage(pdfFrame, documentId) {
        const errorMessage = window.document.createElement('div');
        errorMessage.className = 'pdf-error-message';
        errorMessage.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #666; background: #f9fafb; border-radius: 0.5rem; margin: 1rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: #f59e0b;"></i>
                <h3 style="margin: 0 0 1rem 0; color: #374151;">PDF konnte nicht angezeigt werden</h3>
                <p style="margin: 0 0 1.5rem 0; color: #6b7280;">Aufgrund von Browser-Sicherheitsrichtlinien kann die PDF-Datei nicht direkt angezeigt werden.</p>
                <button onclick="dashboard.downloadSubstanceDocument('${documentId}')" class="btn-primary" style="margin-right: 0.5rem;">
                    <i class="fas fa-download"></i> Datei herunterladen
                </button>
                <button onclick="dashboard.openPdfInNewTab('${documentId}')" class="btn-secondary">
                    <i class="fas fa-external-link-alt"></i> In neuem Tab öffnen
                </button>
            </div>
        `;
        
        if (pdfFrame && pdfFrame.parentNode) {
            pdfFrame.parentNode.replaceChild(errorMessage, pdfFrame);
        }
    }
    
    openPdfInNewTab(documentId) {
        const document = this.findSubstanceDocument(documentId);
        if (document && document.fileData) {
            try {
                const newWindow = window.open();
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${document.name}</title>
                            <style>
                                body { margin: 0; padding: 0; }
                                iframe { width: 100%; height: 100vh; border: none; }
                            </style>
                        </head>
                        <body>
                            <iframe src="${document.fileData}"></iframe>
                        </body>
                    </html>
                `);
                newWindow.document.close();
            } catch (error) {
                console.error('Error opening PDF in new tab:', error);
                alert('PDF konnte nicht geöffnet werden. Bitte laden Sie die Datei herunter.');
            }
        }
    }

    addSubstanceComment() {
        const commentText = document.getElementById('newComment').value.trim();
        if (!commentText) {
            alert('Bitte geben Sie einen Kommentar ein.');
            return;
        }

        // Initialize comments array if not exists
        if (!this.currentSubstanceComments) {
            this.currentSubstanceComments = [];
        }

        const comment = {
            id: 'comment_' + Date.now(),
            text: commentText,
            author: this.getCurrentUser().displayName,
            timestamp: new Date().toISOString()
        };

        this.currentSubstanceComments.push(comment);
        
        // Clear input
        document.getElementById('newComment').value = '';
        
        // Update display
        this.displaySubstanceComments(this.currentSubstanceComments);
    }

    displaySubstanceComments(comments) {
        const container = document.getElementById('commentsList');
        if (!container) return;

        if (!comments || comments.length === 0) {
            container.innerHTML = '<p>Keine Kommentare vorhanden.</p>';
            return;
        }

        container.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <strong>${comment.author}</strong>
                    <span class="comment-date">${new Date(comment.timestamp).toLocaleString('de-DE')}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('');
    }

    setupDetailsModalTabs() {
        const detailsModal = document.getElementById('substanceDetailsModal');
        if (!detailsModal) return;

        const tabButtons = detailsModal.querySelectorAll('.tab-btn');
        const tabContents = detailsModal.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Update active tab button
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => {
                    content.classList.toggle('active', content.getAttribute('data-tab') === targetTab);
                });
            });
        });
    }

    // ====================================
    // SUPPLIER MANAGEMENT SYSTEM  
    // ====================================

    // Data Loading Functions
    loadSuppliersFromStorage() {
        try {
            const suppliers = JSON.parse(localStorage.getItem('qhse_suppliers') || '[]');
            if (suppliers.length === 0) {
                return this.initializeDefaultSuppliers();
            }
            return suppliers;
        } catch (error) {
            console.error('Error loading suppliers:', error);
            return this.initializeDefaultSuppliers();
        }
    }

    loadSupplierEvaluationsFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('qhse_supplier_evaluations') || '[]');
        } catch (error) {
            console.error('Error loading supplier evaluations:', error);
            return [];
        }
    }

    loadSupplierDocumentsFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('qhse_supplier_documents') || '[]');
        } catch (error) {
            console.error('Error loading supplier documents:', error);
            return [];
        }
    }

    loadSupplierAuditsFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('qhse_supplier_audits') || '[]');
        } catch (error) {
            console.error('Error loading supplier audits:', error);
            return [];
        }
    }

    // Supplier Management Setup
    setupSupplierManagement() {
        // Setup supplier management functionality
        this.setupSupplierTabs();
        this.setupSupplierFilters();
        this.setupSupplierModal();
        this.setupSupplierQuickActions();
        this.renderSupplierDashboard();
    }

    setupSupplierTabs() {
        const supplierTabs = document.querySelectorAll('.supplier-tab-btn');
        const supplierTabContents = document.querySelectorAll('.supplier-tab-panel');

        supplierTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Update active tab
                supplierTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active content
                supplierTabContents.forEach(content => {
                    const contentTab = content.id.replace('supplier-', '');
                    if (contentTab === targetTab) {
                        content.classList.add('active');
                        content.style.display = 'block';
                    } else {
                        content.classList.remove('active');
                        content.style.display = 'none';
                    }
                });

                // Render content based on active tab
                this.renderSupplierTabContent(targetTab);
            });
        });

        // Show overview tab by default
        this.renderSupplierTabContent('overview');
    }

    setupSupplierFilters() {
        const statusFilter = document.getElementById('supplierStatusFilter');
        const typeFilter = document.getElementById('supplierTypeFilter');
        const searchInput = document.getElementById('supplierSearch');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterSuppliers());
        }
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterSuppliers());
        }
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterSuppliers());
        }
    }

    setupSupplierModal() {
        const addSupplierBtn = document.getElementById('addSupplierBtn');
        const supplierModal = document.getElementById('supplierModal');
        const supplierForm = document.getElementById('supplierForm');

        if (addSupplierBtn) {
            addSupplierBtn.addEventListener('click', () => {
                this.showSupplierModal();
            });
        }

        if (supplierForm) {
            supplierForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSupplier();
            });
        }

        // Setup modal close functionality
        const modalCloses = document.querySelectorAll('#supplierModal .modal-close');
        modalCloses.forEach(btn => {
            btn.addEventListener('click', () => {
                supplierModal.style.display = 'none';
                this.currentEditingSupplierId = null;
            });
        });

        // Setup evaluation modal
        const evalForm = document.getElementById('evaluationForm');
        if (evalForm) {
            evalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSupplierEvaluation();
            });
        }
    }

    setupSupplierQuickActions() {
        const evaluateBtn = document.getElementById('evaluateSupplierBtn');
        const checkCertificatesBtn = document.getElementById('checkCertificatesBtn');
        const planAuditBtn = document.getElementById('planAuditBtn');
        const reportsBtn = document.getElementById('supplierReportsBtn');
        const auditBtn = document.getElementById('supplierAuditBtn');

        if (evaluateBtn) {
            evaluateBtn.addEventListener('click', () => this.openEvaluationModal());
        }
        if (checkCertificatesBtn) {
            checkCertificatesBtn.addEventListener('click', () => this.checkCertificates());
        }
        if (planAuditBtn) {
            planAuditBtn.addEventListener('click', () => this.planAudit());
        }
        if (reportsBtn) {
            reportsBtn.addEventListener('click', () => this.openReportsModal());
        }
        if (auditBtn) {
            auditBtn.addEventListener('click', () => this.planAudit());
        }
    }

    // Supplier Data Management
    initializeDefaultSuppliers() {
        const defaultSuppliers = [
            {
                id: 'SUP001',
                number: 'L-2024-001',
                name: 'Mustermann Stahl GmbH',
                type: 'warenlieferant',
                status: 'freigegeben',
                contact: {
                    person: 'Max Mustermann',
                    email: 'max@mustermann-stahl.de',
                    phone: '+49 40 123456',
                    address: 'Musterstraße 1, 20095 Hamburg'
                },
                products: ['Stahlprodukte', 'Metallverarbeitung'],
                certificates: [
                    { name: 'ISO 9001', validUntil: '2025-12-31', status: 'gültig' }
                ],
                evaluation: {
                    score: 85,
                    lastEvaluated: '2024-01-15',
                    criteria: {
                        quality: 90,
                        delivery: 85,
                        price: 80,
                        service: 85
                    }
                },
                createdAt: '2024-01-01',
                updatedAt: '2024-01-15'
            },
            {
                id: 'SUP002',
                number: 'L-2024-002',
                name: 'Technik Service Nord',
                type: 'dienstleister',
                status: 'kritisch',
                contact: {
                    person: 'Anna Schmidt',
                    email: 'a.schmidt@technik-service.de',
                    phone: '+49 40 987654',
                    address: 'Industrieweg 5, 20097 Hamburg'
                },
                products: ['Wartung', 'Reparaturen', 'Technischer Support'],
                certificates: [
                    { name: 'ISO 45001', validUntil: '2024-06-30', status: 'läuft ab' }
                ],
                evaluation: {
                    score: 65,
                    lastEvaluated: '2024-01-10',
                    criteria: {
                        quality: 70,
                        delivery: 60,
                        price: 70,
                        service: 60
                    }
                },
                createdAt: '2024-01-01',
                updatedAt: '2024-01-10'
            },
            {
                id: 'SUP003',
                number: 'L-2024-003',
                name: 'Entsorgung Hamburg GmbH',
                type: 'entsorger',
                status: 'freigegeben',
                contact: {
                    person: 'Peter Müller',
                    email: 'p.mueller@entsorgung-hh.de',
                    phone: '+49 40 555777',
                    address: 'Hafenstraße 10, 20459 Hamburg'
                },
                products: ['Abfallentsorgung', 'Recycling', 'Sonderabfall'],
                certificates: [
                    { name: 'Entsorgungsnachweis', validUntil: '2025-03-31', status: 'gültig' },
                    { name: 'ISO 14001', validUntil: '2025-08-15', status: 'gültig' }
                ],
                evaluation: {
                    score: 92,
                    lastEvaluated: '2024-01-20',
                    criteria: {
                        quality: 95,
                        delivery: 90,
                        price: 85,
                        service: 95
                    }
                },
                createdAt: '2024-01-01',
                updatedAt: '2024-01-20'
            }
        ];

        this.saveSuppliersToStorage(defaultSuppliers);
        return defaultSuppliers;
    }

    // Enhanced supplier management methods
    showSupplierModal(supplierId = null) {
        const modal = document.getElementById('supplierModal');
        const form = document.getElementById('supplierForm');
        const titleText = document.getElementById('supplierModalTitleText');
        
        if (supplierId) {
            // Edit mode
            titleText.textContent = 'Lieferant bearbeiten';
            this.populateSupplierForm(supplierId);
        } else {
            // Add mode
            titleText.textContent = 'Neuer Lieferant';
            form.reset();
            this.generateSupplierNumber();
            this.currentCertificates = {}; // Reset certificates for new supplier
        }
        
        this.setupSupplierFormTabs();
        this.setupScoreSliders();
        this.setupCertificateManagement();
        modal.style.display = 'block';
    }

    generateSupplierNumber() {
        const year = new Date().getFullYear();
        const existingNumbers = this.suppliers.map(s => s.number);
        let counter = 1;
        let newNumber;
        
        do {
            newNumber = `L-${year}-${counter.toString().padStart(3, '0')}`;
            counter++;
        } while (existingNumbers.includes(newNumber));
        
        document.getElementById('supplierNumber').value = newNumber;
    }

    setupSupplierFormTabs() {
        const tabs = document.querySelectorAll('.supplier-form-tab');
        const contents = document.querySelectorAll('.supplier-form-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active content
                contents.forEach(content => {
                    content.classList.toggle('active', content.getAttribute('data-tab') === targetTab);
                });
            });
        });
    }

    setupScoreSliders() {
        const sliders = ['supplierQualityScore', 'supplierDeliveryScore', 'supplierPriceScore', 'supplierServiceScore'];
        
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueSpan = document.getElementById(sliderId + 'Value');
            
            if (slider && valueSpan) {
                slider.addEventListener('input', () => {
                    valueSpan.textContent = slider.value + '%';
                    this.updateOverallScore();
                });
            }
        });

        // Setup evaluation form sliders too
        const evalSliders = ['evalQualityScore', 'evalDeliveryScore', 'evalPriceScore', 'evalServiceScore'];
        
        evalSliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueSpan = document.getElementById(sliderId + 'Value');
            
            if (slider && valueSpan) {
                slider.addEventListener('input', () => {
                    valueSpan.textContent = slider.value + '%';
                    this.updateEvalOverallScore();
                });
            }
        });
    }

    updateOverallScore() {
        const quality = parseInt(document.getElementById('supplierQualityScore')?.value || 0);
        const delivery = parseInt(document.getElementById('supplierDeliveryScore')?.value || 0);
        const price = parseInt(document.getElementById('supplierPriceScore')?.value || 0);
        const service = parseInt(document.getElementById('supplierServiceScore')?.value || 0);
        
        const overall = Math.round((quality + delivery + price + service) / 4);
        const overallSpan = document.getElementById('supplierOverallScore');
        if (overallSpan) {
            overallSpan.textContent = overall + '%';
        }
    }

    updateEvalOverallScore() {
        const quality = parseInt(document.getElementById('evalQualityScore')?.value || 0);
        const delivery = parseInt(document.getElementById('evalDeliveryScore')?.value || 0);
        const price = parseInt(document.getElementById('evalPriceScore')?.value || 0);
        const service = parseInt(document.getElementById('evalServiceScore')?.value || 0);
        
        const overall = Math.round((quality + delivery + price + service) / 4);
        const overallSpan = document.getElementById('evalOverallScore');
        if (overallSpan) {
            overallSpan.textContent = overall + '%';
        }
    }

    populateSupplierForm(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        // Basic information
        document.getElementById('supplierNumber').value = supplier.number || '';
        document.getElementById('supplierName').value = supplier.name || '';
        document.getElementById('supplierType').value = supplier.type || '';
        document.getElementById('supplierStatus').value = supplier.status || 'neu';
        document.getElementById('supplierDescription').value = supplier.description || '';

        // Contact information
        document.getElementById('contactPerson').value = supplier.contact?.person || '';
        document.getElementById('contactEmail').value = supplier.contact?.email || '';
        document.getElementById('contactPhone').value = supplier.contact?.phone || '';
        document.getElementById('contactFax').value = supplier.contact?.fax || '';
        document.getElementById('supplierAddress').value = supplier.contact?.address || '';
        document.getElementById('supplierWebsite').value = supplier.contact?.website || '';
        document.getElementById('supplierTaxId').value = supplier.contact?.taxId || '';

        // Products
        document.getElementById('supplierProducts').value = supplier.products?.join(', ') || '';
        document.getElementById('supplierCapacity').value = supplier.capacity || '';
        document.getElementById('supplierDeliveryTime').value = supplier.deliveryTime || '';
        document.getElementById('supplierQualityStandards').value = supplier.qualityStandards || '';

        // Evaluation scores
        const evaluation = supplier.evaluation || {};
        const criteria = evaluation.criteria || {};
        
        document.getElementById('supplierQualityScore').value = criteria.quality || 75;
        document.getElementById('supplierDeliveryScore').value = criteria.delivery || 75;
        document.getElementById('supplierPriceScore').value = criteria.price || 75;
        document.getElementById('supplierServiceScore').value = criteria.service || 75;
        document.getElementById('evaluationNotes').value = evaluation.notes || '';

        // Update score displays
        this.updateOverallScore();
        ['supplierQualityScore', 'supplierDeliveryScore', 'supplierPriceScore', 'supplierServiceScore'].forEach(id => {
            const slider = document.getElementById(id);
            const valueSpan = document.getElementById(id + 'Value');
            if (slider && valueSpan) {
                valueSpan.textContent = slider.value + '%';
            }
        });

        // Store current editing ID
        this.currentEditingSupplierId = supplierId;
    }

    saveSupplier() {
        const form = document.getElementById('supplierForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const supplierData = {
            id: this.currentEditingSupplierId || 'SUP' + Date.now(),
            number: formData.get('supplierNumber'),
            name: formData.get('supplierName'),
            type: formData.get('supplierType'),
            status: formData.get('supplierStatus'),
            description: formData.get('supplierDescription'),
            contact: {
                person: formData.get('contactPerson'),
                email: formData.get('contactEmail'),
                phone: formData.get('contactPhone'),
                fax: formData.get('contactFax'),
                address: formData.get('supplierAddress'),
                website: formData.get('supplierWebsite'),
                taxId: formData.get('supplierTaxId')
            },
            products: formData.get('supplierProducts').split(',').map(p => p.trim()).filter(p => p),
            capacity: formData.get('supplierCapacity'),
            deliveryTime: formData.get('supplierDeliveryTime'),
            qualityStandards: formData.get('supplierQualityStandards'),
            certificates: this.collectCertificateData(),
            evaluation: {
                score: Math.round((
                    parseInt(formData.get('supplierQualityScore')) +
                    parseInt(formData.get('supplierDeliveryScore')) +
                    parseInt(formData.get('supplierPriceScore')) +
                    parseInt(formData.get('supplierServiceScore'))
                ) / 4),
                lastEvaluated: new Date().toISOString(),
                criteria: {
                    quality: parseInt(formData.get('supplierQualityScore')),
                    delivery: parseInt(formData.get('supplierDeliveryScore')),
                    price: parseInt(formData.get('supplierPriceScore')),
                    service: parseInt(formData.get('supplierServiceScore'))
                },
                notes: formData.get('evaluationNotes')
            },
            createdAt: this.currentEditingSupplierId ? 
                this.suppliers.find(s => s.id === this.currentEditingSupplierId)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Check for duplicate supplier number (only for new suppliers or when number changed)
        const existingSupplier = this.suppliers.find(s => s.number === supplierData.number);
        if (existingSupplier && (!this.currentEditingSupplierId || existingSupplier.id !== this.currentEditingSupplierId)) {
            alert('Diese Lieferantennummer ist bereits vergeben. Bitte wählen Sie eine andere.');
            return;
        }

        if (this.currentEditingSupplierId) {
            // Update existing supplier
            const index = this.suppliers.findIndex(s => s.id === this.currentEditingSupplierId);
            if (index !== -1) {
                this.suppliers[index] = supplierData;
            }
        } else {
            // Add new supplier
            this.suppliers.push(supplierData);
        }

        this.saveSuppliersToStorage();
        this.renderSupplierDashboard();
        this.renderSupplierList();
        
        // Determine action before clearing the editing ID
        const action = this.currentEditingSupplierId ? 'aktualisiert' : 'hinzugefügt';
        
        // Close modal and reset editing state
        document.getElementById('supplierModal').style.display = 'none';
        this.currentEditingSupplierId = null;

        alert(`Lieferant "${supplierData.name}" wurde erfolgreich ${action}.`);
    }

    filterSuppliers() {
        console.log('Filtering suppliers...');
        this.renderSupplierList();
    }

    renderSupplierTabContent(tabName) {
        switch (tabName) {
            case 'overview':
                this.renderSupplierDashboard();
                break;
            case 'suppliers':
                this.renderSupplierList();
                break;
            case 'evaluations':
                this.renderSupplierEvaluations();
                break;
            case 'documents':
                this.renderSupplierDocuments();
                break;
            case 'audits':
                this.renderSupplierAudits();
                break;
        }
    }

    renderSupplierDashboard() {
        const stats = this.calculateSupplierStats();
        this.updateSupplierStatistics(stats);
        this.renderRecentSupplierActivity();
    }

    calculateSupplierStats() {
        const suppliers = this.suppliers || [];
        
        const stats = {
            total: suppliers.length,
            approved: suppliers.filter(s => s.status === 'freigegeben').length,
            critical: suppliers.filter(s => s.status === 'kritisch').length,
            blocked: suppliers.filter(s => s.status === 'gesperrt').length,
            new: suppliers.filter(s => s.status === 'neu').length
        };

        stats.avgScore = suppliers.length > 0 
            ? Math.round(suppliers.reduce((sum, s) => sum + (s.evaluation?.score || 0), 0) / suppliers.length)
            : 0;

        return stats;
    }

    updateSupplierStatistics(stats) {
        const elements = {
            total: document.getElementById('totalSuppliersCount'),
            approved: document.getElementById('approvedSuppliersCount'),
            critical: document.getElementById('criticalSuppliersCount'),
            blocked: document.getElementById('blockedSuppliersCount'),
            avgScore: document.getElementById('avgSupplierScore')
        };

        if (elements.total) elements.total.textContent = stats.total;
        if (elements.approved) elements.approved.textContent = stats.approved;
        if (elements.critical) elements.critical.textContent = stats.critical;
        if (elements.blocked) elements.blocked.textContent = stats.blocked;
        if (elements.avgScore) elements.avgScore.textContent = stats.avgScore + '%';
    }

    renderSupplierList() {
        const container = document.getElementById('suppliersList');
        if (!container) return;

        const filteredSuppliers = this.getFilteredSuppliers();
        
        if (filteredSuppliers.length === 0) {
            container.innerHTML = '<p class="no-data">Keine Lieferanten gefunden.</p>';
            return;
        }

        container.innerHTML = filteredSuppliers.map(supplier => `
            <div class="supplier-card" data-id="${supplier.id}">
                <div class="supplier-header">
                    <div class="supplier-info">
                        <h3>${supplier.name}</h3>
                        <span class="supplier-number">${supplier.number}</span>
                    </div>
                    <div class="supplier-status">
                        <span class="status-badge status-${supplier.status}">${this.getStatusLabel(supplier.status)}</span>
                        <span class="supplier-type">${this.getTypeLabel(supplier.type)}</span>
                    </div>
                </div>
                <div class="supplier-details">
                    <div class="supplier-contact">
                        <i class="fas fa-user"></i>
                        <span>${supplier.contact.person}</span>
                        <i class="fas fa-envelope"></i>
                        <span>${supplier.contact.email}</span>
                    </div>
                    <div class="supplier-products">
                        <i class="fas fa-box"></i>
                        <span>${supplier.products.join(', ')}</span>
                    </div>
                </div>
                <div class="supplier-metrics">
                    <div class="metric">
                        <span class="metric-label">Bewertung</span>
                        <span class="metric-value">${supplier.evaluation?.score || 0}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Zertifikate</span>
                        <span class="metric-value">${supplier.certificates?.length || 0}</span>
                    </div>
                </div>
                <div class="supplier-actions">
                    <button class="btn-secondary" onclick="qhseDashboard.editSupplier('${supplier.id}')">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button class="btn-primary" onclick="qhseDashboard.evaluateSupplier('${supplier.id}')">
                        <i class="fas fa-star"></i> Bewerten
                    </button>
                </div>
            </div>
        `).join('');
    }

    getFilteredSuppliers() {
        const suppliers = this.suppliers || [];
        const statusFilter = document.getElementById('supplierStatusFilter')?.value || 'all';
        const typeFilter = document.getElementById('supplierTypeFilter')?.value || 'all';
        const searchTerm = document.getElementById('supplierSearch')?.value.toLowerCase() || '';

        return suppliers.filter(supplier => {
            const matchesStatus = statusFilter === '' || supplier.status === statusFilter;
            const matchesType = typeFilter === '' || supplier.type === typeFilter;
            const matchesSearch = !searchTerm || 
                supplier.name.toLowerCase().includes(searchTerm) ||
                supplier.number.toLowerCase().includes(searchTerm) ||
                supplier.contact.person.toLowerCase().includes(searchTerm);

            return matchesStatus && matchesType && matchesSearch;
        });
    }

    getStatusLabel(status) {
        const labels = {
            'freigegeben': 'Freigegeben',
            'kritisch': 'Kritisch',
            'gesperrt': 'Gesperrt',
            'neu': 'Neu'
        };
        return labels[status] || status;
    }

    getTypeLabel(type) {
        const labels = {
            'warenlieferant': 'Warenlieferant',
            'dienstleister': 'Dienstleister',
            'entsorger': 'Entsorger',
            'pruefinstitut': 'Prüfinstitut'
        };
        return labels[type] || type;
    }

    renderSupplierEvaluations() {
        const container = document.getElementById('supplierEvaluationsList');
        if (!container) return;
        
        const evaluations = this.suppliers.filter(s => s.evaluation).map(supplier => ({
            ...supplier.evaluation,
            supplierName: supplier.name,
            supplierId: supplier.id,
            status: supplier.status
        })).sort((a, b) => new Date(b.lastEvaluated) - new Date(a.lastEvaluated));
        
        if (evaluations.length === 0) {
            container.innerHTML = '<p class="no-data">Noch keine Bewertungen vorhanden.</p>';
            return;
        }

        container.innerHTML = `
            <div class="evaluations-header">
                <h3>Bewertungsübersicht</h3>
                <button class="btn-primary" onclick="qhseDashboard.openEvaluationModal()">
                    <i class="fas fa-plus"></i> Neue Bewertung
                </button>
            </div>
            <div class="evaluations-list">
                ${evaluations.map(evaluation => `
                    <div class="evaluation-card">
                        <div class="evaluation-header">
                            <h4>${evaluation.supplierName}</h4>
                            <span class="evaluation-score ${evaluation.score >= 80 ? 'success' : evaluation.score >= 60 ? 'warning' : 'danger'}">
                                ${evaluation.score}%
                            </span>
                        </div>
                        <div class="evaluation-details">
                            <div class="evaluation-criteria">
                                <div class="criterion-small">
                                    <span>Qualität</span>
                                    <span>${evaluation.criteria.quality}%</span>
                                </div>
                                <div class="criterion-small">
                                    <span>Lieferung</span>
                                    <span>${evaluation.criteria.delivery}%</span>
                                </div>
                                <div class="criterion-small">
                                    <span>Preis</span>
                                    <span>${evaluation.criteria.price}%</span>
                                </div>
                                <div class="criterion-small">
                                    <span>Service</span>
                                    <span>${evaluation.criteria.service}%</span>
                                </div>
                            </div>
                            <div class="evaluation-meta">
                                <span class="evaluation-date">${formatDate(evaluation.lastEvaluated)}</span>
                                <span class="evaluation-status status-${evaluation.status}">${this.getStatusLabel(evaluation.status)}</span>
                            </div>
                        </div>
                        <div class="evaluation-actions">
                            <button class="btn-sm btn-secondary" onclick="qhseDashboard.openEvaluationModal('${evaluation.supplierId}')">
                                <i class="fas fa-edit"></i> Bearbeiten
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSupplierDocuments() {
        const container = document.getElementById('supplierDocumentsList');
        if (!container) return;
        
        const allDocuments = [];
        this.suppliers.forEach(supplier => {
            if (supplier.certificates) {
                supplier.certificates.forEach(cert => {
                    allDocuments.push({
                        ...cert,
                        supplierName: supplier.name,
                        supplierId: supplier.id,
                        type: 'certificate'
                    });
                });
            }
        });

        container.innerHTML = `
            <div class="documents-header">
                <h3>Dokumente & Zertifikate</h3>
                <div class="documents-filters">
                    <select id="docTypeFilter" class="form-control">
                        <option value="all">Alle Dokumente</option>
                        <option value="certificate">Zertifikate</option>
                        <option value="contract">Verträge</option>
                        <option value="quality">Qualitätsdokumente</option>
                    </select>
                    <select id="docStatusFilter" class="form-control">
                        <option value="all">Alle Status</option>
                        <option value="valid">Gültig</option>
                        <option value="expiring">Läuft ab</option>
                        <option value="expired">Abgelaufen</option>
                    </select>
                </div>
            </div>
            <div class="documents-grid">
                ${allDocuments.length > 0 ? allDocuments.map(doc => {
                    const expiryDate = new Date(doc.validUntil);
                    const today = new Date();
                    const isExpired = expiryDate < today;
                    const isExpiring = !isExpired && expiryDate < new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
                    
                    return `
                        <div class="document-card">
                            <div class="document-icon">
                                <i class="fas fa-certificate"></i>
                            </div>
                            <div class="document-info">
                                <h4>${doc.name}</h4>
                                <p class="document-supplier">${doc.supplierName}</p>
                                <div class="document-meta">
                                    <span class="document-expiry ${isExpired ? 'expired' : isExpiring ? 'expiring' : 'valid'}">
                                        ${isExpired ? 'Abgelaufen' : isExpiring ? 'Läuft ab' : 'Gültig'} bis ${formatDate(doc.validUntil)}
                                    </span>
                                </div>
                            </div>
                            <div class="document-actions">
                                ${doc.fileData ? `
                                    <button class="btn-sm btn-secondary" onclick="qhseDashboard.previewSupplierDocument('${doc.supplierId}', '${doc.name}')" title="Vorschau">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-sm btn-secondary" onclick="qhseDashboard.downloadSupplierDocument('${doc.supplierId}', '${doc.name}')" title="Herunterladen">
                                        <i class="fas fa-download"></i>
                                    </button>
                                ` : `
                                    <span class="no-file-text">Keine Datei</span>
                                `}
                            </div>
                        </div>
                    `;
                }).join('') : '<p class="no-data">Keine Dokumente verfügbar.</p>'}
            </div>
        `;
    }

    renderSupplierAudits() {
        const container = document.getElementById('supplierAuditsList');
        if (!container) return;
        
        // Generate sample audit data based on supplier evaluations
        const auditData = this.suppliers.map(supplier => {
            const lastEval = supplier.evaluation?.lastEvaluated ? new Date(supplier.evaluation.lastEvaluated) : null;
            const score = supplier.evaluation?.score || 0;
            
            // Determine audit status
            let auditStatus = 'planned';
            let auditPriority = 'medium';
            let nextAuditDate = new Date();
            nextAuditDate.setMonth(nextAuditDate.getMonth() + 12);
            
            if (score < 60) {
                auditStatus = 'urgent';
                auditPriority = 'high';
                nextAuditDate.setMonth(nextAuditDate.getMonth() - 10); // Due soon
            } else if (score < 80) {
                auditStatus = 'scheduled';
                auditPriority = 'medium';
                nextAuditDate.setMonth(nextAuditDate.getMonth() - 6);
            }
            
            return {
                supplierId: supplier.id,
                supplierName: supplier.name,
                lastAudit: lastEval,
                nextAudit: nextAuditDate,
                status: auditStatus,
                priority: auditPriority,
                score: score,
                type: supplier.type
            };
        }).sort((a, b) => a.nextAudit - b.nextAudit);
        
        container.innerHTML = `
            <div class="audits-header">
                <h3>Audit-Planung</h3>
                <div class="audits-actions">
                    <button class="btn-secondary" onclick="qhseDashboard.planAudit()">
                        <i class="fas fa-calendar"></i> Audit planen
                    </button>
                    <button class="btn-primary" onclick="qhseDashboard.openNewAuditModal()">
                        <i class="fas fa-plus"></i> Neues Audit
                    </button>
                </div>
            </div>
            <div class="audits-calendar">
                <h4>Anstehende Audits</h4>
                <div class="audits-timeline">
                    ${auditData.slice(0, 8).map(audit => `
                        <div class="audit-item priority-${audit.priority}">
                            <div class="audit-date">
                                <span class="audit-day">${audit.nextAudit.getDate()}</span>
                                <span class="audit-month">${audit.nextAudit.toLocaleDateString('de-DE', { month: 'short' })}</span>
                            </div>
                            <div class="audit-details">
                                <h4>${audit.supplierName}</h4>
                                <p class="audit-type">${this.getTypeLabel(audit.type)}</p>
                                <div class="audit-meta">
                                    <span class="audit-status status-${audit.status}">${this.getAuditStatusLabel(audit.status)}</span>
                                    <span class="audit-score ${audit.score >= 80 ? 'success' : audit.score >= 60 ? 'warning' : 'danger'}">
                                        Score: ${audit.score}%
                                    </span>
                                </div>
                            </div>
                            <div class="audit-actions">
                                <button class="btn-sm btn-secondary" onclick="qhseDashboard.scheduleAudit('${audit.supplierId}')">
                                    <i class="fas fa-calendar"></i>
                                </button>
                                <button class="btn-sm btn-primary" onclick="qhseDashboard.startAudit('${audit.supplierId}')">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getAuditStatusLabel(status) {
        const labels = {
            'planned': 'Geplant',
            'scheduled': 'Terminiert', 
            'urgent': 'Dringend',
            'completed': 'Abgeschlossen',
            'overdue': 'Überfällig'
        };
        return labels[status] || status;
    }

    // Additional audit methods
    openNewAuditModal() {
        alert('Neues Audit Modal wird in Kürze verfügbar sein.');
    }

    scheduleAudit(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (supplier) {
            alert(`Audit für "${supplier.name}" wird geplant.`);
        }
    }

    startAudit(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (supplier) {
            alert(`Audit für "${supplier.name}" wird gestartet.`);
        }
    }

    // Certificate Management Functions
    setupCertificateManagement() {
        const addCertBtn = document.getElementById('addCertificateBtn');
        if (addCertBtn) {
            addCertBtn.addEventListener('click', () => this.addCertificateField());
        }
        
        // Initialize with existing certificates or one empty field
        this.renderCertificateFields();
    }

    addCertificateField() {
        const certificatesList = document.getElementById('modalCertificatesList');
        if (!certificatesList) return;

        const certId = 'cert_' + Date.now();
        const certField = document.createElement('div');
        certField.className = 'certificate-field';
        certField.setAttribute('data-cert-id', certId);
        
        certField.innerHTML = `
            <div class="certificate-header">
                <h4>Zertifikat</h4>
                <button type="button" class="btn-danger btn-sm" onclick="qhseDashboard.removeCertificateField('${certId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label for="certName_${certId}">Zertifikat Name *</label>
                    <input type="text" id="certName_${certId}" name="certName_${certId}" 
                           autocomplete="off" required
                           placeholder="z.B. ISO 9001">
                </div>
                <div class="form-group">
                    <label for="certValidUntil_${certId}">Gültig bis *</label>
                    <input type="date" id="certValidUntil_${certId}" name="certValidUntil_${certId}" 
                           autocomplete="off" required>
                </div>
            </div>
            <div class="form-group">
                <label for="certFile_${certId}">Zertifikat-Datei</label>
                <input type="file" id="certFile_${certId}" name="certFile_${certId}" 
                       accept=".pdf,.jpg,.jpeg,.png" 
                       onchange="qhseDashboard.handleCertificateUpload('${certId}', this)">
                <small>Unterstützte Formate: PDF, JPG, PNG (max. 5MB)</small>
            </div>
            <div class="certificate-preview" id="certPreview_${certId}" style="display: none;">
                <div class="preview-content">
                    <i class="fas fa-file-pdf preview-icon"></i>
                    <div class="preview-info">
                        <span class="preview-name"></span>
                        <span class="preview-size"></span>
                    </div>
                    <div class="preview-actions">
                        <button type="button" class="btn-sm btn-secondary" onclick="qhseDashboard.previewCertificate('${certId}')" title="Vorschau">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn-sm btn-secondary" onclick="qhseDashboard.downloadCertificate('${certId}')" title="Herunterladen">
                            <i class="fas fa-download"></i>
                        </button>
                        <button type="button" class="btn-sm btn-danger" onclick="qhseDashboard.removeCertificateFile('${certId}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        certificatesList.appendChild(certField);
    }

    removeCertificateField(certId) {
        const field = document.querySelector(`[data-cert-id="${certId}"]`);
        if (field && confirm('Zertifikat-Feld entfernen?')) {
            field.remove();
        }
    }

    handleCertificateUpload(certId, fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('Datei ist zu groß. Maximum 5MB erlaubt.');
            fileInput.value = '';
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            alert('Nicht unterstütztes Dateiformat. Nur PDF, JPG und PNG erlaubt.');
            fileInput.value = '';
            return;
        }

        // Read file as base64 for storage
        const reader = new FileReader();
        reader.onload = (e) => {
            const certData = {
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
                uploadDate: new Date().toISOString()
            };

            // Store certificate data
            this.storeCertificateData(certId, certData);
            
            // Update preview
            this.updateCertificatePreview(certId, certData);
        };
        reader.readAsDataURL(file);
    }

    storeCertificateData(certId, certData) {
        if (!this.currentCertificates) {
            this.currentCertificates = {};
        }
        this.currentCertificates[certId] = certData;
    }

    updateCertificatePreview(certId, certData) {
        const preview = document.getElementById(`certPreview_${certId}`);
        if (!preview) return;

        const nameSpan = preview.querySelector('.preview-name');
        const sizeSpan = preview.querySelector('.preview-size');
        const icon = preview.querySelector('.preview-icon');

        nameSpan.textContent = certData.name;
        sizeSpan.textContent = this.formatFileSize(certData.size);
        
        // Update icon based on file type
        if (certData.type === 'application/pdf') {
            icon.className = 'fas fa-file-pdf preview-icon';
        } else {
            icon.className = 'fas fa-file-image preview-icon';
        }

        preview.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    previewCertificate(certId) {
        const certData = this.currentCertificates?.[certId];
        if (!certData) {
            alert('Keine Zertifikat-Daten gefunden.');
            return;
        }

        if (certData.type === 'application/pdf') {
            // Open PDF in new window
            const newWindow = window.open();
            newWindow.document.write(`
                <html>
                    <head><title>${certData.name}</title></head>
                    <body style="margin: 0;">
                        <embed src="${certData.data}" type="application/pdf" width="100%" height="100%">
                    </body>
                </html>
            `);
        } else {
            // Show image in modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${certData.name}</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" style="text-align: center;">
                        <img src="${certData.data}" style="max-width: 100%; max-height: 70vh;" alt="${certData.name}">
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    downloadCertificate(certId) {
        const certData = this.currentCertificates?.[certId];
        if (!certData) {
            alert('Keine Zertifikat-Daten zum Herunterladen gefunden.');
            return;
        }

        // Create download link
        const link = document.createElement('a');
        link.href = certData.data;
        link.download = certData.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    removeCertificateFile(certId) {
        if (confirm('Zertifikat-Datei entfernen?')) {
            const fileInput = document.getElementById(`certFile_${certId}`);
            const preview = document.getElementById(`certPreview_${certId}`);
            
            if (fileInput) fileInput.value = '';
            if (preview) preview.style.display = 'none';
            
            if (this.currentCertificates) {
                delete this.currentCertificates[certId];
            }
        }
    }

    renderCertificateFields() {
        const certificatesList = document.getElementById('modalCertificatesList');
        if (!certificatesList) return;

        // Clear existing fields
        certificatesList.innerHTML = '';

        // If editing existing supplier, load their certificates
        if (this.currentEditingSupplierId) {
            const supplier = this.suppliers.find(s => s.id === this.currentEditingSupplierId);
            if (supplier && supplier.certificates && supplier.certificates.length > 0) {
                supplier.certificates.forEach((cert, index) => {
                    this.addCertificateFieldWithData(cert);
                });
                return;
            }
        }

        // Add one empty certificate field
        this.addCertificateField();
    }

    addCertificateFieldWithData(certData) {
        this.addCertificateField();
        
        // Get the last added field
        const fields = document.querySelectorAll('.certificate-field');
        const lastField = fields[fields.length - 1];
        const certId = lastField.getAttribute('data-cert-id');
        
        // Populate with existing data
        const nameInput = document.getElementById(`certName_${certId}`);
        const validUntilInput = document.getElementById(`certValidUntil_${certId}`);
        
        if (nameInput) nameInput.value = certData.name || '';
        if (validUntilInput) validUntilInput.value = certData.validUntil || '';
        
        // If there's file data, show preview
        if (certData.fileData) {
            this.storeCertificateData(certId, certData.fileData);
            this.updateCertificatePreview(certId, certData.fileData);
        }
    }

    collectCertificateData() {
        const certificates = [];
        const certificateFields = document.querySelectorAll('.certificate-field');
        
        certificateFields.forEach(field => {
            const certId = field.getAttribute('data-cert-id');
            const nameInput = document.getElementById(`certName_${certId}`);
            const validUntilInput = document.getElementById(`certValidUntil_${certId}`);
            
            if (nameInput && nameInput.value.trim()) {
                const certificate = {
                    name: nameInput.value.trim(),
                    validUntil: validUntilInput?.value || '',
                    status: this.calculateCertificateStatus(validUntilInput?.value),
                    fileData: this.currentCertificates?.[certId] || null
                };
                certificates.push(certificate);
            }
        });
        
        return certificates;
    }

    calculateCertificateStatus(validUntil) {
        if (!validUntil) return 'unbekannt';
        
        const expiryDate = new Date(validUntil);
        const today = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);
        
        if (expiryDate < today) {
            return 'abgelaufen';
        } else if (expiryDate < threeMonthsFromNow) {
            return 'läuft ab';
        } else {
            return 'gültig';
        }
    }

    previewSupplierDocument(supplierId, certName) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        const certificate = supplier.certificates?.find(cert => cert.name === certName);
        if (!certificate || !certificate.fileData) {
            alert('Keine Datei für Vorschau verfügbar.');
            return;
        }

        if (certificate.fileData.type === 'application/pdf') {
            const newWindow = window.open();
            newWindow.document.write(`
                <html>
                    <head><title>${certificate.fileData.name}</title></head>
                    <body style="margin: 0;">
                        <embed src="${certificate.fileData.data}" type="application/pdf" width="100%" height="100%">
                    </body>
                </html>
            `);
        } else {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${certificate.fileData.name}</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" style="text-align: center;">
                        <img src="${certificate.fileData.data}" style="max-width: 100%; max-height: 70vh;" alt="${certificate.fileData.name}">
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    downloadSupplierDocument(supplierId, certName) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        const certificate = supplier.certificates?.find(cert => cert.name === certName);
        if (!certificate || !certificate.fileData) {
            alert('Keine Datei zum Herunterladen verfügbar.');
            return;
        }

        const link = document.createElement('a');
        link.href = certificate.fileData.data;
        link.download = certificate.fileData.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    renderRecentSupplierActivity() {
        const container = document.getElementById('recentSupplierActivity');
        if (!container) return;
        
        const activities = [
            { type: 'evaluation', supplier: 'Mustermann Stahl GmbH', date: '2024-01-15', message: 'Bewertung aktualisiert (85%)' },
            { type: 'certificate', supplier: 'Technik Service Nord', date: '2024-01-10', message: 'Zertifikat läuft ab: ISO 45001' },
            { type: 'approval', supplier: 'Entsorgung Hamburg GmbH', date: '2024-01-05', message: 'Freigegeben für Zusammenarbeit' }
        ];

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-supplier">${activity.supplier}</span>
                        <span class="activity-date">${formatDate(activity.date)}</span>
                    </div>
                    <div class="activity-message">${activity.message}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'evaluation': 'star',
            'certificate': 'certificate',
            'approval': 'check-circle',
            'audit': 'search'
        };
        return icons[type] || 'info-circle';
    }

    // Storage functions
    saveSuppliersToStorage(suppliers = null) {
        try {
            const suppliersToSave = suppliers || this.suppliers;
            localStorage.setItem('qhse_suppliers', JSON.stringify(suppliersToSave));
            return true;
        } catch (error) {
            console.error('Error saving suppliers:', error);
            return false;
        }
    }

    // Enhanced quick action methods
    openEvaluationModal(supplierId = null) {
        const modal = document.getElementById('supplierEvaluationModal');
        const form = document.getElementById('evaluationForm');
        const supplierSelect = document.getElementById('evalSupplierSelect');
        
        // Populate supplier dropdown
        supplierSelect.innerHTML = '<option value="">Bitte wählen...</option>';
        this.suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = `${supplier.name} (${supplier.number})`;
            if (supplier.id === supplierId) {
                option.selected = true;
            }
            supplierSelect.appendChild(option);
        });

        if (supplierId) {
            this.loadSupplierEvaluation(supplierId);
        }

        this.setupScoreSliders();
        modal.style.display = 'block';
    }

    loadSupplierEvaluation(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier || !supplier.evaluation) return;

        const criteria = supplier.evaluation.criteria || {};
        document.getElementById('evalQualityScore').value = criteria.quality || 75;
        document.getElementById('evalDeliveryScore').value = criteria.delivery || 75;
        document.getElementById('evalPriceScore').value = criteria.price || 75;
        document.getElementById('evalServiceScore').value = criteria.service || 75;
        document.getElementById('evalNotes').value = supplier.evaluation.notes || '';

        // Update displays
        this.updateEvalOverallScore();
        ['evalQualityScore', 'evalDeliveryScore', 'evalPriceScore', 'evalServiceScore'].forEach(id => {
            const slider = document.getElementById(id);
            const valueSpan = document.getElementById(id + 'Value');
            if (slider && valueSpan) {
                valueSpan.textContent = slider.value + '%';
            }
        });
    }

    saveSupplierEvaluation() {
        const form = document.getElementById('evaluationForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const supplierId = formData.get('evalSupplierSelect');
        
        if (!supplierId) {
            alert('Bitte wählen Sie einen Lieferanten aus.');
            return;
        }

        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        const quality = parseInt(formData.get('evalQualityScore'));
        const delivery = parseInt(formData.get('evalDeliveryScore'));
        const price = parseInt(formData.get('evalPriceScore'));
        const service = parseInt(formData.get('evalServiceScore'));

        supplier.evaluation = {
            score: Math.round((quality + delivery + price + service) / 4),
            lastEvaluated: new Date().toISOString(),
            criteria: { quality, delivery, price, service },
            notes: formData.get('evalNotes')
        };

        // Update status based on score
        if (supplier.evaluation.score >= 80) {
            supplier.status = 'freigegeben';
        } else if (supplier.evaluation.score >= 60) {
            supplier.status = 'kritisch';
        } else {
            supplier.status = 'gesperrt';
        }

        supplier.updatedAt = new Date().toISOString();

        this.saveSuppliersToStorage();
        this.renderSupplierDashboard();
        this.renderSupplierList();

        document.getElementById('supplierEvaluationModal').style.display = 'none';
        alert(`Bewertung für "${supplier.name}" wurde erfolgreich gespeichert (${supplier.evaluation.score}%).`);
    }

    checkCertificates() {
        const expiringSoon = [];
        const expired = [];
        const today = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);

        this.suppliers.forEach(supplier => {
            if (supplier.certificates) {
                supplier.certificates.forEach(cert => {
                    const expiryDate = new Date(cert.validUntil);
                    if (expiryDate < today) {
                        expired.push({supplier: supplier.name, certificate: cert.name, date: cert.validUntil});
                    } else if (expiryDate < threeMonthsFromNow) {
                        expiringSoon.push({supplier: supplier.name, certificate: cert.name, date: cert.validUntil});
                    }
                });
            }
        });

        let message = 'Zertifikatsstatus-Überprüfung:\n\n';
        
        if (expired.length > 0) {
            message += '🔴 ABGELAUFENE ZERTIFIKATE:\n';
            expired.forEach(item => {
                message += `• ${item.supplier}: ${item.certificate} (abgelaufen am ${formatDate(item.date)})\n`;
            });
            message += '\n';
        }

        if (expiringSoon.length > 0) {
            message += '🟡 BALD ABLAUFENDE ZERTIFIKATE (nächste 3 Monate):\n';
            expiringSoon.forEach(item => {
                message += `• ${item.supplier}: ${item.certificate} (läuft ab am ${formatDate(item.date)})\n`;
            });
            message += '\n';
        }

        if (expired.length === 0 && expiringSoon.length === 0) {
            message += '✅ Alle Zertifikate sind aktuell und gültig.';
        }

        alert(message);
    }

    planAudit() {
        const suppliersNeedingAudit = this.suppliers.filter(supplier => {
            const lastEvaluated = supplier.evaluation?.lastEvaluated ? new Date(supplier.evaluation.lastEvaluated) : null;
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            
            return !lastEvaluated || lastEvaluated < oneYearAgo || supplier.evaluation.score < 70;
        });

        let message = 'Audit-Planung:\n\n';
        
        if (suppliersNeedingAudit.length > 0) {
            message += 'Folgende Lieferanten benötigen ein Audit:\n\n';
            suppliersNeedingAudit.forEach(supplier => {
                const reason = supplier.evaluation?.score < 70 ? 'Niedrige Bewertung' : 'Keine aktuelle Bewertung';
                const lastEval = supplier.evaluation?.lastEvaluated ? formatDate(supplier.evaluation.lastEvaluated) : 'Nie';
                message += `• ${supplier.name}\n  Grund: ${reason}\n  Letzte Bewertung: ${lastEval}\n  Aktueller Score: ${supplier.evaluation?.score || 'N/A'}%\n\n`;
            });
        } else {
            message += '✅ Alle Lieferanten sind aktuell bewertet und benötigen derzeit kein Audit.';
        }

        alert(message);
    }

    editSupplier(supplierId) {
        this.showSupplierModal(supplierId);
    }

    evaluateSupplier(supplierId) {
        this.openEvaluationModal(supplierId);
    }

    // Reports functionality
    openReportsModal() {
        const modal = document.getElementById('supplierReportsModal');
        this.setupReportsTabs();
        this.renderSupplierReports();
        modal.style.display = 'block';
    }

    setupReportsTabs() {
        const tabs = document.querySelectorAll('.reports-tab');
        const contents = document.querySelectorAll('.reports-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active content
                contents.forEach(content => {
                    content.classList.toggle('active', content.getAttribute('data-tab') === targetTab);
                });

                // Render specific report content
                this.renderReportContent(targetTab);
            });
        });
    }

    renderSupplierReports() {
        this.renderReportContent('overview');
    }

    renderReportContent(reportType) {
        switch (reportType) {
            case 'overview':
                this.renderOverviewReport();
                break;
            case 'performance':
                this.renderPerformanceReport();
                break;
            case 'compliance':
                this.renderComplianceReport();
                break;
        }
    }

    renderOverviewReport() {
        const container = document.getElementById('supplierOverviewReport');
        const stats = this.calculateSupplierStats();
        
        const typeDistribution = {};
        const statusDistribution = {};
        
        this.suppliers.forEach(supplier => {
            typeDistribution[supplier.type] = (typeDistribution[supplier.type] || 0) + 1;
            statusDistribution[supplier.status] = (statusDistribution[supplier.status] || 0) + 1;
        });

        container.innerHTML = `
            <div class="report-summary">
                <h3>Lieferanten-Übersicht</h3>
                <div class="summary-grid">
                    <div class="summary-card">
                        <h4>Gesamt Lieferanten</h4>
                        <div class="summary-value">${stats.total}</div>
                    </div>
                    <div class="summary-card">
                        <h4>Durchschnittsbewertung</h4>
                        <div class="summary-value">${stats.avgScore}%</div>
                    </div>
                    <div class="summary-card">
                        <h4>Freigegeben</h4>
                        <div class="summary-value success">${stats.approved}</div>
                    </div>
                    <div class="summary-card">
                        <h4>Kritisch</h4>
                        <div class="summary-value warning">${stats.critical}</div>
                    </div>
                </div>
            </div>
            
            <div class="report-charts">
                <div class="chart-section">
                    <h4>Verteilung nach Typ</h4>
                    <div class="chart-bars">
                        ${Object.entries(typeDistribution).map(([type, count]) => `
                            <div class="chart-bar">
                                <span class="bar-label">${this.getTypeLabel(type)}</span>
                                <div class="bar-container">
                                    <div class="bar" style="width: ${(count / stats.total) * 100}%"></div>
                                    <span class="bar-value">${count}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="chart-section">
                    <h4>Verteilung nach Status</h4>
                    <div class="chart-bars">
                        ${Object.entries(statusDistribution).map(([status, count]) => `
                            <div class="chart-bar">
                                <span class="bar-label">${this.getStatusLabel(status)}</span>
                                <div class="bar-container">
                                    <div class="bar status-${status}" style="width: ${(count / stats.total) * 100}%"></div>
                                    <span class="bar-value">${count}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderPerformanceReport() {
        const container = document.getElementById('supplierPerformanceReport');
        
        const topPerformers = [...this.suppliers]
            .filter(s => s.evaluation && s.evaluation.score)
            .sort((a, b) => b.evaluation.score - a.evaluation.score)
            .slice(0, 5);

        const lowPerformers = [...this.suppliers]
            .filter(s => s.evaluation && s.evaluation.score)
            .sort((a, b) => a.evaluation.score - b.evaluation.score)
            .slice(0, 5);

        container.innerHTML = `
            <div class="performance-section">
                <h3>Leistungs-Analyse</h3>
                
                <div class="performance-tables">
                    <div class="performance-table">
                        <h4>🏆 Top Performer</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lieferant</th>
                                    <th>Bewertung</th>
                                    <th>Status</th>
                                    <th>Letzte Bewertung</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${topPerformers.map(supplier => `
                                    <tr>
                                        <td>${supplier.name}</td>
                                        <td><span class="score-badge success">${supplier.evaluation.score}%</span></td>
                                        <td><span class="status-badge status-${supplier.status}">${this.getStatusLabel(supplier.status)}</span></td>
                                        <td>${formatDate(supplier.evaluation.lastEvaluated)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="performance-table">
                        <h4>⚠️ Verbesserung erforderlich</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lieferant</th>
                                    <th>Bewertung</th>
                                    <th>Status</th>
                                    <th>Maßnahmen</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lowPerformers.map(supplier => `
                                    <tr>
                                        <td>${supplier.name}</td>
                                        <td><span class="score-badge ${supplier.evaluation.score < 60 ? 'danger' : 'warning'}">${supplier.evaluation.score}%</span></td>
                                        <td><span class="status-badge status-${supplier.status}">${this.getStatusLabel(supplier.status)}</span></td>
                                        <td>
                                            ${supplier.evaluation.score < 60 ? 'Sofortige Maßnahmen' : 'Überwachung'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    renderComplianceReport() {
        const container = document.getElementById('supplierComplianceReport');
        
        const certificateStatus = {};
        const expiringCertificates = [];
        const today = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);

        this.suppliers.forEach(supplier => {
            if (supplier.certificates) {
                supplier.certificates.forEach(cert => {
                    const expiryDate = new Date(cert.validUntil);
                    if (expiryDate < today) {
                        cert.complianceStatus = 'expired';
                    } else if (expiryDate < threeMonthsFromNow) {
                        cert.complianceStatus = 'expiring';
                        expiringCertificates.push({
                            supplier: supplier.name,
                            certificate: cert.name,
                            expiryDate: cert.validUntil
                        });
                    } else {
                        cert.complianceStatus = 'valid';
                    }
                    
                    certificateStatus[cert.complianceStatus] = (certificateStatus[cert.complianceStatus] || 0) + 1;
                });
            }
        });

        container.innerHTML = `
            <div class="compliance-section">
                <h3>Compliance-Status</h3>
                
                <div class="compliance-summary">
                    <div class="compliance-card">
                        <h4>Gültige Zertifikate</h4>
                        <div class="compliance-value success">${certificateStatus.valid || 0}</div>
                    </div>
                    <div class="compliance-card">
                        <h4>Bald ablaufend</h4>
                        <div class="compliance-value warning">${certificateStatus.expiring || 0}</div>
                    </div>
                    <div class="compliance-card">
                        <h4>Abgelaufen</h4>
                        <div class="compliance-value danger">${certificateStatus.expired || 0}</div>
                    </div>
                </div>
                
                ${expiringCertificates.length > 0 ? `
                    <div class="expiring-certificates">
                        <h4>🚨 Bald ablaufende Zertifikate</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lieferant</th>
                                    <th>Zertifikat</th>
                                    <th>Ablaufdatum</th>
                                    <th>Tage verbleibend</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${expiringCertificates.map(item => {
                                    const daysLeft = Math.ceil((new Date(item.expiryDate) - today) / (1000 * 60 * 60 * 24));
                                    return `
                                        <tr>
                                            <td>${item.supplier}</td>
                                            <td>${item.certificate}</td>
                                            <td>${formatDate(item.expiryDate)}</td>
                                            <td><span class="days-left ${daysLeft <= 30 ? 'danger' : 'warning'}">${daysLeft}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="no-issues">✅ Alle Zertifikate sind aktuell.</p>'}
            </div>
        `;
    }

    // Initialize supplier section specifically
    initializeSupplierSection() {
        console.log('Initializing supplier section...');
        
        // Ensure suppliers are loaded
        if (!this.suppliers || this.suppliers.length === 0) {
            console.log('No suppliers found, loading default suppliers...');
            this.suppliers = this.loadSuppliersFromStorage();
        }
        
        // Render supplier dashboard
        this.renderSupplierDashboard();
        this.renderSupplierList();
        
        // Setup supplier event listeners again to ensure they work
        this.ensureSupplierEventListeners();
        
        console.log(`Supplier section initialized with ${this.suppliers.length} suppliers`);
    }

    ensureSupplierEventListeners() {
        // Ensure Add Supplier Button works
        const addSupplierBtn = document.getElementById('addSupplierBtn');
        if (addSupplierBtn) {
            addSupplierBtn.removeEventListener('click', this.handleAddSupplier);
            addSupplierBtn.addEventListener('click', () => {
                console.log('Add supplier button clicked');
                this.showSupplierModal();
            });
        }

        // Ensure Quick Action Buttons work
        const evaluateBtn = document.getElementById('evaluateSupplierBtn');
        if (evaluateBtn) {
            evaluateBtn.removeEventListener('click', this.handleEvaluateSupplier);
            evaluateBtn.addEventListener('click', () => {
                console.log('Evaluate supplier button clicked');
                this.openEvaluationModal();
            });
        }

        const checkCertBtn = document.getElementById('checkCertificatesBtn');
        if (checkCertBtn) {
            checkCertBtn.removeEventListener('click', this.handleCheckCertificates);
            checkCertBtn.addEventListener('click', () => {
                console.log('Check certificates button clicked');
                this.checkCertificates();
            });
        }

        const planAuditBtn = document.getElementById('planAuditBtn');
        if (planAuditBtn) {
            planAuditBtn.removeEventListener('click', this.handlePlanAudit);
            planAuditBtn.addEventListener('click', () => {
                console.log('Plan audit button clicked');
                this.planAudit();
            });
        }

        // Ensure form submission works
        const supplierForm = document.getElementById('supplierForm');
        if (supplierForm) {
            // Remove any existing listeners first
            const newForm = supplierForm.cloneNode(true);
            supplierForm.parentNode.replaceChild(newForm, supplierForm);
            
            // Add new listener
            newForm.addEventListener('submit', (e) => {
                console.log('Supplier form submitted');
                e.preventDefault();
                this.saveSupplier();
            });
        }

        console.log('Supplier event listeners ensured');
    }

    // ====================================
    // VACATION PLANNING & ABSENCE MANAGEMENT
    // ====================================

    setupVacationManagement() {
        // Prevent double initialization
        if (this.vacationManagementInitialized) {
            console.log('🏖️ Vacation management already initialized, skipping...');
            return;
        }
        
        console.log('🏖️ Setting up vacation management...');
        
        // Load vacation data
        this.vacationRequests = this.loadVacationRequestsFromStorage();
        this.vacationAccounts = this.loadVacationAccountsFromStorage();
        console.log('Vacation data loaded:', {
            requests: this.vacationRequests.length,
            accounts: Object.keys(this.vacationAccounts).length
        });
        
        // Setup UI components with enhanced debugging
        console.log('🔧 Setting up vacation UI components...');
        this.setupVacationTabs();
        this.setupVacationCalendar();
        this.setupVacationForms();
        
        // Render initial content
        console.log('🎨 Rendering vacation dashboard...');
        this.renderVacationDashboard();
        this.updateVacationBalance();
        
        // Force-trigger initial calendar render
        setTimeout(() => {
            console.log('🔄 Force-rendering vacation calendar...');
            this.renderVacationCalendar();
        }, 100);
        
        console.log('✅ Vacation management setup complete');
        
        // Add debug info to window for testing
        window.vacationDebug = {
            requests: this.vacationRequests,
            accounts: this.vacationAccounts,
            dashboard: this
        };
        
        // Final verification
        this.verifyVacationSetup();
        
        // Mark as initialized
        this.vacationManagementInitialized = true;
    }

    verifyVacationSetup() {
        console.log('🔍 Verifying vacation setup...');
        
        const elements = {
            quickVacationRequestBtn: document.getElementById('quickVacationRequestBtn'),
            quickTeamViewBtn: document.getElementById('quickTeamViewBtn'),
            quickApprovalBtn: document.getElementById('quickApprovalBtn'),
            vacationCalendarGrid: document.getElementById('vacationCalendarGrid'),
            vacationCurrentMonth: document.getElementById('vacationCurrentMonth'),
            vacationPrevMonthBtn: document.getElementById('vacationPrevMonthBtn'),
            vacationNextMonthBtn: document.getElementById('vacationNextMonthBtn'),
            vacationTabs: document.querySelectorAll('.vacation-tab-btn'),
            vacationTabPanels: document.querySelectorAll('.vacation-tab-panel')
        };
        
        console.log('Element verification:', {
            quickVacationRequestBtn: !!elements.quickVacationRequestBtn,
            quickTeamViewBtn: !!elements.quickTeamViewBtn,
            quickApprovalBtn: !!elements.quickApprovalBtn,
            vacationCalendarGrid: !!elements.vacationCalendarGrid,
            vacationCurrentMonth: !!elements.vacationCurrentMonth,
            vacationPrevMonthBtn: !!elements.vacationPrevMonthBtn,
            vacationNextMonthBtn: !!elements.vacationNextMonthBtn,
            vacationTabs: elements.vacationTabs.length,
            vacationTabPanels: elements.vacationTabPanels.length
        });
        
        // Test quick action clicks
        if (elements.quickVacationRequestBtn) {
            console.log('✅ Quick vacation request button ready');
        } else {
            console.error('❌ Quick vacation request button missing!');
        }
        
        if (elements.vacationCalendarGrid) {
            console.log('✅ Vacation calendar grid ready');
        } else {
            console.error('❌ Vacation calendar grid missing!');
        }
        
        console.log('🔍 Vacation setup verification complete');
    }

    loadVacationRequestsFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('qhse_vacation_requests') || '[]');
        } catch (error) {
            console.error('Error loading vacation requests:', error);
            return [];
        }
    }

    loadVacationAccountsFromStorage() {
        try {
            const accounts = JSON.parse(localStorage.getItem('qhse_vacation_accounts') || '{}');
            if (Object.keys(accounts).length === 0) {
                return this.initializeDefaultVacationAccounts();
            }
            return accounts;
        } catch (error) {
            console.error('Error loading vacation accounts:', error);
            return this.initializeDefaultVacationAccounts();
        }
    }

    initializeDefaultVacationAccounts() {
        const accounts = {};
        const currentYear = new Date().getFullYear();
        
        this.users.forEach(user => {
            accounts[user.id] = {
                userId: user.id,
                year: currentYear,
                totalDays: 30, // Standard vacation days
                usedDays: 0,
                pendingDays: 0,
                remainingDays: 30,
                carryOverDays: 0,
                carryOverLimit: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        });
        
        this.saveVacationAccountsToStorage(accounts);
        return accounts;
    }

    saveVacationRequestsToStorage() {
        localStorage.setItem('qhse_vacation_requests', JSON.stringify(this.vacationRequests));
    }

    saveVacationAccountsToStorage(accounts = this.vacationAccounts) {
        localStorage.setItem('qhse_vacation_accounts', JSON.stringify(accounts));
    }

    setupVacationTabs() {
        const vacationTabs = document.querySelectorAll('.vacation-tab-btn');
        const vacationTabContents = document.querySelectorAll('.vacation-tab-panel');
        
        console.log('Setting up vacation tabs:', {
            tabButtons: vacationTabs.length,
            tabPanels: vacationTabContents.length
        });

        vacationTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Update active tab
                vacationTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active content
                vacationTabContents.forEach(content => {
                    if (content.id === `vacation-${targetTab}`) {
                        content.classList.add('active');
                        content.style.display = 'block';
                    } else {
                        content.classList.remove('active');
                        content.style.display = 'none';
                    }
                });

                // Render content for active tab
                this.renderVacationTabContent(targetTab);
            });
        });

        // Show calendar tab by default
        this.renderVacationTabContent('calendar');
    }

    setupVacationCalendar() {
        console.log('Setting up vacation calendar...');
        const prevBtn = document.getElementById('vacationPrevMonthBtn');
        const nextBtn = document.getElementById('vacationNextMonthBtn');
        const todayBtn = document.getElementById('vacationTodayBtn');
        
        console.log('Calendar buttons found:', {
            prevBtn: !!prevBtn,
            nextBtn: !!nextBtn,
            todayBtn: !!todayBtn
        });
        const viewButtons = document.querySelectorAll('.view-btn');
        
        console.log('View buttons found:', viewButtons.length);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
                this.renderVacationCalendar();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.renderVacationCalendar();
            });
        }

        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                const today = new Date();
                this.currentMonth = today.getMonth();
                this.currentYear = today.getFullYear();
                this.renderVacationCalendar();
            });
        }

        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active view button
                viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                this.currentVacationView = button.getAttribute('data-view');
                console.log('View changed to:', this.currentVacationView);
                this.renderVacationCalendar();
            });
        });

        this.currentVacationView = 'month';
    }

    setupVacationForms() {
        // Vacation request form
        const vacationRequestForm = document.getElementById('vacationRequestForm');
        if (vacationRequestForm) {
            vacationRequestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitVacationRequest();
            });
        }

        // Quick action buttons with enhanced debugging
        console.log('🔧 Setting up quick action buttons...');
        
        const quickVacationRequestBtn = document.getElementById('quickVacationRequestBtn');
        if (quickVacationRequestBtn) {
            console.log('✅ Quick vacation request button found, adding event listener');
            // Remove any existing listeners first
            quickVacationRequestBtn.replaceWith(quickVacationRequestBtn.cloneNode(true));
            const newBtn = document.getElementById('quickVacationRequestBtn');
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚀 Quick vacation request button clicked!');
                this.showVacationRequestModal();
            });
        } else {
            console.error('❌ Quick vacation request button NOT found!');
        }

        const quickTeamViewBtn = document.getElementById('quickTeamViewBtn');
        if (quickTeamViewBtn) {
            console.log('✅ Quick team view button found, adding event listener');
            quickTeamViewBtn.replaceWith(quickTeamViewBtn.cloneNode(true));
            const newTeamBtn = document.getElementById('quickTeamViewBtn');
            newTeamBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('👥 Quick team view button clicked!');
                this.showTeamVacationView();
            });
        } else {
            console.warn('⚠️ Quick team view button NOT found!');
        }

        const quickApprovalBtn = document.getElementById('quickApprovalBtn');
        if (quickApprovalBtn) {
            console.log('✅ Quick approval button found, adding event listener');
            quickApprovalBtn.replaceWith(quickApprovalBtn.cloneNode(true));
            const newApprovalBtn = document.getElementById('quickApprovalBtn');
            newApprovalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('✅ Quick approval button clicked!');
                this.showVacationApprovalView();
            });
        } else {
            console.warn('⚠️ Quick approval button NOT found!');
        }

        // Section header buttons
        console.log('🔧 Setting up section header buttons...');
        
        const newVacationRequestBtn = document.getElementById('newVacationRequestBtn');
        if (newVacationRequestBtn) {
            newVacationRequestBtn.addEventListener('click', () => {
                console.log('📝 New vacation request button clicked');
                this.showVacationRequestModal();
            });
            console.log('✅ New vacation request button event listener added');
        } else {
            console.warn('⚠️ New vacation request button not found');
        }

        const vacationOverviewBtn = document.getElementById('vacationOverviewBtn');
        if (vacationOverviewBtn) {
            vacationOverviewBtn.addEventListener('click', () => {
                console.log('📊 Vacation overview button clicked');
                this.showVacationOverview();
            });
            console.log('✅ Vacation overview button event listener added');
        } else {
            console.warn('⚠️ Vacation overview button not found');
        }

        const teamCalendarBtn = document.getElementById('teamCalendarBtn');
        if (teamCalendarBtn) {
            teamCalendarBtn.addEventListener('click', () => {
                console.log('👥 Team calendar button clicked');
                this.showTeamVacationView();
            });
            console.log('✅ Team calendar button event listener added');
        } else {
            console.warn('⚠️ Team calendar button not found');
        }

        // Modal close functionality
        const vacationModals = document.querySelectorAll('#vacationRequestModal, #vacationApprovalModal, #vacationDetailsModal');
        vacationModals.forEach(modal => {
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Date validation
        const startDateInput = document.getElementById('vacationStartDate');
        const endDateInput = document.getElementById('vacationEndDate');
        
        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => {
                this.validateVacationDates();
                this.calculateVacationDays();
            });
            
            endDateInput.addEventListener('change', () => {
                this.validateVacationDates();
                this.calculateVacationDays();
            });
        }
    }

    renderVacationDashboard() {
        this.updateVacationStats();
        this.renderVacationQuickActions();
        this.renderVacationNotifications();
    }

    renderVacationTabContent(tab) {
        switch(tab) {
            case 'calendar':
                this.renderVacationCalendar();
                break;
            case 'requests':
                this.renderMyVacationRequests();
                break;
            case 'approval':
                this.renderVacationApprovals();
                break;
            case 'team':
                this.renderTeamVacationOverview();
                break;
            case 'administration':
                this.renderVacationAdministration();
                break;
        }
    }

    renderVacationCalendar() {
        const calendarContainer = document.getElementById('vacationCalendarGrid');
        if (!calendarContainer) return;

        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];

        // Update header
        const monthYearElement = document.getElementById('vacationCurrentMonth');
        if (monthYearElement) {
            monthYearElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }

        // Generate calendar based on current view
        switch(this.currentVacationView) {
            case 'month':
                this.renderMonthView(calendarContainer);
                break;
            case 'week':
                this.renderWeekView(calendarContainer);
                break;
            case 'day':
                this.renderDayView(calendarContainer);
                break;
        }
    }

    renderMonthView(container) {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start on Monday

        let html = `
            <div class="calendar-grid">
                <div class="calendar-header">
                    <div class="calendar-day-header">Mo</div>
                    <div class="calendar-day-header">Di</div>
                    <div class="calendar-day-header">Mi</div>
                    <div class="calendar-day-header">Do</div>
                    <div class="calendar-day-header">Fr</div>
                    <div class="calendar-day-header">Sa</div>
                    <div class="calendar-day-header">So</div>
                </div>
                <div class="calendar-body">
        `;

        const currentDate = new Date(startDate);
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
                const isToday = this.isToday(currentDate);
                const dayVacations = this.getVacationsForDate(currentDate);
                
                html += `
                    <div class="calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}" 
                         data-date="${currentDate.toISOString().split('T')[0]}">
                        <div class="day-number">${currentDate.getDate()}</div>
                        <div class="day-events">
                            ${dayVacations.map(vacation => 
                                `<div class="vacation-event vacation-${vacation.status}" title="${vacation.employee}: ${vacation.type}">
                                    ${vacation.employee.split(' ')[0]}
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                `;
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Add click handlers for days
        container.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', () => {
                const date = day.getAttribute('data-date');
                this.showDayVacationDetails(date);
            });
        });
    }

    renderWeekView(container) {
        // Week view implementation
        const startOfWeek = this.getStartOfWeek(new Date(this.currentYear, this.currentMonth, 1));
        let html = '<div class="week-view">Week view coming soon...</div>';
        container.innerHTML = html;
    }

    renderDayView(container) {
        // Day view implementation
        let html = '<div class="day-view">Day view coming soon...</div>';
        container.innerHTML = html;
    }

    getVacationsForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        const vacations = [];
        
        this.vacationRequests.forEach(request => {
            if (request.status !== 'genehmigt') return;
            
            const startDate = new Date(request.startDate);
            const endDate = new Date(request.endDate);
            const checkDate = new Date(date);
            
            if (checkDate >= startDate && checkDate <= endDate) {
                const user = this.users.find(u => u.id === request.userId);
                vacations.push({
                    employee: user ? user.displayName : 'Unbekannt',
                    type: request.absenceType,
                    status: request.status
                });
            }
        });
        
        return vacations;
    }

    renderMyVacationRequests() {
        const container = document.getElementById('myVacationRequests');
        if (!container) return;

        const currentUser = this.getCurrentUser();
        const myRequests = this.vacationRequests.filter(r => r.userId === currentUser.id);

        if (myRequests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>Keine Urlaubsanträge</h3>
                    <p>Sie haben noch keine Urlaubsanträge gestellt.</p>
                    <button class="btn btn-primary" onclick="window.qhseDashboard.showVacationRequestModal()">
                        <i class="fas fa-plus"></i> Antrag stellen
                    </button>
                </div>
            `;
            return;
        }

        const html = myRequests.map(request => {
            const startDate = new Date(request.startDate).toLocaleDateString('de-DE');
            const endDate = new Date(request.endDate).toLocaleDateString('de-DE');
            const statusClass = this.getVacationStatusClass(request.status);
            
            return `
                <div class="vacation-request-card">
                    <div class="request-header">
                        <div class="request-dates">
                            <i class="fas fa-calendar"></i>
                            ${startDate} - ${endDate} (${request.workingDays} Tage)
                        </div>
                        <span class="status-badge status-${statusClass}">${request.status}</span>
                    </div>
                    <div class="request-details">
                        <div class="detail-row">
                            <span class="label">Typ:</span>
                            <span>${this.getAbsenceTypeName(request.absenceType)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Antragsdatum:</span>
                            <span>${new Date(request.createdAt).toLocaleDateString('de-DE')}</span>
                        </div>
                        ${request.reason ? `
                            <div class="detail-row">
                                <span class="label">Grund:</span>
                                <span>${request.reason}</span>
                            </div>
                        ` : ''}
                        ${request.substitute ? `
                            <div class="detail-row">
                                <span class="label">Vertretung:</span>
                                <span>${this.getUserDisplayName(request.substitute)}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="request-actions">
                        <button class="btn btn-sm btn-outline" onclick="window.qhseDashboard.showVacationDetails('${request.id}')">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        ${request.status === 'eingereicht' ? `
                            <button class="btn btn-sm btn-outline" onclick="window.qhseDashboard.editVacationRequest('${request.id}')">
                                <i class="fas fa-edit"></i> Bearbeiten
                            </button>
                            <button class="btn btn-sm btn-outline btn-danger" onclick="window.qhseDashboard.cancelVacationRequest('${request.id}')">
                                <i class="fas fa-times"></i> Zurückziehen
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    renderVacationApprovals() {
        const container = document.getElementById('pendingApprovalsList');
        if (!container) return;

        const currentUser = this.getCurrentUser();
        const userRoles = this.roleDefinitions[currentUser.role]?.allowedSections || [];
        
        // Check if user can approve vacations
        if (!userRoles.includes('urlaubsplanung') || !['admin', 'root-admin', 'geschaeftsfuehrung', 'betriebsleiter', 'abteilungsleiter'].includes(currentUser.role)) {
            container.innerHTML = `
                <div class="access-denied">
                    <i class="fas fa-lock"></i>
                    <h3>Keine Berechtigung</h3>
                    <p>Sie haben keine Berechtigung, Urlaubsanträge zu genehmigen.</p>
                </div>
            `;
            return;
        }

        const pendingRequests = this.vacationRequests.filter(r => r.status === 'eingereicht');

        if (pendingRequests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>Keine ausstehenden Genehmigungen</h3>
                    <p>Alle Urlaubsanträge wurden bearbeitet.</p>
                </div>
            `;
            return;
        }

        const html = pendingRequests.map(request => {
            const user = this.users.find(u => u.id === request.userId);
            const startDate = new Date(request.startDate).toLocaleDateString('de-DE');
            const endDate = new Date(request.endDate).toLocaleDateString('de-DE');
            
            return `
                <div class="vacation-approval-card">
                    <div class="approval-header">
                        <div class="employee-info">
                            <strong>${user ? user.displayName : 'Unbekannt'}</strong>
                            <span class="department">${user ? user.department : ''}</span>
                        </div>
                        <div class="request-dates">
                            <i class="fas fa-calendar"></i>
                            ${startDate} - ${endDate} (${request.workingDays} Tage)
                        </div>
                    </div>
                    <div class="approval-details">
                        <div class="detail-row">
                            <span class="label">Typ:</span>
                            <span>${this.getAbsenceTypeName(request.absenceType)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Verfügbare Urlaubstage:</span>
                            <span>${this.vacationAccounts[request.userId]?.remainingDays || 0} Tage</span>
                        </div>
                        ${request.reason ? `
                            <div class="detail-row">
                                <span class="label">Grund:</span>
                                <span>${request.reason}</span>
                            </div>
                        ` : ''}
                        ${request.substitute ? `
                            <div class="detail-row">
                                <span class="label">Vertretung:</span>
                                <span>${this.getUserDisplayName(request.substitute)}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="approval-actions">
                        <button class="btn btn-sm btn-success" onclick="window.qhseDashboard.approveVacationRequest('${request.id}')">
                            <i class="fas fa-check"></i> Genehmigen
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.qhseDashboard.rejectVacationRequest('${request.id}')">
                            <i class="fas fa-times"></i> Ablehnen
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="window.qhseDashboard.showVacationApprovalModal('${request.id}')">
                            <i class="fas fa-comment"></i> Mit Kommentar
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    updateVacationStats() {
        const currentUser = this.getCurrentUser();
        const userAccount = this.vacationAccounts[currentUser.id];
        
        if (!userAccount) return;

        // Update vacation balance display
        const remainingElement = document.getElementById('vacationRemainingDays');
        const usedElement = document.getElementById('vacationUsedDays');
        const totalElement = document.getElementById('vacationTotalDays');
        const pendingElement = document.getElementById('vacationPendingDays');

        if (remainingElement) remainingElement.textContent = userAccount.remainingDays;
        if (usedElement) usedElement.textContent = userAccount.usedDays;
        if (totalElement) totalElement.textContent = userAccount.totalDays;
        if (pendingElement) pendingElement.textContent = userAccount.pendingDays;

        // Update dashboard stats
        const totalRequestsElement = document.getElementById('totalVacationRequests');
        const pendingRequestsElement = document.getElementById('pendingVacationRequests');
        const approvedRequestsElement = document.getElementById('approvedVacationRequests');

        if (totalRequestsElement) {
            totalRequestsElement.textContent = this.vacationRequests.length;
        }
        if (pendingRequestsElement) {
            const pending = this.vacationRequests.filter(r => r.status === 'eingereicht').length;
            pendingRequestsElement.textContent = pending;
        }
        if (approvedRequestsElement) {
            const approved = this.vacationRequests.filter(r => r.status === 'genehmigt').length;
            approvedRequestsElement.textContent = approved;
        }
    }

    showVacationRequestModal() {
        console.log('🎯 showVacationRequestModal called');
        const modal = document.getElementById('vacationRequestModal');
        if (!modal) {
            console.error('❌ Vacation request modal not found!');
            alert('Fehler: Urlaubsantrag-Modal nicht gefunden.');
            return;
        }

        console.log('✅ Modal found, setting up form...');

        // Reset form
        const form = document.getElementById('vacationRequestForm');
        if (form) {
            form.reset();
            console.log('✅ Form reset');
        } else {
            console.warn('⚠️ Form not found');
        }

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        const startDateInput = document.getElementById('vacationStartDate');
        const endDateInput = document.getElementById('vacationEndDate');
        
        if (startDateInput) {
            startDateInput.min = today;
            console.log('✅ Start date min set to:', today);
        }
        if (endDateInput) {
            endDateInput.min = today;
            console.log('✅ End date min set to:', today);
        }

        // Populate substitute dropdown
        this.populateSubstituteDropdown();
        console.log('✅ Substitute dropdown populated');

        // Show modal
        modal.style.display = 'block';
        console.log('✅ Modal displayed');
    }

    populateSubstituteDropdown() {
        const select = document.getElementById('vacationSubstitute');
        if (!select) return;

        const currentUser = this.getCurrentUser();
        const colleagues = this.users.filter(u => 
            u.id !== currentUser.id && 
            u.department === currentUser.department &&
            u.role !== 'mitarbeiter'
        );

        select.innerHTML = '<option value="">Keine Vertretung erforderlich</option>';
        colleagues.forEach(user => {
            select.innerHTML += `<option value="${user.id}">${user.displayName}</option>`;
        });
    }

    submitVacationRequest() {
        const form = document.getElementById('vacationRequestForm');
        if (!form) return;

        const formData = new FormData(form);
        const currentUser = this.getCurrentUser();
        
        const request = {
            id: 'VAC_' + Date.now(),
            userId: currentUser.id,
            absenceType: formData.get('vacationType'),
            startDate: formData.get('vacationStartDate'),
            endDate: formData.get('vacationEndDate'),
            workingDays: this.calculateWorkingDays(formData.get('vacationStartDate'), formData.get('vacationEndDate')),
            reason: formData.get('vacationReason') || '',
            substitute: formData.get('vacationSubstitute') || null,
            status: 'eingereicht',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            workflow: [{
                action: 'eingereicht',
                timestamp: new Date().toISOString(),
                userId: currentUser.id,
                comment: 'Antrag eingereicht'
            }]
        };

        // Validate request
        if (!this.validateVacationRequest(request)) return;

        this.vacationRequests.push(request);
        this.saveVacationRequestsToStorage();

        // Update vacation account
        if (request.absenceType === 'urlaub') {
            const userAccount = this.vacationAccounts[currentUser.id];
            if (userAccount) {
                userAccount.pendingDays += request.workingDays;
                this.saveVacationAccountsToStorage();
            }
        }

        // Close modal and refresh display
        document.getElementById('vacationRequestModal').style.display = 'none';
        this.renderVacationTabContent('requests');
        this.updateVacationStats();

        alert('Urlaubsantrag erfolgreich eingereicht!');
    }

    validateVacationRequest(request) {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        const today = new Date();

        if (startDate <= today) {
            alert('Das Startdatum muss in der Zukunft liegen.');
            return false;
        }

        if (endDate <= startDate) {
            alert('Das Enddatum muss nach dem Startdatum liegen.');
            return false;
        }

        if (request.absenceType === 'urlaub') {
            const userAccount = this.vacationAccounts[request.userId];
            if (userAccount && request.workingDays > userAccount.remainingDays) {
                alert('Nicht genügend Urlaubstage verfügbar.');
                return false;
            }
        }

        // Check for conflicts
        const conflicts = this.checkVacationConflicts(request);
        if (conflicts.length > 0) {
            const conflictNames = conflicts.map(c => this.getUserDisplayName(c.userId)).join(', ');
            if (!confirm(`Warnung: Überschneidung mit anderen Urlauben (${conflictNames}). Trotzdem fortfahren?`)) {
                return false;
            }
        }

        return true;
    }

    checkVacationConflicts(request) {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        const conflicts = [];

        const currentUser = this.getCurrentUser();
        const departmentColleagues = this.users.filter(u => 
            u.department === currentUser.department && u.id !== currentUser.id
        );

        departmentColleagues.forEach(colleague => {
            const colleagueRequests = this.vacationRequests.filter(r => 
                r.userId === colleague.id && 
                r.status === 'genehmigt' &&
                r.id !== request.id
            );

            colleagueRequests.forEach(existingRequest => {
                const existingStart = new Date(existingRequest.startDate);
                const existingEnd = new Date(existingRequest.endDate);

                if ((startDate <= existingEnd && endDate >= existingStart)) {
                    conflicts.push(existingRequest);
                }
            });
        });

        return conflicts;
    }

    calculateWorkingDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let workingDays = 0;

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
                workingDays++;
            }
        }

        return workingDays;
    }

    getAbsenceTypeName(type) {
        const types = {
            'urlaub': 'Urlaub',
            'krank': 'Krankheit',
            'fortbildung': 'Fortbildung',
            'elternzeit': 'Elternzeit',
            'sonderurlaub': 'Sonderurlaub',
            'unbezahlt': 'Unbezahlter Urlaub'
        };
        return types[type] || type;
    }

    getVacationStatusClass(status) {
        const classes = {
            'eingereicht': 'pending',
            'genehmigt': 'approved',
            'abgelehnt': 'rejected',
            'storniert': 'cancelled'
        };
        return classes[status] || 'unknown';
    }

    getUserDisplayName(userId) {
        const user = this.users.find(u => u.id === userId);
        return user ? user.displayName : 'Unbekannt';
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getStartOfWeek(date) {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(start.setDate(diff));
    }

    // Additional vacation management methods
    updateVacationBalance() {
        this.updateVacationStats();
    }

    renderVacationQuickActions() {
        // Placeholder for quick actions rendering
        console.log('Rendering vacation quick actions...');
    }

    renderVacationNotifications() {
        // Placeholder for notifications rendering
        console.log('Rendering vacation notifications...');
    }

    renderTeamVacationOverview() {
        const container = document.getElementById('teamAbsencesList');
        if (!container) return;

        const currentUser = this.getCurrentUser();
        const userDepartment = currentUser.department;
        
        // Get team members from same department
        const teamMembers = this.users.filter(u => 
            u.department === userDepartment && u.id !== currentUser.id
        );

        if (teamMembers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Keine Teammitglieder</h3>
                    <p>In Ihrer Abteilung sind keine weiteren Mitarbeiter vorhanden.</p>
                </div>
            `;
            return;
        }

        // Get vacation requests for team members
        const teamRequests = this.vacationRequests.filter(r => 
            teamMembers.some(member => member.id === r.userId) &&
            r.status === 'genehmigt'
        );

        let html = '<div class="team-vacation-grid">';
        
        teamMembers.forEach(member => {
            const memberRequests = teamRequests.filter(r => r.userId === member.id);
            const nextVacation = memberRequests
                .filter(r => new Date(r.startDate) > new Date())
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];

            html += `
                <div class="team-member-card">
                    <div class="member-info">
                        <strong>${member.displayName}</strong>
                        <span class="member-role">${this.roleDefinitions[member.role]?.name}</span>
                    </div>
                    <div class="vacation-status">
                        ${nextVacation ? `
                            <div class="next-vacation">
                                <i class="fas fa-calendar"></i>
                                ${new Date(nextVacation.startDate).toLocaleDateString('de-DE')} - 
                                ${new Date(nextVacation.endDate).toLocaleDateString('de-DE')}
                                <span class="vacation-type">${this.getAbsenceTypeName(nextVacation.absenceType)}</span>
                            </div>
                        ` : `
                            <div class="no-vacation">
                                <i class="fas fa-check-circle"></i>
                                Keine geplanten Abwesenheiten
                            </div>
                        `}
                    </div>
                    <div class="vacation-count">
                        ${memberRequests.length} Urlaube geplant
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderVacationAdministration() {
        // Populate entitlements overview
        const entitlementsContainer = document.getElementById('entitlementsOverview');
        if (entitlementsContainer) {
            const currentUser = this.getCurrentUser();
            
            if (!['admin', 'root-admin'].includes(currentUser.role)) {
                entitlementsContainer.innerHTML = `
                    <div class="access-denied">
                        <i class="fas fa-lock"></i>
                        <p>Keine Berechtigung für Verwaltungsfunktionen.</p>
                    </div>
                `;
            } else {
                let html = '<div class="entitlements-list">';
                Object.values(this.vacationAccounts).forEach(account => {
                    const user = this.users.find(u => u.id === account.userId);
                    if (user) {
                        html += `
                            <div class="entitlement-item">
                                <div class="employee-name">${user.displayName}</div>
                                <div class="entitlement-details">
                                    <span>${account.totalDays} Tage</span>
                                    <span class="used">${account.usedDays} verbraucht</span>
                                    <span class="remaining">${account.remainingDays} verfügbar</span>
                                </div>
                            </div>
                        `;
                    }
                });
                html += '</div>';
                entitlementsContainer.innerHTML = html;
            }
        }

        // Populate holidays overview
        const holidaysContainer = document.getElementById('holidaysOverview');
        if (holidaysContainer) {
            holidaysContainer.innerHTML = `
                <div class="holidays-list">
                    <div class="holiday-item">
                        <span class="holiday-date">01.01.2024</span>
                        <span class="holiday-name">Neujahr</span>
                    </div>
                    <div class="holiday-item">
                        <span class="holiday-date">29.03.2024</span>
                        <span class="holiday-name">Karfreitag</span>
                    </div>
                    <div class="holiday-item">
                        <span class="holiday-date">01.04.2024</span>
                        <span class="holiday-name">Ostermontag</span>
                    </div>
                    <div class="holiday-item">
                        <span class="holiday-date">01.05.2024</span>
                        <span class="holiday-name">Tag der Arbeit</span>
                    </div>
                    <div class="holiday-item">
                        <span class="holiday-date">09.05.2024</span>
                        <span class="holiday-name">Christi Himmelfahrt</span>
                    </div>
                    <div class="holiday-item">
                        <span class="holiday-date">20.05.2024</span>
                        <span class="holiday-name">Pfingstmontag</span>
                    </div>
                    <div class="holiday-item">
                        <span class="holiday-date">03.10.2024</span>
                        <span class="holiday-name">Tag der Deutschen Einheit</span>
                    </div>
                    <div class="holiday-item">
                        <span class="holiday-date">25.12.2024</span>
                        <span class="holiday-name">1. Weihnachtsfeiertag</span>
                    </div>
                    <div class="holiday-item">
                        <span class="holiday-date">26.12.2024</span>
                        <span class="holiday-name">2. Weihnachtsfeiertag</span>
                    </div>
                </div>
            `;
        }

        // Populate reports overview
        const reportsContainer = document.getElementById('reportsOverview');
        if (reportsContainer) {
            const totalRequests = this.vacationRequests.length;
            const pendingRequests = this.vacationRequests.filter(r => r.status === 'eingereicht').length;
            const approvedRequests = this.vacationRequests.filter(r => r.status === 'genehmigt').length;

            reportsContainer.innerHTML = `
                <div class="reports-stats">
                    <div class="stat-item">
                        <div class="stat-value">${totalRequests}</div>
                        <div class="stat-label">Gesamt Anträge</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${pendingRequests}</div>
                        <div class="stat-label">Ausstehend</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${approvedRequests}</div>
                        <div class="stat-label">Genehmigt</div>
                    </div>
                </div>
            `;
        }

        // Setup event listeners for admin buttons
        console.log('🔧 Setting up vacation administration event listeners...');
        
        const exportBtn = document.getElementById('exportDataBtn');
        const reportsBtn = document.getElementById('generateReportsBtn');
        const holidaysBtn = document.getElementById('manageHolidaysBtn');
        const specialRulesBtn = document.getElementById('specialRulesBtn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                console.log('📊 Export button clicked');
                this.exportVacationData();
            });
            console.log('✅ Export button event listener added');
        } else {
            console.warn('⚠️ Export button not found');
        }
        
        if (reportsBtn) {
            reportsBtn.addEventListener('click', () => {
                console.log('📈 Reports button clicked');
                this.generateVacationReport();
            });
            console.log('✅ Reports button event listener added');
        } else {
            console.warn('⚠️ Reports button not found');
        }
        
        if (holidaysBtn) {
            holidaysBtn.addEventListener('click', () => {
                console.log('🎄 Holidays management button clicked');
                this.showHolidaysManagement();
            });
            console.log('✅ Holidays management button event listener added');
        } else {
            console.warn('⚠️ Holidays management button not found');
        }
        
        if (specialRulesBtn) {
            specialRulesBtn.addEventListener('click', () => {
                console.log('⚙️ Special rules button clicked');
                this.showSpecialRulesManagement();
            });
            console.log('✅ Special rules button event listener added');
        } else {
            console.warn('⚠️ Special rules button not found');
        }
    }

    validateVacationDates() {
        const startInput = document.getElementById('vacationStartDate');
        const endInput = document.getElementById('vacationEndDate');
        
        if (!startInput || !endInput) return;

        const startDate = new Date(startInput.value);
        const endDate = new Date(endInput.value);
        
        if (startDate && endDate && endDate < startDate) {
            endInput.setCustomValidity('Enddatum muss nach dem Startdatum liegen');
        } else {
            endInput.setCustomValidity('');
        }
    }

    calculateVacationDays() {
        const startInput = document.getElementById('vacationStartDate');
        const endInput = document.getElementById('vacationEndDate');
        const daysInput = document.getElementById('vacationDays');
        
        if (!startInput || !endInput || !daysInput) return;

        if (startInput.value && endInput.value) {
            const workingDays = this.calculateWorkingDays(startInput.value, endInput.value);
            daysInput.value = workingDays;
            
            // Update summary if elements exist
            const summaryDays = document.getElementById('summaryDays');
            const summaryPeriod = document.getElementById('summaryPeriod');
            
            if (summaryDays) summaryDays.textContent = workingDays;
            if (summaryPeriod) {
                const startDate = new Date(startInput.value).toLocaleDateString('de-DE');
                const endDate = new Date(endInput.value).toLocaleDateString('de-DE');
                summaryPeriod.textContent = `${startDate} - ${endDate}`;
            }
        } else {
            daysInput.value = '';
            const summaryDays = document.getElementById('summaryDays');
            const summaryPeriod = document.getElementById('summaryPeriod');
            if (summaryDays) summaryDays.textContent = '0';
            if (summaryPeriod) summaryPeriod.textContent = '-';
        }
    }

    showDayVacationDetails(date) {
        const vacations = this.getVacationsForDate(new Date(date));
        
        if (vacations.length === 0) {
            alert('Keine Urlaubseinträge für diesen Tag.');
            return;
        }

        const details = vacations.map(v => `${v.employee}: ${this.getAbsenceTypeName(v.type)}`).join('\n');
        alert(`Urlaubseinträge für ${new Date(date).toLocaleDateString('de-DE')}:\n\n${details}`);
    }

    showVacationDetails(requestId) {
        const request = this.vacationRequests.find(r => r.id === requestId);
        if (!request) return;

        const modal = document.getElementById('vacationDetailsModal');
        if (!modal) {
            alert('Details-Modal nicht gefunden.');
            return;
        }

        // Populate modal with request details
        const user = this.users.find(u => u.id === request.userId);
        document.getElementById('detailEmployeeName').textContent = user ? user.displayName : 'Unbekannt';
        document.getElementById('detailVacationType').textContent = this.getAbsenceTypeName(request.absenceType);
        document.getElementById('detailStartDate').textContent = new Date(request.startDate).toLocaleDateString('de-DE');
        document.getElementById('detailEndDate').textContent = new Date(request.endDate).toLocaleDateString('de-DE');
        document.getElementById('detailWorkingDays').textContent = request.workingDays;
        document.getElementById('detailStatus').textContent = request.status;
        document.getElementById('detailReason').textContent = request.reason || 'Kein Grund angegeben';

        modal.style.display = 'block';
    }

    approveVacationRequest(requestId) {
        const request = this.vacationRequests.find(r => r.id === requestId);
        if (!request) return;

        const currentUser = this.getCurrentUser();
        
        // Update request status
        request.status = 'genehmigt';
        request.updatedAt = new Date().toISOString();
        request.workflow.push({
            action: 'genehmigt',
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            comment: 'Antrag genehmigt'
        });

        // Update vacation account
        if (request.absenceType === 'urlaub') {
            const userAccount = this.vacationAccounts[request.userId];
            if (userAccount) {
                userAccount.usedDays += request.workingDays;
                userAccount.pendingDays -= request.workingDays;
                userAccount.remainingDays = userAccount.totalDays - userAccount.usedDays;
                this.saveVacationAccountsToStorage();
            }
        }

        this.saveVacationRequestsToStorage();
        this.renderVacationApprovals();
        this.updateVacationStats();

        alert(`Urlaubsantrag von ${this.getUserDisplayName(request.userId)} wurde genehmigt.`);
    }

    rejectVacationRequest(requestId) {
        const request = this.vacationRequests.find(r => r.id === requestId);
        if (!request) return;

        const reason = prompt('Grund für die Ablehnung (optional):');
        const currentUser = this.getCurrentUser();
        
        // Update request status
        request.status = 'abgelehnt';
        request.updatedAt = new Date().toISOString();
        request.workflow.push({
            action: 'abgelehnt',
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            comment: reason || 'Antrag abgelehnt'
        });

        // Update vacation account (remove pending days)
        if (request.absenceType === 'urlaub') {
            const userAccount = this.vacationAccounts[request.userId];
            if (userAccount) {
                userAccount.pendingDays -= request.workingDays;
                this.saveVacationAccountsToStorage();
            }
        }

        this.saveVacationRequestsToStorage();
        this.renderVacationApprovals();
        this.updateVacationStats();

        alert(`Urlaubsantrag von ${this.getUserDisplayName(request.userId)} wurde abgelehnt.`);
    }

    cancelVacationRequest(requestId) {
        if (!confirm('Möchten Sie den Urlaubsantrag wirklich zurückziehen?')) return;

        const request = this.vacationRequests.find(r => r.id === requestId);
        if (!request) return;

        const currentUser = this.getCurrentUser();
        
        // Update request status
        request.status = 'storniert';
        request.updatedAt = new Date().toISOString();
        request.workflow.push({
            action: 'storniert',
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            comment: 'Antrag zurückgezogen'
        });

        // Update vacation account (remove pending days)
        if (request.absenceType === 'urlaub') {
            const userAccount = this.vacationAccounts[request.userId];
            if (userAccount) {
                userAccount.pendingDays -= request.workingDays;
                this.saveVacationAccountsToStorage();
            }
        }

        this.saveVacationRequestsToStorage();
        this.renderMyVacationRequests();
        this.updateVacationStats();

        alert('Urlaubsantrag wurde zurückgezogen.');
    }

    editVacationRequest(requestId) {
        const request = this.vacationRequests.find(r => r.id === requestId);
        if (!request) return;

        // Pre-fill the modal with existing data
        document.getElementById('vacationStartDate').value = request.startDate;
        document.getElementById('vacationEndDate').value = request.endDate;
        document.getElementById('vacationType').value = request.absenceType;
        document.getElementById('vacationReason').value = request.reason;
        document.getElementById('vacationSubstitute').value = request.substitute || '';

        // Set editing mode
        this.editingVacationRequestId = requestId;
        
        this.showVacationRequestModal();
    }

    showVacationApprovalModal(requestId) {
        const modal = document.getElementById('vacationApprovalModal');
        if (!modal) {
            alert('Approval-Modal nicht gefunden.');
            return;
        }

        const request = this.vacationRequests.find(r => r.id === requestId);
        if (!request) return;

        // Store current request ID for approval
        this.currentApprovalRequestId = requestId;

        modal.style.display = 'block';
    }

    showTeamVacationView() {
        // Switch to team tab
        const teamTab = document.querySelector('.vacation-tab-btn[data-tab="team"]');
        if (teamTab) {
            teamTab.click();
        }
    }

    showVacationApprovalView() {
        // Switch to approval tab
        const approvalTab = document.querySelector('.vacation-tab-btn[data-tab="approval"]');
        if (approvalTab) {
            approvalTab.click();
        }
    }

    showVacationOverview() {
        console.log('📊 Opening vacation overview...');
        
        // Create modal for vacation overview
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'vacationOverviewModal';
        modal.style.display = 'block';
        
        const currentYear = new Date().getFullYear();
        const allRequests = this.vacationRequests || [];
        const yearRequests = allRequests.filter(r => 
            new Date(r.startDate).getFullYear() === currentYear
        );
        
        // Calculate statistics
        const stats = {
            total: yearRequests.length,
            pending: yearRequests.filter(r => r.status === 'eingereicht').length,
            approved: yearRequests.filter(r => r.status === 'genehmigt').length,
            rejected: yearRequests.filter(r => r.status === 'abgelehnt').length,
            cancelled: yearRequests.filter(r => r.status === 'zurueckgezogen').length
        };
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-bar"></i> Urlaubsübersicht ${currentYear}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="vacation-overview">
                        <div class="overview-stats">
                            <h3>Jahresstatistik ${currentYear}</h3>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-number">${stats.total}</div>
                                    <div class="stat-label">Gesamt Anträge</div>
                                </div>
                                <div class="stat-item pending">
                                    <div class="stat-number">${stats.pending}</div>
                                    <div class="stat-label">Ausstehend</div>
                                </div>
                                <div class="stat-item approved">
                                    <div class="stat-number">${stats.approved}</div>
                                    <div class="stat-label">Genehmigt</div>
                                </div>
                                <div class="stat-item rejected">
                                    <div class="stat-number">${stats.rejected}</div>
                                    <div class="stat-label">Abgelehnt</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="overview-chart">
                            <h3>Monatsverteilung</h3>
                            <div class="month-chart">
                                ${this.renderMonthlyVacationChart(yearRequests)}
                            </div>
                        </div>
                        
                        <div class="overview-departments">
                            <h3>Nach Abteilungen</h3>
                            <div class="departments-list">
                                ${this.renderDepartmentVacationStats(yearRequests)}
                            </div>
                        </div>
                        
                        <div class="overview-actions">
                            <button class="btn-primary" onclick="window.qhseDashboard.generateVacationReport()">
                                <i class="fas fa-file-alt"></i> Bericht generieren
                            </button>
                            <button class="btn-secondary" onclick="window.qhseDashboard.exportVacationData()">
                                <i class="fas fa-download"></i> Daten exportieren
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderMonthlyVacationChart(requests) {
        const months = [
            'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
            'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
        ];
        
        const monthlyData = Array(12).fill(0);
        requests.forEach(request => {
            const month = new Date(request.startDate).getMonth();
            monthlyData[month]++;
        });
        
        const maxValue = Math.max(...monthlyData, 1);
        
        return months.map((month, index) => {
            const height = (monthlyData[index] / maxValue) * 100;
            return `
                <div class="month-bar">
                    <div class="bar-fill" style="height: ${height}%"></div>
                    <div class="month-label">${month}</div>
                    <div class="month-value">${monthlyData[index]}</div>
                </div>
            `;
        }).join('');
    }

    renderDepartmentVacationStats(requests) {
        const departments = {};
        
        requests.forEach(request => {
            const user = this.users.find(u => u.id === request.userId);
            const dept = user ? user.department : 'Unbekannt';
            
            if (!departments[dept]) {
                departments[dept] = { total: 0, approved: 0, pending: 0 };
            }
            
            departments[dept].total++;
            if (request.status === 'genehmigt') departments[dept].approved++;
            if (request.status === 'eingereicht') departments[dept].pending++;
        });
        
        return Object.entries(departments).map(([dept, stats]) => `
            <div class="department-stat">
                <div class="department-name">${dept}</div>
                <div class="department-numbers">
                    <span class="total">${stats.total} gesamt</span>
                    <span class="approved">${stats.approved} genehmigt</span>
                    <span class="pending">${stats.pending} ausstehend</span>
                </div>
            </div>
        `).join('');
    }

    exportVacationData() {
        const data = {
            requests: this.vacationRequests,
            accounts: this.vacationAccounts,
            exportDate: new Date().toISOString(),
            users: this.users.map(u => ({ id: u.id, displayName: u.displayName, department: u.department }))
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `urlaubsdaten_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('Urlaubsdaten wurden exportiert.');
    }

    generateVacationReport() {
        const currentYear = new Date().getFullYear();
        const yearRequests = this.vacationRequests.filter(r => 
            new Date(r.startDate).getFullYear() === currentYear
        );
        
        let report = `URLAUBSBERICHT ${currentYear}\n`;
        report += `===========================================\n\n`;
        report += `Gesamtstatistiken:\n`;
        report += `- Anträge gesamt: ${yearRequests.length}\n`;
        report += `- Genehmigt: ${yearRequests.filter(r => r.status === 'genehmigt').length}\n`;
        report += `- Abgelehnt: ${yearRequests.filter(r => r.status === 'abgelehnt').length}\n`;
        report += `- Ausstehend: ${yearRequests.filter(r => r.status === 'eingereicht').length}\n\n`;
        
        // Group by department
        const departments = {};
        yearRequests.forEach(request => {
            const user = this.users.find(u => u.id === request.userId);
            const dept = user ? user.department : 'Unbekannt';
            if (!departments[dept]) departments[dept] = [];
            departments[dept].push(request);
        });
        
        report += `Nach Abteilungen:\n`;
        Object.entries(departments).forEach(([dept, requests]) => {
            report += `- ${dept}: ${requests.length} Anträge\n`;
        });
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `urlaubsbericht_${currentYear}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('Urlaubsbericht wurde erstellt.');
    }

    showHolidaysManagement() {
        console.log('🎄 Opening holidays management...');
        
        // Create modal for holidays management
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'holidaysManagementModal';
        modal.style.display = 'block';
        
        const currentYear = new Date().getFullYear();
        const holidays = this.loadHolidaysFromStorage();
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-calendar-plus"></i> Feiertage verwalten - ${currentYear}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="holidays-management">
                        <div class="holidays-form">
                            <h3>Neuen Feiertag hinzufügen</h3>
                            <form id="addHolidayForm">
                                <div class="form-group">
                                    <label for="holidayDate">Datum:</label>
                                    <input type="date" id="holidayDate" name="holidayDate" required>
                                </div>
                                <div class="form-group">
                                    <label for="holidayName">Name:</label>
                                    <input type="text" id="holidayName" name="holidayName" placeholder="z.B. Neujahr" required>
                                </div>
                                <div class="form-group">
                                    <label for="holidayType">Typ:</label>
                                    <select id="holidayType" name="holidayType">
                                        <option value="national">Bundesfeiertag</option>
                                        <option value="regional">Regionaler Feiertag</option>
                                        <option value="company">Betriebsfeiertag</option>
                                    </select>
                                </div>
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-plus"></i> Hinzufügen
                                </button>
                            </form>
                        </div>
                        <div class="holidays-list">
                            <h3>Aktuelle Feiertage ${currentYear}</h3>
                            <div id="holidaysList">
                                ${this.renderHolidaysList(holidays)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup event listeners for the form
        const form = document.getElementById('addHolidayForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addHoliday();
            });
        }
        
        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showSpecialRulesManagement() {
        console.log('⚙️ Opening special rules management...');
        
        // Create modal for special rules management
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'specialRulesModal';
        modal.style.display = 'block';
        
        const specialRules = this.loadSpecialRulesFromStorage();
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-cogs"></i> Sonderregelungen verwalten</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="special-rules-management">
                        <div class="rules-form">
                            <h3>Neue Sonderregelung hinzufügen</h3>
                            <form id="addSpecialRuleForm">
                                <div class="form-group">
                                    <label for="ruleTitle">Titel:</label>
                                    <input type="text" id="ruleTitle" name="ruleTitle" placeholder="z.B. Homeoffice-Regelung" required>
                                </div>
                                <div class="form-group">
                                    <label for="ruleDescription">Beschreibung:</label>
                                    <textarea id="ruleDescription" name="ruleDescription" rows="3" 
                                              placeholder="Beschreibung der Sonderregelung..." required></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="ruleCategory">Kategorie:</label>
                                    <select id="ruleCategory" name="ruleCategory">
                                        <option value="vacation">Urlaubsregelung</option>
                                        <option value="working_time">Arbeitszeit</option>
                                        <option value="approval">Genehmigungsverfahren</option>
                                        <option value="calculation">Berechnung</option>
                                        <option value="other">Sonstiges</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="ruleApplicable">Gültig für:</label>
                                    <select id="ruleApplicable" name="ruleApplicable" multiple>
                                        ${this.getAllDepartments().map(dept => 
                                            `<option value="${dept}">${dept}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="ruleActive" name="ruleActive" checked>
                                        Regel aktiv
                                    </label>
                                </div>
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-plus"></i> Hinzufügen
                                </button>
                            </form>
                        </div>
                        <div class="rules-list">
                            <h3>Aktuelle Sonderregelungen</h3>
                            <div id="specialRulesList">
                                ${this.renderSpecialRulesList(specialRules)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup event listeners for the form
        const form = document.getElementById('addSpecialRuleForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addSpecialRule();
            });
        }
        
        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // ====================================
    // HOLIDAYS & SPECIAL RULES MANAGEMENT
    // ====================================

    loadHolidaysFromStorage() {
        try {
            const holidays = JSON.parse(localStorage.getItem('qhse_holidays') || '[]');
            // Initialize with default German holidays if empty
            if (holidays.length === 0) {
                return this.getDefaultGermanHolidays();
            }
            return holidays;
        } catch (error) {
            console.error('Error loading holidays:', error);
            return this.getDefaultGermanHolidays();
        }
    }

    saveHolidaysToStorage(holidays = this.holidays) {
        localStorage.setItem('qhse_holidays', JSON.stringify(holidays));
    }

    getDefaultGermanHolidays() {
        const currentYear = new Date().getFullYear();
        return [
            { id: 'new-year', date: `${currentYear}-01-01`, name: 'Neujahr', type: 'national' },
            { id: 'good-friday', date: `${currentYear}-03-29`, name: 'Karfreitag', type: 'national' },
            { id: 'easter-monday', date: `${currentYear}-04-01`, name: 'Ostermontag', type: 'national' },
            { id: 'labor-day', date: `${currentYear}-05-01`, name: 'Tag der Arbeit', type: 'national' },
            { id: 'ascension', date: `${currentYear}-05-09`, name: 'Christi Himmelfahrt', type: 'national' },
            { id: 'whit-monday', date: `${currentYear}-05-20`, name: 'Pfingstmontag', type: 'national' },
            { id: 'german-unity', date: `${currentYear}-10-03`, name: 'Tag der Deutschen Einheit', type: 'national' },
            { id: 'christmas-eve', date: `${currentYear}-12-24`, name: 'Heiligabend', type: 'company' },
            { id: 'christmas', date: `${currentYear}-12-25`, name: '1. Weihnachtstag', type: 'national' },
            { id: 'boxing-day', date: `${currentYear}-12-26`, name: '2. Weihnachtstag', type: 'national' },
            { id: 'new-years-eve', date: `${currentYear}-12-31`, name: 'Silvester', type: 'company' }
        ];
    }

    renderHolidaysList(holidays) {
        if (!holidays || holidays.length === 0) {
            return '<div class="no-holidays">Keine Feiertage definiert</div>';
        }

        return holidays.map(holiday => {
            const date = new Date(holiday.date);
            const formattedDate = date.toLocaleDateString('de-DE');
            const typeIcon = {
                'national': '🇩🇪',
                'regional': '🏛️',
                'company': '🏢'
            }[holiday.type] || '📅';

            return `
                <div class="holiday-item" data-holiday-id="${holiday.id}">
                    <div class="holiday-info">
                        <span class="holiday-icon">${typeIcon}</span>
                        <span class="holiday-date">${formattedDate}</span>
                        <span class="holiday-name">${holiday.name}</span>
                        <span class="holiday-type">${holiday.type}</span>
                    </div>
                    <div class="holiday-actions">
                        <button class="btn-secondary btn-small" onclick="window.qhseDashboard.editHoliday('${holiday.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-danger btn-small" onclick="window.qhseDashboard.deleteHoliday('${holiday.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    addHoliday() {
        const form = document.getElementById('addHolidayForm');
        if (!form) return;

        const formData = new FormData(form);
        const holidayData = {
            id: 'holiday-' + Date.now(),
            date: formData.get('holidayDate'),
            name: formData.get('holidayName'),
            type: formData.get('holidayType'),
            createdAt: new Date().toISOString()
        };

        const holidays = this.loadHolidaysFromStorage();
        holidays.push(holidayData);
        this.saveHolidaysToStorage(holidays);

        // Update display
        const holidaysList = document.getElementById('holidaysList');
        if (holidaysList) {
            holidaysList.innerHTML = this.renderHolidaysList(holidays);
        }

        // Reset form
        form.reset();
        
        console.log('✅ Holiday added:', holidayData);
        alert('Feiertag wurde hinzugefügt!');
    }

    deleteHoliday(holidayId) {
        if (!confirm('Möchten Sie diesen Feiertag wirklich löschen?')) return;

        let holidays = this.loadHolidaysFromStorage();
        holidays = holidays.filter(h => h.id !== holidayId);
        this.saveHolidaysToStorage(holidays);

        // Update display
        const holidaysList = document.getElementById('holidaysList');
        if (holidaysList) {
            holidaysList.innerHTML = this.renderHolidaysList(holidays);
        }

        console.log('✅ Holiday deleted:', holidayId);
        alert('Feiertag wurde gelöscht!');
    }

    editHoliday(holidayId) {
        const holidays = this.loadHolidaysFromStorage();
        const holiday = holidays.find(h => h.id === holidayId);
        if (!holiday) return;

        // Pre-fill form with existing data
        document.getElementById('holidayDate').value = holiday.date;
        document.getElementById('holidayName').value = holiday.name;
        document.getElementById('holidayType').value = holiday.type;

        // Remove old holiday and let user re-add with changes
        this.deleteHoliday(holidayId);
    }

    // Special Rules Management
    loadSpecialRulesFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('qhse_special_rules') || '[]');
        } catch (error) {
            console.error('Error loading special rules:', error);
            return [];
        }
    }

    saveSpecialRulesToStorage(rules) {
        localStorage.setItem('qhse_special_rules', JSON.stringify(rules));
    }

    renderSpecialRulesList(rules) {
        if (!rules || rules.length === 0) {
            return '<div class="no-rules">Keine Sonderregelungen definiert</div>';
        }

        return rules.map(rule => {
            const statusIcon = rule.active ? '✅' : '❌';
            const categoryIcon = {
                'vacation': '🏖️',
                'working_time': '⏰',
                'approval': '✅',
                'calculation': '🧮',
                'other': '📋'
            }[rule.category] || '📋';

            return `
                <div class="rule-item ${rule.active ? 'active' : 'inactive'}" data-rule-id="${rule.id}">
                    <div class="rule-header">
                        <span class="rule-icon">${categoryIcon}</span>
                        <h4 class="rule-title">${rule.title}</h4>
                        <span class="rule-status">${statusIcon}</span>
                    </div>
                    <div class="rule-description">${rule.description}</div>
                    <div class="rule-meta">
                        <span class="rule-category">Kategorie: ${rule.category}</span>
                        <span class="rule-departments">Gültig für: ${rule.applicableDepartments?.join(', ') || 'Alle'}</span>
                    </div>
                    <div class="rule-actions">
                        <button class="btn-secondary btn-small" onclick="window.qhseDashboard.editSpecialRule('${rule.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-${rule.active ? 'warning' : 'success'} btn-small" 
                                onclick="window.qhseDashboard.toggleSpecialRule('${rule.id}')">
                            <i class="fas fa-${rule.active ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="btn-danger btn-small" onclick="window.qhseDashboard.deleteSpecialRule('${rule.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    addSpecialRule() {
        const form = document.getElementById('addSpecialRuleForm');
        if (!form) return;

        const formData = new FormData(form);
        const ruleData = {
            id: 'rule-' + Date.now(),
            title: formData.get('ruleTitle'),
            description: formData.get('ruleDescription'),
            category: formData.get('ruleCategory'),
            applicableDepartments: Array.from(formData.getAll('ruleApplicable')),
            active: formData.get('ruleActive') === 'on',
            createdAt: new Date().toISOString(),
            createdBy: this.getCurrentUser().id
        };

        const rules = this.loadSpecialRulesFromStorage();
        rules.push(ruleData);
        this.saveSpecialRulesToStorage(rules);

        // Update display
        const rulesList = document.getElementById('specialRulesList');
        if (rulesList) {
            rulesList.innerHTML = this.renderSpecialRulesList(rules);
        }

        // Reset form
        form.reset();
        
        console.log('✅ Special rule added:', ruleData);
        alert('Sonderregelung wurde hinzugefügt!');
    }

    deleteSpecialRule(ruleId) {
        if (!confirm('Möchten Sie diese Sonderregelung wirklich löschen?')) return;

        let rules = this.loadSpecialRulesFromStorage();
        rules = rules.filter(r => r.id !== ruleId);
        this.saveSpecialRulesToStorage(rules);

        // Update display
        const rulesList = document.getElementById('specialRulesList');
        if (rulesList) {
            rulesList.innerHTML = this.renderSpecialRulesList(rules);
        }

        console.log('✅ Special rule deleted:', ruleId);
        alert('Sonderregelung wurde gelöscht!');
    }

    toggleSpecialRule(ruleId) {
        const rules = this.loadSpecialRulesFromStorage();
        const rule = rules.find(r => r.id === ruleId);
        if (!rule) return;

        rule.active = !rule.active;
        rule.updatedAt = new Date().toISOString();
        rule.updatedBy = this.getCurrentUser().id;

        this.saveSpecialRulesToStorage(rules);

        // Update display
        const rulesList = document.getElementById('specialRulesList');
        if (rulesList) {
            rulesList.innerHTML = this.renderSpecialRulesList(rules);
        }

        console.log('✅ Special rule toggled:', rule);
        alert(`Sonderregelung wurde ${rule.active ? 'aktiviert' : 'deaktiviert'}!`);
    }

    editSpecialRule(ruleId) {
        const rules = this.loadSpecialRulesFromStorage();
        const rule = rules.find(r => r.id === ruleId);
        if (!rule) return;

        // Pre-fill form with existing data
        document.getElementById('ruleTitle').value = rule.title;
        document.getElementById('ruleDescription').value = rule.description;
        document.getElementById('ruleCategory').value = rule.category;
        document.getElementById('ruleActive').checked = rule.active;

        // Set multiple select values
        const departmentSelect = document.getElementById('ruleApplicable');
        if (departmentSelect && rule.applicableDepartments) {
            Array.from(departmentSelect.options).forEach(option => {
                option.selected = rule.applicableDepartments.includes(option.value);
            });
        }

        // Remove old rule and let user re-add with changes
        this.deleteSpecialRule(ruleId);
    }

    getAllDepartments() {
        return [...new Set(this.users.map(user => user.department).filter(dept => dept))];
    }

    resetVacationYear() {
        if (!confirm('Möchten Sie wirklich ein neues Urlaubsjahr starten? Dies setzt alle Urlaubskonten zurück.')) {
            return;
        }
        
        const currentYear = new Date().getFullYear();
        
        // Reset all vacation accounts for new year
        Object.keys(this.vacationAccounts).forEach(userId => {
            const account = this.vacationAccounts[userId];
            account.year = currentYear;
            account.usedDays = 0;
            account.pendingDays = 0;
            account.remainingDays = account.totalDays + account.carryOverDays;
            account.carryOverDays = Math.min(account.remainingDays, account.carryOverLimit);
            account.updatedAt = new Date().toISOString();
        });
        
        this.saveVacationAccountsToStorage();
        this.updateVacationStats();
        
        alert('Neues Urlaubsjahr wurde initialisiert.');
    }

}

// Global dashboard instance for onclick handlers
// Dashboard will be initialized in index.html
// This allows for proper global access to the instance

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

// Global dashboard instance for onclick handlers
// Dashboard will be initialized in index.html
// This allows for proper global access to the instance

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

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.qhseDashboard = new QHSEDashboard();
});
