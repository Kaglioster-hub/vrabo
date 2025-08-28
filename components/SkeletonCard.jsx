"use client";

export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div className="h-44 w-full bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}
