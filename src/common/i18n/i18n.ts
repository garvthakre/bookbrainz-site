/*
 * Copyright (C) 2026  Garv Thakre
 *
 * i18n prototype — isomorphic i18next initialiser.
 * Fresh instance per request on the server (no locale leaking between users).
 * On the browser, loads translations over HTTP from /locales/{{lng}}/{{ns}}.json.
 */

import HttpBackend from 'i18next-http-backend';
import LangDetector from 'i18next-browser-languagedetector';
import {createInstance} from 'i18next';
import {initReactI18next} from 'react-i18next';


const isServer = typeof window === 'undefined';

export function createI18n(locale = 'en', resources?) {
	const instance = createInstance();
	instance.use(initReactI18next);

	const hasResources = resources && Object.keys(resources).length > 0;

	if (!hasResources && !isServer) {
		// Browser with no pre-loaded resources — fetch translations over HTTP.
		// In normal page loads this branch is never hit because the server injects
		// resources into the #props script tag. It exists as a safety fallback.
		instance.use(HttpBackend).use(LangDetector);
	}

	instance.init({
		fallbackLng: 'en',
		initImmediate: false,
		lng: locale,
		ns: ['common', 'entityEditor', 'pages', 'entities', 'errors'],
		...hasResources ? {resources} : {backend: {loadPath: '/locales/{{lng}}/{{ns}}.json'}}
	});

	return instance;
}
