"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Tag,
  User,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  publishedAt: string;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Simple markdown-to-HTML renderer for blog content.
 * Handles headings, bold, italic, lists, blockquotes, tables, code, links, hr.
 */
function renderMarkdown(md: string): string {
  let html = md;

  // Escape HTML (but preserve markdown)
  // We'll skip full escaping since content is trusted (admin-created)

  // Code blocks (```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
    return `<pre class="bg-muted rounded-lg p-4 overflow-x-auto text-sm my-4"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');

  // Tables
  html = html.replace(/(\|.+\|\n)((\|[-:]+)+\|\n)((\|.+\|\n?)+)/g, (_match, headerRow, _sep, _s2, bodyRows) => {
    const headers = headerRow.trim().split("|").filter((c: string) => c.trim());
    const headerHtml = headers.map((h: string) => `<th class="border px-3 py-2 text-left font-semibold">${h.trim()}</th>`).join("");

    const rows = bodyRows.trim().split("\n");
    const bodyHtml = rows.map((row: string) => {
      const cells = row.split("|").filter((c: string) => c.trim());
      return `<tr>${cells.map((c: string) => `<td class="border px-3 py-2">${c.trim()}</td>`).join("")}</tr>`;
    }).join("");

    return `<div class="overflow-x-auto my-4"><table class="w-full border-collapse border text-sm"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
  });

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 py-2 my-4 text-muted-foreground italic">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-8 border-border" />');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Wrap consecutive list items
  html = html.replace(/((<li class="ml-4 list-disc">.+<\/li>\n?)+)/g, '<ul class="my-4 space-y-1">$1</ul>');
  html = html.replace(/((<li class="ml-4 list-decimal">.+<\/li>\n?)+)/g, '<ol class="my-4 space-y-1">$1</ol>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener">$1</a>');

  // Paragraphs (wrap plain text lines)
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Don't wrap already-wrapped elements
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<table")
      ) {
        return trimmed;
      }
      return `<p class="my-4 leading-relaxed">${trimmed}</p>`;
    })
    .join("\n");

  return html;
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const data = await api.getBlogBySlug(slug);
        setPost(data);
      } catch (err: any) {
        console.error("Blog yazısı yüklenirken hata:", err);
        if (err?.status === 404) {
          setError("Bu blog yazısı bulunamadı.");
        } else {
          setError("Blog yazısı yüklenirken bir hata oluştu.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Yükleniyor...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-destructive text-lg">{error}</p>
            <Button variant="outline" onClick={() => router.push("/blog")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Blog&apos;a Dön
            </Button>
          </div>
        )}

        {/* Post Content */}
        {post && !loading && !error && (
          <>
            {/* Hero */}
            <section className="py-12 bg-gradient-to-b from-primary/10 to-background">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                  <Link href="/blog">
                    <Button variant="ghost" size="sm" className="mb-6">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Tüm Yazılar
                    </Button>
                  </Link>

                  <Badge variant="secondary" className="mb-4">
                    <Tag className="h-3 w-3 mr-1" />
                    {post.category}
                  </Badge>

                  <h1 className="text-3xl font-bold tracking-tight font-heading sm:text-4xl lg:text-5xl mb-4">
                    {post.title}
                  </h1>

                  {post.excerpt && (
                    <p className="text-lg text-muted-foreground mb-6">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views} görüntülenme</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Article Body */}
            <section className="py-12">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <article className="max-w-3xl mx-auto prose-custom">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(post.content),
                    }}
                  />
                </article>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="max-w-3xl mx-auto mt-10 pt-6 border-t">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back Link */}
                <div className="max-w-3xl mx-auto mt-10">
                  <Link href="/blog">
                    <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Tüm Yazılara Dön
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
