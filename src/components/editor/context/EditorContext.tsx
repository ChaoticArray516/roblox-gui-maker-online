"use client";

/**
 * SOP-3F-02: 编辑器状态管理 — Context
 *
 * 提供 EditorState + actions 给所有 /editor/* 内组件消费。
 * 替换 EditorShell 原局部 useState。useEditorState 在 hooks/useEditorState.ts。
 */

import { createContext, useContext, type ReactNode } from "react";
import { useEditorState } from "../hooks/useEditorState";
import type { EditorState, GUIElement, GUIElementType, DeviceType } from "@/lib/types";

export interface EditorActions {
  addElement: (type: GUIElementType, parentId: string | null, overrides?: Partial<GUIElement>) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, partial: Partial<GUIElement>) => void;
  moveElement: (id: string, newParentId: string | null, index?: number) => void;
  reorderElement: (id: string, newIndex: number) => void;
  selectElement: (id: string | null) => void;
  setDeviceType: (type: DeviceType) => void;
  togglePreview: () => void;
  setZoom: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
  exportJSON: () => string;
  exportLuau: () => string;
  importJSON: (json: string) => void;
  copyElement: (id: string) => void;
  pasteElement: (parentId: string | null) => void;
  duplicateElement: (id: string) => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface EditorContextValue {
  state: EditorState;
  actions: EditorActions;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const editor = useEditorState();
  return (
    <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
  );
}

export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return ctx;
}
