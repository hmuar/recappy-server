import { StudentSession } from '~/db/collection';

export function updateLocalSession(appState) {
  const {
    simulator,
  } = appState.session;

  return {
    ...appState,
    simulator: {
      ...simulator,
      step: simulator.step + 1,
    },
  };
}

// Returns promise
export default function pipe(appState) {
  return updateLocalSession(appState);
}
