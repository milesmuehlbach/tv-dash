export interface SpotifyImage {
    url: string;
}

export interface SpotifyDevice {
    id: string | null;
    name: string;
    type: string;
    is_active: boolean;
    is_restricted: boolean;
}

export interface SpotifyTrack {
    type: "track";
    id: string;
    name: string;
    duration_ms: number;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: SpotifyImage[];
    };
}

export interface SpotifyEpisode {
    type: "episode";
    id: string;
    name: string;
    duration_ms: number;
    images: SpotifyImage[];
    show?: {
        name: string;
    };
}

export interface SpotifyPlaybackResponse {
    device: SpotifyDevice;
    progress_ms: number | null;
    is_playing: boolean;
    item: SpotifyTrack | SpotifyEpisode | null;
}

export type SpotifyPlayback =
    | {
    status: "ready";
    item: SpotifyTrack | SpotifyEpisode;
    isPlaying: boolean;
    progressMs: number;
    fetchedAt: number;
    device: SpotifyDevice;
}
    | {
    status:
        | "idle"
        | "unconfigured"
        | "authorization-expired"
        | "rate-limited"
        | "error";
    message?: string;
};

