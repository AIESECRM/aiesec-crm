"use client";

import { useState, useRef } from "react";
import { UploadCloud, File, X, CheckCircle2, AlertCircle, Loader2, Upload, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUploadSuccess: (url: string, name: string) => void;
  className?: string;
}

export function FileUpload({ onUploadSuccess, className }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

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
    setUploadedUrl(null);
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

      setUploadedUrl(data.url);
      // We don't call onUploadSuccess here yet, we wait for the user to click the final confirm button
    } catch (err: any) {
      setError(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer",
          file ? "border-[#037EF3]/50 bg-[#037EF3]/5" : "border-gray-200 hover:border-[#037EF3]/50 dark:border-gray-800 hover:bg-muted/30",
          error && "border-red-400 bg-red-50/50"
        )}
        onClick={() => !file && !uploadedUrl && fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading || !!uploadedUrl}
        />

        {file ? (
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center shrink-0 border border-border">
              <File className="w-6 h-6 text-[#037EF3]" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!isUploading && !uploadedUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[#037EF3]/10 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <UploadCloud className="w-6 h-6 text-[#037EF3]" />
            </div>
            <p className="text-sm font-bold text-foreground">
              PDF Dosyası Seçin
            </p>
            <p className="text-xs text-muted-foreground mt-2">Sürükle bırak veya tıkla (Maks. 5MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col items-center">
        {uploadedUrl ? (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 border-2 border-green-200 dark:border-green-800">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">Yükleme Başarılı!</p>
            <p className="text-xs text-muted-foreground mb-6">Dosyanız güvenle sunucuya aktarıldı.</p>
            <button
              type="button"
              onClick={() => onUploadSuccess(uploadedUrl, file?.name || "pdf_dosyasi.pdf")}
              className="w-full py-4 px-6 bg-[#037EF3] hover:bg-[#0266c8] text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-wide"
            >
              <Upload size={18} /> Veritabanına Kaydet ve Bitir
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!file || isUploading}
            onClick={handleUpload}
            className={cn(
              "w-full py-4 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg uppercase tracking-wide",
              !file || isUploading
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-[#037EF3] hover:bg-[#0266c8] text-white shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Döküman Yükleniyor...
              </>
            ) : (
              <>
                <Upload size={18} /> Bulut Sunucuya Gönder
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
