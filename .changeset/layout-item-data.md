---
'@laynjs/core': minor
---

`LayoutItem<TData>` now requires `data` when you name the data type.

Previously `data` was optional whatever you did, so `entry.item.data.src` failed to typecheck under
`strict` even for a grid where every item carries data, and every example in the documentation had
to be read as untyped. Now `LayoutItem` on its own is unchanged (`data` stays optional and
`unknown`), while `LayoutItem<Photo>` means what it says: `data` is present and typed.

```ts
const items: LayoutItem<Photo>[] = photos.map((photo) => ({
  id: photo.id,
  aspectRatio: photo.width / photo.height,
  data: photo,
}));

entry.item.data.src; // string, no optional chaining
```

This is a compile-time change only, and runtime behaviour is identical. If you had annotated items
as `LayoutItem<Something>` while omitting `data` on some of them, widen the type to
`LayoutItem<Something | undefined>` or drop the type argument.
