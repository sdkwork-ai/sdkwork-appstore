import UIAbility from '@ohos.app.ability.UIAbility';
import window from '@ohos.window';

import { bootstrap } from '../bootstrap/Runtime';

export default class EntryAbility extends UIAbility {
  onWindowStageCreate(windowStage: window.WindowStage): void {
    bootstrap(this.context);
    windowStage.loadContent('pages/Index', (err) => {
      if (err.code) {
        return;
      }
    });
  }
}
