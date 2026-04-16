import { IBlogPost, IPagination } from "@/types/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

export interface BlogPostsApiResponse extends IPagination {
  data: IBlogPost[];
}

export type BlogPostPayload = {
  title: string;
  content: string;
  published?: boolean;
};

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window === "undefined") {
    return headers;
  }

  const token = window.localStorage.getItem("backendAuthToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getBlogPosts(
  page: number,
  query?: string,
  limit = 10,
): Promise<BlogPostsApiResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (query) {
    params.set("query", query);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/blog-posts?${params.toString()}`,
    {
      cache: "no-store",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch blog posts");
  }

  return (await response.json()) as BlogPostsApiResponse;
}

export async function getBlogPostById(postId: string): Promise<IBlogPost> {
  const response = await fetch(`${getApiBaseUrl()}/blog-posts/${postId}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog post ${postId}`);
  }

  return (await response.json()) as IBlogPost;
}

export async function getBlogPostBySlug(slug: string): Promise<IBlogPost> {
  const response = await fetch(`${getApiBaseUrl()}/blog-posts/slug/${slug}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog post slug ${slug}`);
  }

  return (await response.json()) as IBlogPost;
}

export async function createBlogPost(
  payload: BlogPostPayload,
): Promise<IBlogPost> {
  const response = await fetch(`${getApiBaseUrl()}/blog-posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "Failed to create blog post");
  }

  return (await response.json()) as IBlogPost;
}

export async function updateBlogPost(
  postId: string,
  payload: BlogPostPayload,
): Promise<IBlogPost> {
  const response = await fetch(`${getApiBaseUrl()}/blog-posts/${postId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Failed to update blog post ${postId}`);
  }

  return (await response.json()) as IBlogPost;
}
