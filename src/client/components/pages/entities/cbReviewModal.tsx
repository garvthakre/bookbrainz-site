/* eslint-disable react/no-unused-state */
/*
 * Copyright (C) 2022       Ansh Goyal
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
// eslint-disable-next-line import/no-internal-modules
import * as eng from '@cospired/i18n-iso-languages/langs/en.json';
import * as iso from '@cospired/i18n-iso-languages';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
// eslint-disable-next-line import/named
import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {Rating} from 'react-simple-star-rating';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import {countWords} from '../../../helpers/utils';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import request from 'superagent';
import {withTranslation} from 'react-i18next';


const {Alert, Modal} = bootstrap;
iso.registerLocale(eng);

export interface CBReviewModalProps {
	entityBBID: string;
	entityName: string;
	entityType: string;
	userId: number;
	showModal: boolean;
	handleModalToggle: () => void;
	handleUpdateReviews: () => void;
	// eslint-disable-next-line id-length
	t?: any;
}

export interface CBReviewModalState {
	acceptLicense: boolean;
	alert: Record<string, any>;
	language: string;
	rating: number;
	reviewValidateAlert: string | null;
	success: boolean;
	textContent: string;
	reviewID?: string;
}

class CBReviewModal extends React.Component<
	CBReviewModalProps,
	CBReviewModalState
> {
	constructor(props: CBReviewModalProps) {
		super(props);
		this.state = {
			acceptLicense: false,
			alert: {
				message: '',
				title: '',
				type: ''
			},
			language: 'en',
			rating: 0,
			reviewID: '',
			reviewValidateAlert: null,
			success: false,
			textContent: ''
		};
	}

	// eslint-disable-next-line react/sort-comp
	readonly minTextLength = 25;

	readonly maxTextLength = 100000;

	private CBBaseUrl = 'https://critiquebrainz.org';

	private MBBaseUrl = 'https://metabrainz.org';

	// gets all iso-639-1 languages and codes for dropdown
	private allLanguagesKeyValue = Object.entries(iso.getNames('en'));

	private renderCBInfoButton(translate: any) {
		return (
			<span>
				<span
					className="CBInfoButton"
					data-event="click focus"
					data-tip={translate('entityDisplay.cbReviewModal.infoTooltip', {
						defaultValue: `CritiqueBrainz is a <a href='${this.MBBaseUrl}/projects'>MetaBrainz project</a> aimed at providing an open platform for music critics and hosting Creative Commons licensed music reviews. </br></br> Your reviews will be independently visible on CritiqueBrainz and appear publicly on your CritiqueBrainz profile. To view or delete your reviews, visit your <a href='${this.CBBaseUrl}'>CritiqueBrainz</a> profile.`
					})}
				>
					<FontAwesomeIcon
						icon={faInfoCircle as IconProp}
						style={{color: 'black'}}
					/>
				</span>
				<ReactTooltip
					clickable
					html
					className="cb-data-tip"
					globalEventOff="click"
					place="bottom"
				/>
			</span>
		);
	}

	handleError = (error: string | Error, title?: string): void => {
		if (!error) {
			return;
		}
		this.setState({
			alert: {
				message: typeof error === 'object' ? error.message : error,
				title: title || 'Error',
				type: 'danger'
			}
		});
	};

	getAccessToken = async () => {
		try {
			const response = await request
				.post('/external-service/critiquebrainz/refresh');

			if (response?.status === 200 && response?.body?.accessToken) {
				return response.body.accessToken;
			}

			return null;
		}
		catch (error) {
			this.handleError(error, 'We could not submit your review');
		}
		return null;
	};

	handleInputChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const {target} = event;
		const value =
			target.type === 'checkbox' ?
				(target as HTMLInputElement).checked :
				target.value;
		const {name} = target;

		this.setState({
			[name]: value
		} as any);
	};

	handleTextInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const {reviewValidateAlert} = this.state;
		event.preventDefault();
		// remove excessive line breaks to match formatting to CritiqueBrainz
		const input = event.target.value.replace(/\n\s*\n\s*\n/g, '\n');
		if (input.length <= this.maxTextLength) {
			// cap input at maxTextLength
			this.setState({textContent: input});
		}

		if (reviewValidateAlert && input.length >= this.minTextLength) {
			// if warning was shown, rehide it when the input meets minTextLength
			this.setState({
				reviewValidateAlert: null
			});
		}
	};

	handleRatingsChange = (rate: number) => {
		this.setState({
			rating: rate / 20
		});
	};

	resetCBReviewForm = () => {
		this.setState({
			acceptLicense: false,
			rating: 0,
			reviewValidateAlert: null,
			success: true,
			textContent: ''
		});
	};

	handleCloseModal = () => {
		this.setState({
			acceptLicense: false,
			alert: {
				message: '',
				title: '',
				type: ''
			},
			language: 'en',
			rating: 0,
			reviewValidateAlert: null,
			textContent: ''
		});
		this.props.handleModalToggle();
	};

	handleSubmitToCB = async (
		event?: React.FormEvent<HTMLFormElement>
	): Promise<null> => {
		if (event) {
			event.preventDefault();
		}

		const {
			entityBBID,
			entityType,
			userId
		} = this.props;

		const {
			acceptLicense,
			language,
			rating,
			textContent
		} = this.state;

		if (textContent.length < this.minTextLength) {
			this.setState({
				reviewValidateAlert: `Your review needs to be longer than ${this.minTextLength} characters.`
			});
			return null;
		}

		if (userId &&
			this.accessToken &&
			acceptLicense
		) {
			let nonZeroRating: number;
			if (rating !== 0) {
				nonZeroRating = rating;
			}

			const review = {
				entityBBID,
				entityType,
				language,
				rating: nonZeroRating,
				textContent
			};

			try {
				let result: any;
				const response = await request.post(`/${entityType}/${entityBBID}/reviews`)
					.set('Content-Type', 'application/json')
					.send({
						accessToken: this.accessToken,
						review
					});

				if (response.ok) {
					result = response.body;
				}

				if (result?.reviewID) {
					this.setState({
						alert: {
							message: 'Your review was submitted to CritiqueBrainz!',
							title: 'Success',
							type: 'success'
						}
					});
					this.setState({
						reviewID: result?.reviewID
					});
					this.resetCBReviewForm();
					this.props.handleUpdateReviews();
				}
				else {
					this.setState({
						alert: {
							message: result?.message,
							title: 'Error submitting your review',
							type: 'danger'
						}
					});
				}
			}
			catch (error) {
				this.handleError(
					error,
					'Error while submitting review to CritiqueBrainz'
				);
			}
		}
		return null;
	};


	getModalBody = (hasPermissions: boolean) => {
		const {t: translate} = this.props;
		const {
			acceptLicense,
			alert,
			language,
			rating,
			reviewID,
			reviewValidateAlert,
			success,
			textContent
		} = this.state;

		if (!hasPermissions) {
			const connectWarning = translate('entityDisplay.cbReviewModal.beforeConnectWarning', {defaultValue: 'Before you can submit reviews to CritiqueBrainz, you must connect to your CritiqueBrainz account from BookBrainz.'});
			const connectInstructions = translate('entityDisplay.cbReviewModal.connectInstructions', {defaultValue: 'You can connect to your CritiqueBrainz account by visiting the external services page.'});
			const extServicesLinkText = translate('entityDisplay.cbReviewModal.externalServicesLink', {defaultValue: 'external services page.'});
			return (
				<div>
					{connectWarning.split('CritiqueBrainz')[0]}
					<a href={this.CBBaseUrl}>CritiqueBrainz</a>
					{connectWarning.split('CritiqueBrainz')[1]}
					{this.renderCBInfoButton(translate)}
					<br/>
					<br/>
					{connectInstructions.split(extServicesLinkText)[0]}
					<a href={`${window.location.origin}/external-service/`}>
						{extServicesLinkText}
					</a>
					{connectInstructions.split(extServicesLinkText)[1]}
				</div>
			);
		}

		if (success) {
			const thanksText = translate('entityDisplay.cbReviewModal.thanksForSubmitting', {
				defaultValue: `Thanks for submitting your review for ${this.props.entityName}!`,
				entityName: this.props.entityName
			});
			const accessText = translate('entityDisplay.cbReviewModal.accessReviewLink', {defaultValue: 'You can access your CritiqueBrainz review by clicking here.'});
			return (
				<div>
					{thanksText}
					<br/>
					<br/>
					{accessText.split('here')[0]}
					<a href={`${this.CBBaseUrl}/review/${reviewID}`}>
						here
					</a>
					{accessText.split('here')[1]}
				</div>
			);
		}

		return (
			<>
				{alert?.message && (
					<Alert variant={alert.type}>
						<Alert.Heading>{alert.title}</Alert.Heading>
						<p>{alert.message}</p>
					</Alert>
				)}

				{reviewValidateAlert && (
					<Alert variant="danger">
						<p>{reviewValidateAlert}</p>
					</Alert>
				)}

				{translate('entityDisplay.cbReviewModal.youAreReviewing', {defaultValue: 'You are reviewing'})}
				<b>
					{` ${this.props.entityName} (${this.props.entityType}) `}
				</b>
				for <a href={this.CBBaseUrl}>CritiqueBrainz</a>.{' '}

				{this.renderCBInfoButton(translate)}
				<div className="form-group">
					<textarea
						required
						className="form-control"
						id="review-text"
						name="review-text"
						placeholder={translate('entityDisplay.cbReviewModal.minTextLengthWarning', {
							defaultValue: `Review length must be at least ${this.minTextLength} characters.`,
							minTextLength: this.minTextLength
						})}
						rows={6}
						spellCheck="false"
						style={{resize: 'vertical'}}
						value={textContent}
						onChange={this.handleTextInputChange}
					/>
				</div>
				<small
					className={
						textContent.length < this.minTextLength ?
							'text-danger' :
							''
					}
					style={{display: 'block', textAlign: 'right'}}
				>
					{translate('entityDisplay.cbReviewModal.words', {defaultValue: 'Words'})}: {countWords(textContent)} / {translate('entityDisplay.cbReviewModal.characters', {defaultValue: 'Characters'})}:{' '}
					{textContent?.length}
				</small>
				<div className="rating-container">
					<b>{translate('entityDisplay.cbReviewModal.ratingLabel', {defaultValue: 'Rating (optional): '})}</b>
					<Rating
						transition
						className="rating-stars"
						size={20}
						value={rating}
						onClick={this.handleRatingsChange}
					/>
				</div>
				<div className="dropdown">
					<b>{translate('entityDisplay.cbReviewModal.languageLabel', {defaultValue: 'Language of your review: '})}</b>
					<select
						id="language-selector"
						name="language"
						value={language}
						onChange={this.handleInputChange}
					>
						{this.allLanguagesKeyValue.map((lang: any) => (
							<option key={lang[0]} value={lang[0]}>
								{lang[1]}
							</option>
						))}
					</select>
				</div>
				<div className="checkbox">
					<label>
						<input
							required
							checked={acceptLicense}
							id="acceptLicense"
							name="acceptLicense"
							type="checkbox"
							onChange={this.handleInputChange}
						/>
						<small>
							&nbsp; {translate('entityDisplay.cbReviewModal.licenseAgreement', {
								defaultValue: 'You acknowledge and agree that your contributed reviews to CritiqueBrainz are licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0) license. You agree to license your work under this license. You represent and warrant that you own or control all rights in and to the work, that nothing in the work infringes the rights of any third-party, and that you have the permission to use and to license the work under the selected Creative Commons license. Finally, you give the MetaBrainz Foundation permission to license this content for commercial use outside of Creative Commons licenses in order to support the operations of the organization.'
							})}
						</small>
					</label>
				</div>
			</>
		);
	};

	getModalFooter = (hasPermissions: boolean) => {
		const {t: translate} = this.props;
		const {success} = this.state;

		if (!hasPermissions) {
			return (
				<a
					className="btn btn-success"
					href={`${window.location.origin}/external-service/`}
					role="button"
				>
					{' '}
					{translate('entityDisplay.cbReviewModal.connectToCB', {defaultValue: 'Connect To CritiqueBrainz'})}{' '}
				</a>
			);
		}
		if (!success) {
			const {reviewValidateAlert} = this.state;

			return (
				<button
					className={`btn btn-success ${
						reviewValidateAlert ? 'disabled' : ''
					}`}
					id="submitReviewButton"
					type="submit"
				>
					{translate('entityDisplay.cbReviewModal.submitToCB', {defaultValue: 'Submit Review to CritiqueBrainz'})}
				</button>
			);
		}

		/* default: close modal button */
		return (
			<button
				className="btn btn-default"
				type="button"
				onClick={this.handleCloseModal}
			>
				{translate('common:button.close', {defaultValue: 'Close'})}
			</button>
		);
	};

	private accessToken = '';

	/* executes getAccessToken() only in a browser to avoid unnecessary server-side calls during component mounting */
	componentDidMount = async () => {
		if (typeof window !== 'undefined') {
			this.accessToken = await this.getAccessToken();
		}
	};

	render() {
		const hasPermissions = this.accessToken !== null;
		const modalBody = this.getModalBody(hasPermissions);
		const modalFooter = this.getModalFooter(hasPermissions);

		return (
			<Modal
				centered
				aria-labelledby="CBReviewModalLabel"
				id="CBReviewModal"
				show={this.props.showModal}
				onHide={this.handleCloseModal}
			>
				<form
					className="modal-content"
					onSubmit={this.handleSubmitToCB}
				>
					<Modal.Header
						closeButton
					>
						<h4
							className="modal-title"
							id="CBReviewModalLabel"
							style={{padding: 'auto'}}
						>
							<img
								alt="CritiqueBrainz Logo"
								className="cb-img-responsive"
								height="30"
								src="/images/critiquebrainz-logo.svg"
								style={{margin: '8px'}}
							/>
						</h4>
					</Modal.Header>
					<Modal.Body>{modalBody}</Modal.Body>
					<Modal.Footer>{modalFooter}</Modal.Footer>
				</form>
			</Modal>
		);
	}
}

export default withTranslation(['pages', 'common'])(CBReviewModal);
