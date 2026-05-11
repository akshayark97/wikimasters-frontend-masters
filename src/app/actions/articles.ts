"use server";

import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { ensureUserExists } from "@/db/sync-user";
import db from "@/db/index";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  const response = await db
    .insert(articles)
    .values({
      title: data.title,
      content: data.content,
      slug: `${Date.now()}`,
      published: true,
      authorId: user.id,
    })
    .returning({ id: articles.id });

  const articleId = response[0]?.id;

  return { success: true, message: "Article create logged", id: articleId };
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  console.log("📝 updateArticle called:", { id, ...data });

  const _response = await db
    .update(articles)
    .set({
      title: data.title,
      content: data.content,
    })
    .where(eq(articles.id, +id));

  return { success: true, message: `Article ${id} update logged` };
}

export async function deleteArticle(id: string) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
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
