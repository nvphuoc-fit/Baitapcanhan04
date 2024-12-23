const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Mã hóa mật khẩu
// const User = require('../models/User'); // Import model User
const createError = require('http-errors'); // Dùng để chuẩn hóa lỗi

// Đăng nhập và trả về token
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra username có tồn tại trong database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
    }

    // Kiểm tra mật khẩu (nếu được mã hóa)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mật khẩu không đúng.' });
    }

    // Tạo JWT token
    const payload = { id: user.id, username: user.username };
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET chưa được cấu hình trong file .env');
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // (Tùy chọn) Tạo Refresh Token nếu cần
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      refreshToken, // Tùy chọn
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error.message);
    return res.status(500).json({ message: 'Đăng nhập thất bại. Vui lòng thử lại.' });
  }
};

// Làm mới token (Tùy chọn)
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Không tìm thấy Refresh Token.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newToken = jwt.sign({ id: decoded.id, username: decoded.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      token: newToken,
    });
  } catch (error) {
    console.error('Lỗi làm mới token:', error.message);
    return res.status(401).json({ message: 'Refresh Token không hợp lệ.' });
  }
};

module.exports = { login, refreshToken };
// Đăng ký tài khoản mới
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Tài khoản đã tồn tại.' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (error) {
    console.error('Lỗi đăng ký:', error.message);
    return res.status(500).json({ message: 'Đăng ký thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { login, refreshToken, register };