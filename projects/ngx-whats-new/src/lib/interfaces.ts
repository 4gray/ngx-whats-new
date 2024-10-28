export interface WhatsNewItem {
  title?: string;
  text?: string;
  html?: string;
  image?: {
    src: string;
    height?: number;
    bgColor?: string;
    altText: string;
  };
  button?: {
    text: string;
    textColor: string;
    bgColor: string;
    position?: 'left' | 'center' | 'right';
  };
}

export interface DialogOptions {
  disableClose?: boolean;
  enableKeyboardNavigation?: boolean;
  clickableNavigationDots?: boolean;
  customStyle: {
    width?: string;
    boxShadow?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    borderSize?: string;
  };
}

export interface NavigationEvent {
  previousItem: NavigationItem | undefined;
  currentItem: NavigationItem;
}

interface NavigationItem {
  index: number;
  item: WhatsNewItem;
}
