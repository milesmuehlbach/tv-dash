<script lang="ts">
    import * as Item from "$lib/components/ui/item"
    import {onDestroy} from "svelte";
    import {Progress} from "$lib/components/ui/progress";

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
            <Item.Header class="text-sm text-gray-400">
                Current Time
            </Item.Header>
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
    </div>
</div>
