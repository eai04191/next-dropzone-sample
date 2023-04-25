import clsx from "clsx";
import { useState } from "react";

type FileWithRelativePath = {
    file: File;
    /**
     * File.webkitRelativePathとほぼ同じだが、それはgetterしかなく再定義できないので別のプロパティで定義する
     */
    relativePath: string;
};

/**
 * FileSystemEntryがFileSystemDirectoryEntryであるかを判定する型ガード
 */
function isFileSystemDirectoryEntry(
    entry: FileSystemEntry | null
): entry is FileSystemDirectoryEntry {
    return entry?.isDirectory === true;
}

/**
 * FileSystemEntryがFileSystemFileEntryであるかを判定する型ガード
 */
function isFileSystemFileEntry(
    entry: FileSystemEntry | null
): entry is FileSystemFileEntry {
    return entry?.isFile === true;
}

function Row({ title }: { title: string }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<FileWithRelativePath[]>(
        []
    );

    /**
     * FileSystemDirectoryEntryからディレクトリ構造を再帰的に読み込む
     */
    async function traverseDirectory(
        entry: FileSystemDirectoryEntry
    ): Promise<FileWithRelativePath[]> {
        if (!isFileSystemDirectoryEntry(entry)) {
            throw new Error("entry must be directory");
        }

        const result: FileWithRelativePath[] = [];

        async function getEntries(dirEntry: FileSystemDirectoryEntry) {
            const entries: FileSystemEntry[] = [];
            const reader = dirEntry.createReader();

            // readEntriesは100件ずつしか取得できないので、全部取得するまで繰り返す
            while (true) {
                const batch = await new Promise<FileSystemEntry[]>((resolve) =>
                    reader.readEntries(resolve)
                );
                if (batch.length === 0) break;
                entries.push(...batch);
            }

            return entries;
        }

        async function getFile(fileEntry: FileSystemFileEntry) {
            return new Promise<File>((resolve) => fileEntry.file(resolve));
        }

        async function readEntries(
            dirEntry: FileSystemDirectoryEntry
        ): Promise<void> {
            const entries = await getEntries(dirEntry);

            for (const entry of entries) {
                if (isFileSystemFileEntry(entry)) {
                    const file = await getFile(entry);
                    result.push({ file, relativePath: entry.fullPath });
                } else if (isFileSystemDirectoryEntry(entry)) {
                    await readEntries(entry);
                }
            }
        }

        await readEntries(entry);

        return result;
    }

    function handleDragEnter() {
        setIsDragging(true);
    }
    function handleDragLeave() {
        setIsDragging(false);
    }
    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }
    async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        // 新しいタブを開くのを防ぐ
        e.preventDefault();
        setIsDragging(false);

        const files: FileWithRelativePath[] = [];
        const items = Array.from(e.dataTransfer.items);

        for (const item of items) {
            if (item.kind !== "file") continue;
            const entry = item.webkitGetAsEntry();
            if (isFileSystemDirectoryEntry(entry)) {
                const directoryFiles = await traverseDirectory(entry);
                files.push(...directoryFiles);
            } else {
                const file = item.getAsFile();
                if (!file) continue;
                files.push({ file, relativePath: file.name });
            }
        }

        setUploadedFiles(files);
    }

    function handleClearItems() {
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
                        onClick={handleClearItems}
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

export default function Home() {
    const [rowCount, setRowCount] = useState(5);

    function handleAddRow() {
        setRowCount(rowCount + 1);
    }
    function handleRemoveRow() {
        if (rowCount === 0) return;
        setRowCount(rowCount - 1);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between gap-4 p-10 pt-6">
            <div className="flex w-full items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">dropzone</h1>
                <div className="flex items-center gap-3">
                    <span>Row Count: </span>
                    <button
                        className="rounded bg-gray-100 p-2 px-6"
                        onClick={handleAddRow}
                    >
                        +
                    </button>
                    <button
                        className="rounded bg-gray-100 p-2 px-6"
                        onClick={handleRemoveRow}
                    >
                        -
                    </button>
                </div>
            </div>

            <div className="grid h-full w-full flex-1 auto-cols-fr grid-flow-col items-stretch gap-4">
                {[...Array(rowCount)].map((_, i) => (
                    <Row key={i} title={`Row ${i + 1}`} />
                ))}
            </div>
        </main>
    );
}
