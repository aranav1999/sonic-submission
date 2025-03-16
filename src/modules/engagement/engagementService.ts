import Engagement, { IEngagement } from "./engagementModel";

export async function incrementView(nftId: string): Promise<IEngagement> {
  let eng = await Engagement.findOne({ nftId });
  if (!eng) {
    eng = await Engagement.create({ nftId, views: 1, likes: 0 });
  } else {
    eng.views += 1;
    await eng.save();
  }
  return eng;
}

export async function incrementLike(nftId: string): Promise<IEngagement> {
  let eng = await Engagement.findOne({ nftId });
  if (!eng) {
    eng = await Engagement.create({ nftId, views: 0, likes: 1 });
  } else {
    eng.likes += 1;
    await eng.save();
  }
  return eng;
}

export async function getEngagement(nftId: string): Promise<IEngagement | null> {
  return Engagement.findOne({ nftId });
}

