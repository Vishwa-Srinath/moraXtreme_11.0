/**
 * Shared types for the ImageGallery component and its data layer.
 * Import from here in components, services, and data files — never define
 * these inline in a page or component file.
 */

export interface GalleryImage {
  /** Absolute URL or Next.js public-folder path (e.g. "/images/gallery/foo.jpg") */
  src: string;
  alt: string;
  caption: string;
  description?: string;
}

export interface ImageGalleryProps {
  images?: GalleryImage[];
  title?: string;
  subtitle?: string;
  /** Desktop column count — defaults to 3 */
  columns?: 2 | 3 | 4;
  bgColor?: string;
}
