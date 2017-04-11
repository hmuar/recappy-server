import { getEntryStateForNoteType } from '~/core/session_state';
import pipeAdvanceState from '~/controller/pipe_advance_state';

// overwrite entry type recall to recall_response
export function getEntryStateForNoteTypeSim(ntype) {
  switch (ntype) {
    case 'recall':
      return SessionState.RECALL_RESPONSE;
    default:
      return getEntryStateForNoteType(ntype);
  }
}

const pipeAdvanceSimState = pipeAdvanceState;
// stub method because of simulation needs
pipeAdvanceSimState.getEntryStateForNoteType = getEntryStateForNoteTypeSim;

export default pipeAdvanceSimState;
