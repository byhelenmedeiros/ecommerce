
export function getSessionId() {
  if (typeof window === 'undefined') return null; 
  let s = localStorage.getItem('sessionId');
  if (!s) {
    const rnd = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    s = `${rnd}-${Date.now()}`;
    localStorage.setItem('sessionId', s);
  }
  return s;
}
