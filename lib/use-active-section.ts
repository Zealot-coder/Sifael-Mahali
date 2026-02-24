'use client';

import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const targets = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        threshold: [0.2, 0.35, 0.5],
        rootMargin: '-40% 0px -45% 0px'
      }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
