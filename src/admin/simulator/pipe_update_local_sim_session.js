export function updateLocalSession(appState) {
  const {
    session,
  } = appState;

  const { simulator, } = session;
  const step = simulator.step || 0;

  return {
    ...appState,
    session: {
      ...session,
      simulator: {
        ...simulator,
        step: step + 1,
      },
    },
  };
}

// Returns promise
export default function pipe(appState) {
  return updateLocalSession(appState);
}
