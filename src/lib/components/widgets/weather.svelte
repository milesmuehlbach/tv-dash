<script lang="ts">
    import * as Item from "$lib/components/ui/item"
    import { CloudSun, CloudRain, Wind } from "@lucide/svelte"
    import type {WeatherForecast} from "$lib/types";
    import {onMount} from "svelte";
    import {getWeather} from "$lib/weather";
    import type { Component } from 'svelte';

    let weather = $state<WeatherForecast | null | undefined>(undefined);

    onMount(() => {
        const refreshWeather = async () => {
            weather = await getWeather();
        };

        void refreshWeather();

        const interval = setInterval(() => {
            void refreshWeather();
        }, 60_000);

        return () => {
            clearInterval(interval);
        };
    });

    let StatusIcon = $derived<Component | null | undefined>(weather?.status_icon);</script>

<Item.Root variant="muted">
    {#if weather}
        <div class="flex h-full w-full flex-1">
            <div class="flex flex-col justify-between w-full">
                <div class="flex flex-col gap-1">
                    <span class="text-md">{weather.city}</span>
                    <div class="flex flex-row flex-1 gap-2 h-full">
                        <StatusIcon class="size-9"/>
                        <div class="flex flex-col gap-0 h-full justify-between">
                            <h3 class="text-md font-bold">{weather.temperature}°</h3>
                            <span>{weather.status_string}</span>
                        </div>
                    </div>
                </div>
                <div class="flex w-full flex-row min-w-0 justify-between text-xs">
                    <div class="flex flex-row gap-1 align-middle"><CloudRain size="13"/>{weather.precipitation_chance}%</div>
                    <div class="flex flex-row gap-1 align-middle"><Wind size="13"/>{weather.wind_speed} mph</div>
                </div>
            </div>
        </div>
    {:else}
        <div class="flex flex-col justify-start w-full h-full">
            <h1 class="font-bold text-lg">No Weather Data</h1>
        </div>
    {/if}
</Item.Root>
