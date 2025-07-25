/*
 * QHSE Compliance Module - DGUV Form 1 PDF Export
 * Erstellt PDF-Dokumente im offiziellen DGUV-Layout
 * 
 * Abhängigkeiten:
 * - jsPDF (https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js)
 * - Optional: jsPDF-AutoTable für Tabellen
 */

/**
 * DGUV Form 1 PDF Generator
 * Erstellt PDF-Dokumente entsprechend dem offiziellen DGUV-Layout
 */
class DGUVPDFGenerator {
    constructor() {
        this.pageWidth = 210; // A4 in mm
        this.pageHeight = 297;
        this.margin = 20;
        this.lineHeight = 6;
        this.fontSize = {
            title: 16,
            section: 12,
            label: 10,
            text: 9
        };
        
        // DGUV Corporate Design Farben
        this.colors = {
            primary: [0, 51, 102],     // DGUV Blau
            secondary: [102, 102, 102], // Grau
            text: [0, 0, 0],           // Schwarz
            background: [245, 245, 245] // Hellgrau
        };

        // Prüfen ob jsPDF verfügbar ist
        this.checkDependencies();
    }

    checkDependencies() {
        if (typeof window !== 'undefined' && !window.jsPDF) {
            console.warn('⚠️ jsPDF ist nicht geladen. PDF-Export nicht verfügbar.');
            console.info('💡 Fügen Sie folgende Script-Tags hinzu:');
            console.info('<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>');
        }
    }

    /**
     * Generiert PDF aus DGUV Form 1 Daten
     * @param {Object} dguvData - DGUV Form 1 Daten
     * @param {Object} options - PDF-Optionen
     * @returns {Promise} PDF-Blob oder Download
     */
    async generatePDF(dguvData, options = {}) {
        if (!window.jsPDF) {
            throw new Error('jsPDF ist nicht verfügbar. Bitte laden Sie die Bibliothek.');
        }

        const { jsPDF } = window;
        const doc = new jsPDF('portrait', 'mm', 'a4');

        try {
            // PDF-Metadaten
            doc.setProperties({
                title: 'DGUV Form 1 - Unfallanzeige',
                subject: 'Unfallanzeige nach DGUV Vorschrift 1',
                author: 'QHSE Management System',
                creator: 'QHSE Compliance Module',
                keywords: 'DGUV, Unfall, Berufsgenossenschaft, Arbeitsunfall'
            });

            let yPosition = this.margin;

            // Header mit DGUV-Logo (Text-basiert)
            yPosition = this.addHeader(doc, yPosition);

            // Abschnitt 1: Unternehmen
            yPosition = this.addCompanySection(doc, dguvData.sections.company, yPosition);
            
            // Seitenumbruch wenn nötig
            if (yPosition > this.pageHeight - 60) {
                doc.addPage();
                yPosition = this.margin;
            }

            // Abschnitt 2: Verunfallte Person
            yPosition = this.addPersonSection(doc, dguvData.sections.person, yPosition);

            // Seitenumbruch wenn nötig
            if (yPosition > this.pageHeight - 60) {
                doc.addPage();
                yPosition = this.margin;
            }

            // Abschnitt 3: Unfall
            yPosition = this.addAccidentSection(doc, dguvData.sections.accident, yPosition);

            // Seitenumbruch wenn nötig
            if (yPosition > this.pageHeight - 60) {
                doc.addPage();
                yPosition = this.margin;
            }

            // Abschnitt 4: Verletzung
            yPosition = this.addInjurySection(doc, dguvData.sections.injury, yPosition);

            // Seitenumbruch wenn nötig
            if (yPosition > this.pageHeight - 60) {
                doc.addPage();
                yPosition = this.margin;
            }

            // Abschnitt 5: Meldung
            yPosition = this.addReportingSection(doc, dguvData.sections.reporting, yPosition);

            // Footer
            this.addFooter(doc, dguvData);

            // PDF speichern oder zurückgeben
            if (options.download !== false) {
                const filename = this.generateFilename(dguvData);
                doc.save(filename);
                return { success: true, filename };
            } else {
                return {
                    success: true,
                    blob: doc.output('blob'),
                    dataUri: doc.output('datauristring')
                };
            }

        } catch (error) {
            console.error('Fehler bei PDF-Generierung:', error);
            throw new Error(`PDF-Generierung fehlgeschlagen: ${error.message}`);
        }
    }

    /**
     * Header mit DGUV-Branding
     */
    addHeader(doc, yPos) {
        // DGUV-Header Box
        doc.setFillColor(...this.colors.primary);
        doc.rect(this.margin, yPos, this.pageWidth - 2 * this.margin, 25, 'F');

        // Titel
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(this.fontSize.title);
        doc.setFont('helvetica', 'bold');
        doc.text('DGUV Form 1 - Unfallanzeige', this.margin + 5, yPos + 8);

        // Untertitel
        doc.setFontSize(this.fontSize.label);
        doc.setFont('helvetica', 'normal');
        doc.text('Anzeige eines Arbeitsunfalls nach § 193 SGB VII', this.margin + 5, yPos + 15);

        // Datum
        doc.setFontSize(this.fontSize.text);
        const today = new Date().toLocaleDateString('de-DE');
        doc.text(`Erstellt am: ${today}`, this.pageWidth - this.margin - 40, yPos + 20);

        // Zurück zu schwarzer Schrift
        doc.setTextColor(...this.colors.text);

        return yPos + 35;
    }

    /**
     * Abschnitt 1: Unternehmen
     */
    addCompanySection(doc, companyData, yPos) {
        yPos = this.addSectionHeader(doc, '1. Angaben zum Unternehmen', yPos);
        
        const fields = [
            { label: '1.1 Name des Unternehmens', value: companyData['1.1'] },
            { label: '1.2 Anschrift', value: companyData['1.2'] },
            { 
                label: '1.3 PLZ / Ort', 
                value: `${companyData['1.3a']} ${companyData['1.3b']}` 
            },
            { label: '1.4 Telefon', value: companyData['1.4'] },
            { label: '1.5 E-Mail', value: companyData['1.5'] },
            { label: '1.6 Mitgliedsnummer', value: companyData['1.6'] },
            { label: '1.7 Branchenschlüssel', value: companyData['1.7'] }
        ];

        return this.addFieldList(doc, fields, yPos);
    }

    /**
     * Abschnitt 2: Verunfallte Person
     */
    addPersonSection(doc, personData, yPos) {
        yPos = this.addSectionHeader(doc, '2. Angaben zur verunfallten Person', yPos);
        
        const fields = [
            { label: '2.1 Familienname', value: personData['2.1'] },
            { label: '2.2 Vorname', value: personData['2.2'] },
            { label: '2.3 Geburtsdatum', value: personData['2.3'] },
            { label: '2.4 Geschlecht', value: this.formatGender(personData['2.4']) },
            { label: '2.5 Staatsangehörigkeit', value: personData['2.5'] },
            { label: '2.6 Anschrift', value: personData['2.6'] },
            { 
                label: '2.7 PLZ / Ort', 
                value: `${personData['2.7a']} ${personData['2.7b']}` 
            },
            { label: '2.8 Personalnummer', value: personData['2.8'] },
            { label: '2.9 Beruf/Tätigkeit', value: personData['2.9'] },
            { label: '2.10 Beschäftigt seit', value: personData['2.10'] },
            { label: '2.11 Wochenstunden', value: personData['2.11'] }
        ];

        return this.addFieldList(doc, fields, yPos);
    }

    /**
     * Abschnitt 3: Unfall
     */
    addAccidentSection(doc, accidentData, yPos) {
        yPos = this.addSectionHeader(doc, '3. Angaben zum Unfall', yPos);
        
        const fields = [
            { label: '3.1 Datum des Unfalls', value: accidentData['3.1'] },
            { label: '3.2 Uhrzeit', value: accidentData['3.2'] },
            { label: '3.3 Unfallort', value: accidentData['3.3'] },
            { 
                label: '3.4 Verrichtete Tätigkeit', 
                value: accidentData['3.4'],
                multiline: true 
            },
            { 
                label: '3.5 Unfallursache', 
                value: accidentData['3.5'],
                multiline: true 
            },
            { 
                label: '3.6 Unfallhergang', 
                value: accidentData['3.6'],
                multiline: true 
            },
            { label: '3.7 Zeugen', value: accidentData['3.7'] }
        ];

        return this.addFieldList(doc, fields, yPos);
    }

    /**
     * Abschnitt 4: Verletzung
     */
    addInjurySection(doc, injuryData, yPos) {
        yPos = this.addSectionHeader(doc, '4. Angaben zur Verletzung', yPos);
        
        const fields = [
            { label: '4.1 Verletzte Körperteile', value: injuryData['4.1'] },
            { label: '4.2 Art der Verletzung', value: injuryData['4.2'] },
            { label: '4.3 Schwere der Verletzung', value: injuryData['4.3'] },
            { 
                label: '4.4 Erste Hilfe geleistet', 
                value: injuryData['4.4'] ? 'Ja' : 'Nein' 
            },
            { 
                label: '4.5 Arztbehandlung', 
                value: injuryData['4.5'] ? 'Ja' : 'Nein' 
            },
            { 
                label: '4.6 Krankenhausbehandlung', 
                value: injuryData['4.6'] ? 'Ja' : 'Nein' 
            },
            { 
                label: '4.7 Arbeitsunfähigkeit', 
                value: injuryData['4.7'] ? 'Ja' : 'Nein' 
            },
            { 
                label: '4.8 Arbeitsunfähigkeit (Tage)', 
                value: injuryData['4.8'] || 'n/a' 
            }
        ];

        return this.addFieldList(doc, fields, yPos);
    }

    /**
     * Abschnitt 5: Meldung
     */
    addReportingSection(doc, reportingData, yPos) {
        yPos = this.addSectionHeader(doc, '5. Angaben zur Meldung', yPos);
        
        const fields = [
            { label: '5.1 Datum der Meldung', value: reportingData['5.1'] },
            { label: '5.2 Name des Meldenden', value: reportingData['5.2'] },
            { label: '5.3 Funktion/Stellung', value: reportingData['5.3'] },
            { label: '5.4 Telefon', value: reportingData['5.4'] },
            { label: '5.5 E-Mail', value: reportingData['5.5'] }
        ];

        yPos = this.addFieldList(doc, fields, yPos);

        // Unterschriften-Bereich
        yPos += 10;
        doc.setFontSize(this.fontSize.label);
        doc.setFont('helvetica', 'bold');
        doc.text('Unterschriften:', this.margin, yPos);
        
        yPos += 15;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(this.fontSize.text);
        
        // Unterschriften-Linien
        const signatureWidth = 60;
        doc.line(this.margin, yPos, this.margin + signatureWidth, yPos);
        doc.line(this.pageWidth - this.margin - signatureWidth, yPos, this.pageWidth - this.margin, yPos);
        
        doc.text('Unterschrift Meldende/r', this.margin, yPos + 5);
        doc.text('Unterschrift Unternehmer/in', this.pageWidth - this.margin - signatureWidth, yPos + 5);

        return yPos + 15;
    }

    /**
     * Hilfsfunktionen
     */
    addSectionHeader(doc, title, yPos) {
        // Hintergrund
        doc.setFillColor(...this.colors.background);
        doc.rect(this.margin, yPos, this.pageWidth - 2 * this.margin, 8, 'F');
        
        // Text
        doc.setTextColor(...this.colors.primary);
        doc.setFontSize(this.fontSize.section);
        doc.setFont('helvetica', 'bold');
        doc.text(title, this.margin + 2, yPos + 6);
        
        // Zurück zu normaler Schrift
        doc.setTextColor(...this.colors.text);
        doc.setFont('helvetica', 'normal');
        
        return yPos + 12;
    }

    addFieldList(doc, fields, yPos) {
        doc.setFontSize(this.fontSize.text);
        
        fields.forEach(field => {
            if (yPos > this.pageHeight - 30) {
                doc.addPage();
                yPos = this.margin;
            }

            // Label
            doc.setFont('helvetica', 'bold');
            doc.text(field.label + ':', this.margin, yPos);
            
            // Wert
            doc.setFont('helvetica', 'normal');
            const value = field.value || '';
            
            if (field.multiline && value.length > 80) {
                // Mehrzeiliger Text
                const lines = doc.splitTextToSize(value, this.pageWidth - 2 * this.margin - 10);
                doc.text(lines, this.margin + 5, yPos + 4);
                yPos += lines.length * 4 + 2;
            } else {
                doc.text(value, this.margin + 5, yPos + 4);
                yPos += 8;
            }
        });
        
        return yPos + 5;
    }

    addFooter(doc, dguvData) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Fußzeile
            doc.setFontSize(this.fontSize.text - 1);
            doc.setTextColor(...this.colors.secondary);
            
            // Links: Generierungsinfo
            doc.text(
                'Erstellt mit QHSE Management System', 
                this.margin, 
                this.pageHeight - 10
            );
            
            // Rechts: Seitenzahl
            doc.text(
                `Seite ${i} von ${pageCount}`, 
                this.pageWidth - this.margin - 20, 
                this.pageHeight - 10
            );
            
            // Mitte: DGUV Form 1
            if (dguvData.berufsgenossenschaft) {
                doc.text(
                    `${dguvData.berufsgenossenschaft.name}`, 
                    this.pageWidth / 2 - 30, 
                    this.pageHeight - 10
                );
            }
        }
    }

    formatGender(gender) {
        const genderMap = {
            'm': 'männlich',
            'w': 'weiblich', 
            'd': 'divers'
        };
        return genderMap[gender] || 'nicht angegeben';
    }

    generateFilename(dguvData) {
        const date = new Date().toISOString().split('T')[0];
        const company = dguvData.sections.company['1.1']?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unbekannt';
        const person = dguvData.sections.person['2.1']?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unbekannt';
        
        return `DGUV_Form1_${company}_${person}_${date}.pdf`;
    }

    /**
     * Prüft PDF-Erstellung Voraussetzungen
     */
    static checkRequirements() {
        const requirements = {
            jsPDF: typeof window !== 'undefined' && !!window.jsPDF,
            browser: typeof window !== 'undefined'
        };

        const missing = Object.entries(requirements)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        return {
            ready: missing.length === 0,
            missing,
            requirements
        };
    }
}

// Export für Integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DGUVPDFGenerator;
} else if (typeof window !== 'undefined') {
    window.DGUVPDFGenerator = DGUVPDFGenerator;
}

console.log('✅ DGUV PDF Generator geladen');