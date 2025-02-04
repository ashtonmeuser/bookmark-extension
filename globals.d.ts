declare global {
    const css: string;
    const bookmarks: Bookmark[];
}

interface Bookmark {
    title: string;
    url: string;
}

export {}; // Ensures it's treated as a module
