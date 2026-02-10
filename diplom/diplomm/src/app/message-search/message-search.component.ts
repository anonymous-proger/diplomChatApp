import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { SearchState } from '../services/message-search.service';

@Component({
  selector: 'app-message-search',
  templateUrl: './message-search.component.html',
  styleUrls: ['./message-search.component.css']
})
export class MessageSearchComponent implements OnChanges {
  @Input() searchState: SearchState | null = null;
  
  @Output() searchTextChanged = new EventEmitter<string>();
  @Output() nextResult = new EventEmitter<void>();
  @Output() prevResult = new EventEmitter<void>();
  @Output() closeSearch = new EventEmitter<void>();

  searchInput: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchState'] && this.searchState) {
      this.searchInput = this.searchState.searchText;
    }
  }

  onSearchInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.searchTextChanged.emit(input);
  }

  onNext(): void {
    this.nextResult.emit();
  }

  onPrev(): void {
    this.prevResult.emit();
  }

  onClose(): void {
    this.closeSearch.emit();
  }

  getResultText(): string {
    if (!this.searchState || this.searchState.results.length === 0) {
      return 'No results';
    }
    
    return `${this.searchState.currentIndex + 1} of ${this.searchState.results.length}`;
  }

  getTotalMatchesText(): string {
    if (!this.searchState) return '';
    
    if (this.searchState.totalMatches === 0) {
      return 'No matches';
    } else if (this.searchState.totalMatches === 1) {
      return '1 match';
    } else {
      return `${this.searchState.totalMatches} matches`;
    }
  }
}