/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from 'react';
import { CVData, CVTemplateId } from '../../types/cv';
import { 
  Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink,
  Award, Briefcase, GraduationCap, Code2, FolderGit2 
} from 'lucide-react';

interface CVDocumentPreviewProps {
  cv: CVData;
  scale?: number;
}

export const CVDocumentPreview = forwardRef<HTMLDivElement, CVDocumentPreviewProps>(({ cv, scale = 1 }, ref) => {
  const { personalInfo: p, summary, skills, workExperience, education, projects, certifications, designSettings } = cv;
  const template = designSettings?.template || 'classic-ats';
  const density = designSettings?.spacing || 'normal';

  // Density spacing maps
  const paddingClass = density === 'compact' ? 'p-6 sm:p-8 space-y-4' : density === 'spacious' ? 'p-8 sm:p-12 space-y-6' : 'p-8 sm:p-10 space-y-5';
  const sectionSpacingClass = density === 'compact' ? 'space-y-3' : density === 'spacious' ? 'space-y-5' : 'space-y-4';
  const itemSpacingClass = density === 'compact' ? 'space-y-1' : density === 'spacious' ? 'space-y-3' : 'space-y-2';

  // Template specific styles
  const isClassic = template === 'classic-ats';
  const isModern = template === 'modern-tech';
  const isEngineering = template === 'engineering-star';
  const isExecutive = template === 'compact-executive';

  const showPhoto = Boolean(p.photoUrl && designSettings?.showPhoto !== false);
  const photoShapeClass = 
    designSettings?.photoShape === 'square'
      ? 'rounded-none'
      : designSettings?.photoShape === 'rounded'
      ? 'rounded-xl'
      : 'rounded-full';

  return (
    <div
      ref={ref}
      id="ats-cv-printable-document"
      className={`bg-white text-zinc-900 shadow-2xl rounded-sm mx-auto max-w-[820px] w-full min-h-[1050px] transition-all print:shadow-none print:m-0 print:w-full print:max-w-none print:min-h-0 print:border-none print:p-6 ${paddingClass}`}
      style={{
        fontFamily: designSettings.fontFamily === 'serif' 
          ? 'Georgia, Cambria, serif' 
          : designSettings.fontFamily === 'mono' 
          ? 'monospace' 
          : 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* 1. Header / Contact Block */}
      <header className="border-b border-zinc-300 pb-4 space-y-1.5 print:pb-3">
        <div className={`flex flex-col sm:flex-row items-center ${showPhoto ? 'gap-4 sm:gap-6 text-center sm:text-left' : 'justify-center text-center'} w-full`}>
          {showPhoto && p.photoUrl && (
            <div className="shrink-0 flex justify-center">
              <img
                src={p.photoUrl}
                alt={p.fullName || 'Identity Photo'}
                className={`w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-zinc-300 shadow-sm print:shadow-none ${photoShapeClass}`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className={`space-y-1.5 flex-1 min-w-0 ${showPhoto ? 'text-center sm:text-left' : 'text-center'}`}>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950">
              {p.fullName || 'YOUR FULL NAME'}
            </h1>
            {p.headline && (
              <p className="text-sm font-semibold text-zinc-700 tracking-normal">
                {p.headline}
              </p>
            )}
            
            {/* Contact Links & Badges */}
            <div className={`flex flex-wrap items-center ${showPhoto ? 'justify-center sm:justify-start' : 'justify-center'} gap-x-3 gap-y-1 text-xs text-zinc-600 font-medium pt-1`}>
              {p.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-zinc-400 print:hidden" />
                  <span>{p.location}</span>
                </span>
              )}
              {p.email && (
                <span className="flex items-center gap-1">
                  <span className="text-zinc-300 print:hidden">•</span>
                  <Mail className="h-3 w-3 text-zinc-400 print:hidden" />
                  <a href={`mailto:${p.email}`} className="hover:underline text-zinc-800">{p.email}</a>
                </span>
              )}
              {p.phone && (
                <span className="flex items-center gap-1">
                  <span className="text-zinc-300 print:hidden">•</span>
                  <Phone className="h-3 w-3 text-zinc-400 print:hidden" />
                  <span>{p.phone}</span>
                </span>
              )}
              {p.linkedinUrl && (
                <span className="flex items-center gap-1">
                  <span className="text-zinc-300 print:hidden">•</span>
                  <Linkedin className="h-3 w-3 text-zinc-400 print:hidden" />
                  <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline text-blue-800">
                    {p.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'in/')}
                  </a>
                </span>
              )}
              {p.githubUrl && (
                <span className="flex items-center gap-1">
                  <span className="text-zinc-300 print:hidden">•</span>
                  <Github className="h-3 w-3 text-zinc-400 print:hidden" />
                  <a href={p.githubUrl} target="_blank" rel="noreferrer" className="hover:underline text-zinc-800">
                    {p.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, 'github/')}
                  </a>
                </span>
              )}
              {p.portfolioUrl && (
                <span className="flex items-center gap-1">
                  <span className="text-zinc-300 print:hidden">•</span>
                  <Globe className="h-3 w-3 text-zinc-400 print:hidden" />
                  <a href={p.portfolioUrl} target="_blank" rel="noreferrer" className="hover:underline text-blue-800">
                    {p.portfolioUrl.replace(/^https?:\/\//, '')}
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Professional Summary */}
      {summary && (
        <section className={sectionSpacingClass}>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-800 pb-0.5 mb-1.5 flex items-center gap-1.5">
            {designSettings?.showSectionIcons && <Briefcase className="h-3.5 w-3.5 text-zinc-600 print:hidden" />}
            Professional Summary
          </h2>
          <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-800 text-justify">
            {summary}
          </p>
        </section>
      )}

      {/* 3. Technical Skills */}
      {skills && (
        <section className={sectionSpacingClass}>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-800 pb-0.5 mb-1.5 flex items-center gap-1.5">
            {designSettings?.showSectionIcons && <Code2 className="h-3.5 w-3.5 text-zinc-600 print:hidden" />}
            Technical Skills & Competencies
          </h2>
          <div className="text-xs sm:text-[13px] space-y-1 text-zinc-800">
            {skills.languages?.length > 0 && (
              <p>
                <strong className="text-zinc-950 font-bold">Languages: </strong>
                <span>{skills.languages.join(', ')}</span>
              </p>
            )}
            {skills.frameworks?.length > 0 && (
              <p>
                <strong className="text-zinc-950 font-bold">Frameworks & Libraries: </strong>
                <span>{skills.frameworks.join(', ')}</span>
              </p>
            )}
            {skills.toolsAndDatabases?.length > 0 && (
              <p>
                <strong className="text-zinc-950 font-bold">Databases & Tools: </strong>
                <span>{skills.toolsAndDatabases.join(', ')}</span>
              </p>
            )}
            {skills.cloudAndDevOps?.length > 0 && (
              <p>
                <strong className="text-zinc-950 font-bold">Cloud, DevOps & Infra: </strong>
                <span>{skills.cloudAndDevOps.join(', ')}</span>
              </p>
            )}
            {skills.architectureAndPractices?.length > 0 && (
              <p>
                <strong className="text-zinc-950 font-bold">Architecture & Practices: </strong>
                <span>{skills.architectureAndPractices.join(', ')}</span>
              </p>
            )}
            {skills.softSkills?.length > 0 && (
              <p>
                <strong className="text-zinc-950 font-bold">Leadership & Collaboration: </strong>
                <span>{skills.softSkills.join(', ')}</span>
              </p>
            )}
          </div>
        </section>
      )}

      {/* 4. Work Experience */}
      {workExperience && workExperience.length > 0 && (
        <section className={sectionSpacingClass}>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-800 pb-0.5 mb-2 flex items-center gap-1.5">
            {designSettings?.showSectionIcons && <Briefcase className="h-3.5 w-3.5 text-zinc-600 print:hidden" />}
            Professional Experience
          </h2>
          <div className={itemSpacingClass}>
            {workExperience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div>
                    <span className="text-xs sm:text-[13px] font-bold text-zinc-950">{exp.role}</span>
                    <span className="text-xs sm:text-[13px] font-medium text-zinc-800"> — {exp.company}</span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-zinc-600 font-medium">
                    <span>{exp.location}</span>
                    <span className="mx-1.5">|</span>
                    <span className="font-semibold text-zinc-800">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                  </div>
                </div>

                {/* Bullet Points */}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs sm:text-[12.5px] leading-relaxed text-zinc-800">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="pl-0.5">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tech stack row */}
                {exp.techStack && exp.techStack.length > 0 && (
                  <p className="text-[11px] text-zinc-600 italic pl-4">
                    <span className="font-semibold not-italic text-zinc-700">Environment: </span>
                    {exp.techStack.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Key Projects & Capstone Showcase */}
      {projects && projects.length > 0 && (
        <section className={sectionSpacingClass}>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-800 pb-0.5 mb-2 flex items-center gap-1.5">
            {designSettings?.showSectionIcons && <FolderGit2 className="h-3.5 w-3.5 text-zinc-600 print:hidden" />}
            Key Projects & Capstone Implementations
          </h2>
          <div className={itemSpacingClass}>
            {projects.map((proj) => (
              <div key={proj.id} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="text-xs sm:text-[13px] font-bold text-zinc-950">{proj.title}</span>
                    {proj.role && <span className="text-xs text-zinc-600">({proj.role})</span>}
                    {(proj.liveUrl || proj.githubUrl) && (
                      <span className="text-[11px] text-blue-800 space-x-2 font-medium">
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="hover:underline">
                            [Live Demo]
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="hover:underline">
                            [GitHub]
                          </a>
                        )}
                      </span>
                    )}
                  </div>
                  {proj.date && (
                    <span className="text-[11px] sm:text-xs text-zinc-600 font-medium">{proj.date}</span>
                  )}
                </div>

                {/* Highlights */}
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs sm:text-[12.5px] leading-relaxed text-zinc-800">
                    {proj.highlights.map((h, i) => (
                      <li key={i} className="pl-0.5">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tech stack */}
                {proj.techStack && proj.techStack.length > 0 && (
                  <p className="text-[11px] text-zinc-600 italic pl-4">
                    <span className="font-semibold not-italic text-zinc-700">Technologies: </span>
                    {proj.techStack.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Education */}
      {education && education.length > 0 && (
        <section className={sectionSpacingClass}>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-800 pb-0.5 mb-2 flex items-center gap-1.5">
            {designSettings?.showSectionIcons && <GraduationCap className="h-3.5 w-3.5 text-zinc-600 print:hidden" />}
            Education
          </h2>
          <div className={itemSpacingClass}>
            {education.map((edu) => (
              <div key={edu.id} className="space-y-0.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div>
                    <span className="text-xs sm:text-[13px] font-bold text-zinc-950">
                      {edu.degree} in {edu.fieldOfStudy}
                    </span>
                    <span className="text-xs text-zinc-700"> — {edu.institution}</span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-zinc-600">
                    <span>{edu.location}</span>
                    <span className="mx-1.5">|</span>
                    <span className="font-semibold text-zinc-800">{edu.startDate} – {edu.endDate}</span>
                  </div>
                </div>
                {(edu.gpa || edu.honors) && (
                  <p className="text-[11px] text-zinc-600">
                    {edu.gpa && <span>GPA: <strong>{edu.gpa}</strong> </span>}
                    {edu.honors && <span className="italic">({edu.honors})</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Certifications & Accreditations */}
      {certifications && certifications.length > 0 && (
        <section className={sectionSpacingClass}>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-800 pb-0.5 mb-2 flex items-center gap-1.5">
            {designSettings?.showSectionIcons && <Award className="h-3.5 w-3.5 text-zinc-600 print:hidden" />}
            Certifications & Accreditations
          </h2>
          <ul className="list-disc list-outside pl-4 space-y-1 text-xs sm:text-[12.5px] text-zinc-800">
            {certifications.map((cert) => (
              <li key={cert.id} className="pl-0.5">
                <strong className="text-zinc-950 font-bold">{cert.name}</strong>
                <span className="text-zinc-700"> — {cert.issuer}</span>
                <span className="text-zinc-500 text-[11px] ml-1.5">({cert.issueDate})</span>
                {cert.credentialId && (
                  <span className="text-zinc-500 font-mono text-[10px] ml-2">[ID: {cert.credentialId}]</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
});

CVDocumentPreview.displayName = 'CVDocumentPreview';
