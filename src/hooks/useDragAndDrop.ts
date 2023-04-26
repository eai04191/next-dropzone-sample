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

        const queue: Promise<FileWithRelativePath[]>[] = [];

        for (const item of e.dataTransfer.items) {
            if (item.kind !== "file") continue;
            const entry = item.webkitGetAsEntry();
            if (isFileSystemDirectoryEntry(entry)) {
                // DataTransfer.itemsの処理中に非同期操作を待つとitemsが失われることがあるので、queueに追加してあとで処理する
                // https://stackoverflow.com/a/59249292
                queue.push(traverseDirectory(entry));
            } else {
                const file = item.getAsFile();
                if (!file) continue;
                queue.push(
                    Promise.resolve([{ file, relativePath: file.name }])
                );
            }
        }

        try {
            const files = (await Promise.all(queue)).flat();
            onDrop(files);
        } catch (error) {
            alert(`Error occurred while reading files: ${error}`);
        }
    }

    return {
        isDragging,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
    };
}
