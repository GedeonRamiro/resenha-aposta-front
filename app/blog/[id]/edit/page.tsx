"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { getBlogPostById, updateBlogPost } from "@/lib/blog-posts";
import BlogPostForm, {
  BlogPostFormValues,
} from "../../components/BlogPostForm";
import { useBackendUser } from "@/lib/useBackendUser";

export default function EditBlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: isAuthLoading } = useBackendUser();

  const postId = Array.isArray(id) ? id[0] : id;

  const [loading, setLoading] = useState(false);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);
  const [initialData, setInitialData] =
    useState<Partial<BlogPostFormValues> | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAdmin) router.replace("/blog");
  }, [isAdmin, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || !isAdmin) return;
    async function fetchPost() {
      if (!postId) {
        setIsFetchingInitial(false);
        return;
      }

      try {
        const data = await getBlogPostById(postId);
        setInitialData({
          title: data.title,
          content: data.content,
          published: data.published,
        });
      } catch {
        toast.error("Erro ao carregar post");
      } finally {
        setIsFetchingInitial(false);
      }
    }

    fetchPost();
  }, [postId, isAdmin, isAuthLoading]);

  if (isAuthLoading || !isAdmin) return null;

  async function onSubmit(values: BlogPostFormValues) {
    if (!postId || submittingRef.current || loading) return;

    try {
      submittingRef.current = true;
      setLoading(true);
      await updateBlogPost(postId, values);
      toast.success("Post atualizado com sucesso!");
      router.push("/blog");
    } catch {
      toast.error("Erro ao atualizar post");
      setLoading(false);
      submittingRef.current = false;
    }
  }

  if (isFetchingInitial) {
    return (
      <div className="mt-10 flex justify-center">
        <Card className="w-full max-w-3xl shadow-xl">
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-56 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <>
      <BreadcrumbNav
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: `Editar: ${initialData.title}` },
        ]}
      />
      <TiTleSeparator title="Editar Post" />
      <BlogPostForm
        initialData={initialData}
        onSubmit={onSubmit}
        loading={loading}
        submitLabel="Atualizar Post"
      />
    </>
  );
}
