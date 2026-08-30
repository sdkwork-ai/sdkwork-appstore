export interface AppstorePcSdkPort<TClients = unknown> {
  readonly clients: TClients;
}

export type AppstorePcSdkPortFactory<TClients = unknown> = () =>
  AppstorePcSdkPort<TClients>;

export * from './clients';
