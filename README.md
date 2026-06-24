# Radar PDF Kit

Công cụ chuyên nghiệp giúp chuyển đổi các tệp Markdown (.md) thành tài liệu thuyết trình (Slide Deck) hoặc tài liệu bán hàng (Sales Proposal) PDF với giao diện thiết kế hiện đại, cao cấp.

## Tính năng chính

- **Live Preview & Editor**: Trình biên tập Markdown song song với giao diện xem trước thời gian thực. Hỗ trợ thanh công cụ định dạng và phím tắt thông dụng (`Ctrl+B`, `Ctrl+I`, `Ctrl+S`).
- **Tải lên ảnh trực tiếp**: Hỗ trợ Kéo - Thả (Drag & Drop) ảnh trực tiếp vào khung soạn thảo hoặc chọn tệp qua nút bấm. Ảnh được lưu vào thư mục cục bộ của bạn.
- **Ghép tệp tổng hợp**: Ghép toàn bộ các tệp `.md` nhỏ lẻ theo thứ tự bảng chữ cái thành một tài liệu master duy nhất.
- **Mục lục tự động (Auto TOC)**:
  - Ở dạng slide: Tự động tạo Slide Mục lục/Chương trình (Agenda Slide) ở trang 2.
  - Ở dạng tài liệu: Tự động tạo bảng Mục lục chỉ mục (có đường dẫn chấm và số trang) ở trang đầu tiên dưới tiêu đề chính.
- **Trình chiếu trực tiếp (Presenter Mode)**: Chế độ toàn màn hình và dùng phím mũi tên điều hướng slide mượt mà trên trình duyệt.
- **7 Bộ Giao diện (Themes)**: Midnight Tech, Classic Ivory, Nordic Aurora, Vibrant Sunset, Corporate Navy, Emerald Executive, và Warm Minimalist.
- **CSS In ấn Chuẩn A4**: Đánh số trang tự động, tách trang bìa cho tài liệu, tự động chia cột cho danh sách dài trên slide để không bị tràn chữ.

---

## Yêu cầu hệ thống

Dự án yêu cầu cài đặt **Node.js** (Phiên bản v18 trở lên). Bạn có thể tải Node.js tại [https://nodejs.org/](https://nodejs.org/).

---

## Cấu trúc thư mục dự án

```
radar-pdf-kit/
├── public/                 # Mã nguồn Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js               # Mã nguồn Backend Node.js Express
├── package.json            # Cấu hình dependency dự án
├── run.bat                 # File script chạy tự động trên Windows
└── README.md               # Tài liệu hướng dẫn
```

Công cụ tự động kết nối và đọc/ghi các file Markdown tại: `C:\Users\gd\Downloads\Rardar\`
Hình ảnh tải lên sẽ được lưu trữ tại: `C:\Users\gd\Downloads\Rardar\images\`

---

## Hướng dẫn cài đặt & Chạy trên máy tính khác

### Cách nhanh nhất (Dành cho Windows)
1. Hãy chắc chắn máy tính mới đã cài đặt **Node.js**.
2. Giải nén thư mục `radar-pdf-kit` trên máy tính mới.
3. Kích đúp (Double-click) vào tệp **`run.bat`** ở thư mục gốc của dự án.
   - Script sẽ tự động kiểm tra môi trường, cài đặt thư viện (`npm install` nếu chạy lần đầu), khởi động máy chủ và tự động mở trình duyệt web tại địa chỉ `http://localhost:3000`.

### Cách thủ công (Dành cho macOS / Linux / Windows)
1. Mở Terminal / Command Prompt tại thư mục dự án.
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi động server:
   ```bash
   npm start
   ```
4. Truy cập trình duyệt tại địa chỉ: [http://localhost:3000](http://localhost:3000)

---

## Hướng dẫn in ra PDF

1. Trong giao diện ứng dụng, chọn Theme và bố cục (Slide hoặc Tài liệu) mong muốn.
2. Nhấn nút **Xuất bản PDF đẹp** (hoặc nhấn `Ctrl + P`).
3. Trong bảng in của trình duyệt:
   - **Đích đến (Destination)**: Chọn **Lưu dưới dạng PDF (Save as PDF)**.
   - **Khổ giấy (Paper size)**: Chọn **A4**.
   - **Bố cục (Layout)**:
     - Chọn **Ngang (Landscape)** nếu in Slide.
     - Chọn **Dọc (Portrait)** nếu in Tài Liệu.
   - **Cài đặt khác (More settings)**:
     - **Đồ họa nền (Background graphics)**: **Bắt buộc tích chọn (ON)** để giữ lại màu sắc và hình nền của theme.
     - **Đầu trang và chân trang (Headers and footers)**: **Tắt chọn (OFF)** để loại bỏ các thông tin ngày tháng và liên kết thừa của trình duyệt.
4. Bấm **Lưu (Save)**.
