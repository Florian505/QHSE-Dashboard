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
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'nutzerverwaltung', 'bereichsverwaltung', 'abteilungsverwaltung', 'zeiterfassung', 'zeitauswertung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'gefahrstoffe', 'einstellungen', 'mein-profil'],
                canManageUsers: true,
                canManageAreas: true,
                canManageDepartments: true,
                canViewAllTimeEntries: true
            },
            admin: {
                name: 'Administrator',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'nutzerverwaltung', 'bereichsverwaltung', 'abteilungsverwaltung', 'zeiterfassung', 'zeitauswertung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'gefahrstoffe', 'mein-profil'],
                canManageUsers: true,
                canManageAreas: true,
                canManageDepartments: true,
                canViewAllTimeEntries: true
            },
            geschaeftsfuehrung: {
                name: 'Geschäftsführung',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'gefahrstoffe', 'mein-profil'],
                hierarchyLevel: 1,
                canSupervise: ['betriebsleiter', 'qhse']
            },
            betriebsleiter: {
                name: 'Betriebsleiter',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'gefahrstoffe', 'mein-profil'],
                hierarchyLevel: 2,
                canSupervise: ['abteilungsleiter'],
                mustHaveSupervisor: ['geschaeftsfuehrung']
            },
            abteilungsleiter: {
                name: 'Abteilungsleiter',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'gefahrstoffe', 'mein-profil'],
                hierarchyLevel: 3,
                canSupervise: ['mitarbeiter'],
                mustHaveSupervisor: ['betriebsleiter']
            },
            qhse: {
                name: 'QHSE-Mitarbeiter',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'verfahrensanweisungen', 'audits', 'kundenzufriedenheit', 'dokumente', 'zeiterfassung', 'gefahrstoffe', 'mein-profil'],
                hierarchyLevel: 2,
                isStaffPosition: true,
                mustHaveSupervisor: ['geschaeftsfuehrung']
            },
            mitarbeiter: {
                name: 'Mitarbeiter',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'audits', 'zeiterfassung', 'gefahrstoffe', 'mein-profil'],
                hierarchyLevel: 4,
                mustHaveSupervisor: ['abteilungsleiter']
            },
            techniker: {
                name: 'Techniker',
                allowedSections: ['dashboard', 'sicherheitsecke', 'arbeitsanweisungen', 'audits', 'zeiterfassung', 'maschinen', 'wartungsplanung', 'stoerungen', 'instandhaltung-auswertung', 'gefahrstoffe', 'mein-profil'],
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
                    einstellungen: 'System-Einstellungen'
                };
                
                pageTitle.textContent = sectionTitles[targetSection] || (localStorage.getItem('qhse_dashboard_name') || 'Dashboard');
                this.currentSection = targetSection;
                
                // Section-specific initialization
                if (targetSection === 'einstellungen') {
                    this.populatePermissionUserDropdown();
                } else if (targetSection === 'mein-profil') {
                    // Show profile modal when navigating to profile section
                    setTimeout(() => this.showCurrentUserProfile(false), 100);
                }
            });
        });
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
            substanceReportsBtn.addEventListener('click', () => this.openSubstanceReports());
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
        
        this.populateReportDepartmentDropdown();
        
        // Event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const generateBtn = modal.querySelector('#generateReportBtn');
        const previewBtn = modal.querySelector('#previewReportBtn');
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        generateBtn.addEventListener('click', () => {
            this.generateSubstanceReport();
        });
        
        previewBtn.addEventListener('click', () => {
            this.previewSubstanceReport();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
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
        const reportType = document.getElementById('reportType').value;
        const department = document.getElementById('reportDepartment').value;
        const format = document.getElementById('reportFormat').value;
        
        const reportData = this.prepareSubstanceReportData(reportType, department);
        
        if (format === 'pdf') {
            this.exportSubstanceReportAsPDF(reportData, reportType);
        } else if (format === 'csv') {
            this.exportSubstanceReportAsCSV(reportData, reportType);
        } else if (format === 'excel') {
            this.exportSubstanceReportAsExcel(reportData, reportType);
        }
    }
    
    previewSubstanceReport() {
        const reportType = document.getElementById('reportType').value;
        const department = document.getElementById('reportDepartment').value;
        
        const reportData = this.prepareSubstanceReportData(reportType, department);
        const previewDiv = document.getElementById('reportPreview');
        const contentDiv = document.getElementById('reportContent');
        
        let html = this.generateReportHTML(reportData, reportType);
        contentDiv.innerHTML = html;
        previewDiv.style.display = 'block';
    }
    
    prepareSubstanceReportData(reportType, departmentFilter) {
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
                    <td>${department?.name || 'Nicht zugeordnet'}</td>
                    <td>${substance.quantity || 'Nicht angegeben'} ${substance.unit || ''}</td>
                    <td>${substance.storageLocation || 'Nicht angegeben'}</td>
                    <td>${expiryDate}</td>
                    <td>${substance.hazardClass || 'Nicht klassifiziert'}</td>
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

