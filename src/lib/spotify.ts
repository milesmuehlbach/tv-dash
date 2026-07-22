import type { SpotifyPlaybackResponse } from "./types";

const accountsUrl = "https://accounts.spotify.com/api/token";
const apiUrl = "https://api.spotify.com/v1";

interface SpotifyClientConfig {
    clientId: string;
    refreshToken: string;
}

interface AccessTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
}

export class SpotifyApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly retryAfterSeconds?: number,
    ) {
        super(message);
    }
}

export function createSpotifyClient(
    config: SpotifyClientConfig,
    fetchImplementation: typeof fetch = fetch,
) {
    let accessToken: string | null = null;
    let accessTokenExpiresAt = 0;
    let pendingRefresh: Promise<string> | null = null;

    async function refreshAccessToken(): Promise<string> {
        if (accessToken && Date.now() < accessTokenExpiresAt - 60_000) {
            return accessToken;
        }

        if (pendingRefresh) {
            return pendingRefresh;
        }

        pendingRefresh = (async () => {
            const response = await fetchImplementation(accountsUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: config.clientId,
                    grant_type: "refresh_token",
                    refresh_token: config.refreshToken,
                }),
            });

            const body = await response.json();

            if (!response.ok) {
                throw new SpotifyApiError(
                    body.error_description ?? body.error ?? "Token refresh failed.",
                    response.status,
                );
            }

            const token = body as AccessTokenResponse;
            accessToken = token.access_token;
            accessTokenExpiresAt = Date.now() + token.expires_in * 1000;

            return accessToken;
        })();

        try {
            return await pendingRefresh;
        } finally {
            pendingRefresh = null;
        }
    }

    async function request<T>(
        path: string,
        init: RequestInit = {},
        allowRetry = true,
    ): Promise<T | null> {
        const token = await refreshAccessToken();

        const response = await fetchImplementation(`${apiUrl}${path}`, {
            ...init,
            headers: {
                ...init.headers,
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 401 && allowRetry) {
            accessToken = null;
            accessTokenExpiresAt = 0;
            return request<T>(path, init, false);
        }

        if (response.status === 204) {
            return null;
        }

        if (!response.ok) {
            let message = `Spotify request failed with ${response.status}.`;

            try {
                const body = await response.json();
                message = body.error?.message ?? message;
            } catch {
                // Spotify did not return JSON.
            }

            const retryAfter = response.headers.get("Retry-After");

            throw new SpotifyApiError(
                message,
                response.status,
                retryAfter ? Number(retryAfter) : undefined,
            );
        }

        return response.json() as Promise<T>;
    }

    return {
        getPlaybackState() {
            return request<SpotifyPlaybackResponse>(
                "/me/player?additional_types=episode",
            );
        },

        play() {
            return request<void>("/me/player/play", { method: "PUT" });
        },

        pause() {
            return request<void>("/me/player/pause", { method: "PUT" });
        },

        previous() {
            return request<void>("/me/player/previous", { method: "POST" });
        },

        next() {
            return request<void>("/me/player/next", { method: "POST" });
        },
    };
}

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? "";
const refreshToken = import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN ?? "";

export const spotifyConfigured = Boolean(clientId && refreshToken);

export const spotify = createSpotifyClient({
    clientId,
    refreshToken,
});
