/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { CVData } from '../types/cv';

/**
 * Generates a clean, standard ATS-compliant native vector PDF using jsPDF.
 * This produces selectable, machine-readable text for Taleo, Workday, Greenhouse, etc.
 * Bypasses DOM/canvas color parsing completely to avoid oklch / CSS rendering errors.
 */
export function generateATSPDF(cv: CVData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin + 2;

  // Font family mapping
  let fontName = 'helvetica';
  if (cv.designSettings.fontFamily === 'serif') {
    fontName = 'times';
  } else if (cv.designSettings.fontFamily === 'mono') {
    fontName = 'courier';
  }

  // Spacing density multiplier
  const spacingMultiplier =
    cv.designSettings.spacing === 'compact' ? 0.85 : cv.designSettings.spacing === 'spacious' ? 1.2 : 1.0;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 2;
    }
  };

  const drawSectionHeader = (title: string) => {
    checkPageBreak(12);
    y += 2 * spacingMultiplier;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(title.toUpperCase(), margin, y);
    y += 1.8;

    // Divider line
    doc.setDrawColor(203, 213, 225); // Slate-300
    doc.setLineWidth(0.35);
    doc.line(margin, y, margin + contentWidth, y);
    y += 4 * spacingMultiplier;
  };

  // ----------------------------------------------------
  // 1. HEADER (Personal & Contact Info)
  // ----------------------------------------------------
  const hasPhoto = Boolean(cv.personalInfo.photoUrl && cv.designSettings.showPhoto !== false);
  const photoSize = 22; // 22mm x 22mm
  let availableHeaderWidth = contentWidth;

  if (hasPhoto && cv.personalInfo.photoUrl) {
    try {
      const photoX = margin + contentWidth - photoSize;
      const photoY = margin;
      let imgFormat = 'JPEG';
      if (cv.personalInfo.photoUrl.startsWith('data:image/png')) {
        imgFormat = 'PNG';
      } else if (cv.personalInfo.photoUrl.startsWith('data:image/webp')) {
        imgFormat = 'WEBP';
      }
      doc.addImage(cv.personalInfo.photoUrl, imgFormat, photoX, photoY, photoSize, photoSize);
      availableHeaderWidth = contentWidth - photoSize - 4;
    } catch (err) {
      console.warn('PDF photo embedding note:', err);
    }
  }

  doc.setFont(fontName, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate-900
  const fullName = (cv.personalInfo.fullName || 'Professional Resume').trim();
  doc.text(fullName, margin, y);
  y += 5.5;

  if (cv.personalInfo.headline) {
    doc.setFont(fontName, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85); // Slate-700
    const headlineLines = doc.splitTextToSize(cv.personalInfo.headline.trim(), availableHeaderWidth);
    for (const hLine of headlineLines) {
      doc.text(hLine, margin, y);
      y += 4.5;
    }
  }

  // Contact line items
  const contacts: string[] = [];
  if (cv.personalInfo.email) contacts.push(cv.personalInfo.email);
  if (cv.personalInfo.phone) contacts.push(cv.personalInfo.phone);
  if (cv.personalInfo.location) contacts.push(cv.personalInfo.location);
  if (cv.personalInfo.linkedinUrl) contacts.push(cv.personalInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?/, ''));
  if (cv.personalInfo.githubUrl) contacts.push(cv.personalInfo.githubUrl.replace(/^https?:\/\/(www\.)?/, ''));
  if (cv.personalInfo.portfolioUrl) contacts.push(cv.personalInfo.portfolioUrl.replace(/^https?:\/\/(www\.)?/, ''));

  if (contacts.length > 0) {
    doc.setFont(fontName, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // Slate-600

    const contactStr = contacts.join('  •  ');
    const contactLines = doc.splitTextToSize(contactStr, availableHeaderWidth);
    for (const line of contactLines) {
      doc.text(line, margin, y);
      y += 3.8;
    }
    y += 1;
  }

  if (hasPhoto) {
    y = Math.max(y, margin + photoSize + 2);
  }

  // ----------------------------------------------------
  // 2. PROFESSIONAL SUMMARY
  // ----------------------------------------------------
  if (cv.summary && cv.summary.trim().length > 0) {
    drawSectionHeader('Professional Summary');
    doc.setFont(fontName, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    const summaryLines = doc.splitTextToSize(cv.summary.trim(), contentWidth);
    for (const line of summaryLines) {
      checkPageBreak(4.5);
      doc.text(line, margin, y);
      y += 4.2 * spacingMultiplier;
    }
    y += 1.5;
  }

  // ----------------------------------------------------
  // 3. TECHNICAL SKILLS
  // ----------------------------------------------------
  const skillCategories = [
    { label: 'Languages', items: cv.skills.languages },
    { label: 'Frameworks & Libraries', items: cv.skills.frameworks },
    { label: 'Tools & Databases', items: cv.skills.toolsAndDatabases },
    { label: 'Cloud & DevOps', items: cv.skills.cloudAndDevOps },
    { label: 'Architecture & Practices', items: cv.skills.architectureAndPractices },
    { label: 'Soft Skills', items: cv.skills.softSkills },
  ].filter((c) => c.items && c.items.length > 0);

  if (skillCategories.length > 0) {
    drawSectionHeader('Technical & Professional Skills');

    for (const category of skillCategories) {
      checkPageBreak(5);
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);

      const catLabel = `${category.label}: `;
      const catLabelWidth = doc.getTextWidth(catLabel);
      doc.text(catLabel, margin, y);

      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      const itemsText = category.items.join(', ');
      const availableWidth = contentWidth - catLabelWidth;
      const wrappedItems = doc.splitTextToSize(itemsText, availableWidth);

      if (wrappedItems.length > 0) {
        doc.text(wrappedItems[0], margin + catLabelWidth, y);
        y += 4 * spacingMultiplier;

        for (let i = 1; i < wrappedItems.length; i++) {
          checkPageBreak(4.5);
          doc.text(wrappedItems[i], margin + catLabelWidth, y);
          y += 4 * spacingMultiplier;
        }
      } else {
        y += 4 * spacingMultiplier;
      }
    }
    y += 1.5;
  }

  // ----------------------------------------------------
  // 4. WORK EXPERIENCE
  // ----------------------------------------------------
  if (cv.workExperience && cv.workExperience.length > 0) {
    drawSectionHeader('Professional Experience');

    for (const exp of cv.workExperience) {
      checkPageBreak(12);

      // Role & Company Line
      doc.setFont(fontName, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const roleText = exp.role;
      doc.text(roleText, margin, y);

      // Date Range (right-aligned)
      const dateText = `${exp.startDate || ''} – ${exp.isCurrent ? 'Present' : exp.endDate || ''}`;
      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, margin + contentWidth - dateWidth, y);
      y += 4.2 * spacingMultiplier;

      // Company & Location
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const compLoc = `${exp.company}${exp.location ? ` | ${exp.location}` : ''}`;
      doc.text(compLoc, margin, y);
      y += 4 * spacingMultiplier;

      // Highlights / Bullets
      if (exp.highlights && exp.highlights.length > 0) {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);

        for (const hl of exp.highlights) {
          if (!hl.trim()) continue;
          checkPageBreak(5);
          const bulletIndent = 4;
          doc.text('•', margin + 1, y);

          const lines = doc.splitTextToSize(hl.trim(), contentWidth - bulletIndent - 1);
          for (let i = 0; i < lines.length; i++) {
            if (i > 0) checkPageBreak(4.2);
            doc.text(lines[i], margin + bulletIndent, y);
            y += 3.9 * spacingMultiplier;
          }
        }
      }

      // Tech Stack
      if (exp.techStack && exp.techStack.length > 0) {
        checkPageBreak(4.5);
        doc.setFont(fontName, 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const stackLabel = 'Technologies: ';
        doc.text(stackLabel, margin + 4, y);

        const stackLabelW = doc.getTextWidth(stackLabel);
        doc.setFont(fontName, 'normal');
        const stackVal = exp.techStack.join(', ');
        const stackLines = doc.splitTextToSize(stackVal, contentWidth - 4 - stackLabelW);

        doc.text(stackLines[0], margin + 4 + stackLabelW, y);
        y += 3.8 * spacingMultiplier;
        for (let i = 1; i < stackLines.length; i++) {
          checkPageBreak(4);
          doc.text(stackLines[i], margin + 4 + stackLabelW, y);
          y += 3.8 * spacingMultiplier;
        }
      }

      y += 2.5 * spacingMultiplier;
    }
  }

  // ----------------------------------------------------
  // 5. PROJECTS
  // ----------------------------------------------------
  if (cv.projects && cv.projects.length > 0) {
    drawSectionHeader('Key Technical Projects');

    for (const proj of cv.projects) {
      checkPageBreak(10);

      // Title & Date
      doc.setFont(fontName, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(proj.title, margin, y);

      if (proj.date) {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const dWidth = doc.getTextWidth(proj.date);
        doc.text(proj.date, margin + contentWidth - dWidth, y);
      }
      y += 4 * spacingMultiplier;

      // Role and links
      const metaParts: string[] = [];
      if (proj.role) metaParts.push(proj.role);
      if (proj.githubUrl) metaParts.push(`GitHub: ${proj.githubUrl.replace(/^https?:\/\//, '')}`);
      if (proj.liveUrl) metaParts.push(`Demo: ${proj.liveUrl.replace(/^https?:\/\//, '')}`);

      if (metaParts.length > 0) {
        doc.setFont(fontName, 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(metaParts.join('  |  '), margin, y);
        y += 3.8 * spacingMultiplier;
      }

      // Highlights
      if (proj.highlights && proj.highlights.length > 0) {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);

        for (const hl of proj.highlights) {
          if (!hl.trim()) continue;
          checkPageBreak(5);
          const bulletIndent = 4;
          doc.text('•', margin + 1, y);

          const lines = doc.splitTextToSize(hl.trim(), contentWidth - bulletIndent - 1);
          for (let i = 0; i < lines.length; i++) {
            if (i > 0) checkPageBreak(4.2);
            doc.text(lines[i], margin + bulletIndent, y);
            y += 3.9 * spacingMultiplier;
          }
        }
      }

      // Tech Stack
      if (proj.techStack && proj.techStack.length > 0) {
        checkPageBreak(4.5);
        doc.setFont(fontName, 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const stackLabel = 'Tech: ';
        doc.text(stackLabel, margin + 4, y);

        const stackLabelW = doc.getTextWidth(stackLabel);
        doc.setFont(fontName, 'normal');
        const stackVal = proj.techStack.join(', ');
        const stackLines = doc.splitTextToSize(stackVal, contentWidth - 4 - stackLabelW);

        doc.text(stackLines[0], margin + 4 + stackLabelW, y);
        y += 3.8 * spacingMultiplier;
        for (let i = 1; i < stackLines.length; i++) {
          checkPageBreak(4);
          doc.text(stackLines[i], margin + 4 + stackLabelW, y);
          y += 3.8 * spacingMultiplier;
        }
      }

      y += 2.5 * spacingMultiplier;
    }
  }

  // ----------------------------------------------------
  // 6. EDUCATION
  // ----------------------------------------------------
  if (cv.education && cv.education.length > 0) {
    drawSectionHeader('Education');

    for (const edu of cv.education) {
      checkPageBreak(8);

      // Degree & Field
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const degreeText = `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`;
      doc.text(degreeText, margin, y);

      // Dates
      const eduDate = `${edu.startDate || ''} – ${edu.endDate || ''}`.trim();
      if (eduDate && eduDate !== '–') {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const edWidth = doc.getTextWidth(eduDate);
        doc.text(eduDate, margin + contentWidth - edWidth, y);
      }
      y += 4 * spacingMultiplier;

      // Institution & Location & GPA
      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const instParts: string[] = [edu.institution];
      if (edu.location) instParts.push(edu.location);
      if (edu.gpa) instParts.push(`GPA: ${edu.gpa}`);
      if (edu.honors) instParts.push(edu.honors);

      doc.text(instParts.join(' | '), margin, y);
      y += 4.5 * spacingMultiplier;
    }
  }

  // ----------------------------------------------------
  // 7. CERTIFICATIONS
  // ----------------------------------------------------
  if (cv.certifications && cv.certifications.length > 0) {
    drawSectionHeader('Certifications & Credentials');

    for (const cert of cv.certifications) {
      checkPageBreak(7);

      doc.setFont(fontName, 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(cert.name, margin, y);

      if (cert.issueDate) {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const certDate = `${cert.issueDate}${cert.expiryDate ? ` (Exp: ${cert.expiryDate})` : ''}`;
        const cdWidth = doc.getTextWidth(certDate);
        doc.text(certDate, margin + contentWidth - cdWidth, y);
      }
      y += 4 * spacingMultiplier;

      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const certSub = [cert.issuer, cert.credentialId ? `ID: ${cert.credentialId}` : ''].filter(Boolean).join(' | ');
      doc.text(certSub, margin, y);
      y += 4 * spacingMultiplier;
    }
  }

  // Save the PDF file
  const filename = `${fullName.replace(/[^a-zA-Z0-9_-]/g, '_')}_ATS_Resume.pdf`;
  doc.save(filename);
}
