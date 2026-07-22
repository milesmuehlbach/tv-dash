<script lang="ts">
    import * as Item from "$lib/components/ui/item"
    import { Progress } from "$lib/components/ui/progress"
    import { Music } from "@lucide/svelte";
    import { onMount } from 'svelte';
    import {
        spotify,
        spotifyConfigured,
        SpotifyApiError
    } from "$lib/spotify"
    import type {
        SpotifyEpisode,
        SpotifyPlayback,
        SpotifyTrack
    } from "$lib/types";

    let playback = $state<SpotifyPlayback>(
        spotifyConfigured ? { status: 'idle' }
            : {
            status: "unconfigured",
            message: "Spotify has not been configured."
            }
    )

    let notice = $state<string | null>(null);
    let commandPending = $state(false);
    let clock = $state(Date.now())

    const durationMs = $derived(
        playback.status === "ready" ? playback.item.duration_ms : 0
    );

    const displayedProgressMs = $derived.by(() => {
        if (playback.status !== "ready") return 0;

        const elapsed = playback.isPlaying
            ? Math.max(0, clock - playback.fetchedAt)
            : 0;

        return Math.min(
            playback.item.duration_ms,
            playback.progressMs + elapsed,
        );
    });

    const progressPercent = $derived(
        durationMs > 0 ? (displayedProgressMs / durationMs) * 100 : 0,
    );

    function artwork(item: SpotifyTrack | SpotifyEpisode) {
        return item.type === "track"
            ? item.album.images[0]?.url
            : item.images[0]?.url;
    }

    function subtitle(item: SpotifyTrack | SpotifyEpisode) {
        return item.type === "track"
            ? item.artists.map((artist) => artist.name).join(", ")
            : item.show?.name ?? "Podcast episode";
    }

    function formatTime(milliseconds: number) {
        const seconds = Math.max(0, Math.floor(milliseconds / 1000));
        const minutes = Math.floor(seconds / 60);
        return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
    }

    function mapError(error: unknown): SpotifyPlayback {
        if (error instanceof SpotifyApiError) {
            if (error.status === 400 || error.status === 401) {
                return {
                    status: "authorization-expired",
                    message: "Spotify authorization has expired. Run the setup script again.",
                };
            }

            if (error.status === 429) {
                return {
                    status: "rate-limited",
                    message: `Spotify rate limited the dashboard${
                        error.retryAfterSeconds
                            ? ` for ${error.retryAfterSeconds} seconds`
                            : ""
                    }.`,
                };
            }

            if (error.status === 403) {
                return {
                    status: "error",
                    message: "Spotify rejected playback control. Check Premium status and scopes.",
                };
            }
        }

        return {
            status: "error",
            message: error instanceof Error ? error.message : "Spotify is unavailable.",
        };
    }

    async function refreshPlayback() {
        if (!spotifyConfigured) return;

        try {
            const response = await spotify.getPlaybackState();

            if (!response?.item) {
                playback = {
                    status: "idle",
                    message: "Nothing is currently playing.",
                };
                notice = null;
                return;
            }

            playback = {
                status: "ready",
                item: response.item,
                isPlaying: response.is_playing,
                progressMs: response.progress_ms ?? 0,
                fetchedAt: Date.now(),
                device: response.device,
            };

            notice = null;
        } catch (error) {
            if (playback.status === "ready") {
                notice =
                    error instanceof Error
                        ? error.message
                        : "Spotify is temporarily unavailable.";
            } else {
                playback = mapError(error);
            }
        }
    }

    async function runCommand(command: () => Promise<unknown>) {
        if (commandPending || playback.status !== "ready") return;

        commandPending = true;
        notice = null;

        try {
            await command();
            await refreshPlayback();
        } catch (error) {
            notice =
                mapError(error).status ?? "Spotify could not complete the command.";
        } finally {
            commandPending = false;
        }
    }

    onMount(() => {
        void refreshPlayback();

        const pollingInterval = setInterval(refreshPlayback, 5_000);
        const progressInterval = setInterval(() => {
            clock = Date.now();
        }, 1_000);

        return () => {
            clearInterval(pollingInterval);
            clearInterval(progressInterval);
        };
    });

</script>

<Item.Root class="p-7 overflow-hidden row-span-2" variant="muted">
    <Item.Content class="flex h-full w-full min-h-0 flex-col gap-5">
        {#if playback.status === "ready"}
            <div class="flex min-h-0 min-w-0 flex-1 gap-5">
                <div class="h-full aspect-square shrink-0 overflow-hidden rounded-xl">
                    {#if artwork(playback.item)}
                        <img
                                src={artwork(playback.item)}
                                alt="Album cover"
                                class="block size-full object-cover"
                        />
                    {/if}
                </div>
                <div class="min-w-0">
                    <div class="space-y-0 mb-2">
                        <h2 class="font-bold mt-3 text-2xl">{playback.item.name}</h2>
                        <h3 class="text-gray-400 text-md">{subtitle(playback.item)}</h3>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-5">
                <Progress value={progressPercent} class="*:bg-white"/>
                <div class="flex justify-between items-center w-full gap-4">
                    <div class="text-gray-400 text-center">
                        {formatTime(displayedProgressMs)}
                    </div>
                    <div class="text-gray-400 text-center">
                        -{formatTime(durationMs - displayedProgressMs)}
                    </div>
                </div>
                {#if notice}
                    <p class="text-xs text-amber-400">{notice}</p>
                {/if}
            </div>
        {:else}
            <div class="flex min-h-0 min-w-0 flex-1 gap-5">
                <div
                    class="flex aspect-square h-full shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/40 text-muted-foreground"
                    aria-hidden="true"
                >
                    <Music class="size-1/3" strokeWidth={1.5} />
                </div>
                <div class="flex min-w-0 flex-col">
                    <div class="min-w-0">
                        <div class="space-y-0 mb-2">
                            <h2 class="font-bold mt-3 text-2xl">Nothing Playing</h2>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-5 text-muted-foreground">
                <Progress value={0} class="*:bg-white"/>
                <div class="flex justify-between items-center w-full gap-4">
                    <div class="text-center">
                        --:--
                    </div>
                    <div class="text-center">
                        --:--
                    </div>
                </div>
                {#if notice}
                    <p class="text-xs text-amber-400">{notice}</p>
                {/if}
            </div>
        {/if}

    </Item.Content>
</Item.Root>
