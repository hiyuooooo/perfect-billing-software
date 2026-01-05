import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export interface Shortcut {
  id: string;
  key: string;
  section: string;
  action: string;
  description: string;
  enabled: boolean;
  isGlobal: boolean;
}

interface ShortcutsContextType {
  shortcuts: Shortcut[];
  updateShortcut: (id: string, key: string, enabled: boolean) => void;
  resetShortcuts: () => void;
  getShortcutsBySection: (section: string) => Shortcut[];
  registerShortcutHandler: (section: string, handler: (key: string) => void) => void;
  unregisterShortcutHandler: (section: string) => void;
  toggleAllShortcuts: (enabled: boolean) => void;
  toggleSectionShortcuts: (section: string, enabled: boolean) => void;
  areAllShortcutsEnabled: () => boolean;
  areSectionShortcutsEnabled: (section: string) => boolean;
}

const ShortcutsContext = createContext<ShortcutsContextType | undefined>(undefined);

const DEFAULT_SHORTCUTS: Shortcut[] = [
  // Global shortcuts
  {
    id: "global_dashboard",
    key: "d",
    section: "global",
    action: "dashboard",
    description: "Go to Dashboard",
    enabled: true,
    isGlobal: true,
  },
  {
    id: "global_transactions",
    key: "t",
    section: "global",
    action: "transactions",
    description: "Go to Transactions",
    enabled: true,
    isGlobal: true,
  },
  {
    id: "global_bills",
    key: "b",
    section: "global",
    action: "bills",
    description: "Go to Bills",
    enabled: true,
    isGlobal: true,
  },
  {
    id: "global_stock",
    key: "i",
    section: "global",
    action: "stock",
    description: "Go to Stock Management",
    enabled: true,
    isGlobal: true,
  },
  {
    id: "global_mismatch",
    key: "m",
    section: "global",
    action: "mismatch",
    description: "Go to Mismatch",
    enabled: true,
    isGlobal: true,
  },
  {
    id: "global_customers",
    key: "c",
    section: "global",
    action: "customers",
    description: "Go to Customers",
    enabled: true,
    isGlobal: true,
  },

  // Bills page shortcuts
  {
    id: "bills_create",
    key: "n",
    section: "bills",
    action: "create_bill",
    description: "Create New Bill",
    enabled: true,
    isGlobal: false,
  },
  {
    id: "bills_save",
    key: "s",
    section: "bills",
    action: "save_bill",
    description: "Create Bill",
    enabled: true,
    isGlobal: false,
  },
  {
    id: "bills_add",
    key: "a",
    section: "bills",
    action: "add_to_bill",
    description: "Add to Bill",
    enabled: true,
    isGlobal: false,
  },
  {
    id: "bills_template",
    key: "e",
    section: "bills",
    action: "save_as_template",
    description: "Save as Template",
    enabled: true,
    isGlobal: false,
  },
  {
    id: "bills_clear",
    key: "r",
    section: "bills",
    action: "clear_items",
    description: "Clear Items",
    enabled: true,
    isGlobal: false,
  },

  // Transactions page shortcuts
  {
    id: "trans_import",
    key: "i",
    section: "transactions",
    action: "import_transactions",
    description: "Import Transactions",
    enabled: true,
    isGlobal: false,
  },
  {
    id: "trans_auto",
    key: "a",
    section: "transactions",
    action: "auto_bill",
    description: "Auto Bill",
    enabled: true,
    isGlobal: false,
  },

  // Stock page shortcuts
  {
    id: "stock_quick_add",
    key: "q",
    section: "stock",
    action: "quick_add_stock",
    description: "Open Quick Add Stock Dialog",
    enabled: true,
    isGlobal: false,
  },
  {
    id: "stock_add",
    key: "a",
    section: "stock",
    action: "add_stock",
    description: "Add Stock Button",
    enabled: true,
    isGlobal: false,
  },
];

export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(DEFAULT_SHORTCUTS);
  const [handlerMap, setHandlerMap] = useState<Map<string, (key: string) => void>>(new Map());
  const navigate = useNavigate();

  // Load shortcuts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("shortcuts");
    if (saved) {
      try {
        setShortcuts(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load shortcuts:", error);
        setShortcuts(DEFAULT_SHORTCUTS);
      }
    }
  }, []);

  // Save shortcuts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
  }, [shortcuts]);

  // Global keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields or when dialog is open
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      // Don't trigger shortcuts when any dialog is open
      const dialogElement = document.querySelector("[role='dialog']");
      if (dialogElement) {
        return;
      }

      const key = event.key.toLowerCase();
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      shortcuts.forEach((shortcut) => {
        if (
          shortcut.enabled &&
          shortcut.key.toLowerCase() === key &&
          (shortcut.isGlobal || handlerMap.has(shortcut.section))
        ) {
          event.preventDefault();

          if (shortcut.isGlobal) {
            // Handle global shortcuts
            switch (shortcut.action) {
              case "dashboard":
                navigate("/");
                break;
              case "transactions":
                navigate("/transactions");
                break;
              case "bills":
                navigate("/bills");
                break;
              case "stock":
                navigate("/stock");
                break;
              case "mismatch":
                navigate("/reports");
                break;
              case "customers":
                navigate("/customers");
                break;
            }
          } else {
            // Handle section-specific shortcuts
            const handler = handlerMap.get(shortcut.section);
            if (handler) {
              handler(shortcut.action);
            }
          }
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, handlerMap]);

  const updateShortcut = (id: string, key: string, enabled: boolean) => {
    setShortcuts((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, key: key.toLowerCase(), enabled }
          : s
      )
    );
  };

  const resetShortcuts = () => {
    setShortcuts(DEFAULT_SHORTCUTS);
  };

  const getShortcutsBySection = (section: string) => {
    return shortcuts.filter((s) => s.section === section);
  };

  const registerShortcutHandler = useCallback(
    (section: string, handler: (action: string) => void) => {
      setHandlerMap((prev) => new Map(prev).set(section, handler));
    },
    []
  );

  const unregisterShortcutHandler = useCallback((section: string) => {
    setHandlerMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(section);
      return newMap;
    });
  }, []);

  const toggleAllShortcuts = (enabled: boolean) => {
    setShortcuts((prev) =>
      prev.map((s) => ({ ...s, enabled }))
    );
  };

  const toggleSectionShortcuts = (section: string, enabled: boolean) => {
    setShortcuts((prev) =>
      prev.map((s) =>
        s.section === section ? { ...s, enabled } : s
      )
    );
  };

  const areAllShortcutsEnabled = () => {
    return shortcuts.every((s) => s.enabled);
  };

  const areSectionShortcutsEnabled = (section: string) => {
    const sectionShortcuts = shortcuts.filter((s) => s.section === section);
    return sectionShortcuts.length > 0 && sectionShortcuts.every((s) => s.enabled);
  };

  return (
    <ShortcutsContext.Provider
      value={{
        shortcuts,
        updateShortcut,
        resetShortcuts,
        getShortcutsBySection,
        registerShortcutHandler,
        unregisterShortcutHandler,
        toggleAllShortcuts,
        toggleSectionShortcuts,
        areAllShortcutsEnabled,
        areSectionShortcutsEnabled,
      }}
    >
      {children}
    </ShortcutsContext.Provider>
  );
}

export function useShortcuts() {
  const context = useContext(ShortcutsContext);
  if (!context) {
    throw new Error("useShortcuts must be used within ShortcutsProvider");
  }
  return context;
}
