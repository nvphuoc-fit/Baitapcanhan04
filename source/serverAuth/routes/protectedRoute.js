const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware kiểm tra JWT
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token, truy cập bị từ chối.' });
    }

    const token = authHeader.split(' ')[1]; // Lấy token từ header
    if (!token) {
      return res.status(401).json({ message: 'Token không tồn tại.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Lỗi: JWT_SECRET chưa được cấu hình trong file .env');
      return res.status(500).json({ message: 'Cấu hình máy chủ không đầy đủ.' });
    }

    // Xác minh token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token không hợp lệ:', err.message);
        return res.status(403).json({ message: 'Token không hợp lệ.' });
      }

      req.user = user; // Lưu thông tin user đã xác thực vào req
      next();
    });
  } catch (error) {
    console.error('Lỗi khi xác thực token:', error.message);
    return res.status(500).json({ message: 'Xác thực thất bại. Vui lòng thử lại.' });
  }
};

// Route được bảo vệ
router.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'Chào mừng bạn đến với route được bảo vệ!',
    user: req.user, // Thông tin user đã xác thực
  });
});

module.exports = router;
// Thêm route để kiểm tra token
router.post('/check-token', verifyToken, (req, res) => {
  res.json({
    message: 'Token hợp lệ.',
    user: req.user, // Thông tin user đã xác thực
  });
});