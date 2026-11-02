import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private readonly cloudName = environment.cloudinaryCloud;
  private readonly baseUrl   = `https://res.cloudinary.com/${this.cloudName}/image/upload`;

  /**
   * Get a Cloudinary URL with optional transformations.
   * @param publicId  e.g. 'models/model-8' or 'banners/summer'
   * @param options   optional width, height, quality, format
   */
  url(
    publicId: string,
    options: {
      width?:   number;
      height?:  number;
      quality?: number | 'auto';
      format?:  string;
      crop?:    string;
    } = {}
  ): string {
    const transforms: string[] = [];

    if (options.width)   transforms.push(`w_${options.width}`);
    if (options.height)  transforms.push(`h_${options.height}`);
    if (options.crop)    transforms.push(`c_${options.crop}`);
    if (options.quality) transforms.push(`q_${options.quality}`);
    if (options.format)  transforms.push(`f_${options.format}`);

    // Always auto-format and auto-quality if not specified
    if (!options.quality) transforms.push('q_auto');
    if (!options.format)  transforms.push('f_auto');

    const t = transforms.length ? transforms.join(',') + '/' : '';
    return `${this.baseUrl}/${t}${publicId}`;
  }

  // ── Shortcuts for common sizes ──────────────────────────────────

  /** Hero / banner — full width */
  hero(publicId: string): string {
    return this.url(publicId, { width: 1400, crop: 'limit' });
  }

  /** Product card thumbnail */
  card(publicId: string): string {
    return this.url(publicId, { width: 600, height: 800, crop: 'fill' });
  }

  /** Small thumbnail */
  thumb(publicId: string): string {
    return this.url(publicId, { width: 200, height: 200, crop: 'fill' });
  }

  /** Logo */
  logo(publicId: string): string {
    return this.url(publicId, { width: 300 });
  }
}
