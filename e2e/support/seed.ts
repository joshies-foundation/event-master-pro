export const seed = {
  sessionName: 'Test Jaybies',
  sessionId: 38,
  password: 'password',
  colin: {
    username: 'colin',
    userId: 'be62a737-ed9f-4e88-8e74-ee8310131818',
    playerId: 119,
    score: 33,
  },
  leo: {
    username: 'leo',
    userId: '0bd99699-02ca-4657-8e5d-72cff694a41d',
    playerId: 109,
    score: 70,
  },
  josh: {
    username: 'josh',
    userId: '9e69f91e-93cb-44c2-9866-3e0680861e2a',
    playerId: 118,
    score: 40,
  },
  playersInSession: 11,
  unwonPrizeIds: [10, 11, 12],
} as const;

export type SeedUser = typeof seed.colin | typeof seed.leo | typeof seed.josh;
