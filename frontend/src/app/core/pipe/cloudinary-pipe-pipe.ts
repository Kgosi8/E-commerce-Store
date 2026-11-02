import { Pipe, PipeTransform } from '@angular/core';
import { CloudinaryService } from '../../services/cloudinary/cloudinary-service';

@Pipe({
  name: 'cloudinaryPipe',
})
export class CloudinaryPipe implements PipeTransform {
  constructor(private cloudinary: CloudinaryService) {}

  transform(publicId: string, preset: 'hero' | 'card' | 'thumb' | 'logo' | 'raw' = 'raw'): string {
    if (!publicId) return '';
    switch (preset) {
      case 'hero':
        return this.cloudinary.hero(publicId);
      case 'card':
        return this.cloudinary.card(publicId);
      case 'thumb':
        return this.cloudinary.thumb(publicId);
      case 'logo':
        return this.cloudinary.logo(publicId);
      default:
        return this.cloudinary.url(publicId);
    }
  }
}
