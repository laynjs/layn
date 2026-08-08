---
'@laynjs/dom': patch
---

Fix drag and drop breaking on tiles that contain an image or a link. Pressing one of those starts
the browser's own HTML5 drag, which takes the gesture over and sends a `pointercancel` - layn read
that as "the drag was cancelled" and put the item straight back. The drag layer now suppresses the
native drag for as long as one of its own drags is running, so dragging a photo grid works with no
extra markup on your side.
