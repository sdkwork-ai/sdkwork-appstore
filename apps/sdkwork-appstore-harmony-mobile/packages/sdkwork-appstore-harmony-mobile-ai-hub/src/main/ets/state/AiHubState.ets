import { AiHubPageResult } from '../models/AiHubModels';

export enum AiHubStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

@Observed
export class AiHubState {
  status: AiHubStatus = AiHubStatus.Idle;
  lastResult?: AiHubPageResult<object>;
  error?: string;

  loading(): void {
    this.status = AiHubStatus.Loading;
    this.error = undefined;
  }

  loaded(result: AiHubPageResult<object>): void {
    this.status = AiHubStatus.Ready;
    this.lastResult = result;
  }

  failed(message: string): void {
    this.status = AiHubStatus.Error;
    this.error = message;
  }
}
