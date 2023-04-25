/**
 * FileSystemEntryがFileSystemDirectoryEntryであるかを判定する型ガード
 */
export function isFileSystemDirectoryEntry(
    entry: FileSystemEntry | null
): entry is FileSystemDirectoryEntry {
    return entry?.isDirectory === true;
}

/**
 * FileSystemEntryがFileSystemFileEntryであるかを判定する型ガード
 */
export function isFileSystemFileEntry(
    entry: FileSystemEntry | null
): entry is FileSystemFileEntry {
    return entry?.isFile === true;
}
