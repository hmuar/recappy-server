function advanceSimDay(appState) {
  if (!appState) {
    return Promise.resolve(appState);
  }

  const { session, } = appState;
  const sessionSimulator = session.simulator;
  const newDayOffset = sessionSimulator.dayOffset + 1;

  return {
    ...appState,
    session: {
      ...appState.session,
      simulator: {
        ...sessionSimulator,
        dayOffset: newDayOffset,
      },
    },
  };
}

export default function pipe(appState) {
  return advanceSimDay(appState);
}
