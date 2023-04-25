import { FileWithRelativePath } from "@/hooks/useDragAndDrop";
import {
    isFileSystemDirectoryEntry,
    isFileSystemFileEntry,
} from "@/utils/typeGuard";

/**
 * FileSystemDirectoryEntryからディレクトリ構造を再帰的に読み込む
 */
export async function traverseDirectory(
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
