import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";
import type { DragEndEvent } from "@dnd-kit/core";

interface BBDragAndDropItemProps<T> {
  item: T;
  render: (
    item: T,
    dragHandleProps: ReturnType<typeof useSortable>["listeners"],
    ref: ReturnType<typeof useSortable>["setNodeRef"],
  ) => ReactNode;
}

function BBDragAndDropItem<T extends { id: string }>({ item, render }: BBDragAndDropItemProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {render(item, listeners, setNodeRef)}
    </div>
  );
}

interface BBDragAndDropListProps<T> {
  items: T[];
  onOrderChange: (newItems: T[]) => void;
  renderItem: (
    item: T,
    dragHandleProps: ReturnType<typeof useSortable>["listeners"],
    ref: ReturnType<typeof useSortable>["setNodeRef"],
  ) => ReactNode;
  getItemId: (item: T) => string;
}

export function BBDragAndDropList<T extends { id: string }>({
  items,
  onOrderChange,
  renderItem,
  getItemId,
}: BBDragAndDropListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
    const newIndex = items.findIndex((item) => getItemId(item) === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    onOrderChange(newItems);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(getItemId)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <BBDragAndDropItem key={getItemId(item)} item={item} render={renderItem} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
