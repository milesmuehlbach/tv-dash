import { fetchWeatherApi } from 'openmeteo'
import type {WeatherForecast} from "$lib/types";
import type { Component } from "svelte";
import {
    Cloud,
    CloudDrizzle,
    CloudHail,
    CloudLightning,
    CloudRain,
    CloudSnow,
    CloudSun,
    Snowflake,
    Sun,
    CloudFog, HelpCircle
} from "@lucide/svelte";

const WEATHER_STATUS = {
    0:  { label: 'clear', icon: Sun },
    1:  { label: 'mostly clear', icon: CloudSun },
    2:  { label: 'some clouds', icon: CloudSun },
    3:  { label: 'overcast', icon: Cloud },
    45: { label: 'foggy', icon: CloudFog },
    48: { label: 'foggy', icon: CloudFog },
    51: { label: 'light drizzle', icon: CloudDrizzle },
    53: { label: 'moderate drizzle', icon: CloudDrizzle },
    55: { label: 'dense drizzle', icon: CloudDrizzle },
    56: { label: 'light cold rain', icon: CloudSnow },
    57: { label: 'dense cold rain', icon: CloudSnow },
    61: { label: 'light rain', icon: CloudRain },
    63: { label: 'moderate rain', icon: CloudRain },
    65: { label: 'heavy rain', icon: CloudRain },
    66: { label: 'light cold rain', icon: CloudSnow },
    67: { label: 'heavy cold rain', icon: CloudLightning },
    71: { label: 'light snowfall', icon: Snowflake },
    73: { label: 'moderate snowfall', icon: Snowflake },
    75: { label: 'heavy snowfall', icon: CloudSnow },
    77: { label: 'snowing', icon: Snowflake },
    80: { label: 'light showers', icon: CloudRain },
    81: { label: 'moderate showers', icon: CloudRain },
    82: { label: 'violent showers', icon: CloudRain },
    85: { label: 'light snow', icon: CloudSnow },
    86: { label: 'heavy snow', icon: CloudSnow },
    95: { label: 'thunderstorm', icon: CloudLightning },
    96: { label: 'thunderstorm and light hail', icon: CloudHail },
    99: { label: 'thunderstorm and heavy hail', icon: CloudHail }
};

const params = {
    latitude: import.meta.env.VITE_CUR_LAT,
    longitude: import.meta.env.VITE_CUR_LONG,
    hourly: ["temperature_2m", "apparent_temperature", "weather_code", "precipitation_probability", "wind_speed_10m"],
    timezone: "America/Chicago",
    wind_speed_unit: "mph",
    temperature_unit: "fahrenheit",
    precipitation_unit: "inch",
}
const url = "https://api.open-meteo.com/v1/forecast";

export async function getWeather(): Promise<WeatherForecast | null> {
    try {
        const responses = await fetchWeatherApi(url, params)
        const response = responses[0];
        const hourly = response.hourly()
        if (hourly == null) {
            return null;
        }
        const weatherCode: number | null = hourly.variables(2)!.valuesArray()?.[0] ?? null;

        const status = weatherCode !== null
            ? WEATHER_STATUS[weatherCode as keyof typeof WEATHER_STATUS]
            : { label: 'Unknown', icon: HelpCircle };

        const status_string = status.label;
        const status_icon = status.icon;
        let temperature = hourly.variables(0)!.valuesArray()?.[0] ?? null;
        if (temperature) {
            temperature = Math.round(temperature);
        }
        const precipitation_chance = hourly.variables(3)!.valuesArray()?.[0] ?? null;
        let wind_speed = hourly.variables(4)!.valuesArray()?.[0] ?? null;
        if (wind_speed) {
            wind_speed = Math.round(wind_speed);
        }

        const geoloc_res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${params.latitude}&lon=${params.longitude}&format=jsonv2&zoom=13`)
        const geoloc_json = await geoloc_res.json()

        const city = geoloc_json.name ?? null;

        return {
            temperature: temperature,
            status_string: status_string,
            status_icon: status_icon,
            precipitation_chance: precipitation_chance,
            wind_speed: wind_speed,
            city: city,
        }

    } catch (e) {
        console.error(e);
        return null;
    }
}