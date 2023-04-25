import clsx from "clsx";
import { useState } from "react";

import { FileWithRelativePath, useDragAndDrop } from "@/hooks/useDragAndDrop";

export function DragAndDropColumn({ title }: { title: string }) {
    const [uploadedFiles, setUploadedFiles] = useState<FileWithRelativePath[]>(
        []
    );

    function onDrop(files: FileWithRelativePath[]) {
        setUploadedFiles((prev) => [...prev, ...files]);
    }

    const {
        isDragging,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
    } = useDragAndDrop(onDrop);

    function handleClearUploadedFiles() {
        setUploadedFiles([]);
    }

    return (
        <div
            className={clsx(
                "relative overflow-hidden rounded-lg border border-gray-300 bg-gray-100 p-4",
                isDragging && "outline-dashed outline-4 outline-blue-400"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div
                className={clsx(
                    "flex flex-col gap-4",
                    isDragging && "pointer-events-none"
                )}
            >
                <div className="flex justify-between">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <button
                        className="rounded bg-gray-200 p-1 px-2"
                        onClick={handleClearUploadedFiles}
                        aria-label="Clear uploaded files"
                    >
                        X
                    </button>
                </div>
                <ul className="flex list-outside list-decimal flex-col gap-1 ps-7">
                    {uploadedFiles.map((fileWithRelativePath) => (
                        <li key={fileWithRelativePath.relativePath}>
                            {fileWithRelativePath.relativePath}
                            {/* Fileなのでサムネイル表示などもできるはず */}
                            {fileWithRelativePath.file.type ===
                                "image/jpeg" && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={URL.createObjectURL(
                                        fileWithRelativePath.file
                                    )}
                                    alt={fileWithRelativePath.relativePath}
                                    className="h-20 w-20 rounded object-cover"
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div
                className={clsx(
                    "pointer-events-none",
                    "absolute inset-0 flex items-center justify-center bg-white/75 p-4 text-center",
                    !isDragging && "hidden"
                )}
            >
                <span className="[&_span]:inline-block">
                    <span>ここに</span>
                    <span>ファイルを</span>
                    <span>アップロード</span>
                    <span>します</span>
                </span>
            </div>
        </div>
    );
}
