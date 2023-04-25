import { useState } from "react";

import { DragAndDropColumn } from "@/components/DragAndDropColumn";

export default function Home() {
    const [columnCount, setColumnCount] = useState(5);

    function handleAddColumn() {
        setColumnCount(columnCount + 1);
    }
    function handleRemoveColumn() {
        if (columnCount === 0) return;
        setColumnCount(columnCount - 1);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between gap-4 p-10 pt-6">
            <div className="flex w-full items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">dropzone</h1>
                <div className="flex items-center gap-3">
                    <span>Column Count: </span>
                    <button
                        className="rounded bg-gray-100 p-2 px-6"
                        onClick={handleAddColumn}
                        aria-label="Add column"
                    >
                        +
                    </button>
                    <button
                        className="rounded bg-gray-100 p-2 px-6"
                        onClick={handleRemoveColumn}
                        aria-label="Remove column"
                    >
                        -
                    </button>
                </div>
            </div>

            <div className="grid h-full w-full flex-1 auto-cols-fr grid-flow-col items-stretch gap-4">
                {[...Array(columnCount)].map((_, i) => (
                    <DragAndDropColumn key={i} title={`Column ${i + 1}`} />
                ))}
            </div>
        </main>
    );
}
