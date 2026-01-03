import React, { useState } from "react";
import { useShortcuts } from "./ShortcutsContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Keyboard, RotateCcw } from "lucide-react";

export function ShortcutsSettings() {
  const {
    shortcuts,
    updateShortcut,
    resetShortcuts,
    getShortcutsBySection,
    toggleAllShortcuts,
    toggleSectionShortcuts,
    areAllShortcutsEnabled,
    areSectionShortcutsEnabled,
  } = useShortcuts();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState("");

  const handleKeyChange = (id: string) => {
    if (editingKey.trim()) {
      updateShortcut(id, editingKey, shortcuts.find((s) => s.id === id)?.enabled ?? true);
      setEditingId(null);
      setEditingKey("");
    }
  };

  const globalShortcuts = getShortcutsBySection("global");
  const billsShortcuts = getShortcutsBySection("bills");
  const transactionsShortcuts = getShortcutsBySection("transactions");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start text-sm">
          <Keyboard className="h-4 w-4 mr-2" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Customize your keyboard shortcuts for quick access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Master Enable/Disable Toggle */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">Enable All Shortcuts</h3>
                <p className="text-sm text-muted-foreground">
                  {areAllShortcutsEnabled()
                    ? "All shortcuts are currently enabled"
                    : "Some or all shortcuts are disabled"}
                </p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={areAllShortcutsEnabled()}
                  onChange={(e) => toggleAllShortcuts(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
              </label>
            </div>
          </div>

          {/* Global Shortcuts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base">Global Navigation</h3>
              <label className="flex items-center space-x-2 text-sm">
                <span>
                  {areSectionShortcutsEnabled("global") ? "✓ Enabled" : "✗ Disabled"}
                </span>
                <input
                  type="checkbox"
                  checked={areSectionShortcutsEnabled("global")}
                  onChange={(e) => toggleSectionShortcuts("global", e.target.checked)}
                  className="w-4 h-4 rounded"
                />
              </label>
            </div>
            <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
              {globalShortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between p-2 hover:bg-muted/50 rounded"
                >
                  <div className="flex-1">
                    <Label className="text-sm font-medium">
                      {shortcut.description}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {shortcut.action}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingId === shortcut.id ? (
                      <>
                        <Input
                          autoFocus
                          value={editingKey}
                          onChange={(e) => setEditingKey(e.target.value.toLowerCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleKeyChange(shortcut.id);
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                              setEditingKey("");
                            }
                          }}
                          className="w-16 h-8 text-center text-xs"
                          maxLength={1}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleKeyChange(shortcut.id)}
                          className="h-8"
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <kbd className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-semibold">
                          {shortcut.key.toUpperCase()}
                        </kbd>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(shortcut.id);
                            setEditingKey(shortcut.key);
                          }}
                          className="h-8 text-xs"
                        >
                          Change
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bills Shortcuts */}
          {billsShortcuts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base">Bills Management</h3>
                <label className="flex items-center space-x-2 text-sm">
                  <span>
                    {areSectionShortcutsEnabled("bills") ? "✓ Enabled" : "✗ Disabled"}
                  </span>
                  <input
                    type="checkbox"
                    checked={areSectionShortcutsEnabled("bills")}
                    onChange={(e) => toggleSectionShortcuts("bills", e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                </label>
              </div>
              <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
                {billsShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded"
                  >
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        {shortcut.description}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {shortcut.action}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingId === shortcut.id ? (
                        <>
                          <Input
                            autoFocus
                            value={editingKey}
                            onChange={(e) =>
                              setEditingKey(e.target.value.toLowerCase())
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleKeyChange(shortcut.id);
                              } else if (e.key === "Escape") {
                                setEditingId(null);
                                setEditingKey("");
                              }
                            }}
                            className="w-16 h-8 text-center text-xs"
                            maxLength={1}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleKeyChange(shortcut.id)}
                            className="h-8"
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <kbd className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-semibold">
                            {shortcut.key.toUpperCase()}
                          </kbd>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(shortcut.id);
                              setEditingKey(shortcut.key);
                            }}
                            className="h-8 text-xs"
                          >
                            Change
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions Shortcuts */}
          {transactionsShortcuts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base">Transactions</h3>
                <label className="flex items-center space-x-2 text-sm">
                  <span>
                    {areSectionShortcutsEnabled("transactions") ? "✓ Enabled" : "✗ Disabled"}
                  </span>
                  <input
                    type="checkbox"
                    checked={areSectionShortcutsEnabled("transactions")}
                    onChange={(e) => toggleSectionShortcuts("transactions", e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                </label>
              </div>
              <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
                {transactionsShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded"
                  >
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        {shortcut.description}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {shortcut.action}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingId === shortcut.id ? (
                        <>
                          <Input
                            autoFocus
                            value={editingKey}
                            onChange={(e) =>
                              setEditingKey(e.target.value.toLowerCase())
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleKeyChange(shortcut.id);
                              } else if (e.key === "Escape") {
                                setEditingId(null);
                                setEditingKey("");
                              }
                            }}
                            className="w-16 h-8 text-center text-xs"
                            maxLength={1}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleKeyChange(shortcut.id)}
                            className="h-8"
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <kbd className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-semibold">
                            {shortcut.key.toUpperCase()}
                          </kbd>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(shortcut.id);
                              setEditingKey(shortcut.key);
                            }}
                            className="h-8 text-xs"
                          >
                            Change
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                resetShortcuts();
                setEditingId(null);
                setEditingKey("");
              }}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
