---
title: Infinite feed
description: A paginated feed grouped by day, that loads the next page at the end and animates arrivals and removals.
---

A feed is a list that never ends and never stops changing: new pages arrive at the bottom, new posts
at the top, and things get deleted while you read. This recipe covers all three.

```tsx
import { masonry, sections } from '@laynjs/core';
import { useLayn } from '@laynjs/react';
import { useCallback, useState } from 'react';

const isHeader = (item) => item.data.kind === 'day';

export function Feed() {
  const [items, setItems] = useState(() => firstPage());
  const [done, setDone] = useState(false);

  const loadMore = useCallback(async () => {
    if (done) return;
    const page = await fetchPage(items.length);
    if (page.length === 0) {
      setDone(true);
      return;
    }
    setItems((current) => [...current, ...page]);
  }, [items.length, done]);

  const remove = (id) => setItems((current) => current.filter((item) => item.id !== id));

  const layn = useLayn({
    items,
    algorithm: sections(masonry({ columns: { 0: 1, 700: 2, 1100: 3 } }), { isHeader }),
    gap: { x: 16, y: 16 },
    animate: true,
    stickyHeaders: isHeader,
    onReachEnd: loadMore,
    reachEndThreshold: 600,
    label: 'Feed',
  });

  return (
    <div {...layn.containerProps} className="feed">
      <div {...layn.contentProps}>
        {layn.items.map((entry) =>
          entry.item.data.kind === 'day' ? (
            <h2 key={entry.id} ref={entry.ref} style={entry.style} className="day" {...entry.a11y}>
              {entry.item.data.label}
            </h2>
          ) : (
            <article key={entry.id} ref={entry.ref} style={entry.style} {...entry.a11y}>
              <Post post={entry.item.data} onDelete={() => remove(entry.id)} />
            </article>
          ),
        )}
      </div>
    </div>
  );
}
```

## Loading the next page

`onReachEnd` fires when the scroll gets within `reachEndThreshold` of the end. Two things about it
mean you do not need a guard flag of your own:

It is **latched against the content size**. Once it has fired it will not fire again until the content
actually grows, so a slow request cannot produce a burst of calls, and reaching the end of the data
simply stops the loop.

It also fires **immediately if the first page does not fill the viewport**, so a short first page on a
tall screen still pulls the next one.

The `done` flag above is not about debouncing - it is only there so you stop asking the server once it
has told you there is nothing left.

## Items appearing and disappearing

With `animate: true`, a post that is added fades and rises into place, and a deleted one fades out
where it stood while the rest close the gap.

Exit animations work even though React unmounts the node before layn ever sees the change: the
transition layer keeps a copy of the element and animates that. The clone is inert and hidden from
assistive technology, so do not expect handlers or state to survive on the way out - it is a
picture of the item, not the item. See [animations](/guides/animations/).

Prepending is the same call. New items at the front push the rest down, and everything animates:

```ts
setItems((current) => [...newPosts, ...current]);
```

## Grouping by day

`sections` restarts masonry for each day, so a day's columns start level instead of continuing from
the previous one - which is what makes the grouping read as groups rather than as one long grid with
labels in it. `stickyHeaders` keeps the current day at the top while you scroll through it.

Give the header item a `height` and **no** `aspectRatio`. See [sections](/guides/sections/).

## Keep your ids stable

layn diffs items by `id`. Reuse the same id for the same post across pages and re-fetches and you get
correct animations, correct measurement reuse, and an append that costs O(added) rather than a full
recompute. Regenerating ids on every fetch throws all of that away.
