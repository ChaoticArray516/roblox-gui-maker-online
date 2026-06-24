"use client";

/**
 * SOP-3F-02/03: 编辑器状态管理 + 撤销/重做（快照式）
 *
 * 元素树（Record<id,GUIElement> + rootId + children）、selectedId、history、clipboard、zoom、device、preview。
 * actions: add/remove/update/move/reorder/select/copy/paste/duplicate + undo/redo。
 * 撤销重做用元素树快照栈（snapshots），比命令式回滚更可靠。Ctrl+Z/Y 在 useKeyboardShortcuts（3F-13）绑定。
 * Luau 生成委托 lib/luau-generator.ts（3F-08 完整实现，本 Wave 占位）。
 */

import { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  type DeviceType,
  type GUIElement,
  type GUIElementType,
  type EditorState,
  getDefaultProperties,
} from "@/lib/types";
import { generateClientLuau } from "@/lib/luau-generator";

interface ClipboardData {
  element: GUIElement;
  children: GUIElement[];
}

function createDefaultName(type: GUIElementType): string {
  return type;
}

function createInitialState(): EditorState {
  const rootId = uuidv4();
  const rootElement: GUIElement = {
    id: rootId,
    type: "ScreenGui",
    name: "ScreenGui",
    parentId: null,
    children: [],
    properties: getDefaultProperties("ScreenGui"),
    zIndex: 0,
  };
  const initialElements = { [rootId]: rootElement };
  return {
    elements: initialElements,
    rootId,
    selectedId: null,
    deviceType: "desktop",
    zoom: 1,
    previewMode: false,
    history: [],
    snapshots: [initialElements],
    historyIndex: 0,
  };
}

export function useEditorState() {
  const [state, setState] = useState<EditorState>(createInitialState);
  const clipboardRef = useRef<ClipboardData | null>(null);

  const addElement = useCallback(
    (type: GUIElementType, parentId: string | null, overrides?: Partial<GUIElement>) => {
      const id = uuidv4();
      setState((prev) => {
        const effectiveParentId = parentId ?? prev.rootId;
        const newElement: GUIElement = {
          id,
          type,
          name: overrides?.name ?? createDefaultName(type),
          parentId: effectiveParentId,
          children: [],
          properties: { ...getDefaultProperties(type), ...overrides?.properties },
          zIndex: overrides?.zIndex ?? 1,
        };
        const nextElements = { ...prev.elements, [id]: newElement };
        if (effectiveParentId && nextElements[effectiveParentId]) {
          const parent = nextElements[effectiveParentId];
          nextElements[effectiveParentId] = { ...parent, children: [...parent.children, id] };
        }
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push({ type: "add", elementId: id, timestamp: Date.now() });
        const newSnapshots = prev.snapshots.slice(0, prev.historyIndex + 1);
        newSnapshots.push(nextElements);
        return {
          ...prev,
          elements: nextElements,
          selectedId: id,
          history: newHistory,
          snapshots: newSnapshots,
          historyIndex: newSnapshots.length - 1,
        };
      });
    },
    [],
  );

  const removeElement = useCallback((id: string) => {
    setState((prev) => {
      const collect = (eid: string): string[] => {
        const e = prev.elements[eid];
        if (!e) return [];
        return [eid, ...e.children.flatMap(collect)];
      };
      const allIds = collect(id);
      const nextElements = { ...prev.elements };
      const el = nextElements[id];
      if (el?.parentId && nextElements[el.parentId]) {
        const p = nextElements[el.parentId];
        nextElements[el.parentId] = { ...p, children: p.children.filter((c) => c !== id) };
      }
      for (const rid of allIds) delete nextElements[rid];
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ type: "remove", elementId: id, timestamp: Date.now() });
      const newSnapshots = prev.snapshots.slice(0, prev.historyIndex + 1);
      newSnapshots.push(nextElements);
      return {
        ...prev,
        elements: nextElements,
        selectedId: prev.selectedId === id ? null : prev.selectedId,
        history: newHistory,
        snapshots: newSnapshots,
        historyIndex: newSnapshots.length - 1,
      };
    });
  }, []);

  const updateElement = useCallback((id: string, partial: Partial<GUIElement>) => {
    setState((prev) => {
      const existing = prev.elements[id];
      if (!existing) return prev;
      const nextElements = {
        ...prev.elements,
        [id]: {
          ...existing,
          ...partial,
          properties: { ...existing.properties, ...partial.properties },
        },
      };
      // update 不入历史栈（高频属性修改不每键入都记录快照，避免 undo 栈爆炸）。
      // 最新快照同步更新为当前 elements，使后续 add/remove 的 prev 快照反映最新属性。
      const newSnapshots = prev.snapshots.slice();
      newSnapshots[prev.historyIndex] = nextElements;
      return { ...prev, elements: nextElements, snapshots: newSnapshots };
    });
  }, []);

  const moveElement = useCallback((id: string, newParentId: string | null, index?: number) => {
    setState((prev) => {
      const el = prev.elements[id];
      if (!el) return prev;
      const effectiveNew = newParentId ?? prev.rootId;
      if (el.parentId === effectiveNew) return prev;
      const nextElements = { ...prev.elements };
      if (el.parentId && nextElements[el.parentId]) {
        const p = nextElements[el.parentId];
        nextElements[el.parentId] = { ...p, children: p.children.filter((c) => c !== id) };
      }
      if (effectiveNew && nextElements[effectiveNew]) {
        const np = nextElements[effectiveNew];
        const newChildren = [...np.children];
        if (index !== undefined) newChildren.splice(index, 0, id);
        else newChildren.push(id);
        nextElements[effectiveNew] = { ...np, children: newChildren };
      }
      nextElements[id] = { ...el, parentId: effectiveNew };
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ type: "move", elementId: id, timestamp: Date.now() });
      const newSnapshots = prev.snapshots.slice(0, prev.historyIndex + 1);
      newSnapshots.push(nextElements);
      return {
        ...prev,
        elements: nextElements,
        history: newHistory,
        snapshots: newSnapshots,
        historyIndex: newSnapshots.length - 1,
      };
    });
  }, []);

  const reorderElement = useCallback((id: string, newIndex: number) => {
    setState((prev) => {
      const el = prev.elements[id];
      if (!el?.parentId) return prev;
      const parent = prev.elements[el.parentId];
      if (!parent) return prev;
      const oldIndex = parent.children.indexOf(id);
      if (oldIndex === -1 || oldIndex === newIndex) return prev;
      const newChildren = [...parent.children];
      newChildren.splice(oldIndex, 1);
      newChildren.splice(newIndex, 0, id);
      const nextElements = { ...prev.elements, [el.parentId]: { ...parent, children: newChildren } };
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ type: "reorder", elementId: id, timestamp: Date.now() });
      const newSnapshots = prev.snapshots.slice(0, prev.historyIndex + 1);
      newSnapshots.push(nextElements);
      return {
        ...prev,
        elements: nextElements,
        history: newHistory,
        snapshots: newSnapshots,
        historyIndex: newSnapshots.length - 1,
      };
    });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedId: id }));
  }, []);

  const setDeviceType = useCallback((deviceType: DeviceType) => {
    setState((prev) => ({ ...prev, deviceType }));
  }, []);

  const togglePreview = useCallback(() => {
    setState((prev) => ({ ...prev, previewMode: !prev.previewMode }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom: Math.max(0.1, Math.min(3, zoom)) }));
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex <= 0) return prev;
      const newIndex = prev.historyIndex - 1;
      return { ...prev, elements: prev.snapshots[newIndex], historyIndex: newIndex, selectedId: null };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex >= prev.snapshots.length - 1) return prev;
      const newIndex = prev.historyIndex + 1;
      return { ...prev, elements: prev.snapshots[newIndex], historyIndex: newIndex };
    });
  }, []);

  const exportJSON = useCallback((): string => {
    const data = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      gui: {
        name: state.rootId ? state.elements[state.rootId]?.name ?? "ScreenGui" : "ScreenGui",
        elements: Object.values(state.elements),
      },
    };
    return JSON.stringify(data, null, 2);
  }, [state.elements, state.rootId]);

  const exportLuau = useCallback((): string => {
    if (!state.rootId) return "-- No root element";
    const root = state.elements[state.rootId];
    if (!root) return "-- No root element";
    return generateClientLuau(state.elements, state.rootId);
  }, [state.elements, state.rootId]);

  const importJSON = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.gui?.elements && Array.isArray(data.gui.elements)) {
        const imported: Record<string, GUIElement> = {};
        let importedRootId: string | null = null;
        for (const el of data.gui.elements) {
          imported[el.id] = el;
          if (el.type === "ScreenGui" && el.parentId === null) importedRootId = el.id;
        }
        setState((prev) => ({
          ...prev,
          elements: imported,
          rootId: importedRootId,
          selectedId: null,
          history: [],
          snapshots: [imported],
          historyIndex: 0,
        }));
      }
    } catch (e) {
      console.error("Failed to import JSON:", e);
    }
  }, []);

  const copyElement = useCallback(
    (id: string) => {
      const el = state.elements[id];
      if (!el) return;
      const collect = (eid: string): GUIElement[] => {
        const e = state.elements[eid];
        if (!e) return [];
        return [{ ...e, parentId: null }, ...e.children.flatMap(collect)];
      };
      const all = collect(id);
      clipboardRef.current = { element: { ...el, parentId: null }, children: all.slice(1) };
    },
    [state.elements],
  );

  const pasteElement = useCallback(
    (parentId: string | null) => {
      const cb = clipboardRef.current;
      if (!cb) return;
      const effectiveParentId = parentId ?? state.rootId;
      if (!effectiveParentId) return;
      const idMap: Record<string, string> = {};
      idMap[cb.element.id] = uuidv4();
      const newElements: GUIElement[] = [];
      const copyEl = (el: GUIElement, pId: string | null): GUIElement => {
        const newId = idMap[el.id] ?? uuidv4();
        idMap[el.id] = newId;
        const copied: GUIElement = {
          ...el,
          id: newId,
          parentId: pId,
          name: `${el.name}_Copy`,
          children: el.children.map((c) => idMap[c] ?? uuidv4()),
        };
        newElements.push(copied);
        return copied;
      };
      copyEl(cb.element, effectiveParentId);
      for (const child of cb.children) {
        const np = idMap[child.parentId ?? ""] ?? effectiveParentId;
        copyEl(child, np);
      }
      setState((prev) => {
        const nextElements = { ...prev.elements };
        for (const el of newElements) nextElements[el.id] = el;
        if (nextElements[effectiveParentId]) {
          nextElements[effectiveParentId] = {
            ...nextElements[effectiveParentId],
            children: [...nextElements[effectiveParentId].children, idMap[cb.element.id]],
          };
        }
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push({ type: "add", elementId: idMap[cb.element.id], timestamp: Date.now() });
        const newSnapshots = prev.snapshots.slice(0, prev.historyIndex + 1);
        newSnapshots.push(nextElements);
        return {
          ...prev,
          elements: nextElements,
          selectedId: idMap[cb.element.id],
          history: newHistory,
          snapshots: newSnapshots,
          historyIndex: newSnapshots.length - 1,
        };
      });
    },
    [state.rootId],
  );

  const duplicateElement = useCallback(
    (id: string) => {
      copyElement(id);
      const el = state.elements[id];
      if (el) pasteElement(el.parentId);
    },
    [state.elements, copyElement, pasteElement],
  );

  return {
    state,
    actions: {
      addElement,
      removeElement,
      updateElement,
      moveElement,
      reorderElement,
      selectElement,
      setDeviceType,
      togglePreview,
      setZoom,
      undo,
      redo,
      exportJSON,
      exportLuau,
      importJSON,
      copyElement,
      pasteElement,
      duplicateElement,
      canUndo: state.historyIndex > 0,
      canRedo: state.historyIndex < state.snapshots.length - 1,
    },
  };
}
