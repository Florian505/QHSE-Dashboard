/*
 * QHSE Compliance Module - Meldepflicht-Automatisierung
 * Automatische Prüfung der Meldepflicht nach deutschen Gesetzen
 * 
 * Rechtsgrundlagen:
 * - § 193 SGB VII (Meldepflicht an Unfallversicherungsträger)
 * - § 8 ArbSchG (Meldung an Gewerbeaufsicht)
 * - DGUV Vorschrift 1 § 24 (Unfallanzeige)
 * - BetrSichV § 18 (Meldepflichtige Ereignisse)
 */

/**
 * Meldepflicht-Kriterien nach deutschen Gesetzen
 */
class MandatoryReportingChecker {
    constructor() {
        // Meldepflicht-Kriterien definieren
        this.criteriaDatabase = {
            // Berufsgenossenschaften (BG) - § 193 SGB VII
            berufsgenossenschaft: {
                name: "Berufsgenossenschaft",
                authority: "BG/UK",
                deadline: "3 Tage schriftlich, sofort bei schweren Unfällen",
                criteria: [
                    {
                        id: "bg_death",
                        description: "Tödlicher Unfall",
                        mandatory: true,
                        immediateNotification: true,
                        legalBasis: "§ 193 Abs. 1 SGB VII",
                        checkFunction: (incidentData) => {
                            return incidentData.consequences?.fatality === true ||
                                   incidentData.consequences?.injuries?.includes('tod') ||
                                   incidentData.severity === 'tödlich';
                        }
                    },
                    {
                        id: "bg_workdays_lost",
                        description: "Arbeitsunfähigkeit > 3 Tage",
                        mandatory: true,
                        immediateNotification: false,
                        legalBasis: "§ 193 Abs. 1 SGB VII",
                        checkFunction: (incidentData) => {
                            const daysLost = parseInt(incidentData.consequences?.workdaysLost) || 0;
                            return daysLost > 3;
                        }
                    },
                    {
                        id: "bg_hospital",
                        description: "Behandlung im Krankenhaus erforderlich",
                        mandatory: true,
                        immediateNotification: false,
                        legalBasis: "§ 193 Abs. 1 SGB VII",
                        checkFunction: (incidentData) => {
                            return incidentData.consequences?.hospitalTreatment === true ||
                                   incidentData.consequences?.treatment?.includes('krankenhaus');
                        }
                    },
                    {
                        id: "bg_serious_injury",
                        description: "Schwere Verletzung (Knochenbruch, Amputation, etc.)",
                        mandatory: true,
                        immediateNotification: true,
                        legalBasis: "§ 193 Abs. 1 SGB VII",
                        checkFunction: (incidentData) => {
                            const seriousInjuries = ['knochenbruch', 'amputation', 'verbrennungen_schwer', 
                                                   'augenverletzung', 'kopfverletzung', 'wirbelsäulenverletzung'];
                            const injuries = incidentData.consequences?.injuries?.toLowerCase() || '';
                            return seriousInjuries.some(injury => injuries.includes(injury));
                        }
                    }
                ]
            },

            // Gewerbeaufsicht/Arbeitsschutzbehörde - § 8 ArbSchG
            gewerbeaufsicht: {
                name: "Gewerbeaufsicht/Arbeitsschutzbehörde",
                authority: "Staatliche Arbeitsschutzbehörde",
                deadline: "Unverzüglich, spätestens 24 Stunden",
                criteria: [
                    {
                        id: "ga_death",
                        description: "Tödlicher Arbeitsunfall",
                        mandatory: true,
                        immediateNotification: true,
                        legalBasis: "§ 8 ArbSchG",
                        checkFunction: (incidentData) => {
                            return incidentData.consequences?.fatality === true;
                        }
                    },
                    {
                        id: "ga_collective_accident",
                        description: "Kollektivunfall (>= 3 Personen betroffen)",
                        mandatory: true,
                        immediateNotification: true,
                        legalBasis: "§ 8 ArbSchG",
                        checkFunction: (incidentData) => {
                            const affectedPersons = parseInt(incidentData.persons?.affectedCount) || 0;
                            return affectedPersons >= 3;
                        }
                    },
                    {
                        id: "ga_dangerous_incident",
                        description: "Gefährliches Ereignis ohne Personenschaden",
                        mandatory: true,
                        immediateNotification: false,
                        legalBasis: "§ 8 ArbSchG",
                        checkFunction: (incidentData) => {
                            return incidentData.type === 'near_miss' && 
                                   incidentData.severity === 'hoch' &&
                                   incidentData.category?.includes('gefährliches_ereignis');
                        }
                    }
                ]
            },

            // Betriebssicherheitsverordnung - BetrSichV § 18
            betriebssicherheit: {
                name: "Betriebssicherheitsbehörde",
                authority: "Technische Aufsichtsbehörde",
                deadline: "Unverzüglich",
                criteria: [
                    {
                        id: "bs_pressure_vessel",
                        description: "Unfall mit Druckbehälter/Dampfkessel",
                        mandatory: true,
                        immediateNotification: true,
                        legalBasis: "BetrSichV § 18",
                        checkFunction: (incidentData) => {
                            const equipment = incidentData.equipment?.toLowerCase() || '';
                            return equipment.includes('druckbehälter') || 
                                   equipment.includes('dampfkessel') ||
                                   equipment.includes('druckanlage');
                        }
                    },
                    {
                        id: "bs_elevator",
                        description: "Unfall mit Aufzugsanlage",
                        mandatory: true,
                        immediateNotification: true,
                        legalBasis: "BetrSichV § 18",
                        checkFunction: (incidentData) => {
                            const equipment = incidentData.equipment?.toLowerCase() || '';
                            return equipment.includes('aufzug') || equipment.includes('fahrstuhl');
                        }
                    },
                    {
                        id: "bs_crane",
                        description: "Unfall mit Kran/Hebezeug",
                        mandatory: true,
                        immediateNotification: true,
                        legalBasis: "BetrSichV § 18",
                        checkFunction: (incidentData) => {
                            const equipment = incidentData.equipment?.toLowerCase() || '';
                            return equipment.includes('kran') || 
                                   equipment.includes('hebezeug') ||
                                   equipment.includes('winde');
                        }
                    }
                ]
            },

            // Immissionsschutz - BImSchG
            immissionsschutz: {
                name: "Immissionsschutzbehörde",
                authority: "Umweltbehörde",
                deadline: "Unverzüglich",
                criteria: [
                    {
                        id: "is_emission",
                        description: "Störfall mit Umweltauswirkungen",
                        mandatory: true,
                        immediateNotification: true,
                        legalBasis: "BImSchG § 52a",
                        checkFunction: (incidentData) => {
                            return incidentData.consequences?.environmentalImpact === true ||
                                   incidentData.category?.includes('umwelt');
                        }
                    }
                ]
            }
        };

        // Fristen-Definitionen
        this.deadlineTypes = {
            'immediate': { hours: 0, description: 'Sofort/Unverzüglich' },
            '24h': { hours: 24, description: '24 Stunden' },
            '3days': { hours: 72, description: '3 Werktage' },
            '1week': { hours: 168, description: '1 Woche' }
        };
    }

    /**
     * Prüft alle Meldepflicht-Kriterien für einen Vorfall
     * @param {Object} incidentData - Unfalldaten aus dem Formular
     * @returns {Object} Ergebnis der Meldepflicht-Prüfung
     */
    checkMandatoryReporting(incidentData) {
        const results = {
            isMandatory: false,
            immediateNotificationRequired: false,
            authorities: [],
            criteria: [],
            deadlines: [],
            legalBasis: []
        };

        // Alle Behörden durchgehen
        Object.entries(this.criteriaDatabase).forEach(([authorityKey, authority]) => {
            const authorityResult = {
                authority: authority.name,
                authorityCode: authorityKey,
                deadline: authority.deadline,
                matchedCriteria: [],
                immediateRequired: false
            };

            // Alle Kriterien der Behörde prüfen
            authority.criteria.forEach(criterion => {
                if (criterion.checkFunction(incidentData)) {
                    results.isMandatory = true;
                    authorityResult.matchedCriteria.push({
                        id: criterion.id,
                        description: criterion.description,
                        legalBasis: criterion.legalBasis,
                        immediate: criterion.immediateNotification
                    });

                    if (criterion.immediateNotification) {
                        results.immediateNotificationRequired = true;
                        authorityResult.immediateRequired = true;
                    }

                    results.criteria.push(criterion.description);
                    results.legalBasis.push(criterion.legalBasis);
                }
            });

            // Wenn Kriterien erfüllt, Behörde zu Ergebnissen hinzufügen
            if (authorityResult.matchedCriteria.length > 0) {
                results.authorities.push(authorityResult);
                results.deadlines.push({
                    authority: authority.name,
                    deadline: authority.deadline,
                    immediate: authorityResult.immediateRequired
                });
            }
        });

        // Eindeutige Arrays erstellen
        results.criteria = [...new Set(results.criteria)];
        results.legalBasis = [...new Set(results.legalBasis)];

        return results;
    }

    /**
     * Berechnet konkrete Meldefristen basierend auf Vorfallszeit
     * @param {Object} mandatoryCheck - Ergebnis der Meldepflicht-Prüfung
     * @param {Date} incidentDateTime - Zeitpunkt des Vorfalls
     * @returns {Object} Berechnete Fristen
     */
    calculateDeadlines(mandatoryCheck, incidentDateTime) {
        const deadlines = {
            immediate: [],
            scheduled: []
        };

        mandatoryCheck.authorities.forEach(authority => {
            const deadline = {
                authority: authority.authority,
                originalDeadline: authority.deadline,
                calculatedDeadline: null,
                hoursRemaining: null,
                status: 'pending'
            };

            if (authority.immediateRequired) {
                deadline.calculatedDeadline = new Date(incidentDateTime);
                deadline.calculatedDeadline.setHours(incidentDateTime.getHours() + 1); // 1h Toleranz
                deadline.hoursRemaining = 1;
                deadlines.immediate.push(deadline);
            } else {
                // Standard-Fristen berechnen
                if (authority.deadline.includes('24')) {
                    deadline.calculatedDeadline = new Date(incidentDateTime);
                    deadline.calculatedDeadline.setHours(incidentDateTime.getHours() + 24);
                    deadline.hoursRemaining = 24;
                } else if (authority.deadline.includes('3 Tage') || authority.deadline.includes('72')) {
                    deadline.calculatedDeadline = new Date(incidentDateTime);
                    deadline.calculatedDeadline.setHours(incidentDateTime.getHours() + 72);
                    deadline.hoursRemaining = 72;
                }
                deadlines.scheduled.push(deadline);
            }
        });

        return deadlines;
    }

    /**
     * Generiert Meldepflicht-Warnung für UI
     * @param {Object} mandatoryCheck - Ergebnis der Meldepflicht-Prüfung
     * @returns {Object} UI-Warnung
     */
    generateWarning(mandatoryCheck) {
        if (!mandatoryCheck.isMandatory) {
            return {
                level: 'info',
                title: 'Keine Meldepflicht',
                message: 'Dieser Vorfall unterliegt keiner gesetzlichen Meldepflicht.',
                color: 'green'
            };
        }

        const level = mandatoryCheck.immediateNotificationRequired ? 'critical' : 'warning';
        const color = level === 'critical' ? 'red' : 'orange';
        
        let message = `Meldepflichtig an: ${mandatoryCheck.authorities.map(a => a.authority).join(', ')}\n\n`;
        
        mandatoryCheck.authorities.forEach(authority => {
            message += `📋 ${authority.authority}:\n`;
            authority.matchedCriteria.forEach(criterion => {
                message += `  • ${criterion.description}\n`;
                message += `    Rechtsgrundlage: ${criterion.legalBasis}\n`;
            });
            message += `  ⏱️ Frist: ${authority.deadline}\n\n`;
        });

        return {
            level,
            title: mandatoryCheck.immediateNotificationRequired ? 
                   '🚨 SOFORTIGE MELDUNG ERFORDERLICH!' : 
                   '⚠️ MELDEPFLICHT BEACHTEN!',
            message: message.trim(),
            color,
            authorities: mandatoryCheck.authorities,
            immediateRequired: mandatoryCheck.immediateNotificationRequired
        };
    }
}

// Export für Integration in Hauptsystem
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MandatoryReportingChecker;
} else if (typeof window !== 'undefined') {
    window.MandatoryReportingChecker = MandatoryReportingChecker;
}

console.log('✅ QHSE Meldepflicht-Checker geladen');