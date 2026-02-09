import { Component, EventEmitter, Output, ElementRef, Renderer2, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-emoji-panel',
  templateUrl: './emoji-panel.component.html',
  styleUrls: ['./emoji-panel.component.css']
})
export class EmojiPanelComponent implements OnDestroy {
  @Output() emojiSelected = new EventEmitter<string>();
  @Output() panelClosed = new EventEmitter<void>();

  emojis: string[] = [
    "😊", "😒", "😎", "❤️",
    "🙂", "👍", "😢", "😏",
    "😭", "💀", "👎", "🤡",
    "😱", "😵", "😋", "💩"
  ];

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private startLeft = 0;
  private startTop = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  selectEmoji(emoji: string): void {
    this.emojiSelected.emit(emoji);
  }

  closePanel(): void {
    this.panelClosed.emit();
  }

  onMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.emoji-btn') || 
        (event.target as HTMLElement).closest('.close-btn')) {
      return;
    }

    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    
    const panel = this.el.nativeElement.querySelector('.emoji-panel');
    const rect = panel.getBoundingClientRect();
    this.startLeft = rect.left;
    this.startTop = rect.top;
    
    this.renderer.setStyle(panel, 'cursor', 'grabbing');
    this.renderer.setStyle(panel, 'user-select', 'none');
    
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    const panel = this.el.nativeElement.querySelector('.emoji-panel');
    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;
    
    const newLeft = this.startLeft + deltaX;
    const newTop = this.startTop + deltaY;
    
    this.renderer.setStyle(panel, 'position', 'fixed');
    this.renderer.setStyle(panel, 'left', `${newLeft}px`);
    this.renderer.setStyle(panel, 'top', `${newTop}px`);
    this.renderer.setStyle(panel, 'margin', '0');
    this.renderer.setStyle(panel, 'transform', 'none');
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const panel = this.el.nativeElement.querySelector('.emoji-panel');
    this.renderer.setStyle(panel, 'cursor', 'grab');
    this.renderer.setStyle(panel, 'user-select', 'auto');
  }

  ngOnDestroy(): void {
    this.isDragging = false;
  }
}