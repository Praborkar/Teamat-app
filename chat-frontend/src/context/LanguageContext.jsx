import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "hi", name: "Hindi" },
];

export const LanguageProvider = ({ children }) => {
  const [preferredLanguage, setPreferredLanguage] = useState(
    localStorage.getItem("preferredLanguage") || "en"
  );

  useEffect(() => {
    localStorage.setItem("preferredLanguage", preferredLanguage);
  }, [preferredLanguage]);

  return (
    <LanguageContext.Provider value={{ preferredLanguage, setPreferredLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
