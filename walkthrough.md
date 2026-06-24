# Walkthrough - Markdown2PDF Kit (Tự động Co giãn Font chữ & Phân trang Mục lục)

Chúng tôi đã hoàn thành nâng cấp toàn diện hệ thống in ấn và trình chiếu của Markdown2PDF Kit. Các cải tiến mới nhất bao gồm tính năng tùy chỉnh cỡ chữ trực tiếp, cơ chế tự động co giãn font chữ vừa khít trang in (Auto-fit font size) và thuật toán tự động chia trang mục lục thông minh để tránh tuyệt đối hiện tượng tràn lề hay xô lệch chữ.

---

## Chi tiết các tính năng mới đã triển khai

### 1. Bảng điều chỉnh kích thước chữ (Font Size Selector)
*   **Vị trí**: Một bảng điều khiển **Kích thước chữ (Font Size)** mới đã được tích hợp trực tiếp trong cột sidebar bên trái.
*   **Chức năng**:
    *   **Thanh trượt cỡ chữ slide**: Cho phép tùy chỉnh cỡ chữ slide từ `12px` đến `22px` (mặc định `16px`).
    *   **Thanh trượt cỡ chữ tài liệu**: Cho phép tùy chỉnh cỡ chữ tài liệu từ `9pt` đến `15pt` (mặc định `11pt`).
*   **Kỹ thuật CSS tương đối (Scalable CSS)**: Toàn bộ kích cỡ font của các tiêu đề (`h1` -> `h3`), nội dung (`p`, `li`), bảng biểu (`table`) và khối mã nguồn (`pre`, `code`) đã được refactor trong [styles.css](file:///C:/Users/gd/.gemini/antigravity-ide/scratch/radar-pdf-kit/public/styles.css) để sử dụng đơn vị tương đối `em`. Khi bạn kéo thanh trượt, toàn bộ cấu trúc chữ của slide/tài liệu sẽ tự động thu nhỏ hoặc phóng to một cách đồng bộ và mượt mà.

### 2. Tự động co chữ vừa vặn với trang in (Auto-fit Font Size)
*   **Vấn đề**: Khi nội dung của một slide hoặc trang tài liệu quá dài, nó sẽ tràn ra ngoài mép dưới trang, gây xô lệch hoặc xuống dòng vô lý.
*   **Giải pháp**:
    *   Chúng tôi đã viết một thuật toán JavaScript thông minh trong [app.js](file:///C:/Users/gd/.gemini/antigravity-ide/scratch/radar-pdf-kit/public/app.js) để tự động phát hiện xem nội dung slide/trang có bị tràn hay không (overflow).
    *   Nếu nội dung bị tràn, hệ thống sẽ tự động thu nhỏ kích cỡ font chữ của riêng trang đó từng bước một cho đến khi toàn bộ nội dung nằm vừa vặn 100% bên trong khung trang (A4), không bao giờ có chữ nào bị lọt ra ngoài.
    *   **Đo đạc in ẩn (Measuring Mode)**: Khi in, hệ thống kích hoạt một chế độ đo ẩn (`measuring-mode`) để tính toán và tự động co chữ cho các slide in trong print viewport trước khi hộp thoại in xuất hiện, đảm bảo PDF in ra khớp 100% bản preview và không bị tràn lề.

### 3. Phân trang Mục lục thông minh chống tràn lề (Multi-page TOC / Agenda)
*   **Slide Thuyết Trình**: Giới hạn tối đa **10 đề mục** trên mỗi slide Mục lục. Khi danh sách slide quá dài (ví dụ: gộp nhiều file), Agenda Slide sẽ tự động chia làm nhiều slide mục lục liên tiếp (ví dụ: `Mục lục chương trình (1/3)`, `Mục lục chương trình (2/3)`,...) để các ô mục lục không bao giờ đè lên logo hay bị tràn mép dưới.
*   **Tài Liệu / Sale Kit**: Giới hạn tối đa **18 đề mục** trên mỗi trang Mục lục. Nếu vượt quá, trang Mục lục sẽ tự động ngắt trang, tạo trang TOC tiếp theo và tự động cập nhật số trang tương ứng một cách chính xác.

### 4. Chân trang và logo ổn định tuyệt đối
*   Logo `Markdown2PDF` và số trang ở chân slide được cấu hình `white-space: nowrap !important` và nâng cao `z-index: 10 !important`. Việc này đảm bảo logo luôn nằm trên một dòng duy nhất, không bao giờ bị cắt chữ (ví dụ: thành `down2PDF` như trước) hoặc bị nội dung khác đè lên.

---

## Hướng dẫn in ấn PDF & Trình chiếu Hoàn hảo

1.  **Khởi động**: Bật ứng dụng bằng file `run.bat` (Windows) hoặc `./run.sh` (Linux). Truy cập `http://localhost:3000/`.
2.  **Thiết lập**: Bật tùy chọn **"Ghép các file .md"** và **"Tự động tạo Mục lục"**.
3.  **Tùy chỉnh cỡ chữ**:
    *   Kéo thanh trượt cỡ chữ để đạt tỷ lệ hiển thị mong muốn.
    *   Giữ tích chọn **"Tự động co chữ vừa trang"** để hệ thống tự động tính toán co giãn cỡ chữ thông minh cho các slide dài.
4.  **Xuất PDF gốc**: Nhấp **"Xuất bản PDF đẹp"** (hoặc `Ctrl + P`).
    *   *Margins*: Chọn **None** (Không lề).
    *   *Background graphics*: Tích chọn **Có** (bắt buộc để in màu nền tràn viền).
    *   *Headers and footers*: Tích chọn **Không** (bắt buộc để ẩn thông tin ngày tháng, đường dẫn mặc định của Chrome).
