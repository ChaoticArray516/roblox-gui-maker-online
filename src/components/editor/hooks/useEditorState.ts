"use client";

/**
 * SOP-3F-02/03: 编辑器状态管理 + 撤销/重做（快照式）
 *
 * 元素树（Record<id,GUIElement> + rootId + children）、selectedId、history、clipboard、zoom、device、preview。
 * actions: add/remove/update/move/reorder/select/copy/paste/duplicate + undo/redo。
 * 撤销重做用元素树快照栈（snapshots），比命令式回滚更可靠。Ctrl+Z/Y 在 useKeyboardShortcuts（3F-13）绑定。
 * Luau 生成委托 lib/luau-generator.ts（3F-08 完整实现，本 Wave 占位）。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  type DeviceType,
  type GUIElement,
  type GUIElementType,
  type EditorState,
  getDefaultProperties,
} from "@/lib/types";
import { generateClientLuau } from "@/lib/luau-generator";
import { getTemplateEditorTree } from "@/lib/template-editor-trees";
import { TEMPLATES } from "@/lib/templates";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

interface ClipboardData {
  element: GUIElement;
  children: GUIElement[];
}

// SOP-3U-07: 画布草稿暂存（sessionStorage；OAuth round-trip / 离站场景兜底）
const DRAFT_KEY = "editor_draft_v1";

function createDefaultName(type: GUIElementType): string {
  return type;
}

function createInitialState(templateSlug?: string | null): EditorState {
  if (templateSlug) {
    const tree = getTemplateEditorTree(templateSlug);
    if (tree.rootId) {
      return {
        elements: tree.elements,
        rootId: tree.rootId,
        selectedId: null,
        deviceType: "desktop",
        zoom: 1,
        previewMode: false,
        history: [],
        snapshots: [tree.elements],
        historyIndex: 0,
      };
    }
  }

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
  const searchParams = useSearchParams();
  const templateSlug = searchParams.get("template");
  // SAVE-02: ?project= 与 ?template= 互斥（project 优先）——有 project 时初始空画布，
  // 由下方 mount effect 异步恢复；ONB-02: 无 template 且无 project 时默认预载 main-menu。
  const projectParam = searchParams.get("project");
  const [state, setState] = useState<EditorState>(() =>
    createInitialState(templateSlug ?? (projectParam ? null : "main-menu")),
  );
  const clipboardRef = useRef<ClipboardData | null>(null);

  // SAVE-01: 云端保存状态（随 context 下发，Toolbar Save 与 ?project= loader 共用）
  const [projectId, setProjectId] = useState<string | null>(null);
  // 3V-06: ?template= 载入时项目名 = 模板名（防 projects 表堆满 Untitled）；
  // 裸 editor / ?project= 保持 Untitled——loader 与草稿恢复的既有写入点优先级更高
  const [projectName, setProjectName] = useState<string>(
    (templateSlug && TEMPLATES[templateSlug]?.name) ?? "Untitled GUI",
  );
  // SAVE-02: ?project= 加载降级提示（越权/不存在/解析失败时给用户可见反馈）
  const [notice, setNotice] = useState<string | null>(null);
  const projectLoadedRef = useRef(false);
  // SOP-3X-07: ?project= 加载期标志——Canvas 空态提示在加载完成前不渲染（治空画布闪烁）
  const [projectLoading, setProjectLoading] = useState(!!projectParam);

  // SOP-3U-07: 草稿层状态（draftInfo 非空 → EditorShell 顶部提示条等用户确认）
  const [draftInfo, setDraftInfo] = useState<{ savedAt: string } | null>(null);
  const draftPayloadRef = useRef<string | null>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // pristine 引用守卫：初始 elements 引用不变 = 无编辑，不写垃圾草稿（StrictMode 双跑安全）
  const pristineElementsRef = useRef<Record<string, GUIElement> | null>(null);
  const suppressNextDraftRef = useRef(false);
  const dirtyRef = useRef(false);

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

  // SAVE-02: ?project=<id> 恢复——RLS 自动限定本人；越权/不存在/解析失败 → 空画布 + 降级提示
  useEffect(() => {
    if (!projectParam || projectLoadedRef.current) return;
    projectLoadedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("projects")
          .select("id, name, gui_json")
          .eq("id", projectParam)
          .single();
        if (cancelled) return;

        const gui = (data as { gui_json?: unknown } | null)?.gui_json as
          | { gui?: { elements?: unknown } }
          | undefined;
        const elements = gui?.gui?.elements;
        const valid =
          !error &&
          Array.isArray(elements) &&
          elements.some(
            (el) =>
              (el as { type?: string; parentId?: string | null }).type ===
                "ScreenGui" &&
              (el as { parentId?: string | null }).parentId === null,
          );

        if (!data || !valid) {
          if (error) console.error("Failed to load project:", error);
          setNotice(
            "Could not open that project (it may not exist or belong to another account). Starting from a blank canvas.",
          );
          return;
        }

        importJSON(JSON.stringify(gui));
        setProjectId(data.id);
        setProjectName(
          (data as { name?: string }).name?.trim() || "Untitled GUI",
        );
      } finally {
        // SOP-3X-07: 加载结束（成功/失败/降级）统一放行空态渲染
        if (!cancelled) setProjectLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectParam]);

  // ── SOP-3U-07: 草稿层（纯新增，不改既有 ?project=/?template= 互斥逻辑）──

  // 写入体 = exportJSON 形状 + meta（与 SAVE-02 loader 同一恢复模式）；全程 try-catch
  const writeDraft = useCallback(() => {
    try {
      const payload = {
        ...JSON.parse(exportJSON()),
        meta: {
          template: templateSlug,
          projectId,
          projectName,
          savedAt: new Date().toISOString(),
        },
      };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch {
      // 存储不可用/超限等静默失败
    }
  }, [exportJSON, templateSlug, projectId, projectName]);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    draftPayloadRef.current = null;
    setDraftInfo(null);
  }, []);

  // 触发：elements 引用变更（覆盖 add/remove/update/move/reorder/paste/undo/redo/importJSON
  // 全部路径，含改名 updateElement），800ms debounce 防拖拽高频写
  useEffect(() => {
    if (pristineElementsRef.current === null) {
      pristineElementsRef.current = state.elements;
      return;
    }
    if (state.elements === pristineElementsRef.current) return; // undo 到底回 pristine，不写
    if (suppressNextDraftRef.current) {
      suppressNextDraftRef.current = false;
      return;
    }
    dirtyRef.current = true;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(writeDraft, 800);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [state.elements, writeDraft]);

  // 离站兜底：beforeunload 同步写（3U-02 整页跳转必触发），覆盖 debounce 窗口
  useEffect(() => {
    const flush = () => {
      if (dirtyRef.current) writeDraft();
    };
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [writeDraft]);

  // 恢复判定：?project=（云端权威）在场时不提示；?template= 仅决定基底内容，
  // 模板之上的未保存编辑仍需提示条兜底（ANON-TEST 主路径：模板 → 编辑 → 登录 → 回来恢复）。
  // 全在 useEffect（EditorShell 整体 ssr:false，无 hydration 问题）
  useEffect(() => {
    if (projectParam) return; // 云端项目优先，不提示
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const elements = (data as { gui?: { elements?: unknown } })?.gui?.elements;
      const valid =
        Array.isArray(elements) &&
        elements.some(
          (el) =>
            (el as { type?: string; parentId?: string | null }).type === "ScreenGui" &&
            (el as { parentId?: string | null }).parentId === null,
        );
      if (!valid) return;
      draftPayloadRef.current = raw;
      const savedAt = (data as { meta?: { savedAt?: unknown } })?.meta?.savedAt;
      const info = { savedAt: typeof savedAt === "string" ? savedAt : "" };

      // SOP-3X-08: pending_save 全量自动落库链（用户裁决③）——
      // 已登录 + 标记在场 + 草稿有效 → 跳过确认条直接落库（先落库成功才恢复画布清草稿）
      let pending = false;
      try {
        pending = sessionStorage.getItem("pending_save_v1") === "1";
      } catch {
        // 存储不可用按无标记处理
      }
      if (pending) {
        (async () => {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            // 未登录回归（登录失败/同 tab 中途返回）→ 标记保留，走普通确认条
            setDraftInfo(info);
            return;
          }
          try {
            const parsed = JSON.parse(raw) as {
              meta?: { projectId?: unknown; projectName?: unknown };
            };
            const meta = parsed.meta;
            const guiJson = { ...parsed } as Record<string, unknown>;
            delete guiJson.meta;
            const existingId =
              typeof meta?.projectId === "string" && meta.projectId
                ? meta.projectId
                : null;
            let savedId = existingId;
            const savedName =
              typeof meta?.projectName === "string" && meta.projectName.trim()
                ? meta.projectName
                : "Untitled GUI";
            if (existingId) {
              const { error } = await supabase
                .from("projects")
                .update({ gui_json: guiJson })
                .eq("id", existingId);
              if (error) throw error;
            } else {
              const { data: row, error } = await supabase
                .from("projects")
                .insert({ user_id: user.id, name: savedName, gui_json: guiJson })
                .select("id")
                .single();
              if (error) throw error;
              if (row) savedId = row.id as string;
            }
            // 落库成功才恢复画布 + 清草稿清标记（失败则草稿不丢，降级确认条）
            // （内联 restoreDraft 逻辑——restoreDraft 声明在后方，前向引用过不了
            //   React Compiler 的 TDZ 检查；meta 回填由下方 setProjectId/setProjectName 完成）
            suppressNextDraftRef.current = true; // importJSON 触发的变更不立刻重写草稿
            importJSON(raw);
            clearDraft(); // 清除时机：落库成功（同 Toolbar :139 语义）
            if (savedId) setProjectId(savedId);
            if (savedName) setProjectName(savedName);
            try {
              sessionStorage.removeItem("pending_save_v1");
            } catch {
              // ignore
            }
            setNotice("Saved to cloud — find it in My Projects");
            trackEvent("project_saved", { source: "pending_return" });
          } catch (e) {
            console.error("pending_save auto-save failed:", e);
            try {
              sessionStorage.removeItem("pending_save_v1");
            } catch {
              // ignore
            }
            setDraftInfo(info); // 降级回确认条路径（草稿未动，可手动 Restore + Save 重试）
          }
        })();
        return;
      }
      setDraftInfo(info);
    } catch {
      // 解析失败等静默
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restoreDraft = useCallback(() => {
    const raw = draftPayloadRef.current;
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      // importJSON 触发的 elements 变更不应立刻把刚恢复的内容重写为草稿
      suppressNextDraftRef.current = true;
      importJSON(raw);
      const meta = (data as { meta?: { projectId?: unknown; projectName?: unknown } })?.meta;
      if (typeof meta?.projectId === "string" && meta.projectId) {
        setProjectId(meta.projectId);
      }
      if (typeof meta?.projectName === "string" && meta.projectName.trim()) {
        setProjectName(meta.projectName);
      }
    } catch (e) {
      console.error("Failed to restore draft:", e);
    }
    clearDraft(); // 清除时机①：恢复成功
  }, [importJSON, clearDraft]);

  const discardDraft = clearDraft; // 清除时机③：Discard（清除时机②在 Toolbar 落库成功分支）

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
    projectId,
    projectName,
    projectLoading,
    notice,
    draftInfo,
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
      setProjectId,
      setProjectName,
      setNotice,
      restoreDraft,
      discardDraft,
      clearDraft,
      canUndo: state.historyIndex > 0,
      canRedo: state.historyIndex < state.snapshots.length - 1,
    },
  };
}
