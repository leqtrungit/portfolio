# Frontend Handoff — Blog Public API

**Swagger UI:** http://localhost:8080/swagger/index.html  
**Swagger JSON:** http://localhost:8080/swagger/doc.json  
**Base URL:** `http://localhost:8080/api/v1` (dev) — replace with production domain when deployed

---

## Overview

Đây là tài liệu cho FE build trang blog công khai (homepage, danh sách bài viết, trang chi tiết bài viết). Không cần auth. Chỉ có 2 public endpoint cần dùng.

---

## Conventions

### Response Envelope

Mọi response đều bọc trong envelope:

```json
// Success (single item)
{ "data": { ... } }

// Success (list with pagination)
{ "data": [ ... ], "meta": { ... } }

// Error
{ "error": "message" }
```

### Pagination

Tất cả list endpoint đều nhận query params:

| Param | Type | Default | Max |
|-------|------|---------|-----|
| `page` | integer | 1 | — |
| `limit` | integer | 20 | 100 |

Pagination meta trả về:

```json
{
  "page": 1,
  "limit": 20,
  "total": 42,
  "total_pages": 3
}
```

---

## Public Endpoints

### 1. List Published Posts

```
GET /posts
```

Lấy danh sách bài viết đã published. Dùng cho trang homepage / danh sách bài viết / trang tag.

**Query params:**

| Param | Type | Mô tả |
|-------|------|--------|
| `tag` | string | Filter theo tag slug (ví dụ: `go`, `linux`) |
| `page` | integer | Trang hiện tại |
| `limit` | integer | Số bài mỗi trang |

**Request examples:**

```
GET /posts
GET /posts?tag=go&page=1&limit=10
```

**Response 200:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Getting started with Go",
      "slug": "getting-started-with-go",
      "excerpt": "Tóm tắt ngắn về bài viết...",
      "featured_image_key": "media/2026/06/cover.jpg",
      "featured_image_alt": "Go gopher mascot",
      "status": "published",
      "tags": [
        { "id": "uuid", "name": "Go", "slug": "go" }
      ],
      "created_at": "2026-06-28T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "total_pages": 3
  }
}
```

---

### 2. Get Post by Slug

```
GET /posts/{slug}
```

Lấy nội dung đầy đủ của một bài viết. Dùng cho trang chi tiết bài viết.

**Path params:**

| Param | Type | Mô tả |
|-------|------|--------|
| `slug` | string | URL-friendly slug của bài viết |

**Request example:**

```
GET /posts/getting-started-with-go
```

**Response 200:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Getting started with Go",
    "slug": "getting-started-with-go",
    "excerpt": "Tóm tắt ngắn...",
    "featured_image_key": "media/2026/06/cover.jpg",
    "featured_image_alt": "Go gopher mascot",
    "status": "published",
    "tags": [
      { "id": "uuid", "name": "Go", "slug": "go" }
    ],
    "created_at": "2026-06-28T10:00:00Z",
    "content": "# Getting started\n\nMarkdown source...",
    "html": "<h1>Getting started</h1><p>Rendered HTML...</p>",
    "updated_at": "2026-06-28T12:00:00Z"
  }
}
```

**Response 404:**

```json
{ "error": "post not found" }
```

---

## Data Shapes

### PostSummary (trong list)

| Field | Type | Mô tả |
|-------|------|--------|
| `id` | string (UUID) | ID duy nhất |
| `title` | string | Tiêu đề bài viết |
| `slug` | string | URL slug — dùng để build link `/posts/{slug}` |
| `excerpt` | string | Tóm tắt ngắn (có thể rỗng) |
| `featured_image_key` | string | S3 key của ảnh đại diện (xem bên dưới) |
| `featured_image_alt` | string | Alt text cho ảnh |
| `status` | string | Luôn là `"published"` với public list |
| `tags` | Tag[] | Danh sách tags |
| `created_at` | string (ISO 8601) | Ngày đăng |

### PostDetail (trong get by slug)

Tất cả field của PostSummary, cộng thêm:

| Field | Type | Mô tả |
|-------|------|--------|
| `content` | string | Nội dung gốc dạng Markdown |
| `html` | string | Nội dung đã render sang HTML — **dùng cái này để hiển thị** |
| `updated_at` | string (ISO 8601) | Lần cập nhật cuối |

### Tag

| Field | Type | Mô tả |
|-------|------|--------|
| `id` | string (UUID) | ID |
| `name` | string | Tên hiển thị (ví dụ: `"Go"`) |
| `slug` | string | URL slug (ví dụ: `"go"`) — dùng để filter |

---

## Hiển thị ảnh (featured_image_key)

API trả về `featured_image_key` là raw S3 key, **không phải full URL**. FE cần tự build URL:

```
{MEDIA_BASE_URL}/{featured_image_key}
```

Trong dev (với RustFS local):

```
http://localhost:9000/blog-media/{featured_image_key}
```

> Hỏi backend về `MEDIA_BASE_URL` của môi trường production trước khi deploy.

---

## Render nội dung bài viết

Dùng field `html` — backend đã render Markdown sang HTML bằng goldmark. FE chỉ cần inject `innerHTML` (hoặc `dangerouslySetInnerHTML` nếu dùng React).

> Cần thêm CSS riêng cho HTML content (typography, code blocks, blockquote...) vì backend không gắn class.

---

## Xây dựng URL cho blog

| Trang | URL FE | API call |
|-------|--------|----------|
| Homepage / danh sách bài | `/` | `GET /posts?page=1` |
| Danh sách theo tag | `/tags/{tag-slug}` | `GET /posts?tag={slug}` |
| Chi tiết bài viết | `/posts/{slug}` | `GET /posts/{slug}` |

---

## Không có trong public API

Những thứ **FE không thể tự làm** với public endpoint — cần xem xét sau:

- **Search / tìm kiếm** — chưa có endpoint tìm kiếm full-text
- **Danh sách tất cả tags** — chưa có `GET /tags`; FE chỉ lấy được tags qua bài viết
- **Related posts** — chưa có
- **RSS feed** — chưa có
- **Pagination SEO** — cân nhắc `rel=prev/next` links

---

## Contact

Backend: lequoctrung.id.vn — Trung Le  
Repo: https://github.com/leqtrungit/blog-api
