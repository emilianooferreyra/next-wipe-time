import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Trigger refresh for all games
    const games = [
      'rust', 'tarkov', 'poe', 'fortnite', 'diablo4', 'lastepoch',
      'valorant', 'lol', 'tft', 'apex', 'cod', 'rocketleague', 'dbd', 'pubg',
      'overwatch2', 'destiny2', 'r6siege', 'poe2', 'warframe'
    ];

    const results = await Promise.allSettled(
      games.map(async (game) => {
        const response = await fetch(`${baseUrl}/api/wipes/${game}?refresh=true`);
        const data = await response.json();
        return { game, success: response.ok, data };
      })
    );

    const summary = results.map((result, index) => ({
      game: games[index],
      status: result.status,
      ...(result.status === 'fulfilled' ? { data: result.value } : { error: result.reason }),
    }));

    return NextResponse.json({
      success: true,
      message: 'Wipe data update triggered',
      timestamp: new Date().toISOString(),
      results: summary,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to update wipe data', details: String(error) },
      { status: 500 }
    );
  }
}
