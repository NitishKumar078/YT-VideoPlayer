"use client";

import { CategoryPills } from "@/components/home/CategoryPills";
import { VideoCard } from "@/components/home/VideoCard";
import { categories } from "@/lib/data";
import { useState, useMemo } from "react";

export default function Home() {
    const [selectedCategory, setSelectedCategory] = useState("all");

    const filteredVideos = useMemo(() => {
        if (selectedCategory === "all") {
            return categories.flatMap((cat) =>
                cat.contents.map(video => ({ ...video, categoryName: cat.category.name }))
            );
        }
        const category = categories.find((c) => c.category.slug === selectedCategory);
        return category
            ? category.contents.map(video => ({ ...video, categoryName: category.category.name }))
            : [];
    }, [selectedCategory]);

    return (
        <main className="min-h-screen pb-24 bg-background">
            <CategoryPills
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-2">
                {filteredVideos.map((video) => (
                    <VideoCard
                        key={video.slug}
                        video={video}
                        categoryName={video.categoryName}
                    />
                ))}
            </div>
        </main>
    );
}
