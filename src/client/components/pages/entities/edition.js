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

import * as bootstrap from 'react-bootstrap';
import * as entityHelper from '../../../helpers/entity';
import AuthorCreditDisplay from '../../author-credit-display';
import EditionCover from '../parts/edition-cover';
import EntityAnnotation from './annotation';
import EntityFooter from './footer';
import EntityLinks from './links';
import EntityRelatedCollections from './related-collections';
import EntityTitle from './title';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import WikipediaExtract from './wikipedia-extract';
import WorksTable from './work-table';
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';


const {
	deletedEntityMessage, extractAttribute, getEditionPublishers, getEditionReleaseDate, getEntityUrl,
	getLanguageAttribute, getRelationshipTargetByTypeId, addAuthorsDataToWorks, ENTITY_TYPE_ICONS, getSortNameOfDefaultAlias
} = entityHelper;
const {Col, Row} = bootstrap;

function EditionAttributes({edition}) {
	const {t: translate} = useTranslation(['pages', 'common']);
	if (edition.deleted) {
		return deletedEntityMessage;
	}
	const status = extractAttribute(edition.editionStatus, 'label');
	const format = extractAttribute(edition.editionFormat, 'label');
	const pageCount = extractAttribute(edition.pages);
	const weight = extractAttribute(edition.weight);
	const width = extractAttribute(edition.width);
	const height = extractAttribute(edition.height);
	const depth = extractAttribute(edition.depth);

	const sortNameOfDefaultAlias = getSortNameOfDefaultAlias(edition);
	const releaseDate = getEditionReleaseDate(edition);
	const publishers = getEditionPublishers(edition);
	const languages = getLanguageAttribute(edition).data;

	return (
		<div>

			<Row>
				<Col lg={3}>
					<dl>
						<dt>{translate('common:sortName', {defaultValue: 'Sort Name'})}</dt>
						<dd>{sortNameOfDefaultAlias}</dd>
						<dt>{translate('common:releaseDate', {defaultValue: 'Release Date'})}</dt>
						<dd>{releaseDate}</dd>
						<dt>{translate('common:format', {defaultValue: 'Format'})}</dt>
						<dd>{format}</dd>
					</dl>
				</Col>
				<Col lg={3}>
					<dl>
						<dt>{translate('common:status', {defaultValue: 'Status'})}</dt>
						<dd>{status}</dd>
						<dt>{translate('common:languages', {defaultValue: 'Languages'})}</dt>
						<dd>{languages}</dd>
					</dl>
				</Col>
				<Col lg={3}>
					<dl>
						{format !== 'eBook' &&
						<>
							<dt>{translate('common:dimensions', {defaultValue: 'Dimensions (WxHxD)'})}</dt>
							<dd>{width}&times;{height}&times;{depth} mm</dd>
							<dt>{translate('common:weight', {defaultValue: 'Weight'})}</dt>
							<dd>{weight} g</dd>
						</>}
						<dt>{translate('common:pageCount', {defaultValue: 'Page Count'})}</dt>
						<dd>{pageCount}</dd>
					</dl>
				</Col>
				<Col lg={3}>
					<dl>
						<dt>{translate('common:entityType.publisher_plural', {defaultValue: 'Publishers'})}</dt>
						<dd>{publishers}</dd>
					</dl>
				</Col>
			</Row>
		</div>
	);
}
EditionAttributes.displayName = 'EditionAttributes';
EditionAttributes.propTypes = {
	edition: PropTypes.object.isRequired
};


function EditionDisplayPage({entity, identifierTypes, user, wikipediaExtract}) {
	const {t: translate} = useTranslation('pages');
	// relationshipTypeId = 10 refers the relation (<Work> is contained by <Edition>)
	const relationshipTypeId = 10;
	const worksContainedByEdition = getRelationshipTargetByTypeId(entity, relationshipTypeId);
	const worksContainedByEditionWithAuthors = addAuthorsDataToWorks(entity.authorsData, worksContainedByEdition);
	const urlPrefix = getEntityUrl(entity);
	const hasAuthorCredits = entity.creditSection;

	let authorCreditSection;
	if (entity.authorCredit) {
		authorCreditSection = (
			<AuthorCreditDisplay
				names={entity.authorCredit.names}
			/>
		);
	}
	else if (!entity.deleted && (hasAuthorCredits === true || hasAuthorCredits === null)) {
		const unsetWarning = translate('entityDisplay.edition.authorCreditUnset', {defaultValue: 'Author Credit unset; please edit this Edition and add its Author(s) if you see this!'});
		const editLinkText = translate('entityDisplay.edition.editEditionLink', {defaultValue: 'edit this Edition'});
		authorCreditSection = (
			<div className="alert alert-warning text-center">
				{unsetWarning.split(editLinkText)[0]}
				<a href={`/edition/${entity.bbid}/edit`}>{editLinkText}</a>
				{unsetWarning.split(editLinkText)[1]}
			</div>);
	}

	let editionGroupSection;
	if (entity.editionGroup) {
		editionGroupSection = (
			<div className="margin-bottom-d15">
				<a href={`/edition-group/${entity.editionGroup.bbid}`}>
					<FontAwesomeIcon icon={faExternalLinkAlt}/>
					<span>&nbsp;{translate('entityDisplay.edition.seeSimilarEditions', {defaultValue: 'See all similar editions'})}</span>
				</a>
			</div>
		);
	}
	else if (!entity.deleted) {
		const unsetWarning = translate('entityDisplay.edition.editionGroupUnset', {defaultValue: 'Edition Group unset - please edit this Edition and add one if you see this!'});
		const editLinkText = translate('entityDisplay.edition.editEditionLink', {defaultValue: 'edit this Edition'});
		editionGroupSection = (
			<div className="alert alert-warning text-center">
				{unsetWarning.split(editLinkText)[0]}
				<a href={`/edition/${entity.bbid}/edit`}>{editLinkText}</a>
				{unsetWarning.split(editLinkText)[1]}
			</div>
		);
	}
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" lg={3}>
					<EditionCover
						backupIcon={ENTITY_TYPE_ICONS.Edition}
						deleted={entity.deleted}
						editionName={entity.defaultAlias?.name || entity.name}
						identifiers={entity.identifierSet?.identifiers}
					/>
				</Col>
				<Col lg={9}>
					<EntityTitle entity={entity}/>
					{authorCreditSection}
					<hr/>
					<EditionAttributes edition={entity}/>
					{editionGroupSection}
				</Col>
			</Row>
			<WikipediaExtract articleExtract={wikipediaExtract} entity={entity}/>
			<EntityAnnotation entity={entity}/>
			{!entity.deleted &&
			<React.Fragment>
				<WorksTable
					entity={entity}
					works={worksContainedByEditionWithAuthors}
				/>
				<EntityLinks
					entity={entity}
					identifierTypes={identifierTypes}
					urlPrefix={urlPrefix}
				/>
				<EntityRelatedCollections collections={entity.collections}/>
			</React.Fragment>}
			<hr className="margin-top-d40"/>
			<EntityFooter
				bbid={entity.bbid}
				deleted={entity.deleted}
				entityType={entity.type}
				entityUrl={urlPrefix}
				lastModified={entity.revision.revision.createdAt}
				user={user}
			/>
		</div>
	);
}
EditionDisplayPage.displayName = 'EditionDisplayPage';
EditionDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array,
	user: PropTypes.object.isRequired,
	wikipediaExtract: PropTypes.object
};
EditionDisplayPage.defaultProps = {
	identifierTypes: [],
	wikipediaExtract: {}
};

export default EditionDisplayPage;
