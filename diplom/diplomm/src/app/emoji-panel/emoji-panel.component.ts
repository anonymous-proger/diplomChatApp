import { Component } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-emoji-panel',
  templateUrl: './emoji-panel.component.html',
  styleUrls: ['./emoji-panel.component.css']
})
export class EmojiPanelComponent {
  @Output() emojiSelected = new EventEmitter<string>();
  @Output() panelClosed = new EventEmitter<void>();

  emojis: string[] = [
    "😊", "😒", "😎", "❤️",
    "🙂", "👍", "😢", "😏",
    "😭", "💀", "👎", "🤡",
    "😱", "😵", "😋", "💩"
  ];

  selectEmoji(emoji: string): void {
    this.emojiSelected.emit(emoji);
    this.panelClosed.emit();
  }

  closePanel(): void {
    this.panelClosed.emit();
  }
}