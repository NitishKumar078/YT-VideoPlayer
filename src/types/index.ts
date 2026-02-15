export interface Video {
    title: string;
    mediaUrl: string;
    mediaType: "YOUTUBE" | "VIDEO";
    thumbnailUrl: string;
    slug: string;
    duration?: string;
}

export interface CategoryData {
    category: {
        slug: string;
        name: string;
        iconUrl: string;
    };
    contents: Video[];
}

export type Categories = CategoryData[];
