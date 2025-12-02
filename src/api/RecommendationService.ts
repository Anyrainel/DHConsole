import GameData from '../store/gameData';
import LightConeRecommendCsv from '../assets/LightConeRecommend.csv?raw';
import LightConeRecommendManualCsv from '../assets/LightConeRecommendManual.csv?raw';

class RecommendationService {
    private static recommendationMap: Map<number, number> | null = null;
    private static initPromise: Promise<void> | null = null;

    /**
     * Initializes the recommendation service by loading necessary data and parsing CSVs.
     * This is called automatically by getLightConeRecommendation.
     */
    private static async init(): Promise<void> {
        if (this.recommendationMap !== null) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                // 1. Ensure zh_CN data is loaded for mapping names
                await Promise.all([
                    GameData.loadCharacter('zh_CN'),
                    GameData.loadItem('zh_CN')
                ]);

                // 2. Parse CSVs
                // Manual takes precedence over Auto
                const csvMap = new Map<string, string>(); // AvatarName -> LightConeName

                const parseCsv = (csv: string) => {
                    const lines = csv.split('\n');
                    for (const line of lines) {
                        if (!line || line.startsWith('banner')) continue;
                        const parts = line.split(',');
                        if (parts.length >= 3) {
                            const cName = parts[1].trim();
                            const lcName = parts[2].trim();
                            // Only set if not already present (to respect precedence if we parse manual first)
                            // Or just set it. 
                            // Strategy: Parse Auto first, then Manual overwrites.
                            csvMap.set(cName, lcName);
                        }
                    }
                };

                parseCsv(LightConeRecommendCsv);
                parseCsv(LightConeRecommendManualCsv); // Manual overwrites

                // 3. Build ID -> ID Map
                const newRecommendationMap = new Map<number, number>();
                const avatars = GameData.getAllAvatars('zh_CN');
                const items = GameData.getAllItems('zh_CN');

                // Build a reverse lookup for items: Name -> ID
                // Optimization: Only care about names that appear in our CSV map values? 
                // Or just build all. Building all is safer and not too expensive for 20k items once.
                const itemNameToId = new Map<string, number>();
                for (const [idStr, name] of Object.entries(items)) {
                    // Light Cones are usually in a specific ID range, but name lookup is robust enough.
                    // Trimming is important.
                    itemNameToId.set(name.trim(), Number(idStr));
                }

                // Map Avatar ID -> Light Cone ID
                for (const [avatarIdStr, avatarName] of Object.entries(avatars)) {
                    const cleanAvatarName = avatarName.trim();
                    const targetLcName = csvMap.get(cleanAvatarName);
                    
                    if (targetLcName) {
                        const lcId = itemNameToId.get(targetLcName.trim());
                        if (lcId) {
                            newRecommendationMap.set(Number(avatarIdStr), lcId);
                        } else {
                            console.warn(`RecommendationService: Light Cone "${targetLcName}" for Avatar "${cleanAvatarName}" not found in GameData.`);
                        }
                    }
                }

                this.recommendationMap = newRecommendationMap;
                console.log(`RecommendationService: Initialized with ${this.recommendationMap.size} recommendations.`);

            } catch (error) {
                console.error('RecommendationService: Failed to initialize', error);
                this.recommendationMap = new Map(); // Set empty map to avoid infinite retry loops on failure? 
                // Or maybe allow retry. For now, let's clear the promise so it can retry.
                this.initPromise = null;
                throw error;
            }
        })();

        return this.initPromise;
    }

    /**
     * Gets the recommended Light Cone ID for a given character ID.
     * Returns undefined if no recommendation is available.
     */
    public static async getLightConeRecommendation(characterId: number): Promise<number | undefined> {
        if (this.recommendationMap === null) {
            await this.init();
        }
        return this.recommendationMap?.get(characterId);
    }
}

export default RecommendationService;
