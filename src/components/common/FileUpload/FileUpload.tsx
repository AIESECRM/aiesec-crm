"use client";

import { useState, useRef } from "react";
import { UploadCloud, File, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUploadSuccess: (url: string, name: string) => void;
  className?: string;
}

export function FileUpload({ onUploadSuccess, className }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successParams, setSuccessParams] = useState<{ url: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.type !== "application/pdf") {
      setError("Sadece PDF formatı desteklenmektedir.");
      return null;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu maksimum 5MB olabilir.");
      return null;
    }
    return selectedFile;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const valid = validateFile(selectedFile);
      if (valid) setFile(valid);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setSuccessParams(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Yükleme başarısız.");
      }

      setSuccessParams({ url: data.url, name: file.name });
      onUploadSuccess(data.url, file.name);
    } catch (err: any) {
      setError(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  if (successParams) {
    return (
      <div className={cn("p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 rounded-lg flex items-center gap-3", className)}>
        <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate">
            {successParams.name}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">Başarıyla yüklendi</p>
        </div>
        <button type="button" onClick={clearFile} className="text-green-600 hover:text-green-800 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
          file ? "border-primary/50 bg-primary/5" : "border-gray-200 hover:border-primary/50 dark:border-gray-800",
          error && "border-red-400 bg-red-50/50 dark:bg-red-900/10"
        )}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {file ? (
          <div className="flex items-center gap-3 w-full">
            <File className="w-8 h-8 text-primary shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <UploadCloud className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              PDF Dosyası Yüklemek İçin Tıklayın
            </p>
            <p className="text-xs text-gray-500 mt-1">Maksimum 5MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && !successParams && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              Sunucuya Yükle
            </>
          )}
        </button>
      )}
    </div>
  );
}
