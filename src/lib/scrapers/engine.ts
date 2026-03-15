import type { WipeData } from "@/schemas/wipe-data";
import type { GameScraperConfig } from "./config-types";
import { isCalculatedConfig, isScrapedConfig } from "./config-types";

/**
 * Motor principal de scraping
 *
 * Usa la configuración del juego para determinar cómo obtener los datos
 */
export class ScraperEngine {
  private configs: Map<string, GameScraperConfig> = new Map();

  register(config: GameScraperConfig) {
    this.configs.set(config.id, config);
  }

  async scrape(gameId: string): Promise<WipeData> {
    const config = this.configs.get(gameId);
    if (!config) {
      throw new Error(`No config found for game: ${gameId}`);
    }

    console.log(
      `🎮 Scraping ${config.name} using ${config.strategy} strategy...`,
    );

    if (isCalculatedConfig(config)) {
      return this.scrapeCalculated(config);
    }

    if (isScrapedConfig(config)) {
      return this.scrapeWithFunction(config);
    }

    // API config
    return this.scrapeWithApi(config);
  }

  private scrapeCalculated(config: GameScraperConfig): WipeData {
    if (!config.schedule) {
      throw new Error(
        `Calculated strategy requires schedule config for ${config.id}`,
      );
    }

    const now = new Date();
    let nextWipe: Date;
    let lastWipe: Date;

    // Lógica específica para cada tipo de schedule
    if (config.schedule.type === "monthly") {
      const { dayOfWeek, weekOfMonth, time, timezone } = config.schedule;

      // Calcular próximo wipe
      nextWipe = this.getMonthlyWipeDate(
        now,
        dayOfWeek!,
        weekOfMonth!,
        time!,
        timezone!,
      );

      // Calcular wipe anterior
      lastWipe = new Date(nextWipe);
      lastWipe.setMonth(lastWipe.getMonth() - 1);
    } else {
      // Fallback simple
      nextWipe = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      lastWipe = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      nextWipe: nextWipe.toISOString(),
      lastWipe: lastWipe.toISOString(),
      frequency: config.typicalCycle,
      source: `${config.developer} (Official Schedule)`,
      scrapedAt: new Date().toISOString(),
      confirmed: true,
      eventType: config.eventType,
      ...config.fallbackData,
    };
  }

  private async scrapeWithFunction(
    config: GameScraperConfig,
  ): Promise<WipeData> {
    if (!config.scraperFunction) {
      throw new Error(
        `Scraped strategy requires scraperFunction for ${config.id}`,
      );
    }

    try {
      return await config.scraperFunction();
    } catch (error) {
      console.error(`❌ Error scraping ${config.id}:`, error);

      // Fallback a datos estáticos si existen
      if (config.fallbackData) {
        console.log(`⚠️ Using fallback data for ${config.id}`);
        return {
          nextWipe: new Date().toISOString(),
          lastWipe: new Date().toISOString(),
          frequency: config.typicalCycle,
          source: `${config.developer} (Fallback)`,
          scrapedAt: new Date().toISOString(),
          confirmed: false,
          eventType: config.eventType,
          ...config.fallbackData,
        } as WipeData;
      }

      throw error;
    }
  }

  private async scrapeWithApi(config: GameScraperConfig): Promise<WipeData> {
    // Implementación para APIs (Steam, etc)
    throw new Error("API strategy not implemented yet");
  }

  private getMonthlyWipeDate(
    fromDate: Date,
    dayOfWeek: number,
    weekOfMonth: number,
    time: string,
    timezone: string,
  ): Date {
    const [hours, minutes] = time.split(":").map(Number);
    const year = fromDate.getFullYear();
    const month = fromDate.getMonth();

    // Encontrar el primer día del mes
    const firstDay = new Date(year, month, 1);

    // Encontrar el primer día específico de la semana
    const targetDay = new Date(firstDay);
    while (targetDay.getDay() !== dayOfWeek) {
      targetDay.setDate(targetDay.getDate() + 1);
    }

    // Ajustar a la semana correcta
    if (weekOfMonth > 1) {
      targetDay.setDate(targetDay.getDate() + (weekOfMonth - 1) * 7);
    }

    // Si ya pasó, ir al próximo mes
    if (targetDay < fromDate) {
      targetDay.setMonth(targetDay.getMonth() + 1);
      targetDay.setDate(1);
      while (targetDay.getDay() !== dayOfWeek) {
        targetDay.setDate(targetDay.getDate() + 1);
      }
    }

    // Setear hora
    targetDay.setUTCHours(hours, minutes, 0, 0);

    return targetDay;
  }
}

// Singleton instance
export const scraperEngine = new ScraperEngine();
