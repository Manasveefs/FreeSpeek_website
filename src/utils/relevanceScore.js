const calculateEngagementScore = (post) => {
  const { likes, comments, shares, views } = post;
  return likes * 1 + comments * 2 + shares * 3 + views * 0.5;
};

const calculateTimeDecay = (timestamp) => {
  const ageInHours = (Date.now() - new Date(timestamp)) / 36e5;
  return Math.exp(-ageInHours / 24); // Decay over 24 hours
};

const calculateRelevanceScore = (post, userPreferences) => {
  const engagementScore = calculateEngagementScore(post);
  const timeDecay = calculateTimeDecay(post.date);

  // Add user preference influence
  const userPreferenceScore = userPreferences.includes(post.contentType)
    ? 1.5
    : 1;

  return engagementScore * timeDecay * userPreferenceScore;
};

export { calculateRelevanceScore };
