"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface EditModeValue {
  isAdmin: boolean;
  editMode: boolean;
  setEditMode: (on: boolean) => void;
}

const EditModeContext = createContext<EditModeValue>({
  isAdmin: false,
  editMode: false,
  setEditMode: () => {},
});

const STORAGE_KEY = "healteen-edit-mode";

/**
 * Holds the admin "edit mode" toggle. For non-admins it is permanently off and
 * nothing editable ever renders. Persists across navigation via localStorage and
 * can be auto-enabled with `?edit=1` (the link used from the admin dashboard).
 */
export function EditModeProvider({ isAdmin, children }: { isAdmin: boolean; children: ReactNode }) {
  const [editMode, setEditModeState] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "1") {
      setEditModeState(true);
      localStorage.setItem(STORAGE_KEY, "1");
      return;
    }
    setEditModeState(localStorage.getItem(STORAGE_KEY) === "1");
  }, [isAdmin]);

  const setEditMode = (on: boolean) => {
    setEditModeState(on);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    }
  };

  return (
    <EditModeContext.Provider value={{ isAdmin, editMode: isAdmin && editMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
