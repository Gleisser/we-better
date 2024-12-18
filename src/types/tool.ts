export interface ToolVideoSrc {
    id: string;
    name: string;
    video: {
        url: string;
    }[]
}

export interface ToolTab {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    videoSrc: ToolVideoSrc;
}

export interface Tool {
    id: string;
    title: string;
    tabs: ToolTab[];
}

export interface ToolResponse {
    data: Tool;
    meta: Record<string, unknown>;
} 