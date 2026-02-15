"use client";

import { cn } from "@/lib/utils";
import { CategoryData } from "@/types";

interface CategoryPillsProps {
    categories: CategoryData[];
    selectedCategory: string;
    onSelect: (slug: string) => void;
}

export function CategoryPills({
    categories,
    selectedCategory,
    onSelect,
}: CategoryPillsProps) {
    return (
        <div className="flex overflow-x-auto gap-3 p-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 scrollbar-hide">
            <button
                onClick={() => onSelect("all")}
                className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    selectedCategory === "all"
                        ? "bg-white text-black"
                        : "bg-neutral-800 text-white hover:bg-neutral-700"
                )}
            >
                All
            </button>
            {categories.map(({ category }) => (
                <button
                    key={category.slug}
                    onClick={() => onSelect(category.slug)}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                        selectedCategory === category.slug
                            ? "bg-white text-black"
                            : "bg-neutral-800 text-white hover:bg-neutral-700"
                    )}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
}
