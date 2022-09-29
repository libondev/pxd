import type { GlobalConfig } from './types';
import type { App } from 'vue';
export declare function installCarbons(globalConfig?: GlobalConfig): (app: App<string>) => App<string>;
