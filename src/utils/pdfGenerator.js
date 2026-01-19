import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateVisitPDF = (data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const dateStr = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(35, 109, 139); // --brand color
    doc.text("Visit Summary", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${dateStr}`, pageWidth - 20, 10, { align: "right" });

    // Patient Info Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Patient Information", 20, 35);
    doc.setLineWidth(0.5);
    doc.line(20, 37, 70, 37);

    doc.setFontSize(11);
    doc.text(`Patient Name: ${data.patientName || data.patient_name || 'N/A'}`, 20, 45);
    doc.text(`Patient ID: ${data.patientId || data.patient_id || 'N/A'}`, 20, 52);
    doc.text(`Visit Type: ${data.visitType || data.visit_type || 'N/A'}`, 20, 59);
    doc.text(`Seen By: ${data.seenBy || data.seen_by || 'N/A'}`, 20, 66);

    // Vitals Section
    doc.setFontSize(14);
    doc.text("Vitals", 20, 85);
    doc.line(20, 87, 40, 87);

    const vitals = data.vitals || {
        height: data.height,
        weight: data.weight,
        blood_pressure: data.bloodPressure,
        pulse: data.pulse,
        respiratory_rate: data.respiratoryRate,
        oxygen_saturation: data.oxygenSaturation,
        temperature: data.temperature
    };

    const vitalsData = [
        ["Height", `${vitals.height || 'N/A'} ft`],
        ["Weight", `${vitals.weight || 'N/A'} kg`],
        ["BP", vitals.blood_pressure || 'N/A'],
        ["Pulse", `${vitals.pulse || 'N/A'} bpm`],
        ["RR", `${vitals.respiratory_rate || 'N/A'} bpm`],
        ["SpO2", `${vitals.oxygen_saturation || 'N/A'} %`],
        ["Temp", `${vitals.temperature || 'N/A'} F`]
    ];

    autoTable(doc, {
        startY: 90,
        head: [["Vital", "Value"]],
        body: vitalsData,
        theme: 'striped',
        headStyles: { fillColor: [35, 109, 139] },
        margin: { left: 20 },
        tableWidth: 80
    });

    // Clinical Details Section
    let currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Clinical Details", 20, currentY);
    doc.line(20, currentY + 2, 60, currentY + 2);
    currentY += 10;

    const addSection = (title, content) => {
        if (currentY > 260) {
            doc.addPage();
            currentY = 20;
        }
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`${title}:`, 20, currentY);
        doc.setFont(undefined, 'normal');
        const lines = doc.splitTextToSize(content || 'None', pageWidth - 40);
        doc.text(lines, 20, currentY + 7);
        currentY += (lines.length * 7) + 10;
    };

    addSection("Chief Complaints", data.chiefComplaints || data.chief_complaints);

    // Investigations
    addSection("Investigation Request", data.investigationRequest || data.investigation_request);
    addSection("Investigation Result", data.investigationResult || data.investigation_result);

    // Diagnosis
    const diagnosis = data.diagnosis || { icd10_quickest: data.icdQuickest, full_icd10_list: data.icdFull };
    addSection("Diagnosis (ICD-10)", diagnosis.icd10_quickest);
    addSection("Full ICD-10 List", diagnosis.full_icd10_list);

    addSection("Treatment Plan", data.treatment);
    addSection("Clinical Notes", data.notes);

    // Medications Section
    if (currentY > 220) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(14);
    doc.text("Medications", 20, currentY);
    doc.line(20, currentY + 2, 50, currentY + 2);

    const meds = data.medication_history || data.medications || [];
    const medsBody = meds.map(m => [
        m.problem || 'N/A',
        m.medicine || 'N/A',
        `${m.dosage || m.mg || 'N/A'} mg`,
        m.dose_time || m.doseTime || 'N/A',
        m.frequency || 'N/A',
        m.duration || m.timePeriod || 'N/A'
    ]);

    autoTable(doc, {
        startY: currentY + 5,
        head: [["Problem", "Medicine", "Dosage", "Time", "Frequency", "Duration"]],
        body: medsBody.length > 0 ? medsBody : [["No medications prescribed", "", "", "", "", ""]],
        theme: 'grid',
        headStyles: { fillColor: [35, 109, 139] },
        margin: { left: 20 }
    });

    // Follow-up & Billing Section
    currentY = doc.lastAutoTable.finalY + 15;
    if (currentY > 240) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(14);
    doc.text("Follow-up & Billing", 20, currentY);
    doc.line(20, currentY + 2, 70, currentY + 2);
    currentY += 12;

    doc.setFontSize(11);
    doc.text(`Follow-up Date: ${data.followUpDate || data.appointment_date || 'N/A'}`, 20, currentY);
    currentY += 10;

    const billing = data.billing || {
        total_cost: data.totalCost,
        amount_paid: data.amountPaid,
        balance_amount: data.balanceAmount
    };

    doc.text(`Total Cost: ${billing.total_cost || '0.00'}`, 20, currentY);
    doc.text(`Amount Paid: ${billing.amount_paid || '0.00'}`, 20, currentY + 7);
    doc.setFont(undefined, 'bold');
    doc.text(`Balance Amount: ${billing.balance_amount || '0.00'}`, 20, currentY + 14);
    doc.setFont(undefined, 'normal');

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    const fileName = `Visit_${data.patientName || data.patient_name || 'Patient'}_${dateStr.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
};
