
export const getAdminAuth = () => ({
  verifySessionCookie: (cookie: string) => Promise.resolve({ uid: 'test-user-id' }),
});
