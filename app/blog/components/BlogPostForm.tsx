"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BlogMarkdown from "./BlogMarkdown";

export type BlogPostFormValues = {
  title: string;
  content: string;
  published: boolean;
};

interface BlogPostFormProps {
  initialData?: Partial<BlogPostFormValues>;
  onSubmit: (values: BlogPostFormValues) => Promise<void> | void;
  loading?: boolean;
  submitLabel?: string;
}

const PLACEHOLDER_MARKDOWN = `## Seu conteudo aqui\n\nEscreva em Markdown com suporte a:\n\n- **Negrito**, *italico*, tabelas e checklists\n- Imagens: ![descricao](https://url-da-imagem)\n- Video HTML:\n\n<video controls width="100%" src="https://www.w3schools.com/html/mov_bbb.mp4"></video>\n\n- Embed de YouTube:\n\n<iframe width="100%" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube" frameborder="0" allowfullscreen></iframe>`;

export default function BlogPostForm({
  initialData,
  onSubmit,
  loading = false,
  submitLabel = "Salvar",
}: BlogPostFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [published, setPublished] = useState(
    (initialData?.published ?? true) ? "true" : "false",
  );

  const previewContent = useMemo(() => {
    return content.trim() ? content : PLACEHOLDER_MARKDOWN;
  }, [content]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      published: published === "true",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da Publicacao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titulo</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Digite o titulo do post"
              minLength={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={published} onValueChange={setPublished}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Publicado</SelectItem>
                <SelectItem value="false">Rascunho</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Conteudo (Markdown)</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Escreva seu conteudo em Markdown"
              minLength={10}
              required
              className="min-h-56 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <div className="text-xs text-muted-foreground">
              Dica: voce pode usar Markdown e HTML (img, video, iframe).
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogMarkdown content={previewContent} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
