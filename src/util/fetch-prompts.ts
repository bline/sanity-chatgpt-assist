import { SanityClient } from "sanity";
import { ChatGPTPromptGroup } from "../types";

// Singleton cache with reactive updates
export class PromptCache {
    private cache: ChatGPTPromptGroup[] | null = null;
    private subscribers: ((data: ChatGPTPromptGroup[]) => void)[] = [];
    private lastFetch: number = 0;

    private static instance: PromptCache;

    private constructor() {}

    static getInstance() {
        if (!PromptCache.instance) {
            PromptCache.instance = new PromptCache();
        }
        return PromptCache.instance;
    }

    async fetchPrompts(client: SanityClient) {
        const now = Date.now();
        // Invalidate cache every 5 minutes
        if (!this.cache || now - this.lastFetch > 5 * 60 * 1000) {
            const query = `
                *[_type == "gpt_prompt_group" && !(_id in path("drafts.**"))]{
                    _id,
                    name,
                    exclusive,
                    weight,
                    prompts[]->{_id, name, text}
                }|order(weight asc)
            `;
            this.cache = await client.fetch<ChatGPTPromptGroup[]>(query);
            this.lastFetch = now;
            this.notifySubscribers();
        }
        return this.cache;
    }

    subscribe(callback: (data: ChatGPTPromptGroup[]) => void) {
        this.subscribers.push(callback);
        // Immediately call the subscriber with current cache if available
        if (this.cache) callback(this.cache);
        return () => {
            this.subscribers = this.subscribers.filter((cb) => cb !== callback);
        };
    }

    private notifySubscribers() {
        this.subscribers.forEach((callback) => callback(this.cache!));
    }
}
