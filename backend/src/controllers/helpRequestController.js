const HelpRequest = require('../models/HelpRequest');

function extractQuestion(body) {
  let q = body?.question;
  if (typeof q === 'string') return q.trim();
  if (q && typeof q === 'object') return (q.question || q.text || q.q || '').toString().trim();
  if (typeof body === 'string') return body.trim();
  return '';
}

exports.createHelpRequest = async (req, res) => {
  try {
    const body = req.body || {};
    const questionText = extractQuestion(body);
    const customerId = body.customerId || (body.question && body.question.customerId) || 'ui-caller';

    if (!questionText) {
      return res.status(400).json({ ok: false, message: 'Question is required and must be a string' });
    }

    const newRequest = await HelpRequest.create({
      question: questionText,
      customerId,
    });

    console.log('📨 Created HelpRequest ID:', newRequest._id);
    return res.json({ ok: true, helpRequest: newRequest });
  } catch (err) {
    console.error('Error creating help request:', err);
    return res.status(500).json({ ok: false, message: err.message || 'Internal Server Error' });
  }
};

// ✅ Updated: Get all help requests with optional status filtering
exports.getAllHelpRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status === 'pending') filter.status = 'PENDING';
    else if (status === 'unresolved') filter.status = 'UNRESOLVED';

    const requests = await HelpRequest.find(filter).sort({ createdAt: -1 });
    return res.json({ ok: true, requests });
  } catch (err) {
    console.error('Error fetching help requests:', err);
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};


