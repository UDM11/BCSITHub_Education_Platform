import React, { useState, useEffect, useMemo } from "react";
import { useSEO } from "../../hooks/useSEO";
import { LanguageDef, LANGUAGES_LIST } from "./compilerData";
import LanguageSelection from "./LanguageSelection";
import CompilerIDE from "./CompilerIDE";

export function CodeCompiler() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageDef | null>(null);
  const [initialFiles, setInitialFiles] = useState<{ name: string; content: string }[] | undefined>(undefined);

  const seoTitle = useMemo(() => {
    if (selectedLanguage) {
      return `Online ${selectedLanguage.name} Compiler & Sandbox`;
    }
    return "Online Multi-Language Code Compiler & Sandbox";
  }, [selectedLanguage]);

  const seoDescription = useMemo(() => {
    if (selectedLanguage) {
      return `Write, compile, and execute ${selectedLanguage.name} code online. Practice coding, run templates, and debug ${selectedLanguage.name} inside our sandboxed workspace.`;
    }
    return "Write, compile, and run code instantly in 18+ programming languages (Python, Java, C++, JS, and more) with our sandboxed runtime workspace.";
  }, [selectedLanguage]);

  const seoKeywords = useMemo(() => {
    if (selectedLanguage) {
      const name = selectedLanguage.name;
      return `run ${name.toLowerCase()} online, ${name.toLowerCase()} compiler, online ${name.toLowerCase()} ide, write ${name.toLowerCase()} code`;
    }
    return "code compiler, online compiler, run python online, run java online, bcsit coding practice";
  }, [selectedLanguage]);

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    image: "https://bcsithub.lovestoblog.com/logo.png"
  });

  // Check if there is a preset code block loaded from lecture notes
  useEffect(() => {
    const rawPreset = localStorage.getItem("bcsithub_sandbox_preset");
    if (rawPreset) {
      try {
        const preset = JSON.parse(rawPreset);
        // Find language by code keyword or extension
        const targetLang = LANGUAGES_LIST.find(
          (l) =>
            l.id === preset.language.toLowerCase() ||
            l.extension === preset.language.toLowerCase() ||
            l.pistonLanguage === preset.language.toLowerCase()
        );

        if (targetLang) {
          setSelectedLanguage(targetLang);
          if (preset.code) {
            // Load custom code into main file
            const ext = targetLang.extension;
            setInitialFiles([
              { name: `main.${ext}`, content: preset.code }
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to parse sandbox preset:", err);
      } finally {
        localStorage.removeItem("bcsithub_sandbox_preset");
      }
    }
  }, []);

  const handleSelectLanguage = (lang: LanguageDef) => {
    setInitialFiles(undefined);
    setSelectedLanguage(lang);
  };
  
  const handleBack = () => {
    setSelectedLanguage(null);
    setInitialFiles(undefined);
  };

  return (
    <>
      {/* Language Selection — sits in normal page flow so Navbar/Footer show */}
      <div className="min-h-screen">
        <LanguageSelection onSelectLanguage={handleSelectLanguage} />
      </div>

      {/* IDE Overlay — fixed full-screen, covers Navbar and Footer completely */}
      {selectedLanguage && (
        <div className="fixed inset-0 z-[9999] bg-[#1e1e1e]">
          <CompilerIDE
            language={selectedLanguage}
            onBack={handleBack}
            onSelectLanguage={handleSelectLanguage}
            // Pass preset files if available
            {...(initialFiles ? { overrideInitialFiles: initialFiles } : {})}
          />
        </div>
      )}
    </>
  );
}
