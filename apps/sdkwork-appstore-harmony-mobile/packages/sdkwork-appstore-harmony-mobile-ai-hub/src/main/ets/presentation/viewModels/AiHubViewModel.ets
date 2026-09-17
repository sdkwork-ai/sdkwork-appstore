import { AiHubState } from '../../state/AiHubState';

/** Presentation view model for the ai-hub capability. */
@Observed
export class AiHubViewModel {
  readonly state: AiHubState = new AiHubState();

  get capability(): string {
    return 'ai-hub';
  }
}
