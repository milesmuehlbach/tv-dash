<script lang="ts">
    import * as Item from "$lib/components/ui/item"
    import {onDestroy} from "svelte";
    import {Progress} from "$lib/components/ui/progress";
    import { CloudSun } from "@lucide/svelte"

    let now = $state(new Date());
    let timestring = $derived(now.toLocaleTimeString())
    const interval = setInterval(() => {
        now = new Date();
    }, 1000);

    onDestroy(() => clearInterval(interval));
</script>

<div class="m-5 flex h-[calc(100dvh-2.5rem)] flex-col select-none">
    <h2 class="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
        Miles' Workshop
    </h2>
    <div class="mt-5 grid min-h-0 w-full flex-1 grid-cols-2 grid-rows-3 gap-5">
        <Item.Root variant="muted" class="flex flex-row items-center gap-0">
            <Item.Content class="text-4xl font-extrabold tracking-tight lg:text-7xl">
                {timestring}
            </Item.Content>
            <Item.Footer class="text-gray-200 ">
                Sunday, July 20
            </Item.Footer>
        </Item.Root>
        <Item.Root class="p-7 overflow-hidden row-span-2" variant="muted">
            <Item.Content class="flex h-full w-full min-h-0 flex-col gap-5">
                <div class="flex min-h-0 min-w-0 flex-1 gap-5">
                    <div class="h-full aspect-square shrink-0 overflow-hidden rounded-xl">
                        <img
                                src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a8/2e/b4/a82eb490-f30a-a321-461a-0383c88fec95/15UMGIM23316.rgb.jpg/600x600bb.jpg"
                                alt="Album cover"
                                class="block size-full object-cover"
                        />
                    </div>
                    <div class="min-w-0">
                        <div class="space-y-0 mb-2">
                            <h2 class="font-bold mt-3 text-2xl">The Less I Know The Better</h2>
                            <h3 class="text-gray-400 text-md">Tame Impala</h3>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-5">
                    <Progress value={50} class="*:bg-white"/>
                    <div class="flex justify-between items-center w-full gap-4">
                        <div class="text-gray-400 text-center">
                            3:42
                        </div>
                        <div class="text-gray-400 text-center">
                            -0:07
                        </div>
                    </div>
                </div>
            </Item.Content>
        </Item.Root>
        <div class="grid grid-cols-2 grid-rows-1 gap-5">
            <Item.Root variant="muted">
                <div class="flex h-full">
                    <div class="flex flex-col justify-between">
                        <div class="flex flex-col gap-1">
                            <span class="text-md">Prairie Village</span>
                            <div class="flex flex-row flex-1 gap-2 h-full">
                                <CloudSun class="size-9" />
                                <div class="flex flex-col gap-0 h-full justify-between">
                                    <h3 class="text-md font-bold">95°</h3>
                                    <span>few clouds</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-xs">no precipitation within the next hour</div>
                    </div>
                </div>
            </Item.Root>
            <Item.Root variant="muted" class="h-full min-w-0 overflow-hidden gap-1">
                <div class="flex h-full min-w-0 flex-col justify-between">
                    <div class="min-w-0 border-l-2 border-l-red-400 pl-2">
                        <p class="truncate text-xs">Doctors Appointment</p>
                        <p class="text-xs text-gray-400">2PM</p>
                    </div>
                    <div class="min-w-0 border-l-2 border-l-blue-400 pl-2">
                        <p class="truncate text-xs">Robotics</p>
                        <p class="text-xs text-gray-400">6pm-9pm</p>
                    </div>
                    <div class="min-w-0 border-l-2 border-l-green-400 pl-2">
                        <p class="truncate text-xs">Work</p>
                        <p class="text-xs text-gray-400">Tomorrow, 8am-3pm</p>
                    </div>
                </div>
            </Item.Root>
        </div>
        <Item.Root variant="muted" class="h-full min-w-0">
            <div class="flex h-full w-full flex-col gap-4">
                <div class="flex flex-col">
                    <h3 class="font-bold text-md">Proxmox Virtual Environment: Mesa</h3>
                    <div class="flex flex-row gap-3">
                        <p class="text-xs text-gray-400">200d 1h</p>
                        <p class="text-xs text-gray-400">135°F</p>
                    </div>
                </div>
                <div class="flex h-full flex-col justify-between">
                    <div class="flex flex-row gap-4 items-center min-w-0">
                        <p class="text-xs shrink-0">CPU</p>
                        <div class="flex-1">
                            <Progress class="h-1.5" value={25}/>
                        </div>
                        <p class="text-xs shrink-0 text-gray-400">25%</p>
                    </div>
                    <div class="flex flex-row gap-4 items-center min-w-0">
                        <p class="text-xs shrink-0">Memory</p>
                        <div class="flex-1">
                            <Progress class="h-1.5" value={25}/>
                        </div>
                        <p class="text-xs shrink-0 text-gray-400">35/125 GB</p>
                    </div>
                </div>
            </div>
        </Item.Root>
        <Item.Root variant="muted">
            <div class="flex flex-row h-full min-h-0 min-w-0 flex-1 gap-5">
                <div class="h-full aspect-square shrink-0 overflow-hidden rounded-xl">
                    <img
                            src="https://img.magnific.com/free-vector/box-mockup_1017-7633.jpg?semt=ais_hybrid&w=740&q=80"
                            alt="printing model"
                            class="block size-full object-cover bg-gray-400"
                    />
                </div>
                <div class="flex flex-col flex-1 min-w-0 h-full justify-between min-h-0">
                    <p class="text-md font-bold">Example Cube</p>
                    <div class="flex flex-col w-full gap-2">
                        <div class="w-full flex flex-row justify-between">
                            <p class="font-bold">75%</p>
                            <p class="text-">Paused</p>
                        </div>
                        <Progress class="h-1.5" value={75}/>
                        <div class="w-full flex flex-row justify-between text-[10px] text-gray-400">
                            <p>Layer 78/102</p>
                            <p>ETA - 2:56</p>
                        </div>
                    </div>
                </div>
            </div>
        </Item.Root>
    </div>
</div>
