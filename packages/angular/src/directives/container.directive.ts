import { type AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core'
import type { LaynContainerTarget } from '../types/index.js'

@Directive({ selector: '[laynContainer]', standalone: true })
export class LaynContainerDirective implements AfterViewInit {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef)
  readonly target = input.required<LaynContainerTarget>({ alias: 'laynContainer' })

  ngAfterViewInit(): void {
    this.target().attachContainer(this.element.nativeElement)
  }
}
