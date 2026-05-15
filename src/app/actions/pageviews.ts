"use server";

import redis from "@/cache";

const keyFor = (id: number | string) => `pageviews:articles:${id}`;

export async function incrementPageViews(articleId: number) {
  const articleKey = keyFor(articleId);
  const newVal = await redis.incr(articleKey);
  return +newVal;
}
