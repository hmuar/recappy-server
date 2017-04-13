export default function pipe(appState) {
  if (!appState.session.simulator) {
    return {
      ...appState,
      session: {
        ...appState.session,
        simulator: {
          dayOffset: 0,
          step: 0,
          notesSeen: 0,
        },
      },
    };
  }
  return appState;
}
