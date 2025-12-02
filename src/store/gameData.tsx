import CommandService from "../api/CommandService";

enum GameEntity {
  Avatar = "Avatar",
  Item = "Item",
  MainMission = "MainMission",
  SubMission = "SubMission",
}

class GameData {
  static entities: Record<string, Record<GameEntity, Record<number, string>>> = {}; // Map of Language to EntityType to ID to name
  static entityTypes: Record<number, GameEntity> = {}; // Map of ID to entity type
  static loadedEntities: Set<string> = new Set();
  static loadingPromises: Map<string, Promise<void>> = new Map();
  static relicTypes: Record<number, number[]> = {};

  private static getKey(entity: GameEntity, language: string): string {
    return `${entity}:${language}`;
  }

  public static async loadCharacter(language: string): Promise<void> {
    const key = this.getKey(GameEntity.Avatar, language);
    if (this.loadedEntities.has(key)) {
      return;
    }
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const promise = (async () => {
      try {
        const parsed = await CommandService.loadAvatarGameText(language);
        this.storeData(parsed, GameEntity.Avatar, language);
      } finally {
        this.loadingPromises.delete(key);
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  public static async loadItem(language: string): Promise<void> {
    const key = this.getKey(GameEntity.Item, language);
    if (this.loadedEntities.has(key)) {
      return;
    }
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const promise = (async () => {
      try {
        const parsed = await CommandService.loadItemGameText(language);
        this.storeData(parsed, GameEntity.Item, language);
      } finally {
        this.loadingPromises.delete(key);
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  public static async loadMainMission(language: string): Promise<void> {
    const key = this.getKey(GameEntity.MainMission, language);
    if (this.loadedEntities.has(key)) {
      return;
    }
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const promise = (async () => {
      try {
        const parsed = await CommandService.loadMainMissionGameText(language);
        this.storeData(parsed, GameEntity.MainMission, language);
      } finally {
        this.loadingPromises.delete(key);
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  public static async loadSubMission(language: string): Promise<void> {
    const key = this.getKey(GameEntity.SubMission, language);
    if (this.loadedEntities.has(key)) {
      return;
    }
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const promise = (async () => {
      try {
        const parsed = await CommandService.loadSubMissionGameText(language);
        this.storeData(parsed, GameEntity.SubMission, language);
      } finally {
        this.loadingPromises.delete(key);
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  public static async loadRelicTypes(): Promise<void> {
    const key = "RelicTypes";
    if (Object.keys(this.relicTypes).length > 0) {
      return;
    }
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const promise = (async () => {
      try {
        const parsed = await CommandService.loadRelicTypes();
        for (const [key, value] of Object.entries(parsed)) {
          if (!this.relicTypes[value]) {
            this.relicTypes[value] = [];
          }
          this.relicTypes[value].push(parseInt(key, 10));
        }
      } finally {
        this.loadingPromises.delete(key);
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  private static storeData(data: Record<number, string>, entity: GameEntity, language: string): void {
    for (const [key, value] of Object.entries(data)) {
      GameData.set(parseInt(key, 10), value.replace(/<\/?unbreak>/g, ''), entity, language);
    }
    this.loadedEntities.add(this.getKey(entity, language));
    console.log('Loaded', Object.keys(data).length, 'entities for', entity, 'in', language);
  }

  public static get(key: number, language: string): string {
    const isLoading = Array.from(this.loadingPromises.keys()).some(k => k.endsWith(`:${language}`));

    if (!this.entities[language]) {
      return isLoading ? "LOADING" : "ERROR_NOT_LOADED";
    }
    if (!this.entityTypes[key] || !this.entities[language][this.entityTypes[key]]) {
      return isLoading ? "LOADING" : "ERROR_NOT_FOUND";
    }
    return this.entities[language][this.entityTypes[key]][key];
  }

  public static getType(key: number): GameEntity {
    return this.entityTypes[key];
  }

  public static set(key: number, value: string, type: GameEntity, language: string): void {
    if (!this.entities[language]) {
      this.entities[language] = {
        Avatar: {},
        Item: {},
        MainMission: {},
        SubMission: {},
      };
    }
    if (!this.entities[language][type]) {
      this.entities[language][type] = {};
    }
    this.entities[language][type][key] = value;
    this.entityTypes[key] = type;
  }

  public static getAllAvatars(language: string): Record<number, string> {
    return this.getAllTextForType(GameEntity.Avatar, language);
  }

  public static getAllItems(language: string): Record<number, string> {
    return this.getAllTextForType(GameEntity.Item, language);
  }

  public static getAllMainMissions(language: string): Record<number, string> {
    return this.getAllTextForType(GameEntity.MainMission, language);
  }

  public static getAllSubMissions(language: string): Record<number, string> {
    return this.getAllTextForType(GameEntity.SubMission, language);
  }

  public static getAllTextForType(type: GameEntity, language: string): Record<number, string> {
    if (!this.entities[language]) {
      return {};
    }
    if (!this.entities[language][type]) {
      return {};
    }
    return this.entities[language][type];
  }
}

export default GameData;




