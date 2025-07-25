/*
 * QHSE Compliance Module - DGUV Form 1 Integration
 * Automatischer Export von Unfallanzeigen im DGUV-Standard
 * 
 * Rechtsgrundlagen:
 * - DGUV Vorschrift 1 § 24 (Unfallanzeige)
 * - § 193 SGB VII (Meldepflicht an Unfallversicherungsträger)
 * - DGUV Information 204-021 (Leitfaden zur Unfallanzeige)
 */

/**
 * DGUV Form 1 - Unfallanzeige Generator
 * Erstellt standardkonforme Unfallanzeigen für deutsche Berufsgenossenschaften
 */
class DGUVForm1Generator {
    constructor() {
        // DGUV Form 1 Feldstruktur (offizielle Vorlage)
        this.formStructure = {
            // Abschnitt 1: Angaben zum Unternehmen
            company: {
                name: { required: true, maxLength: 60, dguv_field: "1.1" },
                address: { required: true, maxLength: 100, dguv_field: "1.2" },
                postalCode: { required: true, maxLength: 5, dguv_field: "1.3a" },
                city: { required: true, maxLength: 40, dguv_field: "1.3b" },
                phone: { required: false, maxLength: 20, dguv_field: "1.4" },
                email: { required: false, maxLength: 50, dguv_field: "1.5" },
                membershipNumber: { required: true, maxLength: 20, dguv_field: "1.6" },
                industryCode: { required: true, maxLength: 10, dguv_field: "1.7" }
            },

            // Abschnitt 2: Angaben zur verunfallten Person
            person: {
                lastName: { required: true, maxLength: 30, dguv_field: "2.1" },
                firstName: { required: true, maxLength: 30, dguv_field: "2.2" },
                birthDate: { required: true, format: "DD.MM.YYYY", dguv_field: "2.3" },
                gender: { required: true, options: ["m", "w", "d"], dguv_field: "2.4" },
                nationality: { required: true, maxLength: 20, dguv_field: "2.5" },
                address: { required: true, maxLength: 100, dguv_field: "2.6" },
                postalCode: { required: true, maxLength: 5, dguv_field: "2.7a" },
                city: { required: true, maxLength: 40, dguv_field: "2.7b" },
                personnelNumber: { required: false, maxLength: 20, dguv_field: "2.8" },
                jobTitle: { required: true, maxLength: 50, dguv_field: "2.9" },
                employmentStart: { required: true, format: "DD.MM.YYYY", dguv_field: "2.10" },
                workingHoursPerWeek: { required: true, type: "number", dguv_field: "2.11" }
            },

            // Abschnitt 3: Angaben zum Unfall
            accident: {
                date: { required: true, format: "DD.MM.YYYY", dguv_field: "3.1" },
                time: { required: true, format: "HH:MM", dguv_field: "3.2" },
                location: { required: true, maxLength: 100, dguv_field: "3.3" },
                workProcess: { required: true, maxLength: 200, dguv_field: "3.4" },
                accidentCause: { required: true, maxLength: 300, dguv_field: "3.5" },
                accidentSequence: { required: true, maxLength: 500, dguv_field: "3.6" },
                witnesses: { required: false, maxLength: 200, dguv_field: "3.7" }
            },

            // Abschnitt 4: Angaben zur Verletzung
            injury: {
                bodyPart: { required: true, maxLength: 100, dguv_field: "4.1" },
                injuryType: { required: true, maxLength: 100, dguv_field: "4.2" },
                severity: { required: true, options: ["leicht", "schwer", "tödlich"], dguv_field: "4.3" },
                firstAid: { required: true, type: "boolean", dguv_field: "4.4" },
                doctorTreatment: { required: true, type: "boolean", dguv_field: "4.5" },
                hospitalAdmission: { required: true, type: "boolean", dguv_field: "4.6" },
                workIncapacity: { required: true, type: "boolean", dguv_field: "4.7" },
                workIncapacityDays: { required: false, type: "number", dguv_field: "4.8" }
            },

            // Abschnitt 5: Angaben zur Meldung
            reporting: {
                reportDate: { required: true, format: "DD.MM.YYYY", dguv_field: "5.1" },
                reporterName: { required: true, maxLength: 50, dguv_field: "5.2" },
                reporterPosition: { required: true, maxLength: 50, dguv_field: "5.3" },
                reporterPhone: { required: false, maxLength: 20, dguv_field: "5.4" },
                reporterEmail: { required: false, maxLength: 50, dguv_field: "5.5" }
            }
        };

        // Berufsgenossenschaften-Mapping
        this.berufsgenossenschaften = {
            "BG BAU": {
                name: "Berufsgenossenschaft der Bauwirtschaft",
                code: "BG01",
                address: "Hildegardstraße 29/30, 10715 Berlin",
                membershipPattern: /^BG01\d{6}$/
            },
            "BG ETEM": {
                name: "Berufsgenossenschaft Energie Textil Elektro Medienerzeugnisse",
                code: "BG02",
                address: "Gustav-Heinemann-Ufer 130, 50968 Köln",
                membershipPattern: /^BG02\d{6}$/
            },
            "BG Holz und Metall": {
                name: "Berufsgenossenschaft Holz und Metall",
                code: "BG03",
                address: "Isaac-Fulda-Allee 18, 55124 Mainz",
                membershipPattern: /^BG03\d{6}$/
            },
            "BGHM": {
                name: "Berufsgenossenschaft Handel und Warenlogistik",
                code: "BG04",
                address: "M 2, 12-14, 68161 Mannheim",
                membershipPattern: /^BG04\d{6}$/
            },
            "BGN": {
                name: "Berufsgenossenschaft Nahrungsmittel und Gastgewerbe",
                code: "BG05",
                address: "Dynamostraße 7-11, 68165 Mannheim",
                membershipPattern: /^BG05\d{6}$/
            },
            "BGRCI": {
                name: "Berufsgenossenschaft Rohstoffe und chemische Industrie",
                code: "BG06",
                address: "Kurfürsten-Anlage 62, 69115 Heidelberg",
                membershipPattern: /^BG06\d{6}$/
            },
            "BGW": {
                name: "Berufsgenossenschaft für Gesundheitsdienst und Wohlfahrtspflege",
                code: "BG07",
                address: "Pappelallee 33/35/37, 22089 Hamburg",
                membershipPattern: /^BG07\d{6}$/
            },
            "SVLFG": {
                name: "Sozialversicherung für Landwirtschaft, Forsten und Gartenbau",
                code: "BG08",
                address: "Weißensteinstraße 70-72, 34131 Kassel",
                membershipPattern: /^BG08\d{6}$/
            },
            "UKBW": {
                name: "Unfallkasse Baden-Württemberg",
                code: "UK01",
                address: "Augsburger Straße 700, 70329 Stuttgart",
                membershipPattern: /^UK01\d{6}$/
            }
        };

        // ICD-10 Verletzungsklassifizierung (Auszug für häufige Arbeitsunfälle)
        this.icd10Codes = {
            "Schnittverletzung": "S61.9",
            "Prellung": "S00.9",
            "Knochenbruch Arm": "S52.9",
            "Knochenbruch Bein": "S82.9",
            "Verbrennungen": "T30.0",
            "Augenverletzung": "S05.9",
            "Wirbelsäulenverletzung": "S13.9",
            "Kopfverletzung": "S09.9",
            "Vergiftung": "T65.9",
            "Elektrounfall": "T75.4"
        };
    }

    /**
     * Generiert DGUV Form 1 aus Incident-Daten
     * @param {Object} incidentData - Unfalldaten aus dem QHSE-System
     * @param {Object} companyData - Unternehmensdaten
     * @returns {Object} DGUV-konformes Formular
     */
    generateDGUVForm1(incidentData, companyData) {
        const dguv = {
            header: {
                formType: "DGUV Form 1",
                version: "2024.1",
                generated: new Date().toISOString(),
                generator: "QHSE Management System"
            },
            sections: {}
        };

        try {
            // Abschnitt 1: Unternehmen
            dguv.sections.company = this.mapCompanyData(companyData);
            
            // Abschnitt 2: Verunfallte Person
            dguv.sections.person = this.mapPersonData(incidentData);
            
            // Abschnitt 3: Unfall
            dguv.sections.accident = this.mapAccidentData(incidentData);
            
            // Abschnitt 4: Verletzung
            dguv.sections.injury = this.mapInjuryData(incidentData);
            
            // Abschnitt 5: Meldung
            dguv.sections.reporting = this.mapReportingData(incidentData);

            // Validierung
            const validation = this.validateDGUVForm(dguv);
            dguv.validation = validation;

            // BG-spezifische Anpassungen
            const bg = this.identifyBerufsgenossenschaft(companyData.membershipNumber);
            if (bg) {
                dguv.berufsgenossenschaft = bg;
                dguv.sections = this.applyBGSpecificRules(dguv.sections, bg);
            }

            return dguv;

        } catch (error) {
            console.error('Fehler bei DGUV Form 1 Generierung:', error);
            return {
                error: true,
                message: error.message,
                sections: {}
            };
        }
    }

    /**
     * Mappt Unternehmensdaten auf DGUV-Format
     */
    mapCompanyData(companyData) {
        return {
            "1.1": companyData.name || "",
            "1.2": companyData.address || "",
            "1.3a": companyData.postalCode || "",
            "1.3b": companyData.city || "",
            "1.4": companyData.phone || "",
            "1.5": companyData.email || "",
            "1.6": companyData.membershipNumber || "",
            "1.7": companyData.industryCode || "88999" // Standard-Code
        };
    }

    /**
     * Mappt Personendaten auf DGUV-Format
     */
    mapPersonData(incidentData) {
        const person = incidentData.persons || {};
        return {
            "2.1": person.lastName || incidentData.reporterName?.split(' ').pop() || "",
            "2.2": person.firstName || incidentData.reporterName?.split(' ')[0] || "",
            "2.3": person.birthDate || "",
            "2.4": person.gender || "d",
            "2.5": person.nationality || "deutsch",
            "2.6": person.address || "",
            "2.7a": person.postalCode || "",
            "2.7b": person.city || "",
            "2.8": person.personnelNumber || "",
            "2.9": person.jobTitle || incidentData.reporterDepartment || "",
            "2.10": person.employmentStart || "",
            "2.11": person.workingHoursPerWeek || "40"
        };
    }

    /**
     * Mappt Unfalldaten auf DGUV-Format
     */
    mapAccidentData(incidentData) {
        const accidentDate = new Date(incidentData.incidentDateTime || new Date());
        return {
            "3.1": this.formatDate(accidentDate),
            "3.2": this.formatTime(accidentDate),
            "3.3": incidentData.incidentLocation || "",
            "3.4": incidentData.workProcess || "Standard-Arbeitstätigkeit",
            "3.5": incidentData.accidentCause || incidentData.incidentDescription || "",
            "3.6": incidentData.incidentDescription || "",
            "3.7": incidentData.witnesses || ""
        };
    }

    /**
     * Mappt Verletzungsdaten auf DGUV-Format
     */
    mapInjuryData(incidentData) {
        const consequences = incidentData.consequences || {};
        return {
            "4.1": consequences.bodyPart || this.extractBodyPart(consequences.injuries),
            "4.2": consequences.injuryType || this.classifyInjury(consequences.injuries),
            "4.3": this.mapSeverity(incidentData.incidentSeverity),
            "4.4": consequences.firstAid || false,
            "4.5": consequences.doctorTreatment || false,
            "4.6": consequences.hospitalTreatment || false,
            "4.7": consequences.workIncapacity || (consequences.workdaysLost > 0),
            "4.8": consequences.workdaysLost || ""
        };
    }

    /**
     * Mappt Meldungsdaten auf DGUV-Format
     */
    mapReportingData(incidentData) {
        return {
            "5.1": this.formatDate(new Date()),
            "5.2": incidentData.reporterName || "",
            "5.3": incidentData.reporterPosition || "Sicherheitsbeauftragte/r",
            "5.4": incidentData.reporterPhone || "",
            "5.5": incidentData.reporterEmail || ""
        };
    }

    /**
     * Identifiziert zuständige Berufsgenossenschaft
     */
    identifyBerufsgenossenschaft(membershipNumber) {
        for (const [key, bg] of Object.entries(this.berufsgenossenschaften)) {
            if (bg.membershipPattern.test(membershipNumber)) {
                return bg;
            }
        }
        return null;
    }

    /**
     * Wendet BG-spezifische Regeln an
     */
    applyBGSpecificRules(sections, bg) {
        // BG-spezifische Anpassungen
        switch (bg.code) {
            case "BG01": // BG BAU
                sections.accident["3.4"] = this.enhanceConstructionActivity(sections.accident["3.4"]);
                break;
            case "BG02": // BG ETEM
                sections.accident["3.5"] = this.enhanceElectricalSafety(sections.accident["3.5"]);
                break;
            // Weitere BG-spezifische Anpassungen...
        }
        return sections;
    }

    /**
     * Validiert DGUV-Formular auf Vollständigkeit
     */
    validateDGUVForm(dguv) {
        const errors = [];
        const warnings = [];

        // Pflichtfelder prüfen
        const requiredFields = [
            'sections.company.1.1', 'sections.company.1.2', 'sections.company.1.6',
            'sections.person.2.1', 'sections.person.2.2', 'sections.person.2.9',
            'sections.accident.3.1', 'sections.accident.3.2', 'sections.accident.3.3',
            'sections.injury.4.1', 'sections.injury.4.2', 'sections.injury.4.3',
            'sections.reporting.5.1', 'sections.reporting.5.2'
        ];

        requiredFields.forEach(field => {
            const value = this.getNestedValue(dguv, field);
            if (!value || value.toString().trim() === '') {
                errors.push(`Pflichtfeld fehlt: ${field}`);
            }
        });

        // Datenformat prüfen
        if (dguv.sections.accident && dguv.sections.accident["3.1"]) {
            if (!this.isValidDate(dguv.sections.accident["3.1"])) {
                errors.push("Unfalldatum ungültig");
            }
        }

        // Logik-Prüfungen
        if (dguv.sections.injury["4.7"] && !dguv.sections.injury["4.8"]) {
            warnings.push("Arbeitsunfähigkeit angegeben, aber keine Tage eingetragen");
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            completeness: this.calculateCompleteness(dguv)
        };
    }

    /**
     * Hilfsfunktionen
     */
    formatDate(date) {
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatTime(date) {
        return date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    mapSeverity(severity) {
        const severityMap = {
            'niedrig': 'leicht',
            'mittel': 'leicht',
            'hoch': 'schwer',
            'kritisch': 'schwer',
            'tödlich': 'tödlich'
        };
        return severityMap[severity] || 'leicht';
    }

    extractBodyPart(injuryDescription) {
        if (!injuryDescription) return "";
        
        const bodyParts = {
            'kopf': 'Kopf/Gesicht',
            'auge': 'Auge',
            'hand': 'Hand/Finger',
            'arm': 'Arm',
            'bein': 'Bein',
            'fuß': 'Fuß',
            'rücken': 'Rücken/Wirbelsäule',
            'brust': 'Brust/Rumpf'
        };

        const desc = injuryDescription.toLowerCase();
        for (const [key, value] of Object.entries(bodyParts)) {
            if (desc.includes(key)) return value;
        }
        return "Sonstige";
    }

    classifyInjury(injuryDescription) {
        if (!injuryDescription) return "";
        
        const desc = injuryDescription.toLowerCase();
        if (desc.includes('schnitt')) return 'Schnittverletzung';
        if (desc.includes('bruch')) return 'Knochenbruch';
        if (desc.includes('prellung')) return 'Prellung/Quetschung';
        if (desc.includes('verbrennung')) return 'Verbrennung';
        if (desc.includes('vergiftung')) return 'Vergiftung';
        
        return 'Sonstige Verletzung';
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => current?.[prop], obj);
    }

    isValidDate(dateString) {
        const regex = /^\d{2}\.\d{2}\.\d{4}$/;
        return regex.test(dateString);
    }

    calculateCompleteness(dguv) {
        // Berechnet Vollständigkeit als Prozentsatz
        let totalFields = 0;
        let filledFields = 0;

        const countFields = (obj) => {
            Object.values(obj).forEach(value => {
                if (typeof value === 'object' && value !== null) {
                    countFields(value);
                } else {
                    totalFields++;
                    if (value && value.toString().trim() !== '') {
                        filledFields++;
                    }
                }
            });
        };

        countFields(dguv.sections);
        return Math.round((filledFields / totalFields) * 100);
    }
}

// Export für Integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DGUVForm1Generator;
} else if (typeof window !== 'undefined') {
    window.DGUVForm1Generator = DGUVForm1Generator;
}

console.log('✅ DGUV Form 1 Generator geladen');