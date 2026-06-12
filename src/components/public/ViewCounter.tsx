"use client";

import { useEffect } from "react";

export default function ViewCounter({ articleId }: { articleId: string }) {
  useEffect(() => {
    // Increment view count once per page load
    fetch(`/api/articles/${articleId}/view`, { method: "POST" }).catch(() => {});
  }, [articleId]);

  return null;
}
