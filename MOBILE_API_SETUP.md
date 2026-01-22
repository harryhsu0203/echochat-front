# 手機端 API 設置指南

## 1. API 基礎設定

### API 端點
```
https://your-render-app.onrender.com
```

## 2. 設置實際 API

### 發送驗證碼
```
POST /api/forgot-password
```

### 重設密碼
```
POST /api/reset-password
```

---

## 3. 手機端整合範例

### React Native / JavaScript
```javascript
const API_BASE_URL = 'https://your-render-app.onrender.com';

// 發送驗證碼
const sendVerificationCode = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: '網路連接失敗' };
  }
};

// 重設密碼
const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, newPassword })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: '網路連接失敗' };
  }
};
```

### Flutter / Dart
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ForgotPasswordAPI {
  static const String baseUrl = 'https://your-render-app.onrender.com';

  // 發送驗證碼
  static Future<Map<String, dynamic>> sendVerificationCode(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email}),
      );
      return json.decode(response.body);
    } catch (e) {
      return {'success': false, 'error': '網路連接失敗'};
    }
  }

  // 重設密碼
  static Future<Map<String, dynamic>> resetPassword(
    String email, 
    String code, 
    String newPassword
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/reset-password'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'code': code,
          'newPassword': newPassword,
        }),
      );
      return json.decode(response.body);
    } catch (e) {
      return {'success': false, 'error': '網路連接失敗'};
    }
  }
}
```

### iOS Swift
```swift
import Foundation

class ForgotPasswordAPI {
    static let baseURL = "https://your-render-app.onrender.com"
    
    // 發送驗證碼
    static func sendVerificationCode(email: String, completion: @escaping (Result<[String: Any], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/api/forgot-password") else {
            completion(.failure(NSError(domain: "Invalid URL", code: -1, userInfo: nil)))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            if let data = data,
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                completion(.success(json))
            }
        }.resume()
    }
    
    // 重設密碼
    static func resetPassword(email: String, code: String, newPassword: String, completion: @escaping (Result<[String: Any], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/api/reset-password") else {
            completion(.failure(NSError(domain: "Invalid URL", code: -1, userInfo: nil)))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email, "code": code, "newPassword": newPassword]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            if let data = data,
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                completion(.success(json))
            }
        }.resume()
    }
}
```

### Android Kotlin
```kotlin
import okhttp3.*
import org.json.JSONObject
import java.io.IOException

class ForgotPasswordAPI {
    companion object {
        private const val BASE_URL = "https://your-render-app.onrender.com"
        private val client = OkHttpClient()
        
        // 發送驗證碼
        fun sendVerificationCode(email: String, callback: (Boolean, String) -> Unit) {
            val json = JSONObject().apply {
                put("email", email)
            }
            
            val request = Request.Builder()
                .url("$BASE_URL/api/forgot-password")
                .post(RequestBody.create(MediaType.parse("application/json"), json.toString()))
                .build()
            
            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    callback(false, "網路連接失敗")
                }
                
                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string()
                    val jsonResponse = JSONObject(responseBody ?: "{}")
                    
                    val success = jsonResponse.optBoolean("success", false)
                    val message = jsonResponse.optString("message", "未知錯誤")
                    
                    callback(success, message)
                }
            })
        }
        
        // 重設密碼
        fun resetPassword(email: String, code: String, newPassword: String, callback: (Boolean, String) -> Unit) {
            val json = JSONObject().apply {
                put("email", email)
                put("code", code)
                put("newPassword", newPassword)
            }
            
            val request = Request.Builder()
                .url("$BASE_URL/api/reset-password")
                .post(RequestBody.create(MediaType.parse("application/json"), json.toString()))
                .build()
            
            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    callback(false, "網路連接失敗")
                }
                
                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string()
                    val jsonResponse = JSONObject(responseBody ?: "{}")
                    
                    val success = jsonResponse.optBoolean("success", false)
                    val message = jsonResponse.optString("message", "未知錯誤")
                    
                    callback(success, message)
                }
            })
        }
    }
}
```

---

## 4. 請求格式

### 發送驗證碼請求
```json
{
  "email": "user@example.com"
}
```

### 重設密碼請求
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

---

## 5. 回應格式

### 成功回應
```json
{
  "success": true,
  "message": "操作成功訊息"
}
```

### 錯誤回應
```json
{
  "success": false,
  "error": "錯誤訊息"
}
```

---

## 6. 使用步驟

1. **替換 API 網址**：將 `https://your-render-app.onrender.com` 替換為您的實際 Render 網址
2. **複製程式碼**：選擇您使用的平台範例
3. **整合到專案**：將程式碼整合到您的手機端應用
4. **測試功能**：確保 API 連接正常

---

## 7. 注意事項

- 驗證碼有效期為 10 分鐘
- 密碼至少需要 6 個字符
- 所有請求都需要 `Content-Type: application/json` 標頭
- API 已設定 CORS 支援跨域請求 