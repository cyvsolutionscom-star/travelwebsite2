import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Section, Loading, Empty } from "./SharedUI";
import { Upload, Copy, Check, Trash2, ImageIcon, Link, FileIcon } from "lucide-react";
import { toast } from "sonner";

type StorageFile = {
  name: string;
  id: string;
  updated_at: string;
  metadata: Record<string, any>;
};

const MediaLibrary = () => {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch images inside 'cars' directory in 'car-images' bucket
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["media_files"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("car-images").list("cars", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) {
        console.warn("Could not load media files. Check storage permissions.", error);
        return [];
      }
      return data as StorageFile[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `cars/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("car-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Media file uploaded successfully");
      qc.invalidateQueries({ queryKey: ["media_files"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (filename: string) => {
      const { error } = await supabase.storage.from("car-images").remove([`cars/${filename}`]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Media file deleted");
      qc.invalidateQueries({ queryKey: ["media_files"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < fileList.length; i++) {
        await uploadMutation.mutateAsync(fileList[i]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const getPublicUrl = (filename: string) => {
    const { data } = supabase.storage.from("car-images").getPublicUrl(`cars/${filename}`);
    return data.publicUrl;
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Section
        title="Centralized Media Library"
        description="Upload images to the public storage bucket and copy their URLs for use in branding, cars, and CTA editors."
        action={
          <label className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold btn-glow cursor-pointer hover:scale-[1.01] transition-transform">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading…" : "Upload Files"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        }
      >
        {isLoading ? (
          <Loading />
        ) : files.length === 0 ? (
          <Empty text="No images uploaded to public storage yet. Use the upload button above to start." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => {
              const url = getPublicUrl(file.name);
              const isCopied = copiedId === file.name;

              return (
                <div
                  key={file.name}
                  className="card-elevated rounded-2xl overflow-hidden border border-border/60 bg-secondary/10 group relative flex flex-col justify-between hover:border-primary/30 transition-all duration-300"
                >
                  {/* Image Preview Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/80 flex items-center justify-center">
                    <img
                      src={url}
                      alt={file.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => copyToClipboard(url, file.name)}
                        className="w-8 h-8 rounded-lg bg-background/90 text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Copy Public URL"
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this file from storage?")) {
                            deleteMutation.mutate(file.name);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-background/90 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Info Footer */}
                  <div className="p-3 text-xs space-y-1">
                    <div className="font-semibold text-foreground truncate" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <FileIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span>{(file.metadata?.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
};

export default MediaLibrary;
