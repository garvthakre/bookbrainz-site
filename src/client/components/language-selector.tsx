/*
 * Copyright (C) 2026  Garv Thakre
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as bootstrap from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {faGlobe} from '@fortawesome/free-solid-svg-icons';


const {Nav, NavDropdown} = bootstrap;

// Native language names — avoids runtime locale registration issues.
// Add new entries here when Weblate delivers a new language.
const LANGUAGE_NAMES: Record<string, string> = {
	de: 'Deutsch',
	en: 'English',
	fr: 'Français',
	hi: 'हिन्दी',
	ja: '日本語',
	pt: 'Português',
	zh: '中文'
};

function getNativeName(code: string): string {
	return LANGUAGE_NAMES[code] ?? code.toUpperCase();
}

interface LanguageSelectorProps {
	availableLocales: string[];
	currentLocale: string;
}

function handleMouseDown(event: React.MouseEvent) {
	event.preventDefault();
}
function handleChange(event: React.MouseEvent<HTMLElement>) {
	// Server reads this cookie on next request to render in the chosen language.
	const {code} = (event.currentTarget as HTMLElement).dataset;
	if (code) {
		document.cookie = `bb_lang=${code};path=/;max-age=31536000`;
		window.location.reload();
	}
}

function LanguageSelector({availableLocales, currentLocale}: LanguageSelectorProps) {
	const globeTitle = (
		<span>
			<FontAwesomeIcon icon={faGlobe}/>
			{`  ${getNativeName(currentLocale)}`}
		</span>
	);

	return (
		<Nav>
			<NavDropdown
				alignRight
				id="language-dropdown"
				title={globeTitle}
				onMouseDown={handleMouseDown}
			>
				{availableLocales.map((code) => (
					<NavDropdown.Item
						active={code === currentLocale}
						data-code={code}
						key={code}
						onClick={handleChange}
					>
						{getNativeName(code)}
					</NavDropdown.Item>
				))}
			</NavDropdown>
		</Nav>
	);
}

LanguageSelector.displayName = 'LanguageSelector';
LanguageSelector.propTypes = {
	availableLocales: PropTypes.arrayOf(PropTypes.string).isRequired,
	currentLocale: PropTypes.string.isRequired
};

export default LanguageSelector;
