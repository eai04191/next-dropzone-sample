import { useState } from "react";

import { traverseDirectory } from "@/utils/traverseDirectory";
import { isFileSystemDirectoryEntry } from "@/utils/typeGuard";

export type FileWithRelativePath = {
    file: File;
    /**
     * File.webkitRelativePathとほぼ同じだが、それはgetterしかなく再定義できないので別のプロパティで保持する
     */
    relativePath: string;
};

/**
 * ファイルをドラッグアンドドロップで読み込むためのフック
 *
 * @param onDrop - ドロップされたファイルを受け取るコールバック
 * @returns ドラッグアンドドロップの状態とイベントハンドラ
 */
export function useDragAndDrop(
    onDrop: (files: FileWithRelativePath[]) => void
) {
    const [isDragging, setIsDragging] = useState(false);

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
                try {
                    const directoryFiles = await traverseDirectory(entry);
                    files.push(...directoryFiles);
                } catch (error) {
                    alert(
                        `Error occurred while reading ${entry.fullPath}: ${error}`
                    );
                }
            } else {
                const file = item.getAsFile();
                if (!file) continue;
                files.push({ file, relativePath: file.name });
            }
        }

        onDrop(files);
    }

    return {
        isDragging,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
    };
}
