"use client";

/**
 * SOP-3F-06: 层级树面板 — 树形视图 + @dnd-kit 拖拽排序 + 重命名/删除/复制
 *
 * 递归渲染元素树。同级可拖拽排序（reorderElement）。点击选中。
 * 消费 useEditorContext。
 */

import { useState } from "react";
import {
  DndContext, PointerSensor, KeyboardSensor, closestCenter,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, ChevronDown, Trash2, Copy, Pencil } from "lucide-react";
import { useEditorContext } from "../context/EditorContext";
import { type GUIElement } from "@/lib/types";

function ElementIcon({ type }: { type: GUIElement["type"] }) {
  return <span className="size-3 shrink-0 rounded-sm border border-glass-border" aria-hidden />;
}

function TreeNode({ element, depth }: { element: GUIElement; depth: number }) {
  const { state, actions } = useEditorContext();
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(element.name);
  const selected = state.selectedId === element.id;
  const children = element.children.map((id) => state.elements[id]).filter(Boolean);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });

  const commitRename = () => {
    setEditing(false);
    if (name && name !== element.name) actions.updateElement(element.id, { name });
  };

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? "opacity-50" : ""}>
      <div
        className={`group flex items-center gap-1 rounded-md py-1 pr-1 text-sm ${selected ? "bg-brand-500/20 text-text" : "text-text-muted hover:bg-surface-raised"}`}
        style={{ paddingLeft: depth * 12 + 4 }}
        onClick={() => actions.selectElement(element.id)}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="text-text-muted"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {children.length > 0 ? (
            expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />
          ) : (
            <span className="inline-block size-3.5" />
          )}
        </button>
        {/* 拖拽手柄（与展开分离，避免点击展开触发拖拽） */}
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab px-0.5 text-text-muted/50 active:cursor-grabbing"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          ⋮⋮
        </span>
        <ElementIcon type={element.type} />
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setEditing(false); setName(element.name); } }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-cyan-accent bg-surface px-1 text-text"
            autoFocus
          />
        ) : (
          <span className="flex-1 truncate">{element.name}</span>
        )}
        <span className="text-xs text-text-muted/60">{element.type}</span>
        <div className="flex items-center opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="rounded p-0.5 text-text-muted hover:text-text"
            aria-label="Rename"
          >
            <Pencil className="size-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); actions.duplicateElement(element.id); }}
            className="rounded p-0.5 text-text-muted hover:text-text"
            aria-label="Duplicate"
          >
            <Copy className="size-3" />
          </button>
          {element.type !== "ScreenGui" && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); actions.removeElement(element.id); }}
              className="rounded p-0.5 text-text-muted hover:text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
      </div>
      {expanded && children.length > 0 && (
        <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {children.map((c) => (
            <TreeNode key={c.id} element={c} depth={depth + 1} />
          ))}
        </SortableContext>
      )}
    </div>
  );
}

export function HierarchyTab() {
  const { state, actions } = useEditorContext();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeEl = state.elements[activeId];
    const overEl = state.elements[overId];
    if (!activeEl?.parentId || !overEl?.parentId) return;
    if (activeEl.parentId !== overEl.parentId) return; // 仅同级排序
    const parent = state.elements[activeEl.parentId];
    if (!parent) return;
    const oldIndex = parent.children.indexOf(activeId);
    const newIndex = parent.children.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;
    actions.reorderElement(activeId, newIndex);
  };

  const root = state.rootId ? state.elements[state.rootId] : null;
  if (!root) return <p className="p-3 text-xs text-text-muted">No elements</p>;

  return (
    <div className="p-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <TreeNode element={root} depth={0} />
      </DndContext>
    </div>
  );
}
