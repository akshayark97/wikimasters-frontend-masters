"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import redis from "@/cache";
import { authorizeUserToEditArticle } from "@/db/authz";
import db from "@/db/index";
import { articles } from "@/db/schema";
import { ensureUserExists } from "@/db/sync-user";
import { stackServerApp } from "@/stack/server";

export type CreateArticleInput = {
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
};

export async function createArticle(data: CreateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  await ensureUserExists(user);

  // TODO: Replace with actual database call
  console.log("✨ createArticle called:", data);

  /** uncomment where you got openai api key from vercel */
  // const summary  = await summarizeArticle(data.title || "", data.content || "");
  const response = await db
    .insert(articles)
    .values({
      title: data.title,
      content: data.content,
      slug: `${Date.now()}`,
      published: true,
      authorId: user.id,
      imageUrl: data.imageUrl ?? undefined,
      // summary,
    })
    .returning({ id: articles.id });

  const articleId = response[0]?.id;
  // delete all the articles from redis cache, so that next time when we fetch the articles, it will be a cache miss and we will get the updated list of articles including the newly created one.
  redis.del("articles:all");
  return { success: true, message: "Article create logged", id: articleId };
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error(
      "❌ Forbidden: You do not have permission to edit this article.",
    );
  }

  console.log("📝 updateArticle called:", { id, ...data });

  /** uncomment where you got openai api key from vercel */
  // const summary = await summarizeArticle(data.title || "", data.content || "");
  const _response = await db
    .update(articles)
    .set({
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl ?? undefined,
      // summary: summary ?? undefined,
    })
    .where(eq(articles.id, +id));

  return { success: true, message: `Article ${id} update logged` };
}

export async function deleteArticle(id: string) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error(
      "❌ Forbidden: You do not have permission to delete this article.",
    );
  }

  console.log("🗑️ deleteArticle called:", id);

  const _response = await db.delete(articles).where(eq(articles.id, +id));

  return { success: true, message: `Article ${id} delete logged (stub)` };
}

export async function deleteArticleForm(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (!id) {
    throw new Error("Missing article id");
  }

  await deleteArticle(String(id));
  // After deleting, redirect the user back to the homepage.
  redirect("/");
}
