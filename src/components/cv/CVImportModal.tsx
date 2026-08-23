/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, UploadCloud, FileText, Sparkles, Check, AlertCircle, 
  ArrowRight, RefreshCw, FileCode, CheckCircle2 
} from 'lucide-react';
import { CVData } from '../../types/cv';
import { parseRawTextToCV, extractTextFromPDF } from '../../lib/cvStore';
import { useToast } from '../../context/ToastContext';

interface CVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (parsedCV: Partial<CVData>) => void;
}

export const CVImportModal: React.FC<CVImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<Partial<CVData> | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    setFileName(file.name);

    try {
      let extractedText = '';
      if (file.name.endsWith('.pdf')) {
        extractedText = await extractTextFromPDF(file);
      } else if (file.name.endsWith('.json')) {
        const jsonContent = await file.text();
        try {
          const parsedJson = JSON.parse(jsonContent);
          setExtractedPreview(parsedJson);
          setIsProcessing(false);
          return;
        } catch (e) {
          extractedText = jsonContent;
        }
      } else {
        // .txt, .md, etc.
        extractedText = await file.text();
      }

      const parsed = parseRawTextToCV(extractedText);
      setExtractedPreview(parsed);
      addToast('File analyzed successfully! Review the extracted fields below.', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Error reading file: ' + (err?.message || 'Unsupported format'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParsePasted = () => {
    if (!pastedText.trim()) {
      addToast('Please paste your resume text first', 'warning');
      return;
    }
    setIsProcessing(true);
    try {
      const parsed = parseRawTextToCV(pastedText);
      setExtractedPreview(parsed);
      addToast('Extracted resume details successfully!', 'success');
    } catch (err) {
      addToast('Failed to parse text', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!extractedPreview) return;
    onImportComplete(extractedPreview);
    onClose();
    addToast('ATS CV populated with imported data!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Import Existing CV or Resume
              </h3>
              <p className="text-xs text-zinc-400">
                Upload PDF, Text, Markdown or paste raw content to auto-populate fields
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/30 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Upload File (PDF / TXT / MD)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            Paste Raw Text
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-grow">
          {activeTab === 'upload' && !extractedPreview && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                isDragOver
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-zinc-700 hover:border-zinc-600 bg-zinc-950/50'
              }`}
              onClick={() => document.getElementById('cv-file-input')?.click()}
            >
              <input
                id="cv-file-input"
                type="file"
                accept=".pdf,.txt,.md,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-green-400 mb-3">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold text-zinc-200">
                Click to browse or drag and drop your file here
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Supports PDF (.pdf), Plain Text (.txt), Markdown (.md), or JSON Resume
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
                <span>Fast Client-Side Parsing</span>
              </div>
            </div>
          )}

          {activeTab === 'paste' && !extractedPreview && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-300">
                Paste your existing Resume or CV content here:
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="John Doe&#10;Senior Software Engineer&#10;john.doe@email.com | +1 (555) 019-2834 | New York, NY&#10;&#10;SUMMARY&#10;Impact-driven software engineer with 5 years experience...&#10;&#10;EXPERIENCE&#10;Tech Corp - Senior Engineer (2021 - Present)&#10;• Spearheaded cloud migration reducing costs by 30%...&#10;&#10;SKILLS&#10;TypeScript, React, Node.js, PostgreSQL, Docker"
                rows={10}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-green-500 focus:outline-none font-mono leading-relaxed"
              />
              <button
                type="button"
                onClick={handleParsePasted}
                disabled={isProcessing || !pastedText.trim()}
                className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Extract & Parse Structured Fields
                  </>
                )}
              </button>
            </div>
          )}

          {/* Extracted Preview Review */}
          {extractedPreview && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-green-300">
                    Extraction Completed {fileName ? `from ${fileName}` : ''}
                  </h4>
                  <p className="text-[11px] text-zinc-300 mt-0.5">
                    We've mapped your content into standardized ATS fields. Verify the details below and click Apply.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-3 text-xs">
                <div>
                  <span className="text-zinc-500 font-mono uppercase text-[10px] block">Name & Headline</span>
                  <p className="font-bold text-zinc-200">
                    {extractedPreview.personalInfo?.fullName || 'Not detected'} — {extractedPreview.personalInfo?.headline || 'No headline'}
                  </p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    {[
                      extractedPreview.personalInfo?.email,
                      extractedPreview.personalInfo?.phone,
                      extractedPreview.personalInfo?.location,
                      extractedPreview.personalInfo?.linkedinUrl,
                      extractedPreview.personalInfo?.githubUrl,
                    ].filter(Boolean).join(' • ')}
                  </p>
                </div>

                {extractedPreview.summary && (
                  <div className="pt-2 border-t border-zinc-850">
                    <span className="text-zinc-500 font-mono uppercase text-[10px] block">Summary</span>
                    <p className="text-zinc-300 text-[11px] line-clamp-3">
                      {extractedPreview.summary}
                    </p>
                  </div>
                )}

                {extractedPreview.skills && (
                  <div className="pt-2 border-t border-zinc-850">
                    <span className="text-zinc-500 font-mono uppercase text-[10px] block">Extracted Skills</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {[
                        ...(extractedPreview.skills.languages || []),
                        ...(extractedPreview.skills.frameworks || []),
                        ...(extractedPreview.skills.toolsAndDatabases || []),
                        ...(extractedPreview.skills.cloudAndDevOps || [])
                      ].slice(0, 15).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {extractedPreview.workExperience && extractedPreview.workExperience.length > 0 && (
                  <div className="pt-2 border-t border-zinc-850">
                    <span className="text-zinc-500 font-mono uppercase text-[10px] block">
                      Work Experience ({extractedPreview.workExperience.length} positions)
                    </span>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-zinc-300 text-[11px]">
                      {extractedPreview.workExperience.map((exp, i) => (
                        <li key={i}>
                          <strong>{exp.role}</strong> at {exp.company} ({exp.startDate} - {exp.endDate})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setExtractedPreview(null);
                    setPastedText('');
                    setFileName(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  ← Upload or paste different content
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-zinc-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-green-600/20"
                >
                  <Check className="h-4 w-4" />
                  Apply & Populate Active CV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
