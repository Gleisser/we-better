export interface Image {
    id: number;
    documentId: string;
    title: string;
    src: string;
    alt: string;
    img: {
        formats: {
            large: {
                url: string;
            };
            medium: {
                url: string;
            };
            small: {
                url: string;
            };
        };
    };
}

export interface ThumbnailImage {
    id: number;
    documentId: string;
    title: string;
    src: string;
    alt: string;
    img: {
        formats: {
            thumbnail: {
                url: string;
            };
        };
    };
}

export interface TopLevelImage {
    id: number;
    documentId: string;
    name: string;
    alternativeText: string;
    caption: string;
    width: number;
    height: number;
    src: string;
    alt: string;
    url: string;
    formats: {
        thumbnail: {
            url: string;
        };
    };
}