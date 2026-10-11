import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-box" role="alert">
      <strong>{{ title }}</strong>
      <p>{{ message }}</p>
      <button type="button" class="btn btn-primary" (click)="retry.emit()">Try again</button>
    </div>
  `,
  styles: `
    .error-box {
      background: #fff5f5;
      border: 1px solid #f3c1c1;
      border-radius: var(--radius);
      padding: 1.25rem 1.5rem;
      color: #8a1c1c;
      text-align: center;
    }

    p {
      margin: 0.35rem 0 1rem;
    }
  `,
})
export class ErrorMessageComponent {
  @Input() title = 'Something went wrong';
  @Input({ required: true }) message!: string;
  @Input() retryable = true;
  @Output() retry = new EventEmitter<void>();
}
