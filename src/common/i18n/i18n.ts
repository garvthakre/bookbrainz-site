/*
 * Copyright (C) 2026  Garv Thakre
 *
 * i18n prototype — isomorphic i18next initialiser.
 * Fresh instance per request on the server (no locale leaking between users).
 * On the browser, loads translations over HTTP from /locales/{{lng}}/{{ns}}.json.
 */

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

const isServer = typeof window === 'undefined';

export function createI18n(locale = 'en', resources?) {
	const instance = i18n.createInstance(); // fresh per request — no locale leaking
	instance.use(initReactI18next);

	const hasResources = resources && Object.keys(resources).length > 0;

	if (!hasResources && !isServer) {
		// Browser with no pre-loaded resources — fetch translations over HTTP.
		// In normal page loads this branch is never hit because the server injects
		// resources into the #props script tag. It exists as a safety fallback.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const HttpBackend = require('i18next-http-backend').default;
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const LangDetector = require('i18next-browser-languagedetector').default;
		instance.use(HttpBackend).use(LangDetector);
	}

	instance.init({
		fallbackLng: 'en',
		initImmediate: false, // synchronous init — resources are already in memory, no async needed
		lng: locale,
		ns: ['common', 'entityEditor', 'pages', 'entities', 'errors'],
		...(hasResources
			? {resources}                                                    // server OR client with injected data
			: {backend: {loadPath: '/locales/{{lng}}/{{ns}}.json'}}         // client-only fallback
		),
	});

	return instance;
}
