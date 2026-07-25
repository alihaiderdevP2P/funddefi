"use client";

import type { BlogPost } from "@/lib/blog-api";

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none break-words overflow-hidden">
      {content.split("\n").map((line, index) => {
        if (line.startsWith("# ")) {
          return (
            <h1
              key={index}
              className="text-3xl font-bold mt-8 mb-4 break-words"
            >
              {line.substring(2)}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="text-2xl font-bold mt-6 mb-3 break-words"
            >
              {line.substring(3)}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-4 mb-2 break-words"
            >
              {line.substring(4)}
            </h3>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <li key={index} className="ml-6 my-1 break-words">
              {line.substring(2)}
            </li>
          );
        }
        if (line.trim() === "") {
          return <br key={index} />;
        }
        return (
          <p key={index} className="my-3 text-base leading-7 break-words">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function formatBlogDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function shareBlogPost(post: BlogPost) {
  const url = `${window.location.origin}/blog/${post.slug}`;
  if (navigator.share) {
    navigator.share({
      title: post.title,
      text: post.excerpt,
      url,
    });
  } else {
    navigator.clipboard.writeText(url);
  }
}
