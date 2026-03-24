import { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../config/api";

interface UploadPhotosOriginalesProps {
  accesId: string;
  codeAcces: string;
  onUploadComplete: () => void;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function UploadPhotosOriginales({
  accesId,
  codeAcces,
  onUploadComplete,
}: UploadPhotosOriginalesProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const newFiles: FileWithProgress[] = selectedFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];

      if (fileData.status === "success") continue;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading", progress: 0 } : f,
        ),
      );

      try {
        const formData = new FormData();
        formData.append("photo", fileData.file);
        formData.append("accesId", accesId);
        formData.append("codeAcces", codeAcces);

        const uploadResponse = await axios.post(
          `${API_URL}/api/ecrin/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentComplete = Math.round(
                  (progressEvent.loaded / progressEvent.total) * 100,
                );
                setFiles((prev) =>
                  prev.map((f, idx) =>
                    idx === i ? { ...f, progress: percentComplete } : f,
                  ),
                );
              }
            },
          },
        );

        if (!uploadResponse.data.success) {
          throw new Error(
            uploadResponse.data.message || "Erreur lors de l'upload",
          );
        }

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "success", progress: 100 } : f,
          ),
        );
      } catch (error: unknown) {
        console.error("Erreur upload:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || "Erreur lors de l'upload";

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "error",
                  error: errorMessage,
                }
              : f,
          ),
        );
      }
    }

    setIsUploading(false);
    onUploadComplete();
  };

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
  const uploadedCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="bg-[#232336] p-6 rounded-lg border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#ffe992]">
          Photos Originales (R2)
        </h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-[#ffe992] hover:bg-[#d6c487] text-black font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={18} />
          Sélectionner photos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.raw,.cr2,.nef,.arw,.dng"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <>
          <div className="bg-black/20 p-4 rounded border border-white/5">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Total</p>
                <p className="text-white font-bold">{files.length} fichiers</p>
              </div>
              <div>
                <p className="text-gray-400">Taille</p>
                <p className="text-white font-bold">
                  {formatFileSize(totalSize)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Statut</p>
                <p className="text-white font-bold">
                  {uploadedCount > 0 && (
                    <span className="text-green-400">
                      ✓ {uploadedCount} uploadés
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="text-red-400 ml-2">
                      ✗ {errorCount} erreurs
                    </span>
                  )}
                  {uploadedCount === 0 && errorCount === 0 && (
                    <span className="text-gray-400">En attente</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-[#ffe992]/30 scrollbar-track-transparent">
            {files.map((fileData, index) => (
              <div
                key={index}
                className="bg-black/20 p-3 rounded border border-white/5 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {fileData.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileData.file.size)}
                  </p>
                </div>

                {fileData.status === "pending" && (
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                )}

                {fileData.status === "uploading" && (
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-black/40 rounded-full h-2">
                      <div
                        className="bg-[#ffe992] h-2 rounded-full transition-all"
                        style={{ width: `${fileData.progress}%` }}
                      />
                    </div>
                    <Loader className="animate-spin text-[#ffe992]" size={18} />
                  </div>
                )}

                {fileData.status === "success" && (
                  <CheckCircle className="text-green-400" size={18} />
                )}

                {fileData.status === "error" && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-red-400" size={18} />
                    <span className="text-xs text-red-400">
                      {fileData.error}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={uploadFiles}
              disabled={
                isUploading || files.every((f) => f.status === "success")
              }
              className="flex-1 bg-[#ffe992] hover:bg-[#d6c487] text-black font-bold py-3 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Uploader vers R2
                </>
              )}
            </button>

            {!isUploading && (
              <button
                type="button"
                onClick={() => setFiles([])}
                className="px-6 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded transition-all border border-white/10"
              >
                Tout effacer
              </button>
            )}
          </div>
        </>
      )}

      {files.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded">
          <Upload className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400 mb-2">Aucune photo sélectionnée</p>
          <p className="text-xs text-gray-600">
            Formats acceptés : JPG, PNG, RAW, CR2, NEF, ARW, DNG, TIFF
          </p>
        </div>
      )}
    </div>
  );
}
