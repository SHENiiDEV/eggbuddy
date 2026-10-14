import '../css/app.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/silkscreen/400.css';

import { createInertiaApp } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'EggBuddy';

createInertiaApp({
  title: (title) => (title ? `${title} · ${appName}` : `${appName} · your retro pocket pet`),
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.jsx');
    const page = pages[`./pages/${name}.jsx`];
    if (!page) throw new Error(`Page not found: ${name}`);
    return page();
  },
  progress: { color: '#ff8fba', showSpinner: false },
});
