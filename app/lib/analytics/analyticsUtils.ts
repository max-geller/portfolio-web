declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: {
        page_path?: string;
        page_type?: string;
        photo_category?: string;
        print_type?: string;
        items?: Array<{
          item_id: string;
          item_category?: string;
          price?: number;
        }>;
      }
    ) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID!;

export const trackPageView = (url: string) => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID is not defined');
    return;
  }
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const trackPhotoView = (photoId: string, category: string) => {
  window.gtag("event", "view_item", {
    items: [
      {
        item_id: photoId,
        item_category: category,
      },
    ],
    page_type: "photo_detail",
    photo_category: category,
  });
};

export const trackPrintView = (
  printId: string,
  type: string,
  price: number
) => {
  window.gtag("event", "view_item", {
    items: [
      {
        item_id: printId,
        item_category: "print",
        price: price,
      },
    ],
    page_type: "print_detail",
    print_type: type,
  });
};

export const trackAddToCart = (printId: string, price: number) => {
  window.gtag("event", "add_to_cart", {
    items: [
      {
        item_id: printId,
        price: price,
      },
    ],
  });
};

/* In my components, I can add something like this:
  
  import { trackPhotoView, trackPrintView } from '@/lib/analytics/analyticsUtils';

// In your photo gallery component
const handlePhotoClick = (photoId: string) => {
  trackPhotoView(photoId, 'travel');
  // other handling code
};

// In your print detail component
const handlePrintView = (printId: string) => {
  trackPrintView(printId, 'framed', 299.99);
  // other handling code
};
*/
