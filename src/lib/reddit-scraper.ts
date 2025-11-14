type RedditPost = {
  title: string;
  selftext: string;
  author: string;
  created_utc: number;
  url: string;
  permalink: string;
};

export async function scrapeRedditPosts(
  subreddit: string,
  options: {
    limit?: number;
    sort?: "hot" | "new" | "top" | "rising";
    timeframe?: "hour" | "day" | "week" | "month" | "year" | "all";
  } = {}
): Promise<RedditPost[]> {
  const { limit = 25, sort = "new", timeframe = "week" } = options;

  try {
    // Use old.reddit.com which is more lenient with scraping
    const url = new URL(`https://old.reddit.com/r/${subreddit}/${sort}.json`);
    url.searchParams.set("limit", limit.toString());
    if (sort === "top" && timeframe) {
      url.searchParams.set("t", timeframe);
    }

    console.log(`📍 Fetching r/${subreddit} (${sort}, limit: ${limit})`);

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://old.reddit.com/",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.log(`⚠️  Reddit returned ${response.status} for r/${subreddit}`);

      if (response.status === 429) {
        console.log("⚠️  Rate limited by Reddit - wait before retrying");
      }

      return [];
    }

    const data = await response.json();
    const posts = data?.data?.children || [];

    console.log(`✅ Found ${posts.length} posts in r/${subreddit}`);

    return posts.map((post: any) => ({
      title: post.data.title,
      selftext: post.data.selftext,
      author: post.data.author,
      created_utc: post.data.created_utc,
      url: post.data.url,
      permalink: post.data.permalink,
    }));
  } catch (error) {
    console.error(`❌ Error fetching r/${subreddit}:`, error);
    return [];
  }
}

export function searchPosts(
  posts: RedditPost[],
  keywords: string[],
  excludeKeywords: string[] = []
): RedditPost[] {
  return posts.filter((post) => {
    const content = `${post.title} ${post.selftext}`.toLowerCase();

    const hasExcluded = excludeKeywords.some((keyword) =>
      content.includes(keyword.toLowerCase())
    );
    if (hasExcluded) return false;

    const hasKeyword = keywords.some((keyword) =>
      content.includes(keyword.toLowerCase())
    );

    return hasKeyword;
  });
}

export function extractDatesFromPost(post: RedditPost): Date[] {
  const text = `${post.title} ${post.selftext}`;
  const dates: Date[] = [];

  // Month + Day patterns
  const monthDayPattern =
    /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/gi;

  const monthMap: Record<string, number> = {
    january: 0,
    jan: 0,
    february: 1,
    feb: 1,
    march: 2,
    mar: 2,
    april: 3,
    apr: 3,
    may: 4,
    june: 5,
    jun: 5,
    july: 6,
    jul: 6,
    august: 7,
    aug: 7,
    september: 8,
    sep: 8,
    october: 9,
    oct: 9,
    november: 10,
    nov: 10,
    december: 11,
    dec: 11,
  };

  const matches = text.matchAll(monthDayPattern);
  for (const match of matches) {
    const month = match[1].toLowerCase();
    const day = parseInt(match[2]);
    const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();

    const monthNum = monthMap[month];
    if (monthNum !== undefined && day >= 1 && day <= 31) {
      const date = new Date(year, monthNum, day);
      const now = new Date();
      const daysFromNow =
        (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (daysFromNow >= -7 && daysFromNow <= 365) {
        dates.push(date);
      }
    }
  }

  dates.sort((a, b) => a.getTime() - b.getTime());
  return dates;
}

let lastRedditRequest = 0;
const MIN_DELAY_MS = 2000;

export async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRedditRequest;

  if (timeSinceLastRequest < MIN_DELAY_MS) {
    const delay = MIN_DELAY_MS - timeSinceLastRequest;
    console.log(`⏳ Waiting ${delay}ms for rate limit...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  lastRedditRequest = Date.now();
}
