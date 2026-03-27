"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import TiTleSeparator from "@/components/TiTleSeparator";
import { createBlogPost } from "@/lib/blog-posts";
import BlogPostForm, { BlogPostFormValues } from "../components/BlogPostForm";

export default function CreateBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  async function onSubmit(values: BlogPostFormValues) {
    if (submittingRef.current || loading) return;

    try {
      submittingRef.current = true;
      setLoading(true);

      await createBlogPost(values);
      toast.success("Post criado com sucesso!");
      router.push("/blog");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar post",
      );
      setLoading(false);
      submittingRef.current = false;
    }
  }

  return (
    <>
      <TiTleSeparator title="Novo Post" />
      <BlogPostForm
        onSubmit={onSubmit}
        loading={loading}
        submitLabel="Criar Post"
      />
    </>
  );
}
