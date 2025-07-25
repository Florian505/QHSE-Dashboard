/**
 * QHSE Incident Smart Suggestions Module
 * Intelligente Vorschläge und automatische Feld-Vorausfüllung
 * für Unfall- und Beinahe-Unfall-Meldungen
 */

class IncidentSmartSuggestions {
    constructor() {
        this.suggestionDatabase = this.initializeSuggestionDatabase();
        this.contextualHelp = this.initializeContextualHelp();
        this.wizardSteps = this.initializeWizardSteps();
        this.isWizardMode = false;
        this.currentWizardStep = 0;
    }

    /**
     * Datenbank mit intelligenten Vorschlägen basierend auf Ereigniskategorien
     */
    initializeSuggestionDatabase() {
        return {
            // ARBEITSUNFÄLLE
            'sturz-absturz': {
                location: ['Treppe', 'Leiter', 'Gerüst', 'Arbeitsplattform', 'Lager'],
                activity: ['Wartungsarbeiten', 'Reinigungsarbeiten', 'Transport von Material', 'Inspektion'],
                causes: ['rutschige-oberflaeche', 'defekte-ausruestung', 'unzureichende-sicherung'],
                bodyParts: ['Kopf', 'Rücken', 'Arm', 'Bein', 'Handgelenk'],
                severity: 'mittel',
                medicalTreatment: 'arzt-behandlung',
                preventiveMeasures: [
                    'Rutschfeste Beläge installieren',
                    'Sicherheitsgeländer prüfen',
                    'Schulung zu sicherem Arbeiten in der Höhe',
                    'Persönliche Schutzausrüstung überprüfen'
                ]
            },
            'schnitt-stichverletzung': {
                location: ['Werkstatt', 'Küche', 'Lager', 'Produktion'],
                activity: ['Schneidarbeiten', 'Werkzeugwartung', 'Materialbearbeitung', 'Verpackung'],
                causes: ['stumpfes-werkzeug', 'unsachgemaesse-handhabung', 'fehlende-schutzausruestung'],
                bodyParts: ['Hand', 'Finger', 'Arm', 'Unterarm'],
                severity: 'niedrig',
                medicalTreatment: 'erste-hilfe',
                preventiveMeasures: [
                    'Regelmäßige Werkzeugwartung',
                    'Schutzhandschuhe bereitstellen',
                    'Schulung zu sicherem Umgang mit Werkzeugen',
                    'Schutzvorrichtungen an Maschinen prüfen'
                ]
            },
            'quetschung-einklemmung': {
                location: ['Produktion', 'Lager', 'Werkstatt', 'Außenbereich'],
                activity: ['Maschinenbedienung', 'Transport schwerer Gegenstände', 'Wartungsarbeiten'],
                causes: ['defekte-sicherheitsvorrichtung', 'unsachgemaesse-bedienung', 'technischer-defekt'],
                bodyParts: ['Hand', 'Finger', 'Fuß', 'Bein'],
                severity: 'mittel',
                medicalTreatment: 'arzt-behandlung',
                preventiveMeasures: [
                    'Sicherheitsvorrichtungen regelmäßig prüfen',
                    'Zwei-Hand-Bedienung sicherstellen',
                    'Schulung zu Maschinensicherheit',
                    'Arbeitsschutzkleidung bereitstellen'
                ]
            },
            
            // BEINAHE-UNFÄLLE
            'beinahe-sturz': {
                location: ['Treppe', 'Boden', 'Arbeitsplatz', 'Außenbereich'],
                activity: ['Gehen', 'Laufen', 'Transport', 'Inspektion'],
                causes: ['rutschige-oberflaeche', 'schlechte-beleuchtung', 'unebener-boden'],
                severity: 'niedrig',
                preventiveMeasures: [
                    'Bodenbelag verbessern',
                    'Beleuchtung optimieren',
                    'Warnschilder aufstellen',
                    'Regelmäßige Reinigung der Gehwege'
                ]
            },
            'technischer-defekt': {
                location: ['Produktion', 'Werkstatt', 'Labor', 'Büro'],
                activity: ['Maschinenbedienung', 'Wartung', 'Qualitätskontrolle'],
                causes: ['verschleiss', 'wartungsmangel', 'unsachgemaesse-bedienung'],
                severity: 'mittel',
                preventiveMeasures: [
                    'Wartungsplan überarbeiten',
                    'Verschleißteile rechtzeitig tauschen',
                    'Mitarbeiterschulung intensivieren',
                    'Regelmäßige Sicherheitsinspektionen'
                ]
            },

            // UMWELTEREIGNISSE
            'chemikalienaustritt': {
                location: ['Labor', 'Lager', 'Produktion', 'Außenbereich'],
                activity: ['Transport von Chemikalien', 'Lagertätigkeit', 'Produktionsarbeit'],
                causes: ['defekte-behaelter', 'unsachgemaesse-lagerung', 'transport-unfall'],
                severity: 'hoch',
                environmentalImpact: 'Boden-/Gewässerverschmutzung möglich',
                preventiveMeasures: [
                    'Behälter regelmäßig prüfen',
                    'Auffangwannen installieren',
                    'Notfall-Ausrüstung bereitstellen',
                    'Schulung zu Gefahrstoffmanagement'
                ]
            }
        };
    }

    /**
     * Kontextuelle Hilfe-Texte
     */
    initializeContextualHelp() {
        return {
            eventCategory: {
                title: "Ereigniskategorie wählen",
                text: "Wählen Sie die Kategorie, die am besten zu Ihrem Ereignis passt. Dies hilft bei der automatischen Vorausfüllung relevanter Felder.",
                examples: {
                    'sturz-absturz': "Beispiel: Person ist von einer Leiter gefallen",
                    'technischer-defekt': "Beispiel: Maschine hat ungewöhnliche Geräusche gemacht"
                }
            },
            severity: {
                title: "Schweregrad bestimmen",
                text: "Bewerten Sie die Schwere des Ereignisses:",
                levels: {
                    'niedrig': "Keine Verletzungen, minimaler Schaden",
                    'mittel': "Leichte Verletzungen, moderater Schaden",
                    'hoch': "Schwere Verletzungen, erheblicher Schaden",
                    'kritisch': "Lebensbedrohlich, katastrophaler Schaden"
                }
            },
            description: {
                title: "Ereignisbeschreibung",
                text: "Beschreiben Sie das Ereignis so detailliert wie möglich. Eine gute Beschreibung hilft bei der Ursachenanalyse.",
                tips: [
                    "Was ist passiert?",
                    "Wann ist es passiert?",
                    "Wie ist es passiert?",
                    "Was waren die direkten Folgen?"
                ]
            }
        };
    }

    /**
     * Wizard-Schritte für unerfahrene Nutzer
     */
    initializeWizardSteps() {
        return [
            {
                title: "Schritt 1: Ereignis-Typ",
                description: "Lassen Sie uns zunächst bestimmen, um welche Art von Ereignis es sich handelt.",
                fields: ['incidentType', 'eventCategory'],
                validation: ['incidentType', 'eventCategory'],
                help: "Wählen Sie zuerst, ob es sich um einen Unfall oder Beinahe-Unfall handelt."
            },
            {
                title: "Schritt 2: Grundinformationen",
                description: "Wann und wo ist das Ereignis aufgetreten?",
                fields: ['incidentDateTime', 'incidentLocation', 'severity'],
                validation: ['incidentDateTime', 'incidentLocation'],
                help: "Geben Sie Datum, Uhrzeit und den genauen Ort an."
            },
            {
                title: "Schritt 3: Was ist passiert?",
                description: "Beschreiben Sie das Ereignis im Detail.",
                fields: ['incidentDescription', 'activity', 'cause'],
                validation: ['incidentDescription'],
                help: "Je detaillierter die Beschreibung, desto besser können wir das Ereignis analysieren."
            },
            {
                title: "Schritt 4: Beteiligte Personen",
                description: "Wer war beteiligt oder betroffen?",
                fields: ['affectedPerson', 'witnesses'],
                validation: ['affectedPerson'],
                help: "Geben Sie die Namen der betroffenen Personen und Zeugen an."
            },
            {
                title: "Schritt 5: Folgen und Schäden",
                description: "Welche Folgen hatte das Ereignis?",
                fields: ['injuries', 'medicalTreatment', 'propertyDamage'],
                validation: [],
                help: "Beschreiben Sie alle Verletzungen, Schäden und Auswirkungen."
            },
            {
                title: "Schritt 6: Sofortmaßnahmen",
                description: "Welche Maßnahmen wurden bereits ergriffen?",
                fields: ['immediateMeasures', 'preventiveMeasures'],
                validation: ['immediateMeasures'],
                help: "Listen Sie alle bereits durchgeführten und geplanten Maßnahmen auf."
            }
        ];
    }

    /**
     * Smart Suggestions basierend auf gewählter Ereigniskategorie
     */
    applySuggestions(category) {
        console.log('🧠 Applying smart suggestions for category:', category);
        
        const suggestions = this.suggestionDatabase[category];
        if (!suggestions) return;

        // Location suggestions
        if (suggestions.location) {
            this.showLocationSuggestions(suggestions.location);
        }

        // Activity suggestions
        if (suggestions.activity) {
            this.showActivitySuggestions(suggestions.activity);
        }

        // Severity auto-fill
        if (suggestions.severity) {
            this.autoFillSeverity(suggestions.severity);
        }

        // Cause suggestions
        if (suggestions.causes) {
            this.showCauseSuggestions(suggestions.causes);
        }

        // Preventive measures suggestions
        if (suggestions.preventiveMeasures) {
            this.showPreventiveMeasuresSuggestions(suggestions.preventiveMeasures);
        }

        // Medical treatment suggestion
        if (suggestions.medicalTreatment) {
            this.suggestMedicalTreatment(suggestions.medicalTreatment);
        }

        // Show contextual help
        this.showContextualHelp(category);
    }

    /**
     * Zeige Standort-Vorschläge
     */
    showLocationSuggestions(locations) {
        const locationField = document.getElementById('incidentLocation');
        if (!locationField) return;

        // Create suggestion dropdown
        this.createSuggestionDropdown(locationField, locations, 'Häufige Orte für diese Art von Ereignis:');
    }

    /**
     * Zeige Aktivitäts-Vorschläge
     */
    showActivitySuggestions(activities) {
        const activityField = document.getElementById('activity');
        if (!activityField) return;

        this.createSuggestionDropdown(activityField, activities, 'Typische Tätigkeiten:');
    }

    /**
     * Auto-Fill Schweregrad
     */
    autoFillSeverity(severity) {
        const severityField = document.getElementById('severity');
        if (severityField && !severityField.value) {
            severityField.value = severity;
            this.showSuggestionNotification(`Schweregrad automatisch auf "${severity}" gesetzt`);
        }
    }

    /**
     * Zeige Ursachen-Vorschläge
     */
    showCauseSuggestions(causes) {
        const causeField = document.getElementById('cause');
        if (!causeField) return;

        // Map internal causes to display names
        const causeNames = {
            'rutschige-oberflaeche': 'Rutschige Oberfläche',
            'defekte-ausruestung': 'Defekte Ausrüstung',
            'unzureichende-sicherung': 'Unzureichende Sicherung',
            'stumpfes-werkzeug': 'Stumpfes Werkzeug',
            'unsachgemaesse-handhabung': 'Unsachgemäße Handhabung',
            'fehlende-schutzausruestung': 'Fehlende Schutzausrüstung',
            'defekte-sicherheitsvorrichtung': 'Defekte Sicherheitsvorrichtung',
            'technischer-defekt': 'Technischer Defekt',
            'schlechte-beleuchtung': 'Schlechte Beleuchtung',
            'verschleiss': 'Verschleiß',
            'wartungsmangel': 'Wartungsmangel'
        };

        const displayCauses = causes.map(cause => causeNames[cause] || cause);
        this.createSuggestionDropdown(causeField, displayCauses, 'Häufige Ursachen:');
    }

    /**
     * Zeige Präventionsmaßnahmen-Vorschläge
     */
    showPreventiveMeasuresSuggestions(measures) {
        const measuresField = document.getElementById('preventiveMeasures');
        if (!measuresField) return;

        // Create suggestion box with checkboxes
        this.createMeasureSuggestionBox(measuresField, measures);
    }

    /**
     * Erstelle Suggestion Dropdown
     */
    createSuggestionDropdown(field, suggestions, title) {
        // Remove existing suggestion dropdown
        const existingDropdown = field.parentNode.querySelector('.suggestion-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'suggestion-dropdown';
        dropdown.innerHTML = `
            <div class="suggestion-header">
                <i class="fas fa-lightbulb"></i>
                ${title}
            </div>
            <div class="suggestion-items">
                ${suggestions.map(suggestion => `
                    <div class="suggestion-item" data-value="${suggestion}">
                        <i class="fas fa-plus-circle"></i>
                        ${suggestion}
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers
        dropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const currentValue = field.value;
                const newValue = item.dataset.value;
                
                if (currentValue && !currentValue.includes(newValue)) {
                    field.value = currentValue + (currentValue.endsWith('.') ? ' ' : '. ') + newValue;
                } else if (!currentValue) {
                    field.value = newValue;
                }
                
                // Remove dropdown after selection
                dropdown.remove();
                
                // Trigger input event
                field.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });

        field.parentNode.appendChild(dropdown);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (dropdown.parentNode) {
                dropdown.remove();
            }
        }, 10000);
    }

    /**
     * Erstelle Maßnahmen-Suggestion Box mit Checkboxes
     */
    createMeasureSuggestionBox(field, measures) {
        const existingSuggestion = field.parentNode.querySelector('.measure-suggestions');
        if (existingSuggestion) {
            existingSuggestion.remove();
        }

        const suggestionBox = document.createElement('div');
        suggestionBox.className = 'measure-suggestions';
        suggestionBox.innerHTML = `
            <div class="suggestion-header">
                <i class="fas fa-shield-alt"></i>
                Empfohlene Präventionsmaßnahmen:
                <button type="button" class="add-all-measures">Alle hinzufügen</button>
            </div>
            <div class="measures-list">
                ${measures.map((measure, index) => `
                    <label class="measure-checkbox">
                        <input type="checkbox" data-measure="${measure}">
                        <span>${measure}</span>
                    </label>
                `).join('')}
            </div>
        `;

        // Add event handlers
        const addAllBtn = suggestionBox.querySelector('.add-all-measures');
        addAllBtn.addEventListener('click', () => {
            const selectedMeasures = measures.join('\n• ');
            field.value = '• ' + selectedMeasures;
            suggestionBox.remove();
            field.dispatchEvent(new Event('input', { bubbles: true }));
        });

        suggestionBox.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const checkedMeasures = Array.from(suggestionBox.querySelectorAll('input[type="checkbox"]:checked'))
                    .map(cb => cb.dataset.measure);
                
                if (checkedMeasures.length > 0) {
                    field.value = '• ' + checkedMeasures.join('\n• ');
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });

        field.parentNode.appendChild(suggestionBox);
    }

    /**
     * Zeige Kontextuelle Hilfe
     */
    showContextualHelp(category) {
        // Implementation for contextual help
        console.log('📚 Showing contextual help for:', category);
        
        // This could show tooltips, help panels, or guided tours
        this.showHelpTooltip(category);
    }

    /**
     * Zeige Hilfe-Tooltip
     */
    showHelpTooltip(category) {
        const help = this.contextualHelp.eventCategory;
        if (!help) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'smart-help-tooltip';
        tooltip.innerHTML = `
            <div class="help-content">
                <h4>${help.title}</h4>
                <p>${help.text}</p>
                ${help.examples[category] ? `<div class="help-example">${help.examples[category]}</div>` : ''}
            </div>
            <button class="close-help">✕</button>
        `;

        tooltip.querySelector('.close-help').addEventListener('click', () => {
            tooltip.remove();
        });

        document.body.appendChild(tooltip);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 8000);
    }

    /**
     * Zeige Benachrichtigung über Vorschlag
     */
    showSuggestionNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'suggestion-notification';
        notification.innerHTML = `
            <i class="fas fa-magic"></i>
            ${message}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Wizard-Modus aktivieren
     */
    enableWizardMode() {
        console.log('🧙‍♂️ Enabling Wizard Mode');
        this.isWizardMode = true;
        this.currentWizardStep = 0;
        this.showWizardStep(0);
    }

    /**
     * Zeige aktuellen Wizard-Schritt
     */
    showWizardStep(stepIndex) {
        const step = this.wizardSteps[stepIndex];
        if (!step) return;

        // Create wizard overlay
        const wizardOverlay = document.createElement('div');
        wizardOverlay.className = 'wizard-overlay';
        wizardOverlay.innerHTML = `
            <div class="wizard-content">
                <div class="wizard-header">
                    <h3>${step.title}</h3>
                    <div class="wizard-progress">
                        Schritt ${stepIndex + 1} von ${this.wizardSteps.length}
                    </div>
                </div>
                <div class="wizard-body">
                    <p>${step.description}</p>
                    <div class="wizard-help">${step.help}</div>
                </div>
                <div class="wizard-footer">
                    <button type="button" class="wizard-prev" ${stepIndex === 0 ? 'disabled' : ''}>
                        ← Zurück
                    </button>
                    <button type="button" class="wizard-next">
                        ${stepIndex === this.wizardSteps.length - 1 ? 'Abschließen' : 'Weiter →'}
                    </button>
                    <button type="button" class="wizard-skip">
                        Wizard beenden
                    </button>
                </div>
            </div>
        `;

        // Add event handlers
        wizardOverlay.querySelector('.wizard-next').addEventListener('click', () => {
            if (this.validateWizardStep(stepIndex)) {
                if (stepIndex < this.wizardSteps.length - 1) {
                    this.currentWizardStep++;
                    wizardOverlay.remove();
                    this.showWizardStep(this.currentWizardStep);
                } else {
                    this.completeWizard();
                    wizardOverlay.remove();
                }
            }
        });

        wizardOverlay.querySelector('.wizard-prev').addEventListener('click', () => {
            if (stepIndex > 0) {
                this.currentWizardStep--;
                wizardOverlay.remove();
                this.showWizardStep(this.currentWizardStep);
            }
        });

        wizardOverlay.querySelector('.wizard-skip').addEventListener('click', () => {
            this.isWizardMode = false;
            wizardOverlay.remove();
        });

        document.body.appendChild(wizardOverlay);

        // Highlight relevant fields
        this.highlightWizardFields(step.fields);
    }

    /**
     * Validiere Wizard-Schritt
     */
    validateWizardStep(stepIndex) {
        const step = this.wizardSteps[stepIndex];
        const requiredFields = step.validation || [];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                alert(`Bitte füllen Sie das Feld "${field.previousElementSibling?.textContent || fieldId}" aus.`);
                field.focus();
                return false;
            }
        }
        
        return true;
    }

    /**
     * Wizard abschließen
     */
    completeWizard() {
        this.isWizardMode = false;
        this.showSuggestionNotification('Wizard erfolgreich abgeschlossen! 🎉');
    }

    /**
     * Markiere relevante Felder im Wizard
     */
    highlightWizardFields(fieldIds) {
        // Remove previous highlights
        document.querySelectorAll('.wizard-highlight').forEach(el => {
            el.classList.remove('wizard-highlight');
        });

        // Add highlights to current step fields
        fieldIds.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.add('wizard-highlight');
            }
        });
    }
}

// Export für Integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IncidentSmartSuggestions;
} else if (typeof window !== 'undefined') {
    window.IncidentSmartSuggestions = IncidentSmartSuggestions;
}

console.log('✅ Incident Smart Suggestions Module geladen');