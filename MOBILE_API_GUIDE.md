# Mobile API Guide

## Cấu trúc API đã được tách riêng:

### Web App (NextAuth)
- `/api/auth/login` - Login cho web app
- `/api/auth/register` - Register cho web app
- `/api/documents` - Documents cho web app
- `/api/links` - Links cho web app

### Mobile App (JWT)
- `/api/mobile/auth/login` - Login cho Flutter app
- `/api/mobile/auth/register` - Register cho Flutter app
- `/api/mobile/auth/verify` - Verify JWT token
- `/api/mobile/documents` - Documents cho Flutter app
- `/api/mobile/links` - Links cho Flutter app

## Cách sử dụng trong Flutter:

### 1. Cấu hình API
```dart
class ApiConfig {
  static const String baseUrl = 'http://localhost:3000/api/mobile';

  static Map<String, String> getHeaders({String? token}) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }
}
```

### 2. Login
```dart
final response = await http.post(
  Uri.parse('${ApiConfig.baseUrl}/auth/login'),
  headers: ApiConfig.getHeaders(),
  body: jsonEncode({
    'email': 'user@example.com',
    'password': 'password123',
  }),
);

final data = jsonDecode(response.body);
if (data['success']) {
  final token = data['data']['token'];
  // Lưu token và chuyển đến màn hình chính
}
```

### 3. Verify Token (Kiểm tra token còn hợp lệ không)
```dart
final response = await http.get(
  Uri.parse('${ApiConfig.baseUrl}/auth/verify'),
  headers: ApiConfig.getHeaders(token: token),
);

final data = jsonDecode(response.body);
if (data['success']) {
  // Token còn hợp lệ, lấy thông tin user mới nhất
  final user = data['data']['user'];
  final tokenInfo = data['data']['token'];

  // Có thể refresh token nếu cần
} else {
  // Token hết hạn hoặc không hợp lệ, chuyển về màn hình login
  // Xóa token khỏi local storage
}
```

### 4. Get Documents
```dart
final response = await http.get(
  Uri.parse('${ApiConfig.baseUrl}/documents'),
  headers: ApiConfig.getHeaders(token: token),
);

final data = jsonDecode(response.body);
if (data['success']) {
  final documents = data['data']['documents'];
  // Hiển thị documents
}
```

### 5. Create Document
```dart
final response = await http.post(
  Uri.parse('${ApiConfig.baseUrl}/documents'),
  headers: ApiConfig.getHeaders(token: token),
  body: jsonEncode({
    'title': 'My Document',
    'content': 'Document content',
    'type': 'text',
  }),
);

final data = jsonDecode(response.body);
if (data['success']) {
  // Document created successfully
}
```

## Response Format:
Tất cả API mobile đều trả về format thống nhất:

```json
{
  "success": true/false,
  "message": "Success/Error message",
  "data": {
    // Response data
  },
  "error": "Error details (if any)"
}
```

## Khi nào cần dùng API verify:

1. **App startup**: Kiểm tra token có hợp lệ không khi mở app
2. **Token refresh**: Lấy thông tin user mới nhất
3. **Auto-logout**: Tự động đăng xuất khi token hết hạn
4. **Session management**: Quản lý phiên đăng nhập

## Lợi ích của việc tách riêng:

1. **Bảo mật tốt hơn**: Mỗi loại app có cơ chế authentication phù hợp
2. **Dễ maintain**: Code rõ ràng, không phức tạp
3. **Performance tốt**: Không cần check cả 2 loại authentication
4. **Dễ debug**: Lỗi rõ ràng cho từng loại app
5. **Scalable**: Dễ dàng mở rộng thêm tính năng cho từng loại app
