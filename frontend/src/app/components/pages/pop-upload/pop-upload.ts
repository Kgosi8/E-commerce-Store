import { Component, Input, signal } from '@angular/core';
import { PopService, UploadProgress } from '../../../services/pop/pop-service';

type UploadState= 'idle' | 'uploading' | 'success' | 'error';

const ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','application/pdf'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB


@Component({
  selector: 'app-pop-upload',
  imports: [],
  templateUrl: './pop-upload.html',
  styleUrl: './pop-upload.css',
})
export class PopUpload {
  @Input() orderId!: string;
  @Input()eftReference!: string;

  // ── Upload state
  state= signal<UploadState>('idle');
  progress= signal<number>(0);
  errorMessage= signal<string | null>(null);
  popImageUrl= signal<string | null>(null);
  uploadedAt= signal<string | null>(null);

  // Selected file
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private popService: PopService) {}

  //file selected from input
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ;

    if(!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage.set('Invalid file type. Please upload a JPEG, PNG, WEBP, or PDF file.');
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      this.errorMessage.set('File too large. Please upload a file smaller than 5MB.');
      return;
    }

    this.selectedFile = file;
    this.errorMessage.set(null);

    // Create preview URL(Not for PDFs)
    if (file.type !== 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }else {
      this.previewUrl = null; // No preview for PDFs
    }
  }

  // Upload the selected file
  upload(): void {
    if (!this.selectedFile || this.state() === 'uploading') return;

    this.state.set('uploading');
    this.progress.set(0);
    this.errorMessage.set(null);

    this.popService.uploadPOP(this.orderId, this.selectedFile).subscribe({
      next: (event: UploadProgress) => {
        this.progress.set(event.progress);
        if (event.completed && event.response?.success) {
          this.state.set('success');
          this.popImageUrl.set(event.response.popImageUrl);
          this.uploadedAt.set(event.response.uploadedAt);
        }
      },
      error: (err) => {
        this.state.set('error');
        this.errorMessage.set(err?.error?.message ?? 'Upload failed. Please try again.');
      }
    });
  }

  //Reset to upload another file
  reset(): void {
    this.state.set('idle');
    this.progress.set(0);
    this.errorMessage.set(null);
    this.selectedFile = null;
    this.previewUrl = null;
  }

  get fileName(): string {
    return this.selectedFile?.name ?? '';
  }

  get isPDF(): boolean {
    return this.selectedFile?.type === 'application/pdf';
  }


}
