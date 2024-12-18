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