import React, { useState, useEffect } from "react";
import { useSEO } from "../../hooks/useSEO";
import { LanguageDef, LANGUAGES_LIST } from "./compilerData";
import LanguageSelection from "./LanguageSelection";
import CompilerIDE from "./CompilerIDE";

export function CodeCompiler() {
  useSEO({
    title: "Pokhara University BCSIT Online Compiler Sandbox",
    description: "Write, compile, and run code instantly in 18+ programming languages with our sandboxed runtime workspace.",
    keywords: "code compiler, online compiler, run python online, run java online, bcsit coding practice"
  });

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageDef | null>(null);
  const [initialFiles, setInitialFiles] = useState<{ name: string; content: string }[] | undefined>(undefined);

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
