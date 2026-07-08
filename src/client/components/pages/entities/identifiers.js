/*
 * Copyright (C) 2017  Ben Ockmore
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

import IdentifierLink from './identifiers-links';
import PropTypes from 'prop-types';
import React from 'react';
import {useTranslation} from 'react-i18next';


function EntityIdentifiers({entityUrl, identifiers, identifierTypes}) {
	const {t: translate} = useTranslation(['pages', 'common']);
	return (
		<div>
			<h2>{translate('common:identifiers', {defaultValue: 'Identifiers'})}</h2>
			{

				identifiers?.length > 0 ?
					identifierTypes.sort((a, b) => a.label.localeCompare(b.label)).map((type) => {
						const identifierValues =
						identifiers
							.filter(
								(identifier) => identifier.type.id === type.id || identifier.typeId === type.id
							)
							.map(
								(identifier) => (
									<dd key={identifier.id}>
										<IdentifierLink
											typeId={type.id}
											value={identifier.value}
										/>
									</dd>
								)
							);
						if (!identifierValues.length) {
							return null;
						}
						return [
							<dt key={type.id}>{type.label}</dt>,
							identifierValues
						];
					}) :
					<p className="text-muted">
						<b>{translate('common:noIdentifiers')}</b>
						&nbsp;
						{translate('entityDisplay.identifiers.editInstructions').split('Click here to edit')[0]}
						<a href={`${entityUrl}/edit`}>
							{translate('entityDisplay.identifiers.editLinkText', {defaultValue: 'Click here to edit'})}
						</a>
						{translate('entityDisplay.identifiers.editInstructions').split('Click here to edit')[1]}
					</p>
			}
		</div>
	);
}

EntityIdentifiers.displayName = 'EntityIdentifiers';
EntityIdentifiers.propTypes = {
	entityUrl: PropTypes.string.isRequired,
	identifierTypes: PropTypes.array.isRequired,
	identifiers: PropTypes.array
};
EntityIdentifiers.defaultProps = {
	identifiers: []
};

export default EntityIdentifiers;
