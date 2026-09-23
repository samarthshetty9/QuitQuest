"use client";
import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db/db";
import { CURRENT_USER_ID } from "@/lib/db/repo";
import { useNow } from "@/hooks/useNow";
import { computeGameStats, type GameStats } from "@/lib/game/stats";
import { syncRewardGoalUnlocks } from "@/lib/game/engine";
import type {
  UserProfile,
  QuitAttempt,
  CravingEvent,
  SlipEvent,
  XPEvent,
  Quest,
  RewardGoal,
  IfThenPlan,
} from "@/lib/domain/types";

export interface GameData {
  loading: boolean;
  profile: UserProfile | undefined;
  activeAttempt: QuitAttempt | undefined;
  allAttempts: QuitAttempt[];
  cravingEvents: CravingEvent[];
  slips: SlipEvent[];
  xpEvents: XPEvent[];
  quests: Quest[];
  rewardGoals: RewardGoal[];
  ifThenPlans: IfThenPlan[];
  stats: GameStats | null;
  now: Date;
}

/** Central reactive read model. Dexie live queries auto-update on any DB write, anywhere in the app. */
export function useGameData(): GameData {
  const now = useNow();

  const profile = useLiveQuery(() => getDB().userProfile.get(CURRENT_USER_ID), []);
  const allAttempts = useLiveQuery(
    () => getDB().quitAttempts.where({ userId: CURRENT_USER_ID }).toArray(),
    []
  );
  const cravingEvents = useLiveQuery(
    () => getDB().cravingEvents.where({ userId: CURRENT_USER_ID }).toArray(),
    []
  );
  const slips = useLiveQuery(() => getDB().slipEvents.where({ userId: CURRENT_USER_ID }).toArray(), []);
  const xpEvents = useLiveQuery(() => getDB().xpEvents.where({ userId: CURRENT_USER_ID }).toArray(), []);
  const quests = useLiveQuery(() => getDB().quests.where({ userId: CURRENT_USER_ID }).toArray(), []);
  const rewardGoals = useLiveQuery(() => getDB().rewardGoals.where({ userId: CURRENT_USER_ID }).toArray(), []);
  const ifThenPlans = useLiveQuery(() => getDB().ifThenPlans.where({ userId: CURRENT_USER_ID }).toArray(), []);

  const loading =
    profile === undefined &&
    (allAttempts === undefined ||
      cravingEvents === undefined ||
      slips === undefined ||
      xpEvents === undefined);

  const activeAttempt = allAttempts?.find((a) => a.active);

  const stats =
    profile && allAttempts && cravingEvents && slips && xpEvents
      ? computeGameStats({
          profile,
          activeAttempt,
          allAttempts,
          cravingEvents,
          slips,
          xpEvents,
          now,
        })
      : null;

  const moneySaved = stats?.moneySaved;
  useEffect(() => {
    if (moneySaved !== undefined && moneySaved > 0) {
      syncRewardGoalUnlocks(moneySaved);
    }
  }, [moneySaved]);

  return {
    loading,
    profile,
    activeAttempt,
    allAttempts: allAttempts ?? [],
    cravingEvents: cravingEvents ?? [],
    slips: slips ?? [],
    xpEvents: xpEvents ?? [],
    quests: quests ?? [],
    rewardGoals: rewardGoals ?? [],
    ifThenPlans: ifThenPlans ?? [],
    stats,
    now,
  };
}
