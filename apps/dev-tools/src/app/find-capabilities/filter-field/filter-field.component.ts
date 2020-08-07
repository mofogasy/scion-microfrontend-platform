import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

export type Filter = string | KeyValuePair;

export interface KeyValuePair {
  key?: string;
  value?: string;
}

@Component({
  selector: 'app-filter-field',
  templateUrl: './filter-field.component.html',
  styleUrls: ['./filter-field.component.scss']
})
export class FilterFieldComponent {

  @Input()
  public title: string;

  @Input()
  public type: 'value' | 'key-value' = 'value';

  @Output()
  public filter: EventEmitter<Filter[]> = new EventEmitter<Filter[]>();

  @ViewChild('key', {read: ElementRef})
  public key: ElementRef;
  public keyFC = new FormControl();

  @ViewChild('value', {read: ElementRef})
  public value: ElementRef;
  public valueFC = new FormControl();

  public _filters: Set<Filter> = new Set<Filter>();

  public get filters(): Filter[] {
    return Array.from(this._filters.values());
  }

  public onAddFilterClick(): void {
    const key = this.keyFC.value;
    const value = this.valueFC.value;
    this.keyFC.setValue('');
    this.valueFC.setValue('');
    this.add(key, value);
    this.filter.emit(Array.from(this._filters.values()));
  }

  public onRemoveFilter(filter: Filter): void {
    this._filters.delete(filter);
    this.filter.emit(Array.from(this._filters.values()));
  }

  private add(key: string, value: string): void {
    if (this.type === 'value' && value && !this._filters.has(value)) {
      this._filters.add(value);
      this.value.nativeElement.focus();
    } else if (this.type === 'key-value') {
      if (key) {
        this.key.nativeElement.focus();
        const entry = {key, value};
        if (this.hasEntry(entry)) {
          return;
        }
        this._filters.add(entry);
      }
    }
  }

  private hasEntry(entry: KeyValuePair): boolean {
    return !!Array.from(this._filters.values()).find((filter: KeyValuePair) => filter.key === entry.key && filter.value === entry.value);
  }
}
