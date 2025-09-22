const { checkYouTubePostsReal } = require('../../lib/real-social-tracker');

export default async function handler(req, res) {
  const { channel, date } = req.query;
  
  if (!channel) {
    return res.status(400).json({
      error: 'Please provide a channel parameter',
      example: '/api/test-youtube?channel=MrBeast&date=2025-09-20'
    });
  }
  
  const checkDate = date || new Date().toISOString().split('T')[0];
  
  try {
    console.log(`Testing YouTube channel: ${channel} for date: ${checkDate}`);
    const videoCount = await checkYouTubePostsReal(channel, checkDate);
    
    return res.status(200).json({
      success: true,
      channel: channel,
      date: checkDate,
      videosPosted: videoCount,
      message: videoCount > 0 ? 
        `Found ${videoCount} video(s) posted on ${checkDate}` : 
        `No videos found for ${checkDate}. This could mean no videos were posted that day, or the channel handle needs to be in a different format.`,
      tips: [
        'Try different formats:',
        '- Channel ID: UCX6OQ3DkcsbYNE6H8uQQuVA',
        '- Username: MrBeast',
        '- Handle: @MrBeast'
      ]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
