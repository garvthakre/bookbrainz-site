import PropTypes from 'prop-types';
import {Rating} from 'react-simple-star-rating';
import React from 'react';
import {useTranslation} from 'react-i18next';


function AverageRating({averageRatings, reviewsCount}) {
	const {t: translate} = useTranslation('pages');
	return (
		<>
			<dt>{translate('entityDisplay.cbReviewModal.ratingLabel', {defaultValue: 'Ratings'})}</dt>
			<dd>
				<Rating
					allowHalfIcon
					readonly
					allowHover={false}
					className="rating-stars"
					fillColor="#46433A"
					initialValue={averageRatings}
					ratingValue={0}
					size={20}
					stars={5}
				/>
			</dd>
			<dd className="mt-n2 small text-muted">
				{reviewsCount ?
					translate('entityDisplay.cbReviews.reviewsCount', {count: reviewsCount}) :
					translate('entityDisplay.cbReviews.noReviews')
				}
			</dd>
		</>
	);
}

AverageRating.displayName = 'AverageRating';
AverageRating.propTypes = {
	averageRatings: PropTypes.number.isRequired,
	reviewsCount: PropTypes.number.isRequired
};

export default AverageRating;
