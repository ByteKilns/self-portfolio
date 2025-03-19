<script lang="ts">
  import { X } from 'lucide-svelte';
  import { onMount, createEventDispatcher } from 'svelte';
  
  // Types
  type ResizeDirection = 'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw' | '';
  
  interface DragEvent {
    x: number;
    y: number;
  }
  
  interface ResizeEvent {
    width: number;
    height: number;
    x: number;
    y: number;
    direction?: ResizeDirection;
  }

  // Props with default values and types
  export let width: number = 200;
  export let height: number = 200;
  export let x: number = 0;
  export let y: number = 0;
  export let minWidth: number = 50;
  export let minHeight: number = 50;
  export let maxWidth: number = Infinity;
  export let maxHeight: number = Infinity;
  export let isDraggable: boolean = true;
  export let isResizable: boolean = true;
  export let containerId: string | null = null;
  export let bgColor: string = "bg-white";
  export let borderColor: string = "border-gray-300";
  export let zIndex: number = 1;
  export let onClose: () => void = () => {};
  
  // Event dispatcher with typed events
  const dispatch = createEventDispatcher<{
    dragstart: DragEvent;
    drag: DragEvent;
    dragend: DragEvent;
    resizestart: ResizeEvent;
    resize: ResizeEvent;
    resizeend: ResizeEvent;
    mousedown: void;
    touchstart: void;
    close: void;
  }>();

  // Internal state
  let element: HTMLElement;
  let container: HTMLElement | null = null;
  let isDragging: boolean = false;
  let isResizing: boolean = false;
  let initialX: number;
  let initialY: number;
  let initialWidth: number;
  let initialHeight: number;
  let offsetX: number = 0;
  let offsetY: number = 0;
  let resizeDirection: ResizeDirection = '';

  // Computed cursor classes
  $: cursorClass = isDragging 
    ? "cursor-grabbing" 
    : isDraggable 
      ? "cursor-grab" 
      : "cursor-default";

  onMount(() => {
    if (containerId) {
      container = document.getElementById(containerId);
    }
  });

  function handleMouseDown(event: MouseEvent): void {
    dispatch('mousedown');
    
    if (!isDraggable || isResizing) return;
    
    event.preventDefault();
    isDragging = true;
    initialX = event.clientX;
    initialY = event.clientY;
    offsetX = x;
    offsetY = y;
    
    dispatch('dragstart', { x, y });
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleTouchStart(event: TouchEvent): void {
    dispatch('touchstart');
    
    if (!isDraggable || isResizing) return;
    
    event.preventDefault();
    isDragging = true;
    initialX = event.touches[0].clientX;
    initialY = event.touches[0].clientY;
    offsetX = x;
    offsetY = y;
    
    dispatch('dragstart', { x, y });
    
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  }

  function handleMouseMove(event: MouseEvent): void {
    handleMove(event.clientX, event.clientY);
  }

  function handleTouchMove(event: TouchEvent): void {
    handleMove(event.touches[0].clientX, event.touches[0].clientY);
  }

  function handleMove(clientX: number, clientY: number): void {
    if (isDragging) {
      const dx = clientX - initialX;
      const dy = clientY - initialY;
      
      let newX = offsetX + dx;
      let newY = offsetY + dy;
      
      // Constrain to container if specified
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        newX = Math.max(0, Math.min(newX, containerRect.width - elementRect.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - elementRect.height));
      }
      
      x = newX;
      y = newY;
      
      dispatch('drag', { x, y });
    } else if (isResizing) {
      const dx = clientX - initialX;
      const dy = clientY - initialY;
      
      if (resizeDirection.includes('e')) {
        width = Math.max(minWidth, Math.min(maxWidth, initialWidth + dx));
      }
      if (resizeDirection.includes('s')) {
        height = Math.max(minHeight, Math.min(maxHeight, initialHeight + dy));
      }
      if (resizeDirection.includes('w')) {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, initialWidth - dx));
        if (newWidth !== width) {
          x = offsetX + (initialWidth - newWidth);
          width = newWidth;
        }
      }
      if (resizeDirection.includes('n')) {
        const newHeight = Math.max(minHeight, Math.min(maxHeight, initialHeight - dy));
        if (newHeight !== height) {
          y = offsetY + (initialHeight - newHeight);
          height = newHeight;
        }
      }
      
      dispatch('resize', { width, height, x, y });
    }
  }

  function handleMouseUp(): void {
    handleEnd();
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  function handleTouchEnd(): void {
    handleEnd();
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }

  function handleEnd(): void {
    if (isDragging) {
      isDragging = false;
      dispatch('dragend', { x, y });
    }
    if (isResizing) {
      isResizing = false;
      dispatch('resizeend', { width, height, x, y });
    }
  }

  function handleCloseClick(event: any) {
    event.stopPropagation();
    dispatch('close');
    onClose();
  }

  // Resize start handlers
  function handleResizeStart(event: MouseEvent, direction: ResizeDirection): void {
    handleResizeStartCommon(event, direction);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleResizeTouchStart(event: TouchEvent, direction: ResizeDirection): void {
    handleResizeStartCommon(event, direction);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  }

  function handleResizeStartCommon(event: Event, direction: ResizeDirection): void {
    if (!isResizable || isDragging) return;
    
    event.preventDefault();
    event.stopPropagation();
    isResizing = true;
    resizeDirection = direction;
    
    const touchEvent = event as TouchEvent;
    const mouseEvent = event as MouseEvent;
    
    initialX = touchEvent.touches 
      ? touchEvent.touches[0].clientX 
      : mouseEvent.clientX;
    initialY = touchEvent.touches 
      ? touchEvent.touches[0].clientY 
      : mouseEvent.clientY;
    
    initialWidth = width;
    initialHeight = height;
    offsetX = x;
    offsetY = y;
    
    dispatch('resizestart', { width, height, x, y, direction });
  }

  // Map resize direction to cursor classes
  function getResizeCursorClass(direction: ResizeDirection): string {
    const cursorMap: Record<ResizeDirection, string> = {
      'n': 'cursor-n-resize',
      'e': 'cursor-e-resize',
      's': 'cursor-s-resize',
      'w': 'cursor-w-resize',
      'ne': 'cursor-ne-resize',
      'se': 'cursor-se-resize',
      'sw': 'cursor-sw-resize',
      'nw': 'cursor-nw-resize',
      '': ''
    };
    return cursorMap[direction] || '';
  }
</script>

<div
  bind:this={element}
  class="absolute top-0 left-0 select-none box-border {bgColor} {borderColor} border"
  style="width: {width}px; height: {height}px; transform: translate({x}px, {y}px); z-index: {zIndex};"
>
  <!-- Top bar for dragging -->
  <div
  class="w-full h-8 flex items-center px-4 justify-between {bgColor} border-b {borderColor} {cursorClass}"
  on:mousedown={handleMouseDown}
  on:touchstart={handleTouchStart}
  aria-label="Resizable and draggable window"
>
  <h3 class="text-lg font-medium text-blue-700">Chat With Me</h3>
  <button on:click={handleCloseClick}>
    <X class="h-6 text-red-700 cursor-pointer" />
  </button>
</div>
  <!-- Content area -->
  <div 
    class="w-full h-[calc(100%-2rem)] overflow-auto"
    on:mousedown|stopPropagation
    on:touchstart|stopPropagation
  >
    <slot />
  </div>

  {#if isResizable}
    <!-- Resize handles -->
    <div class="absolute -top-1 left-1/2 w-2 h-2 bg-white border border-gray-300 -translate-x-1/2 {getResizeCursorClass('n')}" 
         on:mousedown={(e) => handleResizeStart(e, 'n')}
         on:touchstart={(e) => handleResizeTouchStart(e, 'n')}></div>
    
    <div class="absolute top-1/2 -right-1 w-2 h-2 bg-white border border-gray-300 -translate-y-1/2 {getResizeCursorClass('e')}" 
         on:mousedown={(e) => handleResizeStart(e, 'e')}
         on:touchstart={(e) => handleResizeTouchStart(e, 'e')}></div>
    
    <div class="absolute -bottom-1 left-1/2 w-2 h-2 bg-white border border-gray-300 -translate-x-1/2 {getResizeCursorClass('s')}" 
         on:mousedown={(e) => handleResizeStart(e, 's')}
         on:touchstart={(e) => handleResizeTouchStart(e, 's')}></div>
    
    <div class="absolute top-1/2 -left-1 w-2 h-2 bg-white border border-gray-300 -translate-y-1/2 {getResizeCursorClass('w')}" 
         on:mousedown={(e) => handleResizeStart(e, 'w')}
         on:touchstart={(e) => handleResizeTouchStart(e, 'w')}></div>
    
    <div class="absolute -top-1 -right-1 w-2 h-2 bg-white border border-gray-300 {getResizeCursorClass('ne')}" 
         on:mousedown={(e) => handleResizeStart(e, 'ne')}
         on:touchstart={(e) => handleResizeTouchStart(e, 'ne')}></div>
    
    <div class="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-gray-300 {getResizeCursorClass('se')}" 
         on:mousedown={(e) => handleResizeStart(e, 'se')}
         on:touchstart={(e) => handleResizeTouchStart(e, 'se')}></div>
    
    <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-gray-300 {getResizeCursorClass('sw')}" 
         on:mousedown={(e) => handleResizeStart(e, 'sw')}
         on:touchstart={(e) => handleResizeTouchStart(e, 'sw')}></div>
    
    <div class="absolute -top-1 -left-1 w-2 h-2 bg-white border border-gray-300 {getResizeCursorClass('nw')}" 
         on:mousedown={(e) => handleResizeStart(e, 'nw')}
         on:touchstart={(e) => handleResizeTouchStart(e, 'nw')}></div>
  {/if}
</div>