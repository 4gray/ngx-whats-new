import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { DialogOptions, NavigationEvent, WhatsNewItem } from './interfaces';

const DEFAULT_OPTIONS: DialogOptions = {
  customStyle: {
    width: '500px',
  },
  disableClose: false,
};

@Component({
  selector: 'ngx-whats-new',
  standalone: true,
  imports: [CommonModule, A11yModule],
  templateUrl: './ngx-whats-new.component.html',
  styleUrls: ['./ngx-whats-new.component.scss'],
})
export class NgxWhatsNewComponent implements AfterViewInit, OnDestroy {
  // * -----------------------
  // * Component's public API
  // * -----------------------

  /** Items to show in the dialog */
  @Input() public set items(items: WhatsNewItem[]) {
    if (items && items.length > 0) {
      this._items = items;
    } else {
      console.warn('NgxWhatsNewComponent: No items provided.');
      this._items = [];
    }
    this.resetState();
  }
  public get items(): WhatsNewItem[] {
    return this._items;
  }

  /** DialogOptions for What's New dialog */
  @Input() public set options(options: DialogOptions) {
    this._options = { ...options };
  }
  public get options() {
    return this._options;
  }

  /**
   * @output itemNavigation - Emits an event whenever the selected item changes.
   * The event payload includes the previous and current index and the corresponding items.
   */
  @Output() public readonly navigation = new EventEmitter<NavigationEvent>();

  /** @output closed - Emits an event on dialog close */
  @Output() public readonly closed = new EventEmitter<void>();

  /** @output opened - Emits an event on dialog open */
  @Output() public readonly opened = new EventEmitter<void>();

  /** Navigates to the next item. Closes What's New dialog if it is the last one. */
  public goToNext(): void {
    if (this.items.length === 0) {
      console.warn('NgxWhatsNewComponent: No items to navigate.');
      return;
    }

    if (this.selectedIndex < this.items.length - 1) {
      const previousIndex = this.selectedIndex;
      const previousItem = this.items[previousIndex];
      this.selectedIndex += 1;
      this.updateTabIndices();
      this.emitNavigationEvent(
        previousIndex,
        previousItem,
        this.selectedIndex,
        this.items[this.selectedIndex]
      );
    } else {
      this.close();
    }
  }

  /**
   * Navigates to the item corresponding to the provided number.
   * @param index number of the item
   */
  public navigateTo(index: number): void {
    if (this.items.length === 0) {
      console.warn('NgxWhatsNewComponent: No items to navigate.');
      return;
    }

    if (this._options.clickableNavigationDots && index !== this.selectedIndex) {
      const previousIndex = this.selectedIndex;
      const previousItem = this.items[previousIndex];
      this.selectedIndex = index;
      this.updateTabIndices();
      this.focusButton(index);
      this.emitNavigationEvent(
        previousIndex,
        previousItem,
        this.selectedIndex,
        this.items[this.selectedIndex]
      );
    }
  }

  /** Opens What's New dialog. */
  public open(): void {
    this.isVisible = true;
    this.opened.emit();
    this.registerKeyboardListener();
    this.resetState();
  }

  /** Closes What's New dialog. */
  public close(): void {
    if (!this._options.disableClose) {
      this.unregisterKeyboardListener();
      this.isVisible = false;
      this.closed.emit();
      this.resetState();
    }
  }

  /**
   * Sets focus to the close button when the component is initialized.
   *
   * **MANUAL EXECUTION OF THIS FUNCTION IS NOT RECOMMENDED**
   */
  ngAfterViewInit(): void {
    if (this._closeButton) {
      this._closeButton.nativeElement.focus(); // Set focus to the close button
    }
  }

  ngOnDestroy(): void {
    this.unregisterKeyboardListener();
  }

  // * -------------------------------------------
  // * Private or protected methods and properties
  // * -------------------------------------------

  /** DialogOptions item initialized with default values. Accepts custom values. */
  private _options: DialogOptions = DEFAULT_OPTIONS;

  /** Items to show in the dialog */
  private _items: WhatsNewItem[] = [];

  /** Control whether the dialog is visible */
  protected isVisible = false;

  /** Reference to the close button */
  @ViewChild('wnCloseButton') private readonly _closeButton?: ElementRef;

  /** Reference to the navigation buttons */
  @ViewChildren('wnNavButton')
  private readonly navButtons?: QueryList<ElementRef>;

  /** Index of the selected modal item */
  protected selectedIndex = 0;

  /** Instance of Renderer2 */
  private readonly _renderer: Renderer2 = inject(Renderer2);

  /** Function to register/unregister keyboard listener*/
  private keyboardListener?: () => void;

  /**
   * Resets the component's state to its initial values.
   *
   * This method is called when the dialog is opened or closed to ensure that
   * the component does not retain any state from previous interactions.
   */
  private resetState(): void {
    this.selectedIndex = 0;
    this.updateTabIndices();
  }

  /**
   * Handles keyboard-based navigation between items.
   *
   * Handled events:
   *  - ArrowRight: next item
   *  - ArrowLeft: previous item
   *  - Escape: close dialog
   * @param $event keyboard event
   */
  protected handleKeyboardNavigation($event: KeyboardEvent): void {
    if (this._options.enableKeyboardNavigation) {
      let nextIndex = this.selectedIndex;
      switch ($event.key) {
        case 'ArrowRight':
          if (this.selectedIndex < this.items.length - 1) {
            nextIndex = this.selectedIndex + 1;
          } else {
            this.close();
            return;
          }
          break;
        case 'ArrowLeft':
          if (this.selectedIndex > 0) {
            nextIndex = this.selectedIndex - 1;
          } else return;

          break;
        case 'Escape':
          this.close();
          return;
        default:
          break;
      }

      if (nextIndex !== this.selectedIndex) {
        const previousIndex = this.selectedIndex;
        const previousItem = this.items[previousIndex];
        this.selectedIndex = nextIndex;
        this.updateTabIndices();
        this.focusButton(this.selectedIndex);
        this.emitNavigationEvent(
          previousIndex,
          previousItem,
          nextIndex,
          this.items[nextIndex]
        );
        $event.preventDefault();
      }
    }
  }

  /**
   * Updates the `tabindex` and `aria-selected` attributes for all navigation buttons.
   *
   * This method ensures that only the currently selected button is focusable via keyboard navigation
   * by setting its `tabindex` to `0`, while all other buttons have `tabindex` set to `-1`.
   * Additionally, it updates the `aria-selected` attribute to reflect the current selection state,
   * enhancing accessibility for assistive technologies.
   */
  private updateTabIndices(): void {
    this.navButtons?.forEach((ref, index) => {
      const button = ref.nativeElement;
      button.tabIndex = index === this.selectedIndex ? 0 : -1;
      button.setAttribute(
        'aria-selected',
        index === this.selectedIndex ? 'true' : 'false'
      );
    });
  }

  /**
   * Sets focus to the navigation button at the specified index.
   *
   * This method programmatically focuses the button corresponding to the given index,
   * ensuring that keyboard users receive visual and functional feedback when navigating
   * through carousel items using arrow keys.
   *
   * @param index - The index of the button to focus within the navigation list.
   */
  private focusButton(index: number): void {
    const buttons = this.navButtons?.toArray();

    const button = buttons?.[index].nativeElement;
    if (button) {
      button.focus();
    }
  }

  /**
   * Emits a navigation event with previous and current index and items.
   *
   * Allows external components to react to navigation changes with full context.
   *
   * @param previousIndex - The index before navigation.
   * @param previousItem - The item before navigation.
   * @param currentIndex - The index after navigation.
   * @param currentItem - The item after navigation.
   */
  private emitNavigationEvent(
    previousIndex: number,
    previousItem: WhatsNewItem,
    currentIndex: number,
    currentItem: WhatsNewItem
  ): void {
    if (previousIndex !== currentIndex)
      this.navigation.emit({
        previousItem: {
          index: previousIndex,
          item: previousItem,
        },
        currentItem: {
          index: currentIndex,
          item: currentItem,
        },
      });
  }

  /**
   * Registers keyboard event listener when the dialog opens.
   */
  private registerKeyboardListener(): void {
    this.keyboardListener = this._renderer.listen(
      'window',
      'keydown',
      (event: KeyboardEvent) => {
        this.handleKeyboardNavigation(event);
      }
    );
  }

  /**
   * Unregisters keyboard event listener when the dialog closes.
   */
  private unregisterKeyboardListener(): void {
    if (this.keyboardListener) {
      this.keyboardListener();
      this.keyboardListener = undefined;
    }
  }
}
