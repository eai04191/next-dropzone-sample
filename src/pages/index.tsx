import clsx from "clsx";
import { useState } from "react";

function Row({ title }: { title: string }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    function handleDragEnter() {
        setIsDragging(true);
    }
    function handleDragLeave() {
        setIsDragging(false);
    }
    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }
    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        // 新しいタブを開くのを防ぐ
        e.preventDefault();

        const files = Array.from(e.dataTransfer.files);
        setUploadedFiles(files);

        // debugger;
        setIsDragging(false);
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
                    {uploadedFiles.map((file) => (
                        <li key={file.name}>{file.name}</li>
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
