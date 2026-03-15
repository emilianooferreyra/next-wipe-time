/**
 * Optimized Scraper Engine with Dynamic Config Loading
 *
 * Lazy loads configs on-demand to reduce initial bundle size
 */

import type { WipeData } from "@/schemas/wipe-data";
import { loadGameConfig } from "./dynamic-config-loader";
import type { GameScraperConfig } from "./config-types";
import { isCalculatedConfig, isScrapedConfig, isApiConfig } from "./config-types";

/**
 * Optimized motor de scraping con carga dinámica
 */
export class OptimizedScraperEngine {
  async scrape(gameId: string): Promise<WipeData> {
    // Dynamically load config only when needed
    const config = await loadGameConfig(gameId);

    console.log(
      `🎮 Scraping ${config.name} using ${config.strategy} strategy...`,
    );

    if (isCalculatedConfig(config)) {
      return this.scrapeCalculated(config);
    }

    if (isScrapedConfig(config)) {
      return this.scrapeWithFunction(config);
    }

    if (isApiConfig(config)) {
      return this.scrapeWithApi(config);
    }

    throw new Error(`Unknown strategy: ${(config as any).strategy}`);
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
          ...config.fallbackData,
          scrapedAt: new Date().toISOString(),
          source: `${config.developer} (Fallback Data)`,
        } as WipeData;
      }

      throw error;
    }
  }

  private async scrapeWithApi(config: GameScraperConfig): Promise<WipeData> {
    throw new Error("API strategy not yet implemented");
  }

  // Helper para calcular fechas mensuales (ej: primer jueves de cada mes)
  private getMonthlyWipeDate(
    baseDate: Date,
    dayOfWeek: number,
    weekOfMonth: number,
    time: string,
    timezone: string,
  ): Date {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);

    // Encontrar el primer occurrence del día de la semana
    let targetDay = 1;
    while (new Date(year, month, targetDay).getDay() !== dayOfWeek) {
      targetDay++;
    }

    // Añadir semanas
    targetDay += (weekOfMonth - 1) * 7;

    // Si ya pasó, ir al siguiente mes
    const wipeDate = new Date(year, month, targetDay);
    if (wipeDate < baseDate) {
      return this.getMonthlyWipeDate(
        new Date(year, month + 1, 1),
        dayOfWeek,
        weekOfMonth,
        time,
        timezone,
      );
    }

    // Agregar hora
    const [hours, minutes] = time.split(":").map(Number);
    wipeDate.setHours(hours, minutes, 0, 0);

    return wipeDate;
  }
}

// Singleton instance
export const optimizedScraperEngine = new OptimizedScraperEngine();
