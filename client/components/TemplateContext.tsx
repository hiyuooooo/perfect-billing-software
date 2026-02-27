import React, { createContext, useContext, useState, useEffect } from "react";

export interface BillItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface BillTemplate {
  id: string;
  name: string;
  items: BillItem[];
  createdAt: string;
  description?: string;
}

interface TemplateContextType {
  templates: BillTemplate[];
  saveTemplate: (name: string, items: BillItem[], description?: string) => void;
  deleteTemplate: (id: string) => void;
  loadTemplate: (id: string) => BillItem[] | null;
  updateTemplate: (id: string, name: string, items: BillItem[], description?: string) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<BillTemplate[]>([]);

  // Load templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("billTemplates");
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load templates:", error);
      }
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("billTemplates", JSON.stringify(templates));
  }, [templates]);

  const saveTemplate = (name: string, items: BillItem[], description?: string) => {
    const newTemplate: BillTemplate = {
      id: Date.now().toString(),
      name,
      items: JSON.parse(JSON.stringify(items)), // Deep copy
      createdAt: new Date().toISOString(),
      description,
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const loadTemplate = (id: string): BillItem[] | null => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      return JSON.parse(JSON.stringify(template.items)); // Deep copy
    }
    return null;
  };

  const updateTemplate = (id: string, name: string, items: BillItem[], description?: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              name,
              items: JSON.parse(JSON.stringify(items)),
              description,
            }
          : t
      )
    );
  };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        saveTemplate,
        deleteTemplate,
        loadTemplate,
        updateTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplate must be used within TemplateProvider");
  }
  return context;
}
