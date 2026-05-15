"use server";

import redis from "@/cache";
import sendCelebrationEmail from "@/email/celebration-email";

const milestones = [10, 50, 100, 1000, 10000];
const keyFor = (id: number | string) => `pageviews:articles:${id}`;

export async function incrementPageViews(articleId: number) {
  const articleKey = keyFor(articleId);
  const newVal = await redis.incr(articleKey);
  
  if (milestones.includes(newVal)) {
    sendCelebrationEmail(articleId, +newVal); // don't await so we don't block on sending the email, just send it
  }
  return +newVal;
}
