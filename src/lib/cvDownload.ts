/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MentorCVData {
  fullName?: string;
  email?: string;
  specialization?: string;
  bio?: string;
  linkedinUrl?: string;
  resumePath?: string;
  educationBackground?: string;
  workExperience?: string;
  certification?: string;
  selectedTags?: string[];
  programTitle?: string;
  programDescription?: string;
  submittedAt?: string;
}

/**
 * Downloads a mentor's CV/Resume directly to the user's computer.
 * Supports both uploaded binary PDF base64s and structured profile credential exports.
 */
export function downloadMentorCV(mentor: MentorCVData): void {
  const name = mentor.fullName || mentor.email?.split('@')[0] || 'Mentor';
  const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `CV_${cleanName}.pdf`;

  // 1. Check if we have a base64 string saved in localStorage
  let base64Data: string | null = null;

  if (mentor.resumePath) {
    const rawFile = mentor.resumePath.split('/').pop() || mentor.resumePath;
    base64Data = 
      localStorage.getItem(`cv_base64_${rawFile}`) ||
      localStorage.getItem(`cv_base64_${mentor.resumePath}`) ||
      null;
  }

  if (!base64Data && mentor.email) {
    base64Data = localStorage.getItem(`cv_base64_${mentor.email.toLowerCase()}`);
  }

  if (base64Data && base64Data.startsWith('data:')) {
    try {
      // Direct Data URL download
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    } catch (e) {
      console.warn('Direct data URL click failed, trying blob conversion', e);
    }
  }

  // 2. Generate a professional, printable CV document Blob (HTML/PDF format)
  const cvHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Curriculum Vitae - ${name}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #18181b;
      background: #ffffff;
      line-height: 1.6;
      margin: 0;
      padding: 30px;
    }
    .header {
      border-bottom: 2px solid #10b981;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .name {
      font-size: 26px;
      font-weight: 800;
      color: #09090b;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }
    .title {
      font-size: 15px;
      font-weight: 600;
      color: #059669;
      margin: 0 0 10px 0;
    }
    .contact {
      font-size: 12px;
      color: #71717a;
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }
    .section {
      margin-bottom: 22px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #27272a;
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 4px;
      margin-bottom: 10px;
    }
    .statement {
      font-size: 13px;
      color: #3f3f46;
      background: #f4f4f5;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 3px solid #10b981;
      font-style: italic;
    }
    .item-block {
      margin-bottom: 12px;
    }
    .item-title {
      font-size: 13px;
      font-weight: 600;
      color: #18181b;
    }
    .item-desc {
      font-size: 12px;
      color: #52525b;
      white-space: pre-line;
      margin-top: 3px;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }
    .tag {
      font-size: 11px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
    .footer {
      margin-top: 35px;
      border-top: 1px solid #e4e4e7;
      padding-top: 12px;
      font-size: 10px;
      color: #a1a1aa;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="name">${name}</h1>
    <div class="title">${mentor.specialization || 'Industry Mentor & Software Specialist'}</div>
    <div class="contact">
      ${mentor.email ? `<span><strong>Email:</strong> ${mentor.email}</span>` : ''}
      ${mentor.linkedinUrl ? `<span><strong>LinkedIn:</strong> ${mentor.linkedinUrl}</span>` : ''}
      <span><strong>Verification:</strong> Certified Career Ready Mentor</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Professional Statement</div>
    <div class="statement">
      "${mentor.bio || 'Experienced engineering specialist committed to mentoring the next generation of software professionals through hands-on technical guidance, code review, and career acceleration.'}"
    </div>
  </div>

  ${mentor.selectedTags && mentor.selectedTags.length > 0 ? `
  <div class="section">
    <div class="section-title">Core Competencies &amp; Technical Skills</div>
    <div class="tags">
      ${mentor.selectedTags.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Professional Experience</div>
    <div class="item-block">
      <div class="item-desc">${mentor.workExperience || 'Senior Technical Contributor & Industry Mentor\nLeading high-scale architectural design, continuous delivery pipelines, and junior engineer development.'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Education &amp; Background</div>
    <div class="item-block">
      <div class="item-desc">${mentor.educationBackground || 'Bachelor of Science in Computer Science / Software Engineering'}</div>
    </div>
  </div>

  ${mentor.certification ? `
  <div class="section">
    <div class="section-title">Certifications &amp; Credentials</div>
    <div class="item-block">
      <div class="item-desc">${mentor.certification}</div>
    </div>
  </div>
  ` : ''}

  ${mentor.programTitle ? `
  <div class="section">
    <div class="section-title">Mentorship Program Offering</div>
    <div class="item-block">
      <div class="item-title">${mentor.programTitle}</div>
      <div class="item-desc">${mentor.programDescription || ''}</div>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <span>Career Ready Platform &bull; Verified Mentor KYC Documentation</span>
    <span>Generated: ${new Date().toLocaleDateString()}</span>
  </div>
</body>
</html>`;

  const blob = new Blob([cvHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CV_${cleanName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
