const router = require('express').Router();
const controller = require('../controllers/billController');
const { protect, allow } = require('../middleware/auth');

router.use(protect, allow('admin'));
router.get('/', controller.list);
router.post('/', controller.create);
router.patch('/:billNo/payment', controller.updatePayment);
router.delete('/:billNo', controller.remove);

module.exports = router;
