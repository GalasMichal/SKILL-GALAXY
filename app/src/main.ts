import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

if (!environment.production && typeof console !== 'undefined' && console.debug) {
  console.debug(
    '[env] Supabase:',
    environment.supabaseUrl && environment.supabaseAnonKey ? 'on' : 'off (sample graph)'
  );
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
