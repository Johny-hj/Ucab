import { useState } from 'react';
import { FiStar, FiX } from 'react-icons/fi';

const RatingModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await onSubmit({ rating, review });
      setRating(0);
      setReview('');
      onClose();
    } catch (err) {
      console.error('Rating submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h3>Rate Your Ride</h3>
          <button onClick={onClose} className="btn btn-icon" style={{ color: 'var(--text-secondary)' }}>
            <FiX size={20} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>How was your experience?</p>
          <div className="star-rating" style={{ justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                style={{ cursor: 'pointer', fontSize: '2rem' }}
              >
                ★
              </span>
            ))}
          </div>
          <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent!'}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Write a review (optional)</label>
          <textarea
            className="form-input"
            placeholder="Share your experience..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
          />
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          style={{ opacity: rating === 0 ? 0.5 : 1 }}
        >
          {submitting ? <div className="spinner spinner-sm"></div> : 'Submit Rating'}
        </button>
      </div>
    </div>
  );
};

export default RatingModal;
