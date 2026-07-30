import { DestroyRef, Directive, ElementRef, effect, inject, input } from '@angular/core'
import { applyRectStyle } from '@laynjs/adapter-utils'
import type { ItemId } from '@laynjs/core'
import type { LaynItemBinding } from '../types/index.js'

@Directive({ selector: '[laynItem]', standalone: true })
export class LaynItemDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef)
  readonly binding = input.required<LaynItemBinding>({ alias: 'laynItem' })
  private observed: ItemId | undefined

  constructor() {
    const destroyRef = inject(DestroyRef)
    effect(() => {
      const binding = this.binding()
      applyRectStyle(this.element.nativeElement, binding.rect)
      if (this.observed !== binding.id) {
        if (this.observed !== undefined) {
          binding.ref.unobserveItem(this.observed)
        }
        binding.ref.observeItem(binding.id, this.element.nativeElement)
        this.observed = binding.id
      }
    })
    destroyRef.onDestroy(() => {
      if (this.observed !== undefined) {
        this.binding().ref.unobserveItem(this.observed)
      }
    })
  }
}
